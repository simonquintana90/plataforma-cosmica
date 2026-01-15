import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const SubscriptionPage = ({ user, auth, getFunctions, httpsCallable, db, doc, updateDoc }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const wompiPublicKey = 'pub_prod_t98LASUQBr0VyCiCw3f4VWVkoBrBh4JX'; // Llave pública de PRODUCCIÓN

    // Estados
    const [isProcessing, setIsProcessing] = useState(false);
    const [acceptanceToken, setAcceptanceToken] = useState(null);
    const [loadingToken, setLoadingToken] = useState(true);
    const [tokenError, setTokenError] = useState(null);
    const [cardNumber, setCardNumber] = useState("");
    const [cvc, setCvc] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expDate, setExpDate] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState(null);
    const [planInterval, setPlanInterval] = useState('monthly');

    // Callback para validar cupón
    const handleValidateCoupon = useCallback(async (codeToValidate = couponCode) => {
        if (!codeToValidate) return;
        setValidatingCoupon(true);
        setCouponMessage(null);
        setAppliedCoupon(null);

        try {
            const functions = getFunctions();
            const validate = httpsCallable(functions, 'validateCoupon');
            const result = await validate({ couponCode: codeToValidate });

            if (result.data.valid) {
                setAppliedCoupon(result.data);
                setCouponMessage({ type: 'success', text: `¡Cupón ${result.data.code} aplicado!` });
                toast.success("Cupón aplicado correctamente");
            } else {
                setCouponMessage({ type: 'error', text: result.data.message || 'Cupón inválido' });
                toast.error(result.data.message || "Cupón inválido");
            }
        } catch (error) {
            console.error(error);
            setCouponMessage({ type: 'error', text: 'Error al validar cupón' });
        } finally {
            setValidatingCoupon(false);
        }
    }, [couponCode, getFunctions, httpsCallable]);

    // Effect: Leer cupón de URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const codeFromUrl = params.get('coupon');
        if (codeFromUrl && !appliedCoupon) {
            setCouponCode(codeFromUrl.toUpperCase());
        }
    }, [location.search, appliedCoupon]);

    // Effect: Auto-validar cupón
    useEffect(() => {
        if (couponCode && !appliedCoupon && !validatingCoupon && !couponMessage) {
            const timer = setTimeout(() => {
                handleValidateCoupon();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [couponCode, appliedCoupon, validatingCoupon, couponMessage, handleValidateCoupon]);

    // Effect: Obtener Token Wompi
    useEffect(() => {
        const fetchAcceptanceToken = async () => {
            setLoadingToken(true);
            setTokenError(null);
            try {
                const functions = getFunctions();
                const getWompiAcceptanceToken = httpsCallable(functions, 'getWompiAcceptanceToken');
                const result = await getWompiAcceptanceToken();

                if (result.data.acceptance_token) {
                    setAcceptanceToken(result.data.acceptance_token);
                } else {
                    throw new Error('No se recibió el token de aceptación.');
                }
            } catch (error) {
                console.error("Error al obtener token de aceptación:", error);
                setTokenError("No se pudo conectar con el sistema de pagos. Por favor recarga la página.");
                toast.error("Error al inicializar el formulario de pago.");
            } finally {
                setLoadingToken(false);
            }
        };
        fetchAcceptanceToken();
    }, [getFunctions, httpsCallable]);

    // Handlers
    const handleExpDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setExpDate(value);
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        setCardNumber(value);
    };

    const getPrice = () => {
        let price = planInterval === 'monthly' ? 89900 : 1000000;

        // Validar si el cupón aplica al plan seleccionado
        let isCouponValidForPlan = true;
        if (appliedCoupon && appliedCoupon.applicablePlan && appliedCoupon.applicablePlan !== 'all') {
            if (appliedCoupon.applicablePlan !== planInterval) {
                isCouponValidForPlan = false;
            }
        }

        if (appliedCoupon && isCouponValidForPlan) {
            if (appliedCoupon.type === 'percent') {
                price = price - Math.floor(price * (appliedCoupon.value / 100));
            } else if (appliedCoupon.type === 'amount') {
                price = price - appliedCoupon.value;
            }
        }
        if (price < 1500) price = 1500;
        return price;
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!acceptanceToken) {
            toast.error("Error de inicialización. Recarga la página.");
            return;
        }

        setIsProcessing(true);
        toast.loading('Procesando tu suscripción...');

        try {
            // 1. Tokenizar la tarjeta directamente con la API de Wompi
            const [expMonth, expYear] = expDate.split('/');
            if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
                throw new Error("Fecha de expiración inválida.");
            }

            const tokenizationData = {
                number: cardNumber,
                cvc: cvc,
                exp_month: expMonth,
                exp_year: expYear,
                card_holder: cardHolder
            };

            // URL de PRODUCCIÓN
            const response = await fetch(`https://production.wompi.co/v1/tokens/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${wompiPublicKey}`
                },
                body: JSON.stringify(tokenizationData)
            });

            const data = await response.json();

            if (response.status !== 200 && response.status !== 201) {
                console.error("Error Wompi Token:", data);
                throw new Error(data.error?.messages?.number?.[0] || "Error al verificar la tarjeta.");
            }

            const wompiToken = data.data.id;

            // 2. Crear la suscripción en el backend
            const functions = getFunctions();
            const createWompiSubscription = httpsCallable(functions, 'createWompiSubscription');

            const result = await createWompiSubscription({
                paymentToken: wompiToken,
                acceptanceToken: acceptanceToken,
                planInterval: planInterval,
                couponCode: appliedCoupon ? appliedCoupon.code : null
            });

            if (result.data.status === 'success') {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    initialPaymentStatus: "completed",
                    subscriptionStatus: "active",
                    subscriptionId: "manual_managed",
                    lastTransactionId: result.data.transactionId,
                    paymentSourceId: result.data.paymentSourceId,
                });

                toast.dismiss();
                toast.success('¡Suscripción activada! Bienvenido a Cósmica.');
                navigate('/formulario-web');
            } else {
                throw new Error(result.data.message || 'Error en la suscripción.');
            }

        } catch (error) {
            console.error("Error en el proceso de pago:", error);
            toast.dismiss();
            toast.error(`Error: ${error.message || 'No se pudo procesar el pago.'}`);
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center">
                    {/* Título actualizado sin el nombre */}
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">¡Bienvenido a Cósmica!</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-500">Último paso. Activa tu suscripción para que nuestro equipo comience a trabajar en tu sitio web.</p>
                </div>

                <form
                    className="max-w-md mx-auto mt-10"
                    onSubmit={handlePayment}
                >
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 relative">

                        {/* Mostramos 'cargando' mientras obtenemos el token de aceptación */}
                        {loadingToken && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
                                <p className="font-bold text-slate-600">Cargando formulario de pago...</p>
                            </div>
                        )}

                        {/* Mostramos error si falla el token */}
                        {tokenError && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 p-6 text-center">
                                <p className="font-bold text-red-600 mb-2">Error de conexión</p>
                                <p className="text-slate-600 text-sm mb-4">{tokenError}</p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold"
                                >
                                    Recargar Página
                                </button>
                            </div>
                        )}

                        {/* SELECCIÓN DE PLAN */}
                        <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
                            <button
                                type="button"
                                onClick={() => setPlanInterval('monthly')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${planInterval === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Mensual
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlanInterval('yearly')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${planInterval === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Anual
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200">Ahorra 7%</span>
                            </button>
                        </div>

                        <h3 className="font-heading text-xl font-bold text-slate-900 text-center">
                            {planInterval === 'monthly' ? 'Suscripción Mensual' : 'Suscripción Anual'}
                        </h3>
                        <div className="text-center mt-2 flex flex-col items-center justify-center h-20 transition-all duration-300">
                            {/* Usamos key para forzar re-render y animación simple si se deseara, aunque aquí es directo */}
                            <div className="flex flex-col items-center">
                                {appliedCoupon && (
                                    <span className="text-slate-400 line-through text-sm">
                                        {planInterval === 'monthly' ? '$89.900' : '$1.000.000'}
                                    </span>
                                )}
                                <p className="animate-fadeIn">
                                    <span className="text-4xl font-bold text-slate-800">
                                        ${getPrice().toLocaleString('es-CO')}
                                    </span>
                                    <span className="text-slate-500"> COP / {planInterval === 'monthly' ? 'mes' : 'año'}</span>
                                </p>
                                {planInterval === 'yearly' && !appliedCoupon && (
                                    <p className="text-xs text-green-600 font-medium mt-1">
                                        ¡Ahorras $78.800 al año!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* INPUT CUPÓN */}
                        <div className="mt-4 mb-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="Código de descuento"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={!!appliedCoupon}
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                            {appliedCoupon ? (
                                <button
                                    type="button"
                                    onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponMessage(null); }}
                                    className="bg-slate-200 text-slate-600 font-bold px-3 py-2 rounded-lg text-sm hover:bg-slate-300"
                                >
                                    Quit
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleValidateCoupon}
                                    disabled={!couponCode || validatingCoupon}
                                    className="bg-slate-800 text-white font-bold px-3 py-2 rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50"
                                >
                                    {validatingCoupon ? '...' : 'Aplicar'}
                                </button>
                            )}
                        </div>
                        {couponMessage && (
                            <p className={`text-xs text-center mb-4 ${couponMessage.type === 'success' ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                                {couponMessage.text}
                            </p>
                        )}
                        {appliedCoupon && appliedCoupon.applicablePlan && appliedCoupon.applicablePlan !== 'all' && appliedCoupon.applicablePlan !== planInterval && (
                            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                <p className="text-xs text-amber-700">
                                    <span className="font-bold">¡Atención!</span> El cupón <span className="font-bold">{appliedCoupon.code}</span> solo es válido para el plan <span className="font-bold uppercase">{appliedCoupon.applicablePlan === 'monthly' ? 'Mensual' : 'Anual'}</span>.
                                    <br />Cambia de plan para aplicar el descuento.
                                </p>
                            </div>
                        )}


                        <div className="mt-6 text-center bg-blue-50/50 border-l-4 border-blue-300 p-3">
                            <p className="text-sm text-blue-800">
                                Tu plan incluye <strong className="font-bold">cambios ilimitados</strong>, <strong className="font-bold">hosting</strong> y <strong className="font-bold">soporte prioritario</strong>.
                            </p>
                        </div>

                        {/* 8. Campos del widget de Wompi */}
                        <div className="mt-8 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Número de tarjeta</label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Fecha de exp.</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={expDate}
                                        onChange={handleExpDateChange}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">CVC</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Nombre del titular</label>
                                <input
                                    type="text"
                                    placeholder="Nombre como aparece en la tarjeta"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isProcessing || loadingToken || !acceptanceToken}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Procesando...' :
                                    loadingToken ? 'Inicializando...' :
                                        !acceptanceToken ? 'Error de conexión' :
                                            !acceptanceToken ? 'Error de conexión' :
                                                `Pagar $${getPrice().toLocaleString('es-CO')} COP Ahora`}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 text-center mt-4">Pagos seguros procesados por Wompi.</p>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SubscriptionPage;

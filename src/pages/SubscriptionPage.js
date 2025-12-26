import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SubscriptionPage = ({ user, auth, getFunctions, httpsCallable, db, doc, updateDoc }) => {
    // useWompiScript(); // YA NO SE USA
    const [isProcessing, setIsProcessing] = useState(false);
    const [acceptanceToken, setAcceptanceToken] = useState(null); // <-- AÑADIDO
    const [loadingToken, setLoadingToken] = useState(true); // <-- AÑADIDO
    const [tokenError, setTokenError] = useState(null); // <-- AÑADIDO: Estado de error

    // Estados para los inputs controlados
    const [cardNumber, setCardNumber] = useState("");
    const [cvc, setCvc] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expDate, setExpDate] = useState(""); // <-- AÑADIDO: Estado para fecha

    const navigate = useNavigate();
    const wompiPublicKey = 'pub_prod_t98LASUQBr0VyCiCw3f4VWVkoBrBh4JX'; // Tu llave pública

    // --- Obtener el Token de Aceptación al cargar ---
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

    // Formateo de fecha MM/YY
    const handleExpDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Solo números
        if (value.length > 4) value = value.slice(0, 4); // Max 4 dígitos

        if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setExpDate(value);
    };

    // Formateo de tarjeta (espacios cada 4 dígitos)
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        // Agregar espacios visualmente es opcional, pero para enviar a la API debe ir limpio.
        // Aquí guardamos el valor limpio o formateado según prefieras. 
        // Para simplificar, guardamos limpio y mostramos limpio (o podrías usar una librería de máscaras).
        setCardNumber(value);
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
                acceptanceToken: acceptanceToken
            });

            if (result.data.status === 'success') {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    initialPaymentStatus: "completed",
                    subscriptionStatus: "active",
                    subscriptionId: result.data.subscriptionId,
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
                    <p className="mt-4 max-w-2xl mx-auto text-slate-500">Último paso. Activa tu suscripción mensual para que nuestro equipo comience a trabajar en tu sitio web.</p>
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

                        <h3 className="font-heading text-xl font-bold text-slate-900 text-center">
                            Suscripción Mensual
                        </h3>
                        <p className="text-slate-500 mt-2 text-center">
                            <span className="text-3xl font-bold text-slate-800">$89.900</span>
                            <span className="text-slate-500"> COP / mes</span>
                        </p>

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
                                            'Pagar $89.900 COP Ahora'}
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

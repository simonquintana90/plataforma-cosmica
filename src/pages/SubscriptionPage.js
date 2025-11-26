import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useWompiScript from '../hooks/useWompiScript';

const SubscriptionPage = ({ user, auth, getFunctions, httpsCallable, db, doc, updateDoc }) => {
    useWompiScript(); // Carga el script de Wompi
    const [isProcessing, setIsProcessing] = useState(false);
    const [acceptanceToken, setAcceptanceToken] = useState(null); // <-- AÑADIDO
    const [loadingToken, setLoadingToken] = useState(true); // <-- AÑADIDO
    const navigate = useNavigate();

    // --- (NUEVO) Obtener el Token de Aceptación al cargar ---
    useEffect(() => {
        const fetchAcceptanceToken = async () => {
            setLoadingToken(true);
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
                toast.error("Error al inicializar el formulario de pago.");
            } finally {
                setLoadingToken(false);
            }
        };
        fetchAcceptanceToken();
    }, [getFunctions, httpsCallable]);

    // 1. Esta función es llamada por el FORMULARIO de Wompi
    const handleWompiResponse = async (event) => {
        event.preventDefault();
        setIsProcessing(true);
        toast.loading('Procesando tu suscripción...');

        const wompiToken = event.detail.token; // Token de la tarjeta

        try {
            const functions = getFunctions();
            const createWompiSubscription = httpsCallable(functions, 'createWompiSubscription');

            // 2. Enviamos AMBOS tokens al backend
            const result = await createWompiSubscription({
                paymentToken: wompiToken,
                acceptanceToken: acceptanceToken
            });

            if (result.data.status === 'success') {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    initialPaymentStatus: "completed",
                    subscriptionStatus: "active", // <-- CAMBIO A "active"
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
            console.error("Error al crear la suscripción:", error);
            toast.dismiss();
            toast.error(`Error: ${error.message || 'No se pudo procesar el pago.'}`);
            setIsProcessing(false);
        }
    };

    // 5. Añadimos el listener para el evento del formulario de Wompi
    useEffect(() => {
        if (!acceptanceToken) return; // No hacer nada si no hay token

        const wompiForm = document.getElementById('wompi-form');
        wompiForm.addEventListener('wompi:token', handleWompiResponse);
        return () => {
            wompiForm.removeEventListener('wompi:token', handleWompiResponse);
        };
    }, [acceptanceToken]); // <-- Se activa cuando el token de aceptación está listo

    // 6. DEBES PONER TU LLAVE PÚBLICA DE WOMPI AQUÍ
    const wompiPublicKey = 'pub_prod_t98LASUQBr0VyCiCw3f4VWVkoBrBh4JX';

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
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">¡Bienvenido a Cósmica, {user.displayName || user.email}!</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-500">Último paso. Activa tu suscripción mensual para que nuestro equipo comience a trabajar en tu sitio web.</p>
                </div>

                {/* 7. Formulario de Wompi */}
                <form className="max-w-md mx-auto mt-10" id="wompi-form">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">

                        {/* Mostramos 'cargando' mientras obtenemos el token de aceptación */}
                        {loadingToken && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                                <p className="font-bold text-slate-600">Cargando formulario de pago...</p>
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
                            <div className="wompi-form-field">
                                <label className="block text-sm font-medium text-slate-600 mb-2">Número de tarjeta</label>
                                <input type="text" data-wompi="card-number" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="wompi-form-field">
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Fecha de exp.</label>
                                    <input type="text" data-wompi="card-exp" placeholder="MM/YY" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                                <div className="wompi-form-field">
                                    <label className="block text-sm font-medium text-slate-600 mb-2">CVC</label>
                                    <input type="text" data-wompi="card-cvc" placeholder="123" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                            </div>
                            <div className="wompi-form-field">
                                <label className="block text-sm font-medium text-slate-600 mb-2">Nombre del titular</label>
                                <input type="text" data-wompi="card-holder" placeholder="Nombre como aparece en la tarjeta" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isProcessing || loadingToken} // <-- Deshabilitado si está procesando O cargando
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                data-wompi-key={wompiPublicKey}
                                data-wompi-currency="COP"
                            >
                                {isProcessing ? 'Procesando...' : 'Pagar $89.900 COP Ahora'}
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

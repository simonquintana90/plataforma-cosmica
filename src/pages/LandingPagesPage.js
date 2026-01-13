import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LandingPagesPage = ({ user, db, doc, updateDoc, onSnapshot, getFunctions, httpsCallable }) => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSubscription(data.landingPageSubscription || null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, user.uid, doc, onSnapshot]);

    const handlePurchase = async (interval) => {
        setProcessing(true);
        toast.loading("Procesando suscripción adicional...");

        const functions = getFunctions();
        const createLandingPageSubscription = httpsCallable(functions, 'createLandingPageSubscription');

        try {
            const result = await createLandingPageSubscription({ planInterval: interval });
            if (result.data.status === 'success') {
                toast.dismiss();
                toast.success("¡Landing Page activada con éxito!");
            } else {
                throw new Error(result.data.message || "Error desconocido");
            }
        } catch (error) {
            console.error("Error purchasing landing page:", error);
            toast.dismiss();
            toast.error(error.message || "No se pudo procesar el pago.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <DashboardLayout><div className="flex justify-center p-10">Cargando...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold text-slate-900">Landing Pages Adicionales</h1>
                <p className="text-slate-500 mt-1">Expande tu presencia online con páginas dedicadas para servicios o ubicaciones específicas.</p>
            </div>

            {/* Explanation Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl text-white p-8 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <h2 className="text-2xl font-heading font-bold mb-4">¿Para qué sirve una Landing Page?</h2>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-start gap-3">
                                <span className="mt-1 bg-blue-500/20 p-1 rounded">📍</span>
                                <div>
                                    <strong className="text-white block">Promocionar una nueva ubicación</strong>
                                    Si abres una nueva sede, una landing page específica ayuda a posicionar esa ubicación en Google.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 bg-purple-500/20 p-1 rounded">🚀</span>
                                <div>
                                    <strong className="text-white block">Destacar un servicio específico</strong>
                                    Ideal para campañas de publicidad (Ads) donde necesitas que el usuario llegue directo a la oferta, sin distracciones.
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 max-w-sm w-full">
                        <div className="text-cente mb-4">
                            <span className="text-4xl">🎯</span>
                        </div>
                        <p className="text-sm text-center text-slate-200">
                            "Las Landing Pages aumentan las conversiones al enfocar la atención del usuario en una sola acción clave."
                        </p>
                    </div>
                </div>
            </div>

            {/* Status or Pricing */}
            {subscription && subscription.status === 'active' ? (
                // CHECK IF DETAILS PROVIDED
                subscription.detailsProvided ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">¡Todo listo!</h3>
                        <p className="text-green-700 max-w-lg mx-auto">
                            Hemos recibido la información para tu Landing Page. Nuestro equipo comenzará a trabajar en ella. Te notificaremos cuando esté lista.
                        </p>
                        <p className="text-sm text-green-600 mt-4 font-bold">
                            Suscripción: {subscription.interval === 'monthly' ? 'Mensual' : 'Anual'}
                        </p>

                        <div className="mt-6 border-t border-green-200 pt-4">
                            <button
                                onClick={async () => {
                                    if (window.confirm("¿Estás seguro de que deseas cancelar esta suscripción adicional? Se detendrá el cobro automático.")) {
                                        toast.loading("Cancelando...");
                                        try {
                                            const cancelFunc = httpsCallable(getFunctions(), 'cancelLandingPageSubscription');
                                            await cancelFunc();
                                            toast.dismiss();
                                            toast.success("Suscripción cancelada.");
                                        } catch (e) {
                                            toast.dismiss();
                                            toast.error("Error al cancelar.");
                                            console.error(e);
                                        }
                                    }
                                }}
                                className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                            >
                                Cancelar Landing Page Adicional
                            </button>
                        </div>
                    </div>
                ) : (
                    // SHOW INFORMATION FORM
                    <LandingPageForm user={user} db={db} doc={doc} updateDoc={updateDoc} subscription={subscription} />
                )
            ) : (subscription && subscription.status === 'cancelled' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Suscripción Cancelada</h3>
                    <p className="text-slate-500">
                        Tu suscripción adicional ha sido cancelada y no se te volverá a cobrar.
                    </p>
                    <p className="text-xs text-slate-400 mt-4">
                        Si cambias de opinión, puedes volver a contratarla más adelante.
                    </p>
                    <button
                        onClick={() => {
                            // Reset state artificially or wait for manual re-purchase flow triggers
                            // Ideally, we just show the pricing cards again? 
                            // Currently the logic says: if active? show details. ELSE show pricing.
                            // BUT wait, "cancelled" is NOT "active".
                            // So if I set status to 'cancelled', the first condition `subscription.status === 'active'` fails.
                            // IMPT: The code falls through to the "ELSE" block (Pricing Cards).
                            // This block `subscription && subscription.status === 'cancelled'` needs to be placed BEFORE the pricing cards fallback, OR check it explicitly.
                            // Currently my code structure:
                            // { active ? ( details ? A : B ) : ( subscription.status === 'cancelled' ? C : D ) }
                        }}
                        className="hidden"
                    ></button>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Selecciona tu plan adicional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monthly Plan */}
                        <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-slate-700">Plan Mensual</h4>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-3xl font-bold text-slate-900">$20.000</span>
                                    <span className="ml-1 text-slate-500">/ mes</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-4">Pago recurrente mes a mes.</p>
                            </div>
                            <button
                                onClick={() => handlePurchase('monthly')}
                                disabled={processing}
                                className="mt-8 w-full bg-slate-100 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Procesando...' : 'Agregar Mensual'}
                            </button>
                        </motion.div>

                        {/* Yearly Plan */}
                        <motion.div whileHover={{ y: -4 }} className="bg-white border-2 border-blue-500 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">MEJOR PRECIO</div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-700">Plan Anual</h4>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-3xl font-bold text-slate-900">$200.000</span>
                                    <span className="ml-1 text-slate-500">/ año</span>
                                </div>
                                <p className="text-sm text-green-600 mt-2 font-medium">¡Ahorras 2 meses ($40.000)!</p>
                            </div>
                            <button
                                onClick={() => handlePurchase('yearly')}
                                disabled={processing}
                                className="mt-8 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/30"
                            >
                                {processing ? 'Procesando...' : 'Agregar Anual'}
                            </button>
                        </motion.div>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-6">
                        El cobro se realizará automáticamente a tu tarjeta guardada. Puedes cancelar en cualquier momento.
                    </p>
                </div>
            ))}
        </DashboardLayout>
    );
};

// Subcomponent for the Form to keep things clean
const LandingPageForm = ({ user, db, doc, updateDoc }) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [goal, setGoal] = useState('Ubicación');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        toast.loading("Enviando información...");

        let uploadResult = null;

        // Upload file if exists
        if (file) {
            // NOTE: We're reusing the cloud function logic or simple logic here?
            // Since we can't easily import upload logic here without prop drilling 'getFunctions' etc.
            // Let's assume we use the same uploadFile HTTP function we used in DashboardPage.
            try {
                const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadFile';
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${functionUrl}?userId=${user.uid}`, { method: 'POST', body: formData });
                if (!response.ok) throw new Error("Error upload");
                uploadResult = await response.json();
            } catch (err) {
                console.error(err);
                toast.error("Error al subir imagen (opcional). Continuando...");
            }
        }

        try {
            await updateDoc(doc(db, "users", user.uid), {
                landingPageDetails: {
                    title,
                    goal,
                    description,
                    submittedAt: new Date(),
                    ...(uploadResult && { fileUrl: uploadResult.fileURL, fileName: uploadResult.fileName })
                },
                "landingPageSubscription.detailsProvided": true
            });
            toast.dismiss();
            toast.success("¡Información enviada con éxito!");
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Error al guardar la información.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <div className="mb-6 text-center">
                <span className="text-3xl">📝</span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">Personaliza tu Landing Page</h2>
                <p className="text-slate-500 text-sm">Cuéntanos para qué quieres usar esta página adicional.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">¿Cuál es el objetivo principal?</label>
                    <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    >
                        <option value="Ubicación">Promocionar una Nueva Ubicación</option>
                        <option value="Servicio">Destacar un Servicio Específico</option>
                        <option value="Evento">Promocionar un Evento</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Título de la Página</label>
                    <input
                        type="text"
                        required
                        placeholder="Ej: Sede Norte, Ortodoncia Invisible..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción e Instrucciones</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Describe qué textos, ofertas o información clave debe llevar esta página."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Imagen de referencia o contenido (Opcional)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        {file ? (
                            <p className="text-blue-600 font-medium truncate">{file.name}</p>
                        ) : (
                            <p className="text-slate-500 text-sm">Clic para subir imagen (JPG, PNG)</p>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Enviar Información'}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">Nuestro equipo revisará esto y te contactará si hay dudas.</p>
                </div>
            </form>
        </div>
    );
};

export default LandingPagesPage;

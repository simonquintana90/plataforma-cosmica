import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';

const ConnectionsPage = ({ user, db, addDoc, collection, serverTimestamp }) => {
    const [analyticsId, setAnalyticsId] = useState('');
    const [consoleCode, setConsoleCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!analyticsId && !consoleCode) {
            toast.error("Por favor ingresa al menos un código.");
            return;
        }

        setLoading(true);
        toast.loading("Enviando códigos...");

        try {
            await addDoc(collection(db, "requests"), {
                title: "Nueva Conexión de Servicios",
                description: `Solicitud de conexión de servicios.\n\nGoogle Analytics ID: ${analyticsId || 'N/A'}\nSearch Console Code: ${consoleCode || 'N/A'}`,
                type: 'Connection',
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                createdAt: serverTimestamp(),
                status: 'pending',
                userHasUnreadMessages: false
            });

            toast.dismiss();
            toast.success("Solicitud enviada correctamente.");
            setRequestSent(true);
            setAnalyticsId('');
            setConsoleCode('');

            // Reset success message after 5 seconds
            setTimeout(() => setRequestSent(false), 5000);

        } catch (error) {
            console.error("Error sending connection request:", error);
            toast.dismiss();
            toast.error("Error al enviar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="font-heading text-3xl font-bold text-slate-900">Conexiones</h1>
                    <p className="mt-2 text-slate-500">Conecta tu sitio web con las herramientas de Google para medir tu tráfico y visibilidad.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* INSTRUCTIONS COLUMN */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-8 w-8">
                                    <path fill="#FFC107" d="M44 24H24v20h20V24z" />
                                    <path fill="#FFA000" d="M38 24v20h-8V24h8z" />
                                    <path fill="#FFC107" d="M22 14H2v30h20V14z" />
                                    <path fill="#FFA000" d="M16 14v30H8V14h8z" />
                                </svg>
                                <h3 className="font-bold text-slate-900 text-lg">Google Analytics 4</h3>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                Google Analytics te permite conocer cuántas personas visitan tu sitio, de dónde vienen y qué hacen en él. Es esencial para tomar decisiones de marketing.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">¿Cómo obtener tu ID?</p>
                                <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 marker:font-bold marker:text-slate-400">
                                    <li>Crea una cuenta en <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">analytics.google.com</a>.</li>
                                    <li>Configura una nueva <strong>Propiedad</strong> para tu web.</li>
                                    <li>Ve a <strong>Flujos de datos</strong> y selecciona tu web.</li>
                                    <li>Copia el <strong>"ID DE MEDICIÓN"</strong> que empieza por <code className="bg-white border border-slate-200 px-1 py-0.5 rounded text-xs font-mono">G-XXXXXXX</code>.</li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-8 w-8">
                                    <path fill="#4285F4" d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 6c3.31 0 6 2.69 6 6 0 3.32-2.69 6-6 6s-6-2.68-6-6c0-3.31 2.69-6 6-6zm0 28.4c-5.01 0-9.41-2.56-12-6.44.05-3.97 8.01-6.16 12-6.16s11.94 2.19 12 6.16c-2.59 3.88-6.99 6.44-12 6.44z" />
                                    <path fill="none" d="M24 4v40" />
                                </svg>
                                <h3 className="font-bold text-slate-900 text-lg">Google Search Console</h3>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                Esta herramienta te ayuda a supervisar y mantener la presencia de tu sitio en los resultados de Búsqueda de Google.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">¿Cómo obtener tu código?</p>
                                <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 marker:font-bold marker:text-slate-400">
                                    <li>Entra a <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Search Console</a>.</li>
                                    <li>Añade tu propiedad usando el método <strong>"Prefijo de la URL"</strong>.</li>
                                    <li>En métodos de verificación, elige <strong>"Etiqueta HTML"</strong>.</li>
                                    <li>Copia <strong>toda la etiqueta</strong> que aparece (ej: <code>&lt;meta name="google..." /&gt;</code>).</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* FORM COLUMN */}
                    <div>
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm sticky top-24">
                            <div className="p-6 md:p-8">
                                <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">Ingresar Códigos</h2>
                                <p className="text-sm text-slate-500 mb-6">Pega aquí los códigos y nosotros realizaremos la configuración técnica por ti.</p>

                                {requestSent ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-green-50 border border-green-100 rounded-xl p-6 text-center"
                                    >
                                        <div className="bg-green-100 p-3 rounded-full inline-flex mb-3">
                                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-green-900">¡Información Recibida!</h3>
                                        <p className="text-sm text-green-700 mt-1">Hemos recibido tus códigos. Procederemos a integrarlos en tu sitio web a la brevedad.</p>
                                        <button
                                            onClick={() => setRequestSent(false)}
                                            className="mt-4 text-xs font-bold text-green-700 underline hover:text-green-900"
                                        >
                                            Enviar otros códigos
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label htmlFor="analytics" className="block text-sm font-bold text-slate-700 mb-2">
                                                ID de Medición (Analytics)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-slate-400 font-mono text-sm">G-</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    id="analytics"
                                                    value={analyticsId}
                                                    onChange={(e) => setAnalyticsId(e.target.value)}
                                                    placeholder="XXXXXXX"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-slate-600"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1.5 align-right">Ej: G-A1B2C3D4</p>
                                        </div>

                                        <div>
                                            <label htmlFor="console" className="block text-sm font-bold text-slate-700 mb-2">
                                                Etiqueta HTML (Search Console)
                                            </label>
                                            <textarea
                                                id="console"
                                                value={consoleCode}
                                                onChange={(e) => setConsoleCode(e.target.value)}
                                                rows="4"
                                                placeholder='<meta name="google-site-verification" content="..." />'
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-xs text-slate-600 leading-relaxed"
                                            ></textarea>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full inline-flex justify-center items-center gap-2 py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Enviando...' : 'Guardar Conexiones'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ConnectionsPage;

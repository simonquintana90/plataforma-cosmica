import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LandingPagesPage = ({ user, db, doc, updateDoc, collection, onSnapshot, getFunctions, httpsCallable }) => {
    const [landingPages, setLandingPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Fetch Subcollection "landingPages"
        const colRef = collection(db, "users", user.uid, "landingPages");
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by createdAt desc
            pages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setLandingPages(pages);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, user.uid, collection, onSnapshot]);

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

            {/* List of Your Landing Pages */}
            {landingPages.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Tus Landing Pages Activas</h3>
                    <div className="space-y-8">
                        {landingPages.map(page => (
                            <LandingPageItem
                                key={page.id}
                                page={page}
                                user={user}
                                db={db}
                                doc={doc}
                                updateDoc={updateDoc}
                                getFunctions={getFunctions}
                                httpsCallable={httpsCallable}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Pricing / Add New Section */}
            <div className="max-w-4xl mx-auto pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
                    {landingPages.length > 0 ? "Añadir otra Landing Page" : "Selecciona tu plan adicional"}
                </h3>
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
        </DashboardLayout>
    );
};

// Component for Individual Landing Page Item
const LandingPageItem = ({ page, user, db, doc, updateDoc, getFunctions, httpsCallable }) => {

    // Status Logic
    if (page.status === 'cancelled') {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 opacity-75">
                <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-500 text-xl">🚫</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-700">Landing Page Cancelada</h4>
                    <p className="text-sm text-slate-500">
                        {page.details?.title ? `"${page.details.title}"` : 'Sin configurar'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Cancelado el {page.cancelledAt?.seconds ? new Date(page.cancelledAt.seconds * 1000).toLocaleDateString() : 'Fecha desconocida'}</p>
                </div>
            </div>
        );
    }

    if (page.status === 'active') {
        // If details provided, show status card
        if (page.detailsProvided) {
            return (
                <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Activa</span>
                            <span className="text-slate-400 text-xs">Plan {page.interval === 'monthly' ? 'Mensual' : 'Anual'}</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">{page.details?.title || 'Landing Page sin título'}</h4>
                        <p className="text-slate-600 mt-1 text-sm">{page.details?.goal || 'Objetivo no definido'}</p>

                        <p className="text-green-600 text-sm mt-4">
                            <span className="mr-2">✅</span> Hemos recibido tu información y estamos trabajando en ello.
                        </p>
                    </div>

                    <div className="flex flex-col justify-center items-end border-l border-slate-100 pl-6">
                        <button
                            onClick={async () => {
                                if (window.confirm("¿Seguro que deseas cancelar esta Landing Page? Se detendrá el cobro de esta página específica.")) {
                                    toast.loading("Cancelando...");
                                    try {
                                        const cancelFunc = httpsCallable(getFunctions(), 'cancelLandingPageSubscription');
                                        await cancelFunc({ landingPageId: page.id });
                                        toast.dismiss();
                                        toast.success("Cancelada correctamente.");
                                    } catch (e) {
                                        toast.dismiss();
                                        toast.error("Error al cancelar.");
                                        console.error(e);
                                    }
                                }
                            }}
                            className="text-xs text-red-400 hover:text-red-600 underline font-medium mt-auto"
                        >
                            Cancelar Suscripción
                        </button>
                    </div>
                </div>
            );
        } else {
            // If details NOT provided, show the FORM for THIS page
            return (
                <div className="bg-white border border-blue-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                        <span className="text-blue-800 font-bold">⚠️ Configuración Pendiente</span>
                        <span className="text-xs text-blue-600">ID: {page.id.slice(0, 8)}...</span>
                    </div>
                    <LandingPageForm
                        user={user}
                        db={db}
                        doc={doc} // Careful: this doc is root doc function?
                        // UpdateDoc needs to target SUBCOLLECTION document
                        updateDoc={updateDoc}
                        pageId={page.id} // Pass the ID
                    />
                </div>
            );
        }
    }

    return null; // Unknown status
};

// Subcomponent for the Form
const LandingPageForm = ({ user, db, doc, updateDoc, pageId }) => {
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

        // Upload logic (same as before)
        if (file) {
            try {
                const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadFile';
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${functionUrl}?userId=${user.uid}`, { method: 'POST', body: formData });
                if (!response.ok) throw new Error("Error upload");
                uploadResult = await response.json();
            } catch (err) {
                console.error(err);
                toast.error("Error al subir imagen. Continuando...");
            }
        }

        try {
            // Update the SPECIFIC landing page document in subcollection
            await updateDoc(doc(db, "users", user.uid, "landingPages", pageId), {
                details: { // Using 'details' instead of 'landingPageDetails' for cleaner map
                    title,
                    goal,
                    description,
                    submittedAt: new Date(),
                    ...(uploadResult && { fileUrl: uploadResult.fileURL, fileName: uploadResult.fileName })
                },
                detailsProvided: true
            });
            toast.dismiss();
            toast.success("¡Información enviada!");
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Error al guardar.");
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Personaliza tu Landing Page</h2>
                <p className="text-slate-500 text-sm">Completa la información para activar esta página.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">¿Cuál es el objetivo?</label>
                    <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3">
                        <option value="Ubicación">Nueva Ubicación</option>
                        <option value="Servicio">Servicio Específico</option>
                        <option value="Evento">Evento</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Título</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3" placeholder="Ej: Sede Norte" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                    <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3" placeholder="Detalles de la página..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Imagen (Opcional)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        {file ? (
                            <p className="text-blue-600 font-medium truncate">{file.name}</p>
                        ) : (
                            <p className="text-slate-500 text-sm">Clic para subir imagen</p>
                        )}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Guardar y Activar'}
                </button>
            </form>
        </div>
    );
};

export default LandingPagesPage;

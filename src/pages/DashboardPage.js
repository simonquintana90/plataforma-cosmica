import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatusBadge } from '../components/Badges';
import Skeleton from '../components/Skeleton';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

const DashboardPage = ({ user, auth, db, addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot, doc }) => {
    const [changeRequestSent, setChangeRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [subscription, setSubscription] = useState({ status: 'loading' });

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const activeRequestsCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);
    const completedRequestsCount = useMemo(() => requests.filter(r => r.status === 'completed').length, [requests]);

    useEffect(() => {
        const userSubRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userSubRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().subscriptionStatus) {
                setSubscription({ status: docSnap.data().subscriptionStatus });
            } else {
                setSubscription({ status: 'inactive' });
            }
        });
        return () => unsubscribe();
    }, [db, doc, onSnapshot, user.uid]);

    useEffect(() => {
        const q = query(collection(db, "requests"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const requestsData = [];
            querySnapshot.forEach((doc) => {
                requestsData.push({ id: doc.id, ...doc.data() });
            });
            setRequests(requestsData);
            setLoadingRequests(false);
        });
        return () => unsubscribe();
    }, [db, collection, query, where, orderBy, onSnapshot, user.uid]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { 'change-title': title, 'change-type': type, 'change-description': description } = e.target.elements;
        let uploadResponse = {};

        if (file) {
            toast.loading('Subiendo archivo...');
            const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadFile';
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${functionUrl}?userId=${user.uid}`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) { throw new Error('La subida del archivo falló.'); }
                uploadResponse = await response.json();
            } catch (error) {
                console.error("Error al llamar a la Cloud Function:", error);
                toast.dismiss();
                toast.error("Error al subir el archivo.");
                setLoading(false);
                return;
            }
        }

        toast.dismiss();
        toast.loading('Enviando solicitud...');

        try {
            const requestData = {
                title: title.value,
                type: type.value,
                description: description.value,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                createdAt: serverTimestamp(),
                status: 'pending',
                ...(uploadResponse.fileURL && { fileURL: uploadResponse.fileURL, fileName: uploadResponse.fileName })
            };

            await addDoc(collection(db, "requests"), requestData);

            toast.dismiss();
            setChangeRequestSent(true);
            setTimeout(() => setChangeRequestSent(false), 5000);
            e.target.reset();
            setFile(null);
        } catch (error) {
            toast.dismiss();
            toast.error('Error al enviar la solicitud.');
            console.error('Error al enviar la solicitud: ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    if (subscription.status === 'loading') {
        return <div className="flex justify-center items-center min-h-screen">Verificando suscripción...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <div className="flex items-center gap-4">
                        {user.uid === ADMIN_UID && (
                            <Link to="/admin" className="text-sm font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors">
                                Panel de Admin
                            </Link>
                        )}
                        <Link to="/cuenta" className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Mi Cuenta</Link>
                        <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-10">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Hola, {user.displayName || user.email} 👋</h1>
                    <p className="mt-2 text-slate-500">Bienvenido a tu centro de control.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5">
                        <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
                            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Solicitudes Activas</p>
                            <p className="text-2xl font-bold text-slate-900">{activeRequestsCount}</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5">
                        <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Completadas</p>
                            <p className="text-2xl font-bold text-slate-900">{completedRequestsCount}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="p-6 md:p-8">{changeRequestSent ? (<div className="flex flex-col items-center justify-center text-center h-96"><div className="bg-green-100 p-4 rounded-full mb-4"><svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><h2 className="text-2xl font-heading font-bold text-slate-900">¡Solicitud Enviada!</h2><p className="mt-2 text-slate-500 max-w-sm">Hemos recibido tu solicitud y nos pondremos en marcha pronto. Te notificaremos cualquier novedad.</p></div>) : (<> <h2 className="text-xl font-heading font-bold text-slate-900 mb-1">Nueva Solicitud de Cambio</h2> <p className="text-sm text-slate-500 mb-6">Describe el cambio que necesitas para tu página web de la forma más detallada posible.</p>
                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                <div><label htmlFor="change-title" className="block text-sm font-medium text-slate-600 mb-2">Título del Cambio</label><input type="text" id="change-title" name="change-title" required placeholder="Ej: Cambiar número de teléfono" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" /></div>
                                <div><label htmlFor="change-type" className="block text-sm font-medium text-slate-600 mb-2">Tipo de Cambio</label><select id="change-type" name="change-type" required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"><option>Cambio de Texto</option><option>Añadir/Cambiar Imagen</option><option>Corregir Error Visual</option><option>Nueva Funcionalidad</option><option>Otro</option></select></div>
                                <div><label htmlFor="change-description" className="block text-sm font-medium text-slate-600 mb-2">Descripción Detallada</label><textarea id="change-description" name="change-description" rows="5" required placeholder="Por favor, sé lo más específico posible. Si aplica, menciona en qué página se debe realizar el cambio." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"></textarea></div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Adjuntar archivo (Opcional)</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="bg-slate-100 text-slate-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            Seleccionar Archivo
                                        </button>
                                        {file && <span className="text-sm text-slate-500">{file.name}</span>}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={loading} className="inline-flex justify-center py-2.5 px-6 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? 'Enviando...' : 'Enviar Solicitud'}</button>
                                </div>
                            </form></>)}</div>
                    </div>
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-heading font-bold text-slate-900">Mis Solicitudes</h3>
                        <ul className="mt-4 space-y-2">
                            {loadingRequests ? (
                                <>
                                    <li className="p-3"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></li>
                                    <li className="p-3"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></li>
                                    <li className="p-3"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></li>
                                </>
                            ) : requests.length === 0 ? (<p className="text-sm text-slate-500">Aún no has enviado solicitudes.</p>) : (requests.map(req => (<li key={req.id}><Link to={`/solicitud/${req.id}`} className="block p-3 rounded-lg hover:bg-slate-100 transition-colors"><div className="flex justify-between items-center"><p className="font-bold text-slate-700 truncate">{req.title}</p><StatusBadge status={req.status} /></div></Link></li>)))}</ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;

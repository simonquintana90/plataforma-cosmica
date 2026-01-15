import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatusBadge } from '../components/Badges';
import Skeleton from '../components/Skeleton';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

const DashboardPage = ({ user, auth, db, addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot, doc }) => {
    const [changeRequestSent, setChangeRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [subscription, setSubscription] = useState({ status: 'loading' });
    const [visitCount, setVisitCount] = useState(0);
    const [clickCount, setClickCount] = useState(0);

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [monthlyStats, setMonthlyStats] = useState({ current: { visits: 0, clicks: 0 }, previous: { visits: 0, clicks: 0 } });
    const [loadingStats, setLoadingStats] = useState(true);

    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

    const activeRequestsCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);
    const completedRequestsCount = useMemo(() => requests.filter(r => r.status === 'completed').length, [requests]);

    const activeRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
    const historyRequests = useMemo(() => requests.filter(r => r.status === 'completed'), [requests]);

    // Helpers for Month Keys
    const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const getPreviousMonth = (date) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() - 1);
        return d;
    };

    // Helper to format Month Name
    const formatMonth = (date) => {
        return new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date);
    };

    // Calculate percentage change
    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    // Effect: Fetch Subscription & Global Stats
    useEffect(() => {
        const userSubRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userSubRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSubscription({ status: data.subscriptionStatus || 'inactive' });
                // Restore global counters if needed, though we are focusing on monthly now.
                // But the user said "counters stopped working", implying they might care about totals OR 
                // just that the new ones were 0. Let's set them just in case specific logic uses them.
                setVisitCount(data.visitCount || 0);
                setClickCount(data.clickCount || 0);
            } else {
                setSubscription({ status: 'inactive' });
                setVisitCount(0);
                setClickCount(0);
            }
        });
        return () => unsubscribe();
    }, [db, doc, onSnapshot, user.uid]);

    // OK, let's restart the state strategy:
    const [currentMonthData, setCurrentMonthData] = useState({ visitCount: 0, clickCount: 0 });
    const [previousMonthData, setPreviousMonthData] = useState({ visitCount: 0, clickCount: 0 });

    useEffect(() => {
        const currentKey = getMonthKey(selectedMonth);
        const userDocRef = doc(db, "users", user.uid);

        const unsub = onSnapshot(doc(userDocRef, "analytics_monthly", currentKey), (s) => {
            setCurrentMonthData(s.exists() ? s.data() : { visitCount: 0, clickCount: 0 });
        }, (error) => {
            console.error("Error fetching current month analytics:", error);
            // Optionally set error state or defaults
        });
        return () => unsub();
    }, [db, doc, user.uid, selectedMonth]);

    useEffect(() => {
        const previousKey = getMonthKey(getPreviousMonth(selectedMonth));
        const userDocRef = doc(db, "users", user.uid);

        const unsub = onSnapshot(doc(userDocRef, "analytics_monthly", previousKey), (s) => {
            setPreviousMonthData(s.exists() ? s.data() : { visitCount: 0, clickCount: 0 });
        }, (error) => {
            console.error("Error fetching previous month analytics:", error);
        });
        return () => unsub();
    }, [db, doc, user.uid, selectedMonth]);

    // Calculate Derived
    const visitsChange = calculateChange(currentMonthData.visitCount || 0, previousMonthData.visitCount || 0);
    const clicksChange = calculateChange(currentMonthData.clickCount || 0, previousMonthData.clickCount || 0);

    // ... requests effect ...
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

        const { 'change-title': title, 'change-description': description } = e.target.elements;
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
                type: 'General', // Default type since field is removed
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
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Bienvenido de nuevo, {user.displayName || 'Usuario'}</p>
            </div>

            {/* STATUS HERO SECTION */}
            <div className="mb-10">
                {user.siteReady ? (
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#101010] to-[#1a1a1a] rounded-2xl shadow-xl shadow-slate-200 text-white p-8 md:p-10">
                        {/* Abstract background blobs for premium feel */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">¡Tu sitio está activo! 🚀</h2>
                                <p className="text-slate-400 max-w-xl">
                                    Tu plataforma está funcionando correctamente. Aquí tienes el resumen de tu actividad reciente.
                                </p>
                            </div>
                            <div>
                                <a href="https://wa.me/573000000000" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold backdrop-blur-sm transition-all flex items-center gap-2">
                                    <span>💬</span> Soporte
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-orange-100 p-4 rounded-full">
                            <span className="text-3xl">🚧</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-orange-800 mb-2">Sitio en Construcción</h2>
                            <p className="text-orange-700">Estamos preparando todo para tu lanzamiento. Te notificaremos cuando esté listo.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* METRICS SECTION (Merged) */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Métricas</h2>

                {/* Month Selector */}
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setSelectedMonth(getPreviousMonth(selectedMonth))}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm font-bold text-slate-700 px-3 min-w-[140px] text-center capitalize">
                        {formatMonth(selectedMonth)}
                    </span>
                    <button
                        onClick={() => {
                            const next = new Date(selectedMonth);
                            next.setMonth(next.getMonth() + 1);
                            setSelectedMonth(next);
                        }}
                        disabled={getMonthKey(selectedMonth) === getMonthKey(new Date())}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Visits Card (Monthly) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Visitas</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold text-slate-900">
                            {currentMonthData.visitCount || 0}
                        </div>
                    </div>
                    <div className={`mt-3 text-xs font-bold w-fit px-2 py-1 rounded-full flex items-center gap-1 ${visitsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span>{visitsChange >= 0 ? '↗' : '↘'}</span>
                        {Math.abs(visitsChange).toFixed(1)}% vs mes anterior
                    </div>
                </div>

                {/* Clicks Card (Monthly) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Clics</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold text-slate-900">
                            {currentMonthData.clickCount || 0}
                        </div>
                    </div>
                    <div className={`mt-3 text-xs font-bold w-fit px-2 py-1 rounded-full flex items-center gap-1 ${clicksChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span>{clicksChange >= 0 ? '↗' : '↘'}</span>
                        {Math.abs(clicksChange).toFixed(1)}% vs mes anterior
                    </div>
                </div>

                {/* Conversion Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Conversión</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-900">
                        {((currentMonthData.clickCount || 0) / (currentMonthData.visitCount || 1) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-400 mt-3">De visitas a clics este mes.</p>
                </div>

                {/* Status/Requests Summary Card - Replacing the redundant Totals */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Estado Plan</h3>
                    <div className="mt-1">
                        <StatusBadge status={subscription.status} />
                    </div>
                    {subscription.status === 'active' &&
                        <p className="text-xs text-slate-400 mt-3">Renovación automática activa</p>
                    }
                </div>
            </div>

            {/* LOWER CONTENT GRID (Requests) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Active Requests */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Solicitudes Activas</h3>
                            <div className="text-4xl font-bold text-slate-900 mt-2">{activeRequestsCount}</div>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-xl">
                            <span className="text-orange-600 text-xl">⏱️</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min((activeRequestsCount / 5) * 100, 100)}%` }}></div>
                    </div>
                </div>

                {/* Completed Requests */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Completadas</h3>
                            <div className="text-4xl font-bold text-slate-900 mt-2">{completedRequestsCount}</div>
                        </div>
                        <div className="bg-green-100 p-3 rounded-xl">
                            <span className="text-green-600 text-xl">✓</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* REQUEST FORM - MAIN COLUMN */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-1">
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-slate-900">Nueva Solicitud</h2>
                                    <p className="text-sm text-slate-500 mt-1">Envía cambios o correcciones para tu web.</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                </div>
                            </div>

                            {changeRequestSent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center text-center py-12 bg-green-50/50 rounded-xl border border-green-100"
                                >
                                    <div className="bg-green-100 p-4 rounded-full mb-4 shadow-sm">
                                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-heading font-bold text-slate-900">¡Solicitud Enviada!</h2>
                                    <p className="mt-2 text-slate-500 max-w-sm">El equipo ha sido notificado. Te avisaremos cuando iniciemos.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleRequestSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="change-title" className="block text-sm font-bold text-slate-700 mb-2">Título del Cambio</label>
                                        <input
                                            type="text"
                                            id="change-title"
                                            name="change-title"
                                            required
                                            placeholder="Ej: Actualizar precios sección servicios"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="change-description" className="block text-sm font-bold text-slate-700 mb-2">Descripción Detallada</label>
                                        <textarea
                                            id="change-description"
                                            name="change-description"
                                            rows="5"
                                            required
                                            placeholder="Describe con detalle qué necesitas cambiar. Si es un cambio de texto, proporciona el texto nuevo exacto."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Adjuntar archivo (Opcional)</label>
                                        <div
                                            className="group relative border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-6 transition-all cursor-pointer text-center"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            {file ? (
                                                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {file.name}
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">Has clic para subir una imagen o archivo</p>
                                                    <p className="text-xs text-slate-400">PNG, JPG, PDF (Max 10MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center items-center gap-2 py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Enviando...
                                                </>
                                            ) : 'Enviar Solicitud'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR COLUMN - STATUS & HISTORY */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-heading font-bold text-slate-900">Historial de Cambios</h3>
                        </div>
                        <div className="flex border-b border-slate-100 p-1 mx-4 mt-4 bg-slate-100 rounded-lg">
                            <button onClick={() => setActiveTab('active')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>En Proceso</button>
                            <button onClick={() => setActiveTab('history')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Completados</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <ul className="space-y-3">
                                {loadingRequests ? (
                                    <>
                                        <li className="p-4 bg-slate-50 rounded-xl"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></li>
                                        <li className="p-4 bg-slate-50 rounded-xl"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></li>
                                    </>
                                ) : (activeTab === 'active' ? activeRequests : historyRequests).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                                        <div className="bg-slate-50 p-3 rounded-full mb-3">
                                            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                        </div>
                                        <p className="text-sm text-slate-500">No tienes solicitudes {activeTab === 'active' ? 'en proceso' : 'completadas'}.</p>
                                    </div>
                                ) : (
                                    (activeTab === 'active' ? activeRequests : historyRequests).map((req, index) => (
                                        <motion.li
                                            key={req.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link to={`/solicitud/${req.id}`} className="block p-4 bg-white border border-slate-100 hover:border-slate-300 rounded-xl hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {req.userHasUnreadMessages && <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-100"></span>}
                                                        <StatusBadge status={req.status} className="scale-90 origin-left" />
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">{req.title}</p>
                                            </Link>
                                        </motion.li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout >
    );
};


export default DashboardPage;

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatusBadge, UserStatusBadge } from '../components/Badges';
import Skeleton from '../components/Skeleton';

const AdminDashboardPage = ({ user, auth, db, collection, query, where, orderBy, onSnapshot, doc, updateDoc, setDoc, deleteDoc, getFunctions, httpsCallable }) => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingCoupons, setLoadingCoupons] = useState(true);
    const [approvingUserId, setApprovingUserId] = useState(null);
    const [completingRequestId, setCompletingRequestId] = useState(null);

    // Formulario Nuevo Cupón
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        type: 'percent', // percent | amount
        value: 0,
        active: true
    });

    const pendingUsersCount = useMemo(() => users.filter(u => u.status === 'pending_approval').length, [users]);
    const pendingRequestsCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);

    useEffect(() => {
        setLoadingRequests(true);
        const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            setRequests(data);
            setLoadingRequests(false);
        });
        return () => unsubscribe();
    }, [db, collection, query, orderBy, onSnapshot]);

    useEffect(() => {
        setLoadingUsers(true);
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            setUsers(data);
            setLoadingUsers(false);
        });
        return () => unsubscribe();
    }, [db, collection, query, onSnapshot, orderBy]);


    // Fetch Coupons
    useEffect(() => {
        if (activeTab === 'coupons') {
            setLoadingCoupons(true);
            const q = query(collection(db, "coupons"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = [];
                querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
                setCoupons(data);
                setLoadingCoupons(false);
            });
            return () => unsubscribe();
        }
    }, [db, collection, query, onSnapshot, activeTab]);

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.value) return toast.error("Completa el formulario");

        try {
            await setDoc(doc(db, "coupons", newCoupon.code.toUpperCase()), {
                ...newCoupon,
                code: newCoupon.code.toUpperCase(),
                createdAt: new Date()
            });
            toast.success("Cupón creado");
            setNewCoupon({ code: '', type: 'percent', value: 0, active: true, applicablePlan: 'all', duration: 'once' });
        } catch (error) {
            console.error(error);
            toast.error("Error al crear cupón");
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        if (!window.confirm("¿Seguro de eliminar este cupón?")) return;
        try {
            await deleteDoc(doc(db, "coupons", couponId));
            toast.success("Cupón eliminado");
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar");
        }
    };

    const handleToggleCoupon = async (couponId, currentStatus) => {
        try {
            await updateDoc(doc(db, "coupons", couponId), { active: !currentStatus });
            toast.success("Estado actualizado");
        } catch (error) {
            toast.error("Error al actualizar");
        }
    };

    const handleMarkAsComplete = async (requestId) => {
        setCompletingRequestId(requestId);
        const requestRef = doc(db, "requests", requestId);
        try {
            await updateDoc(requestRef, { status: "completed" });
            toast.success("Solicitud completada");
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            toast.error("Error al completar la solicitud");
        } finally {
            setCompletingRequestId(null);
        }
    };

    const handleApproveUser = async (e, userId) => {
        e.stopPropagation();
        e.preventDefault();
        setApprovingUserId(userId);
        const userRef = doc(db, "users", userId);
        try {
            await updateDoc(userRef, { status: "approved" });
            toast.success('Usuario aprobado con éxito');
        } catch (error) {
            console.error("Error al aprobar usuario:", error);
            toast.error('Hubo un error al aprobar el usuario.');
        } finally {
            setApprovingUserId(null);
        }
    };

    // Estado para el modal de notificación
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, userId: null, userName: '' });
    const [notificationData, setNotificationData] = useState({ provisionalUrl: '', dnsARecord: '', dnsCnameRecord: '' });

    const handleNotifyUser = async (userId) => {
        setNotificationModal({ isOpen: false, userId: null, userName: '' }); // Cerrar modal
        const notifyUserSiteReady = httpsCallable(getFunctions(), 'notifyUserSiteReady');

        // Construir el string de instrucciones
        let dnsInstructions = '';
        if (notificationData.dnsARecord) {
            dnsInstructions += `Type: A\nName: @\nValue: ${notificationData.dnsARecord}\n\n`;
        }
        if (notificationData.dnsCnameRecord) {
            dnsInstructions += `Type: CNAME\nName: www\nValue: ${notificationData.dnsCnameRecord}`;
        }

        toast.promise(
            notifyUserSiteReady({
                userId: userId,
                provisionalUrl: notificationData.provisionalUrl,
                dnsInstructions: dnsInstructions.trim()
            }),
            {
                loading: 'Enviando notificación...',
                success: '¡Notificación enviada!',
                error: 'Error al enviar notificación'
            }
        );

        // Limpiar datos
        setNotificationData({ provisionalUrl: '', dnsARecord: '', dnsCnameRecord: '' });
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = requests.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-bold text-blue-600 hover:underline">← Ver como Cliente</Link>
                        <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Panel de Administrador</h1>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64"
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* --- (INICIO) CAMBIOS EN EL PANEL DE ADMIN --- */}
                <div className="mb-8 p-4 bg-slate-100 border border-slate-200 rounded-xl">
                    <h3 className="font-bold text-slate-700 text-sm mb-3">Herramientas de Vista Previa</h3>
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* 1. Ruta de pago inicial actualizada a "suscribirse" */}
                        <Link to="/?view=suscribirse" className="text-xs font-bold bg-white text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200/50 border border-slate-200 transition-colors">Ver Página de Suscripción</Link>
                        <Link to="/?view=website_form" className="text-xs font-bold bg-white text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200/50 border border-slate-200 transition-colors">Ver Formulario Web</Link>
                        <Link to="/admin/templates" className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 border border-indigo-600 transition-colors">Ver Librería de Plantillas (LEGOs)</Link>
                        {/* 2. Botón de "Subscription Wall" eliminado */}
                    </div>
                </div>
                {/* --- (FIN) CAMBIOS EN EL PANEL DE ADMIN --- */}

                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('requests')} className={`px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'requests' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Solicitudes ({pendingRequestsCount})</button>
                        <button onClick={() => setActiveTab('users')} className={`relative px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'users' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                            Todos los Usuarios ({filteredUsers.length})
                            {pendingUsersCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px]">{pendingUsersCount}</span></span>}
                        </button>
                        <button onClick={() => setActiveTab('coupons')} className={`px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'coupons' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Cupones</button>
                    </nav>
                </div>

                {activeTab === 'requests' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-slate-200">
                            {loadingRequests && (
                                <li className="p-6">
                                    <div className="flex justify-between">
                                        <div className="w-2/3">
                                            <Skeleton className="h-4 w-1/4 mb-2" />
                                            <Skeleton className="h-6 w-1/2 mb-2" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                        <div className="w-1/4">
                                            <Skeleton className="h-6 w-full mb-2" />
                                            <Skeleton className="h-4 w-1/2 ml-auto" />
                                        </div>
                                    </div>
                                </li>
                            )}
                            {!loadingRequests && filteredRequests.length === 0 && <li className="p-6 text-center text-slate-500">No hay solicitudes que coincidan con tu búsqueda.</li>}
                            {filteredRequests.map((req) => (
                                <li key={req.id}>
                                    <Link to={`/solicitud/${req.id}`} className="block p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {req.adminHasUnreadMessages && <span className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" title="Nuevos mensajes"></span>}
                                                    <p className="text-sm font-bold text-blue-600">{req.userName || 'Usuario sin nombre'}</p>
                                                </div>
                                                <p className="text-lg font-bold text-slate-800 truncate">{req.title}</p>
                                                <p className="text-sm text-slate-500 mt-1 truncate">{req.description}</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                                <div className="text-right">
                                                    <StatusBadge status={req.status} />
                                                    <p className="text-xs text-slate-400 mt-1">{req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString('es-CO') : 'Fecha no disp.'}</p>
                                                </div>
                                                {req.status === 'pending' && (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); handleMarkAsComplete(req.id); }}
                                                        disabled={completingRequestId === req.id}
                                                        className="bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-wait"
                                                    >
                                                        {completingRequestId === req.id ? 'Completando...' : 'Completar'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-slate-200">
                            {loadingUsers && <li className="p-6 text-center text-slate-500">Cargando usuarios...</li>}
                            {!loadingUsers && filteredUsers.length === 0 && <li className="p-6 text-center text-slate-500">No hay usuarios que coincidan con tu búsqueda.</li>}
                            {filteredUsers.map(u => (
                                <li key={u.id}>
                                    <Link to={`/admin/user/${u.id}`} className="block p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="font-bold text-slate-800">{u.displayName}</p>
                                                <p className="text-sm text-slate-500">{u.email}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <UserStatusBadge status={u.status} />
                                                    {u.status === 'approved' && <StatusBadge status={u.initialPaymentStatus} />}
                                                    {/* 3. Lógica actualizada para leer 'subscriptionStatus' */}
                                                    {u.subscriptionStatus && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.subscriptionStatus === 'active' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'}`}>{u.subscriptionStatus}</span>}
                                                </div>
                                            </div>
                                            {u.status === 'pending_approval' && (
                                                <button
                                                    onClick={(e) => handleApproveUser(e, u.id)}
                                                    disabled={approvingUserId === u.id}
                                                    className="bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                                >
                                                    {approvingUserId === u.id ? 'Aprobando...' : 'Aprobar'}
                                                </button>
                                            )}

                                            {/* BOTÓN PARA NOTIFICAR WEB LISTA */}
                                            {u.status === 'approved' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setNotificationModal({ isOpen: true, userId: u.id, userName: u.displayName });
                                                    }}
                                                    className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Notificar Web Lista 🚀
                                                </button>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'coupons' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Formulario */}
                        <div className="md:col-span-1">
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                                <h3 className="font-heading font-bold text-lg mb-4">Crear Nuevo Cupón</h3>
                                <form onSubmit={handleCreateCoupon} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código</label>
                                        <input
                                            type="text"
                                            placeholder="EJ: VERANO2025"
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 uppercase font-bold text-slate-800"
                                            value={newCoupon.code}
                                            onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                                            <select
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                                value={newCoupon.type}
                                                onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                            >
                                                <option value="percent">Porcentaje (%)</option>
                                                <option value="amount">Valor Fijo ($)</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor</label>
                                            <input
                                                type="number"
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                                value={newCoupon.value}
                                                onChange={e => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aplicable a</label>
                                            <select
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                                value={newCoupon.applicablePlan || 'all'}
                                                onChange={e => setNewCoupon({ ...newCoupon, applicablePlan: e.target.value })}
                                            >
                                                <option value="all">Todos los Planes</option>
                                                <option value="monthly">Solo Mensual</option>
                                                <option value="yearly">Solo Anual</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración</label>
                                            <select
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                                value={newCoupon.duration || 'once'}
                                                onChange={e => setNewCoupon({ ...newCoupon, duration: e.target.value })}
                                            >
                                                <option value="once">Una sola vez</option>
                                                <option value="forever">De por vida</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-black transition-colors">
                                        Crear Cupón
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Lista */}
                        <div className="md:col-span-2 space-y-4">
                            {loadingCoupons ? <p>Cargando...</p> : coupons.map(coupon => (
                                <div key={coupon.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-heading font-bold text-xl text-slate-800">{coupon.code}</h4>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {coupon.active ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm">
                                            Descuento: <strong>{coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`}</strong>
                                            {coupon.applicablePlan && coupon.applicablePlan !== 'all' && (
                                                <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                    Solo {coupon.applicablePlan === 'monthly' ? 'Mensual' : 'Anual'}
                                                </span>
                                            )}
                                            {coupon.duration === 'forever' && (
                                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                                                    FOREVER
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleCoupon(coupon.id, coupon.active)}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Activar/Desactivar"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCoupon(coupon.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Eliminar"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {coupons.length === 0 && <p className="text-slate-500 text-center py-8">No hay cupones creados.</p>}
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL DE NOTIFICACIÓN */}
            {notificationModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Notificar a {notificationModal.userName}</h3>
                        <p className="text-sm text-slate-500 mb-4">Ingresa los detalles finales para el cliente.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Link Provisional (Vercel)</label>
                                <input
                                    type="text"
                                    placeholder="https://cliente.vercel.app"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={notificationData.provisionalUrl}
                                    onChange={(e) => setNotificationData({ ...notificationData, provisionalUrl: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Registros DNS a configurar</label>
                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    {/* A Record */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-bold text-slate-600 uppercase">Registro A (@)</label>
                                            <span className="text-[10px] text-slate-400 font-mono">Type: A | Name: @</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ej: 76.76.21.21"
                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                            value={notificationData.dnsARecord || ''}
                                            onChange={(e) => setNotificationData({ ...notificationData, dnsARecord: e.target.value })}
                                        />
                                    </div>

                                    {/* CNAME Record */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-bold text-slate-600 uppercase">Registro CNAME (www)</label>
                                            <span className="text-[10px] text-slate-400 font-mono">Type: CNAME | Name: www</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ej: cname.vercel-dns.com"
                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                            value={notificationData.dnsCnameRecord || ''}
                                            onChange={(e) => setNotificationData({ ...notificationData, dnsCnameRecord: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setNotificationModal({ isOpen: false, userId: null, userName: '' })}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleNotifyUser(notificationModal.userId)}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Enviar Notificación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;

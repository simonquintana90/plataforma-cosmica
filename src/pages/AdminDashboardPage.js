import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatusBadge, UserStatusBadge } from '../components/Badges';
import Skeleton from '../components/Skeleton';

const AdminDashboardPage = ({ user, auth, db, collection, query, where, orderBy, onSnapshot, doc, updateDoc }) => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [approvingUserId, setApprovingUserId] = useState(null);
    const [completingRequestId, setCompletingRequestId] = useState(null);

    const pendingUsersCount = useMemo(() => users.filter(u => u.status === 'pending_approval').length, [users]);

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
                        {/* 2. Botón de "Subscription Wall" eliminado */}
                    </div>
                </div>
                {/* --- (FIN) CAMBIOS EN EL PANEL DE ADMIN --- */}

                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('requests')} className={`px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'requests' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Solicitudes ({filteredRequests.length})</button>
                        <button onClick={() => setActiveTab('users')} className={`relative px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'users' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                            Todos los Usuarios ({filteredUsers.length})
                            {pendingUsersCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px]">{pendingUsersCount}</span></span>}
                        </button>
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
                                                <p className="text-sm font-bold text-blue-600">{req.userName || 'Usuario sin nombre'}</p>
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
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboardPage;

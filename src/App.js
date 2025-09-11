import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Wallet } from '@mercadopago/sdk-react';
import toast, { Toaster } from 'react-hot-toast';

// --- ID DE ADMINISTRADOR ---
const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

// --- COMPONENTES REUTILIZABLES ---
const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full";
    if (status === 'completed') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completado</span>;
    }
    return <span className={`${baseClasses} bg-amber-100 text-amber-800`}>Pendiente</span>;
};

const UserStatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full";
     if (status === 'approved') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Aprobado</span>;
    }
    return <span className={`${baseClasses} bg-amber-100 text-amber-800`}>Pendiente de Aprobación</span>;
};


// --- COMPONENTES DE PÁGINA ---

const AuthPage = ({ auth, updateProfile, db, doc, setDoc, serverTimestamp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault(); setLoading(true); setError(null); setMessage('');
    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await updateProfile(userCredential.user, { displayName: name });

        const userRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userRef, {
            email: userCredential.user.email,
            displayName: name,
            createdAt: serverTimestamp(),
            status: "pending_approval",
        });
      }
    } catch (error) { setError(error.message); } finally { setLoading(false); }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen p-4 bg-slate-50 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 to-transparent blur-3xl" />
        <div className="relative w-full max-w-md mx-auto bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 md:p-10 shadow-lg">
            <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-7 w-auto mb-10 mx-auto"/>
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold text-slate-900">{isLogin ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}</h2>
                <p className="text-slate-500 mt-2">{isLogin ? 'Accede a tu plataforma de cliente.' : 'Únete para gestionar tu universo digital.'}</p>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mt-6 text-sm">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mt-6 text-sm">{message}</p>}
            <form onSubmit={handleAuthAction} className="mt-8 space-y-5">
                {!isLogin && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-2">Nombre</label>
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-2">Contraseña</label>
                    <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold rounded-lg py-3 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50">{loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}</button>
                </div>
            </form>
            <p className="text-center text-sm text-slate-500 mt-8">{isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'} <button onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(''); }} className="font-bold text-blue-600 hover:underline ml-1">{isLogin ? 'Regístrate' : 'Inicia Sesión'}</button></p>
        </div>
    </div>
  );
};

const DashboardPage = ({ user, auth, db, addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot, doc, getDoc, httpsCallable, getFunctions }) => {
    const [changeRequestSent, setChangeRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [subscription, setSubscription] = useState({ status: 'loading' });
    const [isCancelling, setIsCancelling] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    const [isCreatingPreference, setIsCreatingPreference] = useState(false);

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
        e.preventDefault(); setLoading(true);
        const { 'change-title': title, 'change-type': type, 'change-description': description } = e.target.elements;
        try {
            await addDoc(collection(db, "requests"), { title: title.value, type: type.value, description: description.value, userId: user.uid, userEmail: user.email, userName: user.displayName, createdAt: serverTimestamp(), status: 'pending' });
            setChangeRequestSent(true);
            e.target.reset();
            setTimeout(() => setChangeRequestSent(false), 5000);
        } catch (error) { alert('Error al enviar la solicitud: ' + error.message); } finally { setLoading(false); }
    };

    const handleSubscribe = async () => {
        setIsCreatingPreference(true);
        try {
            const functions = getFunctions();
            const createSubscriptionPreference = httpsCallable(functions, 'createSubscriptionPreference');
            const result = await createSubscriptionPreference();
            if (result.data.preferenceId) {
                setPreferenceId(result.data.preferenceId);
            }
        } catch (error) {
            console.error("Error al crear la preferencia:", error);
            alert("Hubo un error al iniciar la suscripción. Por favor, intenta de nuevo.");
            setIsCreatingPreference(false);
        }
    };
    
    const handleCancel = async () => {
        if (window.confirm("¿Estás seguro de que deseas cancelar tu suscripción? Perderás el acceso a los cambios ilimitados al final de tu ciclo de facturación.")) {
            setIsCancelling(true);
            try {
                const functions = getFunctions();
                const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
                await cancelSubscription();
                alert("Tu suscripción ha sido cancelada. El cambio se reflejará en breve.");
            } catch (error) {
                console.error("Error al cancelar:", error);
                alert("Hubo un error al cancelar la suscripción. Por favor, contacta a soporte.");
            } finally {
                setIsCancelling(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <div className="flex items-center gap-4">
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

                <div className="mb-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="font-heading text-lg font-bold text-slate-900">
                                {subscription.status === 'authorized' ? 'Suscripción Activa' : 'Activa tu Suscripción'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {subscription.status === 'authorized' 
                                    ? 'Gracias por ser parte de Cósmica. ¡Estamos listos para tu próxima solicitud!'
                                    : 'Accede a cambios ilimitados y soporte prioritario con nuestro plan mensual.'
                                }
                            </p>
                        </div>
                        {subscription.status === 'authorized' ? (
                            <button onClick={handleCancel} disabled={isCancelling} className="bg-red-100 text-red-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                {isCancelling ? 'Cancelando...' : 'Cancelar Suscripción'}
                            </button>
                        ) : (
                            <div className="min-w-[180px]">
                                {!preferenceId ? (
                                    <button onClick={handleSubscribe} disabled={isCreatingPreference || subscription.status === 'loading'} className="w-full bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                        {isCreatingPreference ? 'Generando checkout...' : 'Suscribirme Ahora'}
                                    </button>
                                ) : (
                                    <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts:{ valueProp: 'smart_option'}}} />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="p-6 md:p-8">{changeRequestSent ? ( <div className="flex flex-col items-center justify-center text-center h-96"><div className="bg-green-100 p-4 rounded-full mb-4"><svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><h2 className="text-2xl font-heading font-bold text-slate-900">¡Solicitud Enviada!</h2><p className="mt-2 text-slate-500 max-w-sm">Hemos recibido tu solicitud y nos pondremos en marcha pronto. Te notificaremos cualquier novedad.</p></div>) : ( <> <h2 className="text-xl font-heading font-bold text-slate-900 mb-1">Nueva Solicitud de Cambio</h2> <p className="text-sm text-slate-500 mb-6">Describe el cambio que necesitas para tu página web de la forma más detallada posible.</p><form onSubmit={handleRequestSubmit} className="space-y-6"><div><label htmlFor="change-title" className="block text-sm font-medium text-slate-600 mb-2">Título del Cambio</label><input type="text" id="change-title" name="change-title" required placeholder="Ej: Cambiar número de teléfono" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" /></div><div><label htmlFor="change-type" className="block text-sm font-medium text-slate-600 mb-2">Tipo de Cambio</label><select id="change-type" name="change-type" required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"><option>Cambio de Texto</option><option>Añadir/Cambiar Imagen</option><option>Corregir Error Visual</option><option>Nueva Funcionalidad</option><option>Otro</option></select></div><div><label htmlFor="change-description" className="block text-sm font-medium text-slate-600 mb-2">Descripción Detallada</label><textarea id="change-description" name="change-description" rows="5" required placeholder="Por favor, sé lo más específico posible. Si aplica, menciona en qué página se debe realizar el cambio." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"></textarea></div><div className="flex justify-end pt-2"><button type="submit" disabled={loading} className="inline-flex justify-center py-2.5 px-6 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? 'Enviando...' : 'Enviar Solicitud'}</button></div></form></>)}</div>
                    </div>
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                         <h3 className="font-heading font-bold text-slate-900">Mis Solicitudes</h3>
                         <ul className="mt-4 space-y-2">{loadingRequests ? (<p className="text-sm text-slate-500">Cargando...</p>) : requests.length === 0 ? (<p className="text-sm text-slate-500">Aún no has enviado solicitudes.</p>) : (requests.map(req => (<li key={req.id}><Link to={`/solicitud/${req.id}`} className="block p-3 rounded-lg hover:bg-slate-100 transition-colors"><div className="flex justify-between items-center"><p className="font-bold text-slate-700 truncate">{req.title}</p><StatusBadge status={req.status} /></div></Link></li>)))}</ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

const RequestDetailPage = ({ user, db, doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp }) => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        const getRequestDetails = async () => {
            const docRef = doc(db, "requests", requestId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const requestData = { id: docSnap.id, ...docSnap.data() };
                if (user.uid === ADMIN_UID || user.uid === requestData.userId) {
                    setRequest(requestData);
                } else {
                    setError("Acceso denegado.");
                }
            } else {
                setError("No se encontró la solicitud.");
            }
            setLoading(false);
        };
        getRequestDetails();
    }, [requestId, db, doc, getDoc, user]);
    
    useEffect(() => {
        if (!request) return;
        const messagesRef = collection(db, "requests", requestId, "messages");
        const q = query(messagesRef, orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [request, requestId, db, collection, query, orderBy, onSnapshot]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const messagesRef = collection(db, "requests", requestId, "messages");
        await addDoc(messagesRef, {
            text: newMessage,
            createdAt: serverTimestamp(),
            senderId: user.uid,
            senderName: user.displayName || 'Usuario'
        });
        setNewMessage('');
    };
    
    if (loading) return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen">{error} <Link to="/" className="ml-2 text-blue-600 hover:underline">Volver</Link></div>;
    
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <button onClick={() => navigate('/')} className="text-sm font-bold text-blue-600 hover:underline">← Volver al Dashboard</button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <p className="text-sm font-bold text-blue-600">{request.userName}</p>
                        <h1 className="font-heading text-2xl font-bold text-slate-900 mt-1">{request.title}</h1>
                        <p className="text-sm text-slate-500 mt-4">{request.description}</p>
                        <div className="mt-4 pt-4 border-t border-slate-200 text-sm">
                            <p><strong className="text-slate-600">Tipo:</strong> {request.type}</p>
                            <p><strong className="text-slate-600">Estado:</strong> {request.status}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[70vh]">
                        <div className="flex-1 p-6 overflow-y-auto">
                           {messages.map(msg => (
                               <div key={msg.id} className={`flex my-2 ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${msg.senderId === user.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                       <p className="text-sm break-words">{msg.text}</p>
                                       <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-blue-200' : 'text-slate-500'}`}>
                                           {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'}) : ''}
                                       </p>
                                   </div>
                               </div>
                           ))}
                           <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe tu mensaje..." className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"/>
                                <button type="submit" className="bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors">Enviar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const AdminDashboardPage = ({ user, auth, db, collection, query, where, orderBy, onSnapshot, doc, updateDoc }) => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [approvingUserId, setApprovingUserId] = useState(null);
    const [completingRequestId, setCompletingRequestId] = useState(null);

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
        const q = query(collection(db, "users"), where("status", "==", "pending_approval"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            setPendingUsers(data);
            setLoadingUsers(false);
        });
        return () => unsubscribe();
    }, [db, collection, query, where, onSnapshot]);

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

    const handleApproveUser = async (userId) => {
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
    
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-600 hidden sm:inline">Panel de Admin</span>
                        <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-10">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Panel de Administrador</h1>
                </div>

                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('requests')} className={`px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'requests' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Solicitudes ({requests.length})</button>
                        <button onClick={() => setActiveTab('users')} className={`relative px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'users' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                            Usuarios Pendientes
                            {pendingUsers.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px]">{pendingUsers.length}</span></span>}
                        </button>
                    </nav>
                </div>

                {activeTab === 'requests' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-slate-200">
                            {loadingRequests && <li className="p-6 text-center text-slate-500">Cargando solicitudes...</li>}
                            {!loadingRequests && requests.length === 0 && <li className="p-6 text-center text-slate-500">No hay solicitudes por el momento.</li>}
                            {requests.map((req) => (
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
                           {!loadingUsers && pendingUsers.length === 0 && <li className="p-6 text-center text-slate-500">No hay usuarios pendientes de aprobación.</li>}
                           {pendingUsers.map(pUser => (
                               <li key={pUser.id} className="p-4 sm:p-6">
                                   <div className="flex flex-wrap items-center justify-between gap-4">
                                       <div>
                                           <p className="font-bold text-slate-800">{pUser.displayName}</p>
                                           <p className="text-sm text-slate-500">{pUser.email}</p>
                                       </div>
                                       <button 
                                            onClick={() => handleApproveUser(pUser.id)} 
                                            disabled={approvingUserId === pUser.id}
                                            className="bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {approvingUserId === pUser.id ? 'Aprobando...' : 'Aprobar Usuario'}
                                       </button>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

const PendingApprovalPage = ({ auth }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center text-center p-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-slate-900">Cuenta Pendiente de Aprobación</h1>
                    <p className="mt-2 max-w-md mx-auto text-slate-500">Gracias por registrarte. Te notificaremos por correo cuando tu cuenta sea activada.</p>
                </div>
            </main>
        </div>
    );
};

const ProfileErrorPage = ({ auth }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center text-center p-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-slate-900">Error al Cargar tu Perfil</h1>
                    <p className="mt-2 max-w-md mx-auto text-slate-500">
                        No pudimos encontrar los datos de tu perfil. Esto puede deberse a un error durante el registro. Por favor, contacta a soporte.
                    </p>
                    <button 
                        onClick={() => auth.signOut()} 
                        className="mt-8 bg-slate-200 text-slate-800 font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Volver a Inicio
                    </button>
                </div>
            </main>
        </div>
    );
};

const MyAccountPage = ({ user, userProfile, auth, updateProfile, db, doc, updateDoc, updatePassword }) => {
    const [name, setName] = useState(user.displayName || '');
    const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
    const [phone, setPhone] = useState(userProfile?.phone || '');
    const [nit, setNit] = useState(userProfile?.nit || '');
    const [loading, setLoading] = useState(false);
    
    // --- NUEVOS ESTADOS PARA CONTRASEÑA ---
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    useEffect(() => {
        if(userProfile) {
            setCompanyName(userProfile.companyName || '');
            setPhone(userProfile.phone || '');
            setNit(userProfile.nit || '');
        }
    }, [userProfile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        const userRef = doc(db, "users", user.uid);

        try {
            if (name !== user.displayName) {
                await updateProfile(auth.currentUser, { displayName: name });
            }
            
            await updateDoc(userRef, { 
                displayName: name,
                companyName: companyName,
                phone: phone,
                nit: nit
            });

            toast.success('Perfil actualizado con éxito');
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            toast.error('Hubo un error al actualizar tu perfil.');
        } finally {
            setLoading(false);
        }
    };
    
    // --- NUEVA FUNCIÓN PARA CAMBIAR CONTRASEÑA ---
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordError(null);

        if (newPassword.length < 6) {
            setPasswordError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Las contraseñas no coinciden.");
            return;
        }
        
        setPasswordLoading(true);
        try {
            await updatePassword(auth.currentUser, newPassword);
            toast.success('Contraseña actualizada con éxito.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            // Este error es común y requiere que el usuario inicie sesión de nuevo
            if (error.code === 'auth/requires-recent-login') {
                setPasswordError("Esta operación es sensible y requiere un inicio de sesión reciente. Por favor, cierra sesión y vuelve a entrar para cambiar tu contraseña.");
                toast.error("Por seguridad, inicia sesión de nuevo.", { duration: 5000 });
            } else {
                setPasswordError(error.message);
            }
        } finally {
            setPasswordLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <Link to="/"><img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" /></Link>
                    <Link to="/" className="text-sm font-bold text-blue-600 hover:underline">← Volver al Dashboard</Link>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="mb-10">
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Mi Cuenta</h1>
                        <p className="mt-2 text-slate-500">Actualiza los datos de tu perfil y tu contraseña.</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800">Datos Personales y de la Empresa</h2>
                        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                                <input id="email" type="email" value={user.email} disabled className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-2">Nombre</label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-slate-600 mb-2">Nombre de la Empresa</label>
                                <input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-2">Celular</label>
                                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="nit" className="block text-sm font-medium text-slate-600 mb-2">NIT</label>
                                <input id="nit" type="text" value={nit} onChange={(e) => setNit(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-5 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- NUEVO FORMULARIO PARA CAMBIAR CONTRASEÑA --- */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800">Cambiar Contraseña</h2>
                        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-600 mb-2">Nueva Contraseña</label>
                                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 mb-2">Confirmar Nueva Contraseña</label>
                                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                            </div>
                            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={passwordLoading} className="inline-flex justify-center py-2 px-5 border border-transparent text-sm font-bold rounded-lg text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 transition-colors">
                                    {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL Y CARGADOR DE FIREBASE ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(undefined);
  const [firebaseServices, setFirebaseServices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firebaseConfig = {
        apiKey: "AIzaSyDY7dnLaXQJEEySEbg1C57VLAWS83rpwDU",
        authDomain: "plataforma-cosmica.firebaseapp.com",
        projectId: "plataforma-cosmica",
        storageBucket: "plataforma-cosmica.appspot.com",
        messagingSenderId: "655686784081",
        appId: "1:655686784081:web:b3c2411cdc2f27f5a71470",
        measurementId: "G-HKXZ2EY3Y9"
    };

    const loadFirebase = async () => {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js');
        const { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, updatePassword } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js');
        const { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, getDoc, where, setDoc } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js');
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js');
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        setFirebaseServices({ 
            auth: { ...auth, createUserWithEmailAndPassword: (e, p) => createUserWithEmailAndPassword(auth, e, p), signInWithEmailAndPassword: (e, p) => signInWithEmailAndPassword(auth, e, p), signOut: () => signOut(auth), },
            db, updateProfile, addDoc, collection, serverTimestamp, getFunctions, httpsCallable,
            query, orderBy, onSnapshot, doc, updateDoc, getDoc, where, setDoc,
            // Añadimos updatePassword a los servicios
            updatePassword,
        });

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                
                const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        setUserProfile(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error de Firestore al leer el perfil:", error);
                    setUserProfile(null);
                    setLoading(false);
                });
                
                return unsubscribeSnapshot;
            } else {
                setUser(null);
                setUserProfile(null);
                setLoading(false);
            }
        });
        
        return unsubscribeAuth;

      } catch (error) { 
        console.error("Error al cargar Firebase:", error);
        setLoading(false); 
      }
    };
    
    const unsubscribePromise = loadFirebase();

    return () => {
        unsubscribePromise.then(unsub => unsub && unsub());
    };
  }, []);


  if (loading) {
      return <div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Inicializando plataforma...</div>;
  }

  const AppRoutes = () => {
      return (
        <>
            <Toaster position="bottom-right" />
            
            {(() => {
                if (!user) {
                    return <AuthPage {...firebaseServices} />;
                }
                
                if(user.uid === ADMIN_UID){
                    return (
                    <Routes>
                        <Route path="/" element={<AdminDashboardPage user={user} {...firebaseServices} />} />
                        <Route path="/solicitud/:requestId" element={<RequestDetailPage user={user} {...firebaseServices} />} />
                    </Routes>
                    );
                }
                
                if (userProfile === undefined) {
                    return <div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Verificando estado de tu cuenta...</div>;
                }

                if (userProfile === null) {
                    return <ProfileErrorPage auth={firebaseServices.auth} />;
                }

                if(userProfile.status === 'pending_approval') {
                    return <PendingApprovalPage auth={firebaseServices.auth} />;
                }

                if(userProfile.status === 'approved') {
                    return (
                        <Routes>
                            <Route path="/" element={<DashboardPage user={user} {...firebaseServices} />} />
                            <Route path="/solicitud/:requestId" element={<RequestDetailPage user={user} {...firebaseServices} />} />
                            <Route path="/cuenta" element={<MyAccountPage user={user} userProfile={userProfile} {...firebaseServices} />} />
                        </Routes>
                    );
                }
                
                return <AuthPage {...firebaseServices} />;
            })()}
        </>
      );
  };

  return <AppRoutes />;
}
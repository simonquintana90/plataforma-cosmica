import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// --- ÍCONOS SVG ---
const PaperclipIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> );
const GoogleIcon = ({ className }) => ( <svg className={className} role="img" viewBox="0 0 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.64 0-8.54-3.82-8.54-8.42s3.9-8.42 8.54-8.42c2.48 0 4.3.94 5.6 2.16l2.7-2.7C19.02 3.88 16.17 2.4 12.48 2.4c-6.65 0-12 5.35-12 12s5.35 12 12 12c6.4 0 11.45-4.45 11.45-11.72 0-.78-.08-1.55-.2-2.32h-11.25z"/></svg> );

// --- ID DE ADMINISTRADOR ---
const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

// --- COMPONENTE REUTILIZABLE para Estatus ---
const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full";
    if (status === 'completed') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completado</span>;
    }
    return <span className={`${baseClasses} bg-amber-100 text-amber-800`}>Pendiente</span>;
};


// --- COMPONENTES DE PÁGINA ---

const AuthPage = ({ auth, updateProfile }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setMessage('¡Cuenta creada! Por favor, inicia sesión.');
        setIsLogin(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen p-4 bg-slate-50 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 to-transparent blur-3xl" />
        <div className="relative w-full max-w-md mx-auto bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 md:p-10 shadow-lg">
            <img 
                src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" 
                alt="Logo Cósmica" 
                className="h-7 w-auto mb-10 mx-auto"
            />
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

const DashboardPage = ({ user, auth, db, addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot }) => {
    const [changeRequestSent, setChangeRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

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

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <div className="flex items-center gap-4">
                        <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-10">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Hola, {user.displayName || user.email} 👋</h1>
                    <p className="mt-2 text-slate-500">Bienvenido a tu centro de control. Desde aquí puedes solicitar cualquier cambio para tu web.</p>
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
        const getRequestDetails = async () => {
            const docRef = doc(db, "requests", requestId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const requestData = { id: docSnap.id, ...docSnap.data() };
                // Security Check: Ensure the user is either the admin or the owner of the request
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
        if(user) getRequestDetails();
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
    if (error) return <div className="flex justify-center items-center min-h-screen">{error}</div>;
    
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
                                   <div className={`max-w-sm rounded-2xl px-4 py-2 ${msg.senderId === user.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                       <p className="text-sm">{msg.text}</p>
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

const AdminDashboardPage = ({ user, auth, db, collection, query, orderBy, onSnapshot, doc, updateDoc }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const requestsData = [];
            querySnapshot.forEach((doc) => {
                requestsData.push({ id: doc.id, ...doc.data() });
            });
            setRequests(requestsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, collection, query, orderBy, onSnapshot]);

    const handleMarkAsComplete = async (requestId) => {
        const requestRef = doc(db, "requests", requestId);
        try {
            await updateDoc(requestRef, { status: "completed" });
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            alert("Hubo un error al marcar la solicitud como completada.");
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
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Solicitudes de Clientes</h1>
                    <p className="mt-2 text-slate-500">Aquí puedes gestionar todas las solicitudes de cambio pendientes.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                        {loading && <li className="p-6 text-center text-slate-500">Cargando solicitudes...</li>}
                        {!loading && requests.length === 0 && <li className="p-6 text-center text-slate-500">No hay solicitudes por el momento.</li>}
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
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString('es-CO') : 'Fecha no disp.'}
                                                </p>
                                            </div>
                                            {req.status === 'pending' && (
                                                <button onClick={(e) => { e.preventDefault(); handleMarkAsComplete(req.id); }} className="bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors flex-shrink-0">
                                                    Completar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL Y CARGADOR DE FIREBASE ---
export default function App() {
  const [user, setUser] = useState(null);
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
        const { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js');
        const { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, getDoc, where } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js');
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js');
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        setFirebaseServices({ 
            auth: { ...auth, createUserWithEmailAndPassword: (e, p) => createUserWithEmailAndPassword(auth, e, p), signInWithEmailAndPassword: (e, p) => signInWithEmailAndPassword(auth, e, p), signOut: () => signOut(auth), },
            db, updateProfile, addDoc, collection, serverTimestamp, getFunctions, httpsCallable,
            query, orderBy, onSnapshot, doc, updateDoc, getDoc, where
        });

        onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });
      } catch (error) { console.error("Error al cargar Firebase:", error); setLoading(false); }
    };
    
    loadFirebase();
  }, []);

  if (loading || !firebaseServices) {
      return <div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Inicializando plataforma...</div>;
  }

  // Lógica de ruteo principal
  const AppRoutes = () => {
      if (!user) return <AuthPage {...firebaseServices} />;

      return (
          <Routes>
              <Route path="/" element={
                  user.uid === ADMIN_UID 
                  ? <AdminDashboardPage user={user} {...firebaseServices} /> 
                  : <DashboardPage user={user} {...firebaseServices} />
              } />
              <Route path="/solicitud/:requestId" element={
                  <RequestDetailPage user={user} {...firebaseServices} />
              } />
          </Routes>
      );
  };

  return <AppRoutes />;
}
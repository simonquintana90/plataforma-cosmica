import React, { useState, useEffect } from 'react';

// --- ÍCONOS SVG ---
const PaperclipIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> );
const GoogleIcon = ({ className }) => ( <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.64 0-8.54-3.82-8.54-8.42s3.9-8.42 8.54-8.42c2.48 0 4.3.94 5.6 2.16l2.7-2.7C19.02 3.88 16.17 2.4 12.48 2.4c-6.65 0-12 5.35-12 12s5.35 12 12 12c6.4 0 11.45-4.45 11.45-11.72 0-.78-.08-1.55-.2-2.32h-11.25z"/></svg> );

// --- COMPONENTE DE AUTENTICACIÓN (Sin cambios) ---
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
                <h2 className="font-heading text-3xl font-bold text-slate-900">
                    {isLogin ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}
                </h2>
                <p className="text-slate-500 mt-2">
                    {isLogin ? 'Accede a tu plataforma de cliente.' : 'Únete para gestionar tu universo digital.'}
                </p>
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
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold rounded-lg py-3 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50">
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </div>
            </form>
            <p className="text-center text-sm text-slate-500 mt-8">
                {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <button onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(''); }} className="font-bold text-blue-600 hover:underline ml-1">{isLogin ? 'Regístrate' : 'Inicia Sesión'}</button>
            </p>
        </div>
    </div>
  );
};

// --- DASHBOARD REDISEÑADO ---
const DashboardPage = ({ user, auth, db, addDoc, collection, serverTimestamp }) => {
    const [changeRequestSent, setChangeRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { 'change-title': title, 'change-type': type, 'change-description': description } = e.target.elements;
        try {
            await addDoc(collection(db, "requests"), { 
                title: title.value, 
                type: type.value, 
                description: description.value, 
                userId: user.uid, 
                userEmail: user.email, 
                userName: user.displayName, 
                createdAt: serverTimestamp(), 
                status: 'pending' 
            });
            setChangeRequestSent(true);
            e.target.reset();
            setTimeout(() => setChangeRequestSent(false), 5000);
        } catch (error) {
            alert('Error al enviar la solicitud: ' + error.message);
        } finally {
            setLoading(false);
        }
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
                {/* Encabezado del Dashboard */}
                <div className="mb-10">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Hola, {user.displayName || user.email} 👋</h1>
                    <p className="mt-2 text-slate-500">Bienvenido a tu centro de control. Desde aquí puedes solicitar cualquier cambio para tu web.</p>
                </div>

                {/* Layout de 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Columna Izquierda: Formulario de Solicitud */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="p-6 md:p-8">
                            {changeRequestSent ? (
                                <div className="flex flex-col items-center justify-center text-center h-96">
                                    <div className="bg-green-100 p-4 rounded-full mb-4">
                                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-heading font-bold text-slate-900">¡Solicitud Enviada!</h2>
                                    <p className="mt-2 text-slate-500 max-w-sm">Hemos recibido tu solicitud y nos pondremos en marcha pronto. Te notificaremos cualquier novedad.</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-heading font-bold text-slate-900 mb-1">Nueva Solicitud de Cambio</h2>
                                    <p className="text-sm text-slate-500 mb-6">Describe el cambio que necesitas para tu página web de la forma más detallada posible.</p>
                                    <form onSubmit={handleRequestSubmit} className="space-y-6">
                                        <div><label htmlFor="change-title" className="block text-sm font-medium text-slate-600 mb-2">Título del Cambio</label><input type="text" id="change-title" name="change-title" required placeholder="Ej: Cambiar número de teléfono" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" /></div>
                                        <div><label htmlFor="change-type" className="block text-sm font-medium text-slate-600 mb-2">Tipo de Cambio</label><select id="change-type" name="change-type" required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"><option>Cambio de Texto</option><option>Añadir/Cambiar Imagen</option><option>Corregir Error Visual</option><option>Nueva Funcionalidad</option><option>Otro</option></select></div>
                                        <div><label htmlFor="change-description" className="block text-sm font-medium text-slate-600 mb-2">Descripción Detallada</label><textarea id="change-description" name="change-description" rows="5" required placeholder="Por favor, sé lo más específico posible. Si aplica, menciona en qué página se debe realizar el cambio." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"></textarea></div>
                                        <div className="flex justify-end pt-2"><button type="submit" disabled={loading} className="inline-flex justify-center py-2.5 px-6 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? 'Enviando...' : 'Enviar Solicitud'}</button></div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Columna Derecha: Consejos */}
                    <div className="lg:col-span-1 bg-slate-100/80 border border-slate-200 rounded-2xl p-6">
                         <h3 className="font-heading font-bold text-slate-900">Consejos para una solicitud efectiva</h3>
                         <ul className="mt-4 space-y-4 text-sm text-slate-600">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>**Sé específico:** En lugar de "cambiar texto", prueba con "En la página de inicio, cambiar el título por...".</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2m6-4v2m-6-2v2" /></svg>
                                <span>**Una solicitud por cambio:** Para mayor agilidad, es mejor enviar los cambios grandes de forma individual.</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>**Tiempos de entrega:** La mayoría de cambios de contenido se completan en menos de 48 horas hábiles.</span>
                            </li>
                         </ul>
                    </div>
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
        const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js');
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js');
        const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js');

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);

        setFirebaseServices({ 
            auth: { ...auth, createUserWithEmailAndPassword: (e, p) => createUserWithEmailAndPassword(auth, e, p), signInWithEmailAndPassword: (e, p) => signInWithEmailAndPassword(auth, e, p), signOut: () => signOut(auth), },
            db, updateProfile, addDoc, collection, serverTimestamp, getFunctions, httpsCallable,
            storage, storageRef, uploadBytes, getDownloadURL
        });

        onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });

      } catch (error) {
        console.error("Error al cargar Firebase:", error);
        setLoading(false);
      }
    };
    
    loadFirebase();
  }, []);

  if (loading) {
      return <div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Inicializando plataforma...</div>;
  }

  return (
    <main>
      {!user ? <AuthPage {...firebaseServices} /> : <DashboardPage user={user} {...firebaseServices} />}
    </main>
  );
}
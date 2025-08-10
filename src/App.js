import React, { useState, useEffect } from 'react';

// --- ÍCONOS SVG ---
const PaperclipIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> );
const GoogleIcon = ({ className }) => ( <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.64 0-8.54-3.82-8.54-8.42s3.9-8.42 8.54-8.42c2.48 0 4.3.94 5.6 2.16l2.7-2.7C19.02 3.88 16.17 2.4 12.48 2.4c-6.65 0-12 5.35-12 12s5.35 12 12 12c6.4 0 11.45-4.45 11.45-11.72 0-.78-.08-1.55-.2-2.32h-11.25z"/></svg> );
const SearchIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );

// --- COMPONENTES DE LA UI ---

const AuthPage = ({ auth, updateProfile }) => {
  const [isLogin, setIsLogin] = useState(false);
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
    <div className="flex justify-center items-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-10 sm:p-14 md:p-20 flex flex-col justify-center">
            <img src="/Logo.png" alt="Logo Cósmica" className="h-8 w-auto mb-10 self-start" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="mb-8">
                <h2 className="font-title text-3xl font-bold text-gray-900">{isLogin ? 'Bienvenido de Nuevo' : 'Empecemos a crear'}</h2>
                <p className="text-sm text-gray-500 mt-2">{isLogin ? 'Accede a tu plataforma de cliente.' : 'Empecemos por crear tu cuenta en Cósmica.'}</p>
            </div>
            <hr className="border-gray-200 mb-8" />
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{message}</p>}
            <form onSubmit={handleAuthAction} className="space-y-5">
                {!isLogin && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3e6cff]" />
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3e6cff]" />
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        {isLogin && <a href="#" onClick={(e) => {e.preventDefault(); alert('Función de recuperación no implementada aún.')}} className="text-sm text-[#3e6cff] hover:underline">¿Olvidaste?</a>}
                    </div>
                    <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3e6cff]" />
                </div>
                <div className="pt-4">
                    <button type="submit" disabled={loading} style={{ backgroundColor: '#3e6cff' }} className="w-full text-white font-bold rounded-lg py-3.5 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </div>
            </form>
            <p className="text-center text-sm text-gray-500 mt-10">
                {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <button onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(''); }} className="font-bold text-[#3e6cff] hover:underline ml-1">{isLogin ? 'Regístrate' : 'Log in'}</button>
            </p>
        </div>
        <div className="hidden lg:flex relative items-center justify-center p-12 bg-gray-900 overflow-hidden">
            <div className="animated-gradient-bg"></div>
            <div className="relative z-10 text-center max-w-sm">
                 <h1 className="font-title text-4xl font-extrabold text-white leading-tight tracking-tight">
                    Bienvenido al mundo digital simplificado para ti.
                 </h1>
            </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ user, auth, db, addDoc, collection, serverTimestamp, getFunctions, httpsCallable, storage, storageRef, uploadBytes, getDownloadURL }) => {
    const [activeTab, setActiveTab] = useState('requestChange');
    const [changeRequestSent, setChangeRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gmbStatus, setGmbStatus] = useState('disconnected');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code && gmbStatus !== 'connected') {
            setGmbStatus('connecting');
            const functions = getFunctions();
            const exchangeCode = httpsCallable(functions, 'exchangeCodeForTokens');
            exchangeCode({ code: code })
                .then((result) => {
                    setGmbStatus('connected');
                    window.history.replaceState({}, document.title, "/");
                })
                .catch((error) => {
                    alert("Hubo un error al conectar con Google.");
                    setGmbStatus('disconnected');
                    window.history.replaceState({}, document.title, "/");
                });
        }
    }, [getFunctions, httpsCallable, gmbStatus]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target;
        const title = form.elements['change-title'].value;
        const type = form.elements['change-type'].value;
        const description = form.elements['change-description'].value;

        try {
            let fileUrl = null;
            if (selectedFile) {
                const fileRef = storageRef(storage, `requests/${user.uid}/${Date.now()}_${selectedFile.name}`);
                await uploadBytes(fileRef, selectedFile);
                fileUrl = await getDownloadURL(fileRef);
            }

            await addDoc(collection(db, "requests"), {
                title, type, description, userId: user.uid, userEmail: user.email, userName: user.displayName, createdAt: serverTimestamp(), status: 'pending',
                fileUrl: fileUrl
            });

            setChangeRequestSent(true);
            form.reset();
            setSelectedFile(null);
            setTimeout(() => setChangeRequestSent(false), 5000);
        } catch (error) {
            alert('Error al enviar la solicitud: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleConnect = () => {
        const GOOGLE_CLIENT_ID = "76153163961-g9e0hu938vn2g84lj9ep2hv3vd4dsido.apps.googleusercontent.com";
        const redirectUri = 'https://app.cosmicaweb.com';
        const scope = 'https://www.googleapis.com/auth/business.manage';
        const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = { 'client_id': GOOGLE_CLIENT_ID, 'redirect_uri': redirectUri, 'response_type': 'code', 'scope': scope, 'access_type': 'offline', 'prompt': 'consent' };
        const url = `${oauth2Endpoint}?${new URLSearchParams(params).toString()}`;
        window.location.href = url;
    };

    const handleLogout = async () => {
        await auth.signOut();
    };

    const TabButton = ({ id, label }) => ( <button onClick={() => setActiveTab(id)} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === id ? 'bg-[#3e6cff] text-white' : 'text-gray-500 hover:bg-gray-200'}`}>{label}</button> );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="/Logo.png" alt="Logo Cósmica" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div>
                        <span className="text-sm text-gray-600 mr-4">Hola, {user.displayName || user.email}</span>
                        <button onClick={handleLogout} className="text-sm font-bold text-gray-600 hover:text-[#3e6cff]">Cerrar Sesión</button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="border-b border-gray-200 mb-6"><nav className="flex space-x-2"><TabButton id="requestChange" label="Solicitar un Cambio" /><TabButton id="connectGmb" label="Conectar GMB" /></nav></div>
                        {activeTab === 'requestChange' && (
                            <div>
                                <h2 className="text-xl font-bold font-title text-gray-800 mb-1">Nueva Solicitud de Cambio</h2>
                                <p className="text-sm text-gray-500 mb-6">Describe el cambio que necesitas para tu página web. Nuestro equipo lo revisará a la brevedad.</p>
                                {changeRequestSent ? (
                                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md"><p className="font-bold">¡Solicitud Enviada!</p><p>Hemos recibido tu solicitud de cambio. Muy pronto verás los cambios reflejados en tu web, de ser necesario te contactaremos.</p></div>
                                ) : (
                                    <form onSubmit={handleRequestSubmit} className="space-y-6">
                                        <div><label htmlFor="change-title" className="block text-sm font-medium text-gray-700">Título del Cambio</label><input type="text" id="change-title" name="change-title" placeholder="Ej: Cambiar texto en la sección de 'Servicios'" required className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3e6cff]" /></div>
                                        <div><label htmlFor="change-type" className="block text-sm font-medium text-gray-700">Tipo de Cambio</label><select id="change-type" name="change-type" required className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3e6cff]"><option>Cambio de Texto</option><option>Añadir/Cambiar Imagen</option><option>Corregir Error Visual</option><option>Nueva Funcionalidad</option><option>Otro</option></select></div>
                                        <div><label htmlFor="change-description" className="block text-sm font-medium text-gray-700">Descripción Detallada</label><textarea id="change-description" name="change-description" rows="5" placeholder="Por favor, sé lo más específico posible..." required className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3e6cff]"></textarea></div>
                                        <div>
                                            <label htmlFor="change-file" className="block text-sm font-medium text-gray-700">Adjuntar Archivo (Opcional)</label>
                                            <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                <div className="space-y-1 text-center">
                                                    <PaperclipIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3e6cff] hover:text-[#3e6cff] focus-within:outline-none">
                                                            <span>{selectedFile ? 'Cambiar archivo' : 'Sube un archivo'}</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                                        </label>
                                                        {!selectedFile && <p className="pl-1">o arrástralo aquí</p>}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : 'PNG, JPG, GIF hasta 10MB'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right"><button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-[#3e6cff] hover:opacity-90 disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar Solicitud'}</button></div>
                                    </form>
                                )}
                            </div>
                        )}
                        {activeTab === 'connectGmb' && (
                            <div className="py-8 text-center">
                                {gmbStatus === 'disconnected' && (
                                    <>
                                        <h2 className="text-xl font-bold font-title text-gray-800 mb-2">Conecta tu Perfil de Negocio de Google</h2>
                                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">Potencia tu presencia online mostrando tus reseñas de Google directamente en tu web.</p>
                                        <div className="mt-8">
                                            <button onClick={handleGoogleConnect} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#3e6cff] hover:opacity-90">
                                                <GoogleIcon className="w-5 h-5 mr-3" />
                                                Conectar con Google
                                            </button>
                                        </div>
                                    </>
                                )}
                                {gmbStatus === 'connecting' && (
                                    <div>
                                        <h2 className="text-xl font-bold font-title text-gray-800">Conectando con Google...</h2>
                                        <p className="mt-2 text-sm text-gray-500">Por favor, espera mientras verificamos tu autorización.</p>
                                    </div>
                                )}
                                {gmbStatus === 'connected' && (
                                     <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
                                        <p className="font-bold">¡Conectado!</p>
                                        <p>Tu cuenta de Google Business Profile ha sido conectada exitosamente.</p>
                                    </div>
                                )}
                            </div>
                        )}
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
        // CORRECCIÓN: Se renombra 'ref' a 'storageRef' para evitar conflicto con React
        const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js');

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);

        setFirebaseServices({ 
            auth: { ...auth, createUserWithEmailAndPassword: (email, password) => createUserWithEmailAndPassword(auth, email, password), signInWithEmailAndPassword: (email, password) => signInWithEmailAndPassword(auth, email, password), signOut: () => signOut(auth), },
            db, updateProfile, addDoc, collection, serverTimestamp, getFunctions, httpsCallable,
            storage, 
            storageRef, // Se pasa la función renombrada
            uploadBytes, 
            getDownloadURL
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
      return <div className="flex justify-center items-center min-h-screen font-title">Inicializando plataforma...</div>;
  }

  return (
    <main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;800&display=swap');
        body { font-family: 'Archivo', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .font-title { font-family: 'Archivo', sans-serif; font-weight: 700; }
        .animated-gradient-bg {
          width: 100%; height: 100%; position: absolute; top: 0; left: 0;
          background: linear-gradient(135deg, #0a1942 0%, #3e6cff 50%, #0a1942 100%);
          background-size: 200% 200%; animation: flag-wave 10s ease-in-out infinite;
          z-index: 0; filter: blur(60px); transform: scale(1.5);
        }
        @keyframes flag-wave { 0% { background-position: 0% 82%; } 50% { background-position: 100% 19%; } 100% { background-position: 0% 82%; } }
      `}</style>
      {!user ? <AuthPage {...firebaseServices} /> : <DashboardPage user={user} {...firebaseServices} />}
    </main>
  );
}

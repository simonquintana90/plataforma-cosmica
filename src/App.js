import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Link, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
// 1. LÍNEAS DE MERCADOPAGO ELIMINADAS
import toast, { Toaster } from 'react-hot-toast';

// 2. LÍNEA DE initMercadoPago ELIMINADA

// --- ID DE ADMINISTRADOR ---
const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

// ...el resto de tu código continúa aquí...

// --- COMPONENTES REUTILIZABLES ---
const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full";
    if (status === 'completed' || status === 'approved') {
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
  const location = useLocation();
  const navigate = useNavigate(); // Para cambiar de URL
// CAMBIO: 'isLogin' ahora se deriva de la URL, no es un estado. const isLogin = location.pathname.startsWith('/login');

const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(null); const [loading, setLoading] = useState(false); const [message, setMessage] = useState('');

const handleAuthAction = async (e) => { e.preventDefault(); setLoading(true); setError(null); setMessage(''); try { if (isLogin) { await auth.signInWithEmailAndPassword(email, password); } else { const userCredential = await auth.createUserWithEmailAndPassword(email, password); await updateProfile(userCredential.user, { displayName: name });

    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
        email: userCredential.user.email,
        displayName: name,
        createdAt: serverTimestamp(),
        status: "pending_approval",
        initialPaymentStatus: "pending",
        websiteInfoStatus: "pending",
    });
  }
} catch (error) { setError(error.message); } finally { setLoading(false); }
};

// CAMBIO: Nueva función para el botón que cambia de modo const toggleAuthMode = () => { setError(null); setMessage(''); if (isLogin) { navigate('/'); // Si estamos en login, ir a registro } else { navigate('/login'); // Si estamos en registro, ir a login } };

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


// --- (NUEVO) Hook para cargar script de Wompi ---
const useWompiScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
};

// --- (MODIFICADO) Este componente REEMPLAZA a 'InitialPaymentPage' ---
const SubscriptionPage = ({ user, auth, getFunctions, httpsCallable, db, doc, updateDoc }) => {
    useWompiScript(); // Carga el script de Wompi
    const [isProcessing, setIsProcessing] = useState(false);
    const [acceptanceToken, setAcceptanceToken] = useState(null); // <-- AÑADIDO
    const [loadingToken, setLoadingToken] = useState(true); // <-- AÑADIDO
    const navigate = useNavigate();

    // --- (NUEVO) Obtener el Token de Aceptación al cargar ---
    useEffect(() => {
        const fetchAcceptanceToken = async () => {
            setLoadingToken(true);
            try {
                const functions = getFunctions();
                const getWompiAcceptanceToken = httpsCallable(functions, 'getWompiAcceptanceToken');
                const result = await getWompiAcceptanceToken();
                
                if (result.data.acceptance_token) {
                    setAcceptanceToken(result.data.acceptance_token);
                } else {
                    throw new Error('No se recibió el token de aceptación.');
                }
            } catch (error) {
                console.error("Error al obtener token de aceptación:", error);
                toast.error("Error al inicializar el formulario de pago.");
            } finally {
                setLoadingToken(false);
            }
        };
        fetchAcceptanceToken();
    }, [getFunctions, httpsCallable]);

    // 1. Esta función es llamada por el FORMULARIO de Wompi
    const handleWompiResponse = async (event) => {
        event.preventDefault();
        setIsProcessing(true);
        toast.loading('Procesando tu suscripción...');

        const wompiToken = event.detail.token; // Token de la tarjeta
        
        try {
            const functions = getFunctions();
            const createWompiSubscription = httpsCallable(functions, 'createWompiSubscription');
            
            // 2. Enviamos AMBOS tokens al backend
            const result = await createWompiSubscription({ 
                paymentToken: wompiToken, 
                acceptanceToken: acceptanceToken 
            });

            if (result.data.status === 'success') {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    initialPaymentStatus: "completed",
                    subscriptionStatus: "active", // <-- CAMBIO A "active"
                    subscriptionId: result.data.subscriptionId,
                    paymentSourceId: result.data.paymentSourceId,
                });
                
                toast.dismiss();
                toast.success('¡Suscripción activada! Bienvenido a Cósmica.');
                navigate('/formulario-web');
            } else {
                throw new Error(result.data.message || 'Error en la suscripción.');
            }

        } catch (error) {
            console.error("Error al crear la suscripción:", error);
            toast.dismiss();
            toast.error(`Error: ${error.message || 'No se pudo procesar el pago.'}`);
            setIsProcessing(false);
        }
    };

    // 5. Añadimos el listener para el evento del formulario de Wompi
    useEffect(() => {
        if (!acceptanceToken) return; // No hacer nada si no hay token
        
        const wompiForm = document.getElementById('wompi-form');
        wompiForm.addEventListener('wompi:token', handleWompiResponse);
        return () => {
            wompiForm.removeEventListener('wompi:token', handleWompiResponse);
        };
    }, [acceptanceToken]); // <-- Se activa cuando el token de aceptación está listo
    
    // 6. DEBES PONER TU LLAVE PÚBLICA DE WOMPI AQUÍ
    const wompiPublicKey = 'pub_prod_...pub_prod_t98LASUQBr0VyCiCw3f4VWVkoBrBh4JX';

    return (
        <div className="min-h-screen bg-slate-50">
             <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">¡Bienvenido a Cósmica, {user.displayName || user.email}!</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-500">Último paso. Activa tu suscripción mensual para que nuestro equipo comience a trabajar en tu sitio web.</p>
                </div>
                
                {/* 7. Formulario de Wompi */}
                <form className="max-w-md mx-auto mt-10" id="wompi-form">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                        
                        {/* Mostramos 'cargando' mientras obtenemos el token de aceptación */}
                        {loadingToken && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                                <p className="font-bold text-slate-600">Cargando formulario de pago...</p>
                            </div>
                        )}

                        <h3 className="font-heading text-xl font-bold text-slate-900 text-center">
                            Suscripción Mensual
                        </h3>
                        <p className="text-slate-500 mt-2 text-center">
                            <span className="text-3xl font-bold text-slate-800">$89.900</span>
                            <span className="text-slate-500"> COP / mes</span>
                        </p>
                        
                        <div className="mt-6 text-center bg-blue-50/50 border-l-4 border-blue-300 p-3">
                            <p className="text-sm text-blue-800">
                                Tu plan incluye <strong className="font-bold">cambios ilimitados</strong>, <strong className="font-bold">hosting</strong> y <strong className="font-bold">soporte prioritario</strong>.
                            </p>
                        </div>

                        {/* 8. Campos del widget de Wompi */}
                        <div className="mt-8 space-y-4">
                            <div className="wompi-form-field">
                                <label className="block text-sm font-medium text-slate-600 mb-2">Número de tarjeta</label>
                                <input type="text" data-wompi="card-number" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="wompi-form-field">
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Fecha de exp.</label>
                                    <input type="text" data-wompi="card-exp" placeholder="MM/YY" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                                <div className="wompi-form-field">
                                    <label className="block text-sm font-medium text-slate-600 mb-2">CVC</label>
                                    <input type="text" data-wompi="card-cvc" placeholder="123" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                            </div>
                            <div className="wompi-form-field">
                                <label className="block text-sm font-medium text-slate-600 mb-2">Nombre del titular</label>
                                <input type="text" data-wompi="card-holder" placeholder="Nombre como aparece en la tarjeta" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <button 
                                type="submit" 
                                disabled={isProcessing || loadingToken} // <-- Deshabilitado si está procesando O cargando
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                data-wompi-key={wompiPublicKey}
                                data-wompi-currency="COP"
                            >
                                {isProcessing ? 'Procesando...' : 'Pagar $89.900 COP Ahora'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 text-center mt-4">Pagos seguros procesados por Wompi.</p>
                    </div>
                </form>
            </main>
        </div>
    );
};


const WebsiteInfoFormPage = ({ user, auth, db, doc, updateDoc, serverTimestamp }) => {
    const [activeSection, setActiveSection] = useState(1);
    const [formData, setFormData] = useState({
        domain: '',
        clientType: [],
        commonReasonsNotToChoose: '',
        mainService: '',
        servicesInclude: '',
        processStepByStep: '',
        additionalServices: '',
        mainCity: '',
        otherCities: '',
        uniqueAspect: '',
        guarantees: '',
        certifications: '',
        civilInsurance: '',
        exampleSite1: '',
        exampleSite2: '',
        exampleSite3: '',
        logoUrl: '',
        logoFileName: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const newClientType = checked 
                ? [...prev.clientType, value] 
                : prev.clientType.filter(item => item !== value);
            return { ...prev, clientType: newClientType };
        });
    };
    
    const handleLogoChange = (e) => {
        if (e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        toast.loading('Guardando tu información...');
        
        let finalData = { ...formData };

        if (logoFile) {
            setIsUploading(true);
            toast.dismiss();
            toast.loading('Subiendo tu logotipo...');
            const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadLogo';
            const formPayload = new FormData();
            formPayload.append('logo', logoFile);
            
            try {
                const response = await fetch(`${functionUrl}?userId=${user.uid}`, {
                    method: 'POST',
                    body: formPayload,
                });

                if (!response.ok) { throw new Error('La subida del logo falló.'); }
                const uploadResponse = await response.json();
                finalData.logoUrl = uploadResponse.fileURL;
                finalData.logoFileName = uploadResponse.fileName;
                toast.dismiss();
                toast.loading('Logotipo subido. Guardando formulario...');
            } catch (error) {
                console.error("Error al subir el logo:", error);
                toast.dismiss();
                toast.error("Error al subir tu logo. Por favor, intenta de nuevo.");
                setIsSaving(false);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                websiteInfo: {
                    ...finalData,
                    lastEdited: serverTimestamp()
                },
                websiteInfoStatus: 'completed'
            });
            toast.dismiss();
            toast.success('¡Información guardada con éxito! Ya casi terminamos.');
        } catch (error) {
            console.error("Error al guardar el formulario:", error);
            toast.dismiss();
            toast.error("Hubo un error al guardar tu información.");
        } finally {
            setIsSaving(false);
        }
    };

    const AccordionSection = ({ sectionNumber, title, children }) => (
        <div className="border-b border-slate-200">
            <h2>
                <button 
                    type="button" 
                    className="flex items-center justify-between w-full p-5 font-medium text-left text-slate-700"
                    onClick={() => setActiveSection(activeSection === sectionNumber ? 0 : sectionNumber)}
                >
                    <span className="text-lg">{title}</span>
                    <svg className={`w-6 h-6 shrink-0 transition-transform ${activeSection === sectionNumber ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
            </h2>
            <div className={`${activeSection === sectionNumber ? '' : 'hidden'}`}>
                <div className="p-5 border-t border-slate-200">
                    {children}
                    <div className="flex justify-between mt-6">
                        {sectionNumber > 1 ? (
                            <button type="button" onClick={() => setActiveSection(sectionNumber - 1)} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300">Anterior</button>
                        ) : <div></div>}
                        {sectionNumber < 7 && (
                            <button type="button" onClick={() => setActiveSection(sectionNumber + 1)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Siguiente</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-slate-50">
             <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">¡Excelente! Un paso más.</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-500">Por favor, completa la siguiente información para que podamos empezar a construir tu sitio web. Puedes tomarte tu tiempo, la información se guardará al final.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <AccordionSection sectionNumber={1} title="Sección 1: Dominio y Logo">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tu dominio</label>
                                <p className="text-xs text-slate-500 mb-2">Tu empresa solo debe tener un dominio. Tener varios dominios puede diluir tus esfuerzos de SEO y causar problemas de contenido duplicado.</p>
                                <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Adjuntar logo</label>
                                <p className="text-xs text-slate-500 mb-2">Adjunta tu logo en formato PNG con fondo transparente, no mayor a 1000px por el lado más largo.</p>
                                <button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-100 text-slate-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Seleccionar Archivo</button>
                                {logoFile && <span className="text-sm text-slate-500 ml-4">{logoFile.name}</span>}
                                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept=".png" className="hidden" />
                            </div>
                        </div>
                    </AccordionSection>
                    
                    <AccordionSection sectionNumber={2} title="Sección 2: Tus Clientes">
                         <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿A qué tipo de clientes atienden? <span className="text-red-500">*</span></label>
                                <div className="space-y-2">
                                    <label className="flex items-center"><input type="checkbox" name="clientType" value="Residencial" onChange={handleCheckboxChange} className="mr-2" /> Residencial</label>
                                    <label className="flex items-center"><input type="checkbox" name="clientType" value="Comercial" onChange={handleCheckboxChange} className="mr-2" /> Comercial</label>
                                    <label className="flex items-center"><input type="checkbox" name="clientType" value="Otro" onChange={handleCheckboxChange} className="mr-2" /> Otro...</label>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿Cuáles son las razones más comunes por las que los clientes potenciales podrían no elegir tu empresa?</label>
                                <input type="text" name="commonReasonsNotToChoose" value={formData.commonReasonsNotToChoose} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection sectionNumber={3} title="Sección 3: Tus Servicios">
                         <div className="space-y-6">
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Cuál es el principal servicio que ofrecen? <span className="text-red-500">*</span></label><input type="text" name="mainService" value={formData.mainService} onChange={handleInputChange} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué incluyen tus servicios? <span className="text-red-500">*</span></label><textarea name="servicesInclude" value={formData.servicesInclude} onChange={handleInputChange} required rows="4" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"></textarea></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">Describe tu proceso paso a paso desde el principio hasta el final. <span className="text-red-500">*</span></label><textarea name="processStepByStep" value={formData.processStepByStep} onChange={handleInputChange} required rows="4" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"></textarea></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">Enumera todos los servicios adicionales que deseas mostrar en tu sitio. <span className="text-red-500">*</span></label><input type="text" name="additionalServices" value={formData.additionalServices} onChange={handleInputChange} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                         </div>
                    </AccordionSection>
                    
                    <AccordionSection sectionNumber={4} title="Sección 4: Áreas de Servicio">
                         <div className="space-y-6">
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Cuál es la ciudad principal donde te gustaría conseguir más negocios? <span className="text-red-500">*</span></label><input type="text" name="mainCity" value={formData.mainCity} onChange={handleInputChange} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">¿A qué otras ciudades prestan servicio? <span className="text-red-500">*</span></label><input type="text" name="otherCities" value={formData.otherCities} onChange={handleInputChange} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                         </div>
                    </AccordionSection>

                    <AccordionSection sectionNumber={5} title="Sección 5: Acerca de tu Negocio">
                         <div className="space-y-6">
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué hace tu negocio único? <span className="text-red-500">*</span></label><input type="text" name="uniqueAspect" value={formData.uniqueAspect} onChange={handleInputChange} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué garantías ofreces a tus clientes? <span className="text-red-500">*</span></label><input type="text" name="guarantees" value={formData.guarantees} onChange={handleInputChange} required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué certificaciones o premios has obtenido?</label><input type="text" name="certifications" value={formData.certifications} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿Tus clientes necesitan saber que tienes seguro de responsabilidad civil? <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center"><input type="radio" name="civilInsurance" value="Sí" onChange={handleInputChange} required className="mr-2" /> Sí</label>
                                    <label className="flex items-center"><input type="radio" name="civilInsurance" value="No" onChange={handleInputChange} required className="mr-2" /> No</label>
                                </div>
                            </div>
                         </div>
                    </AccordionSection>
                    
                    <AccordionSection sectionNumber={6} title="Sección 6: Ejemplos de Sitios">
                         <div className="space-y-6">
                             <p className="text-sm text-slate-500">Ayúdanos a comprender tus preferencias. Esto nos ayudará a crear un sitio que se ajuste a tu visión.</p>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">Sitio 1 – ¿Qué te gusta de este ejemplo?</label><textarea name="exampleSite1" value={formData.exampleSite1} onChange={handleInputChange} rows="3" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"></textarea></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">Sitio 2 – ¿Qué te gusta de este ejemplo?</label><textarea name="exampleSite2" value={formData.exampleSite2} onChange={handleInputChange} rows="3" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"></textarea></div>
                             <div><label className="block text-sm font-bold text-slate-700 mb-2">Sitio 3 – ¿Qué te gusta de este ejemplo?</label><textarea name="exampleSite3" value={formData.exampleSite3} onChange={handleInputChange} rows="3" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"></textarea></div>
                         </div>
                    </AccordionSection>

                     <div className="p-5">
                         <button 
                            type="submit" 
                            disabled={isSaving || isUploading}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar y Finalizar'}
                        </button>
                     </div>
                </form>
            </main>
        </div>
    );
};

// --- COMPONENTE 'SubscriptionWallPage' ELIMINADO ---


const DashboardPage = ({ user, auth, db, addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot, doc, getFunctions, httpsCallable }) => {
    const [changeRequestSent, setChangeRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [subscription, setSubscription] = useState({ status: 'loading' });
    
    // --- LÍNEAS DE 'preferenceId' y 'isCreatingPreference' ELIMINADAS ---
    
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    
    const activeRequestsCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);
    const completedRequestsCount = useMemo(() => requests.filter(r => r.status === 'completed').length, [requests]);

    useEffect(() => {
        const userSubRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userSubRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().subscriptionStatus) {
                // Ahora leemos 'subscriptionStatus' en lugar de 'subscription.status'
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
    
    // Simplificamos la lógica de suscripción
    const isSubscribed = subscription.status === 'active' || user.uid === ADMIN_UID;
    
    if (subscription.status === 'loading') {
        return <div className="flex justify-center items-center min-h-screen">Verificando suscripción...</div>;
    }

    // --- BLOQUE 'if (!isSubscribed)' ELIMINADO ---
    // La lógica de rutas (en el componente App) se encargará de esto.

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
                        <div className="p-6 md:p-8">{changeRequestSent ? ( <div className="flex flex-col items-center justify-center text-center h-96"><div className="bg-green-100 p-4 rounded-full mb-4"><svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><h2 className="text-2xl font-heading font-bold text-slate-900">¡Solicitud Enviada!</h2><p className="mt-2 text-slate-500 max-w-sm">Hemos recibido tu solicitud y nos pondremos en marcha pronto. Te notificaremos cualquier novedad.</p></div>) : ( <> <h2 className="text-xl font-heading font-bold text-slate-900 mb-1">Nueva Solicitud de Cambio</h2> <p className="text-sm text-slate-500 mb-6">Describe el cambio que necesitas para tu página web de la forma más detallada posible.</p>
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
                    <button onClick={() => navigate(-1)} className="text-sm font-bold text-blue-600 hover:underline">← Volver</button>
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
                        {request.fileURL && (
                            <div className="mt-4 pt-4 border-t border-slate-200 text-sm">
                                <p><strong className="text-slate-600">Archivo Adjunto:</strong></p>
                                <a 
                                    href={request.fileURL} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 mt-2 text-blue-600 hover:underline"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    {request.fileName || 'Descargar archivo'}
                                </a>
                            </div>
                        )}
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
                <div className="mb-6">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Panel de Administrador</h1>
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
                        <button onClick={() => setActiveTab('requests')} className={`px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'requests' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Solicitudes ({requests.length})</button>
                        <button onClick={() => setActiveTab('users')} className={`relative px-3 py-2 font-bold text-sm rounded-md ${activeTab === 'users' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                            Todos los Usuarios ({users.length})
                            {pendingUsersCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px]">{pendingUsersCount}</span></span>}
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
                           {!loadingUsers && users.length === 0 && <li className="p-6 text-center text-slate-500">No hay usuarios registrados.</li>}
                           {users.map(u => (
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

const AdminUserDetailPage = ({ db, doc, getDoc, collection, query, where, orderBy, onSnapshot, getFunctions, httpsCallable, updateDoc, serverTimestamp }) => {
    const { userId } = useParams();
    const [userDetail, setUserDetail] = useState(null);
    const [userRequests, setUserRequests] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [websiteInfo, setWebsiteInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const userDocRef = doc(db, "users", userId);
            
            const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserDetail(data);
                    setWebsiteInfo(data.websiteInfo || {});
                } else {
                    setUserDetail(null);
                }
            });

            const requestsQuery = query(collection(db, "requests"), where("userId", "==", userId), orderBy("createdAt", "desc"));
            const unsubscribeRequests = onSnapshot(requestsQuery, (qSnapshot) => {
                setUserRequests(qSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            });

            try {
                const getPaymentHistory = httpsCallable(getFunctions(), 'getPaymentHistory');
                const result = await getPaymentHistory({ userId: userId });
                setPaymentHistory(result.data);
            } catch (error) {
                console.error("Error fetching payment history:", error);
                toast.error("No se pudo cargar el historial de pagos.");
            }
            
            setLoading(false);
            
            return () => {
                unsubscribeUser();
                unsubscribeRequests();
            };
        };

        fetchUserData();
    }, [userId, db, doc, getFunctions, httpsCallable, collection, query, where, orderBy, onSnapshot]);
    
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setWebsiteInfo(prev => ({...prev, [name]: value}));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                websiteInfo: {
                    ...websiteInfo,
                    lastEdited: serverTimestamp()
                }
            });
            toast.dismiss();
            toast.success("Información actualizada con éxito.");
            setIsEditing(false);
        } catch (error) {
            console.error("Error al actualizar la información:", error);
            toast.dismiss();
            toast.error("No se pudieron guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Cargando datos del usuario...</div>;
    if (!userDetail) return <div className="flex justify-center items-center min-h-screen">No se encontró al usuario.</div>;

    const renderWebsiteInfo = () => {
        const fields = [
            { label: 'Dominio', key: 'domain' },
            { label: 'Razones para no elegir', key: 'commonReasonsNotToChoose' },
            { label: 'Servicio Principal', key: 'mainService' },
            { label: 'Servicios Incluyen', key: 'servicesInclude' },
            { label: 'Proceso Paso a Paso', key: 'processStepByStep' },
            { label: 'Servicios Adicionales', key: 'additionalServices' },
            { label: 'Ciudad Principal', key: 'mainCity' },
            { label: 'Otras Ciudades', key: 'otherCities' },
            { label: 'Aspecto Único', key: 'uniqueAspect' },
            { label: 'Garantías', key: 'guarantees' },
            { label: 'Certificaciones', key: 'certifications' },
            { label: 'Seguro Civil', key: 'civilInsurance' },
            { label: 'Ejemplo Sitio 1', key: 'exampleSite1' },
            { label: 'Ejemplo Sitio 2', key: 'exampleSite2' },
            { label: 'Ejemplo Sitio 3', key: 'exampleSite3' },
        ];
        
        const lastEditedDate = websiteInfo?.lastEdited?.seconds ? new Date(websiteInfo.lastEdited.seconds * 1000).toLocaleString('es-CO') : 'N/A';
        
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Información para el Sitio Web</h2>
                        <p className="text-sm text-slate-500">Última edición: {lastEditedDate}</p>
                    </div>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-900">Editar</button>}
                </div>
                
                {Object.keys(websiteInfo).length > 0 ? (
                    <form onSubmit={handleSaveChanges}>
                        <div className="space-y-4">
                            {websiteInfo.logoUrl && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Logotipo</label>
                                    <a href={websiteInfo.logoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{websiteInfo.logoFileName || 'Ver logo'}</a>
                                </div>
                            )}
                            {fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">{field.label}</label>
                                    {isEditing ? (
                                        <textarea 
                                            name={field.key}
                                            value={websiteInfo[field.key] || ''}
                                            onChange={handleInfoChange}
                                            rows={field.key.startsWith('example') || field.key === 'processStepByStep' ? 3 : 1}
                                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-600 p-2 bg-slate-50 rounded">{websiteInfo[field.key] || 'No provisto'}</p>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300">Cancelar</button>
                                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? 'Guardando...' : 'Guardar Cambios'}</button>
                                </div>
                            )}
                        </div>
                    </form>
                ) : <p>El cliente aún no ha completado el formulario de información web.</p>}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <Link to="/admin" className="text-sm font-bold text-blue-600 hover:underline">← Volver al Panel</Link>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                 <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
                    <h1 className="font-heading text-2xl font-bold text-slate-900">{userDetail.displayName}</h1>
                    <p className="text-sm text-slate-500">{userDetail.email}</p>
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                        <h3 className="text-sm font-bold text-slate-600 mb-2">Estado General</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <UserStatusBadge status={userDetail.status} />
                            <StatusBadge status={userDetail.initialPaymentStatus} />
                            {/* 4. Lógica actualizada para leer 'subscriptionStatus' */}
                            {userDetail.subscriptionStatus && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${userDetail.subscriptionStatus === 'active' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'}`}>{userDetail.subscriptionStatus}</span>}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    {renderWebsiteInfo()}
                </div>
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

const MyAccountPage = ({ user, userProfile, auth, updateProfile, db, doc, updateDoc, updatePassword, getFunctions, httpsCallable, onSnapshot }) => {
    const [name, setName] = useState(user.displayName || '');
    const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
    const [phone, setPhone] = useState(userProfile?.phone || '');
    const [nit, setNit] = useState(userProfile?.nit || '');
    const [loading, setLoading] = useState(false);
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    const [subscription, setSubscription] = useState({ status: 'loading' });
    const [isCancelling, setIsCancelling] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        if(userProfile) {
            setCompanyName(userProfile.companyName || '');
            setPhone(userProfile.phone || '');
            setNit(userProfile.nit || '');
        }
    }, [userProfile]);
    
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
        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                const getPaymentHistory = httpsCallable(getFunctions(), 'getPaymentHistory');
                const result = await getPaymentHistory();
                setPaymentHistory(result.data);
            } catch (error) {
                console.error("Error fetching payment history:", error);
                toast.error("No se pudo cargar tu historial de pagos.");
            }
            setLoadingHistory(false);
        };
        fetchHistory();
    }, [getFunctions, httpsCallable]);

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
    
    const handleCancel = async () => {
        if (window.confirm("¿Estás seguro de que deseas cancelar tu suscripción? Perderás el acceso a los cambios ilimitados al final de tu ciclo de facturación.")) {
            setIsCancelling(true);
            try {
                const functions = getFunctions();
                // 5. Esta función la crearemos en el backend
                const cancelWompiSubscription = httpsCallable(functions, 'cancelWompiSubscription');
                await cancelWompiSubscription();
                toast.success("Tu suscripción ha sido cancelada.");
            } catch (error) {
                console.error("Error al cancelar:", error);
                toast.error("Hubo un error al cancelar la suscripción.");
            } finally {
                setIsCancelling(false);
            }
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <Link to="/"><img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" /></Link>
                    <div className="flex items-center gap-4">
                        {user.uid === ADMIN_UID && (
                                <Link to="/admin" className="text-sm font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors">
                                    Panel de Admin
                                </Link>
                        )}
                        <Link to="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Dashboard</Link>
                    </div>
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

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 p-6">Suscripción</h2>
                        <div className="px-6 pb-6">
                            {subscription.status === 'loading' && <p className="text-sm text-slate-500">Cargando estado...</p>}
                            {/* 6. Lógica actualizada para leer 'subscriptionStatus' */}
                            {subscription.status === 'active' && (
                                <>
                                    <p className="text-sm text-slate-600">Tu plan está activo. ¡Gracias por ser parte de Cósmica!</p>
                                    <button 
                                        onClick={handleCancel} 
                                        disabled={isCancelling} 
                                        className="mt-4 bg-red-100 text-red-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                        {isCancelling ? 'Cancelando...' : 'Cancelar Suscripción'}
                                    </button>
                                </>
                            )}
                            {(subscription.status === 'inactive' || subscription.status === 'cancelled') && <p className="text-sm text-slate-600">No tienes una suscripción activa.</p>}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 p-6 border-b border-slate-200">Historial de Pagos</h2>
                        <ul className="divide-y divide-slate-200">
                           {loadingHistory ? <li className="p-6 text-center text-sm text-slate-500">Cargando historial...</li> :
                            paymentHistory.length === 0 ? (
                                <li className="p-6 text-center text-sm text-slate-500">No tienes pagos registrados.</li>
                            ) : (
                                paymentHistory.map(p => (
                                    <li key={p.paymentId} className="p-4 px-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-700">{p.description}</p>
                                                <p className="text-xs text-slate-400 mt-1">{p.date ? new Date(p.date).toLocaleString('es-CO') : ''}</p>
                                            </div>
                                            <p className="font-bold text-slate-800">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(p.amount)}</p>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

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
        const { getStorage } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js');
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);

        setFirebaseServices({ 
            auth: { ...auth, createUserWithEmailAndPassword: (e, p) => createUserWithEmailAndPassword(auth, e, p), signInWithEmailAndPassword: (e, p) => signInWithEmailAndPassword(auth, e, p), signOut: () => signOut(auth), },
            db, 
            storage,
            updateProfile, 
            updatePassword,
            addDoc, 
            collection, 
            serverTimestamp, 
            getFunctions: () => getFunctions(app), 
            httpsCallable,
            query, 
            orderBy, 
            onSnapshot, 
            doc, 
            updateDoc, 
            getDoc, 
            where, 
            setDoc
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
      const location = useLocation();
      const queryParams = new URLSearchParams(location.search);
      const viewAsAdmin = queryParams.get('view');

      return (
        <>
            <Toaster position="bottom-right" />
            
            {(() => {
                if (!user) {
                    // --- INICIO DEL CAMBIO ---
                    // Envolvemos AuthPage en Routes para que useLocation() funcione
                    return (
                        <Routes>
                            {/* /login muestra AuthPage en modo Login */}
                            <Route path="/login" element={<AuthPage {...firebaseServices} />} /> 
                            {/* Cualquier otra ruta (como /) muestra AuthPage en modo Registro */}
                            <Route path="*" element={<AuthPage {...firebaseServices} />} /> 
                        </Routes>
                    );
                    // --- FIN DEL CAMBIO ---
                }

                // --- (INICIO) CAMBIOS EN LÓGICA DE RUTAS ---
                if (user.uid === ADMIN_UID && viewAsAdmin) {
                    // 7. Cambiado 'initial_payment' a 'suscribirse'
                    if (viewAsAdmin === 'suscribirse') { 
                        // 8. Renderiza el nuevo componente 'SubscriptionPage'
                        return <SubscriptionPage 
                                    user={user} 
                                    auth={firebaseServices.auth} 
                                    {...firebaseServices} 
                                />;
                    }
                    if (viewAsAdmin === 'website_form') {
                        return <WebsiteInfoFormPage user={user} {...firebaseServices} />;
                    }
                    // 9. Eliminado el bloque 'subscription_wall'
                }
                                
                if (userProfile === undefined) {
                    return <div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Verificando estado de tu cuenta...</div>;
                }

                if (userProfile === null && user.uid !== ADMIN_UID) {
                    return <ProfileErrorPage auth={firebaseServices.auth} />;
                }

                if(userProfile?.status === 'pending_approval') {
                    return <PendingApprovalPage auth={firebaseServices.auth} />;
                }
                
                // 10. CAMBIO CRÍTICO: Redirige a 'SubscriptionPage' en lugar de 'InitialPaymentPage'
                if (userProfile?.status === 'approved' && userProfile?.initialPaymentStatus !== 'completed' && user.uid !== ADMIN_UID) {
                    return <SubscriptionPage 
                                user={user} 
                                auth={firebaseServices.auth} 
                                {...firebaseServices} 
                            />;
                }

                if (userProfile?.status === 'approved' && userProfile?.initialPaymentStatus === 'completed' && userProfile?.websiteInfoStatus !== 'completed' && user.uid !== ADMIN_UID) {
                    return <WebsiteInfoFormPage user={user} {...firebaseServices} />;
                }

                return (
                    <Routes>
                        <Route path="/" element={<DashboardPage user={user} {...firebaseServices} />} />
                        <Route path="/solicitud/:requestId" element={<RequestDetailPage user={user} {...firebaseServices} />} />
                        <Route path="/cuenta" element={<MyAccountPage user={user} userProfile={userProfile} {...firebaseServices} />} />
                        
                        <Route path="/admin" element={user.uid === ADMIN_UID ? <AdminDashboardPage user={user} {...firebaseServices} /> : <Navigate to="/" />} />
                        <Route path="/admin/user/:userId" element={user.uid === ADMIN_UID ? <AdminUserDetailPage {...firebaseServices} /> : <Navigate to="/" />} />
                        
                        {/* 11. Redirección final por si algo falla */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                );
                // --- (FIN) CAMBIOS EN LÓGICA DE RUTAS ---
            })()}
        </>
      );
  };

  return <AppRoutes />;
}
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateReferralCode } from '../utils/referralUtils';

const AuthPage = ({ auth, updateProfile, db, doc, setDoc, serverTimestamp }) => {
    const location = useLocation();
    const navigate = useNavigate(); // Para cambiar de URL

    // Aquí se define 'isLogin' leyendo la URL.
    const isLogin = location.pathname.startsWith('/login');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCodeInput, setReferralCodeInput] = useState('');
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
                const newReferralCode = generateReferralCode(name);

                await setDoc(userRef, {
                    email: userCredential.user.email,
                    displayName: name,
                    createdAt: serverTimestamp(),
                    status: "approved",
                    initialPaymentStatus: "pending",
                    websiteInfoStatus: "pending",
                    referralCode: newReferralCode,
                    referredBy: referralCodeInput.trim().toUpperCase() || null
                });
            }
        } catch (error) { setError(error.message); } finally { setLoading(false); }
    };

    // Esta función usa 'navigate' en lugar de 'setIsLogin'
    const toggleAuthMode = () => {
        setError(null);
        setMessage('');
        if (isLogin) {
            navigate('/'); // Si estamos en login, ir a registro
        } else {
            navigate('/login'); // Si estamos en registro, ir a login
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen p-4 bg-slate-50 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 to-transparent blur-3xl" />
            <div className="relative w-full max-w-md mx-auto bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 md:p-10 shadow-lg">
                <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-7 w-auto mb-10 mx-auto" />
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
                    {!isLogin && (
                        <div>
                            <label htmlFor="referral" className="block text-sm font-medium text-slate-600 mb-2">Código de Referido (Opcional)</label>
                            <input id="referral" type="text" value={referralCodeInput} onChange={(e) => setReferralCodeInput(e.target.value)} placeholder="Ej: JUAN1234" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                        </div>
                    )}
                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold rounded-lg py-3 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50">{loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}</button>
                    </div>
                </form>
                <p className="text-center text-sm text-slate-500 mt-8">{isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                    {/* El botón ahora llama a toggleAuthMode */}
                    <button onClick={toggleAuthMode} className="font-bold text-blue-600 hover:underline ml-1">
                        {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;

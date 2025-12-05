import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import WithdrawalModal from '../components/WithdrawalModal';

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

const MyAccountPage = ({ user, userProfile, auth, updateProfile, db, doc, updateDoc, updatePassword, getFunctions, httpsCallable, onSnapshot, collection, query, where, addDoc, serverTimestamp }) => {
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

    const [referralCount, setReferralCount] = useState(0);
    const [referralEarnings, setReferralEarnings] = useState(0);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [withdrawalLoading, setWithdrawalLoading] = useState(false);
    const [pendingWithdrawal, setPendingWithdrawal] = useState(null);

    useEffect(() => {
        if (userProfile) {
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

    useEffect(() => {
        if (userProfile?.referralCode) {
            // Check for referrals
            const qReferrals = query(collection(db, "users"), where("referredBy", "==", userProfile.referralCode));
            const unsubscribeReferrals = onSnapshot(qReferrals, (querySnapshot) => {
                const count = querySnapshot.size;
                setReferralCount(count);
                setReferralEarnings(count * 20000);
            });

            // Check for pending withdrawals
            const qWithdrawals = query(
                collection(db, "payouts"),
                where("userId", "==", user.uid),
                where("status", "==", "pending")
            );
            const unsubscribeWithdrawals = onSnapshot(qWithdrawals, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    setPendingWithdrawal(querySnapshot.docs[0].data());
                } else {
                    setPendingWithdrawal(null);
                }
            });

            return () => {
                unsubscribeReferrals();
                unsubscribeWithdrawals();
            };
        }
    }, [userProfile, db, collection, query, where, user.uid]);

    const handleRequestWithdrawal = async (bankDetails) => {
        if (referralEarnings < 50000) {
            toast.error("El monto mínimo de retiro es $50.000 COP");
            return;
        }

        setWithdrawalLoading(true);
        try {
            await addDoc(collection(db, "payouts"), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                amount: referralEarnings,
                status: 'pending',
                createdAt: serverTimestamp(),
                bankDetails: bankDetails
            });
            toast.success("Solicitud de retiro enviada con éxito");
            setIsWithdrawalModalOpen(false);
        } catch (error) {
            console.error("Error requesting withdrawal:", error);
            toast.error("Error al solicitar el retiro");
        } finally {
            setWithdrawalLoading(false);
        }
    };

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

                </div>

                <div className="space-y-8">
                    {userProfile?.role !== 'partner' && (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 p-6">Suscripción</h2>
                            <div className="px-6 pb-6">
                                {subscription.status === 'loading' && <p className="text-sm text-slate-500">Cargando estado...</p>}
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
                    )}

                    {userProfile?.role !== 'partner' && (
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
                    )}

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800">Cuenta Recompensa</h2>
                            <p className="text-sm text-slate-500 mt-1">Gana $20.000 COP mensuales por cada cliente que traigas a Cósmica.</p>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tu Código de Referido</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <span className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                                            {userProfile?.referralCode || "NO DISPONIBLE"}
                                        </span>
                                        {userProfile?.referralCode && (
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(userProfile.referralCode);
                                                    toast.success("Código copiado al portapapeles");
                                                }}
                                                className="p-2 bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Copiar código"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Comparte este código con tus amigos.</p>
                                </div>

                                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Ganancia Mensual Estimada</p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(referralEarnings)}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 mb-4">Basado en {referralCount} cliente{referralCount !== 1 ? 's' : ''} activo{referralCount !== 1 ? 's' : ''}.</p>

                                    {pendingWithdrawal ? (
                                        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold text-center border border-yellow-200">
                                            Retiro Pendiente: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pendingWithdrawal.amount)}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsWithdrawalModalOpen(true)}
                                            disabled={referralEarnings < 50000}
                                            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-sm"
                                        >
                                            {referralEarnings < 50000 ? 'Mínimo $50.000 para retirar' : 'Solicitar Retiro'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <WithdrawalModal
                            isOpen={isWithdrawalModalOpen}
                            onClose={() => setIsWithdrawalModalOpen(false)}
                            onSubmit={handleRequestWithdrawal}
                            loading={withdrawalLoading}
                            amount={referralEarnings}
                        />

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
                </div>
            </main>
        </div>
    );
};

export default MyAccountPage;

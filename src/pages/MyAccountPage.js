import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import WithdrawalModal from '../components/WithdrawalModal';
import DashboardLayout from '../components/layout/DashboardLayout';


const MyAccountPage = ({ user, userProfile, auth, updateProfile, db, doc, updateDoc, updatePassword, getFunctions, httpsCallable, onSnapshot, collection, query, where, addDoc, serverTimestamp }) => {
    const [name, setName] = useState(user.displayName || '');
    const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
    const [phone, setPhone] = useState(userProfile?.phone || '');
    const [nit, setNit] = useState(userProfile?.nit || '');
    const [address, setAddress] = useState(userProfile?.address || '');
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

    // Coupon State
    const [myAccountCoupon, setMyAccountCoupon] = useState('');
    const [validatingMyAccountCoupon, setValidatingMyAccountCoupon] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setCompanyName(userProfile.companyName || '');
            setPhone(userProfile.phone || '');
            setPhone(userProfile.phone || '');
            setNit(userProfile.nit || '');
            setAddress(userProfile.address || '');
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
    }, [userProfile, db, collection, query, where, user.uid, onSnapshot]);

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
                nit: nit,
                address: address
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

    const handleRedeemCoupon = async () => {
        if (!myAccountCoupon) return;
        setValidatingMyAccountCoupon(true);
        try {
            const validate = httpsCallable(getFunctions(), 'validateCoupon');
            const result = await validate({ couponCode: myAccountCoupon });

            if (result.data.valid) {
                if (subscription.status === 'active') {
                    // Si ya tiene suscripción, le decimos que contacte a soporte para aplicarlo
                    toast.success(`Cupón ${result.data.code} válido. Contáctanos para aplicarlo a tu próxima factura.`);
                } else {
                    // Si NO tiene suscripción, redirigimos a la página de pago con el cupón
                    toast.success("Cupón válido. Redirigiendo a suscripción...");
                    setTimeout(() => {
                        window.location.href = `/suscripcion?coupon=${myAccountCoupon}`;
                    }, 1500);
                }
            } else {
                toast.error(result.data.message || 'Cupón inválido');
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al validar cupón");
        } finally {
            setValidatingMyAccountCoupon(false);
        }
    };

    const handleDownloadInvoice = async (paymentId) => {
        const toastId = toast.loading("Generando factura...");
        try {
            const generateInvoice = httpsCallable(getFunctions(), 'generateInvoice');
            const result = await generateInvoice({ paymentId });
            const { pdfBase64, filename } = result.data;

            // Convert Base64 to Blob
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create download link
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            toast.success("Factura descargada", { id: toastId });
        } catch (error) {
            console.error("Error downloading invoice:", error);
            toast.error("Error al generar la factura. Intenta de nuevo.", { id: toastId });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="mb-10">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">Mi Cuenta</h1>
                    <p className="mt-2 text-slate-500">Actualiza los datos de tu perfil y tu contraseña.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800">Datos Personales y de la Empresa</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-2">Dirección de Facturación</label>
                                <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Calle 123 # 45-67, Bogotá" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-5 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>


                {userProfile?.role !== 'partner' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-800">Suscripción</h2>
                        </div>
                        <div className="p-6">
                            {subscription.status === 'loading' && <p className="text-sm text-slate-500">Cargando estado...</p>}
                            {subscription.status === 'active' && (
                                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl p-4">
                                    <div>
                                        <p className="font-bold text-green-800">Suscripción Activa</p>
                                        <p className="text-sm text-green-600 mt-1">Tu plan está activo. ¡Gracias por ser parte de Cósmica!</p>
                                    </div>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCancelling}
                                        className="bg-white text-red-600 border border-red-200 font-bold text-xs px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {isCancelling ? 'Cancelando...' : 'Cancelar'}
                                    </button>
                                </div>
                            )}
                            {(subscription.status === 'inactive' || subscription.status === 'cancelled' || subscription.status === 'canceled') && (
                                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <div>
                                        <p className="font-bold text-slate-700">Suscripción Inactiva</p>
                                        <p className="text-sm text-slate-500 mt-1">Reactiva tu plan para continuar disfrutando de cambios ilimitados.</p>
                                    </div>
                                    <Link
                                        to="/suscripcion"
                                        className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Reactivar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CUPÓN DE DESCUENTO (Visible para todos) */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800">Canjear Cupón</h2>
                        <p className="text-sm text-slate-500 mt-1">Si tienes un código promocional, ingrésalo aquí.</p>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="CÓDIGO"
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 uppercase font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                value={myAccountCoupon}
                                onChange={(e) => setMyAccountCoupon(e.target.value.toUpperCase())}
                            />
                            <button
                                onClick={handleRedeemCoupon}
                                disabled={!myAccountCoupon || validatingMyAccountCoupon}
                                className="bg-slate-900 text-white font-bold px-6 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {validatingMyAccountCoupon ? 'Validando...' : 'Canjear'}
                            </button>
                        </div>
                    </div>
                </div>

                {userProfile?.role !== 'partner' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 p-6 border-b border-slate-200">Historial de Pagos</h2>
                        <ul className="divide-y divide-slate-200">
                            {loadingHistory ? <li className="p-6 text-center text-sm text-slate-500">Cargando historial...</li> :
                                paymentHistory.length === 0 ? (
                                    <li className="p-8 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                        </div>
                                        <p className="text-sm text-slate-500">No tienes pagos registrados.</p>
                                    </li>
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
                                            <div className="mt-2 text-right">
                                                <button
                                                    onClick={() => handleDownloadInvoice(p.paymentId)}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    Descargar Factura
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                )}
                        </ul>
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-800">Cuenta Recompensa</h2>
                            <p className="text-sm text-slate-500 mt-1">Gana $20.000 COP mensuales por cada cliente que traigas a Cósmica.</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800">Cambiar Contraseña</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
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
        </DashboardLayout>
    );
};

export default MyAccountPage;

import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const ReferralsPage = ({ user, db, addDoc, collection, serverTimestamp }) => {
    const [copied, setCopied] = useState(false);
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);

    // Generate a simple referral code from UID or use email
    const referralCode = user.uid ? user.uid.substring(0, 6).toUpperCase() : 'NO DISPONIBLE';

    // Static data for now, matching the screenshot logic
    const activeClients = 0;
    const monthlyEarnings = activeClients * 20000;
    const paymentThreshold = 50000;

    const shareUrl = "https://cosmicaweb.com";
    const shareMessage = `¡Hola! Te recomiendo usar Cósmica para tu sitio web. Gana $20.000 COP mensuales por cada cliente. Usa mi código: ${referralCode} en ${shareUrl}`;

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success("Código copiado al portapapeles");
    };

    const handleWithdraw = async () => {
        setLoadingWithdraw(true);
        toast.loading("Procesando solicitud...");

        try {
            await addDoc(collection(db, "requests"), {
                title: "Solicitud de Retiro de Ganancias",
                description: `El usuario solicita retirar sus ganancias acumuladas de referidos. Monto estimado: $${monthlyEarnings.toLocaleString()}`,
                type: "Retiro",
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                createdAt: serverTimestamp(),
                status: 'pending'
            });
            toast.dismiss();
            toast.success("Solicitud de retiro enviada. Te contactaremos pronto.");
        } catch (error) {
            console.error("Error creating withdraw request:", error);
            toast.dismiss();
            toast.error("Error al procesar la solicitud.");
        } finally {
            setLoadingWithdraw(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Card */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Cuenta Recompensa</h1>
                    <p className="text-slate-600">Gana $20.000 COP mensuales por cada cliente que traigas a Cósmica.</p>

                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                        {/* Referral Code Card */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center">
                            <p className="text-xs font-bold text-blue-600 uppercase mb-3 tracking-wider">Tu código de referido</p>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl font-mono font-bold text-slate-900 tracking-wider">
                                    {referralCode}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Copiar código"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                            <p className="text-sm text-slate-500">Comparte este código con tus amigos.</p>
                        </div>

                        {/* Earnings Card */}
                        <div className="bg-green-50 rounded-xl p-6 border border-green-100 flex flex-col">
                            <p className="text-xs font-bold text-green-700 uppercase mb-3 tracking-wider">Ganancia Mensual Estimada</p>
                            <div className="text-4xl font-bold text-slate-900 mb-2">
                                ${monthlyEarnings.toLocaleString()}
                            </div>
                            <p className="text-sm text-slate-600 mb-6">Basado en {activeClients} clientes activos.</p>

                            <button
                                onClick={handleWithdraw}
                                disabled={monthlyEarnings < paymentThreshold || loadingWithdraw}
                                className={`w-full py-2 px-4 rounded-lg text-sm font-bold transition-colors ${monthlyEarnings >= paymentThreshold
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {loadingWithdraw ? 'Procesando...' : (monthlyEarnings >= paymentThreshold ? 'Solicitar Retiro' : `Mínimo $${paymentThreshold.toLocaleString()} para retirar`)}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Share Actions */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Compartir rápidamente</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <button
                            onClick={() => window.open(whatsappLink, '_blank')}
                            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 group"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            <span className="text-lg">Compartir en WhatsApp</span>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReferralsPage;

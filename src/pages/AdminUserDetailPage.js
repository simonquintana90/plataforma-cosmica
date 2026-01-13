import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatusBadge, UserStatusBadge } from '../components/Badges';

const AdminUserDetailPage = ({ db, doc, getDoc, collection, query, where, orderBy, onSnapshot, getFunctions, httpsCallable, updateDoc, serverTimestamp }) => {
    const { userId } = useParams();
    const [userDetail, setUserDetail] = useState(null);
    const [userRequests, setUserRequests] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [websiteInfo, setWebsiteInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [notifyModalOpen, setNotifyModalOpen] = useState(false);
    const [notifyData, setNotifyData] = useState({ provisionalUrl: '', dnsARecord: '', dnsCnameRecord: '' });
    const [notifyLoading, setNotifyLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserDetail({ id: docSnap.id, ...data });
                // Only set websiteInfo if it's not already being edited to avoid overwriting user input
                if (!isEditing) {
                    setWebsiteInfo(data.websiteInfo || {});
                }
            } else {
                toast.error("Usuario no encontrado");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, userId, doc, onSnapshot, isEditing]);

    const handleCopyPixel = () => {
        const pixelCode = `<img src="https://us-central1-plataforma-cosmica.cloudfunctions.net/trackVisit?userId=${userId}" alt="" style="display:none;" />`;
        navigator.clipboard.writeText(pixelCode);
        toast.success("Pixel copiado al portapapeles");
    };

    const handleNotifyReady = async (e) => {
        e.preventDefault();
        setNotifyLoading(true);
        toast.loading("Enviando notificación...");

        // Construir el string de instrucciones
        let dnsInstructions = '';
        if (notifyData.dnsARecord) {
            dnsInstructions += `Type: A\nName: @\nValue: ${notifyData.dnsARecord}\n\n`;
        }
        if (notifyData.dnsCnameRecord) {
            dnsInstructions += `Type: CNAME\nName: www\nValue: ${notifyData.dnsCnameRecord}`;
        }

        try {
            const notifyUserSiteReady = httpsCallable(getFunctions(), 'notifyUserSiteReady');
            await notifyUserSiteReady({
                userId: userId,
                provisionalUrl: notifyData.provisionalUrl,
                dnsInstructions: dnsInstructions.trim()
            });

            toast.dismiss();
            toast.success("¡Usuario notificado con éxito!");
            setNotifyModalOpen(false);

            // Manually update local state to reflect change immediately without waiting for snapshot
            setUserDetail(prev => ({ ...prev, siteReady: true }));

        } catch (error) {
            console.error("Error sending notification:", error);
            toast.dismiss();
            toast.error("Error al notificar al usuario.");
        } finally {
            setNotifyLoading(false);
        }
    };

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setWebsiteInfo(prev => ({ ...prev, [name]: value }));
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
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {notifyModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900">Notificar Sitio Listo 🚀</h3>
                                    <p className="text-sm text-slate-500 mt-1">Envía las instrucciones finales al cliente.</p>
                                </div>
                                <form onSubmit={handleNotifyReady} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">URL Provisional / Final</label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://cliente.webflow.io"
                                            value={notifyData.provisionalUrl}
                                            onChange={(e) => setNotifyData({ ...notifyData, provisionalUrl: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Registros DNS a configurar</label>
                                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            {/* A Record */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-bold text-slate-600 uppercase">Registro A (@)</label>
                                                    <span className="text-[10px] text-slate-400 font-mono">Type: A | Name: @</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: 76.76.21.21"
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                                                    value={notifyData.dnsARecord || ''}
                                                    onChange={(e) => setNotifyData({ ...notifyData, dnsARecord: e.target.value })}
                                                />
                                            </div>

                                            {/* CNAME Record */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-bold text-slate-600 uppercase">Registro CNAME (www)</label>
                                                    <span className="text-[10px] text-slate-400 font-mono">Type: CNAME | Name: www</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: cname.vercel-dns.com"
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                                                    value={notifyData.dnsCnameRecord || ''}
                                                    onChange={(e) => setNotifyData({ ...notifyData, dnsCnameRecord: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setNotifyModalOpen(false)}
                                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={notifyLoading}
                                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                        >
                                            {notifyLoading ? 'Enviando...' : 'Enviar Notificación'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                            <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCopyPixel}
                                    className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    Copiar Pixel
                                </button>
                                {userDetail.siteReady ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        Sitio Notificado
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setNotifyModalOpen(true)}
                                        className="text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-all shadow-md shadow-slate-900/10 flex items-center gap-2"
                                    >
                                        <span>🚀</span> Notificar Sitio Listo
                                    </button>
                                )}
                                <Link to="/admin" className="text-sm font-bold text-blue-600 hover:underline">← Volver</Link>
                            </div>
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
                </>
            )}
        </div>
    );
};

export default AdminUserDetailPage;

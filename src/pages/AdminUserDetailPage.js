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

export default AdminUserDetailPage;

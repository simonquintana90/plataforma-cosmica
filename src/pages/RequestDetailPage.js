import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

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
                                            {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe tu mensaje..." className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                                <button type="submit" className="bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors">Enviar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RequestDetailPage;

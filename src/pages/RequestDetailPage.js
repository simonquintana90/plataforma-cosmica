import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useFileUpload from '../hooks/useFileUpload';
import { StatusBadge } from '../components/Badges';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

const RequestDetailPage = ({ user, db, doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc }) => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);

    // File Upload State
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const { uploadFile, uploading } = useFileUpload();

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

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // ... inside useEffect for getRequestDetails or similar
    useEffect(() => {
        if (!user || !requestId) return;

        const markAsRead = async () => {
            const docRef = doc(db, "requests", requestId);
            // We don't need to wait for this to finish to show the page
            try {
                if (user.uid === ADMIN_UID) {
                    await updateDoc(docRef, { adminHasUnreadMessages: false });
                } else {
                    await updateDoc(docRef, { userHasUnreadMessages: false });
                }
            } catch (err) {
                console.error("Error marking as read:", err);
            }
        };
        markAsRead();
    }, [requestId, user, db, doc, updateDoc]); // Added updateDoc to props

    // ... inside handleSendMessage
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' && !file) return;

        let uploadedFileData = null;

        if (file) {
            try {
                uploadedFileData = await uploadFile(file, user.uid);
            } catch (error) {
                return;
            }
        }

        const messagesRef = collection(db, "requests", requestId, "messages");
        await addDoc(messagesRef, {
            text: newMessage,
            createdAt: serverTimestamp(),
            senderId: user.uid,
            senderName: user.displayName || 'Usuario',
            ...(uploadedFileData && { fileURL: uploadedFileData.fileURL, fileName: uploadedFileData.fileName })
        });

        // Update unread status for the OTHER party
        const requestRef = doc(db, "requests", requestId);
        try {
            if (user.uid === ADMIN_UID) {
                await updateDoc(requestRef, { userHasUnreadMessages: true });
            } else {
                await updateDoc(requestRef, { adminHasUnreadMessages: true });
            }
        } catch (err) {
            console.error("Error updating unread status:", err);
        }

        setNewMessage('');
        setFile(null);
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
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
                    {/* Sidebar Details */}
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {getInitials(request.userName)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{request.userName}</p>
                                <p className="text-xs text-slate-500">{request.userEmail}</p>
                            </div>
                        </div>
                        <h1 className="font-heading text-xl font-bold text-slate-900 mt-1">{request.title}</h1>
                        <p className="text-sm text-slate-500 mt-2">{request.description}</p>
                        <div className="mt-4 pt-4 border-t border-slate-200 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-600 font-medium">Tipo:</span>
                                <span className="text-slate-800">{request.type}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Estado:</span>
                                <StatusBadge status={request.status} />
                            </div>
                        </div>
                        {request.fileURL && (
                            <div className="mt-4 pt-4 border-t border-slate-200 text-sm">
                                <p className="text-slate-600 font-medium mb-2">Archivo Adjunto Original:</p>
                                <a
                                    href={request.fileURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="bg-white p-1.5 rounded border border-slate-200 group-hover:border-blue-300 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <span className="text-blue-600 font-bold truncate">{request.fileName || 'Descargar archivo'}</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[70vh] overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-heading font-bold text-slate-700">Comentarios</h2>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{messages.length} mensajes</span>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    <p className="text-sm">No hay mensajes aún. ¡Inicia la conversación!</p>
                                </div>
                            )}
                            {messages.map(msg => {
                                const isMe = msg.senderId === user.uid;
                                return (
                                    <div key={msg.id} className={`flex gap-3 my-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${isMe ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            {getInitials(msg.senderName)}
                                        </div>
                                        <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`rounded-2xl px-4 py-3 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                                                {msg.text && <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>}
                                                {msg.fileURL && (
                                                    <div className={`mt-2 ${msg.text ? 'pt-2 border-t ' + (isMe ? 'border-blue-500' : 'border-slate-100') : ''}`}>
                                                        <a href={msg.fileURL} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-xs font-bold ${isMe ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:underline'}`}>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                            {msg.fileName || 'Archivo adjunto'}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1 px-1">
                                                {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : 'Enviando...'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200">
                            {file && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                                    <span className="text-xs font-bold text-blue-700 truncate max-w-xs">{file.name}</span>
                                    <button onClick={() => setFile(null)} className="text-blue-400 hover:text-blue-700"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Adjuntar archivo"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex-1 relative">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        rows="1"
                                        className="w-full bg-slate-100 border border-slate-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading || (newMessage.trim() === '' && !file)}
                                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    {uploading ? (
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RequestDetailPage;

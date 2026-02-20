import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import DashboardLayout from '../components/layout/DashboardLayout';
import rp from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import toast from 'react-hot-toast';

const RecordingsPage = ({ db }) => {
    const { user } = useAuth();
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);

    // Check if the user is simulated from admin panel
    const urlParams = new URLSearchParams(window.location.search);
    const isSimulated = urlParams.get('simulate') === 'true';
    const activeUserId = isSimulated ? urlParams.get('uid') : user.uid;

    const playerRef = useRef(null);
    const replayerInstance = useRef(null);

    useEffect(() => {
        if (!activeUserId) return;
        fetchRecordings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeUserId]);

    const fetchRecordings = async () => {
        setLoading(true);
        try {
            const recordingsRef = collection(db, 'users', activeUserId, 'recordings');
            const q = query(recordingsRef, orderBy('startTime', 'desc'));
            const snapshot = await getDocs(q);

            const recs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setRecordings(recs);
        } catch (error) {
            console.error("Error fetching recordings:", error);
            toast.error("Error al cargar las grabaciones");
        } finally {
            setLoading(false);
        }
    };

    const playRecording = async (session) => {
        setSelectedSession(session);
        setVideoLoading(true);

        // Cleanup previous player if exists
        if (replayerInstance.current) {
            replayerInstance.current.$destroy();
            replayerInstance.current = null;
        }

        try {
            // Fetch all chunks for this session
            const chunksRef = collection(db, 'users', activeUserId, 'recordings', session.id, 'chunks');
            const q = query(chunksRef, orderBy('timestamp', 'asc'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                toast.error("Esta grabación está vacía o corrupta.");
                setVideoLoading(false);
                return;
            }

            // Combine all events from chunks
            let allEvents = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.events && Array.isArray(data.events)) {
                    allEvents = allEvents.concat(data.events);
                }
            });

            if (allEvents.length < 2) {
                toast.error("La grabación es muy corta para reproducir.");
                setVideoLoading(false);
                return;
            }

            // Ensure we wait for the DOM element to render
            setTimeout(() => {
                if (playerRef.current) {
                    playerRef.current.innerHTML = ''; // Clear container
                    replayerInstance.current = new rp({
                        target: playerRef.current,
                        props: {
                            events: allEvents,
                            width: 1024,
                            height: 600,
                            autoPlay: true,
                        }
                    });
                }
                setVideoLoading(false);
            }, 100);

        } catch (error) {
            console.error("Error loading recording chunks:", error);
            toast.error("No se pudo cargar el video.");
            setVideoLoading(false);
        }
    };

    // Helper functions
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Fecha desconocida';
        // Handle Firestore Timestamp
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleString('es-CO', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getDeviceType = (userAgent) => {
        if (!userAgent) return 'Desconocido';
        if (/mobile/i.test(userAgent)) return 'Móvil';
        if (/tablet/i.test(userAgent)) return 'Tablet';
        return 'Computador';
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-3">
                    <span className="text-3xl">🎥</span>
                    Grabaciones de Visitantes
                </h1>
                <p className="text-slate-500 mt-2">Observa cómo los usuarios navegan y usan tus páginas web.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de Grabaciones */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[800px] flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-800">Historial de Sesiones</h2>
                        <button onClick={fetchRecordings} className="text-xs text-blue-600 mt-1 hover:underline">Actualizar lista</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : recordings.length > 0 ? (
                            recordings.map((rec) => (
                                <div
                                    key={rec.id}
                                    onClick={() => playRecording(rec)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSession?.id === rec.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.chunkCount > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {rec.chunkCount > 0 ? 'Completado' : 'En vivo / Corto'}
                                        </span>
                                        <span className="text-xs text-slate-400">{formatDate(rec.startTime)}</span>
                                    </div>
                                    <p className="font-bold text-slate-800 text-sm truncate">{rec.metadata?.url || 'URL Desconocida'}</p>
                                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            {getDeviceType(rec.metadata?.userAgent) === 'Móvil' ? '📱 Móvil' : '💻 PC'}
                                        </span>
                                        <span>Bloques: {rec.chunkCount || 0}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <span className="text-4xl block mb-2">🕵️‍♂️</span>
                                <p className="text-slate-500 text-sm">Aún no hay grabaciones. Asegúrate de instalar tu píxel de seguimiento.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reproductor de Video */}
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-4 border-b border-slate-800 bg-black/50 flex justify-between items-center text-white">
                        <div>
                            <h2 className="font-bold text-sm">
                                {selectedSession ? 'Reproduciendo sesión' : 'Selecciona una sesión'}
                            </h2>
                            {selectedSession && (
                                <p className="text-xs text-slate-400 truncate max-w-md">{selectedSession.metadata?.url}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden p-4">
                        {!selectedSession && !videoLoading && (
                            <div className="text-center text-slate-500">
                                <span className="text-6xl mb-4 block opacity-50">▶️</span>
                                <p>Haz clic en una sesión a la izquierda para reproducirla</p>
                            </div>
                        )}

                        {videoLoading && (
                            <div className="absolute inset-0 z-10 bg-slate-900/80 flex flex-col items-center justify-center text-white">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p>Cargando datos de rebobinado mágico...</p>
                            </div>
                        )}

                        {/* rrweb Player Container */}
                        <div
                            ref={playerRef}
                            className={`w-full flex justify-center ${videoLoading || !selectedSession ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                        >
                            {/* El reproductor se inyectará aquí */}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RecordingsPage;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function AdminEmailPreviewsPage() {
    const { getFunctions, httpsCallable } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState('manos_a_la_obra');
    const [previewHtml, setPreviewHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const functions = getFunctions();

    const fetchPreview = React.useCallback(async (type) => {
        setIsLoading(true);
        setPreviewHtml(''); // Clear previous
        try {
            const getPreview = httpsCallable(functions, 'getNotificationPreview');
            const result = await getPreview({ type });
            if (result.data && result.data.html) {
                setPreviewHtml(result.data.html);
            } else {
                toast.error("No se pudo cargar la previsualización.");
            }
        } catch (error) {
            console.error("Error fetching preview:", error);
            toast.error("Error al cargar la previsualización.");
        } finally {
            setIsLoading(false);
        }
    }, [functions]);

    useEffect(() => {
        fetchPreview(selectedTemplate);
    }, [selectedTemplate, fetchPreview]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Previsualización de Correos</h1>
                        <p className="text-slate-500">Visualiza cómo recibirán los clientes tus notificaciones.</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                        <label htmlFor="template" className="block text-sm font-medium text-slate-700 mb-1">
                            Seleccionar Plantilla
                        </label>
                        <select
                            id="template"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                        >
                            <option value="manos_a_la_obra">👷 Manos a la Obra</option>
                            <option value="reporte_despegue">🚀 Reporte de Despegue</option>
                            <option value="solicitud_resena">⭐ Solicitud de Reseña</option>
                        </select>
                    </div>
                    <div className="pt-6">
                        <button
                            onClick={() => fetchPreview(selectedTemplate)}
                            className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
                        >
                            Recargar
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-mono text-slate-500 uppercase">Vista Previa HTML</span>
                        {isLoading && <span className="text-xs text-indigo-600 font-bold animate-pulse">Cargando...</span>}
                    </div>

                    <div className="flex-1 relative bg-white">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : previewHtml ? (
                            <iframe
                                srcDoc={previewHtml}
                                title="Email Preview"
                                className="w-full h-full min-h-[600px] border-0"
                                sandbox="allow-same-origin"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Selecciona una plantilla para verla.
                            </div>
                        )}
                    </div>
                </div>
                <p className="mt-4 text-center text-xs text-slate-400">
                    * Los datos mostrados (nombres, fechas) son de prueba.
                </p>
            </div>
        </div>
    );
}

export default AdminEmailPreviewsPage;

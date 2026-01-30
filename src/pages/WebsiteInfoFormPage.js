import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
// Removed unused import

const AccordionSection = ({ sectionNumber, title, children, activeSection, setActiveSection }) => (
    <div className="border-b border-slate-200">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-5 font-medium text-left text-slate-700"
                onClick={() => setActiveSection(activeSection === sectionNumber ? 0 : sectionNumber)}
            >
                <span className="text-lg">{title}</span>
                <svg className={`w-6 h-6 shrink-0 transition-transform ${activeSection === sectionNumber ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
        </h2>
        <div className={`${activeSection === sectionNumber ? '' : 'hidden'}`}>
            <div className="p-5 border-t border-slate-200">
                {children}
                <div className="flex justify-between mt-6">
                    {sectionNumber > 1 ? (
                        <button type="button" onClick={() => setActiveSection(sectionNumber - 1)} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300">Anterior</button>
                    ) : <div></div>}
                    {sectionNumber < 5 && (
                        <button type="button" onClick={() => setActiveSection(sectionNumber + 1)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Siguiente</button>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const WebsiteInfoFormPage = ({ user, auth, db, doc, getDoc, updateDoc, serverTimestamp }) => {
    const [activeSection, setActiveSection] = useState(1);
    const [formData, setFormData] = useState({
        domain: '',
        businessName: '',
        // Removed brandColors and tone
        keywords: '',
        clientType: [],
        commonReasonsNotToChoose: '',
        mainService: '',
        servicesInclude: '',
        processStepByStep: '',
        additionalServices: '',
        mainCity: '',
        otherCities: '',
        uniqueAspect: '',
        guarantees: '',
        certifications: '',
        civilInsurance: '',
        logoUrl: '',
        logoFileName: '',
        images: [] // New: Array of URLs/Objects
    });
    const [logoFile, setLogoFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]); // New: File objects for upload
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);
    const imagesInputRef = useRef(null); // New ref for multiple images

    // Load existing data
    useEffect(() => {
        if (user?.uid && db && getDoc) {
            const fetchUserData = async () => {
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userDocRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        if (userData.websiteInfo) {
                            // Merge existing info with default structure
                            setFormData(prev => ({
                                ...prev,
                                ...userData.websiteInfo
                            }));
                        }
                    }
                } catch (e) {
                    console.error("Error loading data", e);
                    toast.error("No se pudo cargar la información existente.");
                }
            };
            fetchUserData();
        }
    }, [user, db, doc, getDoc]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const newClientType = checked
                ? [...prev.clientType, value]
                : prev.clientType.filter(item => item !== value);
            return { ...prev, clientType: newClientType };
        });
    };

    const handleLogoChange = (e) => {
        if (e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    // New Image Handlers
    const handleImagesChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            // Limit check (Total new + existing should be reasonable, e.g. 20)
            const currentCount = (formData.images ? formData.images.length : 0) + imageFiles.length;
            if (currentCount + files.length > 20) {
                toast.error("Máximo 20 imágenes en total.");
                return;
            }

            // Size check (4MB)
            const oversized = files.filter(f => f.size > 4 * 1024 * 1024);
            if (oversized.length > 0) {
                toast.error(`Algunas imágenes pesan más de 4MB: ${oversized.map(f => f.name).join(', ')}`);
                return;
            }

            setImageFiles(prev => [...prev, ...files]);
        }
    };

    const removeImageFile = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (url) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== url)
        }));
    };

    // Load all fonts - Keeping for generic purposes or removing if unused. 
    // Since I removed font selection, I can remove this effect too to save load.
    // useEffect(() => { ... }, []); // REMOVED

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Strict Validation
        const requiredFields = [
            { name: 'businessName', label: 'Nombre de la Empresa' },
            { name: 'domain', label: 'Dominio' },
            { name: 'mainService', label: 'Servicio Principal' },
            { name: 'servicesInclude', label: 'Qué incluyen tus servicios' },
            { name: 'processStepByStep', label: 'Proceso paso a paso' },
            { name: 'mainCity', label: 'Ciudad Principal' },
            { name: 'uniqueAspect', label: 'Qué hace tu negocio único' }
        ];

        const missingFields = requiredFields.filter(field => !formData[field.name]);

        if (missingFields.length > 0) {
            toast.error(`Por favor completa: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        if (formData.clientType.length === 0) {
            toast.error("Por favor selecciona al menos un tipo de cliente.");
            return;
        }

        setIsSaving(true);
        toast.loading('Guardando tu información...');

        let finalData = { ...formData };

        // 1. Upload Logo if exists
        if (logoFile) {
            setIsUploading(true);
            toast.dismiss();
            toast.loading('Subiendo tu logotipo...');
            const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadLogo';
            const formPayload = new FormData();
            formPayload.append('logo', logoFile);

            try {
                const response = await fetch(`${functionUrl}?userId=${user.uid}`, {
                    method: 'POST', body: formPayload,
                });
                if (!response.ok) { throw new Error('La subida del logo falló.'); }
                const uploadResponse = await response.json();
                finalData.logoUrl = uploadResponse.fileURL;
                finalData.logoFileName = uploadResponse.fileName;
            } catch (error) {
                console.error("Error al subir el logo:", error);
                toast.error("Error al subir tu logo.");
                setIsSaving(false); setIsUploading(false); return;
            }
        }

        // 2. Upload Images (Multiple)
        if (imageFiles.length > 0) {
            console.log("Subiendo imágenes adicionales...");
            toast.dismiss();
            toast.loading(`Subiendo ${imageFiles.length} imágenes...`);
            const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadLogo';

            const uploadedImages = [...(finalData.images || [])];

            for (const file of imageFiles) {
                const formPayload = new FormData();
                formPayload.append('file', file);

                try {
                    const response = await fetch(`${functionUrl}?userId=${user.uid}`, {
                        method: 'POST', body: formPayload,
                    });
                    if (response.ok) {
                        const data = await response.json();
                        uploadedImages.push(data.fileURL);
                    }
                } catch (e) { console.error("Error subiendo imagen", e); }
            }
            finalData.images = uploadedImages;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                websiteInfo: {
                    ...finalData,
                    lastEdited: serverTimestamp()
                },
                websiteInfoStatus: 'completed'
            });

            toast.dismiss();
            toast.success('¡Información guardada con éxito!');
            setIsSaving(false);
            setIsUploading(false);
            setImageFiles([]);

            // Redirect or stay? The original code redirected to builder. 
            // Since this is now an editor, maybe we stay or go to profile?
            // "Make it persistently editable". 
            // If they came from profile, they might want to return there.
            // For now, I'll redirect to /cuenta to confirm it's done.
            window.location.href = '/cuenta';

        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error("Hubo un error al guardar tu información.");
            setIsSaving(false);
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">¡Excelente! Un paso más.</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-500">Por favor, completa la siguiente información para que podamos empezar a construir tu sitio web. Puedes tomarte tu tiempo, la información se guardará al final.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <AccordionSection
                        sectionNumber={1}
                        title="Sección 1: Identidad de Marca"
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    >
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Empresa <span className="text-red-500">*</span></label>
                                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Ej: Soluciones Legales S.A.S" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tu dominio <span className="text-red-500">*</span></label>
                                <p className="text-xs text-slate-500 mb-2">Si aún no tienes uno, te recomendamos adquirirlo en proveedores como <strong>GoDaddy</strong> o <strong>Dreamhost</strong>.</p>
                                <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Ej: solucioneslegales.com" />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Fotos para tu Web</label>
                                    <p className="text-xs text-slate-500 mb-2">Sube imágenes de tu trabajo, equipo o local. Máximo 20 imágenes. 4MB por archivo.</p>

                                    <button
                                        type="button"
                                        onClick={() => imagesInputRef.current.click()}
                                        className="bg-blue-50 text-blue-600 font-bold text-sm px-4 py-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2 w-full justify-center border-dashed border-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Agregar Fotos
                                    </button>
                                    <input type="file" ref={imagesInputRef} onChange={handleImagesChange} accept="image/*" multiple className="hidden" />

                                    {/* Selected Files (New) */}
                                    {imageFiles.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {imageFiles.map((file, idx) => (
                                                <div key={idx} className="relative group">
                                                    <div className="h-24 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                                                        <span className="text-xs text-slate-400 p-2 text-center break-all">{file.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeImageFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Existing Images (From DB) */}
                                    {formData.images && formData.images.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-slate-700 mb-2">Fotos Guardadas:</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {formData.images.map((url, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <div className="h-24 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                                            <img src={url} alt={`Foto ${idx}`} className="h-full w-full object-cover" />
                                                        </div>
                                                        <button type="button" onClick={() => removeExistingImage(url)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Adjuntar logo</label>
                                <p className="text-xs text-slate-500 mb-2">Adjunta tu logo en formato PNG con fondo transparente.</p>
                                <button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-100 text-slate-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Seleccionar Archivo</button>
                                {logoFile && <span className="text-sm text-slate-500 ml-4">{logoFile.name}</span>}
                                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept=".png" className="hidden" />
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection
                        sectionNumber={2}
                        title="Sección 2: Tus Clientes"
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    >
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿A qué tipo de clientes atienden? <span className="text-red-500">*</span></label>
                                <div className="space-y-2">
                                    <label className="flex items-center"><input type="checkbox" name="clientType" value="Residencial" onChange={handleCheckboxChange} checked={formData.clientType.includes('Residencial')} className="mr-2" /> Residencial</label>
                                    <label className="flex items-center"><input type="checkbox" name="clientType" value="Comercial" onChange={handleCheckboxChange} checked={formData.clientType.includes('Comercial')} className="mr-2" /> Comercial</label>
                                    <label className="flex items-center"><input type="checkbox" name="clientType" value="Otro" onChange={handleCheckboxChange} checked={formData.clientType.includes('Otro')} className="mr-2" /> Otro...</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿Cuáles son las razones más comunes por las que los clientes potenciales podrían no elegir tu empresa? (Opcional)</label>
                                <input type="text" name="commonReasonsNotToChoose" value={formData.commonReasonsNotToChoose} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection
                        sectionNumber={3}
                        title="Sección 3: Tus Servicios"
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    >
                        <div className="space-y-6">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Cuál es el principal servicio que ofrecen? <span className="text-red-500">*</span></label><input type="text" name="mainService" value={formData.mainService} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Palabras Clave (SEO) <span className="text-blue-500 text-xs font-normal">(Recomendado)</span></label>
                                <p className="text-xs text-slate-500 mb-2">Pega aquí tu lista de palabras clave o escríbelas separadas por comas. La IA las usará para optimizar tu sitio.</p>
                                <textarea name="keywords" value={formData.keywords} onChange={handleInputChange} rows="3" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" placeholder="Ej: limpieza de hogar, limpieza profunda, desinfección..."></textarea>
                            </div>

                            <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué incluyen tus servicios? <span className="text-red-500">*</span></label><textarea name="servicesInclude" value={formData.servicesInclude} onChange={handleInputChange} rows="4" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"></textarea></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Describe tu proceso paso a paso desde el principio hasta el final. <span className="text-red-500">*</span></label><textarea name="processStepByStep" value={formData.processStepByStep} onChange={handleInputChange} rows="4" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5"></textarea></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Enumera todos los servicios adicionales que deseas mostrar en tu sitio. (Opcional)</label><input type="text" name="additionalServices" value={formData.additionalServices} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                        </div>
                    </AccordionSection>

                    <AccordionSection
                        sectionNumber={4}
                        title="Sección 4: Áreas de Servicio"
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    >
                        <div className="space-y-6">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Cuál es la ciudad principal donde te gustaría conseguir más negocios? <span className="text-red-500">*</span></label><input type="text" name="mainCity" value={formData.mainCity} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">¿A qué otras ciudades prestan servicio? <span className="text-red-500">*</span></label><input type="text" name="otherCities" value={formData.otherCities} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                        </div>
                    </AccordionSection>

                    <AccordionSection
                        sectionNumber={5}
                        title="Sección 5: Acerca de tu Negocio"
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    >
                        <div className="space-y-6">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué hace tu negocio único? <span className="text-red-500">*</span></label><input type="text" name="uniqueAspect" value={formData.uniqueAspect} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué garantías ofreces a tus clientes? (Opcional)</label><input type="text" name="guarantees" value={formData.guarantees} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">¿Qué certificaciones o premios has obtenido? (Opcional)</label><input type="text" name="certifications" value={formData.certifications} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5" /></div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿Tus clientes necesitan saber que tienes seguro de responsabilidad civil? <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center"><input type="radio" name="civilInsurance" value="Sí" onChange={handleInputChange} checked={formData.civilInsurance === 'Sí'} className="mr-2" /> Sí</label>
                                    <label className="flex items-center"><input type="radio" name="civilInsurance" value="No" onChange={handleInputChange} checked={formData.civilInsurance === 'No'} className="mr-2" /> No</label>
                                </div>
                            </div>
                        </div>
                    </AccordionSection>

                    <div className="p-5">
                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar y Finalizar'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default WebsiteInfoFormPage;

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { generateWebsiteConfig } from '../utils/aiGenerator';

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
                    {sectionNumber < 7 && (
                        <button type="button" onClick={() => setActiveSection(sectionNumber + 1)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Siguiente</button>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const WebsiteInfoFormPage = ({ user, auth, db, doc, updateDoc, serverTimestamp }) => {
    const [activeSection, setActiveSection] = useState(1);
    const [formData, setFormData] = useState({
        domain: '',
        businessName: '',
        brandColor: '#3B82F6', // Default blue
        fontPairing: 'modern',
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
        logoFileName: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

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

        if (logoFile) {
            setIsUploading(true);
            toast.dismiss();
            toast.loading('Subiendo tu logotipo...');
            const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadLogo';
            const formPayload = new FormData();
            formPayload.append('logo', logoFile);

            try {
                const response = await fetch(`${functionUrl}?userId=${user.uid}`, {
                    method: 'POST',
                    body: formPayload,
                });

                if (!response.ok) { throw new Error('La subida del logo falló.'); }
                const uploadResponse = await response.json();
                finalData.logoUrl = uploadResponse.fileURL;
                finalData.logoFileName = uploadResponse.fileName;
                toast.dismiss();
                toast.loading('Logotipo subido. Guardando formulario...');
            } catch (error) {
                console.error("Error al subir el logo:", error);
                toast.dismiss();
                toast.error("Error al subir tu logo. Por favor, intenta de nuevo.");
                setIsSaving(false);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        try {
            // 1. Generate Website Config based on Form Data
            // We map the form fields to the generator's expected input
            const generatorInput = {
                businessName: finalData.domain || "My Business", // Fallback
                industry: 'general', // We could infer this from clientType or add a field
                description: finalData.mainService + ". " + finalData.uniqueAspect,
                style: 'impact' // Default style for now, or could be randomized/inferred
            };

            const generatedConfig = generateWebsiteConfig(generatorInput);

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                websiteInfo: {
                    ...finalData,
                    lastEdited: serverTimestamp()
                },
                websiteInfoStatus: 'completed',
                websiteConfig: generatedConfig // Save the generated site
            });

            toast.dismiss();
            toast.success('¡Sitio web generado con éxito!');

            // Redirect to the builder
            window.location.href = '/admin/builder';

        } catch (error) {
            console.error("Error al guardar el formulario:", error);
            toast.dismiss();
            toast.error("Hubo un error al guardar tu información.");
        } finally {
            setIsSaving(false);
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
                                <p className="text-xs text-slate-500 mb-2">Tu empresa solo debe tener un dominio.</p>
                                <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Ej: solucioneslegales.com" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Color de Marca</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="brandColor"
                                            value={formData.brandColor}
                                            onChange={handleInputChange}
                                            className="h-10 w-20 rounded cursor-pointer border border-slate-300"
                                        />
                                        <span className="text-sm text-slate-500">{formData.brandColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipografía</label>
                                    <select
                                        name="fontPairing"
                                        value={formData.fontPairing}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="modern">Moderna (Inter)</option>
                                        <option value="elegant">Elegante (Playfair Display)</option>
                                        <option value="bold">Impactante (Oswald)</option>
                                        <option value="friendly">Amigable (Nunito)</option>
                                    </select>
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

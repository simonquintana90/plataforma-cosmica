import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper to define editable fields for each component type
const getComponentSchema = (type) => {
    // Common style overrides
    const styleFields = [
        { key: 'theme.bg', label: 'Color de Fondo', type: 'color' },
        { key: 'theme.text', label: 'Color de Texto', type: 'color' }
    ];

    if (type.includes('Hero')) {
        return [
            { key: 'title', label: 'Título Principal', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            { key: 'ctaText', label: 'Texto Botón Principal', type: 'text' },
            { key: 'secondaryCtaText', label: 'Texto Botón Secundario', type: 'text' },
            { key: 'images', label: 'Imágenes de Fondo', type: 'image-list' },
            ...styleFields
        ];
    }
    if (type.includes('Features') || type.includes('Services') || type.includes('USP')) {
        // Determine the key for the list (features or services)
        const listKey = type.includes('Services') ? 'services' : 'features';
        return [
            { key: 'title', label: 'Título de Sección', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: listKey, label: 'Elementos', type: 'list', itemSchema: [
                    { key: 'title', label: 'Título', type: 'text' },
                    { key: 'description', label: 'Descripción', type: 'textarea' },
                    { key: 'icon', label: 'Icono (SVG Path)', type: 'text' }
                ]
            },
            ...styleFields
        ];
    }
    if (type.includes('Navbar')) {
        return [
            { key: 'logo', label: 'Texto del Logo', type: 'text' },
            { key: 'ctaText', label: 'Texto Botón', type: 'text' },
            ...styleFields
        ];
    }
    if (type.includes('Footer')) {
        return [
            { key: 'businessName', label: 'Nombre Negocio', type: 'text' },
            { key: 'description', label: 'Descripción', type: 'textarea' },
            ...styleFields
        ];
    }

    // Default fallback
    return [
        { key: 'title', label: 'Título', type: 'text' },
        { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        ...styleFields
    ];
};

// ... (inside component)



const VisualEditorSidebar = ({ config, setConfig, selectedSectionId }) => {
    const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'design'
    const [expandedSection, setExpandedSection] = useState(null);

    // Effect to handle external selection (from preview click)
    React.useEffect(() => {
        if (selectedSectionId) {
            setExpandedSection(selectedSectionId);
            setActiveTab('sections');
            // Optional: Scroll to the section in the sidebar
            const element = document.getElementById(`sidebar-section-${selectedSectionId}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedSectionId]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(config.sections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setConfig({ ...config, sections: items });
    };

    const handleContentChange = (sectionId, field, value) => {
        const newSections = config.sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    content: {
                        ...section.content,
                        [field]: value
                    }
                };
            }
            return section;
        });
        setConfig({ ...config, sections: newSections });
    };

    const handleThemeChange = (field, value) => {
        setConfig({
            ...config,
            theme: {
                ...config.theme,
                [field]: value
            }
        });
    };

    const handleImageUpload = (e, sectionId, field, index = null) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            if (index !== null) {
                // Update specific item in a list (e.g., image-list)
                const newUrls = [...(config.sections.find(s => s.id === sectionId).content[field] || [])];
                newUrls[index] = dataUrl;
                handleContentChange(sectionId, field, newUrls);
            } else {
                // Update single field
                handleContentChange(sectionId, field, dataUrl);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200 w-80 shadow-xl z-20">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('sections')}
                    className={`flex-1 py-4 text-sm font-bold ${activeTab === 'sections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Secciones
                </button>
                <button
                    onClick={() => setActiveTab('design')}
                    className={`flex-1 py-4 text-sm font-bold ${activeTab === 'design' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Diseño Global
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'sections' ? (
                    <>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="sections">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {config.sections.map((section, index) => (
                                            <Draggable key={section.id} draggableId={section.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        id={`sidebar-section-${section.id}`}
                                                        className={`bg-white border transition-all ${expandedSection === section.id ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'} rounded-lg`}
                                                    >
                                                        {/* Section Header */}
                                                        <div
                                                            className="flex items-center justify-between p-3 cursor-pointer bg-slate-50 rounded-t-lg"
                                                            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-700 capitalize">{section.id}</span>
                                                                <span className="text-xs text-slate-400">({section.type})</span>
                                                            </div>
                                                            <div className="text-slate-400">
                                                                {expandedSection === section.id ? (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Section Editor (Expanded) */}
                                                        {expandedSection === section.id && (
                                                            <div className="p-3 border-t border-slate-100 space-y-3">
                                                                {/* Style Selector */}
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Estilo de Sección</label>
                                                                    <select
                                                                        value={section.type}
                                                                        onChange={(e) => {
                                                                            const newType = e.target.value;
                                                                            const newSections = config.sections.map(s => s.id === section.id ? { ...s, type: newType } : s);
                                                                            setConfig({ ...config, sections: newSections });
                                                                        }}
                                                                        className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    >
                                                                        {['Impact', 'Cinematic', 'Capture', 'Elegant'].map(style => {
                                                                            // Construct the type name based on the section category (e.g., HeroImpact, HeroCinematic)
                                                                            const category = section.type.replace(/Impact|Cinematic|Capture|Elegant/g, '');
                                                                            const typeName = `${category}${style}`;
                                                                            return <option key={style} value={typeName}>{style}</option>;
                                                                        })}
                                                                    </select>
                                                                </div>

                                                                {getComponentSchema(section.type).map((field) => (
                                                                    <div key={field.key}>
                                                                        <label className="block text-xs font-bold text-slate-500 mb-1">{field.label}</label>
                                                                        {field.type === 'textarea' ? (
                                                                            <textarea
                                                                                value={section.content[field.key] || ''}
                                                                                onChange={(e) => handleContentChange(section.id, field.key, e.target.value)}
                                                                                rows={3}
                                                                                className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                            />
                                                                        ) : field.type === 'list' ? (
                                                                            <div className="space-y-2">
                                                                                {(section.content[field.key] || []).map((item, i) => (
                                                                                    <div key={i} className="flex gap-2 items-start border p-2 rounded bg-slate-50">
                                                                                        <div className="flex-1 space-y-1">
                                                                                            <input
                                                                                                type="text"
                                                                                                placeholder="Título"
                                                                                                value={item.title || ''}
                                                                                                onChange={(e) => {
                                                                                                    const newItems = [...(section.content[field.key] || [])];
                                                                                                    newItems[i] = { ...item, title: e.target.value };
                                                                                                    handleContentChange(section.id, field.key, newItems);
                                                                                                }}
                                                                                                className="w-full text-xs border border-slate-200 rounded p-1"
                                                                                            />
                                                                                            <textarea
                                                                                                placeholder="Descripción"
                                                                                                value={item.description || ''}
                                                                                                onChange={(e) => {
                                                                                                    const newItems = [...(section.content[field.key] || [])];
                                                                                                    newItems[i] = { ...item, description: e.target.value };
                                                                                                    handleContentChange(section.id, field.key, newItems);
                                                                                                }}
                                                                                                rows={2}
                                                                                                className="w-full text-xs border border-slate-200 rounded p-1"
                                                                                            />
                                                                                        </div>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const newItems = [...(section.content[field.key] || [])];
                                                                                                newItems.splice(i, 1);
                                                                                                handleContentChange(section.id, field.key, newItems);
                                                                                            }}
                                                                                            className="text-red-400 hover:text-red-600"
                                                                                        >
                                                                                            ×
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newItems = [...(section.content[field.key] || []), { title: 'Nuevo Item', description: 'Descripción...' }];
                                                                                        handleContentChange(section.id, field.key, newItems);
                                                                                    }}
                                                                                    className="text-xs text-blue-600 font-bold hover:underline"
                                                                                >
                                                                                    + Agregar Item
                                                                                </button>
                                                                            </div>
                                                                        ) : field.type === 'image-list' ? (
                                                                            <div className="space-y-2">
                                                                                {(section.content[field.key] || []).map((url, i) => (
                                                                                    <div key={i} className="flex flex-col gap-2 border p-2 rounded bg-slate-50">
                                                                                        <div className="flex gap-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={url}
                                                                                                onChange={(e) => {
                                                                                                    const newUrls = [...(section.content[field.key] || [])];
                                                                                                    newUrls[i] = e.target.value;
                                                                                                    handleContentChange(section.id, field.key, newUrls);
                                                                                                }}
                                                                                                className="flex-1 text-xs border border-slate-200 rounded p-1"
                                                                                                placeholder="URL de la imagen"
                                                                                            />
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const newUrls = [...(section.content[field.key] || [])];
                                                                                                    newUrls.splice(i, 1);
                                                                                                    handleContentChange(section.id, field.key, newUrls);
                                                                                                }}
                                                                                                className="text-red-400 hover:text-red-600"
                                                                                            >
                                                                                                ×
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <label className="flex-1 cursor-pointer bg-white border border-slate-200 text-slate-500 text-xs py-1 px-2 rounded hover:bg-slate-50 text-center">
                                                                                                <span>Subir Imagen</span>
                                                                                                <input
                                                                                                    type="file"
                                                                                                    accept="image/*"
                                                                                                    className="hidden"
                                                                                                    onChange={(e) => handleImageUpload(e, section.id, field.key, i)}
                                                                                                />
                                                                                            </label>
                                                                                            {url && url.startsWith('data:') && (
                                                                                                <span className="text-[10px] text-green-600 font-bold">Subida</span>
                                                                                            )}
                                                                                        </div>
                                                                                        {url && (
                                                                                            <img src={url} alt="Preview" className="w-full h-20 object-cover rounded border border-slate-200" />
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newUrls = [...(section.content[field.key] || []), 'https://source.unsplash.com/random/800x600'];
                                                                                        handleContentChange(section.id, field.key, newUrls);
                                                                                    }}
                                                                                    className="text-xs text-blue-600 font-bold hover:underline"
                                                                                >
                                                                                    + Agregar Imagen
                                                                                </button>
                                                                            </div>
                                                                        ) : field.type === 'color' ? (
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="color"
                                                                                    value={field.key.includes('theme') ? (section.content.theme?.[field.key.split('.')[1]] || '#ffffff') : (section.content[field.key] || '#ffffff')}
                                                                                    onChange={(e) => {
                                                                                        if (field.key.includes('theme')) {
                                                                                            const themeKey = field.key.split('.')[1];
                                                                                            const newTheme = { ...(section.content.theme || {}), [themeKey]: e.target.value };
                                                                                            handleContentChange(section.id, 'theme', newTheme);
                                                                                        } else {
                                                                                            handleContentChange(section.id, field.key, e.target.value);
                                                                                        }
                                                                                    }}
                                                                                    className="h-8 w-8 rounded cursor-pointer border-0"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={field.key.includes('theme') ? (section.content.theme?.[field.key.split('.')[1]] || '') : (section.content[field.key] || '')}
                                                                                    onChange={(e) => {
                                                                                        if (field.key.includes('theme')) {
                                                                                            const themeKey = field.key.split('.')[1];
                                                                                            const newTheme = { ...(section.content.theme || {}), [themeKey]: e.target.value };
                                                                                            handleContentChange(section.id, 'theme', newTheme);
                                                                                        } else {
                                                                                            handleContentChange(section.id, field.key, e.target.value);
                                                                                        }
                                                                                    }}
                                                                                    className="flex-1 text-xs border border-slate-200 rounded p-1"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <input
                                                                                type="text"
                                                                                value={section.content[field.key] || ''}
                                                                                onChange={(e) => handleContentChange(section.id, field.key, e.target.value)}
                                                                                className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {/* Delete Section Button */}
                                                                <div className="pt-4 border-t border-slate-100">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm('¿Estás seguro de eliminar esta sección?')) {
                                                                                const newSections = config.sections.filter(s => s.id !== section.id);
                                                                                setConfig({ ...config, sections: newSections });
                                                                            }
                                                                        }}
                                                                        className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                    >
                                                                        Eliminar Sección
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {/* Add Section UI */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Agregar Nueva Sección</h3>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <select id="new-section-type" className="text-xs border border-slate-200 rounded p-2">
                                    <option value="Hero">Hero</option>
                                    <option value="Features">Características</option>
                                    <option value="Services">Servicios</option>
                                    <option value="Gallery">Galería</option>
                                    <option value="CTA">Llamada a la Acción</option>
                                    <option value="Footer">Footer</option>
                                </select>
                                <select id="new-section-style" className="text-xs border border-slate-200 rounded p-2">
                                    <option value="Impact">Impact</option>
                                    <option value="Cinematic">Cinematic</option>
                                    <option value="Capture">Capture</option>
                                    <option value="Elegant">Elegant</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    const type = document.getElementById('new-section-type').value;
                                    const style = document.getElementById('new-section-style').value;
                                    const componentType = `${type}${style}`;

                                    const newSection = {
                                        id: `${type.toLowerCase()}-${Date.now()}`,
                                        type: componentType,
                                        content: {
                                            title: `Nuevo ${type}`,
                                            subtitle: 'Descripción de la nueva sección.',
                                            // Default content based on type
                                            ...(type === 'Services' || type === 'Features' ? {
                                                [type.toLowerCase()]: [
                                                    { title: 'Item 1', description: 'Descripción...', icon: '' },
                                                    { title: 'Item 2', description: 'Descripción...', icon: '' },
                                                    { title: 'Item 3', description: 'Descripción...', icon: '' }
                                                ]
                                            } : {}),
                                            ...(type === 'Hero' ? { ctaText: 'Empezar', secondaryCtaText: 'Saber más' } : {}),
                                            ...(type === 'Navbar' ? { links: [{ name: 'Inicio', href: '#' }] } : {})
                                        }
                                    };
                                    setConfig({ ...config, sections: [...config.sections, newSection] });
                                }}
                                className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-lg border-2 border-dashed border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Agregar {activeTab === 'sections' ? '' : 'Sección'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* Global Design Controls */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Color Primario</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={config.theme.primary}
                                    onChange={(e) => handleThemeChange('primary', e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={config.theme.primary}
                                    onChange={(e) => handleThemeChange('primary', e.target.value)}
                                    className="flex-1 text-sm border border-slate-200 rounded px-3"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Color Secundario</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={config.theme.secondary}
                                    onChange={(e) => handleThemeChange('secondary', e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={config.theme.secondary}
                                    onChange={(e) => handleThemeChange('secondary', e.target.value)}
                                    className="flex-1 text-sm border border-slate-200 rounded px-3"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualEditorSidebar;

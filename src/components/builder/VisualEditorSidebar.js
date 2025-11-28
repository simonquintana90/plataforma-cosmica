import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper to define editable fields for each component type
const getComponentSchema = (type) => {
    // Default schema for unknown types
    const defaultSchema = [
        { key: 'title', label: 'Título', type: 'text' },
        { key: 'subtitle', label: 'Subtítulo', type: 'textarea' }
    ];

    if (type.includes('Hero')) {
        return [
            { key: 'title', label: 'Título Principal', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            { key: 'ctaText', label: 'Texto Botón Principal', type: 'text' },
            { key: 'secondaryCtaText', label: 'Texto Botón Secundario', type: 'text' }
        ];
    }
    if (type.includes('Features') || type.includes('Services')) {
        return [
            { key: 'title', label: 'Título de Sección', type: 'text' },
            { key: 'description', label: 'Descripción', type: 'textarea' },
            // Complex list editing would go here (future)
        ];
    }
    if (type.includes('Navbar')) {
        return [
            { key: 'logo', label: 'Texto del Logo', type: 'text' },
            { key: 'ctaText', label: 'Texto Botón', type: 'text' }
        ];
    }
    return defaultSchema;
};

const VisualEditorSidebar = ({ config, setConfig }) => {
    const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'design'
    const [expandedSection, setExpandedSection] = useState(null);

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
                                                    className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
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

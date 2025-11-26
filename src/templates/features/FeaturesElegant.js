import React from 'react';

const FeaturesElegant = ({
    title = "Un enfoque holístico para tu bienestar.",
    features = [
        { title: 'Terapia Individual', description: 'Sesiones uno a uno enfocadas en tus necesidades personales y crecimiento.' },
        { title: 'Talleres Grupales', description: 'Espacios compartidos para aprender y sanar en comunidad.' },
        { title: 'Recursos Online', description: 'Acceso 24/7 a meditaciones guiadas y material de lectura.' },
        { title: 'Retiros', description: 'Experiencias inmersivas de fin de semana para desconectar y reconectar.' },
    ]
}) => {
    return (
        <div className="py-24 bg-[#FFFBF0] text-slate-900 font-serif">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <h2 className="text-3xl md:text-5xl leading-tight">
                        {title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col border-t border-slate-200 pt-8">
                            <span className="text-xs font-sans font-bold tracking-widest text-slate-400 mb-4">0{index + 1}</span>
                            <h3 className="text-2xl mb-4 italic">{feature.title}</h3>
                            <p className="text-slate-600 font-sans leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesElegant;

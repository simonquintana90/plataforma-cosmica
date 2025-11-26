import React from 'react';

const InfoImpact = ({
    title = "Construyendo el futuro juntos",
    description = "Nuestra metodología se basa en la colaboración estrecha. Trabajamos contigo para entender tus desafíos y convertir obstáculos en oportunidades de crecimiento sostenible.",
    image = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    reverse = false,
    theme = { bg: 'white', text: 'slate-900', accent: 'indigo-600' }
}) => {
    return (
        <div className={`py-24 bg-${theme.bg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
                    <div className="flex-1 w-full">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <img src={image} alt="Info" className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-${theme.accent} opacity-10`}></div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <h2 className={`text-3xl md:text-4xl font-bold text-${theme.text} leading-tight`}>
                            {title}
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {description}
                        </p>
                        <ul className="space-y-4 pt-4">
                            {['Enfoque centrado en el cliente', 'Resultados medibles', 'Innovación constante'].map((item, i) => (
                                <li key={i} className="flex items-center text-slate-700 font-medium">
                                    <div className={`w-6 h-6 rounded-full bg-${theme.accent} bg-opacity-10 flex items-center justify-center mr-3 text-${theme.accent}`}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoImpact;

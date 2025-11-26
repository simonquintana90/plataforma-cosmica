import React from 'react';

const InfoSimple = ({
    title = "¿Por qué somos diferentes?",
    description = "No solo entregamos un servicio, construimos una relación a largo plazo basada en la confianza y los resultados tangibles. Nuestro enfoque se centra en entender tus necesidades únicas.",
    stats = [
        { value: '98%', label: 'Satisfacción' },
        { value: '24/7', label: 'Soporte' },
        { value: '100+', label: 'Proyectos' }
    ],
    theme = { bg: 'slate-900', text: 'white', accent: 'indigo-500' }
}) => {
    return (
        <div className={`py-20 bg-${theme.bg} text-${theme.text}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                            {title}
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            {description}
                        </p>
                        <button className={`px-8 py-3 bg-${theme.accent} text-white rounded-lg font-bold hover:opacity-90 transition-opacity`}>
                            Conoce más sobre nosotros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl text-center">
                                <p className={`text-4xl font-bold text-${theme.accent} mb-2`}>{stat.value}</p>
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoSimple;

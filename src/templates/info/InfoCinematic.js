import React from 'react';

const InfoCinematic = ({
    title = "Nuestros números hablan por sí mismos",
    stats = [
        { value: '500+', label: 'Proyectos Completados', description: 'En más de 10 industrias diferentes.' },
        { value: '98%', label: 'Retención de Clientes', description: 'Construimos relaciones a largo plazo.' },
        { value: '10M+', label: 'Usuarios Impactados', description: 'A través de nuestras soluciones digitales.' },
        { value: '15', label: 'Premios Ganados', description: 'Reconocimiento a la excelencia y calidad.' }
    ],
    theme = { bg: 'slate-900', text: 'white', accent: 'blue-500' }
}) => {
    return (
        <div className={`py-24 bg-${theme.bg} text-${theme.text}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center group">
                            <p className={`text-5xl font-extrabold text-${theme.accent} mb-4 group-hover:scale-110 transition-transform`}>
                                {stat.value}
                            </p>
                            <h3 className="text-xl font-bold mb-2">{stat.label}</h3>
                            <p className="text-slate-400 text-sm">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InfoCinematic;

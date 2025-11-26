import React from 'react';

const ServicesCinematic = ({
    title = "Capacidades del Sistema",
    subtitle = "Potencia tu infraestructura con tecnología de vanguardia.",
    services = [
        {
            title: 'Ciberseguridad',
            description: 'Protección avanzada contra amenazas en tiempo real con IA.',
            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
        },
        {
            title: 'Cloud Computing',
            description: 'Escalabilidad infinita y despliegue global instantáneo.',
            icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'
        },
        {
            title: 'Big Data Analytics',
            description: 'Procesamiento masivo de datos para insights accionables.',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        }
    ],
    theme = { bg: 'slate-900', text: 'white', accent: 'cyan-400' }
}) => {
    return (
        <div className={`py-24 bg-${theme.bg} text-${theme.text}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        {title}
                    </h2>
                    <p className="max-w-2xl mx-auto text-xl text-slate-400 font-light tracking-wide">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="relative group p-1 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 hover:from-blue-500 hover:to-cyan-500 transition-all duration-500">
                            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                            <div className="relative h-full bg-slate-800 rounded-xl p-8 flex flex-col items-center text-center border border-slate-700 group-hover:border-transparent transition-colors">
                                <div className={`w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6 text-${theme.accent} shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform duration-300`}>
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={service.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors">{service.title}</h3>
                                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                    {service.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServicesCinematic;

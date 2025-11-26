import React from 'react';

const FeaturesCinematic = ({
    title = "Tecnología Avanzada",
    subtitle = "Herramientas de última generación para un rendimiento superior.",
    features = [
        { title: 'Análisis en Tiempo Real', description: 'Monitoreo constante de datos para decisiones instantáneas.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'Seguridad Biométrica', description: 'Protección de grado militar para tus activos digitales.', icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8m0 0a8 8 0 00-8 8c0 2.472.345 4.865.99 7.131M8 8a8 8 0 0016 0c0-2.472-.345-4.865-.99-7.131M16 12V6m0 0L8 6m8 0zm-8 0v6' },
        { title: 'Automatización IA', description: 'Algoritmos inteligentes que optimizan tus procesos.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ]
}) => {
    return (
        <div className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-slate-800 pb-8">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            {title}
                        </h2>
                    </div>
                    <p className="mt-4 md:mt-0 text-slate-400 max-w-md text-lg">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group relative p-1">
                            {/* Glowing Border Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                            <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:bg-slate-800 transition-colors">
                                {/* Icon Container - Glassmorphism Style */}
                                <div className="w-14 h-14 rounded-xl bg-slate-700/30 border border-slate-600/50 flex items-center justify-center mb-6 text-blue-400 shadow-lg group-hover:bg-slate-700/50 group-hover:border-blue-500/30 transition-all duration-300">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={feature.icon} />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesCinematic;

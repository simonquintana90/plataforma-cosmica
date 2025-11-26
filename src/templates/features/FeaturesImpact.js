import React from 'react';

const FeaturesImpact = ({
    title = "Nuestros Servicios",
    subtitle = "Soluciones integrales diseñadas para impulsar el crecimiento de tu negocio.",
    features = [
        { title: 'Estrategia Digital', description: 'Desarrollamos planes de acción personalizados para alcanzar tus metas comerciales.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'Desarrollo Web', description: 'Sitios web rápidos, seguros y optimizados para convertir visitantes en clientes.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
        { title: 'Marketing Online', description: 'Campañas efectivas en redes sociales y buscadores para aumentar tu visibilidad.', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
    ],
    theme = { primary: 'indigo-600', bg: 'white' }
}) => {
    return (
        <div className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className={`text-${theme.primary} font-bold tracking-wide uppercase text-sm mb-2`}>Lo que hacemos</h2>
                    <p className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        {title}
                    </p>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${theme.primary} opacity-5 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform`}></div>

                            <div className={`w-14 h-14 rounded-2xl bg-${theme.primary} bg-opacity-10 flex items-center justify-center mb-6 text-${theme.primary}`}>
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesImpact;

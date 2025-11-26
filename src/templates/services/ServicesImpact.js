import React from 'react';

const ServicesImpact = ({
    title = "Nuestros Servicios",
    subtitle = "Soluciones diseñadas para cada etapa de tu crecimiento.",
    services = [
        {
            title: 'Diseño UX/UI',
            description: 'Creamos experiencias de usuario intuitivas y atractivas que retienen a tus clientes.',
            icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
        },
        {
            title: 'Desarrollo Frontend',
            description: 'Implementamos interfaces modernas con las últimas tecnologías web.',
            icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
        },
        {
            title: 'Backend & API',
            description: 'Arquitecturas robustas y escalables para soportar tu lógica de negocio.',
            icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01'
        },
        {
            title: 'DevOps & Cloud',
            description: 'Infraestructura automatizada y segura en la nube.',
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
        },
        {
            title: 'Consultoría',
            description: 'Asesoramiento experto para optimizar tus procesos digitales.',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            title: 'Soporte 24/7',
            description: 'Estamos siempre disponibles para resolver cualquier incidencia.',
            icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
        }
    ],
    theme = { primary: 'indigo-600', bg: 'slate-50' }
}) => {
    return (
        <div className={`py-24 bg-${theme.bg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500">{subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
                            <div className={`w-12 h-12 rounded-lg bg-${theme.primary} bg-opacity-10 flex items-center justify-center mb-6 text-${theme.primary} group-hover:scale-110 transition-transform`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={service.icon} />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServicesImpact;

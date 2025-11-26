import React from 'react';

const ServicesCapture = ({
    title = "Nuestras Soluciones",
    subtitle = "Descubre cómo podemos ayudarte a escalar tu negocio.",
    services = [
        {
            title: 'Consultoría Estratégica',
            description: 'Analizamos tu modelo de negocio para identificar oportunidades de crecimiento y optimización. Nuestro equipo de expertos te guiará en cada paso.',
            image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
            title: 'Transformación Digital',
            description: 'Implementamos tecnologías de vanguardia para modernizar tus procesos y mejorar la experiencia de tus clientes.',
            image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        {
            title: 'Marketing de Resultados',
            description: 'Campañas enfocadas en el ROI. Utilizamos datos para maximizar tu inversión publicitaria y atraer leads cualificados.',
            image: 'https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
    ],
    theme = { primary: 'indigo-600', bg: 'white' }
}) => {
    return (
        <div className={`py-24 bg-${theme.bg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className={`text-${theme.primary} font-bold tracking-wide uppercase text-sm mb-2`}>Servicios</h2>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{title}</h3>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500">{subtitle}</p>
                </div>

                <div className="space-y-24">
                    {services.map((service, index) => (
                        <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                            <div className="flex-1 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-6">
                                <div className={`w-12 h-1 bg-${theme.primary}`}></div>
                                <h4 className="text-3xl font-bold text-slate-900">{service.title}</h4>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {service.description}
                                </p>
                                <ul className="space-y-3">
                                    {['Análisis detallado', 'Implementación ágil', 'Soporte continuo'].map((item, i) => (
                                        <li key={i} className="flex items-center text-slate-700">
                                            <svg className={`w-5 h-5 text-${theme.primary} mr-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServicesCapture;

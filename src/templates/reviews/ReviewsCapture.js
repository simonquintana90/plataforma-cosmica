import React from 'react';

const ReviewsCapture = ({
    title = "Historias de Éxito",
    reviews = [
        {
            name: 'Ana García',
            role: 'CEO, TechStart',
            content: 'Increíble servicio. Transformaron nuestra presencia digital por completo. Altamente recomendados.',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Carlos Rodríguez',
            role: 'Director de Marketing',
            content: 'El equipo es muy profesional y atento. Los resultados superaron nuestras expectativas.',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Laura Martínez',
            role: 'Fundadora, GreenLife',
            content: 'Gracias a su estrategia, nuestras ventas aumentaron un 200% en solo 3 meses. No podríamos estar más felices.',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'David Kim',
            role: 'CTO, FutureLabs',
            content: 'La calidad del código y la atención al detalle son excepcionales. Un partner tecnológico de primer nivel.',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Elena Torres',
            role: 'Gerente, RetailPro',
            content: 'Eficiencia y creatividad en su máxima expresión. Cumplieron con los plazos y el presupuesto.',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Miguel Ángel',
            role: 'Dueño, Café Central',
            content: 'Desde que lanzamos la nueva web, las reservas se han duplicado. ¡Gracias equipo!',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        }
    ]
}) => {
    return (
        <div className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">{title}</h2>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="break-inside-avoid bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="text-yellow-400 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed mb-6">"{review.content}"</p>
                            <div className="flex items-center pt-4 border-t border-slate-100">
                                <img src={review.image} alt={review.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                                    <p className="text-xs text-slate-500">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewsCapture;

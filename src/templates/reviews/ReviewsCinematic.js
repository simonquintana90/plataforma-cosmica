import React from 'react';

const ReviewsCinematic = ({
    title = "Client Feedback",
    reviews = [
        {
            name: 'Alex Chen',
            role: 'DevOps Lead',
            content: 'La arquitectura escalable que implementaron nos permitió manejar 10x tráfico sin latencia.',
            rating: 5
        },
        {
            name: 'Sarah Jones',
            role: 'Product Owner',
            content: 'Interfaz futurista y UX impecable. Nuestros usuarios están encantados con la nueva plataforma.',
            rating: 5
        },
        {
            name: 'Mike Ross',
            role: 'CTO',
            content: 'Código limpio, seguro y eficiente. Superaron nuestros estándares de calidad.',
            rating: 5
        }
    ],
    theme = { bg: 'slate-900', text: 'white', accent: 'blue-500' }
}) => {
    return (
        <div className={`py-24 bg-${theme.bg} text-${theme.text}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-16 text-center tracking-tight">
                    <span className={`text-${theme.accent}`}>System</span> Logs
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-slate-800/50 border border-slate-700 p-8 rounded-lg backdrop-blur-sm hover:border-blue-500/50 transition-colors">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex space-x-1">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full bg-${theme.accent}`}></div>
                                    ))}
                                </div>
                                <span className="text-xs font-mono text-slate-500">LOG_ID_00{index + 1}</span>
                            </div>
                            <p className="text-slate-300 font-mono text-sm mb-6 leading-relaxed">
                                &gt; {review.content}
                            </p>
                            <div className="border-t border-slate-700 pt-4">
                                <p className="font-bold text-white">{review.name}</p>
                                <p className={`text-xs text-${theme.accent} uppercase tracking-wider`}>{review.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewsCinematic;

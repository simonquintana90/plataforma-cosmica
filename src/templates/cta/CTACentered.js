import React from 'react';

const CTACentered = ({
    title = "¿Listo para empezar?",
    subtitle = "Únete a cientos de empresas que ya están creciendo con nosotros.",
    ctaText = "Comenzar Ahora",
    theme = { gradient: 'from-indigo-600 to-purple-600', text: 'white' }
}) => {
    return (
        <div className={`py-24 bg-gradient-to-r ${theme.gradient}`}>
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className={`text-4xl md:text-5xl font-bold text-${theme.text} mb-6`}>
                    {title}
                </h2>
                <p className={`text-xl text-${theme.text} opacity-90 mb-10 max-w-2xl mx-auto`}>
                    {subtitle}
                </p>
                <button className="px-10 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg">
                    {ctaText}
                </button>
            </div>
        </div>
    );
};

export default CTACentered;

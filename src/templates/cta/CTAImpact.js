import React from 'react';

const CTAImpact = ({
    title = "¿Listo para empezar?",
    subtitle = "Únete a cientos de empresas que ya están creciendo con nosotros.",
    ctaText = "Comenzar Ahora",
    theme = { primary: '#3B82F6', text: 'white' }
}) => {
    return (
        <div className="py-24" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary || '#1E293B'})` }}>
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    {title}
                </h2>
                <p className="text-xl text-white opacity-90 mb-10 max-w-2xl mx-auto">
                    {subtitle}
                </p>
                <button
                    className="px-10 py-4 bg-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
                    style={{ color: theme.primary }}
                >
                    {ctaText}
                </button>
            </div>
        </div>
    );
};

export default CTAImpact;

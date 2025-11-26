import React from 'react';

const InfoCapture = ({
    title = "Tu éxito es nuestra prioridad",
    description = "No solo entregamos un producto, entregamos resultados. Nuestro equipo de expertos está dedicado a asegurar que cada aspecto de tu proyecto esté optimizado para el máximo rendimiento y conversión.",
    ctaText = "Conoce más sobre nosotros",
    theme = { bg: 'indigo-50', text: 'slate-900', accent: 'indigo-600' }
}) => {
    return (
        <div className={`py-24 bg-${theme.bg}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className={`text-4xl md:text-5xl font-extrabold text-${theme.text} mb-8 leading-tight`}>
                    {title}
                </h2>
                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-10 font-light">
                    {description}
                </p>
                <button className={`inline-flex items-center text-${theme.accent} font-bold text-lg hover:underline`}>
                    {ctaText}
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default InfoCapture;

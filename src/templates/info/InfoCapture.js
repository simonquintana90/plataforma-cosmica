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

            </div>
        </div>
    );
};

export default InfoCapture;

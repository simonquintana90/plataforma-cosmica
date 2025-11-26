import React from 'react';

const CTACapture = ({
    title = "Lleva tu negocio al siguiente nivel",
    subtitle = "Agenda una llamada gratuita con nuestros expertos y descubre cómo podemos ayudarte a crecer.",
    ctaText = "Agendar Llamada",
    theme = { bg: 'indigo-600', text: 'white' }
}) => {
    return (
        <div className={`py-20 bg-${theme.bg} text-${theme.text}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="lg:w-2/3">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            {title}
                        </h2>
                        <p className="text-lg opacity-90 max-w-2xl">
                            {subtitle}
                        </p>
                    </div>
                    <div className="lg:w-1/3 flex justify-center lg:justify-end w-full">
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
                            {ctaText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CTACapture;

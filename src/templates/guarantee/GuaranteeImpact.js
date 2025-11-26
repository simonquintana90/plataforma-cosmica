import React from 'react';

const GuaranteeImpact = ({
    title = "Garantía de Satisfacción",
    description = "Estamos tan seguros de la calidad de nuestro trabajo que ofrecemos una garantía de devolución del 100% si no estás satisfecho con los resultados en los primeros 30 días.",
    icon = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
}) => {
    return (
        <div className="bg-white py-16 border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
                <p className="text-slate-600 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default GuaranteeImpact;

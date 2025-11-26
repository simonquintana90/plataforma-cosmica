import React from 'react';

const GuaranteeElegant = ({
    title = "Nuestra Promesa",
    description = "Nos comprometemos a entregar excelencia en cada detalle. Si no superamos tus expectativas, trabajaremos sin descanso hasta lograrlo.",
    signature = "El Equipo Fundador"
}) => {
    return (
        <div className="py-24 bg-stone-50">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <div className="w-12 h-px bg-slate-900 mx-auto mb-8"></div>
                <h2 className="text-2xl font-serif text-slate-900 mb-6 italic">
                    {title}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-10 font-light">
                    {description}
                </p>

            </div>
        </div>
    );
};

export default GuaranteeElegant;

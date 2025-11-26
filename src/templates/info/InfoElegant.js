import React from 'react';

const InfoElegant = ({
    title = "Filosofía",
    description = "Creemos en la simplicidad como la máxima sofisticación. Nuestro enfoque elimina lo innecesario para revelar la esencia de tu marca.",
    theme = { bg: 'white', text: 'slate-900' }
}) => {
    return (
        <div className={`py-32 bg-${theme.bg}`}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <span className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-4">{title}</span>
                <p className={`text-3xl md:text-4xl font-serif text-${theme.text} leading-relaxed`}>
                    {description}
                </p>
                <div className="w-24 h-1 bg-slate-900 mt-12"></div>
            </div>
        </div>
    );
};

export default InfoElegant;

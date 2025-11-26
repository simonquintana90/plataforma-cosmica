import React from 'react';

const CTAElegant = ({
    title = "Comencemos una conversación.",
    ctaText = "Contáctanos",
    theme = { bg: 'stone-50', text: 'slate-900' }
}) => {
    return (
        <div className={`py-32 bg-${theme.bg}`}>
            <div className="max-w-3xl mx-auto px-4 text-center">
                <h2 className={`text-4xl md:text-5xl font-serif text-${theme.text} mb-12 italic leading-tight`}>
                    {title}
                </h2>
                <button className={`px-12 py-4 border border-${theme.text} text-${theme.text} hover:bg-${theme.text} hover:text-white transition-all duration-500 uppercase tracking-widest text-sm`}>
                    {ctaText}
                </button>
            </div>
        </div>
    );
};

export default CTAElegant;

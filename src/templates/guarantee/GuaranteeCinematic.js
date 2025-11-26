import React from 'react';

const GuaranteeCinematic = ({
    title = "Protección Total",
    description = "Tu inversión está blindada con nuestra garantía de satisfacción de 30 días.",
    theme = { bg: 'slate-900', text: 'white', accent: 'cyan-400' }
}) => {
    return (
        <div className={`py-16 bg-${theme.bg} border-y border-slate-800`}>
            <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8">
                <div className={`w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-${theme.accent} shadow-[0_0_20px_rgba(34,211,238,0.2)]`}>
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div className="text-center md:text-left">
                    <h3 className={`text-xl font-bold text-${theme.text} mb-2`}>{title}</h3>
                    <p className="text-slate-400 max-w-md">{description}</p>
                </div>
            </div>
        </div>
    );
};

export default GuaranteeCinematic;

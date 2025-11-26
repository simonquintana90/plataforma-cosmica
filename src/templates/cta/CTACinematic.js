import React from 'react';

const CTACinematic = ({
    title = "Ready to Launch?",
    subtitle = "Initialize your project with our advanced infrastructure today.",
    ctaText = "Deploy Now",
    theme = { bg: 'slate-900', text: 'white', accent: 'cyan-500' }
}) => {
    return (
        <div className={`relative py-32 bg-${theme.bg} overflow-hidden`}>
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -top-1/2 -right-1/2 w-full h-full bg-${theme.accent} opacity-10 blur-[100px] rounded-full`}></div>
                <div className={`absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-600 opacity-10 blur-[100px] rounded-full`}></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                <h2 className={`text-5xl md:text-6xl font-bold text-${theme.text} mb-6 tracking-tight`}>
                    {title}
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                    {subtitle}
                </p>
                <button className={`px-10 py-4 rounded-full bg-${theme.accent} text-slate-900 font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-shadow duration-300`}>
                    {ctaText}
                </button>
            </div>
        </div>
    );
};

export default CTACinematic;

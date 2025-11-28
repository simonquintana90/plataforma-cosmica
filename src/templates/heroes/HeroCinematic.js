import React from 'react';

const HeroCinematic = ({
    title = "El futuro de tu empresa comienza aquí",
    subtitle = "Tecnología de punta y diseño estratégico para llevar tu negocio al siguiente nivel.",
    ctaText = "Empezar Ahora",
    secondaryCtaText = "Saber Más",
    images = [],
    theme = { primary: '#3b82f6', secondary: '#0f172a' }
}) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: theme.secondary || '#0f172a' }}>
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={images[0] || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80"}
                    alt="Hero Background"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                    {title}
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto font-light">
                    {subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        className="px-8 py-4 rounded text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
                        style={{ backgroundColor: theme.primary }}
                    >
                        {ctaText}
                    </button>
                    <button className="px-8 py-4 rounded border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-colors">
                        {secondaryCtaText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroCinematic;

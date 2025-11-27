import React from 'react';

const HeroCinematic = ({
    title = "El futuro de tu empresa comienza aquí",
    subtitle = "Tecnología de punta y diseño estratégico para llevar tu negocio al siguiente nivel.",
    ctaText = "Empezar Ahora",
    backgroundImage = "https://images.unsplash.com/photo-1531297461136-82lw9z1w1w1w?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    theme = { text: 'white' }
}) => {
    return (
        <div className="relative h-screen min-h-[600px] w-full overflow-hidden bg-slate-900">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                {/* Additional Overlay for readability */}
                <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-5xl drop-shadow-2xl">
                    {title}
                </h1>
                <p className="text-lg md:text-2xl text-slate-100 mb-10 max-w-2xl font-light drop-shadow-md">
                    {subtitle}
                </p>
                <button className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    {ctaText}
                </button>
            </div>
        </div>
    );
};

export default HeroCinematic;

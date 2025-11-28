import React from 'react';

const HeroCapture = ({
    title = "Contáctanos hoy mismo",
    subtitle = "Estamos listos para ayudarte a alcanzar tus objetivos. Déjanos tus datos y te contactaremos pronto.",
    theme = { primary: '#dc2626' }, // Default theme with a primary color
    ctaText = "Empezar Ahora",
    images = ["https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80"],
}) => {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                            {title}
                        </h1>
                        <p className="text-xl text-slate-600 mb-8">
                            {subtitle}
                        </p>

                        {/* Email Capture Form */}
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                            />
                            <button
                                className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition-opacity shadow-lg"
                                style={{ backgroundColor: theme.primary || '#dc2626' }}
                            >
                                {ctaText}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            Prueba gratis de 14 días. Sin tarjeta de crédito.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-full blur-3xl opacity-70"></div>
                        <img
                            src={images[0] || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80"}
                            alt="Hero"
                            className="relative rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroCapture;

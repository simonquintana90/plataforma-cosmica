import React from 'react';

const HeroElegant = ({
    title = "Asesoría experta para individuos y organizaciones.",
    ctaText = "Agendar Cita",
    images = [
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Replaced broken image
    ]
}) => {
    return (
        <div className="relative py-32 lg:py-48 bg-stone-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <span className="block text-sm uppercase tracking-[0.3em] text-stone-500 mb-6">
                    Bienvenido a la Excelencia
                </span>
                <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-8 leading-tight">
                    {title}
                </h1>
                <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                    {subtitle}
                </p>
                <div className="flex justify-center gap-6">
                    <button
                        className="px-10 py-4 text-white text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: theme.secondary || '#1c1917' }}
                    >
                        {ctaText}
                    </button>
                    <button className="px-10 py-4 border border-stone-300 text-stone-600 text-sm uppercase tracking-widest hover:border-stone-900 hover:text-stone-900 transition-colors">
                        {secondaryCtaText}
                    </button>
                </div>
            </div>

            {/* Decorative Image */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <img
                    src={images[0] || "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80"}
                    alt="Background Pattern"
                    className="w-full h-full object-cover grayscale"
                />
            </div>
        </div>
    );
};

export default HeroElegant;

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
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col justify-between font-serif relative overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto z-10 py-20">
                <h1 className="text-4xl md:text-6xl lg:text-7xl text-slate-900 leading-tight mb-12">
                    {title}
                </h1>
                <button className="bg-[#F4F678] px-10 py-4 text-lg font-medium text-slate-900 hover:bg-[#eaea60] transition-colors rounded-sm">
                    {ctaText}
                </button>
            </main>

            {/* Bottom Images */}
            <div className="grid grid-cols-2 md:grid-cols-4 w-full h-48 md:h-64 mt-auto">
                {images.map((img, i) => (
                    <div key={i} className="relative overflow-hidden group h-full">
                        <img
                            src={img}
                            alt={`Galería ${i}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroElegant;

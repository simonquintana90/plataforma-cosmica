import React from 'react';

const HeroCapture = ({
    title = "Contáctanos hoy mismo",
    subtitle = "Estamos listos para ayudarte a alcanzar tus objetivos. Déjanos tus datos y te contactaremos pronto.",
    backgroundImage = "https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
}) => {
    return (
        <div className="relative min-h-screen w-full bg-stone-900 text-white font-sans flex flex-col justify-end">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Bottom Card Overlay */}
            <div className="relative z-10 p-4 md:p-8 w-full">
                <div className="max-w-7xl mx-auto bg-black/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl">
                    {/* Gradient Mesh */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-stone-900/90 via-stone-900/50 to-transparent z-0"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                        <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4">Atención Personalizada</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            {title}
                        </h1>
                        <p className="text-stone-300 text-sm md:text-base mb-8">
                            {subtitle}
                        </p>
                        <button className="bg-white text-stone-900 font-bold py-4 px-8 rounded-lg hover:bg-stone-200 transition-colors shadow-lg">
                            Empezar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroCapture;

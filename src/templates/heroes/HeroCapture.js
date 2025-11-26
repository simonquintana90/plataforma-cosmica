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

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Text */}
                        <div className="flex flex-col justify-center">
                            <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4">Atención Personalizada</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                {title}
                            </h1>
                            <p className="text-stone-300 text-sm md:text-base max-w-md">
                                {subtitle}
                            </p>
                        </div>

                        {/* Right Form Controls */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-stone-400 mb-2">Nombre Completo</label>
                                    <input type="text" placeholder="Tu nombre" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/50 transition-colors" />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-2">Correo Electrónico</label>
                                    <input type="email" placeholder="tu@correo.com" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/50 transition-colors" />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-2">Teléfono</label>
                                    <input type="tel" placeholder="+57 300..." className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/50 transition-colors" />
                                </div>

                                {/* Submit Button */}
                                <div className="md:col-span-2 mt-2">
                                    <button type="button" className="w-full bg-white text-stone-900 font-bold py-4 rounded-lg hover:bg-stone-200 transition-colors shadow-lg">
                                        Enviar Mensaje
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroCapture;

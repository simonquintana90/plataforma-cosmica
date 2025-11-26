import React from 'react';

const HeroImpact = ({
    title = "Transformamos tu visión en realidad digital",
    subtitle = "Soluciones web innovadoras para empresas que buscan destacar en el mercado colombiano y global.",
    ctaText = "Contáctanos",
    secondaryCtaText = "Ver Portafolio",
    stats = [
        { value: "+500", label: "Clientes Felices" },
        { value: "+10", label: "Años de Experiencia" },
        { value: "Soporte", icon: true } // Changed to generic support icon
    ],
    images = [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    theme = { primary: 'indigo-600', secondary: 'indigo-100', text: 'slate-900', bg: 'white' }
}) => {
    return (
        <div className={`bg-${theme.bg} overflow-hidden relative py-16 lg:py-24`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-4">Innovación & Estrategia</h2>
                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-${theme.text} leading-tight mb-6`}>
                            {title}
                        </h1>
                        <p className="text-lg text-slate-500 mb-8 max-w-lg">
                            {subtitle}
                        </p>
                        <div className="flex flex-wrap gap-4 mb-12">
                            {/* Improved contrast: darker background for primary button */}
                            <button className={`px-8 py-3 rounded-full bg-${theme.primary} text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30`}>
                                {ctaText}
                            </button>
                            <button className={`px-8 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors`}>
                                {secondaryCtaText}
                            </button>
                        </div>

                        <div className="flex items-center gap-8 md:gap-12 border-t border-slate-100 pt-8">
                            {stats.map((stat, i) => (
                                <div key={i}>
                                    {stat.icon ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1 text-green-600">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">Soporte 24/7</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                            <p className="text-xs text-slate-500">{stat.label}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Collage */}
                    <div className="relative h-[500px] hidden lg:block">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-50 blur-xl"></div>
                        <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-200 rounded-full opacity-50 blur-xl"></div>

                        {/* Images */}
                        <div className="absolute top-10 right-10 w-48 h-48 rounded-[2rem] overflow-hidden shadow-xl transform rotate-3 border-4 border-white z-10">
                            <img src={images[0]} alt="Reunión" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-32 left-10 w-56 h-64 rounded-[2rem] overflow-hidden shadow-2xl transform -rotate-2 border-4 border-white z-20">
                            <img src={images[1]} alt="Equipo" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-10 right-20 w-40 h-40 rounded-[2rem] overflow-hidden shadow-lg transform rotate-6 border-4 border-white z-10">
                            <img src={images[2]} alt="Oficina" className="w-full h-full object-cover" />
                        </div>

                        {/* Floating Icons */}
                        <div className="absolute top-20 left-20 bg-white p-3 rounded-2xl shadow-lg z-30 animate-bounce">
                            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroImpact;

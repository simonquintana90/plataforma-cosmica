import React from 'react';

const HeroCollage = ({
    title = "A new way to learn & get knowledge",
    subtitle = "EduFlex is here for you with various courses & materials from skilled tutors all around the world.",
    ctaText = "Join the Class",
    secondaryCtaText = "Learn more",
    stats = [
        { value: "15,2K", label: "Active students" },
        { value: "4,5K", label: "Tutors" },
        { value: "Resources", icon: true }
    ],
    images = [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    theme = { primary: 'indigo-500', secondary: 'indigo-100', text: 'slate-900', bg: 'white' }
}) => {
    return (
        <div className={`bg-${theme.bg} overflow-hidden relative py-16 lg:py-24`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <h2 className="text-indigo-500 font-bold tracking-wide uppercase text-sm mb-4">EduFlex.</h2>
                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-${theme.text} leading-tight mb-6`}>
                            {title}
                        </h1>
                        <p className="text-lg text-slate-500 mb-8 max-w-lg">
                            {subtitle}
                        </p>
                        <div className="flex flex-wrap gap-4 mb-12">
                            <button className={`px-8 py-3 rounded-full bg-${theme.primary} text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-${theme.primary}/30`}>
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
                                        <div className="flex flex-col">
                                            <div className="flex -space-x-2 mb-1">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                                                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                                            </div>
                                            <p className="text-xs text-slate-400">{stat.value}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                            <p className="text-xs text-slate-400">{stat.label}</p>
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
                            <img src={images[0]} alt="Student" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-32 left-10 w-56 h-64 rounded-[2rem] overflow-hidden shadow-2xl transform -rotate-2 border-4 border-white z-20">
                            <img src={images[1]} alt="Tutor" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-10 right-20 w-40 h-40 rounded-[2rem] overflow-hidden shadow-lg transform rotate-6 border-4 border-white z-10">
                            <img src={images[2]} alt="Class" className="w-full h-full object-cover" />
                        </div>

                        {/* Floating Icons */}
                        <div className="absolute top-20 left-20 bg-white p-3 rounded-2xl shadow-lg z-30 animate-bounce">
                            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <div className="absolute bottom-40 right-5 bg-white p-3 rounded-2xl shadow-lg z-30 animate-pulse">
                            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroCollage;

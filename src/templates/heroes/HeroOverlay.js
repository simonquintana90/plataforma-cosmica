import React from 'react';

const HeroOverlay = ({
    title = "Vision care at the Speed of sight",
    subtitle = "90-second vision tests and eyewear prescriptions at the touch of a button.",
    ctaText = "Get Started",
    backgroundImage = "https://images.unsplash.com/photo-1531297461136-82lw9z1w1w1w?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    theme = { text: 'white' }
}) => {
    return (
        <div className="relative h-screen min-h-[600px] w-full overflow-hidden bg-slate-900">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img src={backgroundImage} alt="Background" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900/90"></div>
            </div>

            {/* Navbar Placeholder */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-center z-20">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex items-center gap-8 text-sm font-medium text-white">
                    <span className="font-bold text-lg">eyebot.</span>
                    <a href="#" className="hover:text-blue-300 transition-colors">Our Technology</a>
                    <a href="#" className="hover:text-blue-300 transition-colors">Solutions</a>
                    <a href="#" className="hover:text-blue-300 transition-colors">Mission</a>
                    <button className="bg-white text-slate-900 px-4 py-1.5 rounded-full font-bold hover:bg-blue-50 transition-colors">Get Started</button>
                </div>
            </div>

            {/* Tech Overlays (Decorative) */}
            <div className="absolute top-1/3 left-1/4 hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/60 backdrop-blur border border-blue-500/30 rounded text-[10px] text-blue-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                TEST IN PROGRESS
            </div>
            <div className="absolute top-1/4 right-1/3 hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/60 backdrop-blur border border-blue-500/30 rounded text-[10px] text-blue-300 font-mono">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ASTIGMATISM DETECTED
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-4xl drop-shadow-lg">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-xl font-light">
                    {subtitle}
                </p>
                <button className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    {ctaText}
                </button>
            </div>
        </div>
    );
};

export default HeroOverlay;

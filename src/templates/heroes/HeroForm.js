import React from 'react';

const HeroForm = ({
    title = "Set Your Preferences",
    subtitle = "If you prefer one-time order we have Ready-to-eat Meals",
    backgroundImage = "https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
}) => {
    return (
        <div className="relative min-h-screen w-full bg-stone-900 text-white font-sans">
            {/* Navbar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-2xl font-bold tracking-wider">CALORI</div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-stone-300">
                    <a href="#" className="hover:text-white">Menu</a>
                    <a href="#" className="hover:text-white">Process</a>
                    <a href="#" className="hover:text-white">About Us</a>
                </div>
                <button className="bg-white text-stone-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-200">See Plans</button>
            </div>

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={backgroundImage} alt="Food" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Bottom Card Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-8">
                <div className="max-w-7xl mx-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden relative">
                    {/* Gradient Mesh */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-stone-900/80 to-transparent z-0"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Text */}
                        <div className="flex flex-col justify-center">
                            <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4">Personal Meal Plan</p>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                {title}
                            </h1>
                            <p className="text-stone-300 text-sm md:text-base">
                                {subtitle}
                            </p>
                        </div>

                        {/* Right Form Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Starting Week */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-3">Starting Week</label>
                                <div className="flex bg-white/10 rounded-full p-1">
                                    <button className="flex-1 bg-white text-stone-900 rounded-full py-2 text-sm font-bold">19.05</button>
                                    <button className="flex-1 text-stone-300 py-2 text-sm hover:text-white">26.05</button>
                                    <button className="flex-1 text-stone-300 py-2 text-sm hover:text-white">02.06</button>
                                </div>
                            </div>

                            {/* Days per Week */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-3">Days per Week</label>
                                <div className="flex gap-2">
                                    <button className="bg-white text-stone-900 rounded-full px-4 py-2 text-sm font-bold">5 days</button>
                                    <button className="bg-white/10 text-stone-300 rounded-full px-4 py-2 text-sm hover:bg-white/20">6</button>
                                    <button className="bg-white/10 text-stone-300 rounded-full px-4 py-2 text-sm hover:bg-white/20">7</button>
                                </div>
                            </div>

                            {/* Diet Preferences */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-3">Diet Preferences</label>
                                <div className="flex bg-white/10 rounded-full p-1 w-fit">
                                    <button className="bg-white text-stone-900 rounded-full px-6 py-2 text-sm font-bold">Mixed</button>
                                    <button className="text-stone-300 px-6 py-2 text-sm hover:text-white">Vegetarian</button>
                                </div>
                            </div>

                            {/* Calories */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-3">Calories a Day</label>
                                <div className="flex gap-2">
                                    <button className="bg-white text-stone-900 rounded-full px-4 py-2 text-sm font-bold">1500 kcal</button>
                                    <button className="bg-white/10 text-stone-300 rounded-full px-4 py-2 text-sm hover:bg-white/20">2000</button>
                                    <button className="bg-white/10 text-stone-300 rounded-full px-4 py-2 text-sm hover:bg-white/20">2500</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroForm;

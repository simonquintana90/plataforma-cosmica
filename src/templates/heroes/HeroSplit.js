import React from 'react';

const HeroSplit = ({
    title = "Innovate with Confidence",
    subtitle = "Build faster, scale better, and lead your industry.",
    ctaText = "Learn More",
    onCtaClick,
    image = "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80",
    theme = { primary: 'indigo-600', text: 'gray-900' }
}) => {
    return (
        <div className="relative bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                        <div className="sm:text-center lg:text-left">
                            <h1 className={`text-4xl tracking-tight font-extrabold text-${theme.text} sm:text-5xl md:text-6xl`}>
                                <span className="block">{title}</span>
                            </h1>
                            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                {subtitle}
                            </p>
                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                <div className="rounded-md shadow">
                                    <button
                                        onClick={onCtaClick}
                                        className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-${theme.primary} hover:bg-opacity-90 md:py-4 md:text-lg md:px-10`}
                                    >
                                        {ctaText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src={image} alt="" />
            </div>
        </div>
    );
};

export default HeroSplit;

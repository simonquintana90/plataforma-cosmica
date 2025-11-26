import React from 'react';

const HeroModern = ({
    title = "Transform Your Business",
    subtitle = "We help you grow with cutting-edge technology and design.",
    ctaText = "Get Started",
    onCtaClick,
    backgroundImage = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    theme = { primary: 'blue-600', text: 'slate-900' }
}) => {
    return (
        <div className="relative bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                    <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <polygon points="50,0 100,0 50,100 0,100" />
                    </svg>

                    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                        <div className="sm:text-center lg:text-left">
                            <h1 className={`text-4xl tracking-tight font-extrabold text-${theme.text} sm:text-5xl md:text-6xl`}>
                                <span className="block xl:inline">{title.split(' ').slice(0, -2).join(' ')}</span>{' '}
                                <span className={`block text-${theme.primary} xl:inline`}>{title.split(' ').slice(-2).join(' ')}</span>
                            </h1>
                            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                {subtitle}
                            </p>
                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                <div className="rounded-md shadow">
                                    <button
                                        onClick={onCtaClick}
                                        className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-${theme.primary} hover:bg-opacity-90 md:py-4 md:text-lg md:px-10 transition-colors`}
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
                <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src={backgroundImage} alt="" />
            </div>
        </div>
    );
};

export default HeroModern;

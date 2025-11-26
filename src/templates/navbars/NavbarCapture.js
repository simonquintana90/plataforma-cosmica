import React, { useState } from 'react';

const NavbarCapture = ({
    logo = "Brand",
    links = [
        { name: 'Beneficios', href: '#' },
        { name: 'Testimonios', href: '#' },
        { name: 'FAQ', href: '#' }
    ],
    ctaText = "¡Oferta Especial!",
    theme = { bg: 'white', text: 'slate-900', primary: 'red-600' }
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={`bg-${theme.bg} shadow-md sticky top-0 z-50`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <span className={`text-3xl font-extrabold text-${theme.text} uppercase tracking-wider`}>{logo}</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className={`text-base font-bold text-${theme.text} hover:text-${theme.primary} transition-colors`}>
                                {link.name}
                            </a>
                        ))}
                        <button
                            className="px-6 py-3 rounded-lg text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg"
                            style={{ backgroundColor: '#dc2626' }} // red-600
                        >
                            {ctaText}
                        </button>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className={`text-${theme.text} hover:text-${theme.primary}`}>
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 absolute w-full shadow-xl">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="block px-3 py-3 rounded-md text-lg font-bold text-slate-800 hover:bg-slate-50 hover:text-red-600">
                                {link.name}
                            </a>
                        ))}
                        <button className={`w-full mt-4 px-6 py-4 rounded-lg bg-${theme.primary} text-white font-bold text-xl shadow-md`}>
                            {ctaText}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavbarCapture;

import React, { useState } from 'react';

const NavbarSimple = ({
    logo = "Brand",
    links = [
        { name: 'Inicio', href: '#' },
        { name: 'Servicios', href: '#' },
        { name: 'Nosotros', href: '#' },
        { name: 'Contacto', href: '#' }
    ],
    ctaText = "Empezar",
    theme = { bg: 'white', text: 'slate-900', primary: 'indigo-600' }
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={`bg-${theme.bg} border-b border-slate-100`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className={`text-2xl font-bold text-${theme.text}`}>{logo}</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className={`text-sm font-medium text-${theme.text} hover:text-${theme.primary} transition-colors`}>
                                {link.name}
                            </a>
                        ))}
                        <button className={`px-5 py-2 rounded-full bg-${theme.primary} text-white text-sm font-bold hover:opacity-90 transition-opacity`}>
                            {ctaText}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className={`text-${theme.text} hover:text-${theme.primary}`}>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-slate-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">
                                {link.name}
                            </a>
                        ))}
                        <button className={`w-full mt-4 px-5 py-3 rounded-md bg-${theme.primary} text-white text-base font-bold`}>
                            {ctaText}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavbarSimple;

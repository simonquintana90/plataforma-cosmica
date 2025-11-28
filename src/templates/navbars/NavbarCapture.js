import React, { useState } from 'react';

const NavbarCapture = ({
    logo = "Brand",
    links = [
        { name: 'Beneficios', href: '#' },
        { name: 'Testimonios', href: '#' },
        { name: 'FAQ', href: '#' }
    ],
    ctaText = "¡Oferta Especial!",
    theme = { bg: 'white', text: 'slate-900', primary: 'red-600', secondary: '#1c1917' } // Added secondary to default theme
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const isImageLogo = logo && (logo.includes('http') || logo.includes('data:image'));

    return (
        <nav className="border-b border-stone-200" style={{ backgroundColor: theme.bg || 'white' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-24">
                    <div className="flex items-center">
                        {isImageLogo ? (
                            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                        ) : (
                            <span className="text-3xl font-serif italic text-stone-800">{logo}</span>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-12">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors">
                                {link.name}
                            </a>
                        ))}
                        <button
                            className="px-8 py-3 text-white text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: theme.secondary || '#1c1917' }}
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

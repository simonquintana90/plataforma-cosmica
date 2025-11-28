import React, { useState, useEffect } from 'react';

const NavbarCinematic = ({
    logo = "Brand",
    links = [
        { name: 'Inicio', href: '#' },
        { name: 'Servicios', href: '#' },
        { name: 'Nosotros', href: '#' },
        { name: 'Contacto', href: '#' }
    ],
    ctaText = "Empezar",
    theme = { primary: '#3b82f6', secondary: '#0f172a' }
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isImageLogo = logo && (logo.includes('http') || logo.includes('data:image'));

    return (
        <nav className="border-b border-white/10" style={{ backgroundColor: theme.secondary || '#0f172a' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        {isImageLogo ? (
                            <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <span className="text-2xl font-bold tracking-wider text-white">{logo}</span>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                {link.name}
                            </a>
                        ))}
                        <button
                            className="px-6 py-2 rounded text-white text-sm font-bold hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: theme.primary }}
                        >
                            {ctaText}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-slate-200">
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
                <div className="md:hidden bg-slate-900 border-t border-slate-800 absolute w-full">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">
                                {link.name}
                            </a>
                        ))}
                        <button className="w-full mt-4 px-5 py-3 rounded-md bg-white text-slate-900 text-base font-bold">
                            {ctaText}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavbarCinematic;

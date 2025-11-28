import React, { useState } from 'react';

const NavbarElegant = ({
    logo = "Brand",
    links = [
        { name: 'Inicio', href: '#' },
        { name: 'Servicios', href: '#' },
        { name: 'Nosotros', href: '#' },
        { name: 'Contacto', href: '#' }
    ],
    theme = { bg: 'white', text: 'slate-900', primary: 'indigo-600' },
    ctaText = "Empezar"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const midPoint = Math.ceil(links.length / 2);
    const leftLinks = links.slice(0, midPoint);
    const rightLinks = links.slice(midPoint);

    return (
        <nav className="border-b border-slate-100" style={{ backgroundColor: theme.bg || 'white' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center relative">
                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden absolute left-0">
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

                    {/* Desktop Left Links */}
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 absolute w-full z-50">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">
                                {link.name}
                            </a>
                        ))}
                        <div className="pt-4 pb-2">
                            <button
                                className="w-full px-6 py-2 border hover:text-white transition-all uppercase tracking-widest text-xs"
                                style={{
                                    borderColor: theme.text || 'slate-900',
                                    color: theme.text || 'slate-900',
                                    '--hover-bg': theme.text || 'slate-900'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.text || 'slate-900'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.text || 'slate-900'; }}
                            >
                                {ctaText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavbarElegant;

import React from 'react';

const FooterCinematic = ({
    brand = "Brand",
    newsletterTitle = "Stay in the loop",
    newsletterDesc = "Recibe las últimas actualizaciones de nuestra tecnología directamente en tu inbox.",
    theme = { bg: 'slate-900', text: 'white', accent: 'cyan-400' },
    businessName = "Your Company",
    description = "Building the future of digital infrastructure, one block at a time.",
    links = [
        { name: 'Home', href: '#' },
        { name: 'About', href: '#' },
        { name: 'Services', href: '#' },
        { name: 'Contact', href: '#' },
    ]
}) => {
    return (
        <footer className="py-12 border-t border-white/10" style={{ backgroundColor: theme.secondary || '#0f172a' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <span className="text-2xl font-bold text-white tracking-wider">{businessName}</span>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs">
                            {description}
                        </p>
                    </div>

                    <div className="flex space-x-8">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-xs">
                    &copy; {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default FooterCinematic;

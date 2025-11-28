import React from 'react';

const FooterCapture = ({
    theme = { bg: 'white', text: 'black' }, // Default theme for colors
    businessName = "Your Business",
    description = "A short description about your business or mission statement.",
    links = [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Contact', href: '#' }
    ]
}) => {
    return (
        <footer className="py-12 border-t border-stone-200" style={{ backgroundColor: theme.bg || 'white' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <span className="text-xl font-bold text-stone-900 uppercase tracking-wider" style={{ color: theme.text || 'black' }}>{businessName}</span>
                        <p className="text-stone-500 text-sm mt-2 max-w-xs" style={{ color: theme.textSecondary || '#6b7280' }}>
                            {description}
                        </p>
                    </div>

                    <div className="flex space-x-8">
                        {links.map((link, index) => (
                            <a key={index} href={link.href} className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-bold uppercase tracking-wide" style={{ color: theme.link || '#525252', '--hover-color': theme.linkHover || '#1c1917' }}>
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-stone-200 text-center text-stone-400 text-xs" style={{ color: theme.copyright || '#a1a1aa' }}>
                    &copy; {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default FooterCapture;

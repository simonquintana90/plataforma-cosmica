import React from 'react';

const FooterElegant = ({
    businessName = "Brand",
    description = "Simplicity is the ultimate sophistication.",
    links = [],
    theme = { text: 'slate-900', secondary: 'stone-50' }
}) => {
    return (
        <footer className="py-24" style={{ backgroundColor: theme.secondary || '#fafaf9' }}>
            <div className="max-w-3xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-serif mb-6 tracking-tight" style={{ color: theme.text || '#0f172a' }}>{businessName}</h2>
                <p className="font-light italic mb-12" style={{ color: theme.textSecondary || '#64748b' }}>
                    {description}
                </p>
                <div className="flex justify-center space-x-8 mb-12">
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.href || '#'}
                            className="uppercase tracking-widest text-xs transition-colors hover:opacity-70"
                            style={{ color: theme.text || '#94a3b8' }}
                        >
                            {link.name || link}
                        </a>
                    ))}
                </div>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-xs uppercase tracking-widest" style={{ color: theme.textSecondary || '#cbd5e1' }}>
                        &copy; {new Date().getFullYear()} {businessName}.
                    </p>
                    <a href="https://www.cosmicaweb.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: theme.textSecondary || '#94a3b8' }}>Crafted by</span>
                        <img
                            src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/68052b14352271978c443cef_CO%CC%81SMICA_Blanco_L.avif"
                            alt="Cósmica"
                            className="h-3"
                            style={{ filter: theme.mode === 'dark' ? 'none' : 'invert(1)' }}
                        />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterElegant;

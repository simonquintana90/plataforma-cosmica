```javascript
import React from 'react';

const FooterElegant = ({
    businessName = "Elegant Brand",
    logo = "",
    description = "Elevating standards with every interaction.",
    links = [],
    theme = { text: 'slate-900', secondary: 'stone-50' },
}) => {
    // New theme variables and dark background check
    const { 
        bg = theme.bg || "#ffffff", 
        text = theme.text || "#0f172a",
        primary = theme.primary || "#0f172a"
    } = theme;

    // Simple check for dark background to invert logo if needed (basic heuristic)
    const isDarkBg = bg.includes('#00') || bg.includes('#1') || bg.includes('#2') || bg === '#0f172a';

    return (
        <footer style={{ backgroundColor: bg, color: text }} className="py-16 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-6">
                            {(logo && (logo.includes('http') || logo.includes('data:'))) ? (
                                <img 
                                    src={logo} 
                                    alt={businessName} 
                                    className="h-12 object-contain"
                                    style={{ filter: isDarkBg ? 'brightness(0) invert(1)' : 'none' }}
                                />
                            ) : (
                                <h3 className="text-2xl font-serif font-bold" style={{ color: primary }}>{businessName}</h3>
                            )}
                        </div>
                        <p className="text-lg font-light max-w-sm opacity-80">
                            {description}
                        </p>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex justify-end items-start gap-8 flex-wrap">
                        {links.map((link, index) => (
                            <a 
                                key={index} 
                                href={link.href || '#'} 
                                className="text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
                                style={{ color: text }}
                            >
                                {link.name || link}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 opacity-60">
                    <p className="text-xs uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} {businessName}.
                    </p>
                    <a href="https://www.cosmicaweb.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase tracking-widest">Crafted by</span>
                        <img 
                            src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/68052b14352271978c443cef_CO%CC%81SMICA_Blanco_L.avif" 
                            alt="Cósmica" 
                            className="h-3"
                            style={{ filter: isDarkBg ? 'brightness(0) invert(1)' : 'none' }}
                        />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterElegant;
```

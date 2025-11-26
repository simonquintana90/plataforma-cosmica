import React from 'react';

const FooterElegant = ({
    brand = "Brand",
    tagline = "Simplicity is the ultimate sophistication."
}) => {
    return (
        <footer className="bg-stone-50 py-24">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-serif text-slate-900 mb-6 tracking-tight">{brand}</h2>
                <p className="text-slate-500 font-light italic mb-12">
                    {tagline}
                </p>
                <div className="flex justify-center space-x-8 mb-12">
                    <a href="#" className="text-slate-400 hover:text-slate-900 uppercase tracking-widest text-xs transition-colors">Instagram</a>
                    <a href="#" className="text-slate-400 hover:text-slate-900 uppercase tracking-widest text-xs transition-colors">Twitter</a>
                    <a href="#" className="text-slate-400 hover:text-slate-900 uppercase tracking-widest text-xs transition-colors">LinkedIn</a>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-xs text-slate-300 uppercase tracking-widest">
                        Designed in Colombia. &copy; {new Date().getFullYear()}
                    </p>
                    <a href="https://www.cosmicaweb.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">Crafted by</span>
                        <img src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/68052b14352271978c443cef_CO%CC%81SMICA_Blanco_L.avif" alt="Cósmica" className="h-3 invert filter brightness-0" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterElegant;

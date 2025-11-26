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
                <p className="text-xs text-slate-300 uppercase tracking-widest">
                    Designed in Colombia. &copy; {new Date().getFullYear()}
                </p>
            </div>
        </footer>
    );
};

export default FooterElegant;

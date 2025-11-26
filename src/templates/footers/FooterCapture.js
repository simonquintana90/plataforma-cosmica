import React from 'react';

const FooterCapture = ({
    brand = "Brand",
    links = ['Política de Privacidad', 'Términos de Servicio', 'Contacto']
}) => {
    return (
        <footer className="bg-slate-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-2xl font-extrabold tracking-tight">
                    {brand}
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    {links.map((link, index) => (
                        <a key={index} href="#" className="text-slate-400 hover:text-white font-medium transition-colors">
                            {link}
                        </a>
                    ))}
                </div>
                <div className="text-slate-500 text-sm flex flex-col items-center md:items-end gap-2">
                    <span>&copy; {new Date().getFullYear()} {brand}.</span>
                    <a href="https://www.cosmicaweb.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-slate-400">Crafted by</span>
                        <img src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/68052b14352271978c443cef_CO%CC%81SMICA_Blanco_L.avif" alt="Cósmica" className="h-3" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterCapture;

import React from 'react';

const FooterCinematic = ({
    brand = "Brand",
    newsletterTitle = "Stay in the loop",
    newsletterDesc = "Recibe las últimas actualizaciones de nuestra tecnología directamente en tu inbox.",
    theme = { bg: 'slate-900', text: 'white', accent: 'cyan-400' }
}) => {
    return (
        <footer className={`bg-${theme.bg} text-${theme.text} py-20 border-t border-slate-800`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">{brand}</h2>
                        <p className="text-slate-400 text-lg max-w-md">
                            Construyendo el futuro de la infraestructura digital, un bloque a la vez.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12 mb-12">
                    <div>
                        <h4 className="font-bold mb-4 text-slate-300">Plataforma</h4>
                        <ul className="space-y-2 text-slate-500">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Overview</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-slate-300">Recursos</h4>
                        <ul className="space-y-2 text-slate-500">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentación</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Comunidad</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-slate-300">Compañía</h4>
                        <ul className="space-y-2 text-slate-500">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-slate-300">Legal</h4>
                        <ul className="space-y-2 text-slate-500">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex justify-center">
                    <a href="https://www.cosmicaweb.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-slate-400">Crafted by</span>
                        <img src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/68052b14352271978c443cef_CO%CC%81SMICA_Blanco_L.avif" alt="Cósmica" className="h-4" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterCinematic;

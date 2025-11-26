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
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-2">{newsletterTitle}</h3>
                        <p className="text-slate-400 mb-6">{newsletterDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <button className={`bg-${theme.accent} text-slate-900 font-bold px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all`}>
                                Suscribirse
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12">
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
            </div>
        </footer>
    );
};

export default FooterCinematic;

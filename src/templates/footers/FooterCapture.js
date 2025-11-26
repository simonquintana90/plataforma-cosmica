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
                <div className="text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} {brand}.
                </div>
            </div>
        </footer>
    );
};

export default FooterCapture;

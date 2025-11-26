import React from 'react';

const FooterImpact = ({
    brand = "Brand",
    description = "Transformando ideas en experiencias digitales excepcionales.",
    links = [
        { title: 'Empresa', items: ['Sobre Nosotros', 'Carreras', 'Blog', 'Prensa'] },
        { title: 'Producto', items: ['Características', 'Precios', 'Integraciones', 'FAQ'] },
        { title: 'Legal', items: ['Privacidad', 'Términos', 'Seguridad', 'Cookies'] }
    ]
}) => {
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-bold text-blue-600 mb-4 block">{brand}</span>
                        <p className="text-slate-500 leading-relaxed">
                            {description}
                        </p>
                    </div>
                    {links.map((column, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-slate-900 mb-4">{column.title}</h4>
                            <ul className="space-y-2">
                                {column.items.map((item, i) => (
                                    <li key={i}>
                                        <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} {brand}. Todos los derechos reservados.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        {/* Social Icons Placeholder */}
                        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterImpact;

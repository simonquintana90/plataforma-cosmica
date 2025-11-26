import React from 'react';

const GuaranteeSplit = ({
    title = "Garantía de Calidad",
    description = "Nuestro compromiso es total. Si no cumplimos con los objetivos establecidos en el plan inicial, te devolvemos tu inversión. Sin preguntas, sin letra pequeña.",
    image = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    theme = { bg: 'white', text: 'slate-900', accent: 'green-600' }
}) => {
    return (
        <div className={`py-20 bg-${theme.bg}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 border border-slate-100 shadow-sm">
                    <div className="flex-1">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${theme.accent} bg-opacity-10 text-${theme.accent} font-bold text-sm mb-6`}>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            100% Garantizado
                        </div>
                        <h2 className={`text-3xl font-bold text-${theme.text} mb-6`}>{title}</h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            {description}
                        </p>
                        <div className="flex items-center gap-4">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png" alt="Trusted" className="h-8 opacity-50" />
                            <div className="h-8 w-px bg-slate-300"></div>
                            <span className="text-sm font-semibold text-slate-500">Certificado ISO 9001</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-sm">
                        <div className="relative">
                            <div className={`absolute inset-0 bg-${theme.accent} rounded-2xl rotate-6 opacity-20`}></div>
                            <img src={image} alt="Guarantee" className="relative rounded-2xl shadow-xl w-full object-cover aspect-square" />
                            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-${theme.accent} flex items-center justify-center text-white`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Satisfacción</p>
                                    <p className="text-lg font-bold text-slate-900">100%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuaranteeSplit;

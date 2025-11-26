import React from 'react';

const ServicesMinimal = ({
    title = "Expertise",
    services = [
        { title: 'Brand Strategy', description: 'Positioning, Voice & Tone, Brand Architecture' },
        { title: 'Visual Identity', description: 'Logo Design, Color Systems, Typography, Iconography' },
        { title: 'Digital Design', description: 'Web Design, App Design, Design Systems, Prototyping' },
        { title: 'Development', description: 'Frontend, Backend, CMS Integration, E-commerce' }
    ]
}) => {
    return (
        <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-16">
                    <div className="md:w-1/3">
                        <h2 className="text-4xl font-bold text-slate-900 sticky top-8">{title}</h2>
                    </div>
                    <div className="md:w-2/3 space-y-12">
                        {services.map((service, index) => (
                            <div key={index} className="border-t border-slate-200 pt-8 group cursor-default">
                                <h3 className="text-2xl font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-lg text-slate-500 font-light">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesMinimal;

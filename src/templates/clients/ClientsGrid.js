import React from 'react';

const ClientsGrid = ({
    title = "Empresas que confían en nosotros",
    logos = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/2560px-Slack_Technologies_Logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/2560px-Airbnb_Logo_B%C3%A9lo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/2560px-LinkedIn_Logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
    ]
}) => {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-2xl font-bold text-slate-900 mb-12">{title}</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-slate-200">
                    {logos.map((logo, index) => (
                        <div key={index} className="flex items-center justify-center p-8 border-r border-b border-slate-200 hover:bg-slate-50 transition-colors h-32">
                            <img
                                src={logo}
                                alt={`Client ${index}`}
                                className="max-h-8 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientsGrid;

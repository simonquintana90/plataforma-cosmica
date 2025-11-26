import React from 'react';

const ClientsCapture = ({
    title = "Únete a +500 empresas exitosas",
    logos = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/2560px-Slack_Technologies_Logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
    ],
    testimonial = {
        quote: "El mejor servicio que hemos contratado este año.",
        author: "CEO, TechGiant"
    }
}) => {
    return (
        <div className="py-16 bg-indigo-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="md:w-1/3">
                    <h2 className="text-2xl font-bold mb-2">{title}</h2>
                    <p className="text-indigo-200 italic">"{testimonial.quote}" — {testimonial.author}</p>
                </div>
                <div className="md:w-2/3 flex flex-wrap justify-center md:justify-end items-center gap-8 md:gap-12">
                    {logos.map((logo, index) => (
                        <img
                            key={index}
                            src={logo}
                            alt={`Client ${index}`}
                            className="h-8 object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientsCapture;

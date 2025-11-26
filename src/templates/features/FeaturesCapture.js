import React from 'react';

const FeaturesCapture = ({
    title = "Nutrición Inteligente",
    subtitle = "Planes diseñados científicamente para tu bienestar.",
    features = [
        {
            title: 'Ingredientes Frescos',
            description: 'Seleccionamos lo mejor de la cosecha local cada mañana.',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Chef Experto',
            description: 'Platos gourmet preparados por profesionales culinarios.',
            image: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Entrega Rápida',
            description: 'Directo a tu puerta en el momento perfecto.',
            image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ]
}) => {
    return (
        <div className="py-24 bg-stone-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-stone-400 font-bold tracking-widest uppercase text-xs mb-4">Por qué elegirnos</h2>
                        <h3 className="text-4xl md:text-5xl font-bold leading-tight max-w-xl">
                            {title}
                        </h3>
                    </div>
                    <p className="text-stone-300 text-lg max-w-md border-l border-stone-700 pl-6">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group cursor-pointer">
                            <div className="relative h-80 w-full overflow-hidden rounded-2xl mb-6">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <h4 className="text-2xl font-bold mb-2 group-hover:text-stone-200 transition-colors">{feature.title}</h4>
                            <p className="text-stone-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesCapture;

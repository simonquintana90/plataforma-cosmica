import React from 'react';

const GalleryCapture = ({
    title = "Detalles que enamoran",
    images = [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
}) => {
    return (
        <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-extrabold text-center text-slate-900 mb-16">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:row-span-2 relative group overflow-hidden rounded-2xl shadow-xl">
                        <img src={images[0]} alt="Main Product" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                    </div>
                    <div className="relative group overflow-hidden rounded-2xl shadow-lg h-64 md:h-auto">
                        <img src={images[1]} alt="Detail 1" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="relative group overflow-hidden rounded-2xl shadow-lg h-64 md:h-auto">
                        <img src={images[2]} alt="Detail 2" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryCapture;

import React, { useState } from 'react';

const GalleryCinematic = ({
    title = "Visual Experience",
    images = [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    ]
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <div className="relative w-full h-96 md:h-[600px] overflow-hidden bg-black group">
            <div
                className="absolute inset-0 transition-transform duration-700 ease-out flex"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((img, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                        <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-8 left-8 z-10">
                <h2 className="text-white text-3xl font-bold tracking-widest uppercase">{title}</h2>
                <div className="flex space-x-2 mt-4">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 transition-all duration-300 ${index === currentIndex ? 'w-8 bg-cyan-400' : 'w-4 bg-gray-600'}`}
                        ></div>
                    ))}
                </div>
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-cyan-500/50 transition-colors opacity-0 group-hover:opacity-100"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-cyan-500/50 transition-colors opacity-0 group-hover:opacity-100"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default GalleryCinematic;

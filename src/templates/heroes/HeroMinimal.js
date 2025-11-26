import React from 'react';

const HeroMinimal = ({
    title = "Providing guidance to individuals and organisations for better mental health.",
    ctaText = "Book a counsellor",
    images = [
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1531297461136-82lw9z1w1w1w?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
}) => {
    return (
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col justify-between font-serif relative overflow-hidden">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-8 max-w-7xl mx-auto w-full">
                <div className="text-sm font-medium text-slate-900">Menu</div>
                <div className="text-2xl italic font-medium text-slate-900">Sensa</div>
                <button className="bg-[#F4F678] px-6 py-2 text-sm font-medium text-slate-900 hover:bg-[#eaea60] transition-colors">
                    {ctaText}
                </button>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto z-10">
                <h1 className="text-4xl md:text-6xl lg:text-7xl text-slate-900 leading-tight mb-12">
                    {title}
                </h1>
                <button className="bg-[#F4F678] px-8 py-3 text-base font-medium text-slate-900 hover:bg-[#eaea60] transition-colors">
                    {ctaText}
                </button>
            </main>

            {/* Bottom Images */}
            <div className="grid grid-cols-2 md:grid-cols-4 w-full h-48 md:h-64 mt-12">
                {images.map((img, i) => (
                    <div key={i} className="relative overflow-hidden group">
                        <img
                            src={img}
                            alt={`Gallery ${i}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {i === 3 && (
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                <button className="bg-white px-4 py-1 text-xs font-bold rounded shadow-sm hover:bg-slate-50">Buy Template</button>
                                <button className="bg-white px-4 py-1 text-xs font-bold rounded shadow-sm hover:bg-slate-50">Made in Framer</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroMinimal;

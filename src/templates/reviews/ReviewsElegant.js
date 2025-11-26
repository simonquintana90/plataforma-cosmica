import React from 'react';

const ReviewsElegant = ({
    quote = "Trabajar con este equipo ha sido una de las mejores decisiones que hemos tomado. Su atención al detalle y compromiso con la excelencia son incomparables.",
    author = "Sofía Vergara",
    role = "Directora Creativa, Studio X",
    image = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
}) => {
    return (
        <div className="py-32 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="mb-8 text-slate-300">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V3H19.017C20.6739 3 22.017 4.34315 22.017 6V15C22.017 16.6569 20.6739 18 19.017 18H16.017V21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 7.55228 5.0166 7V3H10.0166C11.6735 3 13.0166 4.34315 13.0166 6V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166V21H5.0166Z" />
                    </svg>
                </div>

                <h2 className="text-2xl md:text-4xl font-serif text-slate-900 leading-relaxed mb-12">
                    "{quote}"
                </h2>

                <div className="flex flex-col items-center">
                    <img src={image} alt={author} className="w-16 h-16 rounded-full object-cover mb-4 shadow-lg" />
                    <h3 className="text-lg font-bold text-slate-900">{author}</h3>
                    <p className="text-slate-500">{role}</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewsElegant;

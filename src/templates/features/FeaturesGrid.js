import React from 'react';

const FeaturesGrid = ({
    title = "A better way to send money",
    subtitle = "Lorem ipsum dolor sit amet consect adipisicing elit. Possimus magnam voluptatum cupiditate veritatis in accusamus quisquam.",
    features = [
        { name: 'Competitive exchange rates', description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.', icon: 'globe' },
        { name: 'No hidden fees', description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.', icon: 'scale' },
        { name: 'Transfers are instant', description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.', icon: 'lightning' },
    ],
    theme = { primary: 'indigo-600', text: 'gray-900' }
}) => {
    return (
        <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center">
                    <h2 className={`text-base text-${theme.primary} font-semibold tracking-wide uppercase`}>Features</h2>
                    <p className={`mt-2 text-3xl leading-8 font-extrabold tracking-tight text-${theme.text} sm:text-4xl`}>
                        {title}
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        {subtitle}
                    </p>
                </div>

                <div className="mt-10">
                    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div key={index} className="relative">
                                <dt>
                                    <div className={`absolute flex items-center justify-center h-12 w-12 rounded-md bg-${theme.primary} text-white`}>
                                        {/* Simple placeholder icons */}
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <p className={`ml-16 text-lg leading-6 font-medium text-${theme.text}`}>{feature.name}</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    {feature.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default FeaturesGrid;

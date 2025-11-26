import React, { useState } from 'react';
import HeroModern from '../templates/heroes/HeroModern';
import HeroSplit from '../templates/heroes/HeroSplit';
import HeroCollage from '../templates/heroes/HeroCollage';
import HeroOverlay from '../templates/heroes/HeroOverlay';
import HeroForm from '../templates/heroes/HeroForm';
import HeroMinimal from '../templates/heroes/HeroMinimal';
import FeaturesGrid from '../templates/features/FeaturesGrid';

const TemplateGalleryPage = () => {
    const [activeTab, setActiveTab] = useState('heroes');

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Librería de Plantillas (LEGOs)</h1>

            <div className="flex space-x-4 mb-8">
                <button onClick={() => setActiveTab('heroes')} className={`px-4 py-2 rounded-md ${activeTab === 'heroes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Heroes</button>
                <button onClick={() => setActiveTab('features')} className={`px-4 py-2 rounded-md ${activeTab === 'features' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Features</button>
            </div>

            {activeTab === 'heroes' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Collage (EduFlex Style)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroCollage />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Overlay (Eyebot Style)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroOverlay />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Form (Calori Style)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroForm />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Minimal (Sensa Style)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroMinimal />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Modern (Original)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroModern />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Split (Original)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroSplit />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'features' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Features Grid</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <FeaturesGrid />
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default TemplateGalleryPage;

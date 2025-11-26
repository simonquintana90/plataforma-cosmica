import React, { useState } from 'react';
import HeroImpact from '../templates/heroes/HeroImpact';
import HeroCinematic from '../templates/heroes/HeroCinematic';
import HeroCapture from '../templates/heroes/HeroCapture';
import HeroElegant from '../templates/heroes/HeroElegant';
import FeaturesImpact from '../templates/features/FeaturesImpact';
import FeaturesCinematic from '../templates/features/FeaturesCinematic';
import FeaturesCapture from '../templates/features/FeaturesCapture';
import FeaturesElegant from '../templates/features/FeaturesElegant';
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
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Impacto (Estilo EduFlex)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroImpact />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Cinemático (Estilo Eyebot)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroCinematic />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Captura (Estilo Calori)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroCapture />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Hero Elegante (Estilo Sensa)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <HeroElegant />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'features' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Features Impacto (Estilo EduFlex)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <FeaturesImpact />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Features Cinemático (Estilo Eyebot)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <FeaturesCinematic />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Features Captura (Estilo Calori)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <FeaturesCapture />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Features Elegante (Estilo Sensa)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <FeaturesElegant />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Features Grid (Original)</h2>
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

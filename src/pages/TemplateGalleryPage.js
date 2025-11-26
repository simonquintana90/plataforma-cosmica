import React, { useState } from 'react';
import HeroImpact from '../templates/heroes/HeroImpact';
import HeroCinematic from '../templates/heroes/HeroCinematic';
import HeroCapture from '../templates/heroes/HeroCapture';
import HeroElegant from '../templates/heroes/HeroElegant';
import FeaturesImpact from '../templates/features/FeaturesImpact';
import FeaturesCinematic from '../templates/features/FeaturesCinematic';
import FeaturesCapture from '../templates/features/FeaturesCapture';
import FeaturesElegant from '../templates/features/FeaturesElegant';
import NavbarSimple from '../templates/navbars/NavbarSimple';
import ServicesList from '../templates/services/ServicesList';
import InfoSimple from '../templates/info/InfoSimple';
import ClientsLogos from '../templates/clients/ClientsLogos';

const TemplateGalleryPage = () => {
    const [activeTab, setActiveTab] = useState('heroes');

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Librería de Plantillas (LEGOs)</h1>

            <div className="flex space-x-4 mb-8 overflow-x-auto pb-4">
                {['heroes', 'features', 'navbars', 'services', 'info', 'clients'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md capitalize whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
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

            {activeTab === 'navbars' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Navbar Simple</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <NavbarSimple />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'services' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Lista de Servicios</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ServicesList />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'info' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Información Adicional</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <InfoSimple />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'clients' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Logos de Clientes</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ClientsLogos />
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default TemplateGalleryPage;

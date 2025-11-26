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
import NavbarCentered from '../templates/navbars/NavbarCentered';
import NavbarTransparent from '../templates/navbars/NavbarTransparent';
import ServicesList from '../templates/services/ServicesList';
import ServicesCards from '../templates/services/ServicesCards';
import ServicesMinimal from '../templates/services/ServicesMinimal';
import InfoSimple from '../templates/info/InfoSimple';
import InfoSplit from '../templates/info/InfoSplit';
import InfoStats from '../templates/info/InfoStats';
import ClientsLogos from '../templates/clients/ClientsLogos';
import ClientsGrid from '../templates/clients/ClientsGrid';
import GuaranteeSimple from '../templates/guarantee/GuaranteeSimple';
import GuaranteeSplit from '../templates/guarantee/GuaranteeSplit';
import ReviewsSlider from '../templates/reviews/ReviewsSlider';
import ReviewsGrid from '../templates/reviews/ReviewsGrid';
import ReviewsMinimal from '../templates/reviews/ReviewsMinimal';
import GalleryGrid from '../templates/gallery/GalleryGrid';
import GalleryMasonry from '../templates/gallery/GalleryMasonry';
import CTACentered from '../templates/cta/CTACentered';
import CTASplit from '../templates/cta/CTASplit';

const TemplateGalleryPage = () => {
    const [activeTab, setActiveTab] = useState('heroes');

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Librería de Plantillas (LEGOs)</h1>

            <div className="flex space-x-4 mb-8 overflow-x-auto pb-4">
                {['heroes', 'features', 'navbars', 'services', 'info', 'clients', 'guarantee', 'reviews', 'gallery', 'cta'].map(tab => (
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
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Navbar Centrado</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <NavbarCentered />
                        </div>
                    </section>
                    <section className="bg-slate-800 p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Navbar Transparente (Sobre fondo oscuro)</h2>
                        <div className="border border-gray-700 rounded-lg overflow-hidden relative h-64 bg-gradient-to-r from-slate-900 to-slate-800">
                            <NavbarTransparent />
                            <div className="absolute inset-0 flex items-center justify-center text-white opacity-20">Contenido de fondo</div>
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
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Tarjetas de Servicios</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ServicesCards />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Servicios Minimalista</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ServicesMinimal />
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
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Información Split (Texto + Imagen)</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <InfoSplit />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Estadísticas</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <InfoStats />
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
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Grid de Clientes</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ClientsGrid />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'guarantee' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Garantía Simple</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <GuaranteeSimple />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Garantía Split</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <GuaranteeSplit />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Slider de Testimonios</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ReviewsSlider />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Grid de Testimonios</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ReviewsGrid />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Testimonio Minimalista</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ReviewsMinimal />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'gallery' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Grid de Galería</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <GalleryGrid />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">Galería Masonry</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <GalleryMasonry />
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'cta' && (
                <div className="space-y-12">
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">CTA Centrado</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <CTACentered />
                        </div>
                    </section>
                    <section className="bg-white p-4 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-400">CTA Split</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <CTASplit />
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default TemplateGalleryPage;

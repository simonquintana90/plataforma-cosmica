import React, { useState } from 'react';

// Heroes
import HeroImpact from '../templates/heroes/HeroImpact';
import HeroCinematic from '../templates/heroes/HeroCinematic';
import HeroCapture from '../templates/heroes/HeroCapture';
import HeroElegant from '../templates/heroes/HeroElegant';

// Features
import FeaturesImpact from '../templates/features/FeaturesImpact';
import FeaturesCinematic from '../templates/features/FeaturesCinematic';
import FeaturesCapture from '../templates/features/FeaturesCapture';
import FeaturesElegant from '../templates/features/FeaturesElegant';

// Navbars
import NavbarImpact from '../templates/navbars/NavbarImpact';
import NavbarCinematic from '../templates/navbars/NavbarCinematic';
import NavbarCapture from '../templates/navbars/NavbarCapture';
import NavbarElegant from '../templates/navbars/NavbarElegant';

// Services
import ServicesImpact from '../templates/services/ServicesImpact';
import ServicesCinematic from '../templates/services/ServicesCinematic';
import ServicesCapture from '../templates/services/ServicesCapture';
import ServicesElegant from '../templates/services/ServicesElegant';

// Info
import InfoImpact from '../templates/info/InfoImpact';
import InfoCinematic from '../templates/info/InfoCinematic';
import InfoCapture from '../templates/info/InfoCapture';
import InfoElegant from '../templates/info/InfoElegant';

// Clients
import ClientsImpact from '../templates/clients/ClientsImpact';
import ClientsCinematic from '../templates/clients/ClientsCinematic';
import ClientsCapture from '../templates/clients/ClientsCapture';
import ClientsElegant from '../templates/clients/ClientsElegant';

// Guarantee
import GuaranteeImpact from '../templates/guarantee/GuaranteeImpact';
import GuaranteeCinematic from '../templates/guarantee/GuaranteeCinematic';
import GuaranteeCapture from '../templates/guarantee/GuaranteeCapture';
import GuaranteeElegant from '../templates/guarantee/GuaranteeElegant';

// Reviews
import ReviewsImpact from '../templates/reviews/ReviewsImpact';
import ReviewsCinematic from '../templates/reviews/ReviewsCinematic';
import ReviewsCapture from '../templates/reviews/ReviewsCapture';
import ReviewsElegant from '../templates/reviews/ReviewsElegant';

// Gallery
import GalleryImpact from '../templates/gallery/GalleryImpact';
import GalleryCinematic from '../templates/gallery/GalleryCinematic';
import GalleryCapture from '../templates/gallery/GalleryCapture';
import GalleryElegant from '../templates/gallery/GalleryElegant';

// CTA
import CTAImpact from '../templates/cta/CTAImpact';
import CTACinematic from '../templates/cta/CTACinematic';
import CTACapture from '../templates/cta/CTACapture';
import CTAElegant from '../templates/cta/CTAElegant';

// Footers
import FooterImpact from '../templates/footers/FooterImpact';
import FooterCinematic from '../templates/footers/FooterCinematic';
import FooterCapture from '../templates/footers/FooterCapture';
import FooterElegant from '../templates/footers/FooterElegant';

const TemplateGalleryPage = () => {
    const [activeTab, setActiveTab] = useState('heroes');

    const tabs = [
        'heroes', 'features', 'navbars', 'services', 'info',
        'clients', 'guarantee', 'reviews', 'gallery', 'cta', 'footers'
    ];

    const renderSection = (title, Component) => (
        <section className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-700">{title}</h2>
                <span className="text-xs font-mono text-gray-400 bg-gray-200 px-2 py-1 rounded">
                    {Component.name}
                </span>
            </div>
            <div className="relative">
                <Component />
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Librería de Plantillas <span className="text-blue-600">Cosmica</span>
                    </h1>
                    <p className="text-lg text-gray-600">
                        Sistema de diseño modular con 4 estilos visuales consistentes.
                    </p>
                </header>

                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab
                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-500 shadow-sm'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="animate-fade-in">
                    {activeTab === 'heroes' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", HeroImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", HeroCinematic)}
                            {renderSection("Estilo Capture (Calori)", HeroCapture)}
                            {renderSection("Estilo Elegant (Sensa)", HeroElegant)}
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", FeaturesImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", FeaturesCinematic)}
                            {renderSection("Estilo Capture (Calori)", FeaturesCapture)}
                            {renderSection("Estilo Elegant (Sensa)", FeaturesElegant)}
                        </div>
                    )}

                    {activeTab === 'navbars' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", NavbarImpact)}
                            <section className="bg-slate-900 rounded-xl shadow-lg overflow-hidden mb-12 border border-slate-700">
                                <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-white">Estilo Cinematic (Eyebot)</h2>
                                    <span className="text-xs font-mono text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                        NavbarCinematic
                                    </span>
                                </div>
                                <div className="relative h-64">
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-bold">Preview Context (Dark)</div>
                                    <NavbarCinematic />
                                </div>
                            </section>
                            {renderSection("Estilo Capture (Calori)", NavbarCapture)}
                            {renderSection("Estilo Elegant (Sensa)", NavbarElegant)}
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", ServicesImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", ServicesCinematic)}
                            {renderSection("Estilo Capture (Calori)", ServicesCapture)}
                            {renderSection("Estilo Elegant (Sensa)", ServicesElegant)}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", InfoImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", InfoCinematic)}
                            {renderSection("Estilo Capture (Calori)", InfoCapture)}
                            {renderSection("Estilo Elegant (Sensa)", InfoElegant)}
                        </div>
                    )}

                    {activeTab === 'clients' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", ClientsImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", ClientsCinematic)}
                            {renderSection("Estilo Capture (Calori)", ClientsCapture)}
                            {renderSection("Estilo Elegant (Sensa)", ClientsElegant)}
                        </div>
                    )}

                    {activeTab === 'guarantee' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", GuaranteeImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", GuaranteeCinematic)}
                            {renderSection("Estilo Capture (Calori)", GuaranteeCapture)}
                            {renderSection("Estilo Elegant (Sensa)", GuaranteeElegant)}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", ReviewsImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", ReviewsCinematic)}
                            {renderSection("Estilo Capture (Calori)", ReviewsCapture)}
                            {renderSection("Estilo Elegant (Sensa)", ReviewsElegant)}
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", GalleryImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", GalleryCinematic)}
                            {renderSection("Estilo Capture (Calori)", GalleryCapture)}
                            {renderSection("Estilo Elegant (Sensa)", GalleryElegant)}
                        </div>
                    )}

                    {activeTab === 'cta' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", CTAImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", CTACinematic)}
                            {renderSection("Estilo Capture (Calori)", CTACapture)}
                            {renderSection("Estilo Elegant (Sensa)", CTAElegant)}
                        </div>
                    )}

                    {activeTab === 'footers' && (
                        <div className="space-y-8">
                            {renderSection("Estilo Impact (EduFlex)", FooterImpact)}
                            {renderSection("Estilo Cinematic (Eyebot)", FooterCinematic)}
                            {renderSection("Estilo Capture (Calori)", FooterCapture)}
                            {renderSection("Estilo Elegant (Sensa)", FooterElegant)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateGalleryPage;

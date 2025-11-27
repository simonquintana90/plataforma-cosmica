import React from 'react';

// Heroes
import HeroImpact from '../../templates/heroes/HeroImpact';
import HeroCinematic from '../../templates/heroes/HeroCinematic';
import HeroCapture from '../../templates/heroes/HeroCapture';
import HeroElegant from '../../templates/heroes/HeroElegant';

// Features
import FeaturesImpact from '../../templates/features/FeaturesImpact';
import FeaturesCinematic from '../../templates/features/FeaturesCinematic';
import FeaturesCapture from '../../templates/features/FeaturesCapture';
import FeaturesElegant from '../../templates/features/FeaturesElegant';

// Navbars
import NavbarImpact from '../../templates/navbars/NavbarImpact';
import NavbarCinematic from '../../templates/navbars/NavbarCinematic';
import NavbarCapture from '../../templates/navbars/NavbarCapture';
import NavbarElegant from '../../templates/navbars/NavbarElegant';

// Services
import ServicesImpact from '../../templates/services/ServicesImpact';
import ServicesCinematic from '../../templates/services/ServicesCinematic';
import ServicesCapture from '../../templates/services/ServicesCapture';
import ServicesElegant from '../../templates/services/ServicesElegant';

// Info
import InfoImpact from '../../templates/info/InfoImpact';
import InfoCinematic from '../../templates/info/InfoCinematic';
import InfoCapture from '../../templates/info/InfoCapture';
import InfoElegant from '../../templates/info/InfoElegant';

// Clients
import ClientsImpact from '../../templates/clients/ClientsImpact';
import ClientsCinematic from '../../templates/clients/ClientsCinematic';
import ClientsCapture from '../../templates/clients/ClientsCapture';
import ClientsElegant from '../../templates/clients/ClientsElegant';

// Guarantee
import GuaranteeImpact from '../../templates/guarantee/GuaranteeImpact';
import GuaranteeCinematic from '../../templates/guarantee/GuaranteeCinematic';
import GuaranteeCapture from '../../templates/guarantee/GuaranteeCapture';
import GuaranteeElegant from '../../templates/guarantee/GuaranteeElegant';

// Reviews
import ReviewsImpact from '../../templates/reviews/ReviewsImpact';
import ReviewsCinematic from '../../templates/reviews/ReviewsCinematic';
import ReviewsCapture from '../../templates/reviews/ReviewsCapture';
import ReviewsElegant from '../../templates/reviews/ReviewsElegant';

// Gallery
import GalleryImpact from '../../templates/gallery/GalleryImpact';
import GalleryCinematic from '../../templates/gallery/GalleryCinematic';
import GalleryCapture from '../../templates/gallery/GalleryCapture';
import GalleryElegant from '../../templates/gallery/GalleryElegant';

// CTA
import CTAImpact from '../../templates/cta/CTAImpact';
import CTACinematic from '../../templates/cta/CTACinematic';
import CTACapture from '../../templates/cta/CTACapture';
import CTAElegant from '../../templates/cta/CTAElegant';

// Footers
import FooterImpact from '../../templates/footers/FooterImpact';
import FooterCinematic from '../../templates/footers/FooterCinematic';
import FooterCapture from '../../templates/footers/FooterCapture';
import FooterElegant from '../../templates/footers/FooterElegant';

const COMPONENT_MAP = {
    // Heroes
    HeroImpact, HeroCinematic, HeroCapture, HeroElegant,
    // Features
    FeaturesImpact, FeaturesCinematic, FeaturesCapture, FeaturesElegant,
    // Navbars
    NavbarImpact, NavbarCinematic, NavbarCapture, NavbarElegant,
    // Services
    ServicesImpact, ServicesCinematic, ServicesCapture, ServicesElegant,
    // Info
    InfoImpact, InfoCinematic, InfoCapture, InfoElegant,
    // Clients
    ClientsImpact, ClientsCinematic, ClientsCapture, ClientsElegant,
    // Guarantee
    GuaranteeImpact, GuaranteeCinematic, GuaranteeCapture, GuaranteeElegant,
    // Reviews
    ReviewsImpact, ReviewsCinematic, ReviewsCapture, ReviewsElegant,
    // Gallery
    GalleryImpact, GalleryCinematic, GalleryCapture, GalleryElegant,
    // CTA
    CTAImpact, CTACinematic, CTACapture, CTAElegant,
    // Footers
    FooterImpact, FooterCinematic, FooterCapture, FooterElegant
};

const WebsiteBuilder = ({ siteConfig }) => {
    if (!siteConfig || !siteConfig.sections) {
        return <div className="text-center p-10 text-gray-500">No site configuration provided.</div>;
    }

    return (
        <div className="w-full min-h-screen bg-white">
            {siteConfig.sections.map((section, index) => {
                const Component = COMPONENT_MAP[section.type];

                if (!Component) {
                    console.warn(`Component type "${section.type}" not found.`);
                    return (
                        <div key={section.id || index} className="p-4 border-2 border-dashed border-red-300 bg-red-50 text-red-500 text-center">
                            Component "{section.type}" not found.
                        </div>
                    );
                }

                return (
                    <div key={section.id || index} id={section.id}>
                        <Component {...section.content} theme={siteConfig.theme} />
                    </div>
                );
            })}
        </div>
    );
};

export default WebsiteBuilder;

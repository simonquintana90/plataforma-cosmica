
// Component Sets mapped to styles
const STYLES = {
    impact: {
        navbar: 'NavbarImpact',
        hero: 'HeroImpact',
        features: 'FeaturesImpact',
        services: 'ServicesImpact',
        info: 'InfoImpact',
        clients: 'ClientsImpact',
        guarantee: 'GuaranteeImpact',
        reviews: 'ReviewsImpact',
        gallery: 'GalleryImpact',
        cta: 'CTAImpact',
        footer: 'FooterImpact',
        theme: { mode: 'light', secondary: 'slate-900' }
    },
    cinematic: {
        navbar: 'NavbarCinematic',
        hero: 'HeroCinematic',
        features: 'FeaturesCinematic',
        services: 'ServicesCinematic',
        info: 'InfoCinematic',
        clients: 'ClientsCinematic',
        guarantee: 'GuaranteeCinematic',
        reviews: 'ReviewsCinematic',
        gallery: 'GalleryCinematic',
        cta: 'CTACinematic',
        footer: 'FooterCinematic',
        theme: { mode: 'dark', secondary: 'slate-900' }
    },
    capture: {
        navbar: 'NavbarCapture',
        hero: 'HeroCapture',
        features: 'FeaturesCapture',
        services: 'ServicesCapture',
        info: 'InfoCapture',
        clients: 'ClientsCapture',
        guarantee: 'GuaranteeCapture',
        reviews: 'ReviewsCapture',
        gallery: 'GalleryCapture',
        cta: 'CTACapture',
        footer: 'FooterCapture',
        theme: { mode: 'light', secondary: 'stone-900' }
    },
    elegant: {
        navbar: 'NavbarElegant',
        hero: 'HeroElegant',
        features: 'FeaturesElegant',
        services: 'ServicesElegant',
        info: 'InfoElegant',
        clients: 'ClientsElegant',
        guarantee: 'GuaranteeElegant',
        reviews: 'ReviewsElegant',
        gallery: 'GalleryElegant',
        cta: 'CTAElegant',
        footer: 'FooterElegant',
        theme: { mode: 'light', secondary: 'stone-600' }
    }
};

const FONTS = {
    modern: 'Inter, sans-serif',
    elegant: '"Playfair Display", serif',
    bold: 'Oswald, sans-serif',
    friendly: 'Nunito, sans-serif'
};

// Industry-specific text templates (SPANISH)
const INDUSTRY_CONTENT = {
    technology: {
        hero: {
            title: "Innovación Tecnológica en [City]",
            subtitle: "Transformamos negocios con soluciones de software de vanguardia.",
            cta: "Empezar Ahora"
        },
        features: {
            title: "Tecnología Avanzada",
            subtitle: "Escalable, seguro y rápido."
        },
        cta: {
            title: "¿Listo para Escalar?",
            subtitle: "Únete a la revolución digital hoy mismo.",
            cta: "Contáctanos"
        }
    },
    health: {
        hero: {
            title: "Tu Salud es Nuestra Prioridad",
            subtitle: "Cuidado médico experto y compasivo para ti y tu familia en [City].",
            cta: "Agendar Cita"
        },
        features: {
            title: "¿Por qué elegirnos?",
            subtitle: "Instalaciones modernas y profesionales dedicados."
        },
        cta: {
            title: "Tu Bienestar Primero",
            subtitle: "Agenda tu visita ahora.",
            cta: "Contactar"
        }
    },
    legal: {
        hero: {
            title: "Justicia e Integridad",
            subtitle: "Representación legal experta en [City] para casos complejos.",
            cta: "Consulta Gratis"
        },
        features: {
            title: "Áreas de Práctica",
            subtitle: "Soluciones legales integrales."
        },
        cta: {
            title: "Protege tus Derechos",
            subtitle: "Habla con un abogado hoy.",
            cta: "Llamar Ahora"
        }
    },
    restaurant: {
        hero: {
            title: "Sabor y Tradición",
            subtitle: "Los mejores sabores auténticos en un ambiente acogedor en [City].",
            cta: "Reservar Mesa"
        },
        features: {
            title: "Nuestras Especialidades",
            subtitle: "Ingredientes frescos, platos inolvidables."
        },
        cta: {
            title: "¿Con Hambre?",
            subtitle: "Pide en línea o visítanos.",
            cta: "Ver Menú"
        }
    },
    general: {
        hero: {
            title: "Bienvenidos a [Business Name]",
            subtitle: "Ofrecemos servicios de excelencia para ayudarte a crecer.",
            cta: "Saber Más"
        },
        features: {
            title: "Nuestras Características",
            subtitle: "Lo que nos hace únicos."
        },
        cta: {
            title: "Contáctanos",
            subtitle: "Estamos aquí para ayudarte.",
            cta: "Contactar"
        }
    }
};


// Component Selection Logic based on Industry & Content Type
const COMPONENT_STRATEGY = {
    technology: {
        hero: 'HeroCinematic',
        features: 'FeaturesCinematic',
        services: 'ServicesImpact',
        cta: 'CTACinematic'
    },
    health: {
        hero: 'HeroCapture',
        features: 'FeaturesElegant',
        services: 'ServicesCapture',
        cta: 'CTACapture'
    },
    legal: {
        hero: 'HeroElegant',
        features: 'FeaturesImpact',
        services: 'ServicesElegant',
        cta: 'CTAElegant'
    },
    restaurant: {
        hero: 'HeroCapture',
        features: 'FeaturesCapture',
        services: 'ServicesCinematic',
        cta: 'CTACapture'
    },
    general: {
        hero: 'HeroImpact',
        features: 'FeaturesImpact',
        services: 'ServicesImpact',
        cta: 'CTAImpact'
    }
};

export const generateWebsiteConfig = (formData) => {
    const {
        businessName,
        industry,
        description,
        style,
        brandColors, // Now an object { primary, secondary, accent }
        fontPairing,
        mainCity,
        mainService,
        logoUrl,
        uniqueAspect,
        processStepByStep,
        servicesInclude
    } = formData;

    // 1. Determine Global Theme based on User Preference & Brand Colors
    const baseTheme = STYLES[style]?.theme || STYLES.impact.theme;

    // Robust Fallback Logic
    const primaryColor = brandColors?.primary || baseTheme.primary || '#3B82F6';
    const secondaryColor = brandColors?.secondary || baseTheme.secondary || '#1E293B';
    const accentColor = brandColors?.accent || '#F59E0B';

    const globalTheme = {
        ...baseTheme,
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        font: FONTS[fontPairing] || FONTS.modern
    };

    // 2. Select Component Structures
    const strategy = COMPONENT_STRATEGY[industry] || {
        hero: STYLES[style].hero,
        features: STYLES[style].features,
        services: STYLES[style].services,
        cta: STYLES[style].cta
    };

    // 3. Select Content based on Industry
    const contentTemplates = INDUSTRY_CONTENT[industry] || INDUSTRY_CONTENT.general;

    // 4. SEO & Content Optimization
    const city = mainCity || "Colombia";
    const service = mainService || "Servicios Profesionales";

    // Dynamic Title Logic: Service + City
    const heroTitle = contentTemplates.hero.title
        .replace("[City]", city)
        .replace("[Business Name]", businessName || "Tu Empresa");

    // If generic, try to construct a better title from form data
    const finalHeroTitle = (industry === 'general' && mainService)
        ? `${mainService} en ${city}`
        : heroTitle;

    const metaDescription = `${service} en ${city}. ${uniqueAspect || description || ''}`.substring(0, 160);

    // 5. Construct JSON
    return {
        meta: {
            title: `${businessName || "Mi Sitio"} | ${service}`,
            description: metaDescription
        },
        theme: globalTheme,
        sections: [
            {
                id: "navbar",
                type: STYLES[style].navbar,
                content: {
                    logo: logoUrl || businessName || "Logo", // Use uploaded logo URL if available
                    isImageLogo: !!logoUrl,
                    links: [
                        { name: "Inicio", href: "#" },
                        { name: "Servicios", href: "#services" },
                        { name: "Nosotros", href: "#about" },
                        { name: "Contacto", href: "#contact" }
                    ],
                    ctaText: "Contactar"
                }
            },
            {
                id: "hero",
                type: strategy.hero,
                content: {
                    title: finalHeroTitle,
                    subtitle: uniqueAspect || contentTemplates.hero.subtitle,
                    ctaText: contentTemplates.hero.cta
                }
            },
            {
                id: "features",
                type: strategy.features,
                content: {
                    title: "Por qué elegirnos",
                    subtitle: uniqueAspect || contentTemplates.features.subtitle,
                    // We could parse 'uniqueAspect' or 'guarantees' to generate feature items if we had an LLM here.
                    // For now, we keep the component's default items or generic ones.
                }
            },
            {
                id: "services",
                type: strategy.services,
                content: {
                    title: "Nuestros Servicios",
                    subtitle: servicesInclude || "Soluciones integrales para tus necesidades.",
                    // Again, 'servicesInclude' is a text block. Ideally we'd split it.
                    // The component will likely render generic items if not provided specific list.
                }
            },
            {
                id: "info",
                type: STYLES[style].info,
                content: {
                    title: "Sobre Nosotros",
                    description: processStepByStep
                        ? `Nuestro proceso: ${processStepByStep}`
                        : `En ${businessName || "nuestra empresa"}, nos dedicamos a ofrecer la mejor calidad.`
                }
            },
            // Removed Gallery/Reviews if no real data to avoid "fake" stats/photos
            // We can add them back if the user provides images/reviews in the future.
            {
                id: "cta",
                type: strategy.cta,
                content: {
                    title: contentTemplates.cta.title,
                    subtitle: contentTemplates.cta.subtitle,
                    ctaText: contentTemplates.cta.cta
                }
            },
            {
                id: "footer",
                type: STYLES[style].footer,
                content: {
                    brand: businessName || "Marca",
                    tagline: uniqueAspect || "Excelencia en cada detalle."
                }
            }
        ]
    };
};

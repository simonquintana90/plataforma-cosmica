
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
        theme: { mode: 'light', primary: 'indigo-600', secondary: 'slate-900' }
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
        theme: { mode: 'dark', primary: 'cyan-500', secondary: 'slate-900' }
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
        theme: { mode: 'light', primary: 'orange-500', secondary: 'stone-900' }
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
        theme: { mode: 'light', primary: 'stone-800', secondary: 'stone-600' }
    }
};

// Industry-specific text templates
const INDUSTRY_CONTENT = {
    technology: {
        hero: {
            title: "Innovating for the Future",
            subtitle: "We build cutting-edge software solutions that transform businesses.",
            cta: "Start Building"
        },
        features: {
            title: "Powered by Advanced Tech",
            subtitle: "Scalable, secure, and lightning fast."
        },
        cta: {
            title: "Ready to Scale?",
            subtitle: "Join the revolution today.",
            cta: "Get Started"
        }
    },
    health: {
        hero: {
            title: "Care You Can Trust",
            subtitle: "Dedicated to providing the best healthcare services for you and your family.",
            cta: "Book Appointment"
        },
        features: {
            title: "Why Choose Us?",
            subtitle: "Compassionate care with modern facilities."
        },
        cta: {
            title: "Your Health Comes First",
            subtitle: "Schedule your visit now.",
            cta: "Contact Us"
        }
    },
    legal: {
        hero: {
            title: "Justice & Integrity",
            subtitle: "Expert legal representation for complex matters.",
            cta: "Free Consultation"
        },
        features: {
            title: "Areas of Practice",
            subtitle: "Comprehensive legal solutions."
        },
        cta: {
            title: "Protect Your Rights",
            subtitle: "Speak with an attorney today.",
            cta: "Call Now"
        }
    },
    restaurant: {
        hero: {
            title: "Taste the Tradition",
            subtitle: "Authentic flavors in a warm, welcoming atmosphere.",
            cta: "Reserve a Table"
        },
        features: {
            title: "Our Specialties",
            subtitle: "Fresh ingredients, unforgettable dishes."
        },
        cta: {
            title: "Hungry?",
            subtitle: "Order online or visit us.",
            cta: "See Menu"
        }
    },
    general: {
        hero: {
            title: "Welcome to [Business Name]",
            subtitle: "We provide excellent services to help you succeed.",
            cta: "Learn More"
        },
        features: {
            title: "Our Features",
            subtitle: "What makes us unique."
        },
        cta: {
            title: "Get in Touch",
            subtitle: "We are here to help.",
            cta: "Contact Us"
        }
    }
};


// Component Selection Logic based on Industry & Content Type
// This allows mixing "Structure" (Component) with "Style" (Theme)
const COMPONENT_STRATEGY = {
    technology: {
        hero: 'HeroCinematic', // Tech needs impact/dark mode
        features: 'FeaturesCinematic', // Tech features usually have specs/cards
        services: 'ServicesImpact', // Clean list of services
        cta: 'CTACinematic'
    },
    health: {
        hero: 'HeroCapture', // Trust/People focused
        features: 'FeaturesElegant', // Clean, minimal, trustworthy
        services: 'ServicesCapture', // Visual services
        cta: 'CTACapture'
    },
    legal: {
        hero: 'HeroElegant', // Professional, serious
        features: 'FeaturesImpact', // Clear, structured
        services: 'ServicesElegant', // Minimal
        cta: 'CTAElegant'
    },
    restaurant: {
        hero: 'HeroCapture', // Visual/Food focused
        features: 'FeaturesCapture', // Visual menu items
        services: 'ServicesCinematic', // Dark ambiance for dining
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
    const { businessName, industry, description, style } = formData;

    // 1. Determine Global Theme based on User Preference
    // This ensures "Design Consistency" even if components are mixed.
    const globalTheme = STYLES[style]?.theme || STYLES.impact.theme;

    // 2. Select Component Structures based on Industry (The "AI" Logic)
    // We prioritize the structure that best fits the content.
    // If the user didn't specify an industry, we fallback to the selected style's default components.
    const strategy = COMPONENT_STRATEGY[industry] || {
        hero: STYLES[style].hero,
        features: STYLES[style].features,
        services: STYLES[style].services,
        cta: STYLES[style].cta
    };

    // 3. Select Content based on Industry
    const content = INDUSTRY_CONTENT[industry] || INDUSTRY_CONTENT.general;

    // 4. Construct JSON
    return {
        meta: {
            title: businessName || "My New Website",
            description: description || "Generated by Cosmica AI"
        },
        theme: globalTheme, // <--- CRITICAL: Global Theme applied to all
        sections: [
            {
                id: "navbar",
                type: STYLES[style].navbar, // Navbar usually matches the global style preference
                content: {
                    logo: businessName || "Brand",
                    links: [
                        { name: "Home", href: "#" },
                        { name: "Services", href: "#services" },
                        { name: "About", href: "#about" },
                        { name: "Contact", href: "#contact" }
                    ],
                    ctaText: "Contact"
                }
            },
            {
                id: "hero",
                type: strategy.hero, // <--- Mixed Component
                content: {
                    title: content.hero.title.replace("[Business Name]", businessName),
                    subtitle: description || content.hero.subtitle,
                    ctaText: content.hero.cta
                }
            },
            {
                id: "features",
                type: strategy.features, // <--- Mixed Component
                content: {
                    title: content.features.title,
                    subtitle: content.features.subtitle
                }
            },
            {
                id: "services",
                type: strategy.services, // <--- Mixed Component
                content: {
                    title: "Our Services",
                    subtitle: "Comprehensive solutions for your needs."
                }
            },
            {
                id: "info",
                type: STYLES[style].info, // Keep some sections style-aligned for consistency
                content: {
                    title: "About Us",
                    description: `At ${businessName || "our company"}, we are committed to excellence.`
                }
            },
            {
                id: "gallery",
                type: STYLES[style].gallery,
                content: {
                    title: "Our Work"
                }
            },
            {
                id: "reviews",
                type: STYLES[style].reviews,
                content: {
                    title: "What Clients Say",
                    subtitle: "Trusted by hundreds of satisfied customers."
                }
            },
            {
                id: "cta",
                type: strategy.cta, // <--- Mixed Component
                content: {
                    title: content.cta.title,
                    subtitle: content.cta.subtitle,
                    ctaText: content.cta.cta
                }
            },
            {
                id: "footer",
                type: STYLES[style].footer,
                content: {
                    brand: businessName || "Brand",
                    tagline: description || "Excellence in every detail."
                }
            }
        ]
    };
};

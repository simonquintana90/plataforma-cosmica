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
    'Inter': "'Inter', sans-serif",
    'Roboto': "'Roboto', sans-serif",
    'Open Sans': "'Open Sans', sans-serif",
    'Lato': "'Lato', sans-serif",
    'Montserrat': "'Montserrat', sans-serif",
    'Oswald': "'Oswald', sans-serif",
    'Raleway': "'Raleway', sans-serif",
    'Poppins': "'Poppins', sans-serif",
    'Nunito': "'Nunito', sans-serif",
    'Ubuntu': "'Ubuntu', sans-serif",
    'Playfair Display': "'Playfair Display', serif",
    'Merriweather': "'Merriweather', serif",
    'Lora': "'Lora', serif",
    'PT Serif': "'PT Serif', serif",
    'Spectral': "'Spectral', serif",
    'Lobster': "'Lobster', cursive",
    'Pacifico': "'Pacifico', cursive",
    'Abril Fatface': "'Abril Fatface', cursive",
    // Fallbacks
    'modern': "'Inter', sans-serif",
    'elegant': "'Playfair Display', serif",
    'bold': "'Oswald', sans-serif",
    'friendly': "'Nunito', sans-serif"
};

// --- Expert Content Logic ---

const TONE_MODIFIERS = {
    friendly: {
        greeting: "¡Hola!",
        pronoun: "tú",
        cta: "¡Empieza Hoy!",
        casing: "sentence" // Sentence case
    },
    serious: {
        greeting: "Bienvenido.",
        pronoun: "usted",
        cta: "Solicitar Consulta",
        casing: "title" // Title Case
    }
};

const applyCasing = (text, casing) => {
    if (!text) return "";
    if (casing === 'title') {
        return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const generatePAS = (service, city, tone) => {
    const isFriendly = tone === 'friendly';
    const problem = isFriendly
        ? `¿Cansado de lidiar con problemas de ${service.toLowerCase()}?`
        : `Desafíos complejos en ${service.toLowerCase()} requieren soluciones expertas.`;

    const agitate = isFriendly
        ? "Sabemos lo frustrante que es perder tiempo y dinero en soluciones que no funcionan."
        : "La ineficiencia y la falta de calidad pueden comprometer seriamente sus operaciones.";

    const solution = isFriendly
        ? `En ${city}, somos tu mejor aliado. Te ofrecemos ${service.toLowerCase()} rápido y confiable.`
        : `Nuestra firma en ${city} provee servicios de ${service.toLowerCase()} con los más altos estándares.`;

    return { problem, agitate, solution };
};

export const generateWebsiteConfig = (formData) => {
    const {
        businessName,
        industry,
        description,
        style,
        brandColors,
        fontPairing,
        mainCity,
        mainService,
        logoUrl,
        uniqueAspect,
        processStepByStep,
        servicesInclude,
        tone = 'friendly',
        keywords = ''
    } = formData;

    const toneSettings = TONE_MODIFIERS[tone] || TONE_MODIFIERS.friendly;
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);

    // 1. Global Theme
    const baseTheme = STYLES[style]?.theme || STYLES.impact.theme;
    const globalTheme = {
        ...baseTheme,
        primary: brandColors?.primary || baseTheme.primary || '#3B82F6',
        secondary: brandColors?.secondary || baseTheme.secondary || '#1E293B',
        accent: brandColors?.accent || '#F59E0B',
        font: FONTS[fontPairing] || FONTS.modern
    };

    // 2. Content Generation (Expert Mode)

    // Hero Section
    const heroTitle = applyCasing(`${mainService} en ${mainCity}: Soluciones Reales`, toneSettings.casing);
    const heroSubtitle = tone === 'friendly'
        ? `¿Problemas con ${mainService.toLowerCase()}? ¡Te cubrimos! ${uniqueAspect}. Servicio rápido y sin estrés en ${mainCity}.`
        : `Expertos en ${mainService} en ${mainCity}. ${uniqueAspect}. Garantizamos excelencia y profesionalismo en cada proyecto.`;

    // USP Section
    const uspTitle = applyCasing(`Por qué elegirnos en ${mainCity}`, toneSettings.casing);
    const uspText = tone === 'friendly'
        ? `No somos una empresa más. Nos importa tu tranquilidad y te ofrecemos ${uniqueAspect}.`
        : `Nos distinguimos por nuestro compromiso con la calidad y ${uniqueAspect}.`;

    // Main Service (PAS)
    const pas = generatePAS(mainService, mainCity, tone);
    const serviceTitle = applyCasing(`Servicio Premium de ${mainService}`, toneSettings.casing);
    const serviceDesc = `${pas.problem} ${pas.agitate} ${pas.solution}`;

    // 3. Section Assembly
    const selectedStyle = STYLES[style] || STYLES.impact;

    const sections = [
        {
            id: "hero",
            type: selectedStyle.hero || "HeroImpact",
            content: {
                title: heroTitle,
                subtitle: heroSubtitle,
                ctaText: toneSettings.cta,
                secondaryCtaText: "Ver Servicios",
                stats: [
                    { value: "100%", label: "Satisfacción" },
                    { value: mainCity, label: "Cobertura Local" },
                    { value: "24/7", label: "Soporte" }
                ],
                images: [
                    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
                ]
            }
        },
        {
            id: "usp",
            type: selectedStyle.features || "FeaturesImpact",
            content: {
                title: uspTitle,
                subtitle: uspText,
                features: [
                    { title: "Experiencia", description: `Años sirviendo a ${mainCity}.` },
                    { title: "Calidad", description: "Resultados garantizados." },
                    { title: "Rapidez", description: "Atención inmediata." }
                ]
            }
        },
        {
            id: "services",
            type: selectedStyle.services || "ServicesImpact",
            content: {
                title: serviceTitle,
                description: serviceDesc,
                features: servicesInclude.split('\n').slice(0, 5).map(s => s.trim()).filter(s => s).map(s => ({
                    title: "Incluido",
                    description: s
                }))
            }
        },
        {
            id: "cta",
            type: selectedStyle.cta || "CTAImpact",
            content: {
                title: applyCasing(`¿Listo para empezar con tu ${mainService}?`, toneSettings.casing),
                subtitle: `Contáctanos hoy mismo en ${mainCity}.`,
                ctaText: toneSettings.cta
            }
        }
    ];

    // Add Navbar and Footer
    const navbar = {
        id: "navbar",
        type: selectedStyle.navbar || "NavbarImpact",
        content: {
            logo: logoUrl || businessName,
            isImageLogo: !!logoUrl,
            links: [
                { name: "Inicio", href: "#" },
                { name: "Servicios", href: "#services" },
                { name: "Nosotros", href: "#usp" },
                { name: "Contacto", href: "#cta" }
            ],
            ctaText: toneSettings.cta
        }
    };

    const footer = {
        id: "footer",
        type: selectedStyle.footer || "FooterImpact",
        content: {
            businessName: businessName,
            description: description || `Expertos en ${mainService} en ${mainCity}.`,
            links: [
                { name: "Inicio", href: "#" },
                { name: "Servicios", href: "#services" },
                { name: "Contacto", href: "#cta" }
            ]
        }
    };

    return {
        meta: {
            title: `${mainService} en ${mainCity} | ${businessName}`,
            description: `Expertos en ${mainService} en ${mainCity}. ${uniqueAspect}. Contáctanos hoy.`
        },
        theme: globalTheme,
        sections: [navbar, ...sections, footer]
    };
};

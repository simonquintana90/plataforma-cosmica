import React, { useState, useEffect } from 'react';
import WebsiteBuilder from '../components/builder/WebsiteBuilder';
import VisualEditorSidebar from '../components/builder/VisualEditorSidebar';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CONFIG = {
    "meta": {
        "title": "Cosmica Demo Site",
        "description": "Generated System"
    },
    "theme": {
        "mode": "light",
        "primary": "indigo-600",
        "secondary": "slate-900"
    },
    "sections": [
        {
            "id": "hero",
            "type": "HeroImpact",
            "content": {
                "title": "Build Your Dream Website",
                "subtitle": "Leverage the power of AI to generate stunning websites.",
                "ctaText": "Start Building"
            }
        }
    ]
};

const AIBuilderPage = () => {
    const { user, db, doc, getDoc } = useAuth();

    // State for Website Config
    const [parsedConfig, setParsedConfig] = useState(DEFAULT_CONFIG);
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    // Load User Config on Mount
    useEffect(() => {
        const loadUserConfig = async () => {
            if (!user || !db) {
                return;
            }

            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();

                    // 1. Load the generated website config
                    if (userData.websiteConfig) {
                        setParsedConfig(userData.websiteConfig);
                        toast.success("Loaded your generated website!");
                    }
                }
            } catch (err) {
                console.error("Error loading user config:", err);
                toast.error(`Could not load config: ${err.message}`);
            }
        };

        loadUserConfig();
    }, [user, db, doc, getDoc]);

    return (
        <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
            {/* Left Panel: Visual Editor Sidebar */}
            <VisualEditorSidebar
                config={parsedConfig}
                setConfig={setParsedConfig}
                selectedSectionId={selectedSectionId}
            />

            {/* Right Panel: Live Preview */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth bg-slate-100">
                <div className="sticky top-4 right-4 z-50 float-right mr-4 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-gray-200 text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live Preview
                    </div>
                </div>

                {/* Preview Container with shadow for "page" effect */}
                <div className="min-h-screen bg-white shadow-2xl mx-auto max-w-[1600px] transition-all duration-300">
                    <WebsiteBuilder
                        siteConfig={parsedConfig}
                        onSectionClick={setSelectedSectionId}
                    />
                </div>
            </div>
        </div>
    );
};

export default AIBuilderPage;

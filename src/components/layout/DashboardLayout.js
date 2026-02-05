import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

import { useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const { user, auth, userProfile } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check for admin "view as affiliate" mode
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const viewAsReferidos = queryParams.get('view') === 'referidos';
    const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";
    const simulatePartner = viewAsReferidos && user.uid === ADMIN_UID;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 h-full shadow-xl shadow-slate-200/50 z-20">
                <Sidebar user={user} auth={auth} userProfile={userProfile} simulatePartner={simulatePartner} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar user={user} auth={auth} userProfile={userProfile} simulatePartner={simulatePartner} onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Mobile Header */}
                <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 justify-between z-10 sticky top-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <img
                        src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif"
                        alt="Logo"
                        className="h-5 w-auto"
                    />
                    <div className="w-8" /> {/* Spacer for centering if needed */}
                </header>

                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

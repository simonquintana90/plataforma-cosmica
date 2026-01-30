import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load pages
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const WebsiteInfoFormPage = lazy(() => import('./pages/WebsiteInfoFormPage'));
const RequestDetailPage = lazy(() => import('./pages/RequestDetailPage'));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage'));
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const ReferralsPage = lazy(() => import('./pages/ReferralsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminUserDetailPage = lazy(() => import('./pages/AdminUserDetailPage'));
const AdminEmailPreviewsPage = lazy(() => import('./pages/AdminEmailPreviewsPage'));

const PendingApprovalPage = lazy(() => import('./pages/PendingApprovalPage'));
const ProfileErrorPage = lazy(() => import('./pages/ProfileErrorPage'));
const LandingPagesPage = lazy(() => import('./pages/LandingPagesPage'));


const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";

const AppRoutes = () => {
    const { user, userProfile, loading, ...firebaseServices } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const viewAsAdmin = queryParams.get('view');

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Inicializando plataforma...</div>;
    }

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<AuthPage {...firebaseServices} />} />
                <Route path="*" element={<AuthPage {...firebaseServices} />} />
            </Routes>
        );
    }

    // Admin View Impersonation Logic
    if (user.uid === ADMIN_UID && viewAsAdmin) {
        if (viewAsAdmin === 'suscribirse') {
            return <SubscriptionPage user={user} auth={firebaseServices.auth} {...firebaseServices} />;
        }
        if (viewAsAdmin === 'website_form') {
            return <WebsiteInfoFormPage user={user} {...firebaseServices} />;
        }
    }

    if (userProfile === undefined) {
        return <div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Verificando estado de tu cuenta...</div>;
    }

    if (userProfile === null && user.uid !== ADMIN_UID) {
        return <ProfileErrorPage auth={firebaseServices.auth} />;
    }

    if (userProfile?.status === 'pending_approval') {
        return <PendingApprovalPage auth={firebaseServices.auth} />;
    }

    if (userProfile?.status === 'approved' && userProfile?.initialPaymentStatus !== 'completed' && user.uid !== ADMIN_UID) {
        return <SubscriptionPage user={user} auth={firebaseServices.auth} {...firebaseServices} />;
    }

    if (userProfile?.status === 'approved' && userProfile?.initialPaymentStatus === 'completed' && userProfile?.websiteInfoStatus !== 'completed' && user.uid !== ADMIN_UID) {
        return <WebsiteInfoFormPage user={user} {...firebaseServices} />;
    }

    return (
        <Routes>
            <Route path="/" element={
                userProfile?.role === 'partner'
                    ? <Navigate to="/cuenta" />
                    : <DashboardPage user={user} {...firebaseServices} />
            } />
            <Route path="/solicitud/:requestId" element={<RequestDetailPage user={user} {...firebaseServices} />} />
            <Route path="/cuenta" element={<MyAccountPage user={user} userProfile={userProfile} {...firebaseServices} />} />
            <Route path="/conexiones" element={<ConnectionsPage user={user} {...firebaseServices} />} />
            <Route path="/referidos" element={<ReferralsPage user={user} userProfile={userProfile} {...firebaseServices} />} />
            <Route path="/suscripcion" element={<SubscriptionPage user={user} auth={firebaseServices.auth} {...firebaseServices} />} />
            <Route path="/suscripcion" element={<SubscriptionPage user={user} auth={firebaseServices.auth} {...firebaseServices} />} />
            <Route path="/landing-pages" element={<LandingPagesPage user={user} {...firebaseServices} />} />
            <Route path="/website-info" element={<WebsiteInfoFormPage user={user} {...firebaseServices} />} />

            <Route path="/admin" element={user.uid === ADMIN_UID ? <AdminDashboardPage user={user} {...firebaseServices} /> : <Navigate to="/" />} />

            <Route path="/admin/user/:userId" element={user.uid === ADMIN_UID ? <AdminUserDetailPage {...firebaseServices} /> : <Navigate to="/" />} />
            <Route path="/admin/emails" element={user.uid === ADMIN_UID ? <AdminEmailPreviewsPage /> : <Navigate to="/" />} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Toaster position="bottom-right" />
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen font-heading bg-slate-50 text-slate-600">Cargando...</div>}>
                <AppRoutes />
            </Suspense>
        </AuthProvider>
    );
}

export default App;
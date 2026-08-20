import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * PortalModeGate — routes the whole portal by web check-in state.
 *
 *   FORM               → advance-booking guest not yet approved: only /web-checkin
 *   PRE_CHECKIN_BROWSE → approved, pre-arrival: full UI (ordering gated elsewhere)
 *   CHECKED_IN         → today's behavior (and /web-checkin bounces to /dashboard)
 *   BLOCKED            → stay ended / booking cancelled: full-screen notice
 *
 * The '/' route is exempt — App.jsx owns the token-gate states there. When the
 * visitor has no token at all, the gate stays out of the way for the same reason.
 * This is UX routing only; the server independently rejects what it must.
 */

// What an advance-booking guest may still open before their registration is approved.
const FORM_MODE_PATHS = ['/web-checkin', '/pre-arrival'];

function GateLoadingScreen() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading your experience…</p>
            </div>
        </div>
    );
}

function BlockedScreen({ message }) {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-gray-800 flex items-center justify-center mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                    stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold m-0 mb-3 leading-tight">
                This stay is no longer active
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed m-0 max-w-[300px]">
                {message || 'Your booking has ended or is no longer active.'}
            </p>
            <div className="w-16 h-px bg-gray-800 my-8" />
            <p className="text-gray-600 text-xs leading-relaxed max-w-[280px]">
                Please contact the hotel reception if you believe this is a mistake.
            </p>
        </div>
    );
}

export default function PortalModeGate({ children }) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { portalMode, error } = useCustomerProfile();
    const { pathname } = useLocation();

    // '/' is App.jsx's token gate; without a token every route keeps legacy behavior.
    if (pathname === '/' || authLoading || !isAuthenticated) return children;

    if (portalMode === 'LOADING') return <GateLoadingScreen />;
    if (portalMode === 'BLOCKED') return <BlockedScreen message={error} />;
    // The pre-arrival questionnaire is the hotel's own form and is answerable
    // while registration is still pending — it asks about the upcoming stay, so
    // holding it back until approval would be asking too late.
    if (portalMode === 'FORM' && !FORM_MODE_PATHS.includes(pathname)) {
        return <Navigate to="/web-checkin" replace />;
    }
    if (portalMode === 'CHECKED_IN' && pathname === '/web-checkin') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

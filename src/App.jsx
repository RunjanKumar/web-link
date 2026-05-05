import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// ── Loading spinner shown while token is being processed ──
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading your experience…</p>
            </div>
        </div>
    );
}

// ── Shown when user opens the app without a valid token ──
function InvalidLinkScreen() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-gray-800 flex items-center justify-center mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                    stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold m-0 mb-3 leading-tight">
                Access Link Required
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed m-0 max-w-[300px]">
                Please click on the login link sent to your email to access your hotel dashboard.
            </p>

            {/* Divider */}
            <div className="w-16 h-px bg-gray-800 my-8" />

            {/* Helper text */}
            <p className="text-gray-600 text-xs leading-relaxed max-w-[280px]">
                If you haven't received the link, please contact the hotel reception for assistance.
            </p>
        </div>
    );
}

// ── Root Component — Token Gate ──
export default function App() {
    const { isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Token is valid → go straight to the dashboard
            navigate('/dashboard', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <InvalidLinkScreen />;

    // While the navigate() is in-flight, render the loading screen
    return <LoadingScreen />;
}

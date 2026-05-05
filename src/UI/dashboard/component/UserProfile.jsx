import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeDotMenu from '../../../globalComponents/ThreeDotMenu';
import LogoutModal from '../../../globalComponents/LogoutModal';
import useAuth from '../../../hooks/useAuth';

// ── Skeleton shimmer for loading state ──
function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-gray-800 rounded-md ${className}`} />
    );
}

/**
 * UserProfile component.
 *
 * @param {string}  name      - Guest's display name from API
 * @param {string}  room      - Room number/label from API
 * @param {string}  hotelName - Hotel name from API (optional)
 * @param {boolean} isLoading - Show skeleton while data is loading
 * @param {string}  error     - Error message if API call failed
 */
export default function UserProfile({ name, room, hotelName, isLoading, error }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showLogout, setShowLogout] = useState(false);

    // Menu items for three dot menu
    const menuItems = [
        { label: 'Share feedback', onClick: () => navigate('/feedback') },
        { label: 'Log out', onClick: () => setShowLogout(true) },
    ];

    const handleLogout = () => {
        setShowLogout(false);
        logout();          // clears localStorage token via AuthContext
        navigate('/');
    };

    // Sub-label: prefer hotelName+room, fallback to room only
    const subLabel = hotelName
        ? `${room} · ${hotelName}`
        : room
            ? `Room ${room}`
            : '';

    return (
        <>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-400 m-0">Welcome,</p>

                    {/* Name or skeleton */}
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-44 mt-2" />
                            <Skeleton className="h-3 w-32 mt-2" />
                        </>
                    ) : error ? (
                        <h1 className="text-[1.625rem] font-bold mt-1 m-0 text-red-400">
                            Could not load profile
                        </h1>
                    ) : (
                        <>
                            <h1 className="text-[1.625rem] font-bold mt-1 m-0">
                                {name} <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
                            </h1>
                            {subLabel && (
                                <p className="text-xs text-gray-500 mt-1 m-0">{subLabel}</p>
                            )}
                        </>
                    )}
                </div>

                {/* ── Three Dot Menu ── */}
                <ThreeDotMenu items={menuItems} />
            </div>

            {/* ── Logout Modal ── */}
            <LogoutModal
                isOpen={showLogout}
                onClose={() => setShowLogout(false)}
                onLogout={handleLogout}
            />
        </>
    );
}

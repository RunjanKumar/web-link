/**
 * ConnectionBanner — shows socket connection status.
 * Displays a slim banner at the top when disconnected, reconnecting, or offline.
 */
import { CONNECTION_STATUS } from '../../../context/SocketContext';

const BANNER_CONFIG = {
    [CONNECTION_STATUS.OFFLINE]: {
        text: 'You are offline',
        bgClass: 'bg-gray-800',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
        ),
    },
    [CONNECTION_STATUS.RECONNECTING]: {
        text: 'Reconnecting...',
        bgClass: 'bg-amber-900/80',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="animate-spin">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
        ),
    },
    [CONNECTION_STATUS.DISCONNECTED]: {
        text: 'Disconnected',
        bgClass: 'bg-red-900/60',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
    },
};

export default function ConnectionBanner({ status }) {
    // Don't show banner when connected
    if (status === CONNECTION_STATUS.CONNECTED) return null;

    const config = BANNER_CONFIG[status] || BANNER_CONFIG[CONNECTION_STATUS.DISCONNECTED];

    return (
        <div className={`${config.bgClass} rounded-lg px-3 py-2 flex items-center justify-center gap-2 
                         text-white/80 text-xs font-medium transition-all duration-300 mb-2`}>
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
}

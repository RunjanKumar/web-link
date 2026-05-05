import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * ══════════════════════════════════════════════════════════════════
 * GLOBAL TOAST SYSTEM
 * ══════════════════════════════════════════════════════════════════
 *
 * Usage:
 *   1. Wrap your app with <ToastProvider>
 *   2. In any component: const { showToast } = useToast();
 *   3. Call: showToast('Something went wrong', 'error');
 *       or: showToast('Success!', 'success');
 *
 * The toast auto-dismisses after 4 seconds.
 * ══════════════════════════════════════════════════════════════════
 */

const ToastContext = createContext(null);

// ── Toast UI Component ──
function ToastBar({ message, type, onClose }) {
    // 'error' = red, 'success' = green
    const isError = type === 'error';

    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-[400px]
                rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl
                animate-slideDown
                ${isError
                    ? 'bg-[#6a2d2d] border border-red-500/30'
                    : 'bg-[#2d6a30] border border-green-500/30'
                }`}
        >
            {/* Icon */}
            <div className={`w-10 h-10 min-w-[2.5rem] rounded-full flex items-center justify-center
                ${isError ? 'bg-red-500/20' : 'bg-white/20'}`}
            >
                {isError ? (
                    /* ✕ error icon */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                ) : (
                    /* ✓ success icon */
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>

            {/* Message */}
            <div className="flex-1">
                <p className="text-white text-sm font-semibold m-0 leading-snug">
                    {message}
                </p>
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="shrink-0 w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-white/70 hover:text-white"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// ── Toast Provider (wrap around entire app) ──
export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null); // { message, type }

    /**
     * Show a toast notification.
     * @param {string} message - The message to display
     * @param {'error'|'success'} type  - Toast style (default: 'error')
     */
    const showToast = useCallback((message, type = 'error') => {
        setToast({ message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    // Auto-dismiss after 4 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <ToastBar
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
}

/**
 * Hook to access the toast system from any component.
 * @returns {{ showToast: (message: string, type?: 'error'|'success') => void }}
 */
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}

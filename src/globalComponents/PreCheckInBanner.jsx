import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * PreCheckInBanner — slim amber strip shown on browse pages while the guest is
 * approved but not yet checked in. Renders nothing once ordering is unlocked.
 * Modelled on the chat ConnectionBanner.
 */
export default function PreCheckInBanner() {
    const { portalMode, orderLockMessage } = useCustomerProfile();
    if (portalMode !== 'PRE_CHECKIN_BROWSE') return null;

    return (
        <div className="bg-amber-900/80 rounded-lg px-3 py-2 flex items-center justify-center gap-2
                        text-white/90 text-xs font-medium mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Browsing mode — {orderLockMessage}</span>
        </div>
    );
}

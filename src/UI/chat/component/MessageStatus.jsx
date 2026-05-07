/**
 * MessageStatus — delivery status indicator (✓, ✓✓, ✓✓ blue).
 * Shows the current delivery state of a guest's sent message.
 */
export default function MessageStatus({ status }) {
    if (!status || status === 'sending') {
        // Clock icon — message is being sent
        return (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="opacity-40">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        );
    }

    if (status === 'failed') {
        // Error icon
        return (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        );
    }

    if (status === 'read') {
        // Double tick — blue (read)
        return (
            <svg width="16" height="12" viewBox="0 0 24 14" fill="none"
                stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 7 5 11 13 3" />
                <polyline points="7 7 11 11 19 3" />
            </svg>
        );
    }

    // Default: single tick — sent
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="opacity-50">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

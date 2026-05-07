/**
 * MessageStatus — WhatsApp-style delivery status indicator.
 *
 * Status values (matches backend MESSAGE_STATUS):
 *   1 = SENT      → single grey tick ✓
 *   2 = DELIVERED  → double grey ticks ✓✓
 *   3 = SEEN       → double blue ticks ✓✓
 *
 * Special UI states (not from backend):
 *   'sending'  → clock icon (optimistic)
 *   'failed'   → red X icon
 */
import { MESSAGE_STATUS } from '../../../utils/socketEvents';

export default function MessageStatus({ status, isSending, isFailed }) {
    // ── Sending state (optimistic message in flight) ──
    if (isSending) {
        return (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="opacity-40">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        );
    }

    // ── Failed state ──
    if (isFailed) {
        return (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        );
    }

    // ── SEEN (3) → Double blue ticks ✓✓ ──
    if (status === MESSAGE_STATUS.SEEN) {
        return (
            <svg width="16" height="12" viewBox="0 0 24 14" fill="none"
                stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 7 5 11 13 3" />
                <polyline points="7 7 11 11 19 3" />
            </svg>
        );
    }

    // ── DELIVERED (2) → Double grey ticks ✓✓ ──
    if (status === MESSAGE_STATUS.DELIVERED) {
        return (
            <svg width="16" height="12" viewBox="0 0 24 14" fill="none"
                stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="opacity-50">
                <polyline points="1 7 5 11 13 3" />
                <polyline points="7 7 11 11 19 3" />
            </svg>
        );
    }

    // ── SENT (1) or default → Single grey tick ✓ ──
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="opacity-50">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

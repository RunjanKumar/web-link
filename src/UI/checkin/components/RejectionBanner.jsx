/**
 * RejectionBanner — shown at the top of the web check-in form when staff asked
 * for changes. The reason text comes from the hotel verbatim.
 */
export default function RejectionBanner({ reason }) {
    if (!reason) return null;
    return (
        <div className="bg-red-900/60 border border-red-800/60 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0"
                stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
                <p className="text-red-200 text-sm font-semibold m-0 mb-1">The hotel asked for changes</p>
                <p className="text-red-300/90 text-xs leading-relaxed m-0">{reason}</p>
                <p className="text-red-300/60 text-[11px] leading-relaxed m-0 mt-1.5">
                    Update your details below and resubmit — the hotel will take another look.
                </p>
            </div>
        </div>
    );
}

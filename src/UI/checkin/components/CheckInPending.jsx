/**
 * CheckInPending — full-screen state after submitting: details are with the
 * hotel for review. The guest can still edit the submission while it's pending.
 */
export default function CheckInPending({ submittedAt, onEdit }) {
    const submittedLabel = submittedAt ? new Date(submittedAt).toLocaleString() : null;
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-gray-800 flex items-center justify-center mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                    stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            </div>

            <h1 className="text-2xl font-bold m-0 mb-3 leading-tight">
                Details submitted
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed m-0 max-w-[300px]">
                The hotel is reviewing your web check-in. You&apos;ll get an email as soon as it&apos;s approved.
            </p>
            {submittedLabel && (
                <p className="text-gray-600 text-xs mt-3">Submitted {submittedLabel}</p>
            )}

            <div className="w-16 h-px bg-gray-800 my-8" />

            <button
                type="button"
                onClick={onEdit}
                className="text-yellow-400 text-sm font-medium border border-yellow-400/30 rounded-full px-6 py-2.5
                           hover:bg-yellow-400/10 transition-colors"
            >
                Edit my details
            </button>
            <p className="text-gray-600 text-xs leading-relaxed max-w-[280px] mt-4">
                Need help? Contact the hotel reception.
            </p>
        </div>
    );
}

export default function SubcategoryCard({ item, onToggleRequest, requested, alreadyBooked, disabled }) {
    // Already booked (pending/in-progress) takes highest priority — non-toggleable
    const isLocked = alreadyBooked || disabled;

    /* ── Determine button label ── */
    const getButtonLabel = () => {
        if (disabled) return 'Unavailable';
        if (alreadyBooked) return 'Requested';
        if (requested) return 'Requested';
        return 'Request';
    };

    /* ── Determine button styles ── */
    const getButtonStyles = () => {
        if (disabled) {
            return 'bg-transparent border-gray-700 text-gray-600 cursor-not-allowed';
        }
        if (alreadyBooked) {
            // Distinct "already booked" style — green-tinted, non-interactive
            return 'bg-green-500/10 border-green-500/50 text-green-400 cursor-default';
        }
        if (requested) {
            return 'bg-yellow-400/15 border-yellow-500/80 text-yellow-400 cursor-pointer hover:bg-yellow-400/25 active:scale-95';
        }
        return 'bg-transparent border-yellow-500/60 text-yellow-400 cursor-pointer hover:bg-yellow-400/10 active:scale-95';
    };

    return (
        <div
            className={`flex items-center gap-4 py-4 px-2 border-b border-gray-800/50 last:border-b-0 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}
        >
            {/* Icon */}
            <div className="w-14 h-14 min-w-[3.5rem] rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center">
                <img src={item.icon}  alt={item.name} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-semibold m-0 leading-snug">{item.name}</h4>
                <p className="text-gray-500 text-xs m-0 mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
                {item.price > 0 && (
                    <p className="text-gray-400 text-xs m-0 mt-1 font-medium">₹ {item.price}</p>
                )}
            </div>

            {/* Request / Requested / Unavailable button */}
            <button
                onClick={() => !isLocked && onToggleRequest(item._id)}
                disabled={isLocked}
                className={`shrink-0 px-4 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200 ${getButtonStyles()}`}
            >
                {getButtonLabel()}
            </button>
        </div>
    );
}
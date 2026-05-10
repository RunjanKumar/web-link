import TrashIcon from "../../../globalComponents/TrashIcon";

/* ── Single review service item ── */
export default function ReviewServiceItem({ item, onDelete, onAddDetails }) {
    const hasDetails = item.details && item.details.trim().length > 0;

    return (
        <div className="py-4 border-b border-gray-800/40 last:border-b-0">
                {/* Top row: info + delete */}
                <div className="flex items-start gap-3">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold m-0 leading-snug">{item.name}</h4>
                        <p className="text-gray-500 text-xs m-0 mt-0.5 leading-relaxed">{item.description}</p>
                        {item.price > 0 && (
                            <p className="text-gray-400 text-xs m-0 mt-1 font-medium">₹ {item.price}</p>
                        )}
                    </div>

                    {/* Delete button */}
                    <button
                        onClick={() => onDelete(item.id)}
                        className="shrink-0 w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-lg hover:bg-white/5 transition-colors duration-150"
                    >
                        <TrashIcon />
                    </button>
                </div>

                {/* Details text (shown when details have been added) */}
                {hasDetails && (
                    <p className="text-yellow-400/80 text-xs m-0 mt-2 leading-relaxed">
                        Details : {item.details}
                    </p>
                )}

                {/* Add Details / Edit Details button */}
                <button
                    onClick={() => onAddDetails(item)}
                    className="mt-3 px-4 py-1.5 rounded-md text-xs font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
                >
                    {hasDetails ? 'Edit Details' : 'Add Details'}
                </button>
            </div>
        );
    }
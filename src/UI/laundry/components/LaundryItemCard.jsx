import { LAUNDRY_SERVICE_TYPE_LABELS } from '../../../utils/constant';

/**
 * One row of the laundry rate list.
 * Collapsed: name + cheapest rate + "Add".
 * Once added: service-type chips (only the ones this item is priced for) + a qty stepper.
 */
export default function LaundryItemCard({
    item,
    line,
    rateFor,
    onAdd,
    onRemove,
    onQtyChange,
    onServiceChange,
}) {
    const services = item.rates || [];
    const cheapest = services.reduce(
        (min, r) => (min === null || r.rate < min ? r.rate : min),
        null,
    );
    const selected = Boolean(line);
    const lineAmount = selected ? rateFor(item, line.serviceType) * line.qty : 0;

    return (
        <div className="bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)] rounded-2xl p-4 mb-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold m-0 capitalize">{item.name}</p>
                    <p className="text-[0.7rem] text-gray-500 m-0 mt-1">
                        {selected
                            ? `₹${rateFor(item, line.serviceType)} per ${item.unit || 'pc'}`
                            : `from ₹${cheapest ?? 0} per ${item.unit || 'pc'}`}
                    </p>
                </div>

                {!selected ? (
                    <button
                        onClick={() => onAdd(item)}
                        className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
                    >
                        Add
                    </button>
                ) : (
                    <div className="shrink-0 flex items-center gap-3">
                        <button
                            onClick={() => onQtyChange(item._id, line.qty - 1)}
                            aria-label={`Reduce ${item.name}`}
                            className="w-7 h-7 rounded-full border border-gray-600 bg-transparent text-white text-base leading-none cursor-pointer hover:border-yellow-500/60 active:scale-95 transition-all duration-200"
                        >
                            −
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{line.qty}</span>
                        <button
                            onClick={() => onQtyChange(item._id, line.qty + 1)}
                            aria-label={`Add another ${item.name}`}
                            className="w-7 h-7 rounded-full border border-gray-600 bg-transparent text-white text-base leading-none cursor-pointer hover:border-yellow-500/60 active:scale-95 transition-all duration-200"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            {selected && (
                <div className="mt-3 pt-3 border-t border-[rgba(55,55,55,0.6)]">
                    <div className="flex flex-wrap gap-2">
                        {services.map((r) => (
                            <button
                                key={r.serviceType}
                                onClick={() => onServiceChange(item._id, r.serviceType)}
                                className={`px-3 py-1 rounded-full text-[0.7rem] font-medium border cursor-pointer transition-all duration-200 ${
                                    line.serviceType === r.serviceType
                                        ? 'bg-yellow-400/15 border-yellow-500/60 text-yellow-400'
                                        : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                {LAUNDRY_SERVICE_TYPE_LABELS[r.serviceType] || r.serviceType} · ₹{r.rate}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <button
                            onClick={() => onRemove(item._id)}
                            className="text-[0.7rem] text-gray-500 bg-transparent border-none p-0 cursor-pointer hover:text-red-400 transition-colors duration-200"
                        >
                            Remove
                        </button>
                        <span className="text-sm font-semibold text-yellow-400">₹{lineAmount}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

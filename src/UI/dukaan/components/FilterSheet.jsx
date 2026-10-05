import { DUKAAN_SORT_OPTIONS } from '../../../utils/constant';

/**
 * Bottom sheet holding sort + filters.
 *
 * Applied live (no Apply button): every control writes straight to the
 * view-model, which refetches. On a phone that feels faster than a two-step
 * "choose then apply", and the result is visible behind the sheet as it changes.
 */
export default function FilterSheet({
    open,
    onClose,
    sort,
    setSort,
    inStockOnly,
    setInStockOnly,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    hasActiveFilters,
    clearFilters,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
            <div
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
            />

            <div className="relative w-full bg-[#1a1a1a] border-t border-[rgba(55,55,55,0.6)] rounded-t-3xl p-5 pb-8 max-h-[80vh] overflow-y-auto animate-[slideDown_0.2s_ease-out]">
                <div className="w-10 h-1 rounded-full bg-gray-700 mx-auto mb-5" />

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold m-0">Sort &amp; filter</h2>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-yellow-400 bg-transparent border-none cursor-pointer"
                        >
                            Reset all
                        </button>
                    )}
                </div>

                {/* ── Sort ── */}
                <p className="text-xs text-gray-500 uppercase tracking-wide m-0 mb-2">Sort by</p>
                <div className="flex flex-col gap-2 mb-6">
                    {DUKAAN_SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSort(opt.value)}
                            className={`text-left px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-200 ${
                                sort === opt.value
                                    ? 'border-yellow-500/60 bg-yellow-400/10 text-yellow-400'
                                    : 'border-[rgba(55,55,55,0.6)] bg-transparent text-gray-300'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* ── Price ── */}
                <p className="text-xs text-gray-500 uppercase tracking-wide m-0 mb-2">Price range</p>
                <div className="flex items-center gap-3 mb-6">
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#111111] border border-[rgba(55,55,55,0.6)] text-white text-sm outline-none focus:border-yellow-500/60"
                    />
                    <span className="text-gray-600">to</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#111111] border border-[rgba(55,55,55,0.6)] text-white text-sm outline-none focus:border-yellow-500/60"
                    />
                </div>

                {/* ── Availability ── */}
                <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[rgba(55,55,55,0.6)] bg-transparent cursor-pointer mb-6"
                >
                    <span className="text-sm text-gray-300">In stock only</span>
                    <span
                        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                            inStockOnly ? 'bg-yellow-500' : 'bg-gray-700'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                                inStockOnly ? 'left-[1.375rem]' : 'left-0.5'
                            }`}
                        />
                    </span>
                </button>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-sm border-none cursor-pointer active:scale-95 transition-transform duration-200"
                >
                    Show results
                </button>
            </div>
        </div>
    );
}

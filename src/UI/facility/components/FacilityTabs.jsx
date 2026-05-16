/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY TABS COMPONENT
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is a reusable tab component.
 * It renders one button per facility category (Dining, Spa, etc.)
 *
 * Each tab shows:
 *   - The category imageUrl as a small circular thumbnail
 *   - The category name as label
 *
 * Props:
 *   types     → [{ id, label, imageUrl }]  (from ViewModel)
 *   activeType → currently selected tab ID
 *   onSelect  → callback when tab is clicked
 */
export default function FacilityTabs({ types, activeType, onSelect }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {types.map((t) => {
                const isActive = t.id === activeType;
                return (
                    <button
                        key={t.id}
                        onClick={() => onSelect(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border shrink-0 cursor-pointer transition-all duration-200 active:scale-95 ${isActive
                            ? 'bg-yellow-400 border-yellow-400 text-black'
                            : 'bg-transparent border-gray-700 text-yellow-400 hover:bg-white/5'
                            }`}
                    >
                        {/* Category thumbnail */}
                        {t.imageUrl && (
                            <img
                                src={t.imageUrl}
                                alt={t.label}
                                className="w-10  h-10 min-w-[1.75rem] rounded-full object-cover border border-white/20"
                            />
                        )}
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}

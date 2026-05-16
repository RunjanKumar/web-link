import { formatTime12Hour } from '../../../utils/commonFunction';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY CARD COMPONENT
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This card renders ONE facility type item from the
 * `types[]` array inside a facility category.
 *
 * Backend shape of each item in types[]:
 *   {
 *     _id, name, description, image,
 *     startTime: "01:33", endTime: "14:36",
 *     days: [0,1,2,3,4,5,6],
 *     isAvailable, cuisine, location, pricing
 *   }
 *
 * Required fields (always present): name, description, image,
 *   startTime, endTime, days, isAvailable
 *
 * Optional fields: cuisine, location, pricing
 *
 * Props:
 *   facility → one item from the types[] array
 *   onClick  → callback when card is tapped
 */

/* ── Day name map ── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDays(days) {
    if (!days || !Array.isArray(days)) return '';
    if (days.length === 7) return 'Open all days';
    return days.map((d) => DAY_NAMES[d]).join(', ');
}

export default function FacilityCard({ facility, onClick }) {
    const disabled = !facility.isAvailable;

    return (
        <div
            onClick={() => !disabled && onClick(facility)}
            className={`${disabled ? '' : 'cursor-pointer active:scale-[0.98] transition-transform duration-150'}`}
        >
            <div className={`bg-[#111111] rounded-2xl border border-gray-800/40 overflow-hidden mb-4 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex">
                    {/* ── Left Info ── */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        <div>
                            {/* Name — prominent, yellow accent */}
                            <h3 className="text-white text-lg font-bold m-0 leading-snug border-l-2 border-yellow-400 pl-2">
                                {facility.name}
                            </h3>

                            {/* Cuisine (optional) */}
                            {facility.cuisine && (
                                <p className="text-gray-400 text-xs m-0 mt-1.5 line-clamp-1">
                                    {facility.cuisine}
                                </p>
                            )}

                            {/* Description */}
                            <p className="text-gray-500 text-xs m-0 mt-2 leading-relaxed line-clamp-2">
                                {facility.description}
                            </p>
                        </div>

                        {/* Timings + Location */}
                        <div className="mt-3 flex flex-col gap-0.5">
                            <p className="text-yellow-400 text-xs font-semibold m-0">
                                {formatTime12Hour(facility.startTime)} – {formatTime12Hour(facility.endTime)}
                            </p>
                            <p className="text-gray-500 text-[11px] m-0">
                                {formatDays(facility.days)}
                            </p>
                            {facility.location && (
                                <p className="text-gray-500 text-[11px] m-0 mt-0.5">
                                    📍 {facility.location}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Right Image ── */}
                    <div className="w-[130px] min-h-[155px]">
                        <img
                            src={facility.image}
                            alt={facility.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Unavailable badge */}
                {disabled && (
                    <div className="px-4 pb-3 pt-0">
                        <span className="text-red-400/80 text-xs font-medium">Currently Unavailable</span>
                    </div>
                )}
            </div>
        </div>
    );
}

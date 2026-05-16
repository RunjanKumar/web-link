import { useNavigate } from 'react-router-dom';
import ThreeDotMenu from '../../globalComponents/ThreeDotMenu';
import BottomNav from '../../globalComponents/BottomNav';
import useFacilityViewModel from '../../viewModel/facilityViewModel';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITIES PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This page uses the MVVM pattern.
 * It does NOT call APIs directly — it gets everything from the ViewModel.
 *
 * The ViewModel provides:
 *   - facilities (filtered by active tab)
 *   - facilityTypes (dynamic tabs from API)
 *   - loading / error states
 *   - actions (setActiveType, handleFacilityClick, etc.)
 */

/* ── Tab Buttons (dynamic from API) ── */
function FacilityTabs({ types, activeType, onSelect }) {
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
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ── Generic Facility Card (works with any backend data shape) ── */
function FacilityCard({ facility, onClick }) {
    const disabled = facility.isAvailable === false;
    // Try multiple possible field names for image
    const image = facility.image || facility.imageUrl || facility.photo;
    // Try multiple possible field names for name
    const name = facility.name || facility.facilityName || 'Unnamed Facility';
    // Try multiple possible field names for description
    const description = facility.description || facility.detailDescription || '';
    // Timing info
    const timings = facility.timings || facility.timing || '';
    // Price info
    const price = facility.avgPrice || facility.price || facility.priceRange || '';

    return (
        <div
            onClick={() => !disabled && onClick(facility)}
            className={`${disabled ? '' : 'cursor-pointer active:scale-[0.98] transition-transform duration-150'}`}
        >
            <div className={`bg-[#111111] rounded-2xl border border-gray-800/40 overflow-hidden mb-4 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex">
                    {/* Left Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <h3 className="text-white text-lg font-bold m-0">{name}</h3>
                            {timings && (
                                <p className="text-gray-400 text-xs m-0 mt-1">Timings - {timings}</p>
                            )}
                            {description && (
                                <p className="text-gray-500 text-xs m-0 mt-2 leading-relaxed line-clamp-2">
                                    {description}
                                </p>
                            )}
                        </div>
                        {price && (
                            <p className="text-yellow-400 text-xs font-semibold m-0 mt-3">
                                {typeof price === 'number' ? `Avg price ₹ ${price}` : price}
                            </p>
                        )}
                    </div>

                    {/* Right Image */}
                    {image && (
                        <div className="w-[140px] min-h-[160px]">
                            <img src={image} alt={name} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Disabled overlay */}
                {disabled && (
                    <div className="px-4 pb-3 pt-0">
                        <span className="text-red-400/80 text-xs font-medium">Currently Unavailable</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── Main Facilities Page ──
   ══════════════════════════════════════════════════ */
export default function Facilities() {
    const navigate = useNavigate();
    const {
        facilityTypes,
        activeType,
        setActiveType,
        facilities,
        loading,
        error,
        handleFacilityClick,
        refetch,
        menuItems,
    } = useFacilityViewModel();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative">
            <div className="pt-14 px-5 pb-28 flex flex-col">

                {/* ── Welcome Header ── */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-gray-400 text-sm m-0">Welcome,</p>
                        <h1 className="text-[1.6rem] font-bold m-0 mt-0.5 leading-tight flex items-center gap-1">
                            James Miller <span className="animate-wave inline-block">👋</span>
                        </h1>
                        <p className="text-gray-500 text-xs m-0 mt-1">Room 208, smart management</p>
                    </div>
                    <ThreeDotMenu items={menuItems} />
                </div>

                {/* ── Loading State ── */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading facilities…</p>
                        </div>
                    </div>
                )}

                {/* ── Error State ── */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <p className="text-gray-400 text-sm">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Facility Content ── */}
                {!loading && !error && (
                    <>
                        {/* ── Facility Type Tabs ── */}
                        {facilityTypes.length > 0 && (
                            <FacilityTabs
                                types={facilityTypes}
                                activeType={activeType}
                                onSelect={setActiveType}
                            />
                        )}

                        {/* ── Facility Cards ── */}
                        <div className="mt-5">
                            {facilities.length > 0 ? (
                                facilities.map((facility) => (
                                    <FacilityCard
                                        key={facility._id || facility.id}
                                        facility={facility}
                                        onClick={handleFacilityClick}
                                    />
                                ))
                            ) : (
                                <div className="flex items-center justify-center py-20">
                                    <p className="text-gray-500 text-sm">No facilities available</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    );
}

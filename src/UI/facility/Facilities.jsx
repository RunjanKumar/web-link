import ThreeDotMenu from '../../globalComponents/ThreeDotMenu';
import BottomNav from '../../globalComponents/BottomNav';
import useFacilityViewModel from '../../viewModel/facilityViewModel';
import FacilityTabs from './components/FacilityTabs';
import FacilityCard from './components/FacilityCard';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITIES PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This page follows the MVVM pattern.
 *
 * Backend data flow:
 *   1. ViewModel fetches categories from API
 *   2. Categories become tabs (FacilityTabs component)
 *   3. The active category's types[] become cards (FacilityCard component)
 *   4. Clicking a card navigates to FacilityDetail page
 *
 * Components used:
 *   - FacilityTabs → renders tab buttons from category names
 *   - FacilityCard → renders one types[] item as a card
 */

/* ══════════════════════════════════════════════════
   ── Main Facilities Page ──
   ══════════════════════════════════════════════════ */
export default function Facilities() {
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
                        {/* ── Category Tabs ── */}
                        {facilityTypes.length > 0 && (
                            <FacilityTabs
                                types={facilityTypes}
                                activeType={activeType}
                                onSelect={setActiveType}
                            />
                        )}

                        {/* ── Facility Type Cards ── */}
                        <div className="mt-5">
                            {facilities.length > 0 ? (
                                facilities.map((item) => (
                                    <FacilityCard
                                        key={item._id}
                                        facility={item}
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

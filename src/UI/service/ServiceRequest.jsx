import BackButton from '../../globalComponents/BackButton';
import ThreeDotMenu from '../../globalComponents/ThreeDotMenu';
import BottomNav from '../../globalComponents/BottomNav';
import PreCheckInBanner from '../../globalComponents/PreCheckInBanner';
import useServiceViewModel from '../../viewModel/serviceViewModel';
import CategorySection from './components/CategorySection';

/* ══════════════════════════════════════════════════
   ── Main ServiceRequest Page ──
   ══════════════════════════════════════════════════ */
export default function ServiceRequest() {
    const {
        categoriesData,
        openCategories,
        toggleCategory,
        toggleRequest,
        isRequested,
        isAlreadyBooked,
        hasRequestedServices,
        handleReviewRequest,
        menuItems,
    } = useServiceViewModel();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative">
            <div className="pt-12 px-5 pb-36 flex flex-col">

                {/* ── Header Row ── */}
                <div className="flex items-center justify-between mb-1">
                    <BackButton />
                    <ThreeDotMenu items={menuItems} />
                </div>
                <PreCheckInBanner />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mb-6 leading-tight">
                    Service Request
                </h1>

                {/* ── Service Categories ── */}
                {categoriesData && categoriesData?.map((cat) => (
                    <CategorySection
                        key={cat._id}
                        category={cat}
                        isOpen={!!openCategories[cat._id]}
                        onToggle={() => toggleCategory(cat._id)}
                        onToggleRequest={toggleRequest}
                        isRequested={isRequested}
                        isAlreadyBooked={isAlreadyBooked}
                    />
                ))}
            </div>

            {/* ── Review Request Button (sticky above bottom nav) ── */}
            <div
                className={`fixed bottom-16 left-0 right-0 px-5 pb-3 pt-2 z-40 transition-all duration-300 ${hasRequestedServices
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-full opacity-0 pointer-events-none'
                    }`}
            >
                <button
                    onClick={handleReviewRequest}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20"
                >
                    Review Request
                </button>
            </div>

            <BottomNav />
        </div>
    );
}

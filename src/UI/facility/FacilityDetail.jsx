import useFacilityDetailViewModel from '../../viewModel/facilityDetailViewModel';
import OverlayBackButton from './components/OverlayBackButton';
import ExpandableDescription from './components/ExpandableDescription';
import InfoSection from './components/InfoSection';
import AppImage from '../../globalComponents/AppImage';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY DETAIL PAGE (View)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is now a PURE view — zero business logic.
 *
 * All data preparation (formatting timings, days, building
 * info sections) happens in facilityDetailViewModel.js.
 *
 * All reusable UI pieces live in components/:
 *   - OverlayBackButton
 *   - ExpandableDescription
 *   - InfoSection
 *
 * This page just composes them together.
 */

export default function FacilityDetail() {
    const {
        facility,
        // categoryName,
        infoSections,
        goBack,
        handleBookNow,
    } = useFacilityDetailViewModel();


    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">

            {/* ── Hero Image ── */}
            <div className="relative w-full h-[45vh] min-h-[320px] overflow-hidden">
                <OverlayBackButton onClick={goBack} />
                {facility.image ? (
                    <AppImage
                        src={facility.image}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                        <span className="text-gray-600 text-sm">No image available</span>
                    </div>
                )}
                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
            </div>

            {/* ── Content ── */}
            <div className="px-5 pb-6 pt-4 flex flex-col flex-1">

                {/* Category badge */}
                {/* {categoryName && (
                    <span className="text-yellow-400 text-xs font-semibold mb-1">{categoryName}</span>
                )} */}

                {/* Name */}
                <h1 className="text-yellow-400 text-[1.6rem] font-bold m-0 mb-5 leading-tight break-words">
                    {facility.name}
                </h1>

                {/* Description */}
                <ExpandableDescription text={facility.description} />

                {/* Info Sections — rendered from ViewModel array */}
                {infoSections.map((section) => (
                    <InfoSection
                        key={section.label}
                        label={section.label}
                        value={section.value}
                    />
                ))}

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Book Now Button ── */}
                <button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-8"
                >
                    Check Availablity
                </button>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY DETAIL PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This page receives facility data via navigation state
 * (location.state.facility). It doesn't need its own ViewModel
 * because it doesn't make API calls — it just displays data
 * passed from the Facilities list page.
 *
 * Flow: Facilities page → click card → navigate here with state
 */

/* ── Back button overlayed on image ── */
function OverlayBackButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute top-12 left-4 z-10 w-9 h-9 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full border-none cursor-pointer text-white hover:bg-black/50 transition-colors duration-200"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
            </svg>
        </button>
    );
}

/* ── Description with Show More / Show Less ── */
function ExpandableDescription({ text }) {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;

    const charLimit = 150;
    const isLong = text.length > charLimit;

    return (
        <div>
            <h3 className="text-white text-base font-bold m-0 mb-2">Description</h3>
            <p className="text-gray-400 text-sm m-0 leading-relaxed">
                {expanded || !isLong ? text : `${text.slice(0, charLimit)}...`}
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-white font-semibold text-sm bg-transparent border-none cursor-pointer p-0 ml-0.5 hover:text-yellow-400 transition-colors duration-150"
                    >
                        {expanded ? 'Show Less' : 'Show More'}
                    </button>
                )}
            </p>
        </div>
    );
}

/* ── Info Row (label + value) ── */
function InfoSection({ label, value }) {
    if (!value) return null;
    return (
        <div className="mt-5">
            <h3 className="text-white text-base font-bold m-0 mb-1">{label}</h3>
            <p className="text-gray-400 text-sm m-0 leading-relaxed">{value}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── Facility Detail Page ──
   ══════════════════════════════════════════════════ */
export default function FacilityDetail() {
    const navigate = useNavigate();
    const location = useLocation();

    const facility = location.state?.facility || {};
    const facilityType = location.state?.facilityType || '';

    console.log('🔍 [FacilityDetail] Received facility data:', JSON.stringify(facility, null, 2));
    console.log('🔍 [FacilityDetail] Facility type:', facilityType);

    // ── Adapt to backend field names ──
    // LEARNING: The backend might use different field names than our UI expects.
    // We map them here so the rest of the component doesn't need to worry.
    const name = facility.name || facility.facilityName || 'Facility';
    const image = facility.image || facility.imageUrl || facility.photo;
    const description = facility.detailDescription || facility.description || '';
    const timings = facility.timings || facility.timing || '';
    const cuisine = facility.cuisine || '';
    const avgPrice = facility.avgPrice || facility.price || '';
    const maxCapacity = facility.maxCapacity || facility.capacity || '';
    const area = facility.area || '';
    const equipment = facility.equipment || '';
    const treatments = facility.treatments || '';
    const priceRange = facility.priceRange || '';

    const handleCheckAvailability = () => {
        console.log('🔍 [FacilityDetail] Navigating to reserve page for:', name);
        navigate('/facilities/reserve', {
            state: { facility }
        });
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">

            {/* ── Hero Image with overlay back button ── */}
            <div className="relative w-full h-[45vh] min-h-[280px] overflow-hidden">
                <OverlayBackButton onClick={() => navigate(-1)} />
                {image ? (
                    <img
                        src={image}
                        alt={name}
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
            <div className="px-5 pb-6 flex flex-col flex-1 -mt-2">

                {/* ── Facility Name ── */}
                <h1 className="text-[1.6rem] font-bold m-0 mb-5 leading-tight">
                    {name}
                </h1>

                {/* ── Description ── */}
                <ExpandableDescription text={description} />

                {/* ── Dynamic Info Sections ── */}
                {/* LEARNING: We render all possible fields conditionally.
                    InfoSection returns null if value is empty. */}
                <InfoSection label="Cuisine" value={cuisine} />
                <InfoSection label="Timings" value={timings} />
                <InfoSection label="Average Price" value={avgPrice ? `Avg price for 2 ₹ ${avgPrice}` : ''} />
                <InfoSection label="Max Capacity" value={maxCapacity ? `${maxCapacity} people` : ''} />
                <InfoSection label="Area" value={area} />
                <InfoSection label="Equipment" value={equipment} />
                <InfoSection label="Treatments" value={treatments} />
                <InfoSection label="Price Range" value={priceRange} />

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Check Availability Button ── */}
                <button
                    onClick={handleCheckAvailability}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-8"
                >
                    Check Availability
                </button>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    return (
        <div className="mt-5">
            <h3 className="text-white text-base font-bold m-0 mb-1">{label}</h3>
            <p className="text-gray-400 text-sm m-0 leading-relaxed">{value}</p>
        </div>
    );
}

/* ── Dining detail sections ── */
function DiningDetail({ facility }) {
    return (
        <>
            <ExpandableDescription text={facility.detailDescription} />
            <InfoSection label="Cuisine" value={facility.cuisine} />
            <InfoSection label="Timings" value={facility.timings} />
            <InfoSection label="Average Price" value={`Avg price for 2 ₹ ${facility.avgPrice}`} />
        </>
    );
}

/* ── Event detail sections ── */
function EventDetail({ facility }) {
    return (
        <>
            <ExpandableDescription text={facility.detailDescription} />
            <InfoSection label="Max Capacity" value={`${facility.maxCapacity} people`} />
            <InfoSection label="Area" value={facility.area} />
        </>
    );
}

/* ── Fitness detail sections ── */
function FitnessDetail({ facility }) {
    return (
        <>
            <ExpandableDescription text={facility.detailDescription} />
            <InfoSection label="Timings" value={facility.timings} />
            <InfoSection label="Equipment" value={facility.equipment} />
            <InfoSection label="Area" value={facility.area} />
        </>
    );
}

/* ── Spa detail sections ── */
function SpaDetail({ facility }) {
    return (
        <>
            <ExpandableDescription text={facility.detailDescription} />
            <InfoSection label="Timings" value={facility.timings} />
            <InfoSection label="Treatments" value={facility.treatments} />
            <InfoSection label="Price Range" value={facility.priceRange} />
        </>
    );
}

/* ── Render correct detail layout ── */
function FacilityInfo({ facility, type }) {
    switch (type) {
        case 'dining': return <DiningDetail facility={facility} />;
        case 'event': return <EventDetail facility={facility} />;
        case 'fitness': return <FitnessDetail facility={facility} />;
        case 'spa': return <SpaDetail facility={facility} />;
        default: return null;
    }
}

/* ══════════════════════════════════════════════════
   ── Facility Detail Page ──
   ══════════════════════════════════════════════════ */
export default function FacilityDetail() {
    const navigate = useNavigate();
    const location = useLocation();

    const facility = location.state?.facility || {};
    const facilityType = location.state?.facilityType || 'dining';

    const handleCheckAvailability = () => {
        navigate('/facilities/reserve', {
            state: { facility }
        });
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">

            {/* ── Hero Image with overlay back button ── */}
            <div className="relative w-full h-[45vh] min-h-[280px] overflow-hidden">
                <OverlayBackButton onClick={() => navigate(-1)} />
                <img
                    src={facility.image}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                />
                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
            </div>

            {/* ── Content ── */}
            <div className="px-5 pb-6 flex flex-col flex-1 -mt-2">

                {/* ── Facility Name ── */}
                <h1 className="text-[1.6rem] font-bold m-0 mb-5 leading-tight">
                    {facility.name}
                </h1>

                {/* ── Type-specific details ── */}
                <FacilityInfo facility={facility} type={facilityType} />

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

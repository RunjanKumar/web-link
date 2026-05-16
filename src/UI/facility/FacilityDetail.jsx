import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime12Hour } from '../../utils/commonFunction';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY DETAIL PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This page receives a types[] item via location.state.
 * It shows full details of one facility type (e.g., one restaurant).
 *
 * The facility object shape (from types[]):
 *   { _id, name, description, image, startTime, endTime,
 *     days, isAvailable, cuisine, location, locationlink, pricing }
 *
 * Also receives:
 *   categoryName   → parent category name (e.g., "Dining")
 *   categoryImageUrl → parent category image
 */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDays(days) {
    if (!days || !Array.isArray(days)) return '';
    if (days.length === 7) return 'Open all days';
    return days.map((d) => DAY_NAMES[d]).join(', ');
}

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
function InfoSection({ label, value, children }) {
    if (!value && !children) return null;
    return (
        <div className="mt-5">
            <h3 className="text-white text-base font-bold m-0 mb-1">{label}</h3>
            {children || <p className="text-gray-400 text-sm m-0 leading-relaxed">{value}</p>}
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── Facility Detail Page ──
   ══════════════════════════════════════════════════ */
export default function FacilityDetail() {
    const navigate = useNavigate();
    const location = useLocation();

    // Receive the types[] item + category info from navigation
    const facility = location.state?.facility || {};
    const categoryName = location.state?.categoryName || '';

    console.log('🔍 [FacilityDetail] Received facility:', JSON.stringify(facility, null, 2));
    console.log('🔍 [FacilityDetail] Category:', categoryName);

    const handleCheckAvailability = () => {
        console.log('🔍 [FacilityDetail] Navigating to reserve page for:', facility.name);
        navigate('/facilities/reserve', {
            state: { facility }
        });
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">

            {/* ── Hero Image ── */}
            <div className="relative w-full h-[45vh] min-h-[280px] overflow-hidden">
                <OverlayBackButton onClick={() => navigate(-1)} />
                {facility.image ? (
                    <img
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
            <div className="px-5 pb-6 flex flex-col flex-1 -mt-2">

                {/* Category badge */}
                {categoryName && (
                    <span className="text-yellow-400 text-xs font-semibold mb-1">{categoryName}</span>
                )}

                {/* Name */}
                <h1 className="text-[1.6rem] font-bold m-0 mb-5 leading-tight">
                    {facility.name}
                </h1>

                {/* Description */}
                <ExpandableDescription text={facility.description} />

                {/* Type (e.g., "cafe") */}
                <InfoSection label="Type" value={facility.type} />

                {/* Cuisine */}
                <InfoSection label="Cuisine" value={facility.cuisine} />

                {/* Timings */}
                {facility.startTime && facility.endTime && (
                    <InfoSection label="Timings">
                        <p className="text-gray-400 text-sm m-0">
                            {formatTime12Hour(facility.startTime)} – {formatTime12Hour(facility.endTime)}
                        </p>
                    </InfoSection>
                )}

                {/* Available Days */}
                <InfoSection label="Available Days" value={formatDays(facility.days)} />

                {/* Location */}
                <InfoSection label="Location" value={facility.location} />

                {/* Location Link / Area */}
                {facility.locationlink && (
                    <InfoSection label="Location Area">
                        <p className="text-gray-400 text-sm m-0">{facility.locationlink}</p>
                    </InfoSection>
                )}

                {/* Pricing */}
                {facility.pricing > 0 && (
                    <InfoSection label="Pricing" value={`₹ ${facility.pricing}`} />
                )}

                {/* Contact (if backend sends it) */}
                <InfoSection label="Contact" value={facility.contact} />

                {/* Capacity (if backend sends it) */}
                {facility.capacity > 0 && (
                    <InfoSection label="Capacity" value={`${facility.capacity} people`} />
                )}

                {/* Area (if backend sends it) */}
                <InfoSection label="Area" value={facility.area} />

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Book Now Button ── */}
                <button
                    onClick={handleCheckAvailability}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-8"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
}

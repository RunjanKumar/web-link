import { useNavigate } from 'react-router-dom';
import ThreeDotMenu from '../../globalComponents/ThreeDotMenu';
import BottomNav from '../../globalComponents/BottomNav';
import useFacilityViewModel from '../../viewModel/facilityViewModel';

/* ── Tab Icons ── */
function TabIcon({ type, active }) {
    const color = active ? '#000' : '#facc15';
    const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

    switch (type) {
        case 'dining':
            return (<svg {...base}><path d="M17 8c0-5-5-5-5-5s-5 0-5 5" /><path d="M3 14h18" /><path d="M3 14c0 3.5 2.5 6.5 6 7.5V23h6v-1.5c3.5-1 6-4 6-7.5" /></svg>);
        case 'event':
            return (<svg {...base}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
        case 'fitness':
            return (<svg {...base}><path d="M6 4v16" /><path d="M18 4v16" /><path d="M2 8h4" /><path d="M2 16h4" /><path d="M18 8h4" /><path d="M18 16h4" /><path d="M6 12h12" /></svg>);
        case 'spa':
            return (<svg {...base}><circle cx="12" cy="12" r="3" /><path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7.5S12 22 12 22s-1-3-3-5.5S5 12 5 9a7 7 0 0 1 7-7z" /></svg>);
        default:
            return null;
    }
}

/* ── Facility Type Tab Buttons ── */
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
                        <TabIcon type={t.id} active={isActive} />
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ── Dining Facility Card ── */
function DiningCard({ facility }) {
    const disabled = !facility.isAvailable;

    return (
        <div className={`bg-[#111111] rounded-2xl border border-gray-800/40 overflow-hidden mb-4 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale' : ''}`}>
            <div className="flex">
                {/* Left Info */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-white text-lg font-bold m-0">{facility.name}</h3>
                        <p className="text-gray-400 text-xs m-0 mt-1">Cuisine - {facility.cuisine}</p>
                        <p className="text-gray-500 text-xs m-0 mt-2 leading-relaxed">
                            Timings - {facility.timings}
                        </p>
                    </div>
                    <p className="text-yellow-400 text-xs font-semibold m-0 mt-3">
                        Avg price for 2 ₹ {facility.avgPrice}
                    </p>
                </div>

                {/* Right Image */}
                <div className="w-[140px] min-h-[160px]">
                    <img src={facility.image} alt={facility.name} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Disabled overlay */}
            {disabled && (
                <div className="px-4 pb-3 pt-0">
                    <span className="text-red-400/80 text-xs font-medium">Currently Unavailable</span>
                </div>
            )}
        </div>
    );
}

/* ── Event Facility Card ── */
function EventCard({ facility }) {
    const disabled = !facility.isAvailable;

    return (
        <div className={`bg-[#111111] rounded-2xl border border-gray-800/40 overflow-hidden mb-4 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale' : ''}`}>
            <div className="flex">
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-white text-lg font-bold m-0">{facility.name}</h3>
                        <p className="text-gray-400 text-xs m-0 mt-1">Max Capacity - {facility.maxCapacity}</p>
                        <p className="text-gray-500 text-xs m-0 mt-2 leading-relaxed">
                            {facility.description}
                        </p>
                    </div>
                    <p className="text-yellow-400 text-xs font-semibold m-0 mt-3">
                        Area: {facility.area}
                    </p>
                </div>
                <div className="w-[140px] min-h-[160px]">
                    <img src={facility.image} alt={facility.name} className="w-full h-full object-cover" />
                </div>
            </div>

            {disabled && (
                <div className="px-4 pb-3 pt-0">
                    <span className="text-red-400/80 text-xs font-medium">Currently Unavailable</span>
                </div>
            )}
        </div>
    );
}

/* ── Fitness Facility Card ── */
function FitnessCard({ facility }) {
    const disabled = !facility.isAvailable;

    return (
        <div className={`bg-[#111111] rounded-2xl border border-gray-800/40 overflow-hidden mb-4 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale' : ''}`}>
            <div className="flex">
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-white text-lg font-bold m-0">{facility.name}</h3>
                        <p className="text-gray-400 text-xs m-0 mt-1">Timings - {facility.timings}</p>
                        <p className="text-gray-500 text-xs m-0 mt-2 leading-relaxed">
                            {facility.equipment}
                        </p>
                    </div>
                    <p className="text-yellow-400 text-xs font-semibold m-0 mt-3">
                        Area: {facility.area}
                    </p>
                </div>
                <div className="w-[140px] min-h-[160px]">
                    <img src={facility.image} alt={facility.name} className="w-full h-full object-cover" />
                </div>
            </div>

            {disabled && (
                <div className="px-4 pb-3 pt-0">
                    <span className="text-red-400/80 text-xs font-medium">Currently Unavailable</span>
                </div>
            )}
        </div>
    );
}

/* ── Spa Facility Card ── */
function SpaCard({ facility }) {
    const disabled = !facility.isAvailable;

    return (
        <div className={`bg-[#111111] rounded-2xl border border-gray-800/40 overflow-hidden mb-4 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale' : ''}`}>
            <div className="flex">
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-white text-lg font-bold m-0">{facility.name}</h3>
                        <p className="text-gray-400 text-xs m-0 mt-1">Timings - {facility.timings}</p>
                        <p className="text-gray-500 text-xs m-0 mt-2 leading-relaxed">
                            {facility.treatments}
                        </p>
                    </div>
                    <p className="text-yellow-400 text-xs font-semibold m-0 mt-3">
                        {facility.priceRange}
                    </p>
                </div>
                <div className="w-[140px] min-h-[160px]">
                    <img src={facility.image} alt={facility.name} className="w-full h-full object-cover" />
                </div>
            </div>

            {disabled && (
                <div className="px-4 pb-3 pt-0">
                    <span className="text-red-400/80 text-xs font-medium">Currently Unavailable</span>
                </div>
            )}
        </div>
    );
}

/* ── Render correct card type (clickable wrapper) ── */
function FacilityCard({ facility, type, onClick }) {
    const disabled = !facility.isAvailable;

    const renderCard = () => {
        switch (type) {
            case 'dining': return <DiningCard facility={facility} />;
            case 'event': return <EventCard facility={facility} />;
            case 'fitness': return <FitnessCard facility={facility} />;
            case 'spa': return <SpaCard facility={facility} />;
            default: return null;
        }
    };

    return (
        <div
            onClick={() => !disabled && onClick(facility)}
            className={`${disabled ? '' : 'cursor-pointer active:scale-[0.98] transition-transform duration-150'}`}
        >
            {renderCard()}
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
    } = useFacilityViewModel();

    const handleFacilityClick = (facility) => {
        navigate('/facilities/detail', {
            state: { facility, facilityType: activeType }
        });
    };

    const menuItems = [
        { label: 'Request Facility', onClick: () => navigate('/facilities/upcoming-events', { state: { showToast: false } }) },
        { label: 'Help', onClick: () => { /* TODO */ } },
    ];

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

                {/* ── Facility Type Tabs ── */}
                <FacilityTabs
                    types={facilityTypes}
                    activeType={activeType}
                    onSelect={setActiveType}
                />

                {/* ── Facility Cards ── */}
                <div className="mt-5">
                    {facilities.length > 0 ? (
                        facilities.map((facility) => (
                            <FacilityCard
                                key={facility.id}
                                facility={facility}
                                type={activeType}
                                onClick={handleFacilityClick}
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-gray-500 text-sm">No facilities available</p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

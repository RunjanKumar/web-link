import { useNavigate } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';
import ThreeDotMenu from '../../globalComponents/ThreeDotMenu';
import BottomNav from '../../globalComponents/BottomNav';
import useServiceViewModel from '../../viewModel/serviceViewModel';

/* ── Inline SVG icons for each subcategory type ── */
function ServiceIcon({ name }) {
    const base = { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: '#facc15', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

    switch (name) {
        case 'Room Cleaning':
            return (<svg {...base}><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /><path d="M10 9h4" /></svg>);
        case 'Washroom Cleaning':
            return (<svg {...base}><path d="M7 21h10" /><path d="M12 3v4" /><path d="M4 11h16" /><path d="M5 11c0 4.5 3 8 7 10 4-2 7-5.5 7-10" /><circle cx="12" cy="7" r="1" fill="#facc15" /></svg>);
        case 'Linen Change':
            return (<svg {...base}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
        case 'Replenish Amenities':
            return (<svg {...base}><path d="M20 7h-3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3" /><path d="M4 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4" /><path d="M12 3v18" /><circle cx="12" cy="7" r="2" fill="#facc15" /></svg>);
        case 'AC Repair':
            return (<svg {...base}><rect x="2" y="4" width="20" height="10" rx="2" /><path d="M6 14v4" /><path d="M18 14v4" /><path d="M7 8h10" /><path d="M7 11h4" /></svg>);
        case 'Plumbing Fix':
            return (<svg {...base}><path d="M12 2v6" /><path d="M6 8h12" /><path d="M8 8v4c0 2.5 1.5 5 4 8 2.5-3 4-5.5 4-8V8" /></svg>);
        case 'Electrical Repair':
            return (<svg {...base}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" /></svg>);
        case 'Wash & Fold':
            return (<svg {...base}><rect x="2" y="6" width="20" height="14" rx="3" /><path d="M2 10h20" /><circle cx="7" cy="15" r="2" /><circle cx="17" cy="15" r="2" /></svg>);
        case 'Dry Cleaning':
            return (<svg {...base}><path d="M8 2h8l2 5H6l2-5z" /><path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" /><path d="M12 11v6" /><path d="M9 14h6" /></svg>);
        case 'Ironing Service':
            return (<svg {...base}><path d="M6 18h12" /><path d="M3 14h18l-3-8H6L3 14z" /><path d="M12 6v4" /></svg>);
        default:
            return (<svg {...base}><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>);
    }
}

/* ── Chevron icon for accordion toggle ── */
function ChevronIcon({ isOpen }) {
    return (
        <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="#facc15" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/* ── Single subcategory card ── */
function SubcategoryCard({ item, onToggleRequest, requested }) {
    const disabled = !item.isAvailable;

    return (
        <div
            className={`flex items-center gap-4 py-4 px-2 border-b border-gray-800/50 last:border-b-0 transition-opacity duration-200 ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}
        >
            {/* Icon */}
            <div className="w-14 h-14 min-w-[3.5rem] rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center">
                <ServiceIcon name={item.name} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-semibold m-0 leading-snug">{item.name}</h4>
                <p className="text-gray-500 text-xs m-0 mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
                {item.price > 0 && (
                    <p className="text-gray-400 text-xs m-0 mt-1 font-medium">₹ {item.price}</p>
                )}
            </div>

            {/* Request / Requested / Unavailable button */}
            <button
                onClick={() => !disabled && onToggleRequest(item.id)}
                disabled={disabled}
                className={`shrink-0 px-4 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200 ${disabled
                    ? 'bg-transparent border-gray-700 text-gray-600 cursor-not-allowed'
                    : requested
                        ? 'bg-yellow-400/15 border-yellow-500/80 text-yellow-400 cursor-pointer hover:bg-yellow-400/25 active:scale-95'
                        : 'bg-transparent border-yellow-500/60 text-yellow-400 cursor-pointer hover:bg-yellow-400/10 active:scale-95'
                    }`}
            >
                {disabled ? 'Unavailable' : requested ? 'Requested' : 'Request'}
            </button>
        </div>
    );
}

/* ── Accordion category section ── */
function CategorySection({ category, isOpen, onToggle, onToggleRequest, isRequested }) {
    return (
        <div className="mb-4">
            {/* Category header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between bg-[#141414] border border-gray-800/60 rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] group"
            >
                <div className="flex items-center gap-3">
                    {/* Yellow accent bar */}
                    <div className="w-1 h-6 bg-yellow-400 rounded-full" />
                    <div className="text-left">
                        <h3 className="text-white text-base font-bold m-0">{category.categoryName}</h3>
                        {/* From – To time */}
                        <p className="text-gray-500 text-[0.65rem] m-0 mt-0.5">
                            {category.availableFrom} – {category.availableTo}
                        </p>
                    </div>
                </div>
                <ChevronIcon isOpen={isOpen} />
            </button>

            {/* Collapsible subcategories */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
            >
                <div className="bg-[#111111] rounded-xl border border-gray-800/40 px-3 py-1">
                    {category.subcategories.map((sub) => (
                        <SubcategoryCard
                            key={sub.id}
                            item={sub}
                            onToggleRequest={onToggleRequest}
                            requested={isRequested(sub.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── Main ServiceRequest Page ──
   ══════════════════════════════════════════════════ */
export default function ServiceRequest() {
    const navigate = useNavigate();
    const {
        servicesData,
        openCategories,
        toggleCategory,
        toggleRequest,
        isRequested,
        hasRequestedServices,
        getRequestedItemsGrouped,
    } = useServiceViewModel();

    const handleReviewRequest = () => {
        const groupedItems = getRequestedItemsGrouped();
        navigate('/services/review', { state: { groupedItems } });
    };

    const menuItems = [
        { label: 'Request history', onClick: () => navigate('/services/pending', { state: { submittedItems: [], showToast: false } }) },
        { label: 'Help', onClick: () => { /* TODO */ } },
    ];

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative">
            <div className="pt-12 px-5 pb-36 flex flex-col">

                {/* ── Header Row ── */}
                <div className="flex items-center justify-between mb-1">
                    <BackButton />
                    <ThreeDotMenu items={menuItems} />
                </div>

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mb-6 leading-tight">
                    Service Request
                </h1>

                {/* ── Service Categories ── */}
                {servicesData.map((cat) => (
                    <CategorySection
                        key={cat.id}
                        category={cat}
                        isOpen={!!openCategories[cat.id]}
                        onToggle={() => toggleCategory(cat.id)}
                        onToggleRequest={toggleRequest}
                        isRequested={isRequested}
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

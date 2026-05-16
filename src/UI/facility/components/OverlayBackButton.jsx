/**
 * OverlayBackButton — Back arrow overlaid on a hero image.
 * Reused in: FacilityDetail, ReserveTable, and any future detail pages.
 */
export default function OverlayBackButton({ onClick }) {
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

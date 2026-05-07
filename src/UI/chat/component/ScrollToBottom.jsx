/**
 * ScrollToBottom — floating action button that scrolls to the latest message.
 * Only visible when user has scrolled up from the bottom.
 */
export default function ScrollToBottom({ visible, onClick }) {
    if (!visible) return null;

    return (
        <button
            onClick={onClick}
            className="absolute bottom-24 right-5 w-10 h-10 rounded-full bg-amber-500 
                       flex items-center justify-center shadow-lg shadow-amber-500/20
                       cursor-pointer border-none transition-all duration-300 hover:bg-amber-400
                       animate-fadeIn z-10"
            aria-label="Scroll to bottom"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </button>
    );
}

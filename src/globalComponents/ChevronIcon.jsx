export default function ChevronIcon({ isOpen }) {
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
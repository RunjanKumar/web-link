export default function FacilityTypeIcon({ size = 18, color = '#facc15' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M9 21V8h6v13" />
            <path d="M9 12h6" />
            <path d="M9 16h6" />
        </svg>
    );
}
/**
 * StarRating – Reusable 5-star rating selector.
 *
 * @param {number}   rating   – Currently selected rating (0–5)
 * @param {function} onSelect – Called with the star number when a star is tapped
 */
export default function StarRating({ rating, onSelect }) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex gap-8 justify-center">
            {stars.map((star) => (
                <button
                    key={star}
                    onClick={() => onSelect(star)}
                    className="bg-transparent border-none cursor-pointer p-0"
                >
                    <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill={star <= rating ? '#facc15' : 'none'}
                        stroke="#facc15"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
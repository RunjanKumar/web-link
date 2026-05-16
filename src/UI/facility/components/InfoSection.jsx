/**
 * InfoSection — A label + value info row for detail pages.
 * Returns null if both value and children are empty,
 * so you can use it freely without conditional rendering.
 *
 * Usage:
 *   <InfoSection label="Cuisine" value="Italian, Chinese" />
 *   <InfoSection label="Timings"><p>12 PM – 6 PM</p></InfoSection>
 */
export default function InfoSection({ label, value, children }) {
    if (!value && !children) return null;
    return (
        <div className="mt-5">
            <h3 className="text-white text-base font-bold m-0 mb-1">{label}</h3>
            {children || <p className="text-gray-400 text-sm m-0 leading-relaxed">{value}</p>}
        </div>
    );
}

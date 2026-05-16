/**
 * EventInfoRow — Reusable icon + text row for booking cards.
 *
 * Props:
 *   icon  — React element (SVG icon component)
 *   text  — Display text string
 *   textClassName — Optional extra Tailwind classes for the text
 *   textStyle     — Optional inline styles for the text (e.g., dynamic color)
 */
export default function EventInfoRow({ icon, text, textClassName = '', textStyle = {} }) {
    if (!text) return null;

    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-800/30 last:border-b-0">
            <span className="shrink-0 flex items-center justify-center w-5">{icon}</span>
            <span className={`text-sm leading-snug ${textClassName}`} style={textStyle}>{text}</span>
        </div>
    );
}

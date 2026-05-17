/**
 * ══════════════════════════════════════════════════════════════
 * VEG / NON-VEG INDICATOR
 * ══════════════════════════════════════════════════════════════
 *
 * Standard Indian food indicator:
 *   type 1 → Green (Veg)
 *   type 2 → Red (Non-Veg)
 *
 * Shows a square border with a circle inside, matching
 * FSSAI / Zomato / Swiggy style.
 */

export default function VegIndicator({ type, size = 18 }) {
    if (!type) return null;

    const isVeg = type === 1;
    const color = isVeg ? '#22C55E' : '#EF4444';

    const borderSize = size;
    const dotSize = size * 0.5;

    return (
        <div
            className="flex items-center justify-center rounded-[3px] shrink-0"
            style={{
                width: borderSize,
                height: borderSize,
                border: `2px solid ${color}`,
            }}
            title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        >
            <div
                className="rounded-full"
                style={{
                    width: dotSize,
                    height: dotSize,
                    backgroundColor: color,
                }}
            />
        </div>
    );
}

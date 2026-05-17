/**
 * ══════════════════════════════════════════════════════════════
 * COUPON SLIDER COMPONENT (DOT INDICATORS)
 * ══════════════════════════════════════════════════════════════
 *
 * The dot indicators displayed below the coupon slider.
 * Receives activeIndex and totalCoupons from CouponViewModel.
 */

export default function CouponDots({ activeIndex, totalCoupons, onDotClick }) {
    if (totalCoupons <= 1) return null;

    return (
        <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalCoupons }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onDotClick(index)}
                    className={`rounded-full transition-all duration-300 ${
                        index === activeIndex
                            ? 'w-[24px] h-[8px] bg-[#E2B124]'
                            : 'w-[8px] h-[8px] bg-[#3A3A3A]'
                    }`}
                    aria-label={`Go to offer ${index + 1}`}
                />
            ))}
        </div>
    );
}

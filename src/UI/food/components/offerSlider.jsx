import { useRef, useCallback } from 'react';
import useCouponViewModel from '../../../viewModel/couponViewModel';
import CouponCard from './coupon/CouponCard';
import CouponDots from './coupon/CouponDots';

/**
 * ══════════════════════════════════════════════════════════════
 * OFFER SLIDER COMPONENT
 * ══════════════════════════════════════════════════════════════
 *
 * Renders the "Special Offers" horizontal slider using
 * real coupon data from the API (via CouponViewModel).
 *
 * Props:
 *   - couponData: raw coupon array from foodViewModel
 *
 * Architecture (MVVM):
 *   - UI: This component + CouponCard + CouponDots
 *   - ViewModel: useCouponViewModel (transforms data, manages slider state)
 */

export default function OfferSlider({ couponData }) {
    const {
        coupons,
        activeIndex,
        totalCoupons,
        goToIndex,
    } = useCouponViewModel(couponData);

    const scrollRef = useRef(null);

    /**
     * Handles scroll snapping — updates the active dot
     * based on the current scroll position.
     */
    const handleScroll = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;

        const cardWidth = 320 + 20; // card width + gap
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / cardWidth);

        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < totalCoupons) {
            goToIndex(newIndex);
        }
    }, [activeIndex, totalCoupons, goToIndex]);

    /**
     * When a dot is clicked, scroll to that coupon card.
     */
    const handleDotClick = useCallback((index) => {
        goToIndex(index);
        const container = scrollRef.current;
        if (container) {
            const cardWidth = 320 + 20;
            container.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth',
            });
        }
    }, [goToIndex]);

    // Don't render section if no coupons available
    if (!coupons || coupons.length === 0) {
        return null;
    }

    return (
        <div className="mt-10">
            <h2 className="text-3xl font-semibold mb-5">
                Special Offers
            </h2>

            {/* Horizontal scrollable coupon cards */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="snap-start">
                        <CouponCard coupon={coupon} />
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            <CouponDots
                activeIndex={activeIndex}
                totalCoupons={totalCoupons}
                onDotClick={handleDotClick}
            />
        </div>
    );
}
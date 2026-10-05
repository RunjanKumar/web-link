import useOfferSliderViewModel from '../../../viewModel/offerSliderViewModel';
import CouponCard from './coupon/CouponCard';
import CouponDots from './coupon/CouponDots';

export default function OfferSlider({ couponData }) {
    const {
        coupons,
        activeIndex,
        totalCoupons,
        scrollRef,
        handleScroll,
        handleDotClick,
    } = useOfferSliderViewModel(couponData);

    if (!coupons || coupons.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <h2 className="text-[22px] font-semibold mb-5">
                Special Offers
            </h2>

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

            <CouponDots
                activeIndex={activeIndex}
                totalCoupons={totalCoupons}
                onDotClick={handleDotClick}
            />
        </div>
    );
}

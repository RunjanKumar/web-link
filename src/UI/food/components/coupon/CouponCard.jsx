/**
 * ══════════════════════════════════════════════════════════════
 * COUPON CARD COMPONENT
 * ══════════════════════════════════════════════════════════════
 *
 * A single coupon/offer card used inside the OfferSlider.
 * Receives pre-formatted coupon data from the CouponViewModel.
 *
 * Design matches the Figma: rounded card with gradient background,
 * bold discount text on the left, food image on the right.
 */

export default function CouponCard({ coupon }) {
    const { gradient, discountText, subtitle, imageURL, code } = coupon;

    return (
        <div
            className="relative w-[320px] h-[180px] rounded-[24px] overflow-hidden shrink-0"
            style={{
                background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            }}
        >
            {/* Left: Text Content */}
            <div className="absolute inset-0 flex flex-col justify-center pl-5 pr-[140px] z-10">
                {/* Discount Headline */}
                <h3
                    className="text-white font-extrabold leading-[1.2] tracking-wide"
                    style={{ fontSize: '22px' }}
                >
                    {discountText}
                </h3>

                {/* Category / Subtitle */}
                {subtitle && (
                    <p className="text-white/90 font-bold mt-1 text-[16px] leading-[1.3]">
                        ON {subtitle.toUpperCase()}
                    </p>
                )}

                {/* Coupon Code Badge */}
                {code && (
                    <div className="mt-3">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/30">
                            {code}
                        </span>
                    </div>
                )}
            </div>

            {/* Right: Food Image */}
            {imageURL && (
                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-[5]">
                    <img
                        src={imageURL}
                        alt=""
                        className="w-[140px] h-[140px] rounded-full object-cover"
                        style={{
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    />
                </div>
            )}

            {/* Decorative circles */}
            <div
                className="absolute -left-6 -bottom-6 w-[100px] h-[100px] rounded-full opacity-20"
                style={{ background: gradient.from }}
            />
            <div
                className="absolute right-[120px] -top-4 w-[60px] h-[60px] rounded-full opacity-15"
                style={{ background: '#ffffff' }}
            />
        </div>
    );
}

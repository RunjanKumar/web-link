import { useNavigate } from 'react-router-dom';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON CARD COMPONENT
 * ══════════════════════════════════════════════════════════════
 *
 * A single coupon/offer card used inside the OfferSlider.
 * Shows the coupon image. On click, navigates to the
 * Coupon Detail page and passes the coupon data via state.
 */

export default function CouponCard({ coupon }) {
    const navigate = useNavigate();
    const { imageURL } = coupon;

    const handleClick = () => {
        navigate('/coupon-detail', { state: coupon });
    };

    return (
        <div
            onClick={handleClick}
            className="w-[340px] h-[150px] rounded-[22px] overflow-hidden shrink-0 cursor-pointer active:scale-[0.97] transition-transform"
        >
            <img
                src={imageURL}
                alt="coupon"
                className="w-full h-full object-cover"
            />
        </div>
    );
}
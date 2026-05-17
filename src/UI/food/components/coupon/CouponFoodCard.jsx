import { useNavigate } from 'react-router-dom';
import AddButton from '../AddButton';
import VegIndicator from '../VegIndicator';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON FOOD CARD
 * ══════════════════════════════════════════════════════════════
 *
 * Food card for the Coupon Detail page — shows discounted price
 * with original price crossed out + veg/non-veg indicator.
 */

export default function CouponFoodCard({ item }) {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/food-details', { state: item });
    };

    const hasDiscount = item.priceAfterDiscount < item.price;

    return (
        <div
            onClick={handleNavigate}
            className="flex border border-[#3A3A3A] rounded-[20px] overflow-hidden bg-[#161616] cursor-pointer"
        >
            {/* Left Content */}
            <div className="flex-1 px-4 py-4 flex flex-col justify-between min-w-0">
                <div>
                    {/* Veg/Non-veg + Title */}
                    <div className="flex items-center gap-2">
                        <VegIndicator type={item.type} size={16} />
                        <h2 className="text-white text-[17px] font-semibold leading-[22px] truncate">
                            {item.title}
                        </h2>
                    </div>

                    <p className="text-[#8F8F8F] text-[13px] leading-[19px] mt-[6px] line-clamp-2">
                        {item.description || 'A classic favorite, our chicken burger features a juicy, grilled or... read more'}
                    </p>

                    {item.calories > 0 && (
                        <p className="text-[#707070] text-[13px] mt-[6px]">
                            {item.calories} Kcal
                        </p>
                    )}
                </div>

                {/* Price + Add */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[#E2B124] text-[18px] font-bold">
                            ₹ {Math.round(item.priceAfterDiscount)}
                        </h3>
                        {hasDiscount && (
                            <span className="text-[#6B6B6B] text-[14px] line-through">
                                ₹{Math.round(item.price)}
                            </span>
                        )}
                    </div>

                    <AddButton item={item} />
                </div>
            </div>

            {/* Right Image */}
            <div className="w-[130px] shrink-0">
                {item.imageURL ? (
                    <img
                        src={item.imageURL}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#2A2A2A] min-h-[130px]" />
                )}
            </div>
        </div>
    );
}

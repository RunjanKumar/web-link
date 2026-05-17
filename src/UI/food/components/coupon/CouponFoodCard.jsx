import { useNavigate } from 'react-router-dom';
import useGlobal from '../../../../hooks/FoodOrder';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON FOOD CARD
 * ══════════════════════════════════════════════════════════════
 *
 * A food item card displayed in the Coupon Detail page.
 * Shows the original price (crossed out) and discounted price.
 *
 * Similar to the main FoodCard but includes discount pricing.
 */

export default function CouponFoodCard({ item }) {
    const navigate = useNavigate();
    const { addToFoodCart } = useGlobal();

    const handleNavigate = () => {
        navigate('/food-details', { state: item });
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToFoodCart(item);
    };

    const hasDiscount = item.priceAfterDiscount < item.price;

    return (
        <div
            onClick={handleNavigate}
            className="flex border border-[#3A3A3A] rounded-[24px] overflow-hidden bg-[#161616] items-center cursor-pointer"
        >
            {/* Left Content */}
            <div className="w-[75%] px-4 py-4 flex flex-col justify-between">
                <div>
                    <h2 className="text-white text-[18px] font-semibold leading-[22px]">
                        {item.title}
                    </h2>

                    <p className="text-[#8F8F8F] text-[14px] leading-[20px] mt-2 line-clamp-2">
                        {item.description || 'A classic favorite, our chicken burger features a juicy, grilled or... read more'}
                    </p>

                    {item.calories > 0 && (
                        <p className="text-[#A0A0A0] text-[15px] mt-2">
                            {item.calories} Kcal
                        </p>
                    )}
                </div>

                {/* Bottom: Price & Add */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        {/* Discounted Price */}
                        <h3 className="text-[#E2B124] text-[20px] font-semibold">
                            ₹ {Math.round(item.priceAfterDiscount)}
                        </h3>

                        {/* Original Price (crossed out) */}
                        {hasDiscount && (
                            <span className="text-[#6B6B6B] text-[15px] line-through">
                                ₹{Math.round(item.price)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="border border-[#E2B124] text-[#E2B124] rounded-[14px] px-4 py-[6px] text-[15px] font-medium hover:bg-[#E2B124] hover:text-[#161616] transition"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Right Image */}
            <div className="w-[35%] h-full">
                {item.imageURL ? (
                    <img
                        src={item.imageURL}
                        alt={item.title}
                        className="w-[142px] h-[131px] object-cover"
                    />
                ) : (
                    <div className="w-[142px] h-[131px] bg-[#2A2A2A] flex items-center justify-center">
                        <span className="text-[#6B6B6B] text-sm">No image</span>
                    </div>
                )}
            </div>
        </div>
    );
}

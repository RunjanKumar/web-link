import useFoodCardViewModel from "../../../viewModel/foodCardViewModel";
import { getDiscountDisplayInfo } from "../../../utils/discountHelper";
import AddButton from "./AddButton";
import VegIndicator from "./VegIndicator";

export default function FoodCard({ item }) {
    const { isAvailable, handleNavigate } = useFoodCardViewModel(item);

    const discount = getDiscountDisplayInfo({
        price: item.price,
        priceAfterDiscount: item.priceAfterDiscount,
        couponData: item.couponData,
    });

    return (
        <div
            onClick={handleNavigate}
            className={`relative flex border border-[#3A3A3A] rounded-[20px] overflow-hidden bg-[#161616] cursor-pointer ${!isAvailable ? 'opacity-50 grayscale' : ''
                }`}
        >
            <div className="flex-1 px-4 py-4 flex flex-col justify-between min-w-0">
                <div>
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

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[#E2B124] text-[18px] font-bold">
                            ₹ {Math.round(discount.displayPrice)}
                        </h3>

                        {/* PERCENTAGE: show strikethrough original price */}
                        {discount.originalPrice != null && (
                            <span className="text-[#6B6B6B] text-[13px] line-through">
                                ₹{Math.round(discount.originalPrice)}
                            </span>
                        )}

                        {/* BOGO: show 1+1 FREE badge */}
                        {discount.isBogo && (
                            <span className="bg-[#E2B124]/15 text-[#E2B124] text-[11px] font-bold px-[6px] py-[2px] rounded-[6px] leading-[16px] tracking-wide">
                                1+1 FREE
                            </span>
                        )}
                    </div>

                    {isAvailable ? (
                        <AddButton item={item} />
                    ) : (
                        <span className="text-[#FF4444] text-[13px] font-medium border border-[#FF4444]/30 rounded-[14px] px-3 py-[6px]">
                            Unavailable
                        </span>
                    )}
                </div>
            </div>

            <div className="w-[130px] shrink-0 relative">
                {item.imageURL ? (
                    <img
                        src={item.imageURL}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#2A2A2A] min-h-[130px]" />
                )}

                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center" />
                )}

                {/* BOGO badge on image corner */}
                {discount.isBogo && isAvailable && (
                    <div className="absolute top-0 right-0 bg-[#E2B124] text-black text-[10px] font-bold px-[6px] py-[3px] rounded-bl-[10px]">
                        BUY 1 GET 1
                    </div>
                )}
            </div>
        </div>
    );
}
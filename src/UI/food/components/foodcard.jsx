import { useNavigate } from "react-router-dom";
import AddButton from "./AddButton";
import VegIndicator from "./VegIndicator";

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD CARD COMPONENT
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is a THIN UI component.
 *   - Receives `item` prop (already mapped from raw API data by FoodList)
 *   - Renders the card UI
 *   - On click → navigates to /food-details passing `item` via state
 *   - AddButton handles cart logic (no cart logic here)
 *
 * ITEM FIELDS USED:
 *   item.id, item.title, item.description, item.price,
 *   item.calories, item.type, item.imageURL, item.isAvailable
 *
 * NAVIGATION:
 *   Click → navigate("/food-details", { state: item })
 *   FoodDetails page reads: const { state } = useLocation()
 */

export default function FoodCard({ item }) {
    const navigate = useNavigate();
    const isAvailable = item.isAvailable !== false;

    const handleNavigate = () => {
        console.log(item, '[FoodCard] Clicked:', item.title);
        console.log('[FoodCard] Navigating to /food-details with state:', item);
        console.log('[FoodCard] ★ Data being passed to FoodDetails:');
        console.log('  id:', item.id);
        console.log('  title:', item.title);
        console.log('  price:', item.price);
        console.log('  calories:', item.calories);
        console.log('  type:', item.type);
        console.log('  inGridients:', item.inGridients);
        console.log('  choiceOfAddOn:', item.choiceOfAddOn, '(count:', item.choiceOfAddOn?.length, ')');
        console.log('  isAvailable:', item.isAvailable);
        navigate("/food-details", { state: item });
    };

    return (
        <div
            onClick={handleNavigate}
            className={`relative flex border border-[#3A3A3A] rounded-[20px] overflow-hidden bg-[#161616] cursor-pointer ${
                !isAvailable ? 'opacity-50 grayscale' : ''
            }`}
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

                    {/* Description */}
                    <p className="text-[#8F8F8F] text-[13px] leading-[19px] mt-[6px] line-clamp-2">
                        {item.description || 'A classic favorite, our chicken burger features a juicy, grilled or... read more'}
                    </p>

                    {/* Calories */}
                    {item.calories > 0 && (
                        <p className="text-[#707070] text-[13px] mt-[6px]">
                            {item.calories} Kcal
                        </p>
                    )}
                </div>

                {/* Price + Add Button */}
                <div className="flex items-center justify-between mt-3">
                    <h3 className="text-[#E2B124] text-[18px] font-bold">
                        ₹ {item.price}
                    </h3>

                    {isAvailable ? (
                        <AddButton item={item} />
                    ) : (
                        <span className="text-[#FF4444] text-[13px] font-medium border border-[#FF4444]/30 rounded-[14px] px-3 py-[6px]">
                            Unavailable
                        </span>
                    )}
                </div>
            </div>

            {/* Right Image */}
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

                {/* Not available overlay on image */}
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center" />
                )}
            </div>
        </div>
    );
}
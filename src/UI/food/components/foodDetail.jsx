import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobal from "../../../hooks/FoodOrder";
import VegIndicator from "./VegIndicator";

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD DETAILS PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * Shows full details for a food item — uses real data from
 * navigation state. The bottom bar has a working counter
 * synced with the global FoodOrderContext.
 */

export default function FoodDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { addToFoodCart, updateFoodCartQuantity, getItemQuantity } = useGlobal();

    // Get current quantity from global cart
    const quantity = getItemQuantity(state?.id);

    const handleAdd = () => {
        addToFoodCart(state);
    };

    const handleIncrement = () => {
        updateFoodCartQuantity(state?.id, quantity + 1);
    };

    const handleDecrement = () => {
        updateFoodCartQuantity(state?.id, quantity - 1);
    };

    // Calculate total price for the bottom bar
    const itemPrice = state?.priceAfterDiscount ?? state?.price ?? 0;
    const totalPrice = itemPrice * (quantity || 1);

    return (
        <div className="min-h-screen bg-[#111111] text-white pb-[120px]">

            {/* Top Image */}
            <div className="relative">
                <img
                    src={state?.imageURL || state?.image}
                    alt={state?.title}
                    className="w-full h-[360px] object-cover"
                />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-5 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="px-5 pt-6">

                {/* Title + Veg/Non-veg indicator */}
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-[36px] font-semibold leading-[42px]">
                        {state?.title}
                    </h1>

                    <VegIndicator type={state?.type} size={28} />
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mt-4">
                    <span className="text-[#E2B124] text-[24px] font-bold">
                        ₹ {Math.round(itemPrice)}
                    </span>

                    {state?.priceAfterDiscount && state.priceAfterDiscount < state.price && (
                        <span className="text-[#6B6B6B] text-[18px] line-through">
                            ₹{Math.round(state.price)}
                        </span>
                    )}

                    {state?.calories > 0 && (
                        <span className="text-[#A0A0A0] text-[16px] ml-auto">
                            {state.calories} Kcal
                        </span>
                    )}
                </div>

                {/* Description */}
                <div className="mt-10">
                    <h2 className="text-[20px] font-semibold text-[#CFCFCF]">
                        Description
                    </h2>

                    <p className="text-[#9E9E9E] text-[17px] leading-[32px] mt-4">
                        {state?.description || 'A classic favorite, our chicken burger features a juicy, grilled or breaded chicken patty served on a soft bun, accompanied by crisp lettuce, ripe tomatoes, sliced onions, and your choice of condiments.'}
                    </p>
                </div>

                {/* Ingredients (show if available) */}
                {state?.ingredients && (
                    <div className="mt-10">
                        <h2 className="text-[20px] font-semibold text-[#CFCFCF]">
                            Ingredients
                        </h2>

                        <p className="text-[#9E9E9E] text-[17px] leading-[32px] mt-4">
                            {state.ingredients}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Bar — working counter + add */}
            <div className="fixed bottom-0 left-0 w-full bg-[#2B2B2B] px-5 py-5 flex items-center gap-4 z-50">

                {/* Counter */}
                <div className="w-[120px] h-[60px] rounded-[22px] border border-[#5A5A5A] flex items-center justify-around">
                    <button
                        onClick={handleDecrement}
                        className="text-yellow-400 text-[28px] w-10 h-full flex items-center justify-center"
                    >
                        −
                    </button>

                    <p className="text-[28px]">
                        {quantity || 1}
                    </p>

                    <button
                        onClick={quantity > 0 ? handleIncrement : handleAdd}
                        className="text-yellow-400 text-[28px] w-10 h-full flex items-center justify-center"
                    >
                        +
                    </button>
                </div>

                {/* Add Button */}
                <button
                    onClick={quantity === 0 ? handleAdd : undefined}
                    className={`flex-1 h-[60px] rounded-[22px] text-[22px] font-semibold transition ${
                        quantity > 0
                            ? 'bg-yellow-400 text-black'
                            : 'bg-yellow-400 text-black active:scale-95'
                    }`}
                >
                    {quantity > 0
                        ? `${quantity} item${quantity > 1 ? 's' : ''} - ₹ ${Math.round(totalPrice)}`
                        : `Add items - ₹ ${Math.round(itemPrice)}`
                    }
                </button>
            </div>
        </div>
    );
}
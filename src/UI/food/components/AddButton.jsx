import useGlobal from '../../../hooks/FoodOrder';

/**
 * ══════════════════════════════════════════════════════════════
 * ADD BUTTON COMPONENT (Reusable — Shared Cart State)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This component reads from the global FoodOrderContext.
 * Since it uses getItemQuantity(item.id), the same food item
 * shows the SAME count everywhere it appears:
 *   - FoodCard on the main food page
 *   - CouponFoodCard on the coupon detail page
 *   - Both show "2" if you added 2 from either place
 *
 * This works because the FoodOrderContext is at the ROOT level
 * (wraps the entire app in main.jsx), so ALL components share
 * the same cart state.
 */

export default function AddButton({ item }) {
    const { addToFoodCart, updateFoodCartQuantity, getItemQuantity } = useGlobal();

    const quantity = getItemQuantity(item.id);

    const handleAdd = (e) => {
        e.stopPropagation(); // Prevent card click (navigation)
        console.log('[AddButton] Adding to cart:', item.title, '(id:', item.id, ')');
        addToFoodCart(item);
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        console.log('[AddButton] Incrementing:', item.title, '→', quantity + 1);
        updateFoodCartQuantity(item.id, quantity + 1);
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        console.log('[AddButton] Decrementing:', item.title, '→', quantity - 1);
        if (quantity - 1 === 0) console.log('[AddButton] Quantity will be 0 → removing from cart');
        updateFoodCartQuantity(item.id, quantity - 1);
    };

    // Not in cart → show "Add" button
    if (quantity === 0) {
        return (
            <button
                onClick={handleAdd}
                className="border border-[#E2B124] text-[#E2B124] rounded-[14px] px-4 py-[6px] text-[15px] font-medium hover:bg-[#E2B124] hover:text-[#161616] transition"
            >
                Add
            </button>
        );
    }

    // In cart → show quantity counter
    return (
        <div className="flex items-center gap-1 border border-[#E2B124] rounded-[14px] overflow-hidden">
            <button
                onClick={handleDecrement}
                className="w-[30px] h-[32px] flex items-center justify-center text-[#E2B124] text-[18px] font-bold hover:bg-[#E2B124]/10 transition"
            >
                −
            </button>

            <span className="w-[24px] text-center text-[#E2B124] text-[15px] font-semibold">
                {quantity}
            </span>

            <button
                onClick={handleIncrement}
                className="w-[30px] h-[32px] flex items-center justify-center text-[#E2B124] text-[18px] font-bold hover:bg-[#E2B124]/10 transition"
            >
                +
            </button>
        </div>
    );
}

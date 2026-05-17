import useGlobal from '../../../hooks/FoodOrder';

/**
 * ══════════════════════════════════════════════════════════════
 * ADD BUTTON COMPONENT (Reusable)
 * ══════════════════════════════════════════════════════════════
 *
 * Shows "Add" when item is not in cart, or a quantity counter
 * (- count +) when it is. Used in FoodCard, CouponFoodCard, etc.
 *
 * Since it reads from the shared FoodOrderContext, the count
 * stays in sync everywhere the same food item appears.
 */

export default function AddButton({ item }) {
    const { addToFoodCart, updateFoodCartQuantity, getItemQuantity } = useGlobal();

    const quantity = getItemQuantity(item.id);

    const handleAdd = (e) => {
        e.stopPropagation();
        addToFoodCart(item);
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        updateFoodCartQuantity(item.id, quantity + 1);
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
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

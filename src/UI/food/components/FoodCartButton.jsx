import { ShoppingBag } from "lucide-react";
import useFoodCartButtonViewModel from "../../../viewModel/foodCartButtonViewModel";

export default function FoodCartButton() {
    const { itemCount, total, handleOpenCart } = useFoodCartButtonViewModel();

    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-[#2B2B2B] px-5 py-4">
            <button
                onClick={handleOpenCart}
                className="w-full h-[56px] rounded-[20px] bg-yellow-400 text-black flex items-center justify-between px-5 font-semibold active:scale-[0.98] transition"
            >
                <span className="flex items-center gap-2 text-[16px]">
                    <ShoppingBag size={20} />
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-[18px]">
                    Go to cart - ₹ {Math.round(total)}
                </span>
            </button>
        </div>
    );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useGlobal from "../hooks/FoodOrder";

export default function useCartViewModel() {
    const navigate = useNavigate();
    const {
        foodCart,
        getCartUnitPrice,
        getFoodCartTotal,
        updateFoodCartQuantity,
        removeFromFoodCart,
    } = useGlobal();

    const total = getFoodCartTotal();
    const itemCount = foodCart.reduce((count, item) => count + item.quantity, 0);

    const items = useMemo(() => foodCart.map((item) => ({
        ...item,
        unitPrice: getCartUnitPrice(item),
        lineTotal: getCartUnitPrice(item) * item.quantity,
        addOnLabel: (item.selectedAddOns || [])
            .map((addOn) => addOn.name || addOn.title)
            .filter(Boolean)
            .join(', '),
    })), [foodCart, getCartUnitPrice]);

    const handleBack = () => navigate(-1);
    const handleBrowseFood = () => navigate('/food');
    const handleIncrement = (item) => updateFoodCartQuantity(item.id, item.quantity + 1);
    const handleDecrement = (item) => updateFoodCartQuantity(item.id, item.quantity - 1);
    const handleRemove = (item) => removeFromFoodCart(item.id);

    return {
        items,
        total,
        itemCount,
        handleBack,
        handleBrowseFood,
        handleIncrement,
        handleDecrement,
        handleRemove,
    };
}

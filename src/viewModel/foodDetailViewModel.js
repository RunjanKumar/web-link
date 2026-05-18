import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobal from "../hooks/FoodOrder";

export default function useFoodDetailViewModel() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const {
        addToFoodCart,
        updateFoodCartItem,
        updateFoodCartQuantity,
        getItemQuantity,
    } = useGlobal();
    const [selectedAddOns, setSelectedAddOns] = useState(new Set());

    const quantity = getItemQuantity(state?.id);
    const isAvailable = state?.isAvailable !== false;
    const itemPrice = state?.priceAfterDiscount ?? state?.price ?? 0;
    const ingredients = state?.inGridients || [];
    const addOns = (state?.choiceOfAddOnDetails || []).filter(
        (addOn) => typeof addOn === 'object' && addOn !== null
    );

    const selectedAddOnItems = useMemo(() => (
        addOns.filter((addOn) => selectedAddOns.has(addOn._id || addOn.id))
    ), [addOns, selectedAddOns]);

    const addOnTotal = selectedAddOnItems.reduce(
        (sum, addOn) => sum + (addOn.price || 0),
        0
    );
    const cartUnitPrice = itemPrice + addOnTotal;
    const totalPrice = cartUnitPrice * (quantity || 1);

    const cartItem = useMemo(() => ({
        ...state,
        cartUnitPrice,
        selectedAddOns: selectedAddOnItems,
        addOnTotal,
    }), [state, cartUnitPrice, selectedAddOnItems, addOnTotal]);

    const handleBack = () => navigate(-1);

    const handleAdd = () => {
        if (!isAvailable) return;
        addToFoodCart(cartItem);
    };

    const handleIncrement = () => {
        if (quantity === 0) {
            handleAdd();
            return;
        }
        updateFoodCartItem(state?.id, cartItem);
        updateFoodCartQuantity(state?.id, quantity + 1);
    };

    const handleDecrement = () => {
        updateFoodCartQuantity(state?.id, quantity - 1);
    };

    const handleAddItemsClick = () => {
        if (!isAvailable) return;

        if (quantity === 0) {
            addToFoodCart(cartItem);
        } else {
            updateFoodCartItem(state?.id, cartItem);
        }

        navigate('/cart');
    };

    const toggleAddOn = (addOnId) => {
        setSelectedAddOns((prev) => {
            const next = new Set(prev);
            if (next.has(addOnId)) {
                next.delete(addOnId);
            } else {
                next.add(addOnId);
            }
            return next;
        });
    };

    return {
        state,
        selectedAddOns,
        quantity,
        isAvailable,
        itemPrice,
        totalPrice,
        ingredients,
        addOns,
        handleBack,
        handleAdd,
        handleIncrement,
        handleDecrement,
        handleAddItemsClick,
        toggleAddOn,
    };
}

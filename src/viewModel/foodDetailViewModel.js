import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobal from "../hooks/FoodOrder";

function isFoodAvailable(food) {
    if (!food) return false;
    if (food.isAvailable === false || food.available === false) return false;
    if (food.status === false) return false;
    if (typeof food.status === 'string' && food.status.toLowerCase() === 'unavailable') return false;
    return true;
}

export default function useFoodDetailViewModel() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const {
        addToFoodCart,
        foodCart,
        updateFoodCartItem,
        updateFoodCartQuantity,
        getItemQuantity,
    } = useGlobal();
    const existingCartItem = foodCart.find((item) => item.id === state?.id);
    const [selectedAddOns, setSelectedAddOns] = useState(() => (
        new Set((existingCartItem?.selectedAddOns || []).map((addOn) => addOn._id || addOn.id))
    ));

    const quantity = getItemQuantity(state?.id);
    const isAvailable = isFoodAvailable(state);
    const itemPrice = state?.priceAfterDiscount ?? state?.price ?? 0;
    const ingredients = state?.inGridients || [];
    const addOns = (state?.choiceOfAddOnDetails || []).filter(
        (addOn) => typeof addOn === 'object' && addOn !== null
    );

    const selectedAddOnItems = useMemo(() => (
        addOns
            .filter((addOn) => selectedAddOns.has(addOn._id || addOn.id) && isFoodAvailable(addOn))
            .map((addOn) => {
                const addOnId = addOn._id || addOn.id;
                const existingAddOn = existingCartItem?.selectedAddOns?.find(
                    (item) => (item._id || item.id) === addOnId
                );

                return {
                    ...addOn,
                    quantity: existingAddOn?.quantity || 1,
                };
            })
    ), [addOns, existingCartItem?.selectedAddOns, selectedAddOns]);

    const addOnTotal = selectedAddOnItems.reduce(
        (sum, addOn) => sum + ((addOn.price || 0) * (addOn.quantity || 1)),
        0
    );
    const totalPrice = (itemPrice * (quantity || 1)) + addOnTotal;

    const cartItem = useMemo(() => ({
        ...state,
        cartUnitPrice: itemPrice,
        selectedAddOns: selectedAddOnItems,
        addOnTotal,
    }), [state, itemPrice, selectedAddOnItems, addOnTotal]);

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

    const toggleAddOn = (addOn) => {
        if (!isFoodAvailable(addOn)) return;
        const addOnId = addOn._id || addOn.id;

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

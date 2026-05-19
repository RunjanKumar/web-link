import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobal from "../hooks/FoodOrder";
import { getEffectivePrice } from "../utils/discountHelper";
import { DISCOUNT_TYPES } from "../utils/constant";

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
        updateFoodCartQuantity,
        removeFromFoodCart,
        getItemQuantity,
    } = useGlobal();

    const quantity = getItemQuantity(state?.id);
    const isAvailable = isFoodAvailable(state);
    const isBogo = state?.couponData?.discountType === DISCOUNT_TYPES.BOGO;

    const itemPrice = getEffectivePrice({
        price: state?.price ?? 0,
        priceAfterDiscount: state?.priceAfterDiscount,
        couponData: state?.couponData,
    });

    const ingredients = state?.inGridients || [];

    // Add-ons from the food item's choiceOfAddOnDetails
    const addOns = useMemo(() => (
        (state?.choiceOfAddOnDetails || []).filter(
            (addOn) => typeof addOn === 'object' && addOn !== null
        )
    ), [state?.choiceOfAddOnDetails]);

    // For each add-on, check its quantity in the cart (independent items)
    const addOnQuantities = useMemo(() => {
        const map = {};
        addOns.forEach((addOn) => {
            const addOnId = addOn._id || addOn.id;
            map[addOnId] = getItemQuantity(addOnId);
        });
        return map;
    }, [addOns, getItemQuantity]);

    // Total price = main food + all add-ons in cart for this food
    const addOnTotal = useMemo(() => (
        addOns.reduce((sum, addOn) => {
            const addOnId = addOn._id || addOn.id;
            const qty = addOnQuantities[addOnId] || 0;
            return sum + ((addOn.price || 0) * qty);
        }, 0)
    ), [addOns, addOnQuantities]);

    const totalPrice = (itemPrice * (quantity || 1)) + addOnTotal;

    const handleBack = () => navigate(-1);

    // ── MAIN FOOD: Add / Increment / Decrement ──

    const handleAdd = () => {
        if (!isAvailable) return;
        addToFoodCart({ ...state, cartUnitPrice: itemPrice });
    };

    const handleIncrement = () => {
        if (quantity === 0) {
            handleAdd();
            return;
        }
        const step = isBogo ? 2 : 1;
        updateFoodCartQuantity(state?.id, quantity + step);
    };

    const handleDecrement = () => {
        updateFoodCartQuantity(state?.id, quantity - 1);
    };

    const handleAddItemsClick = () => {
        if (!isAvailable) return;
        if (quantity === 0) {
            addToFoodCart({ ...state, cartUnitPrice: itemPrice });
        }
        navigate('/cart');
    };

    // ── ADD-ON: Toggle / Increment / Decrement (independent cart items) ──

    const handleAddOnAdd = (addOn) => {
        if (!isFoodAvailable(addOn)) return;
        const addOnId = addOn._id || addOn.id;
        const addOnItem = {
            id: addOnId,
            title: addOn.name || addOn.title,
            price: addOn.price || 0,
            priceAfterDiscount: addOn.priceAfterDiscount,
            couponData: addOn.couponData,
            imageURL: addOn.imageURL || addOn.image,
            type: addOn.type,
            isAvailable: true,
            isAddOn: true,
            parentFoodTitle: state?.title,
        };
        addToFoodCart(addOnItem);
    };

    const handleAddOnIncrement = (addOn) => {
        const addOnId = addOn._id || addOn.id;
        const qty = addOnQuantities[addOnId] || 0;
        const addOnIsBogo = addOn.couponData?.discountType === DISCOUNT_TYPES.BOGO;
        const step = addOnIsBogo ? 2 : 1;
        updateFoodCartQuantity(addOnId, qty + step);
    };

    const handleAddOnDecrement = (addOn) => {
        const addOnId = addOn._id || addOn.id;
        const qty = addOnQuantities[addOnId] || 0;
        updateFoodCartQuantity(addOnId, qty - 1);
    };

    return {
        state,
        quantity,
        isAvailable,
        isBogo,
        itemPrice,
        totalPrice,
        ingredients,
        addOns,
        addOnQuantities,
        handleBack,
        handleAdd,
        handleIncrement,
        handleDecrement,
        handleAddItemsClick,
        handleAddOnAdd,
        handleAddOnIncrement,
        handleAddOnDecrement,
    };
}

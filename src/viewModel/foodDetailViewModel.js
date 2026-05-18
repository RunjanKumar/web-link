import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobal from "../hooks/FoodOrder";

export default function useFoodDetailViewModel() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { addToFoodCart, updateFoodCartQuantity, getItemQuantity } = useGlobal();
    const [selectedAddOns, setSelectedAddOns] = useState(new Set());

    console.log('â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log('â•‘ [FoodDetails] PAGE OPENED                           â•‘');
    console.log('â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£');
    console.log('â•‘ API: NONE (data from navigation state)              â•‘');
    console.log('â•‘ Source: FoodCard â†’ navigate("/food-details", state)  â•‘');
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
    console.log('[FoodDetails] Full state object:', state);
    console.log('[FoodDetails] Field-by-field breakdown:');
    console.log('  id:', state?.id);
    console.log('  title:', state?.title);
    console.log('  price:', state?.price, 'â† used for display');
    console.log('  priceAfterDiscount:', state?.priceAfterDiscount, 'â† only set from coupon flow');
    console.log('  calories:', state?.calories, 'â† mapped from backend kcal field');
    console.log('  type:', state?.type, '(1=veg ðŸŸ¢, 2=nonveg ðŸ”´)');
    console.log('  description:', state?.description);
    console.log('  imageURL:', state?.imageURL);
    console.log('  isAvailable:', state?.isAvailable);
    console.log('  inGridients:', state?.inGridients, 'â† array of strings');
    console.log('  choiceOfAddOn:', state?.choiceOfAddOnDetails);

    if (state?.choiceOfAddOn?.length > 0) {
        const first = state.choiceOfAddOn[0];
        console.log('  â˜… choiceOfAddOn[0] type:', typeof first);
        if (typeof first === 'string') {
            console.log('  âš ï¸ ADD-ONS ARE ObjectID STRINGS â€” backend needs .populate("choiceOfAddOn")');
            console.log('  The food category API returns IDs only, not full objects.');
        } else if (typeof first === 'object') {
            console.log('  âœ… ADD-ONS ARE POPULATED OBJECTS with fields:', Object.keys(first));
        }
    } else {
        console.log('  â„¹ï¸ No choiceOfAddOn items for this food');
    }

    const quantity = getItemQuantity(state?.id);
    const isAvailable = state?.isAvailable !== false;

    const handleBack = () => navigate(-1);

    const handleAdd = () => {
        if (!isAvailable) return;
        console.log('[FoodDetails] Adding to cart:', state?.title);
        addToFoodCart(state);
    };

    const handleIncrement = () => {
        console.log('[FoodDetails] Increment:', state?.title, 'â†’', quantity + 1);
        updateFoodCartQuantity(state?.id, quantity + 1);
    };

    const handleDecrement = () => {
        console.log('[FoodDetails] Decrement:', state?.title, 'â†’', quantity - 1);
        updateFoodCartQuantity(state?.id, quantity - 1);
    };

    const toggleAddOn = (addOnId) => {
        console.log('[FoodDetails] Toggle add-on:', addOnId);
        setSelectedAddOns((prev) => {
            const next = new Set(prev);
            if (next.has(addOnId)) {
                next.delete(addOnId);
            } else {
                next.add(addOnId);
            }
            console.log('[FoodDetails] Selected add-ons:', [...next]);
            return next;
        });
    };

    const itemPrice = state?.priceAfterDiscount ?? state?.price ?? 0;
    const addOnTotal = useMemo(() => (
        (state?.choiceOfAddOn || [])
            .filter((addOn) => selectedAddOns.has(addOn._id || addOn.id))
            .reduce((sum, addOn) => sum + (addOn.price || 0), 0)
    ), [state?.choiceOfAddOn, selectedAddOns]);
    const totalPrice = (itemPrice + addOnTotal) * (quantity || 1);
    const ingredients = state?.inGridients || [];
    const addOns = (state?.choiceOfAddOnDetails || []).filter(
        (addOn) => typeof addOn === 'object' && addOn !== null
    );

    console.log('[FoodDetails] Price calculation:');
    console.log('  itemPrice:', itemPrice, '| addOnTotal:', addOnTotal, '| totalPrice:', totalPrice);
    console.log(state?.choiceOfAddOn, "addOns", addOns);
    console.log('[FoodDetails] Renderable ingredients:', ingredients.length);
    console.log('[FoodDetails] Renderable add-ons (populated objects only):', addOns.length);

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
        toggleAddOn,
    };
}

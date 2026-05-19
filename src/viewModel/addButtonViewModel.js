import useGlobal from '../hooks/FoodOrder';
import { DISCOUNT_TYPES } from '../utils/constant';

export default function useAddButtonViewModel(item) {
    const { addToFoodCart, updateFoodCartQuantity, getItemQuantity } = useGlobal();
    const quantity = getItemQuantity(item.id);
    const isBogo = item.couponData?.discountType === DISCOUNT_TYPES.BOGO;

    const handleAdd = (event) => {
        event.stopPropagation();
        addToFoodCart(item);
    };

    // BOGO: increment by 2 (buy 1 get 1 pair)
    const handleIncrement = (event) => {
        event.stopPropagation();
        const step = isBogo ? 2 : 1;
        updateFoodCartQuantity(item.id, quantity + step);
    };

    // BOGO: decrement by 1 (user can fine-tune)
    const handleDecrement = (event) => {
        event.stopPropagation();
        console.log('[AddButton] Decrementing:', item.title, '→', quantity - 1);
        if (quantity - 1 === 0) console.log('[AddButton] Quantity will be 0 → removing from cart');
        updateFoodCartQuantity(item.id, quantity - 1);
    };

    return {
        quantity,
        handleAdd,
        handleIncrement,
        handleDecrement,
    };
}

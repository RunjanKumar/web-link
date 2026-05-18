import useGlobal from '../hooks/FoodOrder';

export default function useAddButtonViewModel(item) {
    const { addToFoodCart, updateFoodCartQuantity, getItemQuantity } = useGlobal();
    const quantity = getItemQuantity(item.id);

    const handleAdd = (event) => {
        event.stopPropagation();
        console.log('[AddButton] Adding to cart:', item.title, '(id:', item.id, ')');
        addToFoodCart(item);
    };

    const handleIncrement = (event) => {
        event.stopPropagation();
        console.log('[AddButton] Incrementing:', item.title, 'â†’', quantity + 1);
        updateFoodCartQuantity(item.id, quantity + 1);
    };

    const handleDecrement = (event) => {
        event.stopPropagation();
        console.log('[AddButton] Decrementing:', item.title, 'â†’', quantity - 1);
        if (quantity - 1 === 0) console.log('[AddButton] Quantity will be 0 â†’ removing from cart');
        updateFoodCartQuantity(item.id, quantity - 1);
    };

    return {
        quantity,
        handleAdd,
        handleIncrement,
        handleDecrement,
    };
}

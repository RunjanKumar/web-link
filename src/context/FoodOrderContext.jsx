import { useState, useCallback } from 'react';
import { FoodOrderContext } from './FoodOrderDef';
import { getEffectivePrice, getLineTotal } from '../utils/discountHelper';
import { DISCOUNT_TYPES } from '../utils/constant';

function isFoodAvailable(food) {
    if (!food) return false;
    if (food.isAvailable === false || food.available === false) return false;
    if (food.status === false) return false;
    if (typeof food.status === 'string' && food.status.toLowerCase() === 'unavailable') return false;
    return true;
}

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD ORDER CONTEXT (Global Cart State)
 * ══════════════════════════════════════════════════════════════
 *
 * CART DATA STRUCTURE:
 *   foodCart = [
 *     { id: "food1", title: "Biryani", price: 349, quantity: 2, ... },
 *     { id: "addon1", title: "Aalu Paratha", price: 100, quantity: 1, isAddOn: true, ... },
 *   ]
 *
 * Add-ons are independent cart items (isAddOn: true).
 * BOGO items start at quantity 2, increment by 2, decrement by 1.
 */

export function FoodOrderProvider({ children }) {
    const [foodCart, setFoodCart] = useState([]);

    const isBogo = useCallback((item) => (
        item?.couponData?.discountType === DISCOUNT_TYPES.BOGO
    ), []);

    const getCartUnitPrice = useCallback((item) => (
        item.cartUnitPrice ?? getEffectivePrice({
            price: item.price ?? 0,
            priceAfterDiscount: item.priceAfterDiscount,
            couponData: item.couponData,
        })
    ), []);

    const getFoodItemTotal = useCallback((item) => {
        const unitPrice = getEffectivePrice({
            price: item.price ?? 0,
            priceAfterDiscount: item.priceAfterDiscount,
            couponData: item.couponData,
        });
        return getLineTotal({ unitPrice, quantity: item.quantity, couponData: item.couponData });
    }, []);

    // ── ADD TO CART ──
    // BOGO items start at quantity 2, others at 1
    // If item already exists → increment by 2 for BOGO, 1 for others
    const addToFoodCart = useCallback((item) => {
        console.log('[Cart] ADD:', item.title, '(id:', item.id, ')');
        const bogoItem = item?.couponData?.discountType === DISCOUNT_TYPES.BOGO;
        const step = bogoItem ? 2 : 1;

        setFoodCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                console.log('[Cart] Item exists, incrementing quantity:', existingItem.quantity, '→', existingItem.quantity + step);
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, ...item, quantity: cartItem.quantity + step }
                        : cartItem
                );
            }
            console.log('[Cart] New item, adding with quantity:', step);
            return [...prevCart, { ...item, quantity: step }];
        });
    }, []);

    const updateFoodCartItem = useCallback((itemId, itemUpdates) => {
        console.log('[Cart] UPDATE item details:', itemId);
        setFoodCart((prevCart) =>
            prevCart.map((item) =>
                item.id === itemId ? { ...item, ...itemUpdates } : item
            )
        );
    }, []);

    // ── REMOVE FROM CART ──
    const removeFromFoodCart = useCallback((itemId) => {
        console.log('[Cart] REMOVE item:', itemId);
        setFoodCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    }, []);

    // ── UPDATE QUANTITY ──
    // If quantity ≤ 0 → remove the item entirely
    const updateFoodCartQuantity = useCallback((itemId, quantity) => {
        if (quantity <= 0) {
            console.log('[Cart] UPDATE quantity to', quantity, '→ removing item:', itemId);
            removeFromFoodCart(itemId);
        } else {
            console.log('[Cart] UPDATE quantity:', itemId, '→', quantity);
            setFoodCart((prevCart) =>
                prevCart.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        }
    }, [removeFromFoodCart]);

    // ── CLEAR CART ──
    const clearFoodCart = useCallback(() => {
        console.log('[Cart] CLEAR all items');
        setFoodCart([]);
    }, []);

    // ── GET TOTAL PRICE ──
    const getFoodCartTotal = useCallback(() => {
        const total = foodCart.reduce((total, item) => total + getFoodItemTotal(item), 0);
        console.log('[Cart] Total price:', total);
        return total;
    }, [foodCart, getFoodItemTotal]);

    // ── GET TOTAL ITEMS COUNT ──
    const getFoodCartCount = useCallback(() => {
        return foodCart.reduce((count, item) => count + item.quantity, 0);
    }, [foodCart]);

    // ── GET QUANTITY OF SPECIFIC ITEM ──
    const getItemQuantity = useCallback((itemId) => {
        const cartItem = foodCart.find((item) => item.id === itemId);
        return cartItem ? cartItem.quantity : 0;
    }, [foodCart]);

    const value = {
        foodCart,
        addToFoodCart,
        removeFromFoodCart,
        updateFoodCartQuantity,
        updateFoodCartItem,
        clearFoodCart,
        getFoodCartTotal,
        getFoodCartCount,
        getCartUnitPrice,
        getFoodItemTotal,
        getItemQuantity,
        isBogo,
    };

    return (
        <FoodOrderContext.Provider value={value}>
            {children}
        </FoodOrderContext.Provider>
    );
}

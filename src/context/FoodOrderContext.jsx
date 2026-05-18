import { useState, useCallback } from 'react';
import { FoodOrderContext } from './FoodOrderDef';

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
 * LEARNING: This is a React Context Provider that wraps the ENTIRE app.
 * It provides a shared "food cart" state that ANY component can access
 * via the useGlobal() hook (defined in hooks/FoodOrder.js).
 *
 * ARCHITECTURE:
 *   main.jsx
 *   └── FoodOrderProvider ← wraps everything (defined here)
 *       └── App, Food, FoodDetails, CouponDetail, etc.
 *           └── Any component can call useGlobal() to access cart
 *
 * CART DATA STRUCTURE:
 *   foodCart = [
 *     { id: "food1", title: "Biryani", price: 349, quantity: 2, ... },
 *     { id: "food2", title: "Pasta", price: 250, quantity: 1, ... },
 *   ]
 *
 * WHY CONTEXT? Because cart state needs to be shared across:
 *   - FoodCard (main food list)
 *   - CouponFoodCard (coupon detail page)
 *   - FoodDetails page (detail page bottom bar)
 *   - Future: Cart page, Checkout page, etc.
 */

export function FoodOrderProvider({ children }) {
    // Food Cart State — array of items with quantities
    const [foodCart, setFoodCart] = useState([]);

    const getCartUnitPrice = useCallback((item) => (
        item.cartUnitPrice ?? item.priceAfterDiscount ?? item.price ?? 0
    ), []);

    const getFoodItemTotal = useCallback((item) => {
        const basePrice = item.priceAfterDiscount ?? item.price ?? 0;
        const baseTotal = basePrice * item.quantity;
        const addOnTotal = (item.selectedAddOns || []).reduce(
            (total, addOn) => (
                isFoodAvailable(addOn)
                    ? total + ((addOn.price || 0) * (addOn.quantity || 1))
                    : total
            ),
            0
        );

        return baseTotal + addOnTotal;
    }, []);

    // ── ADD TO CART ──
    // If item already exists → increment quantity
    // If new item → add with quantity 1
    const addToFoodCart = useCallback((item) => {
        console.log('[Cart] ADD:', item.title, '(id:', item.id, ')');
        setFoodCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                console.log('[Cart] Item exists, incrementing quantity:', existingItem.quantity, '→', existingItem.quantity + 1);
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, ...item, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            console.log('[Cart] New item, adding with quantity: 1');
            return [...prevCart, { ...item, quantity: 1 }];
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
    // LEARNING: This is what makes AddButton work everywhere.
    // AddButton calls getItemQuantity(item.id) and shows the count.
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
    };

    return (
        <FoodOrderContext.Provider value={value}>
            {children}
        </FoodOrderContext.Provider>
    );
}

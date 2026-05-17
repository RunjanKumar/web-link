import { createContext, useState, useCallback } from 'react';

export const GlobalContext = createContext(null);

export function GlobalProvider({ children }) {
    // Food Cart State
    const [foodCart, setFoodCart] = useState([]);

    // Add item to cart
    const addToFoodCart = useCallback((item) => {
        setFoodCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    }, []);

    // Remove item from cart
    const removeFromFoodCart = useCallback((itemId) => {
        setFoodCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    }, []);

    // Update item quantity
    const updateFoodCartQuantity = useCallback((itemId, quantity) => {
        if (quantity <= 0) {
            removeFromFoodCart(itemId);
        } else {
            setFoodCart((prevCart) =>
                prevCart.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        }
    }, [removeFromFoodCart]);

    // Clear entire cart
    const clearFoodCart = useCallback(() => {
        setFoodCart([]);
    }, []);

    // Get cart total
    const getFoodCartTotal = useCallback(() => {
        return foodCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [foodCart]);

    // Get cart count
    const getFoodCartCount = useCallback(() => {
        return foodCart.reduce((count, item) => count + item.quantity, 0);
    }, [foodCart]);

    const value = {
        foodCart,
        addToFoodCart,
        removeFromFoodCart,
        updateFoodCartQuantity,
        clearFoodCart,
        getFoodCartTotal,
        getFoodCartCount,
    };

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
}

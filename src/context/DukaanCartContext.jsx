import { useState, useCallback, useEffect, useMemo } from 'react';
import { DukaanCartContext } from './DukaanCartDef';

const STORAGE_KEY = 'dukaan_cart';

/**
 * ══════════════════════════════════════════════════════════════
 * DUKAAN CART CONTEXT (Global shop-basket state)
 * ══════════════════════════════════════════════════════════════
 *
 * CART SHAPE:
 *   items = [{ productId, name, price, imageUrl, unit, stockQty, taxPercentage, qty }]
 *
 * Each line SNAPSHOTS what the guest saw when they added it, so the cart still
 * renders if a product is later hidden. The prices here are for DISPLAY ONLY —
 * checkout sends nothing but productId + qty and the server recomputes the bill
 * from the live catalogue, which is what the guest is actually charged.
 *
 * WHY PERSISTED (unlike the food cart, which is in-memory): a shop basket is
 * built over time — a guest adds shampoo, wanders off, comes back. Losing it on
 * a refresh is the difference between a sale and an abandoned cart.
 *
 * `stockQty` is a snapshot too, so it is a courtesy cap only — the server's
 * guarded decrement is what actually prevents overselling.
 */
export function DukaanCartProvider({ children }) {
    const [items, setItems] = useState(() => {
        // Read synchronously on mount so the first paint already has the cart —
        // a badge that flashes 0 and then fills in looks broken.
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // A full or blocked localStorage must never break checkout — the cart
            // simply stops surviving refreshes.
        }
    }, [items]);

    const addToCart = useCallback((product, qty = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.productId === product._id);
            const cap = Number(product.stockQty) || 0;

            if (existing) {
                return prev.map((i) =>
                    i.productId === product._id
                        ? { ...i, qty: Math.min(i.qty + qty, cap) }
                        : i,
                );
            }
            return [
                ...prev,
                {
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    mrp: product.mrp,
                    imageUrl: product.images?.[0],
                    unit: product.unit,
                    stockQty: cap,
                    taxPercentage: product.taxPercentage,
                    qty: Math.min(qty, cap),
                },
            ];
        });
    }, []);

    const setQty = useCallback((productId, qty) => {
        setItems((prev) =>
            prev
                .map((i) =>
                    i.productId === productId
                        ? { ...i, qty: Math.max(0, Math.min(qty, i.stockQty)) }
                        : i,
                )
                // A line dragged to zero is a removal, not an empty row.
                .filter((i) => i.qty > 0),
        );
    }, []);

    const removeFromCart = useCallback((productId) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const getQty = useCallback(
        (productId) => items.find((i) => i.productId === productId)?.qty || 0,
        [items],
    );

    /**
     * Display estimate. Tax is per line; a null rate means "inherit the hotel
     * rate", which the guest app does not know — treated as 0 so the estimate
     * never OVERSTATES what they will pay.
     */
    const totals = useMemo(() => {
        const subTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const taxAmount = items.reduce(
            (s, i) => s + (i.price * i.qty * (i.taxPercentage ?? 0)) / 100,
            0,
        );
        return {
            count: items.reduce((s, i) => s + i.qty, 0),
            subTotal: Math.round(subTotal * 100) / 100,
            taxAmount: Math.round(taxAmount * 100) / 100,
            grandTotal: Math.round((subTotal + taxAmount) * 100) / 100,
            taxIsEstimate: items.some((i) => i.taxPercentage === null || i.taxPercentage === undefined),
        };
    }, [items]);

    const value = useMemo(
        () => ({ items, addToCart, setQty, removeFromCart, clearCart, getQty, totals }),
        [items, addToCart, setQty, removeFromCart, clearCart, getQty, totals],
    );

    return (
        <DukaanCartContext.Provider value={value}>
            {children}
        </DukaanCartContext.Provider>
    );
}

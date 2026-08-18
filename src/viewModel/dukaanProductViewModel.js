import { useState, useEffect, useCallback } from 'react';
import { getApiErrorMessage } from '../api/client';
import { getDukaanProduct } from '../api/service/dukaanService';
import useAuth from '../hooks/useAuth';

/**
 * ══════════════════════════════════════════════════════════════
 * DUKAAN PRODUCT DETAIL VIEW MODEL
 * ══════════════════════════════════════════════════════════════
 * One product plus its "you may also like" list, and the local quantity picker
 * state for the Add-to-cart button.
 */
export function useDukaanProductViewModel(productId) {
    const { hotelId } = useAuth();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [activeImage, setActiveImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async () => {
        if (!hotelId || !productId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await getDukaanProduct(productId, hotelId);
            setProduct(res?.data?.product || null);
            setRelated(res?.data?.related || []);
            // A fresh product means a fresh gallery and a fresh quantity.
            setActiveImage(0);
            setQty(1);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Could not load this product.'));
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [hotelId, productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const maxQty = Math.max(0, Number(product?.stockQty) || 0);
    const increment = () => setQty((q) => Math.min(q + 1, maxQty));
    const decrement = () => setQty((q) => Math.max(1, q - 1));

    return {
        product,
        related,
        loading,
        error,
        activeImage,
        setActiveImage,
        qty,
        increment,
        decrement,
        maxQty,
        isOutOfStock: maxQty <= 0,
        retry: fetchProduct,
    };
}

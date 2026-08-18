import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../api/client';
import {
    getMyDukaanOrders,
    cancelDukaanOrder,
    initiateDukaanPayment,
    verifyDukaanPayment,
    reviewDukaanProduct,
} from '../api/service/dukaanService';
import { openRazorpayCheckout } from '../utils/razorpay';
import useAuth from '../hooks/useAuth';
import useDukaanCart from '../hooks/DukaanCart';
import useCustomerProfile from '../hooks/CustomerProfile';
import { DUKAAN_GUEST_CANCELLABLE } from '../utils/constant';

/**
 * ══════════════════════════════════════════════════════════════
 * DUKAAN MY-ORDERS VIEW MODEL
 * ══════════════════════════════════════════════════════════════
 * The guest's order list plus everything they can do from it: cancel (while the
 * shop has not accepted it), pay for an unpaid order, reorder, and rate a
 * delivered product.
 */
export function useDukaanOrdersViewModel() {
    const { hotelId } = useAuth();
    const { addToCart } = useDukaanCart();
    const { customerData, hotelData } = useCustomerProfile();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [reviewFor, setReviewFor] = useState(null); // { order, item }

    const fetchOrders = useCallback(async () => {
        if (!hotelId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await getMyDukaanOrders(hotelId);
            setOrders(res?.data?.orders || []);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Could not load your orders.'));
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const canCancel = useCallback(
        (order) => DUKAAN_GUEST_CANCELLABLE.includes(order.status),
        [],
    );

    /** Unpaid and still open — the only case where "Pay now" makes sense. */
    const canPay = useCallback(
        (order) =>
            order.paymentStatus === 'PENDING' &&
            order.status !== 'CANCELLED' &&
            order.paymentMode !== 'ROOM_CHARGE',
        [],
    );

    const cancel = useCallback(
        async (order, reason) => {
            setBusyId(order._id);
            try {
                await cancelDukaanOrder(order._id, hotelId, reason);
                toast.success('Order cancelled.');
                await fetchOrders();
            } catch (err) {
                toast.error(getApiErrorMessage(err, 'Could not cancel this order.'));
            } finally {
                setBusyId(null);
            }
        },
        [hotelId, fetchOrders],
    );

    const payNow = useCallback(
        async (order) => {
            setBusyId(order._id);
            try {
                const payRes = await initiateDukaanPayment(order._id, hotelId);
                await openRazorpayCheckout({
                    paymentData: payRes?.data,
                    name: hotelData?.name || hotelData?.hotelName || 'Hotel Shop',
                    description: `Order ${order.orderNumber}`,
                    customer: customerData,
                    onVerify: (sig) => verifyDukaanPayment(order._id, { hotelId, ...sig }),
                });
                await fetchOrders();
            } catch (err) {
                toast.error(getApiErrorMessage(err, 'Could not start the payment.'));
            } finally {
                setBusyId(null);
            }
        },
        [hotelId, fetchOrders, hotelData, customerData],
    );

    /**
     * Reorder: push every line back into the cart.
     * Prices come from the ORDER snapshot, which may be stale — that is fine,
     * because the cart is display-only and checkout re-prices from the catalogue.
     * Stock is unknown here, so each line is capped generously and the server's
     * guard is what ultimately decides.
     */
    const reorder = useCallback(
        (order) => {
            (order.items || []).forEach((item) => {
                addToCart(
                    {
                        _id: item.productId,
                        name: item.name,
                        price: item.unitPrice,
                        images: item.imageUrl ? [item.imageUrl] : [],
                        stockQty: item.qty,
                        taxPercentage: item.taxPercentage,
                    },
                    item.qty,
                );
            });
            toast.success('Added to your basket.');
        },
        [addToCart],
    );

    const submitReview = useCallback(
        async (order, productId, rating, review) => {
            setBusyId(order._id);
            try {
                await reviewDukaanProduct(order._id, {
                    hotelId,
                    productId,
                    rating,
                    review: review || undefined,
                });
                toast.success('Thanks for your review.');
                setReviewFor(null);
            } catch (err) {
                toast.error(getApiErrorMessage(err, 'Could not save your review.'));
            } finally {
                setBusyId(null);
            }
        },
        [hotelId],
    );

    return {
        orders,
        loading,
        error,
        busyId,
        expandedId,
        setExpandedId,
        reviewFor,
        setReviewFor,
        canCancel,
        canPay,
        cancel,
        payNow,
        reorder,
        submitReview,
        retry: fetchOrders,
    };
}

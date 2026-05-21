import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/client";
import { getFoodOrders, initiatePayment, verifyPayment } from "../api/service/foodService";
import useCustomerProfile from "../hooks/CustomerProfile";
import { TRANSACTION_STATUS, BOOKING_STATUS } from "../utils/constant";

/**
 * ══════════════════════════════════════════════════════════════
 * ORDER HISTORY VIEWMODEL (v2 — Swiggy/Zomato-grade)
 * ══════════════════════════════════════════════════════════════
 *
 * Payment retry rules (mirrors Swiggy/Zomato):
 *   - Show "Pay Online" when paymentStatus is PENDING (1) or FAILED (3)
 *   - ONLY if order status is active (PENDING or IN_PROGRESS)
 *   - Never show pay button for COMPLETED or CANCELLED orders
 *   - Always refresh list after any payment attempt (success or failure)
 *
 * Auto-refresh:
 *   - Polls every 30s while there are active orders (Pending/In-Progress)
 *   - Stops polling when all orders are Completed/Cancelled or page unmounts
 */

export default function useOrderHistoryViewModel() {
    const navigate = useNavigate();
    const { customerData, hotelData, roomNumber } = useCustomerProfile();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [payingOrderId, setPayingOrderId] = useState(null);
    const pollRef = useRef(null);

    // ── Fetch orders ──
    const fetchOrders = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            else setIsRefreshing(true);
            setError(null);
            const res = await getFoodOrders();
            const data = res?.data || res;
            setOrders(data?.food || []);
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Failed to load orders.');
            if (!silent) setError(msg);
            console.error('[OrderHistory] Fetch failed:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Auto-refresh every 30s if there are active (non-completed) orders
    useEffect(() => {
        const hasActiveOrders = orders.some(
            (o) => o.status === BOOKING_STATUS.PENDING || o.status === BOOKING_STATUS.IN_PROGRESS
        );

        if (hasActiveOrders && !payingOrderId) {
            pollRef.current = setInterval(() => fetchOrders(true), 30000);
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [orders, payingOrderId, fetchOrders]);

    // Manual refresh
    const handleRefresh = useCallback(() => {
        fetchOrders(true);
    }, [fetchOrders]);

    /**
     * Can this order be paid online?
     * - Payment must NOT already be successful
     * - Order must be active (not completed/cancelled)
     */
    const canPayOnline = useCallback((order) => {
        const paymentNotDone = order.paymentStatus === TRANSACTION_STATUS.PENDING
            || order.paymentStatus === TRANSACTION_STATUS.FAILED;
        const orderActive = order.status === BOOKING_STATUS.PENDING
            || order.status === BOOKING_STATUS.IN_PROGRESS;
        return paymentNotDone && orderActive;
    }, []);

    // ── Pay Online — works for PENDING and FAILED payments ──
    const handlePayOnline = useCallback(async (order) => {
        if (payingOrderId) return;

        const foodOrderId = order._id;
        setPayingOrderId(foodOrderId);

        try {
            // Step 1: Initiate payment
            const paymentRes = await initiatePayment({ foodOrderId });
            const paymentData = paymentRes?.data || paymentRes;

            if (!paymentData?.razorpayOrderId || !paymentData?.razorpayKey) {
                throw new Error('Failed to initiate payment.');
            }

            // Step 2: Open Razorpay modal
            await new Promise((resolve) => {
                const options = {
                    key: paymentData.razorpayKey,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    order_id: paymentData.razorpayOrderId,
                    name: hotelData?.hotelName || 'Hotel Food Order',
                    description: `Order #${foodOrderId.slice(-6).toUpperCase()}`,
                    prefill: {
                        name: customerData?.name || '',
                        contact: customerData?.phone || customerData?.mobile || '',
                        email: customerData?.email || '',
                    },
                    handler: async function (response) {
                        try {
                            await verifyPayment({
                                foodOrderId,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            });
                            toast.success('Payment successful! 🎉');
                            resolve(true);
                        } catch (err) {
                            const msg = getApiErrorMessage(err, 'Payment verification failed.');
                            toast.error(msg);
                            toast.info(`Order ID: ${foodOrderId}`, { duration: 10000 });
                            resolve(false);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            resolve(false);
                        },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error('Payment failed: ' + (response.error?.description || 'Please try again'));
                });
                rzp.open();
            });

            // Step 3: ALWAYS refresh — whether payment succeeded, failed, or was dismissed
            await fetchOrders(true);

        } catch (err) {
            const msg = getApiErrorMessage(err, 'Failed to initiate payment.');
            toast.error(msg);
        } finally {
            setPayingOrderId(null);
        }
    }, [payingOrderId, customerData, hotelData, fetchOrders]);

    const handleBack = () => navigate(-1);
    const handleOrderFood = () => navigate('/food');

    return {
        orders,
        isLoading,
        isRefreshing,
        error,
        roomNumber,
        payingOrderId,
        canPayOnline,
        handlePayOnline,
        handleRefresh,
        handleBack,
        handleOrderFood,
    };
}

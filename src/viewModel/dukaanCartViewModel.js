import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client';
import {
    createDukaanOrder,
    initiateDukaanPayment,
    verifyDukaanPayment,
    validateDukaanCoupon,
} from '../api/service/dukaanService';
import { openRazorpayCheckout } from '../utils/razorpay';
import useAuth from '../hooks/useAuth';
import useDukaanCart from '../hooks/DukaanCart';
import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * ══════════════════════════════════════════════════════════════
 * DUKAAN CART / CHECKOUT VIEW MODEL
 * ══════════════════════════════════════════════════════════════
 *
 * PLACE-THEN-PAY, deliberately in that order:
 *   1. POST the order — the server takes the stock and returns the REAL total.
 *   2. If the guest chose to pay now, open Razorpay against that order.
 *
 * Doing it this way means an abandoned payment leaves a real, unpaid order the
 * guest can settle later from My Orders (or at the desk), instead of silently
 * losing the basket. It also means the stock is theirs the moment they submit.
 *
 * A failed payment therefore does NOT cancel the order — it just stays unpaid.
 */
export function useDukaanCartViewModel() {
    const navigate = useNavigate();
    const { hotelId } = useAuth();
    const { items, totals, clearCart } = useDukaanCart();
    const { customerData, hotelData, canOrder, orderLockMessage } = useCustomerProfile();

    const [paymentMode, setPaymentMode] = useState('ROOM_CHARGE');
    const [deliverTo, setDeliverTo] = useState('ROOM');
    const [deliveryNote, setDeliveryNote] = useState('');
    const [placing, setPlacing] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    // Offer state. `applied` holds the server's PREVIEW of the discount; the real
    // one is recomputed when the order is placed, so this is display only.
    const [couponInput, setCouponInput] = useState('');
    const [applied, setApplied] = useState(null);
    const [checkingCoupon, setCheckingCoupon] = useState(false);

    const applyCoupon = useCallback(async () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) return;
        setCheckingCoupon(true);
        try {
            const res = await validateDukaanCoupon(
                hotelId,
                code,
                items.map((i) => ({ productId: i.productId, qty: i.qty })),
            );
            setApplied(res?.data || null);
            toast.success(`${code} applied — you save ₹${res?.data?.discount ?? 0}`);
        } catch (err) {
            setApplied(null);
            toast.error(getApiErrorMessage(err, 'That code is not valid.'));
        } finally {
            setCheckingCoupon(false);
        }
    }, [couponInput, hotelId, items]);

    const removeCoupon = useCallback(() => {
        setApplied(null);
        setCouponInput('');
    }, []);

    const discount = applied?.discount || 0;
    // Tax is charged on the discounted value, matching computeOrderTotals' pro-rata
    // split, so this preview lands on the same number the server will bill.
    const payable = Math.max(
        0,
        Math.round((totals.subTotal - discount + totals.taxAmount) * 100) / 100,
    );

    const openCheckout = useCallback(() => {
        // Pre-check-in browse mode: the server would reject the order anyway —
        // tell the guest when ordering unlocks instead of failing later.
        if (!canOrder) {
            toast.info(orderLockMessage);
            return;
        }
        if (!items.length) {
            toast.error('Your basket is empty.');
            return;
        }
        setShowCheckout(true);
    }, [canOrder, orderLockMessage, items.length]);

    const closeCheckout = useCallback(() => setShowCheckout(false), []);

    const placeOrder = useCallback(async () => {
        if (!canOrder) {
            toast.info(orderLockMessage);
            return;
        }
        if (!items.length || placing) return;

        setPlacing(true);
        let order;
        try {
            const res = await createDukaanOrder({
                hotelId,
                // Only ids and quantities — the server prices the basket itself.
                items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
                paymentMode,
                deliverTo,
                deliveryNote: deliveryNote.trim() || undefined,
                // Only the CODE goes up — the server prices the discount itself.
                couponName: applied?.couponName || undefined,
            });
            order = res?.data;
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Could not place your order.'));
            setPlacing(false);
            return;
        }

        // The order exists and owns its stock from here on, so the basket is done
        // regardless of what the payment step does next.
        clearCart();
        setApplied(null);
        setCouponInput('');
        setShowCheckout(false);

        if (paymentMode !== 'ONLINE') {
            toast.success(
                paymentMode === 'ROOM_CHARGE'
                    ? 'Order placed — it will be added to your room bill.'
                    : 'Order placed — pay when it arrives.',
            );
            setPlacing(false);
            navigate('/dukaan/orders');
            return;
        }

        // ── Pay now ──
        try {
            const payRes = await initiateDukaanPayment(order._id, hotelId);
            const paid = await openRazorpayCheckout({
                paymentData: payRes?.data,
                name: hotelData?.name || hotelData?.hotelName || 'Hotel Shop',
                description: `Order ${order.orderNumber}`,
                customer: customerData,
                onVerify: (sig) =>
                    verifyDukaanPayment(order._id, { hotelId, ...sig }),
            });
            if (!paid) {
                // Not an error: the order is real and simply unpaid.
                toast.info('Order placed. You can pay for it from My Orders.');
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Order placed, but payment could not start.'));
        } finally {
            setPlacing(false);
            navigate('/dukaan/orders');
        }
    }, [
        items, placing, hotelId, paymentMode, deliverTo, deliveryNote, applied,
        clearCart, navigate, hotelData, customerData, canOrder, orderLockMessage,
    ]);

    return {
        items,
        totals,
        couponInput,
        setCouponInput,
        applied,
        checkingCoupon,
        applyCoupon,
        removeCoupon,
        discount,
        payable,
        paymentMode,
        setPaymentMode,
        deliverTo,
        setDeliverTo,
        deliveryNote,
        setDeliveryNote,
        placing,
        showCheckout,
        openCheckout,
        closeCheckout,
        placeOrder,
        canOrder,
    };
}

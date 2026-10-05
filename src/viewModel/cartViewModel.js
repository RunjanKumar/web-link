import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/client";
import { validateCoupon } from "../api/service/couponService";
import { createFoodOrder, initiatePayment, verifyPayment } from "../api/service/foodService";
import useCustomerProfile from "../hooks/CustomerProfile";
import useGlobal from "../hooks/FoodOrder";
import { getEffectivePrice, getLineTotal } from "../utils/discountHelper";
import { DISCOUNT_TYPES } from "../utils/constant";

/**
 * ══════════════════════════════════════════════════════════════
 * CART VIEWMODEL — Coupon + Razorpay Payment (v3)
 * ══════════════════════════════════════════════════════════════
 *
 * Flow:
 *   1. User clicks "Place Order"  → bottom sheet opens
 *   2. User picks payment method  → clicks "Confirm & place order"
 *   3. COD  → create order → navigate to /order-history
 *   4. Online → create order → initiate payment → Razorpay modal
 *              → verify → navigate to /order-history
 */

export default function useCartViewModel() {
    const navigate = useNavigate();
    const [isBillExpanded, setIsBillExpanded] = useState(true);
    const [couponCode, setCouponCode] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCouponName, setAppliedCouponName] = useState("");

    // Full backend coupon response (items + summary)
    const [couponResponse, setCouponResponse] = useState(null);

    // ── Order & Payment state ──
    const [showPaymentSheet, setShowPaymentSheet] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("online");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const {
        foodCart,
        getCartUnitPrice,
        getFoodCartTotal,
        updateFoodCartQuantity,
        removeFromFoodCart,
        clearFoodCart,
    } = useGlobal();
    const {
        customerData,
        hotelData,
        roomNumber,
        canOrder,
        orderLockMessage,
    } = useCustomerProfile();

    const itemsTotal = getFoodCartTotal();
    const taxRate = Number(hotelData?.bookedFoodOrderTax || 0);

    // When coupon is applied, use backend summary; otherwise calculate locally
    const summary = couponResponse?.summary;
    const couponDiscount = summary?.totalDiscount || 0;
    const backendFinalAmount = summary?.finalPayableAmount;

    // Discount breakdown for bill display
    const percentageSavings = useMemo(() => {
        if (couponResponse?.items) {
            return couponResponse.items
                .filter((ci) => ci.appliedCouponType === 'PERCENTAGE' && ci.discountAmount > 0)
                .reduce((sum, ci) => sum + ci.discountAmount, 0);
        }
        return foodCart
            .filter((item) => item.couponData?.discountType === DISCOUNT_TYPES.PERCENTAGE
                && item.priceAfterDiscount != null
                && item.priceAfterDiscount < item.price)
            .reduce((sum, item) => sum + (item.price - item.priceAfterDiscount) * item.quantity, 0);
    }, [couponResponse, foodCart]);

    const bogoSavings = useMemo(() => {
        if (couponResponse?.items) {
            return couponResponse.items
                .filter((ci) => ci.appliedCouponType === 'BOGO' && ci.discountAmount > 0)
                .reduce((sum, ci) => sum + ci.discountAmount, 0);
        }
        return foodCart
            .filter((item) => item.couponData?.discountType === DISCOUNT_TYPES.BOGO)
            .reduce((sum, item) => sum + (item.price ?? 0) * Math.floor(item.quantity / 2), 0);
    }, [couponResponse, foodCart]);

    const flatCouponDiscount = summary?.orderCouponDiscount || 0;
    
    const totalSavings = couponResponse
        ? couponDiscount
        : percentageSavings + bogoSavings;

    const subtotalForTax = backendFinalAmount != null
        ? backendFinalAmount
        : itemsTotal;
    const taxAmount = (subtotalForTax * taxRate) / 100;
    const payableAmount = backendFinalAmount != null
        ? backendFinalAmount + taxAmount
        : itemsTotal + (itemsTotal * taxRate) / 100;

    const itemCount = foodCart.reduce((count, item) => count + item.quantity, 0);

    // Build items list — merge backend coupon data when available
    const items = useMemo(() => {
        const couponItemMap = {};
        if (couponResponse?.items) {
            for (const ci of couponResponse.items) {
                couponItemMap[ci.foodId] = ci;
            }
        }

        return foodCart.map((item) => {
            const foodId = item.foodId || item._id || item.id;
            const couponItem = couponItemMap[foodId];

            return {
                ...item,
                unitPrice: getCartUnitPrice(item),
                lineTotal: getCartUnitPrice(item) * item.quantity,
                baseUnitPrice: getEffectivePrice({
                    price: item.price ?? 0,
                    priceAfterDiscount: item.priceAfterDiscount,
                    couponData: item.couponData,
                }),
                baseLineTotal: getLineTotal({
                    unitPrice: getEffectivePrice({
                        price: item.price ?? 0,
                        priceAfterDiscount: item.priceAfterDiscount,
                        couponData: item.couponData,
                    }),
                    quantity: item.quantity,
                    couponData: item.couponData,
                }),
                couponItemData: couponItem || null,
            };
        });
    }, [foodCart, getCartUnitPrice, couponResponse]);

    const handleBack = () => navigate(-1);
    const handleBrowseFood = () => navigate('/food');

    // BOGO: increment by 2, decrement by 1
    const handleIncrement = (item) => {
        const isBogo = item.couponData?.discountType === DISCOUNT_TYPES.BOGO;
        const step = isBogo ? 2 : 1;
        updateFoodCartQuantity(item.id, item.quantity + step);
        if (couponResponse) {
            setCouponResponse(null);
            setAppliedCouponName("");
        }
    };
    const handleDecrement = (item) => {
        updateFoodCartQuantity(item.id, item.quantity - 1);
        if (couponResponse) {
            setCouponResponse(null);
            setAppliedCouponName("");
        }
    };
    const handleRemove = (item) => {
        removeFromFoodCart(item.id);
        if (couponResponse) {
            setCouponResponse(null);
            setAppliedCouponName("");
        }
    };

    const handleCouponCodeChange = (event) => {
        const raw = event.target.value;
        const sanitized = raw.replace(/\s/g, '').toUpperCase();
        setCouponCode(sanitized);
        setAppliedCouponName("");
        setCouponResponse(null);
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setAppliedCouponName("");
        setCouponResponse(null);
        toast.success('Coupon removed.');
    };

    const handleApplyCoupon = async () => {
        const code = couponCode.trim();

        if (!code) {
            toast.error('Please enter a coupon code.');
            return;
        }

        if (code.length < 5) {
            toast.error('Coupon code must be 5 characters.');
            return;
        }

        const foodItems = foodCart
            .map((item) => ({
                foodId: item.foodId || item._id || item.id,
                quantity: Number(item.quantity) || 1,
            }))
            .filter((item) => Boolean(item.foodId));

        if (foodItems.length === 0) {
            toast.error('Please add food items before applying a coupon.');
            return;
        }

        setIsApplyingCoupon(true);

        try {
            const response = await validateCoupon({
                foodItems,
                name: code,
            });

            if (response?.success === false || response?.status === false) {
                throw new Error(response?.message || 'Failed to apply coupon.');
            }

            const data = response?.data;
            const totalDiscount = data?.summary?.totalDiscount || 0;

            setAppliedCouponName(code);
            setCouponResponse(data);
            toast.success(response?.message || `Coupon applied! You save ₹${totalDiscount}`);
        } catch (error) {
            const message = getApiErrorMessage(error, 'Failed to apply coupon.');
            setAppliedCouponName("");
            setCouponResponse(null);
            toast.error(message);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const toggleBillExpanded = () => setIsBillExpanded((current) => !current);

    // ══════════════════════════════════════════════════════════════
    // PAYMENT SHEET & ORDER FLOW
    // ══════════════════════════════════════════════════════════════

    /** Open the payment method bottom sheet */
    const handlePlaceOrderClick = useCallback(() => {
        // Pre-check-in browse mode: the server would reject the order anyway —
        // tell the guest when ordering unlocks instead of failing later.
        if (!canOrder) {
            toast.info(orderLockMessage);
            return;
        }
        if (foodCart.length === 0) return;
        setShowPaymentSheet(true);
    }, [foodCart, canOrder, orderLockMessage]);

    /** Close the bottom sheet */
    const handleCancelSheet = useCallback(() => {
        setShowPaymentSheet(false);
    }, []);

    /**
     * Opens the Razorpay checkout modal.
     */
    const openRazorpay = useCallback((paymentData, foodOrderId) => {
        return new Promise((resolve) => {
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
                        setPaymentProcessing(true);
                        await verifyPayment({
                            foodOrderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        toast.success('Payment verified successfully!');
                        resolve(true);
                    } catch (error) {
                        const msg = getApiErrorMessage(error, 'Payment verification failed. Please contact support.');
                        toast.error(msg);
                        toast.info(`Your Order ID: ${foodOrderId}`, { duration: 10000 });
                        resolve(false);
                    } finally {
                        setPaymentProcessing(false);
                    }
                },

                modal: {
                    ondismiss: function () {
                        toast.info('Order placed as Cash on Delivery.', { duration: 5000 });
                        resolve(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
            });
            rzp.open();
        });
    }, [customerData, hotelData]);

    /**
     * Confirm & Place Order — called from bottom sheet.
     * Places order → if online, initiates Razorpay → navigates to order history.
     */
    const handleConfirmOrder = useCallback(async () => {
        if (!canOrder) {
            toast.info(orderLockMessage);
            return;
        }
        if (foodCart.length === 0 || isPlacingOrder || paymentProcessing) return;

        setIsPlacingOrder(true);

        try {
            // Build order payload
            const foodItems = foodCart.map((item) => ({
                foodId: item.foodId || item._id || item.id,
                quantity: Number(item.quantity) || 1,
                price: getCartUnitPrice(item),
            }));

            const orderPayload = {
                hotelId: hotelData?._id,
                foodItems,
                deliveryAddress: `Room ${roomNumber || 'N/A'}`,
            };

            if (appliedCouponName) {
                orderPayload.couponCode = appliedCouponName;
            }

            // Create the order (always starts as COD)
            const orderRes = await createFoodOrder(orderPayload);
            const foodOrderId = orderRes?._id || orderRes?.data?._id;

            if (!foodOrderId) {
                throw new Error('Order created but no order ID received.');
            }

            // If COD → clear cart → go to order history
            if (paymentMethod === 'cod') {
                clearFoodCart();
                setShowPaymentSheet(false);
                toast.success('Order placed successfully!');
                navigate('/order-history');
                return;
            }

            // Online → Initiate Razorpay
            setPaymentProcessing(true);

            const paymentRes = await initiatePayment({ foodOrderId });
            const paymentData = paymentRes?.data || paymentRes;

            if (!paymentData?.razorpayOrderId || !paymentData?.razorpayKey) {
                throw new Error('Failed to initiate payment. Please try again.');
            }

            setPaymentProcessing(false);
            setShowPaymentSheet(false);

            // Open Razorpay Modal
            await openRazorpay(paymentData, foodOrderId);

            // Whether payment succeeded or not, order exists — go to order history
            clearFoodCart();
            navigate('/order-history');

        } catch (error) {
            const message = getApiErrorMessage(error, 'Failed to place order. Please try again.');
            toast.error(message);
        } finally {
            setIsPlacingOrder(false);
            setPaymentProcessing(false);
        }
    }, [
        foodCart, isPlacingOrder, paymentProcessing, paymentMethod,
        hotelData, roomNumber, appliedCouponName,
        getCartUnitPrice, clearFoodCart, openRazorpay, navigate,
        canOrder, orderLockMessage,
    ]);

    return {
        items,
        itemsTotal,
        taxRate,
        taxAmount,
        payableAmount,
        itemCount,
        couponCode,
        couponDiscount,
        percentageSavings,
        bogoSavings,
        flatCouponDiscount,
        totalSavings,
        couponResponse,
        isApplyingCoupon,
        appliedCouponName,
        customerData,
        roomNumber,
        isBillExpanded,
        // Payment sheet
        showPaymentSheet,
        paymentMethod,
        setPaymentMethod,
        isPlacingOrder,
        paymentProcessing,
        handlePlaceOrderClick,
        handleConfirmOrder,
        handleCancelSheet,
        canOrder,
        // Navigation & actions
        handleBack,
        handleBrowseFood,
        handleIncrement,
        handleDecrement,
        handleRemove,
        handleCouponCodeChange,
        handleApplyCoupon,
        handleRemoveCoupon,
        toggleBillExpanded,
    };
}

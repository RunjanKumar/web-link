import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/client";
import { validateCoupon } from "../api/service/couponService";
import useCustomerProfile from "../hooks/CustomerProfile";
import useGlobal from "../hooks/FoodOrder";
import { getEffectivePrice, getLineTotal } from "../utils/discountHelper";
import { DISCOUNT_TYPES } from "../utils/constant";

/**
 * ══════════════════════════════════════════════════════════════
 * CART VIEWMODEL — Coupon Flow (v2)
 * ══════════════════════════════════════════════════════════════
 *
 * Frontend trusts backend for ALL coupon calculations.
 *
 * After applying a coupon via /v1/coupon/validate, the backend
 * returns per-item pricing (originalPrice, finalPrice,
 * discountAmount, appliedCouponType) and a summary block
 * (totalDiscount, finalPayableAmount). The frontend simply
 * displays these values without recalculating locally.
 *
 * Coupon input rules:
 *   - Max 5 characters
 *   - Uppercase only, no spaces
 *   - Apply button hits API only when text is present
 */

export default function useCartViewModel() {
    const navigate = useNavigate();
    const [isBillExpanded, setIsBillExpanded] = useState(true);
    const [couponCode, setCouponCode] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCouponName, setAppliedCouponName] = useState("");

    // Full backend coupon response (items + summary)
    const [couponResponse, setCouponResponse] = useState(null);

    const {
        foodCart,
        getCartUnitPrice,
        getFoodCartTotal,
        updateFoodCartQuantity,
        removeFromFoodCart,
    } = useGlobal();
    const {
        customerData,
        hotelData,
        roomNumber,
    } = useCustomerProfile();

    const itemsTotal = getFoodCartTotal();
    const taxRate = Number(hotelData?.bookedFoodOrderTax || 0);

    // When coupon is applied, use backend summary; otherwise calculate locally
    const summary = couponResponse?.summary;
    const couponDiscount = summary?.totalDiscount || 0;
    const backendFinalAmount = summary?.finalPayableAmount;

    // Discount breakdown for bill display
    // When coupon response exists → use backend values
    // When no coupon response → compute from local cart items
    const percentageSavings = useMemo(() => {
        if (couponResponse?.items) {
            return couponResponse.items
                .filter((ci) => ci.appliedCouponType === 'PERCENTAGE' && ci.discountAmount > 0)
                .reduce((sum, ci) => sum + ci.discountAmount, 0);
        }
        // Local: sum (price - priceAfterDiscount) * qty for PERCENTAGE items
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
        // Local: every 2nd item free → savings = price * floor(qty / 2)
        return foodCart
            .filter((item) => item.couponData?.discountType === DISCOUNT_TYPES.BOGO)
            .reduce((sum, item) => sum + (item.price ?? 0) * Math.floor(item.quantity / 2), 0);
    }, [couponResponse, foodCart]);

    const flatCouponDiscount = summary?.orderCouponDiscount || 0;
    
    // Total discount includes local percentage/BOGO savings + flat coupon
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
        // Create a lookup map from backend coupon response by foodId
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
                // Backend coupon fields (only present when coupon is applied)
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
        // Clear coupon response since cart changed
        if (couponResponse) {
            setCouponResponse(null);
            setAppliedCouponName("");
        }
    };
    const handleDecrement = (item) => {
        updateFoodCartQuantity(item.id, item.quantity - 1);
        // Clear coupon response since cart changed
        if (couponResponse) {
            setCouponResponse(null);
            setAppliedCouponName("");
        }
    };
    const handleRemove = (item) => {
        removeFromFoodCart(item.id);
        // Clear coupon response since cart changed
        if (couponResponse) {
            setCouponResponse(null);
            setAppliedCouponName("");
        }
    };

    /**
     * Coupon input handler:
     * - Max 5 characters
     * - Uppercase only
     * - No spaces allowed
     */
    const handleCouponCodeChange = (event) => {
        const raw = event.target.value;
        // Remove spaces, convert to uppercase, limit to 5 chars
        const sanitized = raw.replace(/\s/g, '').toUpperCase();
        setCouponCode(sanitized);
        // Reset applied coupon when user edits
        setAppliedCouponName("");
        setCouponResponse(null);
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setAppliedCouponName("");
        setCouponResponse(null);
        toast.success('Coupon removed.');
    };

    /**
     * Validate coupon via /v1/coupon/validate.
     * Sends { foodItems, couponCode } and stores full backend response.
     * Frontend trusts backend finalPrice and finalPayableAmount.
     */
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

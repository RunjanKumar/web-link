import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/client";
import { validateCoupon } from "../api/service/couponService";
import useCustomerProfile from "../hooks/CustomerProfile";
import useGlobal from "../hooks/FoodOrder";
import { getEffectivePrice } from "../utils/discountHelper";

function isFoodAvailable(food) {
    if (!food) return false;
    if (food.isAvailable === false || food.available === false) return false;
    if (food.status === false) return false;
    if (typeof food.status === 'string' && food.status.toLowerCase() === 'unavailable') return false;
    return true;
}

export default function useCartViewModel() {
    const navigate = useNavigate();
    const [isBillExpanded, setIsBillExpanded] = useState(true);
    const [couponCode, setCouponCode] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCouponName, setAppliedCouponName] = useState("");
    const {
        foodCart,
        getCartUnitPrice,
        getFoodCartTotal,
        updateFoodCartItem,
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
    const taxAmount = (itemsTotal * taxRate) / 100;
    const payableAmount = itemsTotal + taxAmount;
    const itemCount = foodCart.reduce((count, item) => count + item.quantity, 0);

    const items = useMemo(() => foodCart.map((item) => ({
        ...item,
        unitPrice: getCartUnitPrice(item),
        lineTotal: getCartUnitPrice(item) * item.quantity,
        baseUnitPrice: getEffectivePrice({
            price: item.price ?? 0,
            priceAfterDiscount: item.priceAfterDiscount,
            couponData: item.couponData,
        }),
        baseLineTotal: getEffectivePrice({
            price: item.price ?? 0,
            priceAfterDiscount: item.priceAfterDiscount,
            couponData: item.couponData,
        }) * item.quantity,
        addOns: (item.selectedAddOns || []).map((addOn) => ({
            id: addOn._id || addOn.id,
            title: addOn.name || addOn.title,
            imageURL: addOn.imageURL || addOn.image,
            unitPrice: addOn.price || 0,
            lineTotal: isFoodAvailable(addOn) ? (addOn.price || 0) * (addOn.quantity || 1) : 0,
            quantity: addOn.quantity || 1,
            isAvailable: isFoodAvailable(addOn),
        })),
    })), [foodCart, getCartUnitPrice]);

    const handleBack = () => navigate(-1);
    const handleBrowseFood = () => navigate('/food');
    const handleIncrement = (item) => updateFoodCartQuantity(item.id, item.quantity + 1);
    const handleDecrement = (item) => updateFoodCartQuantity(item.id, item.quantity - 1);
    const handleRemove = (item) => removeFromFoodCart(item.id);
    const handleCouponCodeChange = (event) => {
        setCouponCode(event.target.value);
        setAppliedCouponName("");
    };
    const handleApplyCoupon = async () => {
        const name = couponCode.trim();

        if (!name) {
            toast.error('Please enter a coupon code.');
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
            const response = await validateCoupon({ foodItems, name });

            if (response?.success === false || response?.status === false) {
                throw new Error(response?.message || 'Failed to apply coupon.');
            }

            setAppliedCouponName(name);
            toast.success(response?.message || 'Coupon applied successfully.');
        } catch (error) {
            const message = getApiErrorMessage(error, 'Failed to apply coupon.');
            setAppliedCouponName("");
            toast.error(message);
        } finally {
            setIsApplyingCoupon(false);
        }
    };
    const handleAddOnIncrement = (item, addOn) => {
        updateFoodCartItem(item.id, {
            selectedAddOns: (item.selectedAddOns || []).map((currentAddOn) =>
                (currentAddOn._id || currentAddOn.id) === addOn.id
                    ? { ...currentAddOn, quantity: (currentAddOn.quantity || 1) + 1 }
                    : currentAddOn
            ),
        });
    };
    const handleAddOnDecrement = (item, addOn) => {
        updateFoodCartItem(item.id, {
            selectedAddOns: (item.selectedAddOns || [])
                .map((currentAddOn) =>
                    (currentAddOn._id || currentAddOn.id) === addOn.id
                        ? { ...currentAddOn, quantity: (currentAddOn.quantity || 1) - 1 }
                        : currentAddOn
                )
                .filter((currentAddOn) => (currentAddOn.quantity || 0) > 0),
        });
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
        isApplyingCoupon,
        appliedCouponName,
        customerData,
        roomNumber,
        isBillExpanded,
        handleBack,
        handleBrowseFood,
        handleIncrement,
        handleDecrement,
        handleAddOnIncrement,
        handleAddOnDecrement,
        handleRemove,
        handleCouponCodeChange,
        handleApplyCoupon,
        toggleBillExpanded,
    };
}

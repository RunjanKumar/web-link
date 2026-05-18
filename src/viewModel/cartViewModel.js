import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomerProfile from "../hooks/CustomerProfile";
import useGlobal from "../hooks/FoodOrder";

export default function useCartViewModel() {
    const navigate = useNavigate();
    const [isBillExpanded, setIsBillExpanded] = useState(true);
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
    const taxAmount = (itemsTotal * taxRate) / 100;
    const payableAmount = itemsTotal + taxAmount;
    const itemCount = foodCart.reduce((count, item) => count + item.quantity, 0);

    const items = useMemo(() => foodCart.map((item) => ({
        ...item,
        unitPrice: getCartUnitPrice(item),
        lineTotal: getCartUnitPrice(item) * item.quantity,
        baseUnitPrice: item.priceAfterDiscount ?? item.price ?? 0,
        baseLineTotal: (item.priceAfterDiscount ?? item.price ?? 0) * item.quantity,
        addOns: (item.selectedAddOns || []).map((addOn) => ({
            id: addOn._id || addOn.id,
            title: addOn.name || addOn.title,
            imageURL: addOn.imageURL || addOn.image,
            unitPrice: addOn.price || 0,
            lineTotal: (addOn.price || 0) * item.quantity,
            quantity: item.quantity,
        })),
    })), [foodCart, getCartUnitPrice]);

    const handleBack = () => navigate(-1);
    const handleBrowseFood = () => navigate('/food');
    const handleIncrement = (item) => updateFoodCartQuantity(item.id, item.quantity + 1);
    const handleDecrement = (item) => updateFoodCartQuantity(item.id, item.quantity - 1);
    const handleRemove = (item) => removeFromFoodCart(item.id);
    const toggleBillExpanded = () => setIsBillExpanded((current) => !current);

    return {
        items,
        itemsTotal,
        taxRate,
        taxAmount,
        payableAmount,
        itemCount,
        customerData,
        roomNumber,
        isBillExpanded,
        handleBack,
        handleBrowseFood,
        handleIncrement,
        handleDecrement,
        handleRemove,
        toggleBillExpanded,
    };
}

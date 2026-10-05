import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Banknote,
    ChevronDown,
    ChevronUp,
    Clock3,
    CreditCard,
    Home,
    Info,
    Loader2,
    Minus,
    Phone,
    Plus,
    ReceiptText,
    X,
} from "lucide-react";
import useCartViewModel from "../../../viewModel/cartViewModel";
import { getDiscountDisplayInfo, getLineTotal } from "../../../utils/discountHelper";
import VegIndicator from "../components/VegIndicator";
import AppImage from "../../../globalComponents/AppImage";

export default function Cart() {
    const {
        items,
        itemsTotal,
        taxRate,
        taxAmount,
        payableAmount,
        customerData,
        roomNumber,
        couponCode,
        couponDiscount,
        percentageSavings,
        bogoSavings,
        flatCouponDiscount,
        totalSavings,
        couponResponse,
        isApplyingCoupon,
        appliedCouponName,
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
    } = useCartViewModel();

    const isProcessing = isPlacingOrder || paymentProcessing;

    return (
        <div className="min-h-screen bg-[#111111] text-white pb-[92px]">
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="text-yellow-400 animate-spin" />
                    <p className="text-white text-[20px] font-medium">
                        {paymentProcessing ? 'Verifying payment…' : 'Placing your order…'}
                    </p>
                    <p className="text-[#A7A7A7] text-[14px]">Please don't close this page</p>
                </div>
            )}

            <div className="px-5 pt-10">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 flex items-center justify-center -ml-2"
                >
                    <ArrowLeft size={28} />
                </button>

                <div className="mt-4">
                    <h1 className="text-[26px] font-semibold leading-none">Cart</h1>
                    <p className="text-[#A7A7A7] text-[15px] mt-2">
                        Room No. {roomNumber || '208'}
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="mt-16 text-center">
                        <p className="text-[#A7A7A7] text-[18px]">Your cart is empty</p>
                        <button
                            onClick={handleBrowseFood}
                            className="mt-6 h-[52px] px-8 rounded-[18px] bg-yellow-400 text-black font-semibold"
                        >
                            Browse food
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="mt-5 flex flex-col gap-3">
                            {items.map((item) => {
                                const discount = getDiscountDisplayInfo({
                                    price: item.price,
                                    priceAfterDiscount: item.priceAfterDiscount,
                                    couponData: item.couponData,
                                });

                                const ci = item.couponItemData;

                                return (
                                    <CartFoodRow
                                        key={item.id}
                                        item={item}
                                        title={ci ? ci.name : (item.isAddOn ? `Add on - ${item.title}` : item.title)}
                                        imageURL={item.imageURL || item.image}
                                        price={ci ? ci.finalPrice : item.baseUnitPrice}
                                        originalPrice={ci
                                            ? (ci.discountAmount > 0 ? ci.originalPrice : null)
                                            : discount.originalPrice}
                                        discountAmount={ci ? ci.discountAmount : 0}
                                        appliedCouponType={ci ? ci.appliedCouponType : null}
                                        isBogo={ci
                                            ? ci.appliedCouponType === 'BOGO'
                                            : discount.isBogo}
                                        quantity={ci ? ci.quantity : item.quantity}
                                        couponData={ci ? null : item.couponData}
                                        onIncrement={() => handleIncrement(item)}
                                        onDecrement={() => handleDecrement(item)}
                                        onRemove={() => handleRemove(item)}
                                        parentFoodTitle={item.isAddOn ? item.parentFoodTitle : null}
                                        foodType={item.type}
                                        hasCouponApplied={!!ci}
                                    />
                                );
                            })}
                        </div>

                        {/* ── Coupon Input ── */}
                        <input
                            value={couponCode}
                            onChange={handleCouponCodeChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') handleApplyCoupon();
                            }}
                            placeholder="Apply flat coupon only"
                            disabled={isApplyingCoupon}
                            className="mt-8 w-full h-[52px] rounded-[12px] bg-[#202020] px-4 text-[16px] outline-none placeholder:text-[#8D8D8D] uppercase tracking-widest"
                        />
                        {appliedCouponName ? (
                            <div className="mt-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[15px] text-yellow-400">
                                        Coupon <span className="font-semibold">{appliedCouponName}</span> applied
                                    </p>
                                    {couponDiscount > 0 && (
                                        <p className="text-green-400 text-[14px] mt-1">
                                            You save ₹{couponDiscount}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-[#FF4444] text-[14px] font-medium border border-[#FF4444]/30 rounded-[10px] px-3 py-[4px]"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : null}

                        {/* ── Delivery & Bill Info ── */}
                        <div className="mt-10 rounded-[12px] bg-[#202020] px-4 py-5">
                            <InfoRow icon={<Clock3 size={24} />} label="Delivery in" value="30 Minutes" />
                            <InfoRow icon={<Home size={24} />} label="Delivery at" value={`Room No. ${roomNumber || '208'}`} />
                            <InfoRow
                                icon={<Phone size={24} />}
                                label={customerData?.name || 'Guest'}
                                value={customerData?.phone || customerData?.mobile || '+91 9898989898'}
                            />

                            <div className="py-7">
                                <button
                                    onClick={toggleBillExpanded}
                                    className="w-full flex items-center gap-5 text-left"
                                >
                                    <div className="text-yellow-400 w-8 flex justify-center">
                                        <ReceiptText size={24} />
                                    </div>
                                    <p className="flex-1 text-[#A7A7A7] text-[15px]">
                                        Total Bill <span className="text-white font-semibold">₹ {payableAmount.toFixed(2)}</span>
                                    </p>
                                    <span className="text-white">
                                        {isBillExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                                    </span>
                                </button>

                                {isBillExpanded && (
                                    <div className="mt-6 ml-10 rounded-[10px] bg-[#121212] px-5 py-5">
                                        <BillLine label="Items Total" value={`₹ ${itemsTotal.toFixed(2)}`} />

                                        {(percentageSavings > 0 || bogoSavings > 0 || flatCouponDiscount > 0) && (
                                            <div className="mt-2 mb-2">
                                                {percentageSavings > 0 && (
                                                    <BillLine
                                                        label="Percentage Discount"
                                                        value={`- ₹ ${percentageSavings.toFixed(2)}`}
                                                        discount
                                                    />
                                                )}
                                                {bogoSavings > 0 && (
                                                    <BillLine
                                                        label="BOGO Savings"
                                                        value={`- ₹ ${bogoSavings.toFixed(2)}`}
                                                        discount
                                                    />
                                                )}
                                                {flatCouponDiscount > 0 && (
                                                    <BillLine
                                                        label={`Coupon (${appliedCouponName})`}
                                                        value={`- ₹ ${flatCouponDiscount.toFixed(2)}`}
                                                        discount
                                                    />
                                                )}
                                                <div className="h-px bg-[#2A2A2A] my-3" />
                                                <BillLine
                                                    label="Total Savings"
                                                    value={`- ₹ ${totalSavings.toFixed(2)}`}
                                                    savings
                                                />
                                            </div>
                                        )}

                                        <BillLine label={`Tax (${taxRate}%)`} value={`₹ ${taxAmount.toFixed(2)}`} />
                                        <div className="h-px bg-[#3A3A3A] my-5" />
                                        <BillLine
                                            label="Payable Amount"
                                            value={`₹ ${payableAmount.toFixed(2)}`}
                                            strong
                                        />
                                    </div>
                                )}

                                <p className="ml-10 mt-4 text-[#A7A7A7] text-[13px]">
                                    Incl. taxes and charges
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Bottom Bar ── */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-[#30302F] px-5 py-4 flex gap-3 z-10">
                    <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="shrink-0 px-4 h-[52px] rounded-[18px] border border-yellow-500/70 text-[14px] disabled:opacity-60"
                    >
                        {isApplyingCoupon ? 'Applying...' : 'Apply Coupon'}
                    </button>
                    <button
                        onClick={handlePlaceOrderClick}
                        className={`flex-1 h-[52px] rounded-[18px] bg-yellow-400 text-black text-[15px] font-semibold ${!canOrder ? 'opacity-50 grayscale' : ''}`}
                    >
                        {canOrder
                            ? `Place Order - ₹ ${payableAmount.toFixed(2)}`
                            : 'Available after check-in'}
                    </button>
                </div>
            )}

            {/* ── Payment Method Bottom Sheet ── */}
            {showPaymentSheet && (
                <PaymentBottomSheet
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    payableAmount={payableAmount}
                    roomNumber={roomNumber}
                    isPlacingOrder={isPlacingOrder}
                    onConfirm={handleConfirmOrder}
                    onCancel={handleCancelSheet}
                />
            )}
        </div>
    );
}


// ══════════════════════════════════════════════════════════════
// PAYMENT BOTTOM SHEET
// ══════════════════════════════════════════════════════════════

function PaymentBottomSheet({
    paymentMethod,
    setPaymentMethod,
    payableAmount,
    roomNumber,
    isPlacingOrder,
    onConfirm,
    onCancel,
}) {
    // Slide-up animation state
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        });
    }, []);

    const handleCancel = () => {
        setIsVisible(false);
        setTimeout(onCancel, 300);
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleCancel}
            />

            {/* Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-[24px] transition-transform duration-300 ease-out ${
                    isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-[5px] rounded-full bg-[#4A4A4A]" />
                </div>

                <div className="px-6 pb-8">
                    {/* Title */}
                    <h2 className="text-white text-[22px] font-bold mt-2">Choose payment method</h2>
                    <p className="text-[#8D8D8D] text-[15px] mt-1">
                        Total: ₹ {payableAmount.toFixed(2)} · Room {roomNumber || '101'}
                    </p>

                    {/* Options */}
                    <div className="mt-6 flex flex-col gap-3">
                        {/* Pay Online */}
                        <button
                            onClick={() => setPaymentMethod('online')}
                            className={`w-full flex items-center gap-4 p-4 rounded-[16px] border-2 transition-all duration-200 ${
                                paymentMethod === 'online'
                                    ? 'border-yellow-400 bg-yellow-400/5'
                                    : 'border-[#3A3A3A] bg-transparent'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${
                                paymentMethod === 'online'
                                    ? 'bg-yellow-400/15'
                                    : 'bg-[#2A2A2A]'
                            }`}>
                                <CreditCard size={22} className={
                                    paymentMethod === 'online' ? 'text-yellow-400' : 'text-[#6B6B6B]'
                                } />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`text-[17px] font-semibold ${
                                    paymentMethod === 'online' ? 'text-yellow-400' : 'text-white'
                                }`}>
                                    Pay online
                                </p>
                                <p className="text-[#8D8D8D] text-[13px] mt-[2px]">
                                    UPI, card, net banking via Razorpay
                                </p>
                            </div>
                            {/* Radio */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === 'online'
                                    ? 'border-yellow-400'
                                    : 'border-[#4A4A4A]'
                            }`}>
                                {paymentMethod === 'online' && (
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                )}
                            </div>
                        </button>

                        {/* Cash on Delivery */}
                        <button
                            onClick={() => setPaymentMethod('cod')}
                            className={`w-full flex items-center gap-4 p-4 rounded-[16px] border-2 transition-all duration-200 ${
                                paymentMethod === 'cod'
                                    ? 'border-yellow-400 bg-yellow-400/5'
                                    : 'border-[#3A3A3A] bg-transparent'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${
                                paymentMethod === 'cod'
                                    ? 'bg-yellow-400/15'
                                    : 'bg-[#2A2A2A]'
                            }`}>
                                <Banknote size={22} className={
                                    paymentMethod === 'cod' ? 'text-yellow-400' : 'text-[#6B6B6B]'
                                } />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`text-[17px] font-semibold ${
                                    paymentMethod === 'cod' ? 'text-yellow-400' : 'text-white'
                                }`}>
                                    Cash on delivery
                                </p>
                                <p className="text-[#8D8D8D] text-[13px] mt-[2px]">
                                    Pay when order arrives at your room
                                </p>
                            </div>
                            {/* Radio */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === 'cod'
                                    ? 'border-yellow-400'
                                    : 'border-[#4A4A4A]'
                            }`}>
                                {paymentMethod === 'cod' && (
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Info text */}
                    <div className="mt-5 flex items-start gap-2">
                        <Info size={16} className="text-[#6B6B6B] mt-[2px] shrink-0" />
                        <p className="text-[#6B6B6B] text-[13px] leading-[18px]">
                            You can switch to online payment anytime before delivery
                        </p>
                    </div>

                    {/* Confirm button */}
                    <button
                        onClick={onConfirm}
                        disabled={isPlacingOrder}
                        className="mt-6 w-full h-[56px] rounded-[16px] bg-gradient-to-r from-[#C99F2B] to-[#E2B124] text-black text-[18px] font-bold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
                    >
                        {isPlacingOrder ? (
                            <>
                                <Loader2 size={22} className="animate-spin" />
                                Placing order…
                            </>
                        ) : (
                            'Confirm & place order'
                        )}
                    </button>

                    {/* Cancel */}
                    <button
                        onClick={handleCancel}
                        disabled={isPlacingOrder}
                        className="mt-3 w-full text-center text-[#8D8D8D] text-[16px] py-2 disabled:opacity-40"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}


// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function CartFoodRow({
    title,
    imageURL,
    price,
    originalPrice,
    discountAmount,
    appliedCouponType,
    isBogo,
    quantity,
    onIncrement,
    onDecrement,
    onRemove,
    parentFoodTitle,
    foodType,
    couponData,
    hasCouponApplied,
}) {
    const lineTotal = hasCouponApplied
        ? Math.round(price)
        : Math.round(getLineTotal({ unitPrice: price, quantity, couponData }));

    return (
        <div className="rounded-[24px] overflow-hidden border border-[#5A5A5A] bg-[#202020]">
            <div className="flex items-center gap-3 p-3 bg-[#202020]">
                <div className="relative">
                    <AppImage
                        src={imageURL}
                        alt={title}
                        className="w-[95px] h-[70px] sm:w-[214px] sm:h-[90px] object-cover bg-[#2A2A2A] rounded-[12px]"
                    />
                    {isBogo && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#E2B124] text-black text-[10px] font-bold text-center py-[2px]">
                            1+1 FREE
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <VegIndicator type={foodType} size={14} />
                        <p className="text-[14px] sm:text-[18px] text-[#F4F4F4] truncate">
                            {title}
                        </p>
                    </div>
                    {parentFoodTitle && (
                        <p className="text-[#707070] text-[12px] mt-[2px] truncate">
                            for {parentFoodTitle}
                        </p>
                    )}
                    <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                        <p className="text-[#C99F2B] text-[22px] sm:text-[28px] font-semibold">
                            ₹{lineTotal}
                        </p>
                        {originalPrice != null && (
                            <span className="text-[#6B6B6B] text-[12px] sm:text-[16px] line-through">
                                ₹{Math.round(originalPrice)}
                            </span>
                        )}
                        {isBogo && (
                            <span className="bg-[#E2B124]/15 text-[#E2B124] text-[11px] font-bold px-[6px] py-[2px] rounded-[6px] leading-[16px] tracking-wide">
                                1+1 FREE
                            </span>
                        )}
                        {hasCouponApplied && discountAmount > 0 && !isBogo && (
                            <span className="bg-green-500/15 text-green-400 text-[11px] font-bold px-[6px] py-[2px] rounded-[6px] leading-[16px]">
                                -{appliedCouponType === 'PERCENTAGE' ? `₹${discountAmount}` : `₹${discountAmount}`}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onRemove}
                    className="w-5 h-5 rounded-[5px] border border-red-500 text-red-500 flex items-center justify-center shrink-0"
                >
                    <X size={14} />
                </button>

                <div className="h-8 sm:h-10 rounded-full border border-yellow-400 flex items-center overflow-hidden shrink-0">
                    <button
                        onClick={onDecrement}
                        className="w-8 sm:w-12 h-full text-yellow-400 flex items-center justify-center"
                    >
                        <Minus size={22} />
                    </button>
                    <span className="w-8 sm:w-12 text-center text-yellow-400 text-[14px] sm:text-[22px] font-semibold">
                        {quantity}
                    </span>
                    <button
                        onClick={onIncrement}
                        className="w-8 sm:w-12 h-full text-yellow-400 flex items-center justify-center"
                    >
                        <Plus size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4 border-b border-dashed border-[#3A3A3A] py-4">
            <div className="text-yellow-400 w-8 flex justify-center">{icon}</div>
            <p className="text-[#A7A7A7] text-[15px]">
                {label} <span className="text-white font-semibold">{value}</span>
            </p>
        </div>
    );
}

function BillLine({ label, value, strong, discount, savings }) {
    return (
        <div className="flex items-center justify-between py-2">
            <p className={`${
                strong ? 'text-white font-semibold' 
                : savings ? 'text-green-400 font-semibold'
                : discount ? 'text-green-400' 
                : 'text-[#A7A7A7]'
            } text-[14px]`}>
                {label}
            </p>
            <p className={`${
                strong ? 'text-yellow-400 font-semibold' 
                : savings ? 'text-green-400 font-semibold'
                : discount ? 'text-green-400 font-medium' 
                : 'text-white'
            } text-[14px]`}>
                {value}
            </p>
        </div>
    );
}

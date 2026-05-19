import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Clock3,
    Home,
    Minus,
    Phone,
    Plus,
    ReceiptText,
    X,
} from "lucide-react";
import useCartViewModel from "../../../viewModel/cartViewModel";
import { getDiscountDisplayInfo, getLineTotal } from "../../../utils/discountHelper";
import VegIndicator from "../components/VegIndicator";

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

    return (
        <div className="min-h-screen bg-[#111111] text-white pb-[118px]">
            <div className="px-5 pt-10">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 flex items-center justify-center -ml-2"
                >
                    <ArrowLeft size={28} />
                </button>

                <div className="mt-4">
                    <h1 className="text-[40px] font-semibold leading-none">Cart</h1>
                    <p className="text-[#A7A7A7] text-[22px] mt-7">
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
                        {/* Flat list — each item (food or add-on) is independent */}
                        <div className="mt-5 flex flex-col gap-3">
                            {items.map((item) => {
                                const discount = getDiscountDisplayInfo({
                                    price: item.price,
                                    priceAfterDiscount: item.priceAfterDiscount,
                                    couponData: item.couponData,
                                });

                                // If coupon is applied, use backend coupon data for this item
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
                            className="mt-8 w-full h-[80px] rounded-[12px] bg-[#202020] px-6 text-[22px] outline-none placeholder:text-[#8D8D8D] uppercase tracking-widest"
                        />
                        {appliedCouponName ? (
                            <div className="mt-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[18px] text-yellow-400">
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
                        <div className="mt-10 rounded-[12px] bg-[#202020] px-6 py-8">
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
                                    <p className="flex-1 text-[#A7A7A7] text-[22px]">
                                        Total Bill <span className="text-white font-semibold">₹ {payableAmount.toFixed(2)}</span>
                                    </p>
                                    <span className="text-white">
                                        {isBillExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                                    </span>
                                </button>

                                {isBillExpanded && (
                                    <div className="mt-6 ml-14 rounded-[10px] bg-[#121212] px-5 py-5">
                                        <BillLine label="Items Total" value={`₹ ${itemsTotal.toFixed(2)}`} />

                                        {/* ── Discount Breakdown ── */}
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

                                <p className="ml-14 mt-4 text-[#A7A7A7] text-[20px]">
                                    Incl. taxes and charges
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-[#30302F] px-5 py-4 flex gap-4">
                    <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="w-[238px] h-[84px] rounded-[18px] border border-yellow-500/70 text-[22px] disabled:opacity-60"
                    >
                        {isApplyingCoupon ? 'Applying...' : 'Apply Coupon'}
                    </button>
                    <button className="flex-1 h-[84px] rounded-[18px] bg-yellow-400 text-black text-[24px] font-semibold">
                        Place Order - ₹ {payableAmount.toFixed(2)}
                    </button>
                </div>
            )}
        </div>
    );
}

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
    // When coupon is applied, use backend finalPrice directly; otherwise calculate locally
    const lineTotal = hasCouponApplied
        ? Math.round(price)
        : Math.round(getLineTotal({ unitPrice: price, quantity, couponData }));

    return (
        <div className="rounded-[24px] overflow-hidden border border-[#5A5A5A] bg-[#202020]">
            <div className="flex items-center bg-[#202020]">
                <div className="relative">
                    <img
                        src={imageURL}
                        alt={title}
                        className="w-[214px] h-[90px] object-cover bg-[#2A2A2A]"
                    />
                    {isBogo && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#E2B124] text-black text-[10px] font-bold text-center py-[2px]">
                            1+1 FREE
                        </div>
                    )}
                </div>

                <div className="flex-1 px-7 py-4 min-w-0">
                    <div className="flex items-center gap-2">
                        <VegIndicator type={foodType} size={14} />
                        <p className="text-[18px] text-[#F4F4F4] truncate">
                            {title}
                        </p>
                    </div>
                    {parentFoodTitle && (
                        <p className="text-[#707070] text-[12px] mt-[2px] truncate">
                            for {parentFoodTitle}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[#C99F2B] text-[28px] font-semibold">
                            ₹{lineTotal}
                        </p>
                        {originalPrice != null && (
                            <span className="text-[#6B6B6B] text-[16px] line-through">
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
                    className="mr-5 w-6 h-6 rounded-[6px] border border-red-500 text-red-500 flex items-center justify-center"
                >
                    <X size={14} />
                </button>

                <div className="mr-10 h-10 rounded-full border border-yellow-400 flex items-center overflow-hidden">
                    <button
                        onClick={onDecrement}
                        className="w-12 h-full text-yellow-400 flex items-center justify-center"
                    >
                        <Minus size={22} />
                    </button>
                    <span className="w-12 text-center text-yellow-400 text-[22px] font-semibold">
                        {quantity}
                    </span>
                    <button
                        onClick={onIncrement}
                        className="w-12 h-full text-yellow-400 flex items-center justify-center"
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
        <div className="flex items-center gap-5 border-b border-dashed border-[#3A3A3A] py-7">
            <div className="text-yellow-400 w-8 flex justify-center">{icon}</div>
            <p className="text-[#A7A7A7] text-[22px]">
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
            } text-[22px]`}>
                {label}
            </p>
            <p className={`${
                strong ? 'text-yellow-400 font-semibold' 
                : savings ? 'text-green-400 font-semibold'
                : discount ? 'text-green-400 font-medium' 
                : 'text-white'
            } text-[22px]`}>
                {value}
            </p>
        </div>
    );
}

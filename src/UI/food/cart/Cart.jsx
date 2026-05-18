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

export default function Cart() {
    const {
        items,
        itemsTotal,
        taxRate,
        taxAmount,
        payableAmount,
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
                        <div className="mt-5 flex flex-col gap-3">
                            {items.map((item) => (
                                <CartFoodGroup
                                    key={item.id}
                                    item={item}
                                    onIncrement={handleIncrement}
                                    onDecrement={handleDecrement}
                                    onAddOnIncrement={handleAddOnIncrement}
                                    onAddOnDecrement={handleAddOnDecrement}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>

                        <input
                            placeholder="Apply code"
                            className="mt-8 w-full h-[80px] rounded-[12px] bg-[#202020] px-6 text-[22px] outline-none placeholder:text-[#8D8D8D]"
                        />

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
                    <button className="w-[238px] h-[84px] rounded-[18px] border border-yellow-500/70 text-[22px]">
                        Apply Coupon
                    </button>
                    <button className="flex-1 h-[84px] rounded-[18px] bg-yellow-400 text-black text-[24px] font-semibold">
                        Place Order - ₹ {payableAmount.toFixed(2)}
                    </button>
                </div>
            )}
        </div>
    );
}

function CartFoodGroup({
    item,
    onIncrement,
    onDecrement,
    onAddOnIncrement,
    onAddOnDecrement,
    onRemove,
}) {
    return (
        <div className="rounded-[24px] overflow-hidden border border-[#5A5A5A] bg-[#202020]">
            <CartFoodRow
                item={item}
                title={item.title}
                imageURL={item.imageURL || item.image}
                price={item.baseUnitPrice}
                quantity={item.quantity}
                onIncrement={() => onIncrement(item)}
                onDecrement={() => onDecrement(item)}
                onRemove={() => onRemove(item)}
                showRemove
            />

            {item.addOns.map((addOn) => (
                <CartFoodRow
                    key={addOn.id}
                    title={addOn.title}
                    imageURL={addOn.imageURL}
                    price={addOn.unitPrice}
                    quantity={addOn.quantity}
                    onIncrement={() => onAddOnIncrement(item, addOn)}
                    onDecrement={() => onAddOnDecrement(item, addOn)}
                    isAvailable={addOn.isAvailable}
                    isAddOn
                />
            ))}
        </div>
    );
}

function CartFoodRow({
    title,
    imageURL,
    price,
    quantity,
    isAddOn,
    showRemove,
    onIncrement,
    onDecrement,
    onRemove,
    isAvailable = true,
}) {
    return (
        <div className={`flex items-center bg-[#202020] ${isAddOn ? 'border-t border-[#3A3A3A]' : ''}`}>
            <img
                src={imageURL}
                alt={title}
                className="w-[214px] h-[90px] object-cover bg-[#2A2A2A]"
            />

            <div className="flex-1 px-7 py-4 min-w-0">
                <p className="text-[18px] text-[#F4F4F4] truncate">
                    {isAddOn ? `Add on - ${title}` : title}
                </p>
                <p className="text-[#C99F2B] text-[28px] font-semibold mt-2">
                    ₹{Math.round(price)} x {quantity}
                </p>
            </div>

            {showRemove && (
                <button
                    onClick={onRemove}
                    className="mr-5 w-6 h-6 rounded-[6px] border border-red-500 text-red-500 flex items-center justify-center"
                >
                    <X size={14} />
                </button>
            )}

            {!isAvailable ? (
                <span className="mr-10 text-[#FF4444] text-[16px] font-medium border border-[#FF4444]/30 rounded-[14px] px-3 py-[6px]">
                    Unavailable
                </span>
            ) : onIncrement && onDecrement && (
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
            )}
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

function BillLine({ label, value, strong }) {
    return (
        <div className="flex items-center justify-between py-2">
            <p className={`${strong ? 'text-white font-semibold' : 'text-[#A7A7A7]'} text-[22px]`}>
                {label}
            </p>
            <p className={`${strong ? 'text-yellow-400 font-semibold' : 'text-white'} text-[22px]`}>
                {value}
            </p>
        </div>
    );
}

import { ArrowLeft, Bike, Home, Minus, Phone, Plus, ReceiptText, X } from "lucide-react";
import useCartViewModel from "../../../viewModel/cartViewModel";

export default function Cart() {
    const {
        items,
        total,
        handleBack,
        handleBrowseFood,
        handleIncrement,
        handleDecrement,
        handleRemove,
    } = useCartViewModel();

    return (
        <div className="min-h-screen bg-[#1F1F1F] text-white pb-[104px]">
            <div className="px-5 pt-10">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 flex items-center justify-center -ml-2"
                >
                    <ArrowLeft size={28} />
                </button>

                <div className="mt-4">
                    <h1 className="text-[30px] font-semibold leading-none">Cart</h1>
                    <p className="text-[#A7A7A7] text-[14px] mt-2">Room 208</p>
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
                        <div className="mt-8 flex flex-col gap-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="relative flex border border-[#5A5A5A] rounded-[14px] overflow-hidden bg-[#202020]"
                                >
                                    <img
                                        src={item.imageURL || item.image}
                                        alt={item.title}
                                        className="w-[108px] h-[96px] object-cover bg-[#2A2A2A]"
                                    />

                                    <div className="flex-1 px-3 py-3 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h2 className="text-[16px] text-[#F4F4F4] truncate">
                                                    {item.title}
                                                </h2>
                                                {item.addOnLabel && (
                                                    <p className="text-[#A7A7A7] text-[13px] mt-1 truncate">
                                                        Add on - {item.addOnLabel}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item)}
                                                className="w-5 h-5 rounded-[6px] border border-red-500 text-red-500 flex items-center justify-center shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>

                                        <div className="flex items-end justify-between mt-3">
                                            <p className="text-[#E2B124] text-[18px] font-semibold">
                                                ₹ {Math.round(item.lineTotal)}
                                            </p>
                                            <div className="h-8 rounded-full border border-[#5A5A5A] flex items-center overflow-hidden">
                                                <button
                                                    onClick={() => handleDecrement(item)}
                                                    className="w-9 h-full text-yellow-400 flex items-center justify-center"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center text-[15px]">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleIncrement(item)}
                                                    className="w-9 h-full text-yellow-400 flex items-center justify-center"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <input
                            placeholder="Apply code"
                            className="mt-9 w-full h-[56px] rounded-full border border-[#5A5A5A] bg-transparent px-6 text-[18px] outline-none placeholder:text-[#8D8D8D]"
                        />

                        <div className="mt-4 rounded-[14px] bg-[#282828] px-4 py-2">
                            <InfoRow icon={<Bike size={16} />} label="Delivery in" value="20 mins" />
                            <InfoRow icon={<Home size={16} />} label="Delivery at" value="Room No. 208" />
                            <InfoRow icon={<Phone size={16} />} label="James Miller" value="+91 9898989898" />
                            <InfoRow icon={<ReceiptText size={16} />} label="Total Bill" value={`₹ ${Math.round(total)}`} subLabel="Incl. Taxes and charges" />
                        </div>
                    </>
                )}
            </div>

            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-[#30302F] px-5 py-4 flex gap-3">
                    <button className="w-[152px] h-[52px] rounded-[16px] border border-yellow-500/70 text-[12px] leading-tight">
                        <span className="block text-[#A7A7A7]">PAY USING</span>
                        <span className="font-semibold">GOOGLE Pay UPI</span>
                    </button>
                    <button className="flex-1 h-[52px] rounded-[16px] bg-yellow-400 text-black text-[18px] font-semibold">
                        Place Order - ₹ {Math.round(total)}
                    </button>
                </div>
            )}
        </div>
    );
}

function InfoRow({ icon, label, value, subLabel }) {
    return (
        <div className="flex items-center gap-5 border-b border-dashed border-[#3A3A3A] last:border-b-0 py-4">
            <div className="text-yellow-400 w-5 flex justify-center">{icon}</div>
            <div className="flex-1">
                <p className="text-[#A7A7A7] text-[14px]">
                    {label} <span className="text-white font-semibold">{value}</span>
                </p>
                {subLabel && (
                    <p className="text-[#8D8D8D] text-[13px] mt-1">{subLabel}</p>
                )}
            </div>
        </div>
    );
}

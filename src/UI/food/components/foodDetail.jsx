import { ArrowLeft } from "lucide-react";
import useFoodDetailViewModel from "../../../viewModel/foodDetailViewModel";
import { getDiscountDisplayInfo } from "../../../utils/discountHelper";
import VegIndicator from "./VegIndicator";

export default function FoodDetails() {
    const {
        state,
        quantity,
        isAvailable,
        isBogo,
        itemPrice,
        totalPrice,
        ingredients,
        addOns,
        addOnQuantities,
        handleBack,
        handleAdd,
        handleIncrement,
        handleDecrement,
        handleAddItemsClick,
        handleAddOnAdd,
        handleAddOnIncrement,
        handleAddOnDecrement,
    } = useFoodDetailViewModel();

    const discount = getDiscountDisplayInfo({
        price: state?.price,
        priceAfterDiscount: state?.priceAfterDiscount,
        couponData: state?.couponData,
    });

    return (
        <div className={`min-h-screen bg-[#111111] text-white pb-[120px] ${!isAvailable ? 'relative' : ''}`}>
            <div className="relative">
                <img
                    src={state?.imageURL || state?.image}
                    alt={state?.title}
                    className={`w-full h-[360px] object-cover ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />

                <button
                    onClick={handleBack}
                    className="absolute top-6 left-5 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                >
                    <ArrowLeft size={24} />
                </button>

                {!isAvailable && (
                    <div className="absolute top-6 right-5 bg-red-600/90 px-4 py-2 rounded-full">
                        <span className="text-white text-[13px] font-semibold">Currently Unavailable</span>
                    </div>
                )}

                {/* BOGO badge on image */}
                {discount.isBogo && isAvailable && (
                    <div className="absolute top-6 right-5 bg-[#E2B124] text-black px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="text-[13px] font-bold">🎉 BUY 1 GET 1 FREE</span>
                    </div>
                )}
            </div>

            <div className="px-5 pt-4">
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-[32px] font-semibold leading-[38px]">
                        {state?.title}
                    </h1>
                    <VegIndicator type={state?.type} size={28} />
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <span className="text-[#E2B124] text-[22px] font-bold">
                        ₹ {Math.round(discount.displayPrice)}
                    </span>

                    {discount.originalPrice != null && (
                        <span className="text-[#6B6B6B] text-[16px] line-through">
                            ₹{Math.round(discount.originalPrice)}
                        </span>
                    )}

                    {discount.isBogo && (
                        <span className="bg-[#E2B124]/15 text-[#E2B124] text-[13px] font-bold px-2 py-1 rounded-[8px]">
                            1+1 FREE
                        </span>
                    )}

                    {state?.calories > 0 && (
                        <>
                            <span className="text-[#5A5A5A]">•</span>
                            <span className="text-[#808080] text-[15px]">
                                {state.calories} Kcal
                            </span>
                        </>
                    )}
                </div>

                {discount.hasDiscount && discount.originalPrice != null && (
                    <div className="mt-2">
                        <span className="text-green-400 text-[13px] font-medium">
                            You save ₹{Math.round(discount.originalPrice - discount.displayPrice)}
                        </span>
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="text-[20px] font-semibold text-[#CFCFCF]">
                        Description
                    </h2>
                    <p className="text-[#9E9E9E] text-[16px] leading-[28px] mt-3">
                        {state?.description || 'A classic favorite, our chicken burger features a juicy, grilled or breaded chicken patty served on a soft bun, accompanied by crisp lettuce, ripe tomatoes, sliced onions, and your choice of condiments.'}
                    </p>
                </div>

                {ingredients.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-[20px] font-semibold text-[#CFCFCF]">
                            Ingredients
                        </h2>
                        <p className="text-[#9E9E9E] text-[16px] leading-[28px] mt-3">
                            {ingredients.join(', ')}
                        </p>
                    </div>
                )}

                {/* ── Choice of Add On ── */}
                {addOns.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-[20px] font-semibold text-[#CFCFCF] mb-5">
                            Choice of Add On
                        </h2>

                        <div className="flex flex-col gap-4">
                            {addOns.map((addOn) => {
                                const addOnId = addOn._id || addOn.id;
                                const addOnQty = addOnQuantities[addOnId] || 0;
                                const addOnAvailable = isFoodAvailable(addOn);

                                // Show discount-aware pricing for add-on (like FoodCard)
                                const addOnDiscount = getDiscountDisplayInfo({
                                    price: addOn.price,
                                    priceAfterDiscount: addOn.priceAfterDiscount,
                                    couponData: addOn.couponData,
                                });

                                return (
                                    <div
                                        key={addOnId}
                                        className={`flex items-center justify-between border border-[#3A3A3A] rounded-[16px] px-4 py-3 bg-[#1A1A1A] ${
                                            !addOnAvailable ? 'opacity-50 grayscale' : ''
                                        }`}
                                    >
                                        {/* Left: image + name + price */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {addOn.imageURL ? (
                                                <img
                                                    src={addOn.imageURL}
                                                    alt={addOn.name || addOn.title}
                                                    className="w-[48px] h-[48px] rounded-[12px] object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="w-[48px] h-[48px] rounded-[12px] bg-[#2A2A2A] shrink-0" />
                                            )}

                                            <div className="min-w-0">
                                                <p className="text-white text-[15px] font-medium truncate">
                                                    {addOn.name || addOn.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[#E2B124] text-[15px] font-bold">
                                                        ₹{Math.round(addOnDiscount.displayPrice)}
                                                    </span>
                                                    {addOnDiscount.originalPrice != null && (
                                                        <span className="text-[#6B6B6B] text-[12px] line-through">
                                                            ₹{Math.round(addOnDiscount.originalPrice)}
                                                        </span>
                                                    )}
                                                    {addOnDiscount.isBogo && (
                                                        <span className="bg-[#E2B124]/15 text-[#E2B124] text-[10px] font-bold px-[5px] py-[1px] rounded-[5px]">
                                                            1+1
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Add button or quantity controls */}
                                        {addOnAvailable ? (
                                            addOnQty === 0 ? (
                                                <button
                                                    onClick={() => handleAddOnAdd(addOn)}
                                                    className="border border-[#E2B124] text-[#E2B124] rounded-[12px] px-4 py-[6px] text-[14px] font-medium hover:bg-[#E2B124] hover:text-[#161616] transition shrink-0 ml-3"
                                                >
                                                    Add
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1 border border-[#E2B124] rounded-[12px] overflow-hidden shrink-0 ml-3">
                                                    <button
                                                        onClick={() => handleAddOnDecrement(addOn)}
                                                        className="w-[30px] h-[32px] flex items-center justify-center text-[#E2B124] text-[18px] font-bold hover:bg-[#E2B124]/10 transition"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-[24px] text-center text-[#E2B124] text-[14px] font-semibold">
                                                        {addOnQty}
                                                    </span>
                                                    <button
                                                        onClick={() => handleAddOnIncrement(addOn)}
                                                        className="w-[30px] h-[32px] flex items-center justify-center text-[#E2B124] text-[18px] font-bold hover:bg-[#E2B124]/10 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            <span className="text-[#FF4444] text-[12px] font-medium border border-[#FF4444]/30 rounded-[12px] px-3 py-[5px] shrink-0 ml-3">
                                                Unavailable
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Bar: Main food controls ── */}
            <div className="fixed bottom-0 left-0 w-full bg-[#2B2B2B] px-5 py-5 flex items-center gap-4 z-50">
                <div className="w-[120px] h-[56px] rounded-[20px] border border-[#5A5A5A] flex items-center justify-around">
                    <button
                        onClick={handleDecrement}
                        disabled={!isAvailable}
                        className="text-yellow-400 text-[24px] font-bold w-10 h-full flex items-center justify-center disabled:opacity-30"
                    >
                        −
                    </button>

                    <p className="text-[22px] font-medium">
                        {quantity || (isBogo ? 2 : 1)}
                    </p>

                    <button
                        onClick={quantity > 0 ? handleIncrement : handleAdd}
                        disabled={!isAvailable}
                        className="text-yellow-400 text-[24px] font-bold w-10 h-full flex items-center justify-center disabled:opacity-30"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={handleAddItemsClick}
                    disabled={!isAvailable}
                    className={`flex-1 h-[56px] rounded-[20px] text-[20px] font-semibold transition ${
                        !isAvailable
                            ? 'bg-[#4A4A4A] text-[#888] cursor-not-allowed'
                            : 'bg-yellow-400 text-black active:scale-[0.97]'
                    }`}
                >
                    {!isAvailable
                        ? 'Not Available'
                        : `Add items - ₹ ${Math.round(totalPrice)}`
                    }
                </button>
            </div>
        </div>
    );
}

function isFoodAvailable(food) {
    if (!food) return false;
    if (food.isAvailable === false || food.available === false) return false;
    if (food.status === false) return false;
    if (typeof food.status === 'string' && food.status.toLowerCase() === 'unavailable') return false;
    return true;
}

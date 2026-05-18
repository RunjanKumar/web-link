import { ArrowLeft } from "lucide-react";
import useFoodDetailViewModel from "../../../viewModel/foodDetailViewModel";
import VegIndicator from "./VegIndicator";

export default function FoodDetails() {
    const {
        state,
        selectedAddOns,
        quantity,
        isAvailable,
        itemPrice,
        totalPrice,
        ingredients,
        addOns,
        handleBack,
        handleAdd,
        handleIncrement,
        handleDecrement,
        handleAddItemsClick,
        toggleAddOn,
    } = useFoodDetailViewModel();

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
                        ₹ {Math.round(itemPrice)}
                    </span>

                    {state?.priceAfterDiscount && state.priceAfterDiscount < state.price && (
                        <span className="text-[#6B6B6B] text-[16px] line-through">
                            ₹{Math.round(state.price)}
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

                {addOns.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-[20px] font-semibold text-[#CFCFCF] mb-5">
                            Choice of Add On
                        </h2>

                        <div className="flex flex-col gap-5">
                            {addOns.map((addOn) => {
                                const addOnId = addOn._id || addOn.id;
                                const isSelected = selectedAddOns.has(addOnId);

                                return (
                                    <div
                                        key={addOnId}
                                        onClick={() => toggleAddOn(addOnId)}
                                        className="flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            {addOn.imageURL ? (
                                                <img
                                                    src={addOn.imageURL}
                                                    alt={addOn.name || addOn.title}
                                                    className="w-[48px] h-[48px] rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-[48px] h-[48px] rounded-full bg-[#2A2A2A]" />
                                            )}
                                            <p className="text-white text-[16px]">
                                                {addOn.name || addOn.title}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[#9E9E9E] text-[16px]">
                                                + ₹{addOn.price || 0}
                                            </p>

                                            <div
                                                className={`w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center transition ${
                                                    isSelected
                                                        ? 'border-yellow-400'
                                                        : 'border-[#5A5A5A]'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="w-[14px] h-[14px] bg-yellow-400 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

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
                        {quantity || 1}
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

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobal from "../../../hooks/FoodOrder";
import VegIndicator from "./VegIndicator";

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD DETAILS PAGE (Figma-accurate)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This page does NOT call any API!
 * It receives ALL data from navigation state (passed by FoodCard click).
 *
 * DATA SOURCE: useLocation().state
 *   → Comes from FoodCard: navigate("/food-details", { state: item })
 *   → The `item` was mapped in FoodList from the foodCategory API response
 *
 * API USED (indirectly):
 *   GET /v1/foodCategory?hasFoods=true
 *   Called by: foodService.js → foodViewModel.js → FoodList → FoodCard → here
 *
 * AVAILABLE FIELDS (from state):
 *   id, title, description, price, calories, type,
 *   imageURL, inGridients[], choiceOfAddOn[], isAvailable,
 *   priceAfterDiscount (only from coupon flow)
 */

export default function FoodDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { addToFoodCart, updateFoodCartQuantity, getItemQuantity } = useGlobal();

    // ── DEBUG: Log ALL data received via navigation state ──
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║ [FoodDetails] PAGE OPENED                           ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║ API: NONE (data from navigation state)              ║');
    console.log('║ Source: FoodCard → navigate("/food-details", state)  ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('[FoodDetails] Full state object:', state);
    console.log('[FoodDetails] Field-by-field breakdown:');
    console.log('  id:', state?.id);
    console.log('  title:', state?.title);
    console.log('  price:', state?.price, '← used for display');
    console.log('  priceAfterDiscount:', state?.priceAfterDiscount, '← only set from coupon flow');
    console.log('  calories:', state?.calories, '← mapped from backend kcal field');
    console.log('  type:', state?.type, '(1=veg 🟢, 2=nonveg 🔴)');
    console.log('  description:', state?.description);
    console.log('  imageURL:', state?.imageURL);
    console.log('  isAvailable:', state?.isAvailable);
    console.log('  inGridients:', state?.inGridients, '← array of strings');
    console.log('  choiceOfAddOn:', state?.choiceOfAddOnDetails);
    if (state?.choiceOfAddOn?.length > 0) {
        const first = state.choiceOfAddOn[0];
        console.log('  ★ choiceOfAddOn[0] type:', typeof first);
        if (typeof first === 'string') {
            console.log('  ⚠️ ADD-ONS ARE ObjectID STRINGS — backend needs .populate("choiceOfAddOn")');
            console.log('  The food category API returns IDs only, not full objects.');
        } else if (typeof first === 'object') {
            console.log('  ✅ ADD-ONS ARE POPULATED OBJECTS with fields:', Object.keys(first));
        }
    } else {
        console.log('  ℹ️ No choiceOfAddOn items for this food');
    }

    // Selected add-ons (track by id)
    const [selectedAddOns, setSelectedAddOns] = useState(new Set());

    // Get current quantity from global cart
    const quantity = getItemQuantity(state?.id);
    const isAvailable = state?.isAvailable !== false;

    const handleAdd = () => {
        if (!isAvailable) return;
        console.log('[FoodDetails] Adding to cart:', state?.title);
        addToFoodCart(state);
    };

    const handleIncrement = () => {
        console.log('[FoodDetails] Increment:', state?.title, '→', quantity + 1);
        updateFoodCartQuantity(state?.id, quantity + 1);
    };

    const handleDecrement = () => {
        console.log('[FoodDetails] Decrement:', state?.title, '→', quantity - 1);
        updateFoodCartQuantity(state?.id, quantity - 1);
    };

    const toggleAddOn = (addOnId) => {
        console.log('[FoodDetails] Toggle add-on:', addOnId);
        setSelectedAddOns((prev) => {
            const next = new Set(prev);
            if (next.has(addOnId)) {
                next.delete(addOnId);
            } else {
                next.add(addOnId);
            }
            console.log('[FoodDetails] Selected add-ons:', [...next]);
            return next;
        });
    };

    // ── Price calculation ──
    const itemPrice = state?.priceAfterDiscount ?? state?.price ?? 0;

    // LEARNING: Add-on prices only work if choiceOfAddOn contains
    // populated objects (with .price). If they're just ObjectID strings,
    // this will correctly return 0.
    const addOnTotal = (state?.choiceOfAddOn || [])
        .filter((a) => selectedAddOns.has(a._id || a.id))
        .reduce((sum, a) => sum + (a.price || 0), 0);
    const totalPrice = (itemPrice + addOnTotal) * (quantity || 1);

    console.log('[FoodDetails] Price calculation:');
    console.log('  itemPrice:', itemPrice, '| addOnTotal:', addOnTotal, '| totalPrice:', totalPrice);

    // Ingredients from backend (inGridients array)
    const ingredients = state?.inGridients || [];

    // Add-ons from backend (choiceOfAddOn)
    // LEARNING: These will only render if they're populated objects (not just ID strings)
    const addOns = (state?.choiceOfAddOnDetails || []).filter(
        (a) => typeof a === 'object' && a !== null
    );
    console.log(state?.choiceOfAddOn, "addOns", addOns); 

    console.log('[FoodDetails] Renderable ingredients:', ingredients.length);
    console.log('[FoodDetails] Renderable add-ons (populated objects only):', addOns.length);

    return (
        <div className={`min-h-screen bg-[#111111] text-white pb-[120px] ${!isAvailable ? 'relative' : ''}`}>

            {/* Hero Image */}
            <div className="relative">
                <img
                    src={state?.imageURL || state?.image}
                    alt={state?.title}
                    className={`w-full h-[360px] object-cover ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />

                <button
                    onClick={() => navigate(-1)}
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

            {/* Content */}
            <div className="px-5 pt-4">

                {/* Title + Veg/Non-veg */}
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-[32px] font-semibold leading-[38px]">
                        {state?.title}
                    </h1>
                    <VegIndicator type={state?.type} size={28} />
                </div>

                {/* Price + Kcal row */}
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

                {/* ── Description ── */}
                <div className="mt-8">
                    <h2 className="text-[20px] font-semibold text-[#CFCFCF]">
                        Description
                    </h2>
                    <p className="text-[#9E9E9E] text-[16px] leading-[28px] mt-3">
                        {state?.description || 'A classic favorite, our chicken burger features a juicy, grilled or breaded chicken patty served on a soft bun, accompanied by crisp lettuce, ripe tomatoes, sliced onions, and your choice of condiments.'}
                    </p>
                </div>

                {/* ── Ingredients ── */}
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

            {/* ── Bottom Bar ── */}
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
                    onClick={quantity === 0 ? handleAdd : undefined}
                    disabled={!isAvailable}
                    className={`flex-1 h-[56px] rounded-[20px] text-[20px] font-semibold transition ${
                        !isAvailable
                            ? 'bg-[#4A4A4A] text-[#888] cursor-not-allowed'
                            : 'bg-yellow-400 text-black active:scale-[0.97]'
                    }`}
                >
                    {!isAvailable
                        ? 'Not Available'
                        : quantity > 0
                            ? `Add items - ₹ ${Math.round(totalPrice)}`
                            : `Add items - ₹ ${Math.round(itemPrice)}`
                    }
                </button>
            </div>
        </div>
    );
}
import { useState, useCallback, useRef } from "react";

import CategoryTabs from "./components/categorytabs";
import FoodList from "./components/foodlist";
import Header from "./components/header";
import OfferSlider from "./components/offerSlider";
import SearchBar from "./components/searchbar";
import useFoodViewModel from "../../viewModel/foodViewModel";

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD ORDER PAGE (Layer 3 — UI / View)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is a thin UI layer. It:
 *   1. Calls the ViewModel to get data
 *   2. Manages pure UI state (search, active tab)
 *   3. Passes data down to child components as props
 *   4. NEVER contains business logic or API calls
 *
 * COMPONENT TREE:
 *   FoodOrder
 *   ├── Header
 *   ├── SearchBar
 *   ├── OfferSlider ← receives couponData
 *   │   └── CouponCard (for each coupon)
 *   ├── CategoryTabs ← receives categories + activeIndex
 *   └── FoodList ← receives foodItemData (all categories + foods)
 *       └── FoodCard (for each food item)
 *           └── AddButton (shared cart component)
 */

export default function FoodOrder() {
    // STEP 8: UI component calls the ViewModel hook
    // This is where data flows from ViewModel → UI
    const { foodItemData, couponData, isLoading, error } = useFoodViewModel();

    console.log('[FoodPage] STEP 8: FoodOrder rendered');
    console.log('[FoodPage] Data from ViewModel:');
    console.log('  foodItemData:', foodItemData ? `${foodItemData.length} categories` : 'null (still loading)');
    console.log('  couponData:', couponData ? 'available' : 'null');
    console.log('  isLoading:', isLoading);

    // ── Pure UI state (no business logic) ──
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

    // Ref to FoodList so we can tell it to scroll to a section
    const foodListRef = useRef(null);

    /**
     * LEARNING: User taps a category tab → scroll to that section.
     * This is KFC-style: tab click doesn't filter, it SCROLLS.
     * The FoodList exposes scrollToCategory() via useImperativeHandle.
     */
    const handleCategorySelect = useCallback((index) => {
        console.log('[FoodPage] STEP: Category tab clicked → index:', index);
        console.log('[FoodPage] Calling foodListRef.scrollToCategory() to smooth-scroll to section');
        setActiveCategoryIndex(index);
        foodListRef.current?.scrollToCategory(index);
    }, []);

    /**
     * LEARNING: Scroll detection callback.
     * FoodList uses a scroll event listener to detect which
     * category section is currently at the top of the viewport.
     * It calls this function with the active category index.
     */
    const handleVisibleCategoryChange = useCallback((index) => {
        console.log('[FoodPage] STEP: Scroll detected new visible category → index:', index);
        setActiveCategoryIndex(index);
    }, []);

    return (
        <div className="min-h-screen bg-[#111111] text-white px-5 py-6">

            {/* Header */}
            {!isSearchFocused && <Header />}

            {/* Search Bar */}
            <SearchBar
                searchText={searchText}
                setSearchText={setSearchText}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
            />

            {/* Normal UI */}
            {!isSearchFocused ? (
                <>
                    {/* LEARNING: couponData flows from ViewModel → OfferSlider → CouponCard */}
                    <OfferSlider couponData={couponData} />

                    {/* LEARNING: foodItemData = array of categories, each with foodsInCategories[] */}
                    <CategoryTabs
                        categories={foodItemData}
                        activeIndex={activeCategoryIndex}
                        onCategorySelect={handleCategorySelect}
                    />

                    {/* LEARNING: FoodList receives ALL categories and renders ALL foods.
                        No filtering — KFC-style (all visible, scroll to navigate) */}
                    <FoodList
                        ref={foodListRef}
                        searchText={searchText}
                        foodItemData={foodItemData}
                        onVisibleCategoryChange={handleVisibleCategoryChange}
                    />
                </>
            ) : (
                <div className="mt-8">
                    <h2 className="text-[28px] font-semibold mb-5">
                        Search Results
                    </h2>
                    <FoodList
                        searchText={searchText}
                        foodItemData={foodItemData}
                    />
                </div>
            )}
        </div>
    );
}
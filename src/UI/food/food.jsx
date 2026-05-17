import { useState, useCallback, useRef } from "react";

import CategoryTabs from "./components/categorytabs";
import FoodList from "./components/foodlist";
import Header from "./components/header";
import OfferSlider from "./components/offerSlider";
import SearchBar from "./components/searchbar";
import useFoodViewModel from "../../viewModel/foodViewModel";

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD ORDER PAGE (KFC-style)
 * ══════════════════════════════════════════════════════════════
 *
 * All food items are always visible, grouped by category.
 * - Tab click → smooth scrolls to that category section
 * - Scroll → auto-highlights the visible category tab
 */

export default function FoodOrder() {
    const { foodItemData, couponData, isLoading, error } = useFoodViewModel();

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

    // Ref to FoodList so we can tell it to scroll to a section
    const foodListRef = useRef(null);

    /**
     * User taps a category tab → scroll to that section.
     */
    const handleCategorySelect = useCallback((index) => {
        setActiveCategoryIndex(index);
        // Tell FoodList to scroll to that category section
        foodListRef.current?.scrollToCategory(index);
    }, []);

    /**
     * IntersectionObserver detected a new visible category → update tab.
     */
    const handleVisibleCategoryChange = useCallback((index) => {
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
                    <OfferSlider couponData={couponData} />

                    <CategoryTabs
                        categories={foodItemData}
                        activeIndex={activeCategoryIndex}
                        onCategorySelect={handleCategorySelect}
                    />

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
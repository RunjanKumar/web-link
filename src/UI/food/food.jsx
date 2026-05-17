import { useState } from "react";

import CategoryTabs from "./components/categorytabs";
import FoodList from "./components/foodlist";
import Header from "./components/header";
import OfferSlider from "./components/offerSlider";
import SearchBar from "./components/searchbar";
import useFoodViewModel from "../../viewModel/foodViewModel";

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD ORDER PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * The main Food Order screen — thin UI layer that delegates
 * all business logic to the FoodViewModel (MVVM pattern).
 *
 * Responsibilities:
 *   - Compose child components (Header, SearchBar, OfferSlider, etc.)
 *   - Pass ViewModel data down as props
 *   - Manage only pure UI state (search focus)
 */

export default function FoodOrder() {
    const { foodItemData, couponData, isLoading, error } = useFoodViewModel();

    // ── Pure UI state (not business logic) ──
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

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
                    {/* Special Offers — driven by couponData */}
                    <OfferSlider couponData={couponData} />

                    <CategoryTabs categories={foodItemData} onCategorySelect={handleCategorySelect} />
                    <FoodList searchText={searchText} foodItemData={foodItemData} selectedCategory={selectedCategory} />
                </>
            ) : (
                /* Search Results */
                <div className="mt-8">
                    <h2 className="text-[28px] font-semibold mb-5">
                        Search Results
                    </h2>

                    <FoodList searchText={searchText} foodItemData={foodItemData} selectedCategory={null} />
                </div>
            )}
        </div>
    );
}
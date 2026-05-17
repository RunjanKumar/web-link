import { useState } from "react";

import CategoryTabs from "./components/categorytabs";
import FoodList from "./components/foodlist";
import Header from "./components/header";
import OfferSlider from "./components/offerSlider";
import SearchBar from "./components/searchbar";
import useFoodViewModel from "../../viewModel/foodViewModel";

export default function FoodOrder() {
    const { foodItemData } = useFoodViewModel();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };
    
    console.log('FoodOrder received foodItemData:', foodItemData);
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
                    <OfferSlider />
                    <CategoryTabs categories={foodItemData} onCategorySelect={handleCategorySelect} />
                    <FoodList searchText={searchText} foodItemData={foodItemData} selectedCategory={selectedCategory} />
                </>
            ) : (
                /* Search Results */
                <div className="mt-8">
                    <h2 className="text-[28px] font-semibold mb-5">
                        Search Results
                    </h2>

                    {/* <FoodList searchText={searchText} foodItemData={foodItemData} /> */}
                </div>
            )}
        </div>
    );
}
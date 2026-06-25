import CategoryTabs from "./components/categorytabs";
import FoodList from "./components/foodlist";
import Header from "./components/header";
import OfferSlider from "./components/offerSlider";
import SearchBar from "./components/searchbar";
import FoodCartButton from "./components/FoodCartButton";
import useFoodViewModel from "../../viewModel/foodViewModel";

export default function FoodOrder() {
    const {
        foodItemData,
        couponData,
        isLoading,
        isSearchFocused,
        setIsSearchFocused,
        searchText,
        setSearchText,
        activeCategoryIndex,
        foodListRef,
        handleCategorySelect,
        handleVisibleCategoryChange,
    } = useFoodViewModel();


    return (
        <div className="min-h-screen bg-[#111111] text-white px-5 py-6 pb-[96px]">
            {!isSearchFocused && <Header />}

            <SearchBar
                searchText={searchText}
                setSearchText={setSearchText}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
            />

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
                    <h2 className="text-[22px] font-semibold mb-5">
                        Search Results
                    </h2>
                    <FoodList
                        searchText={searchText}
                        foodItemData={foodItemData}
                    />
                </div>
            )}

            <FoodCartButton />
        </div>
    );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFoodCategories } from '../api/service/foodService';

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD VIEWMODEL (Layer 2 — Business Logic)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: The ViewModel is the "brain" — sits between
 * the API service (data) and the UI (display).
 *
 * RESPONSIBILITIES:
 *   1. Call the API service to fetch data
 *   2. Transform/extract the data the UI needs
 *   3. Manage loading/error states
 *   4. Expose clean data to the UI via return values
 *
 * DATA FLOW:
 *   foodService.getFoodCategories() → response
 *     → extract foods[] from response.data.data
 *     → extract couponData from response.data.couponData
 *     → set state → UI renders
 */

export default function useFoodViewModel() {
    const categories = [];
    const [couponData, setCouponData] = useState(null);
    const [foodItemData, setFoodItemData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const foodListRef = useRef(null);


    // Fetch food categories on mount
    useEffect(() => {
        fetchFoodCategories();
    }, []);

    /**
     * Fetches food categories from the API.
     */
    async function fetchFoodCategories() {
        try {
            setIsLoading(true);
            setError(null);


            const response = await getFoodCategories({
                hasFoods: false,
                excludeCouponAppliedCategories: false,
            });


            const foods = response?.data?.data || [];
            const coupons = response?.data?.couponData;


            // LEARNING: These setState calls trigger a re-render.
            // The UI components (food.jsx) will receive the new data
            // through the return values of this hook.
            setFoodItemData(foods);
            setCouponData(coupons);


        } catch (err) {
            console.error('[FoodVM] ❌ ERROR fetching food categories:', err);
            console.error('[FoodVM] Error message:', err?.response?.data?.message);
            setError(err?.response?.data?.message || 'Failed to load food categories');
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Selects a category.
     */
    function selectCategory(category) {
        setSelectedCategory(category);
    }

    const handleCategorySelect = useCallback((index) => {
        setActiveCategoryIndex(index);
        foodListRef.current?.scrollToCategory(index);
    }, []);

    const handleVisibleCategoryChange = useCallback((index) => {
        setActiveCategoryIndex(index);
    }, []);

    // LEARNING: Everything returned here is what the UI can access.
    // The UI (food.jsx) destructures these values:
    //   const { foodItemData, couponData, isLoading, error } = useFoodViewModel();
    return {
        categories,
        selectedCategory,
        isLoading,
        error,
        selectCategory,
        foodItemData,
        couponData,
        isSearchFocused,
        setIsSearchFocused,
        searchText,
        setSearchText,
        activeCategoryIndex,
        foodListRef,
        handleCategorySelect,
        handleVisibleCategoryChange,
        refetch: fetchFoodCategories,
    };
}

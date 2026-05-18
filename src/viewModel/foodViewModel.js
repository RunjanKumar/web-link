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

    console.log('[FoodVM] ViewModel initialized. isLoading:', isLoading);

    // Fetch food categories on mount
    useEffect(() => {
        console.log('[FoodVM] STEP 3: useEffect triggered → calling fetchFoodCategories()');
        fetchFoodCategories();
    }, []);

    /**
     * Fetches food categories from the API.
     */
    async function fetchFoodCategories() {
        try {
            setIsLoading(true);
            setError(null);

            console.log('[FoodVM] STEP 4: Calling foodService.getFoodCategories()...');

            const response = await getFoodCategories({
                hasFoods: false,
                excludeCouponAppliedCategories: false,
            });

            console.log('[FoodVM] STEP 5: API response received in ViewModel');
            console.log('[FoodVM] Response structure: response.data =', response?.data);

            const foods = response?.data?.data || [];
            const coupons = response?.data?.couponData;

            console.log('[FoodVM] STEP 6: Extracted data');
            console.log(`  foodItemData: ${foods.length} categories`);
            console.log(`  couponData: ${coupons ? (Array.isArray(coupons) ? coupons.length + ' coupons' : 'object') : 'none'}`);

            // LEARNING: These setState calls trigger a re-render.
            // The UI components (food.jsx) will receive the new data
            // through the return values of this hook.
            setFoodItemData(foods);
            setCouponData(coupons);

            console.log('[FoodVM] STEP 7: State updated → UI will re-render with new data');

        } catch (err) {
            console.error('[FoodVM] ❌ ERROR fetching food categories:', err);
            console.error('[FoodVM] Error message:', err?.response?.data?.message);
            setError(err?.response?.data?.message || 'Failed to load food categories');
        } finally {
            setIsLoading(false);
            console.log('[FoodVM] Loading complete. isLoading set to false.');
        }
    }

    /**
     * Selects a category.
     */
    function selectCategory(category) {
        console.log('[FoodVM] Category selected:', category?.name);
        setSelectedCategory(category);
    }

    const handleCategorySelect = useCallback((index) => {
        console.log('[FoodPage] STEP: Category tab clicked â†’ index:', index);
        console.log('[FoodPage] Calling foodListRef.scrollToCategory() to smooth-scroll to section');
        setActiveCategoryIndex(index);
        foodListRef.current?.scrollToCategory(index);
    }, []);

    const handleVisibleCategoryChange = useCallback((index) => {
        console.log('[FoodPage] STEP: Scroll detected new visible category â†’ index:', index);
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

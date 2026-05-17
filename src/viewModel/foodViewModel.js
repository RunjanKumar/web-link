import { useState, useEffect } from 'react';
import { getFoodCategories } from '../api/service/foodService';

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * The "brain" of the food feature — manages state and API calls
 * for fetching food categories and handling food-related logic.
 */

export default function useFoodViewModel() {
    const [categories, setCategories] = useState([]);
    const [couponData, setCouponData] = useState(null);
    const [foodItemData,setFoodItemData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

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

        setFoodItemData(foods);

        // if (foods.length > 0) {
        //     setSelectedCategory(foods[0]);
        // }

    } catch (err) {
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

    return {
        categories,
        selectedCategory,
        isLoading,
        error,
        selectCategory,
        foodItemData,
        refetch: fetchFoodCategories,
    };
}

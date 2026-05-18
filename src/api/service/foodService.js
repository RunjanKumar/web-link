import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD API SERVICE (Layer 1 — API Communication)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is the lowest layer in MVVM.
 * It ONLY talks to the backend API — no business logic here.
 *
 * DATA FLOW:
 *   foodService.js → foodViewModel.js → food.jsx → child components
 *
 * ENDPOINTS USED:
 *   GET  /v1/foodCategory — Fetch all categories + foods + coupons
 *   GET  /v1/food/menu    — Fetch food menu
 *   POST /v1/food/order   — Create a food order
 */

/**
 * Fetches all food categories with their foods.
 * GET /v1/foodCategory?hasFoods=true&excludeCouponAppliedCategories=false
 */
export async function getFoodCategories(params = {}) {
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ [FoodService] STEP 1: Calling GET /v1/foodCategory  │');
    console.log('└─────────────────────────────────────────────────────┘');

    const queryParams = {
        hasFoods: true,
        excludeCouponAppliedCategories: params.excludeCouponAppliedCategories ?? false,
    };

    console.log('[FoodService] Query params being sent:', queryParams);
    console.log('[FoodService] Full URL:', ENDPOINTS.FOOD_CATEGORY, '?', new URLSearchParams(queryParams).toString());

    const response = await apiClient.get(ENDPOINTS.FOOD_CATEGORY, {
        params: queryParams,
    });

    console.log('[FoodService] STEP 2: Raw API response received', response.data);
    console.log('[FoodService] Response status:', response.status);
    console.log('[FoodService] Response structure: response.data =', Object.keys(response.data || {}));
    console.log('[FoodService] response.data.data keys:', Object.keys(response.data?.data || {}));

    // Log food data summary
    const foods = response.data?.data?.data || [];
    console.log(`[FoodService] Total categories received: ${foods.length}`);
    foods.forEach((cat, i) => {
        console.log(`  Category ${i}: "${cat.name}" → ${(cat.foodsInCategories || []).length} foods`);
    });

    // Log coupon data summary
    const coupons = response.data?.data?.couponData;
    console.log(`[FoodService] Coupon data received: ${coupons ? (Array.isArray(coupons) ? coupons.length + ' coupons' : 'object') : 'none'}`);

    // Log first food item to see ALL fields from backend
    if (foods[0]?.foodsInCategories?.[0]) {
        const sampleFood = foods[0].foodsInCategories[0];
        console.log('[FoodService] ★ SAMPLE: First food item from API (ALL fields):');
        console.log('  _id:', sampleFood._id);
        console.log('  name:', sampleFood.name);
        console.log('  price:', sampleFood.price);
        console.log('  kcal:', sampleFood.kcal);
        console.log('  type:', sampleFood.type, '(1=veg, 2=nonveg)');
        console.log('  description:', sampleFood.description);
        console.log('  imageURL:', sampleFood.imageURL);
        console.log('  inGridients:', sampleFood.inGridients);
        console.log('  choiceOfAddOn:', sampleFood.choiceOfAddOn);
        console.log('  isAvailable:', sampleFood.isAvailable);
        console.log('  mealType:', sampleFood.mealType);
        console.log('  couponId:', sampleFood.couponId);
        console.log('  Full object:', sampleFood);
    }

    return response.data;
}

/**
 * Fetches the food menu.
 * GET /v1/food/menu
 */
export async function getFoodMenu() {
    console.log('[FoodService] Calling GET /v1/food/menu');
    const response = await apiClient.get(ENDPOINTS.FOOD_MENU);
    console.log('[FoodService] Menu response:', response.data);
    return response.data;
}

/**
 * Creates a new food order.
 * POST /v1/food/order
 */
export async function createFoodOrder(orderData) {
    console.log('[FoodService] Calling POST /v1/food/order');
    console.log('[FoodService] Order payload:', orderData);
    const response = await apiClient.post(ENDPOINTS.FOOD_ORDER, orderData);
    console.log('[FoodService] Order response:', response.data);
    return response.data;
}

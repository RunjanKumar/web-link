import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * Fetches all food categories with their foods.
 * GET /v1/foodCategory?hasFoods=false&excludeCouponAppliedCategories=false
 * Authorization: Bearer <token>
 *
 * @param {Object} params - Query parameters
 * @param {boolean} params.hasFoods - Whether to include foods (default: false)
 * @param {boolean} params.excludeCouponAppliedCategories - Whether to exclude coupon applied categories (default: false)
 * @returns {Promise<Object>} The food categories data from the backend.
 */
export async function getFoodCategories(params = {}) {
    const queryParams = {
        hasFoods: true ,
        excludeCouponAppliedCategories: params.excludeCouponAppliedCategories ?? false,
    };
    
    const response = await apiClient.get(ENDPOINTS.FOOD_CATEGORY, {
        params: queryParams,
    });
    return response.data;
}

/**
 * Fetches the food menu.
 * GET /v1/food/menu
 * Authorization: Bearer <token>
 *
 * @returns {Promise<Object>} The food menu data from the backend.
 */
export async function getFoodMenu() {
    const response = await apiClient.get(ENDPOINTS.FOOD_MENU);
    return response.data;
}

/**
 * Creates a new food order.
 * POST /v1/food/order
 * Authorization: Bearer <token>
 *
 * @param {Object} orderData - The order data
 * @returns {Promise<Object>} The created order response.
 */
export async function createFoodOrder(orderData) {
    const response = await apiClient.post(ENDPOINTS.FOOD_ORDER, orderData);
    return response.data;
}

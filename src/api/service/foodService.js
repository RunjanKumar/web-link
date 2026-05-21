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

    const queryParams = {
        hasFoods: true,
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
 */
export async function getFoodMenu() {
    const response = await apiClient.get(ENDPOINTS.FOOD_MENU);
    return response.data;
}

/**
 * Fetches food order history.
 * GET /v1/foodOrder
 */
export async function getFoodOrders() {
    const response = await apiClient.get(ENDPOINTS.FOOD_ORDER);
    return response.data;
}

/**
 * Creates a new food order.
 * POST /v1/foodOrder
 */
export async function createFoodOrder(orderData) {
    const response = await apiClient.post(ENDPOINTS.FOOD_ORDER, orderData);
    return response.data;
}

/**
 * Initiates online payment for an existing food order.
 * POST /v1/foodOrder/initiatePayment
 *
 * @param {{ foodOrderId: string }} data
 * @returns {{ razorpayOrderId, amount, razorpayKey, currency }}
 */
export async function initiatePayment(data) {
    const response = await apiClient.post(ENDPOINTS.INITIATE_PAYMENT, data);
    return response.data;
}

/**
 * Verifies Razorpay payment after customer completes checkout.
 * POST /v1/foodOrder/verifyPayment
 *
 * @param {{ foodOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }} data
 * @returns {{ message: string }}
 */
export async function verifyPayment(data) {
    const response = await apiClient.post(ENDPOINTS.VERIFY_PAYMENT, data);
    return response.data;
}

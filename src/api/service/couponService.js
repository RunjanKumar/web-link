import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON API SERVICE
 * ══════════════════════════════════════════════════════════════
 *
 * Handles all coupon-related API calls.
 */

/**
 * Fetches a single coupon's full details (including applicable food items
 * with discounted prices) from the backend.
 *
 * GET /v1/coupon?couponId=<id>
 *
 * @param {string} couponId - The _id of the coupon to fetch.
 * @returns {Promise<Object>} The coupon detail response.
 */
export async function getCouponById(couponId) {
    const response = await apiClient.get(ENDPOINTS.COUPON, {
        params: { couponId },
    });
    return response.data;
}

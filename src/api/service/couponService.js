import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON API SERVICE
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: Separate service for coupon-specific API calls.
 * The food categories API returns coupons in the list,
 * but to get FULL coupon details (with discounted food items),
 * we need this dedicated endpoint.
 *
 * ENDPOINT: GET /v1/coupon?couponId=<id>
 * RETURNS: Coupon details + applicableItemsData (foods with discounted prices)
 */

export async function getCouponById(couponId) {

    const response = await apiClient.get(ENDPOINTS.COUPON, {
        params: { couponId },
    });


    

    return response.data;
}

/**
 * Validate coupon against cart items.
 * Payload: { foodItems: [{ foodId, quantity }], couponCode: "SAVE20" }
 * Response: { data: { items: [...], summary: { totalDiscount, finalPayableAmount, ... } } }
 */
export async function validateCoupon(payload) {

    const response = await apiClient.post(ENDPOINTS.COUPON_VALIDATE, payload);

    return response.data;
}

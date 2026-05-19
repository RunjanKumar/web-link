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
    console.log('┌────────────────────────────────────────────────────┐');
    console.log('│ [CouponService] Calling GET /v1/coupon             │');
    console.log('└────────────────────────────────────────────────────┘');
    console.log('[CouponService] couponId:', couponId);

    const response = await apiClient.get(ENDPOINTS.COUPON, {
        params: { couponId },
    });

    console.log('[CouponService] Response received:');
    console.log('[CouponService] Response structure:', Object.keys(response.data || {}));
    console.log('[CouponService] response.data.data:', response.data?.data);

    // Log the coupon detail
    const couponData = response.data?.data?.couponData;
    if (Array.isArray(couponData) && couponData[0]) {
        const coupon = couponData[0];
        console.log('[CouponService] ★ Coupon details:');
        console.log('  name:', coupon.name);
        console.log('  discountType:', coupon.discountType);
        console.log('  discountValue:', coupon.discountValue);
        console.log('  image:', coupon.image);
        console.log('  applicableItemsData:', coupon.applicableItemsData?.length, 'food items');
        if (coupon.applicableItemsData?.[0]) {
            console.log('  ★ First food item in coupon:');
            console.log('    name:', coupon.applicableItemsData[0].name);
            console.log('    price:', coupon.applicableItemsData[0].price);
            console.log('    priceAfterDiscount:', coupon.applicableItemsData[0].priceAfterDiscount);
            console.log('    discountAmount:', coupon.applicableItemsData[0].discountAmount);
        }
    }

    return response.data;
}

export async function validateCoupon(payload) {
    console.log('[CouponService] Calling POST /v1/coupon/validate');
    console.log('[CouponService] Validate payload:', payload);

    const response = await apiClient.post(ENDPOINTS.COUPON_VALIDATE, payload);

    console.log('[CouponService] Validate response:', response.data);
    return response.data;
}

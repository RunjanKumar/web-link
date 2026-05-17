import { useState, useEffect, useMemo } from 'react';
import { getCouponById } from '../api/service/couponService';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON DETAIL VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * The "brain" of the Coupon Detail page — fetches full coupon
 * data (with applicable food items + discounted prices) from
 * the API, and exposes presentation-ready data to the UI.
 *
 * @param {string} couponId - The _id of the coupon to fetch.
 * @param {Object} initialCoupon - Initial coupon data passed via navigation state
 *                                  (from the slider's couponData) to show immediately.
 */

export default function useCouponDetailViewModel(couponId, initialCoupon = null) {
    const [couponDetail, setCouponDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch full coupon detail from API on mount
    useEffect(() => {
        if (couponId) {
            fetchCouponDetail(couponId);
        }
    }, [couponId]);

    /**
     * Fetches coupon detail from GET /v1/coupon?couponId=<id>
     */
    async function fetchCouponDetail(id) {
        try {
            setIsLoading(true);
            setError(null);

            console.log('[CouponDetailVM] Fetching coupon detail for:', id);
            const response = await getCouponById(id);

            // Backend returns: { data: { couponData: [...], totalCount } }
            const couponData = response?.data?.couponData;
            const coupon = Array.isArray(couponData) ? couponData[0] : couponData;

            console.log('[CouponDetailVM] Coupon detail received:', coupon);
            setCouponDetail(coupon);
        } catch (err) {
            console.error('[CouponDetailVM] Error fetching coupon:', err);
            setError(err?.response?.data?.message || 'Failed to load coupon details');
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * The coupon's hero image URL — from API data or initial navigation state.
     */
    const heroImage = couponDetail?.image
        || initialCoupon?.imageURL
        || initialCoupon?.image
        || null;

    /**
     * The coupon's offer name/title.
     */
    const offerName = couponDetail?.name
        || couponDetail?.title
        || initialCoupon?.title
        || 'Offer';

    /**
     * The coupon's description.
     */
    const description = couponDetail?.description
        || initialCoupon?.description
        || '';

    /**
     * Discount info for display.
     */
    const discountInfo = useMemo(() => {
        const detail = couponDetail || {};
        const value = detail.discountValue || initialCoupon?.discountValue || 0;
        const type = detail.discountType ?? initialCoupon?.discountType;

        // discountType from backend: 1 = percentage, 2 = amount
        if (type === 1 || type === 'percentage') {
            return { label: `UPTO ${value}% CASHBACK`, value, type: 'percentage' };
        }
        if (type === 2 || type === 'amount') {
            return { label: `FLAT ₹${value} OFF`, value, type: 'amount' };
        }
        return { label: `${value}% OFF`, value, type: 'unknown' };
    }, [couponDetail, initialCoupon]);

    /**
     * Food items with discount pricing — comes from the backend's
     * $lookup aggregation as `applicableItemsData`.
     * Each food has: _id, name, price, priceAfterDiscount, discountAmount, imageURL, etc.
     */
    const foodItems = useMemo(() => {
        const items = couponDetail?.applicableItemsData || [];

        return items.map((food) => ({
            id: food._id || food.id,
            title: food.name || food.title,
            description: food.description || '',
            price: food.price || 0,
            priceAfterDiscount: food.priceAfterDiscount ?? food.price ?? 0,
            discountAmount: food.discountAmount || 0,
            calories: food.calories || 0,
            imageURL: food.imageURL || food.image || null,
            isAvailable: food.isAvailable !== false,
            type: food.type || null,  // 1 = veg, 2 = non-veg
        }));
    }, [couponDetail]);

    return {
        // State
        couponDetail,
        isLoading,
        error,

        // Presentation-ready data
        heroImage,
        offerName,
        description,
        discountInfo,
        foodItems,

        // Actions
        refetch: () => fetchCouponDetail(couponId),
    };
}

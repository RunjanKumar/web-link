import { useState, useEffect, useMemo } from 'react';
import { getCouponById } from '../api/service/couponService';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON DETAIL VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: Same MVVM pattern as FoodViewModel but for coupons.
 *
 * DATA FLOW:
 *   User clicks CouponCard → navigate('/coupon-detail', { state: coupon })
 *   → CouponDetail page opens
 *   → This ViewModel fetches GET /v1/coupon?couponId=<id>
 *   → Transforms data → UI renders food items with discounted prices
 *
 * @param {string} couponId — The _id of the coupon
 * @param {Object} initialCoupon — Initial data from navigation state (for instant display)
 */

export default function useCouponDetailViewModel(couponId, initialCoupon = null) {
    const [couponDetail, setCouponDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('[CouponDetailVM] ViewModel initialized');
    console.log('[CouponDetailVM] couponId:', couponId);
    console.log('[CouponDetailVM] initialCoupon (from nav state):', initialCoupon);

    // Fetch full coupon detail from API on mount
    useEffect(() => {
        if (couponId) {
            console.log('[CouponDetailVM] useEffect → fetching coupon detail...');
            fetchCouponDetail(couponId);
        }
    }, [couponId]);

    async function fetchCouponDetail(id) {
        try {
            setIsLoading(true);
            setError(null);

            console.log('[CouponDetailVM] Calling couponService.getCouponById:', id);
            const response = await getCouponById(id);

            const couponData = response?.data?.couponData;
            const coupon = Array.isArray(couponData) ? couponData[0] : couponData;

            console.log('[CouponDetailVM] Coupon detail received:');
            console.log('  name:', coupon?.name);
            console.log('  applicableItemsData:', coupon?.applicableItemsData?.length, 'items');
            console.log('  Full coupon:', coupon);

            setCouponDetail(coupon);
        } catch (err) {
            console.error('[CouponDetailVM] ❌ Error:', err);
            setError(err?.response?.data?.message || 'Failed to load coupon details');
        } finally {
            setIsLoading(false);
        }
    }

    const heroImage = couponDetail?.image || initialCoupon?.imageURL || initialCoupon?.image || null;
    const offerName = couponDetail?.name || couponDetail?.title || initialCoupon?.title || 'Offer';
    const description = couponDetail?.description || initialCoupon?.description || '';

    const discountInfo = useMemo(() => {
        const detail = couponDetail || {};
        const value = detail.discountValue || initialCoupon?.discountValue || 0;
        const type = detail.discountType ?? initialCoupon?.discountType;

        if (type === 1 || type === 'percentage') {
            return { label: `UPTO ${value}% CASHBACK`, value, type: 'percentage' };
        }
        if (type === 2 || type === 'amount') {
            return { label: `FLAT ₹${value} OFF`, value, type: 'amount' };
        }
        return { label: `${value}% OFF`, value, type: 'unknown' };
    }, [couponDetail, initialCoupon]);

    /**
     * LEARNING: Map food items from the coupon response.
     * The backend aggregates food items with calculated discount prices:
     *   - price: original price
     *   - priceAfterDiscount: price after coupon discount
     *   - discountAmount: how much discount was applied
     */
    const foodItems = useMemo(() => {
        const items = couponDetail?.applicableItemsData || [];

        console.log('[CouponDetailVM] Mapping', items.length, 'food items');

        if (items[0]) {
            console.log('[CouponDetailVM] ★ First raw coupon food item:');
            console.log('  All fields:', items[0]);
            console.log('  choiceOfAddOn:', items[0].choiceOfAddOn);
            console.log('  inGridients:', items[0].inGridients);
        }

        return items.map((food) => ({
            id: food._id || food.id,
            title: food.name || food.title,
            description: food.description || '',
            price: food.price || 0,
            priceAfterDiscount: food.priceAfterDiscount ?? food.price ?? 0,
            discountAmount: food.discountAmount || 0,
            calories: food.kcal || food.calories || 0,
            imageURL: food.imageURL || food.image || null,
            isAvailable: food.isAvailable !== false,
            type: food.type || null,
            inGridients: food.inGridients || [],
            choiceOfAddOn: food.choiceOfAddOn || [],
        }));
    }, [couponDetail]);

    return {
        couponDetail,
        isLoading,
        error,
        heroImage,
        offerName,
        description,
        discountInfo,
        foodItems,
        refetch: () => fetchCouponDetail(couponId),
    };
}

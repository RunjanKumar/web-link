import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const { state } = useLocation();
    const routeCoupon = useMemo(() => initialCoupon || state || {}, [initialCoupon, state]);
    const resolvedCouponId = couponId || routeCoupon.id || routeCoupon._id;
    const [couponDetail, setCouponDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    // Fetch full coupon detail from API on mount
    useEffect(() => {
        if (resolvedCouponId) {
            fetchCouponDetail(resolvedCouponId);
        }
    }, [resolvedCouponId]);

    async function fetchCouponDetail(id) {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getCouponById(id);

            const couponData = response?.data?.couponData;
            const coupon = Array.isArray(couponData) ? couponData[0] : couponData;


            setCouponDetail(coupon);
        } catch (err) {
            console.error('[CouponDetailVM] ❌ Error:', err);
            setError(err?.response?.data?.message || 'Failed to load coupon details');
        } finally {
            setIsLoading(false);
        }
    }

    const heroImage = couponDetail?.image || routeCoupon?.imageURL || routeCoupon?.image || null;
    const offerName = couponDetail?.name || couponDetail?.title || routeCoupon?.title || 'Offer';
    const description = couponDetail?.description || routeCoupon?.description || '';

    const discountInfo = useMemo(() => {
        const detail = couponDetail || {};
        const value = detail.discountValue || routeCoupon?.discountValue || 0;
        const type = detail.discountType ?? routeCoupon?.discountType;

        if (type === 1 || type === 'percentage') {
            return { label: `UPTO ${value}% CASHBACK`, value, type: 'percentage' };
        }
        if (type === 2 || type === 'amount') {
            return { label: `FLAT ₹${value} OFF`, value, type: 'amount' };
        }
        if (type === 3 || type === 'bogo') {
            return { label: `1 + 1 FREE`, value, type: 'amount' };
        }
        return { label: `${value}% OFF`, value, type: 'unknown' };
    }, [couponDetail, routeCoupon]);

    /**
     * LEARNING: Map food items from the coupon response.
     * The backend aggregates food items with calculated discount prices:
     *   - price: original price
     *   - priceAfterDiscount: price after coupon discount
     *   - discountAmount: how much discount was applied
     */
    const foodItems = useMemo(() => {
        const items = couponDetail?.applicableItemsData || [];


        if (items[0]) {
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
        handleBack: () => navigate(-1),
        refetch: () => fetchCouponDetail(resolvedCouponId),
    };
}

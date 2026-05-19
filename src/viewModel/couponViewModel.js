import { useState, useMemo } from 'react';
import { DISCOUNT_TYPES } from '../utils/constant';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * The "brain" of the coupon/offer feature — manages coupon state,
 * formatting, and scroll logic for the Special Offers slider.
 *
 * Receives raw couponData from parent (foodViewModel provides it),
 * then exposes presentation-ready data to the UI components.
 */

export default function useCouponViewModel(rawCouponData) {
    const [activeIndex, setActiveIndex] = useState(0);

    /**
     * Transforms raw API coupon data into presentation-ready format.
     * Each coupon card needs: id, title, subtitle, discount text,
     * background gradient colors, and an image URL.
     */
    const coupons = useMemo(() => {
        if (!rawCouponData || !Array.isArray(rawCouponData)) {
            console.log('[CouponVM] No coupon data available');
            return [];
        }

        console.log('[CouponVM] Transforming coupon data:', rawCouponData, 'coupons');

        return rawCouponData.map((coupon, index) => {
            // Build the headline text from coupon fields
            const discountText = buildDiscountText(coupon);
            const subtitle = coupon.applicableCategory?.name
                || coupon.categoryName
                || coupon.subtitle
                || '';

            return {
                id: coupon._id || coupon.id || `coupon-${index}`,
                code: coupon.couponCode || coupon.code || '',
                title: coupon.title || coupon.name || discountText,
                subtitle: subtitle,
                discountText: discountText,
                description: coupon.description || '',
                discountType: coupon.discountType || 'percentage',
                discountValue: coupon.discountValue || coupon.discount || 0,
                minOrderAmount: coupon.minOrderAmount || 0,
                maxDiscount: coupon.maxDiscount || 0,
                imageURL: coupon.imageURL
                    || coupon.image
                    || coupon.applicableCategory?.imageURL
                    || null,
                // Assign gradient colors in a rotating pattern
                gradient: COUPON_GRADIENTS[index % COUPON_GRADIENTS.length],
                isActive: coupon.isActive !== false,
            };
        });
    }, [rawCouponData]);

    /**
     * Total number of coupon cards (used by dot indicators).
     */
    const totalCoupons = coupons.length;

    /**
     * Navigate to next coupon in the slider.
     */
    function goToNext() {
        if (totalCoupons === 0) return;
        setActiveIndex((prev) => (prev + 1) % totalCoupons);
    }

    /**
     * Navigate to previous coupon in the slider.
     */
    function goToPrev() {
        if (totalCoupons === 0) return;
        setActiveIndex((prev) => (prev - 1 + totalCoupons) % totalCoupons);
    }

    /**
     * Jump to a specific coupon index.
     */
    function goToIndex(index) {
        if (index >= 0 && index < totalCoupons) {
            setActiveIndex(index);
        }
    }

    return {
        coupons,
        activeIndex,
        totalCoupons,
        goToNext,
        goToPrev,
        goToIndex,
    };
}

// ── Helper: build human-readable discount text ──────────────
function buildDiscountText(coupon) {
      console.log("name--------+++++++++", coupon);
    const value = coupon.discountValue;
    const type = coupon.discountType;

    if (type === DISCOUNT_TYPES.PERCENTAGE) {
        return `UPTO ${value}% CASHBACK`;
    }
    if (type === DISCOUNT_TYPES.AMOUNT) {
        return `FLAT ₹${value} OFF`;
    }

    if (type === DISCOUNT_TYPES.BOGO) {
        return `1 + 1 FREE`;
    }
    return coupon.title || coupon.name || `${value}% OFF`;
}

// ── Gradient palette for coupon cards ───────────────────────
const COUPON_GRADIENTS = [
    { from: '#1A6B8A', to: '#0D3F52' },   // Teal blue
    { from: '#C0392B', to: '#7B241C' },   // Deep red
    { from: '#8E44AD', to: '#5B2C6F' },   // Purple
    { from: '#D4A017', to: '#8B6914' },   // Gold
    { from: '#1E8449', to: '#145A32' },   // Emerald
    { from: '#2874A6', to: '#1A5276' },   // Royal blue
];

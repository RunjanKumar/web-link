import { DISCOUNT_TYPES } from './constant';

/**
 * ══════════════════════════════════════════════════════════════
 * DISCOUNT HELPER — Shared discount display logic
 * ══════════════════════════════════════════════════════════════
 *
 * Centralizes discount type behavior so FoodCard, FoodDetail,
 * and Cart all display prices consistently.
 *
 * DISCOUNT_TYPES:
 *   1 (PERCENTAGE) → Show priceAfterDiscount, strike original price
 *   2 (AMOUNT)     → Show price as-is (discount already applied)
 *   3 (BOGO)       → Show price + "1+1 FREE" badge
 */

/**
 * Returns display info for a food item based on its discount type.
 *
 * @param {object} params
 * @param {number} params.price          – Original price
 * @param {number} params.priceAfterDiscount – Price after coupon discount
 * @param {object} params.couponData     – Coupon data with discountType key
 * @returns {{ displayPrice: number, originalPrice: number|null, isBogo: boolean, hasDiscount: boolean, discountType: number|null }}
 */
export function getDiscountDisplayInfo({ price = 0, priceAfterDiscount, couponData }) {
    const discountType = couponData?.discountType ?? null;

    // Default: no discount
    const result = {
        displayPrice: price,
        originalPrice: null,
        isBogo: false,
        hasDiscount: false,
        discountType,
    };

    if (!discountType) return result;

    switch (discountType) {
        case DISCOUNT_TYPES.PERCENTAGE:
            // Show the discounted price, strike original
            result.displayPrice = priceAfterDiscount ?? price;
            if (priceAfterDiscount != null && priceAfterDiscount < price) {
                result.originalPrice = price;
                result.hasDiscount = true;
            }
            break;

        case DISCOUNT_TYPES.AMOUNT:
            // Show price as-is — no visual change
            result.displayPrice = price;
            break;

        case DISCOUNT_TYPES.BOGO:
            // Show price + "1+1 FREE" badge
            result.displayPrice = price;
            result.isBogo = true;
            result.hasDiscount = true;
            break;

        default:
            break;
    }

    return result;
}

/**
 * Returns the effective price to use for cart calculations.
 * For PERCENTAGE → priceAfterDiscount
 * For AMOUNT / BOGO → original price
 */
export function getEffectivePrice({ price = 0, priceAfterDiscount, couponData }) {
    const discountType = couponData?.discountType ?? null;

    if (discountType === DISCOUNT_TYPES.PERCENTAGE && priceAfterDiscount != null) {
        return priceAfterDiscount;
    }

    return price;
}

/**
 * Returns line total for a cart item, applying BOGO pricing.
 *
 * BOGO: every 2nd item is free → you only pay for ceil(qty / 2).
 *   qty 1 → pay 1 → ₹150
 *   qty 2 → pay 1 → ₹150  (1 free)
 *   qty 3 → pay 2 → ₹300
 *   qty 4 → pay 2 → ₹300  (2 free)
 *
 * For non-BOGO items: normal price × quantity.
 */
export function getLineTotal({ unitPrice, quantity, couponData }) {
    const discountType = couponData?.discountType ?? null;

    if (discountType === DISCOUNT_TYPES.BOGO) {
        const paidQty = Math.ceil(quantity / 2);
        return unitPrice * paidQty;
    }

    return unitPrice * quantity;
}

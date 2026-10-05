import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * DUKAAN API SERVICE (Layer 1 — API Communication)
 * ══════════════════════════════════════════════════════════════
 *
 * DATA FLOW:
 *   dukaanService.js → dukaan*ViewModel.js → UI/dukaan/*.jsx → components
 *
 * ENDPOINTS USED (guest-scoped; the backend resolves the hotel + stay from the
 * token, so a tampered hotelId cannot reach another property's shop):
 *   GET   /v1/dukaan/guest/category              — category chips
 *   GET   /v1/dukaan/guest/product               — browse + search + filter + sort
 *   GET   /v1/dukaan/guest/product/:id           — detail + related
 *   POST  /v1/dukaan/guest/order                 — place an order
 *   GET   /v1/dukaan/guest/order                 — my orders
 *   GET   /v1/dukaan/guest/order/:id             — track one order
 *   PATCH /v1/dukaan/guest/order/:id/cancel      — cancel (before the shop accepts)
 *   POST  /v1/dukaan/guest/order/:id/pay         — start Razorpay checkout
 *   POST  /v1/dukaan/guest/order/:id/verify      — confirm the payment
 *   POST  /v1/dukaan/guest/order/:id/review      — rate a delivered product
 */

/** Shop categories (empty ones are omitted by the server). */
export async function getDukaanCategories(hotelId) {
    const response = await apiClient.get(ENDPOINTS.DUKAAN_CATEGORY, {
        params: { hotelId },
    });
    return response.data;
}

/**
 * Browse the shop.
 * @param {{ hotelId, search, categoryId, minPrice, maxPrice, inStockOnly, minRating, sort, skip, limit }} params
 */
export async function getDukaanProducts(params) {
    const response = await apiClient.get(ENDPOINTS.DUKAAN_PRODUCT, { params });
    return response.data;
}

/** One product plus "you may also like" from the same category. */
export async function getDukaanProduct(productId, hotelId) {
    const response = await apiClient.get(
        `${ENDPOINTS.DUKAAN_PRODUCT}/${productId}`,
        { params: { hotelId } },
    );
    return response.data;
}

/**
 * Place an order. Only productId + qty are sent — every price is resolved
 * server-side from the catalogue, so the client cannot influence the total.
 * @param {{ hotelId, items: Array<{productId, qty}>, paymentMode, deliverTo, deliveryNote, notes }} orderData
 */
export async function createDukaanOrder(orderData) {
    const response = await apiClient.post(ENDPOINTS.DUKAAN_ORDER, orderData);
    return response.data;
}

/** The guest's own orders. */
export async function getMyDukaanOrders(hotelId) {
    const response = await apiClient.get(ENDPOINTS.DUKAAN_ORDER, {
        params: { hotelId, limit: 50 },
    });
    return response.data;
}

/** Track one order. */
export async function getMyDukaanOrder(orderId, hotelId) {
    const response = await apiClient.get(
        `${ENDPOINTS.DUKAAN_ORDER}/${orderId}`,
        { params: { hotelId } },
    );
    return response.data;
}

/** Cancel — allowed only while the shop has not accepted the order yet. */
export async function cancelDukaanOrder(orderId, hotelId, reason) {
    const response = await apiClient.patch(
        `${ENDPOINTS.DUKAAN_ORDER}/${orderId}/cancel`,
        { hotelId, reason },
    );
    return response.data;
}

/**
 * Start Razorpay checkout for an unpaid order. Idempotent — calling it twice
 * returns the same Razorpay order, so retrying after closing the sheet is safe.
 */
export async function initiateDukaanPayment(orderId, hotelId) {
    const response = await apiClient.post(
        `${ENDPOINTS.DUKAAN_ORDER}/${orderId}/pay`,
        { hotelId },
    );
    return response.data;
}

/** Verify the payment. The server HMAC-checks the signature before trusting it. */
export async function verifyDukaanPayment(orderId, payload) {
    const response = await apiClient.post(
        `${ENDPOINTS.DUKAAN_ORDER}/${orderId}/verify`,
        payload,
    );
    return response.data;
}

/**
 * Preview an offer code against the basket. The discount returned is advisory —
 * placing the order resolves it again server-side, so the two can never diverge.
 */
export async function validateDukaanCoupon(hotelId, couponName, items) {
    const response = await apiClient.post(ENDPOINTS.DUKAAN_COUPON_VALIDATE, {
        hotelId,
        couponName,
        items,
    });
    return response.data;
}

/** Rate a product from a delivered order. Re-submitting edits the review. */
export async function reviewDukaanProduct(orderId, payload) {
    const response = await apiClient.post(
        `${ENDPOINTS.DUKAAN_ORDER}/${orderId}/review`,
        payload,
    );
    return response.data;
}

import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * LAUNDRY API SERVICE (Layer 1 — API Communication)
 * ══════════════════════════════════════════════════════════════
 *
 * DATA FLOW:
 *   laundryService.js → laundryViewModel.js → Laundry.jsx → child components
 *
 * ENDPOINTS USED (guest-scoped; the backend resolves the stay from the token):
 *   GET   /v1/laundry/guest/rate-list             — priced guest garments
 *   POST  /v1/laundry/guest/order                 — request a pickup
 *   GET   /v1/laundry/guest/order                 — my orders
 *   PATCH /v1/laundry/guest/order/:id/cancel      — cancel (before pickup only)
 */

/**
 * Fetches the laundry rate list (active guest garments with at least one rate).
 */
export async function getLaundryRateList(hotelId) {
    const response = await apiClient.get(ENDPOINTS.LAUNDRY_RATE_LIST, {
        params: { hotelId },
    });
    return response.data;
}

/**
 * Places a laundry order.
 * @param {{ hotelId: string, items: Array<{itemId, serviceType, qty}>, isExpress?: boolean, notes?: string }} orderData
 */
export async function createLaundryOrder(orderData) {
    const response = await apiClient.post(ENDPOINTS.LAUNDRY_ORDER, orderData);
    return response.data;
}

/**
 * Fetches the guest's own laundry orders.
 */
export async function getMyLaundryOrders(hotelId) {
    const response = await apiClient.get(ENDPOINTS.LAUNDRY_ORDER, {
        params: { hotelId, limit: 50 },
    });
    return response.data;
}

/**
 * Cancels one of the guest's orders. Allowed only while it is still REQUESTED —
 * once housekeeping collects it, the front desk must cancel it instead.
 */
export async function cancelLaundryOrder(orderId, hotelId, reason) {
    const response = await apiClient.patch(
        `${ENDPOINTS.LAUNDRY_ORDER}/${orderId}/cancel`,
        { hotelId, reason },
    );
    return response.data;
}

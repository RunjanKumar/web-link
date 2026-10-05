import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * BILL / FOLIO API SERVICE (Layer 1 — API Communication)
 * ══════════════════════════════════════════════════════════════
 *
 * DATA FLOW:
 *   billService.js → billViewModel.js → ViewBill.jsx
 *
 * ENDPOINTS USED (guest-scoped; the backend resolves the stay from
 * the token, so the guest can only ever see their own bill):
 *   GET /v1/folio/guest?hotelId — my folio (charges, payments, balance)
 */

/**
 * Fetches the guest's own bill (folio summary) for their current stay.
 * Returns totals plus the individual charge and payment lines.
 */
export async function getMyBill(hotelId) {
    const response = await apiClient.get(ENDPOINTS.FOLIO_GUEST, {
        params: { hotelId },
    });
    return response.data;
}

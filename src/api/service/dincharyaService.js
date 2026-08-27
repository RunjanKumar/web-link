import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * DINCHARYA API SERVICE (Layer 1 — API Communication)
 * ══════════════════════════════════════════════════════════════
 *
 * DATA FLOW:
 *   dincharyaService.js → dincharyaViewModel.js → MyDay.jsx
 *
 * ENDPOINTS USED (guest-scoped; the backend resolves the stay and the
 * health record from the token, and serves ONLY the days the wellness
 * team has published — so a half-built day never reaches the guest):
 *   GET /v1/dincharya/guest?hotelId&date — one published day + every
 *                                          published date of the stay
 */

/**
 * Fetches the guest's Daily Wellness Rhythm for a date.
 * `date` ('YYYY-MM-DD') is optional and only a hint — an unpublished or
 * missing date is answered with the nearest published day instead of an
 * error, so the page always lands on something real.
 */
export async function getMyDincharya(hotelId, date) {
    const response = await apiClient.get(ENDPOINTS.DINCHARYA_GUEST, {
        params: date ? { hotelId, date } : { hotelId },
    });
    return response.data;
}

import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * Fetches all services.
 * GET /v1/hotelService
 * Authorization: <token>
 *
 * @returns {Promise<Object>} The services data from the backend.
 */
export async function getService() {
    const response = await apiClient.get(ENDPOINTS.SERVICE);
    return response.data;
}

/**
 * Submits a service request (booking).
 * POST /v1/hotelServices/book
 *
 * TODO: Replace the fake implementation below with the real API call
 *       once the backend is ready.
 *
 * @param {Array} payload - Array of { subcategoryId, details } objects.
 * @returns {Promise<Object>}
 */
export async function submitServiceRequest(payload) {
    // ── Fake API: logs and resolves after a short delay ──
    console.log('🚀 [FAKE API] submitServiceRequest payload:', payload);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('✅ [FAKE API] Service request submitted successfully');
            resolve({ success: true, message: 'Request submitted (fake)' });
        }, 800);
    });

    // ── Real API (uncomment when ready) ──
    // const response = await apiClient.post(ENDPOINTS.SERVICE_REQUEST, payload);
    // return response.data;
}

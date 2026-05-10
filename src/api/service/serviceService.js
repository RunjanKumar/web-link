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

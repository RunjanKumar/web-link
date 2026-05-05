import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * Fetches the authenticated guest's profile.
 * GET /v1/customer/login/profile
 * Authorization: Bearer <token>
 *
 * @returns {Promise<Object>} The customer profile data from the backend.
 */
export async function getCustomerProfile() {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_PROFILE);
    return response.data;
}



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

/**
 * Fetches all room devices (lights, fans, scene buttons, etc.).
 * GET /api/rooms/devices
 * Authorization: <token>
 *
 * @returns {Promise<Object>} The room devices data from the backend.
 */
export async function getRoomDevices() {
    const response = await apiClient.get(ENDPOINTS.ROOM_DEVICES);
    return response.data;
}

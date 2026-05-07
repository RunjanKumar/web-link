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

/**
 * Fetches all quick call list .
 * POST /v1/quickCall
 * Authorization: <token>
 *
 * @returns {Promise<Object>} The quick call list data from the backend.
 */
export async function getQuickCall() {
    const response = await apiClient.get(ENDPOINTS.QUICK_CALL);
    return response.data;
}

/**
 * Executes a command on a room device (turn on/off, set fan level, etc.).
 * POST /api/rooms/device/exec
 *
 * @param {Object} params
 * @param {string} params.channelid - The device channel ID
 * @param {'TurnOn'|'TurnOff'} params.action - The action to perform
 * @param {number} [params.level] - Fan speed level (only sent for Fan type)
 * @returns {Promise<Object>} The API response
 */
export async function execDevice({ channelid, action, level }) {
    const body = { channelid, action };
    if (level !== undefined) {
        body.level = level;
    }
    const response = await apiClient.post(ENDPOINTS.DEVICE_EXEC, body);
    return response.data;
}



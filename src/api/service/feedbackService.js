import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * Executes a command on a room device (turn on/off, set fan level, etc.).
 * POST /api/rooms/device/exec
 *
 * @param {Object} params
 * @param {Number bte 1 t0 5} params.star - rating 
 * @param {String} params.notes - notes of feedback
 * @returns {Promise<Object>} The API response
 */
export async function submitFeedback(data) {
    const response = await apiClient.post(ENDPOINTS.FEEDBACK, data);
    return response.data;
}
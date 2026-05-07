import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * use for customer feedback
 * POST v1/feedback
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
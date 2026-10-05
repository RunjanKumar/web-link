import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * Pre-Arrival Form — the hotel's own questionnaire, filled before arrival.
 * Both calls derive the hotel and the booking from the portal token.
 */

/**
 * The form to fill plus anything this guest already submitted.
 * GET /v1/pre-arrival/me
 *
 * @returns {Promise<Object>} { form, submission, booking }
 */
export async function getMyPreArrivalForm() {
    const response = await apiClient.get(ENDPOINTS.PRE_ARRIVAL_ME);
    return response.data;
}

/**
 * Submit or revise answers.
 * POST /v1/pre-arrival/submit
 *
 * @param {Object} payload
 * @param {Object} payload.answers - fieldKey -> answer
 * @param {Object} [payload.otherAnswers] - fieldKey -> free text for "Others"
 * @returns {Promise<Object>} The API response
 */
export async function submitPreArrivalForm(payload) {
    const response = await apiClient.post(ENDPOINTS.PRE_ARRIVAL_SUBMIT, payload);
    return response.data;
}

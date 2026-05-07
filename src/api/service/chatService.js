import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * CHAT SERVICE — REST API
 * ══════════════════════════════════════════════════════════════
 *
 * Handles non-realtime chat operations via HTTP:
 *   • Fetching message history (with pagination)
 *   • Any other REST-based chat endpoints
 *
 * Realtime messaging goes through socketService, NOT here.
 */

/**
 * Fetch chat message history.
 * GET /v1/chat/messages
 *
 * @param {Object} [params] – Optional pagination parameters
 * @param {number} [params.page] – Page number (1-indexed)
 * @param {number} [params.limit] – Messages per page
 * @returns {Promise<Object>} The chat messages response from backend
 */
export async function fetchChatMessages(params = {}) {
    const response = await apiClient.get(ENDPOINTS.CHAT_MESSAGES, { params });
    return response.data;
}

import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * CHAT SERVICE — REST API
 * ══════════════════════════════════════════════════════════════
 *
 * Handles non-realtime chat operations via HTTP:
 *   • Fetching conversation/message history (with skip/limit pagination)
 *
 * Realtime messaging goes through socketService, NOT here.
 *
 * Backend endpoint: GET /conversation/list
 * Response shape:  { statusCode, message, data: { data: [...messages], totalCount } }
 */

/**
 * Fetch conversation message history.
 * GET /conversation/list?skip=0&limit=50
 *
 * Backend uses skip/limit pagination (not page-based).
 * Messages are returned newest-first (sorted by _id: -1).
 *
 * @param {Object} [params] – Pagination parameters
 * @param {number} [params.skip=0] – Number of messages to skip
 * @param {number} [params.limit=50] – Number of messages to fetch
 * @returns {Promise<Object>} { data: { data: [...], totalCount } }
 */
export async function fetchConversationMessages(params = {}) {
    const response = await apiClient.get(ENDPOINTS.CONVERSATION_LIST, { params });
    return response.data;
}

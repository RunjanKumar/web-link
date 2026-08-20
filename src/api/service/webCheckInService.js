import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * Web check-in (pre-arrival registration) transport.
 * The guest is resolved from the portal token — no ids are sent from the client.
 */

/** The guest's own web check-in state + booking window (used for form prefill). */
export async function getMyWebCheckIn() {
    const response = await apiClient.get(ENDPOINTS.WEB_CHECKIN_ME);
    return response.data;
}

/** Submit (or resubmit) the pre-arrival details for staff review. */
export async function submitWebCheckIn(body) {
    const response = await apiClient.post(ENDPOINTS.WEB_CHECKIN_SUBMIT, body);
    return response.data;
}

/**
 * Upload one ID photo. Returns the raw S3 key (`fileUrl`) that goes into the
 * submission's idDocument array. Preview it as `CDN_BASE_URL + key`.
 */
export async function uploadIdDocument(file) {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', 'customer');
    const response = await apiClient.post(ENDPOINTS.FILE_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data?.fileUrl ?? response.data?.fileUrl;
}

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://c05d-2409-40d1-2018-e4c1-b9f0-5395-bae3-1f0c.ngrok-free.app',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor ──
// Attaches the stored JWT directly as `authorization: <token>` (no "Bearer" prefix)
// because the backend expects the raw token, not the standard Bearer scheme.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('hotel_guest_token');
        if (token) {
            config.headers.authorization = token;
        }
        config.headers['ngrok-skip-browser-warning'] = 'true';
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ──
// Centralized error handling for all API calls.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token invalid or session ended – clear storage
            localStorage.removeItem('hotel_guest_token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

/**
 * Extracts a user-friendly error message from an Axios error.
 * Checks `error.response.data.message` (backend standard format) first,
 * then falls back to `error.message`, then a generic fallback.
 *
 * @param {Error} error - Axios error object
 * @param {string} [fallback='Something went wrong. Please try again.'] - Default message
 * @returns {string} Human-readable error message
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.message) {
        return error.message;
    }
    return fallback;
}

export default apiClient;

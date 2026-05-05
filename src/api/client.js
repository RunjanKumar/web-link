import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://dev-hotel-api.wattinventive.com',
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

export default apiClient;

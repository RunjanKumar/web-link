/**
 * Central registry for all API endpoint paths.
 * Import this file wherever you need to make an API call.
 */
export const ENDPOINTS = {
    // ── Auth / Profile ──
    CUSTOMER_PROFILE: '/v1/customer/login/profile',

    //Quick Calls
    QUICK_CALL: '/v1/quickCall',
    

    // ── Room Controls ──
    ROOM_DEVICES: '/api/rooms/devices',
    DEVICE_EXEC: '/api/rooms/device/exec',
    ROOM_LIGHTS: '/v1/room/lights',
    ROOM_AC: '/v1/room/ac',
    ROOM_DOOR: '/v1/room/door',
    ROOM_SCENES: '/v1/room/scenes',

    // ── Services ──
    SERVICES_CATEGORIES: '/v1/services/categories',
    SERVICES_REQUEST: '/v1/services/request',
    SERVICES_HISTORY: '/v1/services/requests',

    // ── Facilities ──
    FACILITIES: '/v1/facilities',
    FACILITIES_RESERVE: '/v1/facilities/reserve',
    FACILITIES_RESERVATIONS: '/v1/facilities/reservations',

    // ── Chat ──
    CHAT_MESSAGES: '/v1/chat/messages',
    CHAT_SEND: '/v1/chat/send',

    // ── Feedback ──
    FEEDBACK: '/v1/feedback',

    // ── Food ──
    FOOD_MENU: '/v1/food/menu',
    FOOD_ORDER: '/v1/food/order',
};

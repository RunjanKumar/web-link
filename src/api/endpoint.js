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
    SERVICE: '/v1/hotelServices',
    SERVICE_REQUEST: '/v1/hotelServices/book',
    GET_SERVICE_REQUEST: '/v1/hotelServices/book/customer',

    // ── Facilities ──
    FACILITIES: '/v1/hotelFacility',
    FACILITIES_RESERVE: '/v1/hotelFacility/book', // post 
    FACILITIES_RESERVATIONS: '/v1/hotelFacility/book', // get

    // ── Chat / Conversation ──
    CONVERSATION_LIST: '/conversation/list',

    // ── Feedback ──
    FEEDBACK: '/v1/feedback',

    // ── Food ──
    FOOD_CATEGORY: '/v1/foodCategory',
    FOOD_MENU: '/v1/food/menu',
    FOOD_ORDER: '/v1/foodOrder',
    INITIATE_PAYMENT: '/v1/foodOrder/initiatePayment',
    VERIFY_PAYMENT: '/v1/foodOrder/verifyPayment',

    // ── Coupon ──
    COUPON: '/v1/coupon',
    COUPON_VALIDATE: '/v1/coupon/validate',

    // ── Laundry ──
    LAUNDRY_RATE_LIST: '/v1/laundry/guest/rate-list',
    LAUNDRY_ORDER: '/v1/laundry/guest/order',

    // ── Bill / Folio ──
    FOLIO_GUEST: '/v1/folio/guest',

    // ── Dukaan (the in-hotel shop) ──
    // Guest-scoped: the backend resolves the hotel and the stay from the token,
    // so nothing here is keyed off a client-supplied booking id.
    DUKAAN_CATEGORY: '/v1/dukaan/guest/category',
    DUKAAN_PRODUCT: '/v1/dukaan/guest/product',
    DUKAAN_ORDER: '/v1/dukaan/guest/order',
    DUKAAN_COUPON_VALIDATE: '/v1/dukaan/guest/coupon/validate',
};

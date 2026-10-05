/**
 * Central registry for all API endpoint paths.
 * Import this file wherever you need to make an API call.
 */
export const ENDPOINTS = {
    // ── Auth / Profile ──
    CUSTOMER_PROFILE: '/v1/customer/login/profile',

    // ── Web Check-in (pre-arrival registration) ──
    WEB_CHECKIN_ME: '/v1/web-checkin/me',
    WEB_CHECKIN_SUBMIT: '/v1/web-checkin/submit',
    // Autosaved working copy — never seen by the hotel, cleared on submit.
    WEB_CHECKIN_DRAFT: '/v1/web-checkin/draft',
    // The guest's own registration-card PDF (only once web check-in is APPROVED).
    WEB_CHECKIN_REGISTRATION_CARD: '/v1/web-checkin/registration-card',
    // The paid extras this hotel opted in to offer guests, priced for this stay.
    // Asking for one is a REQUEST — the desk decides, and only the desk bills.
    // The DELETE (withdraw) path appends `/:requestId` to WEB_CHECKIN_OFFERS.
    WEB_CHECKIN_OFFERS: '/v1/web-checkin/offers',
    WEB_CHECKIN_OFFER_REQUEST: '/v1/web-checkin/offers/request',
    // A Razorpay payment LINK for a pre-arrival deposit — the guest pays on
    // Razorpay's hosted page, so no card data ever reaches this app (RBI).
    WEB_CHECKIN_DEPOSIT_LINK: '/v1/web-checkin/deposit-link',
    FILE_UPLOAD: '/v1/file/upload',

    // ── Pre-Arrival Form (the hotel's own questionnaire) ──
    // The hotel and the booking come from the portal token, so neither call
    // takes a hotelId.
    PRE_ARRIVAL_ME: '/v1/pre-arrival/me',
    PRE_ARRIVAL_SUBMIT: '/v1/pre-arrival/submit',

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

    // ── Dincharya (my Daily Wellness Rhythm) ──
    // Guest-scoped: the stay, and with it the health record, comes from the
    // token. Only days staff PUBLISHED are ever returned.
    DINCHARYA_GUEST: '/v1/dincharya/guest',

    // ── Dukaan (the in-hotel shop) ──
    // Guest-scoped: the backend resolves the hotel and the stay from the token,
    // so nothing here is keyed off a client-supplied booking id.
    DUKAAN_CATEGORY: '/v1/dukaan/guest/category',
    DUKAAN_PRODUCT: '/v1/dukaan/guest/product',
    DUKAAN_ORDER: '/v1/dukaan/guest/order',
    DUKAAN_COUPON_VALIDATE: '/v1/dukaan/guest/coupon/validate',
};

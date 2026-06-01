export const REDIRECT_TYPES = {
  CALL: 1,
  FOOD_MANAGEMENT: 2,
};

/* ── Booking Status Constants ── */
export const BOOKING_STATUS = {
    PENDING: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
    CANCEL: 4,
};

export const STATUS_LABELS = {
    [BOOKING_STATUS.PENDING]: 'Pending',
    [BOOKING_STATUS.IN_PROGRESS]: 'In Progress',
    [BOOKING_STATUS.COMPLETED]: 'Completed',
    [BOOKING_STATUS.CANCEL]: 'Cancelled',
};

export const STATUS_STYLES = {
    [BOOKING_STATUS.PENDING]: 'bg-yellow-500/15 border-yellow-500/60 text-yellow-400',
    [BOOKING_STATUS.IN_PROGRESS]: 'bg-blue-500/15 border-blue-500/60 text-blue-400',
    [BOOKING_STATUS.COMPLETED]: 'bg-green-500/15 border-green-500/60 text-green-400',
    [BOOKING_STATUS.CANCEL]: 'bg-red-500/15 border-red-500/60 text-red-400',
};


export const HOTEL_FACILITY_BOOKING_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  DISAPPROVED: 3,
  CANCELLED: 4, // in future use for customer
};

/* ── Facility Booking Status — Display Config ── */
export const FACILITY_STATUS_LABELS = {
  [HOTEL_FACILITY_BOOKING_STATUS.PENDING]: 'Booking Pending',
  [HOTEL_FACILITY_BOOKING_STATUS.APPROVED]: 'Booking Confirm',
  [HOTEL_FACILITY_BOOKING_STATUS.DISAPPROVED]: 'Booking Disapproved',
  [HOTEL_FACILITY_BOOKING_STATUS.CANCELLED]: 'Booking Cancelled',
};

export const FACILITY_STATUS_COLORS = {
  [HOTEL_FACILITY_BOOKING_STATUS.PENDING]: '#ef4444',    // red
  [HOTEL_FACILITY_BOOKING_STATUS.APPROVED]: '#22c55e',   // green
  [HOTEL_FACILITY_BOOKING_STATUS.DISAPPROVED]: '#ef4444', // red
  [HOTEL_FACILITY_BOOKING_STATUS.CANCELLED]: '#6b7280',  // gray
};

/* ── Discount Type Constants ── */
export const DISCOUNT_TYPES = {
  PERCENTAGE: 1,
  AMOUNT: 2,
  BOGO: 3,
};

/* ── Transaction / Payment Status Constants ── */
export const TRANSACTION_STATUS = {
  PENDING: 1,
  SUCCESS: 2,
  FAILED: 3,
  CANCELLED: 4,
  REFUNDED: 5,
};

export const CDN_BASE_URL = 'https://d36u10gu6pvj0x.cloudfront.net/';

export const DEFAULT_SCENE_ICON = `${CDN_BASE_URL}6a1937a04496bb00ec195952/icon/lightbulb_1780299229288.png`;
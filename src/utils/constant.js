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
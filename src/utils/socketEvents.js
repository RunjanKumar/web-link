/**
 * ══════════════════════════════════════════════════════════════
 * SOCKET EVENT CONSTANTS
 * ══════════════════════════════════════════════════════════════
 * Central registry for all Socket.IO event names.
 * Keeps event strings in one place to prevent typos and
 * make future changes easy.
 */

// ── Events the CLIENT emits to the SERVER ──
export const CLIENT_EVENTS = {
    SEND_MESSAGE: 'sendMessage',
    READ_MESSAGE: 'readMessage',
    TYPING: 'typing',
};

// ── Events the SERVER emits to the CLIENT ──
export const SERVER_EVENTS = {
    NEW_MESSAGE: 'newMessage',
    READ_MESSAGE: 'readMessage',
    USER_TYPING: 'typing',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
    RECONNECT_FAILED: 'reconnect_failed',
};

// ── Socket server configuration ──
export const SOCKET_CONFIG = {
    URL: 'https://chat-hotel-automation.wattinventive.com',
    RECONNECTION_ATTEMPTS: 10,
    RECONNECTION_DELAY: 1000,
    RECONNECTION_DELAY_MAX: 10000,
    TIMEOUT: 20000,
};

// ── Message status (WhatsApp-style, matches backend constants) ──
export const MESSAGE_STATUS = {
    SENT: 1,        // Sent by me
    DELIVERED: 2,   // Delivered to other user
    SEEN: 3,        // Seen by other user
};

// ── Message types (matches backend constants) ──
export const MESSAGE_TYPES = {
    TEXT: 1,
    IMAGE: 2,
    DOCUMENT: 3,
};

// ── User types (matches backend constants) ──
export const USER_TYPES = {
    ADMIN: 1,
    STAFF: 2,
    CUSTOMER: 3,
};

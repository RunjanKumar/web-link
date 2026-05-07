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

import { io } from 'socket.io-client';
import { SOCKET_CONFIG } from '../utils/socketEvents';

/**
 * ══════════════════════════════════════════════════════════════
 * SINGLETON SOCKET SERVICE
 * ══════════════════════════════════════════════════════════════
 *
 * Transport layer ONLY — zero business logic.
 *
 * Responsibilities:
 *   • Create & maintain ONE socket connection for the entire app
 *   • Attach JWT authorization via query params on handshake
 *   • Provide emit / on / off / disconnect helpers
 *   • Handle reconnection configuration
 *
 * Usage:
 *   import socketService from './socketService';
 *   socketService.connect(token);
 *   socketService.on('newMessage', handler);
 *   socketService.emit('sendMessage', payload);
 *   socketService.disconnect();
 */

let socket = null;

const socketService = {
    /**
     * Connect to the socket server (singleton — safe to call multiple times).
     * @param {string} token – JWT authorization token
     * @returns {import('socket.io-client').Socket} The socket instance
     */
    connect(token) {
        // Prevent duplicate connections
        if (socket?.connected) return socket;

        // If an old disconnected socket exists, clean it up first
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
            socket = null;
        }

        socket = io(SOCKET_CONFIG.URL, {
            query: { authorization: token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
            reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
            reconnectionDelayMax: SOCKET_CONFIG.RECONNECTION_DELAY_MAX,
            timeout: SOCKET_CONFIG.TIMEOUT,
            autoConnect: true,
        });

        return socket;
    },

    /**
     * Disconnect the socket and clean up.
     */
    disconnect() {
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
            socket = null;
        }
    },

    /**
     * Emit an event to the server.
     * @param {string} event – Event name
     * @param {*} data – Payload
     * @param {Function} [ack] – Optional acknowledgement callback
     */
    emit(event, data, ack) {
        if (!socket?.connected) {
            return;
        }
        if (ack) {
            socket.emit(event, data, ack);
        } else {
            socket.emit(event, data);
        }
    },

    /**
     * Subscribe to a server event.
     * @param {string} event – Event name
     * @param {Function} handler – Callback
     */
    on(event, handler) {
        if (!socket) {
            return;
        }
        socket.on(event, handler);
    },

    /**
     * Unsubscribe from a server event.
     * @param {string} event – Event name
     * @param {Function} [handler] – Specific handler to remove (removes all if omitted)
     */
    off(event, handler) {
        if (!socket) return;
        if (handler) {
            socket.off(event, handler);
        } else {
            socket.off(event);
        }
    },

    /**
     * Get the raw socket instance (for advanced use only).
     * @returns {import('socket.io-client').Socket | null}
     */
    getSocket() {
        return socket;
    },

    /**
     * Check if the socket is currently connected.
     * @returns {boolean}
     */
    isConnected() {
        return socket?.connected ?? false;
    },
};

export default socketService;

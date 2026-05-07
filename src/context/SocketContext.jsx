import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import socketService from '../api/socketService';
import { SERVER_EVENTS } from '../utils/socketEvents';
import useAuth from '../hooks/useAuth';

/**
 * ══════════════════════════════════════════════════════════════
 * SOCKET CONTEXT
 * ══════════════════════════════════════════════════════════════
 *
 * Global socket lifecycle manager.
 *
 * Responsibilities:
 *   • Connects socket when user is authenticated
 *   • Disconnects socket on logout
 *   • Tracks connection status (connected / reconnecting / offline)
 *   • Listens for browser online/offline events
 *   • Exposes socketService helpers to the component tree
 */

const SocketContext = createContext(null);

// ── Connection status enum ──
export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting',
    OFFLINE: 'offline',
};

export function SocketProvider({ children }) {
    const { token, isAuthenticated } = useAuth();
    const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.DISCONNECTED);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // ── Browser online/offline detection ──
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => {
            setIsOnline(false);
            setConnectionStatus(CONNECTION_STATUS.OFFLINE);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ── Socket lifecycle — connect when authenticated, disconnect on logout ──
    useEffect(() => {
        if (!isAuthenticated || !token) {
            socketService.disconnect();
            setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
            return;
        }

        // Connect
        socketService.connect(token);

        // ── Connection event handlers ──
        const onConnect = () => {
            console.log('[Socket] Connected ✓');
            setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        };

        const onDisconnect = (reason) => {
            console.log('[Socket] Disconnected:', reason);
            setConnectionStatus(
                navigator.onLine ? CONNECTION_STATUS.DISCONNECTED : CONNECTION_STATUS.OFFLINE
            );
        };

        const onConnectError = (err) => {
            console.error('[Socket] Connection error:', err.message);
            setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        };

        const onReconnectAttempt = (attempt) => {
            console.log(`[Socket] Reconnect attempt ${attempt}...`);
            setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
        };

        const onReconnect = () => {
            console.log('[Socket] Reconnected ✓');
            setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        };

        const onReconnectFailed = () => {
            console.error('[Socket] Reconnection failed after max attempts');
            setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        };

        // Register listeners
        socketService.on(SERVER_EVENTS.CONNECT, onConnect);
        socketService.on(SERVER_EVENTS.DISCONNECT, onDisconnect);
        socketService.on(SERVER_EVENTS.CONNECT_ERROR, onConnectError);
        socketService.on(SERVER_EVENTS.RECONNECT_ATTEMPT, onReconnectAttempt);
        socketService.on(SERVER_EVENTS.RECONNECT, onReconnect);
        socketService.on(SERVER_EVENTS.RECONNECT_FAILED, onReconnectFailed);

        // If already connected (singleton may already be active)
        if (socketService.isConnected()) {
            setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        }

        // ── Cleanup on unmount or auth change ──
        return () => {
            socketService.off(SERVER_EVENTS.CONNECT, onConnect);
            socketService.off(SERVER_EVENTS.DISCONNECT, onDisconnect);
            socketService.off(SERVER_EVENTS.CONNECT_ERROR, onConnectError);
            socketService.off(SERVER_EVENTS.RECONNECT_ATTEMPT, onReconnectAttempt);
            socketService.off(SERVER_EVENTS.RECONNECT, onReconnect);
            socketService.off(SERVER_EVENTS.RECONNECT_FAILED, onReconnectFailed);
            socketService.disconnect();
        };
    }, [isAuthenticated, token]);

    // ── Context value ──
    const contextValue = {
        connectionStatus,
        isOnline,
        isConnected: connectionStatus === CONNECTION_STATUS.CONNECTED,
        socketService,
    };

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
}

/**
 * Hook to access socket context from any component.
 * @returns {{ connectionStatus: string, isOnline: boolean, isConnected: boolean, socketService: object }}
 */
export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
    return ctx;
}

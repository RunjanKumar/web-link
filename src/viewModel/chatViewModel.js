import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../utils/socketEvents';
import { fetchChatMessages } from '../api/service/chatService';
import useAuth from '../hooks/useAuth';

/**
 * ══════════════════════════════════════════════════════════════
 * CHAT VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * The "brain" of the chat feature — all business logic lives here.
 *
 * Responsibilities:
 *   • Fetch initial messages via REST
 *   • Subscribe to socket events (newMessage, readMessage, typing)
 *   • Handle optimistic sends with tempId → real ID replacement
 *   • Deduplicate messages
 *   • Manage typing indicator state
 *   • Queue messages when offline
 *   • Provide pagination (load older messages)
 *   • Clean up all listeners on unmount
 *
 * UI components should ONLY read state and call actions from here.
 */

// ── Helper: generate a unique temp ID for optimistic messages ──
let tempCounter = 0;
function generateTempId() {
    return `temp_${Date.now()}_${++tempCounter}`;
}

// ── Helper: normalize a backend message to our frontend shape ──
function normalizeMessage(raw) {
    return {
        id: raw._id || raw.id,
        text: raw.message || raw.text || '',
        sender: raw.senderType || raw.sender || 'staff',
        senderId: raw.senderId || null,
        timestamp: raw.createdAt || raw.timestamp || new Date().toISOString(),
        read: raw.read ?? raw.isRead ?? false,
        tempId: raw.tempId || null,
        status: raw.status || 'sent', // 'sending' | 'sent' | 'read' | 'failed'
    };
}

export default function useChatViewModel() {
    // ── State ──
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isStaffTyping, setIsStaffTyping] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [page, setPage] = useState(1);
    const [pendingMessages, setPendingMessages] = useState([]);

    // ── Refs ──
    const messageIdsRef = useRef(new Set()); // For deduplication
    const typingTimeoutRef = useRef(null);

    // ── Context ──
    const { socketService, isConnected, connectionStatus } = useSocket();
    const { userId } = useAuth();

    // ════════════════════════════════════════════════════════════
    // DEDUPLICATION HELPER
    // ════════════════════════════════════════════════════════════
    const addMessageIfNew = useCallback((msg) => {
        const key = msg.id || msg.tempId;
        if (messageIdsRef.current.has(key)) return false;
        messageIdsRef.current.add(key);
        return true;
    }, []);

    // ════════════════════════════════════════════════════════════
    // FETCH INITIAL MESSAGES (REST)
    // ════════════════════════════════════════════════════════════
    const loadMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchChatMessages({ page: 1, limit: 50 });

            // Handle various response shapes from backend
            const rawMessages = response?.data?.messages
                || response?.data
                || response?.messages
                || response
                || [];

            const msgArray = Array.isArray(rawMessages) ? rawMessages : [];
            const normalized = msgArray.map(normalizeMessage);

            // Populate dedup set
            messageIdsRef.current.clear();
            normalized.forEach((m) => {
                messageIdsRef.current.add(m.id);
                if (m.tempId) messageIdsRef.current.add(m.tempId);
            });

            setMessages(normalized);
            setHasMoreMessages(normalized.length >= 50);
            setPage(1);
        } catch (err) {
            console.error('[ChatVM] Failed to load messages:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ════════════════════════════════════════════════════════════
    // LOAD OLDER MESSAGES (PAGINATION)
    // ════════════════════════════════════════════════════════════
    const loadMoreMessages = useCallback(async () => {
        if (!hasMoreMessages) return;

        try {
            const nextPage = page + 1;
            const response = await fetchChatMessages({ page: nextPage, limit: 50 });

            const rawMessages = response?.data?.messages
                || response?.data
                || response?.messages
                || response
                || [];

            const msgArray = Array.isArray(rawMessages) ? rawMessages : [];
            const normalized = msgArray.map(normalizeMessage);

            // Only add messages we haven't seen
            const newMsgs = normalized.filter((m) => addMessageIfNew(m));

            if (newMsgs.length > 0) {
                setMessages((prev) => [...newMsgs, ...prev]);
                setPage(nextPage);
            }

            setHasMoreMessages(normalized.length >= 50);
        } catch (err) {
            console.error('[ChatVM] Failed to load more messages:', err);
        }
    }, [hasMoreMessages, page, addMessageIfNew]);

    // ════════════════════════════════════════════════════════════
    // SEND MESSAGE (OPTIMISTIC UI)
    // ════════════════════════════════════════════════════════════
    const sendMessage = useCallback(() => {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        const tempId = generateTempId();

        // Create optimistic message
        const optimisticMsg = {
            id: tempId,
            text: trimmed,
            sender: 'guest',
            senderId: userId,
            timestamp: new Date().toISOString(),
            read: false,
            tempId,
            status: 'sending',
        };

        // Add to UI immediately (optimistic)
        messageIdsRef.current.add(tempId);
        setMessages((prev) => [...prev, optimisticMsg]);
        setInputText('');
        setIsSending(true);

        // If offline, queue the message
        if (!isConnected) {
            setMessages((prev) =>
                prev.map((m) =>
                    m.tempId === tempId ? { ...m, status: 'failed' } : m
                )
            );
            setPendingMessages((prev) => [...prev, { tempId, text: trimmed }]);
            setIsSending(false);
            return;
        }

        // Emit through socket
        socketService.emit(CLIENT_EVENTS.SEND_MESSAGE, {
            message: trimmed,
            tempId,
        });

        // Mark as sent after a short delay (if no server confirmation)
        setTimeout(() => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.tempId === tempId && m.status === 'sending'
                        ? { ...m, status: 'sent' }
                        : m
                )
            );
            setIsSending(false);
        }, 2000);
    }, [inputText, userId, isConnected, socketService]);

    // ════════════════════════════════════════════════════════════
    // RETRY FAILED MESSAGE
    // ════════════════════════════════════════════════════════════
    const retryMessage = useCallback((tempId) => {
        const msg = messages.find((m) => m.tempId === tempId);
        if (!msg || !isConnected) return;

        // Mark as sending again
        setMessages((prev) =>
            prev.map((m) =>
                m.tempId === tempId ? { ...m, status: 'sending' } : m
            )
        );

        // Re-emit
        socketService.emit(CLIENT_EVENTS.SEND_MESSAGE, {
            message: msg.text,
            tempId,
        });

        // Remove from pending queue
        setPendingMessages((prev) => prev.filter((p) => p.tempId !== tempId));
    }, [messages, isConnected, socketService]);

    // ════════════════════════════════════════════════════════════
    // MARK MESSAGE AS READ
    // ════════════════════════════════════════════════════════════
    const markAsRead = useCallback((messageId) => {
        if (!isConnected) return;
        socketService.emit(CLIENT_EVENTS.READ_MESSAGE, { messageId });
    }, [isConnected, socketService]);

    // ════════════════════════════════════════════════════════════
    // EMIT TYPING INDICATOR (DEBOUNCED)
    // ════════════════════════════════════════════════════════════
    const emitTyping = useCallback(() => {
        if (!isConnected) return;

        socketService.emit(CLIENT_EVENTS.TYPING, { isTyping: true });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socketService.emit(CLIENT_EVENTS.TYPING, { isTyping: false });
        }, 2000);
    }, [isConnected, socketService]);

    // ════════════════════════════════════════════════════════════
    // SOCKET EVENT LISTENERS
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        if (!isConnected) return;

        // ── New message from server ──
        const onNewMessage = (data) => {
            const msg = normalizeMessage(data);

            // Check if this is a confirmation of our optimistic message
            if (data.tempId && messageIdsRef.current.has(data.tempId)) {
                // Replace optimistic message with confirmed one
                messageIdsRef.current.add(msg.id);
                setMessages((prev) =>
                    prev.map((m) =>
                        m.tempId === data.tempId
                            ? { ...msg, status: 'sent' }
                            : m
                    )
                );
                return;
            }

            // New message from the other party — deduplicate
            if (addMessageIfNew(msg)) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        // ── Read receipt from server ──
        const onReadMessage = (data) => {
            const msgId = data?.messageId || data?._id;
            if (!msgId) return;

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === msgId ? { ...m, read: true, status: 'read' } : m
                )
            );
        };

        // ── Typing indicator from staff ──
        const onTyping = (data) => {
            // Only show typing if it's from someone else
            if (data?.userId !== userId) {
                setIsStaffTyping(data?.isTyping ?? false);

                // Auto-clear after 3 seconds (failsafe)
                if (data?.isTyping) {
                    setTimeout(() => setIsStaffTyping(false), 3000);
                }
            }
        };

        // Register listeners
        socketService.on(SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
        socketService.on(SERVER_EVENTS.READ_MESSAGE, onReadMessage);
        socketService.on(SERVER_EVENTS.USER_TYPING, onTyping);

        // ── Cleanup listeners on unmount ──
        return () => {
            socketService.off(SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
            socketService.off(SERVER_EVENTS.READ_MESSAGE, onReadMessage);
            socketService.off(SERVER_EVENTS.USER_TYPING, onTyping);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [isConnected, socketService, userId, addMessageIfNew]);

    // ════════════════════════════════════════════════════════════
    // FLUSH PENDING MESSAGES ON RECONNECT
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        if (isConnected && pendingMessages.length > 0) {
            pendingMessages.forEach((pending) => {
                socketService.emit(CLIENT_EVENTS.SEND_MESSAGE, {
                    message: pending.text,
                    tempId: pending.tempId,
                });

                // Update status to sending
                setMessages((prev) =>
                    prev.map((m) =>
                        m.tempId === pending.tempId ? { ...m, status: 'sending' } : m
                    )
                );
            });
            setPendingMessages([]);
        }
    }, [isConnected, pendingMessages, socketService]);

    // ════════════════════════════════════════════════════════════
    // INITIAL LOAD
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // ════════════════════════════════════════════════════════════
    // RETURN — everything the UI needs
    // ════════════════════════════════════════════════════════════
    return {
        // State
        messages,
        inputText,
        isLoading,
        isSending,
        isStaffTyping,
        hasMoreMessages,
        connectionStatus,
        isConnected,

        // Actions
        setInputText,
        sendMessage,
        loadMoreMessages,
        markAsRead,
        emitTyping,
        retryMessage,
        loadMessages,
    };
}

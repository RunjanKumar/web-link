import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { CLIENT_EVENTS, SERVER_EVENTS, MESSAGE_STATUS, USER_TYPES } from '../utils/socketEvents';
import { fetchConversationMessages } from '../api/service/chatService';
import useAuth from '../hooks/useAuth';

/**
 * ══════════════════════════════════════════════════════════════
 * CHAT VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * The "brain" of the chat feature — all business logic lives here.
 *
 * Backend conversation model:
 *   { _id, message, senderId, senderData: { name, userType },
 *     customerId, hotelId, receivedBy: [{ userId, status }],
 *     createdAt, messageType }
 *
 * Message status (WhatsApp-style):
 *   1 = SENT, 2 = DELIVERED, 3 = SEEN
 *
 * User types:
 *   1 = ADMIN, 2 = STAFF, 3 = CUSTOMER (guest)
 */

// ── Pagination config ──
const PAGE_SIZE = 20;

// ── Helper: generate a unique temp ID for optimistic messages ──
let tempCounter = 0;
function generateTempId() {
    return `temp_${Date.now()}_${++tempCounter}`;
}

/**
 * Normalize a backend conversation message to our frontend shape.
 * Maps backend fields to a clean, consistent object.
 *
 * @param {Object} raw – Raw message from backend
 * @param {string} currentUserId – The logged-in user's ID
 */
function normalizeMessage(raw, currentUserId) {
    // Determine if this message was sent by the current user (guest)
    const rawSenderId = raw.senderId?._id || raw.senderId || '';
    const senderType = raw.senderData?.userType || raw.senderType;
    const isOwn = rawSenderId === currentUserId || senderType === USER_TYPES.CUSTOMER;

    // Extract message status from receivedBy array
    // receivedBy contains: [{ userId, status }] where status matches MESSAGE_STATUS
    let messageStatus = MESSAGE_STATUS.SENT;
    if (raw.receivedBy && Array.isArray(raw.receivedBy)) {
        // For guest's own messages: check the receiver's (staff's) status
        // For staff messages: check our (guest's) status
        const receiverEntry = raw.receivedBy.find(r =>
            isOwn ? r.userId !== currentUserId : r.userId === currentUserId
        );
        if (receiverEntry) {
            messageStatus = receiverEntry.status || MESSAGE_STATUS.SENT;
        }
    }
    // If raw.status is directly available (from socket events), use it
    if (raw.status && typeof raw.status === 'number') {
        messageStatus = raw.status;
    }

    return {
        id: raw._id || raw.id,
        text: raw.message || raw.text || '',
        senderId: rawSenderId,
        senderName: raw.senderData?.name || raw.senderName || (isOwn ? 'You' : 'Reception'),
        senderType: senderType || (isOwn ? USER_TYPES.CUSTOMER : USER_TYPES.STAFF),
        isOwn,
        timestamp: raw.createdAt || raw.timestamp || new Date().toISOString(),
        messageStatus, // 1=SENT, 2=DELIVERED, 3=SEEN (WhatsApp style)
        tempId: raw.tempId || null,
        isSending: false,
        isFailed: false,
    };
}

export default function useChatViewModel() {
    // ── State ──
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [pendingMessages, setPendingMessages] = useState([]);

    // ── Refs ──
    const messageIdsRef = useRef(new Set()); // For deduplication
    const skipRef = useRef(0); // Current pagination offset

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
    // EXTRACT MESSAGES FROM API RESPONSE
    // ════════════════════════════════════════════════════════════
    const extractFromResponse = useCallback((response) => {
        // Backend response: { statusCode, message, data: { data: [...], totalCount } }
        const responseData = response?.data || response;
        const rawMessages = responseData?.data || responseData?.messages || [];
        const count = responseData?.totalCount || 0;
        return {
            rawMessages: Array.isArray(rawMessages) ? rawMessages : [],
            totalCount: count,
        };
    }, []);

    // ════════════════════════════════════════════════════════════
    // FETCH INITIAL MESSAGES (REST) — newest first, then reversed
    // ════════════════════════════════════════════════════════════
    const loadMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchConversationMessages({
                skip: 0,
                limit: PAGE_SIZE,
            });

            const { rawMessages, totalCount: total } = extractFromResponse(response);

            // Backend returns newest-first, we need oldest-first for chat display
            const normalized = rawMessages
                .map((raw) => normalizeMessage(raw, userId))
                .reverse();

            // Populate dedup set
            messageIdsRef.current.clear();
            normalized.forEach((m) => {
                messageIdsRef.current.add(m.id);
                if (m.tempId) messageIdsRef.current.add(m.tempId);
            });

            setMessages(normalized);
            setTotalCount(total);
            setHasMoreMessages(rawMessages.length < total);
            skipRef.current = rawMessages.length;
        } catch (err) {
            console.error('[ChatVM] Failed to load messages:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, extractFromResponse]);

    // ════════════════════════════════════════════════════════════
    // LOAD OLDER MESSAGES (PAGINATION — scroll up like WhatsApp)
    // ════════════════════════════════════════════════════════════
    const loadMoreMessages = useCallback(async () => {
        if (!hasMoreMessages || isLoadingMore) return;

        try {
            setIsLoadingMore(true);
            const response = await fetchConversationMessages({
                skip: skipRef.current,
                limit: PAGE_SIZE,
            });

            const { rawMessages } = extractFromResponse(response);
            if (rawMessages.length === 0) {
                setHasMoreMessages(false);
                return;
            }

            // Normalize and reverse (newest-first → oldest-first)
            const normalized = rawMessages
                .map((raw) => normalizeMessage(raw, userId))
                .reverse();

            // Only add messages we haven't seen (dedup)
            const newMsgs = normalized.filter((m) => addMessageIfNew(m));

            if (newMsgs.length > 0) {
                // Prepend older messages to the top
                setMessages((prev) => [...newMsgs, ...prev]);
                skipRef.current += rawMessages.length;
            }

            setHasMoreMessages(skipRef.current < totalCount);
        } catch (err) {
            console.error('[ChatVM] Failed to load more messages:', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMoreMessages, isLoadingMore, totalCount, userId, addMessageIfNew, extractFromResponse]);

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
            senderId: userId,
            senderName: 'You',
            senderType: USER_TYPES.CUSTOMER,
            isOwn: true,
            timestamp: new Date().toISOString(),
            messageStatus: MESSAGE_STATUS.SENT,
            tempId,
            isSending: true,
            isFailed: false,
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
                    m.tempId === tempId ? { ...m, isSending: false, isFailed: true } : m
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

        // Mark as sent after a short delay (fallback if no server confirmation)
        setTimeout(() => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.tempId === tempId && m.isSending
                        ? { ...m, isSending: false, messageStatus: MESSAGE_STATUS.SENT }
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
                m.tempId === tempId ? { ...m, isSending: true, isFailed: false } : m
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
    // SOCKET EVENT LISTENERS
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        if (!isConnected) return;

        // ── New message from server ──
        const onNewMessage = (data) => {
            const msg = normalizeMessage(data, userId);

            // ── Case 1: Server echoed back our tempId → replace optimistic message
            if (data.tempId && messageIdsRef.current.has(data.tempId)) {
                messageIdsRef.current.add(msg.id);
                setMessages((prev) =>
                    prev.map((m) =>
                        m.tempId === data.tempId
                            ? { ...msg, isSending: false, messageStatus: MESSAGE_STATUS.SENT }
                            : m
                    )
                );
                return;
            }

            // ── Case 2: This is our own message echoed back WITHOUT tempId
            //    (backend broadcast). Find and replace the matching optimistic message.
            if (msg.isOwn) {
                setMessages((prev) => {
                    // Look for an optimistic message (has tempId, is sending or just sent)
                    // that matches this confirmed message by text content
                    const optimisticIndex = prev.findIndex(
                        (m) => m.tempId && m.isOwn && m.text === msg.text && (m.isSending || !m.id || m.id === m.tempId)
                    );

                    if (optimisticIndex !== -1) {
                        // Replace the optimistic message with the confirmed one
                        messageIdsRef.current.add(msg.id);
                        const updated = [...prev];
                        updated[optimisticIndex] = {
                            ...msg,
                            isSending: false,
                            messageStatus: msg.messageStatus || MESSAGE_STATUS.SENT,
                        };
                        return updated;
                    }

                    // Already have this message by real ID — skip entirely
                    if (messageIdsRef.current.has(msg.id)) {
                        return prev;
                    }

                    // Truly new own message (e.g., sent from another device)
                    messageIdsRef.current.add(msg.id);
                    return [...prev, msg];
                });
                return;
            }

            // ── Case 3: New message from the other party — deduplicate by ID
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
                    m.id === msgId
                        ? { ...m, messageStatus: MESSAGE_STATUS.SEEN }
                        : m
                )
            );
        };

        // Register listeners
        socketService.on(SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
        socketService.on(SERVER_EVENTS.READ_MESSAGE, onReadMessage);

        // ── Cleanup listeners on unmount ──
        return () => {
            socketService.off(SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
            socketService.off(SERVER_EVENTS.READ_MESSAGE, onReadMessage);
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
                        m.tempId === pending.tempId
                            ? { ...m, isSending: true, isFailed: false }
                            : m
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
        isLoadingMore,
        isSending,
        hasMoreMessages,
        connectionStatus,
        isConnected,

        // Actions
        setInputText,
        sendMessage,
        loadMoreMessages,
        markAsRead,
        retryMessage,
        loadMessages,
    };
}

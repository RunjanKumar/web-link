import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { CLIENT_EVENTS, SERVER_EVENTS, MESSAGE_STATUS, USER_TYPES } from '../utils/socketEvents';
import { fetchConversationMessages } from '../api/service/chatService';
import useAuth from '../hooks/useAuth';

/**
 * ══════════════════════════════════════════════════════════════
 * CHAT VIEWMODEL — "Brain" of the Chat feature
 * ══════════════════════════════════════════════════════════════
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
 */
function normalizeMessage(raw, currentUserId) {
    const rawSenderId = raw.senderId?._id || raw.senderId || '';
    const senderType = raw.senderData?.userType || raw.senderType;
    const isOwn = rawSenderId === currentUserId || senderType === USER_TYPES.CUSTOMER;

    // Extract message status from receivedBy array
    let messageStatus = MESSAGE_STATUS.SENT;
    if (raw.receivedBy && Array.isArray(raw.receivedBy)) {
        const receiverEntry = raw.receivedBy.find(r =>
            isOwn ? r.userId !== currentUserId : r.userId === currentUserId
        );
        if (receiverEntry) {
            messageStatus = receiverEntry.status || MESSAGE_STATUS.SENT;
        }
    }
    if (raw.status && typeof raw.status === 'number') {
        messageStatus = raw.status;
    }

    const normalized = {
        id: raw._id || raw.id,
        text: raw.message || raw.text || '',
        senderId: rawSenderId,
        senderName: raw.senderData?.name || raw.senderName || (isOwn ? 'You' : 'Reception'),
        senderType: senderType || (isOwn ? USER_TYPES.CUSTOMER : USER_TYPES.STAFF),
        isOwn,
        timestamp: raw.createdAt || raw.timestamp || new Date().toISOString(),
        messageStatus,
        tempId: raw.tempId || null,
        isSending: false,
        isFailed: false,
    };

    console.log('💬 [ChatVM] normalizeMessage():', {
        rawId: raw._id,
        isOwn: normalized.isOwn,
        textPreview: normalized.text.substring(0, 30) + (normalized.text.length > 30 ? '...' : ''),
        status: normalized.messageStatus,
    });

    return normalized;
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

    console.log('💬 [ChatVM] Hook initialized. userId:', userId, '| connected:', isConnected, '| status:', connectionStatus);

    // ════════════════════════════════════════════════════════════
    // DEDUPLICATION HELPER
    // LEARNING: Prevents the same message from appearing twice
    // (can happen when socket echoes back our own message)
    // ════════════════════════════════════════════════════════════
    const addMessageIfNew = useCallback((msg) => {
        const key = msg.id || msg.tempId;
        if (messageIdsRef.current.has(key)) {
            console.log('💬 [ChatVM] addMessageIfNew() → DUPLICATE skipped:', key);
            return false;
        }
        messageIdsRef.current.add(key);
        return true;
    }, []);

    // ════════════════════════════════════════════════════════════
    // EXTRACT MESSAGES FROM API RESPONSE
    // ════════════════════════════════════════════════════════════
    const extractFromResponse = useCallback((response) => {
        const responseData = response?.data || response;
        const rawMessages = responseData?.data || responseData?.messages || [];
        const count = responseData?.totalCount || 0;

        console.log('💬 [ChatVM] extractFromResponse():', {
            rawMessagesCount: Array.isArray(rawMessages) ? rawMessages.length : 'not array',
            totalCount: count,
        });

        return {
            rawMessages: Array.isArray(rawMessages) ? rawMessages : [],
            totalCount: count,
        };
    }, []);

    // ════════════════════════════════════════════════════════════
    // FETCH INITIAL MESSAGES (REST API)
    // LEARNING: First load uses REST, then switches to WebSocket for realtime
    // ════════════════════════════════════════════════════════════
    const loadMessages = useCallback(async () => {
        try {
            console.log('💬 STEP-1 [ChatVM] loadMessages() — Fetching initial messages via REST API...');
            setIsLoading(true);

            // STEP-2: Call chatService
            const response = await fetchConversationMessages({
                skip: 0,
                limit: PAGE_SIZE,
            });

            const { rawMessages, totalCount: total } = extractFromResponse(response);
            console.log('💬 STEP-2 [ChatVM] Got', rawMessages.length, 'messages. Total on server:', total);

            // STEP-3: Backend returns newest-first, we reverse for chat display (oldest at top)
            const normalized = rawMessages
                .map((raw) => normalizeMessage(raw, userId))
                .reverse();

            console.log('💬 STEP-3 [ChatVM] Normalized & reversed. Messages ready for display:', normalized.length);

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

            console.log('💬 STEP-4 [ChatVM] Initial load complete. hasMore:', rawMessages.length < total, '| skip:', rawMessages.length);
        } catch (err) {
            console.error('🔴 [ChatVM] loadMessages() FAILED:', err.message);
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
            console.log('💬 [ChatVM] loadMoreMessages() — skip:', skipRef.current, '| limit:', PAGE_SIZE);
            setIsLoadingMore(true);

            const response = await fetchConversationMessages({
                skip: skipRef.current,
                limit: PAGE_SIZE,
            });

            const { rawMessages } = extractFromResponse(response);
            if (rawMessages.length === 0) {
                console.log('💬 [ChatVM] loadMoreMessages() → No more messages. Setting hasMore=false');
                setHasMoreMessages(false);
                return;
            }

            const normalized = rawMessages
                .map((raw) => normalizeMessage(raw, userId))
                .reverse();

            // Only add messages we haven't seen (dedup)
            const newMsgs = normalized.filter((m) => addMessageIfNew(m));
            console.log('💬 [ChatVM] loadMoreMessages() → New unique messages:', newMsgs.length);

            if (newMsgs.length > 0) {
                // Prepend older messages to the top
                setMessages((prev) => [...newMsgs, ...prev]);
                skipRef.current += rawMessages.length;
            }

            setHasMoreMessages(skipRef.current < totalCount);
        } catch (err) {
            console.error('🔴 [ChatVM] loadMoreMessages() FAILED:', err.message);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMoreMessages, isLoadingMore, totalCount, userId, addMessageIfNew, extractFromResponse]);

    // ════════════════════════════════════════════════════════════
    // SEND MESSAGE (OPTIMISTIC UI)
    // LEARNING: Shows the message INSTANTLY, then confirms with server
    // ════════════════════════════════════════════════════════════
    const sendMessage = useCallback(() => {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        const tempId = generateTempId();
        console.log('💬 STEP-1 [ChatVM] sendMessage() — Text:', trimmed.substring(0, 30), '| tempId:', tempId);

        // STEP-2: Create optimistic message (shown instantly)
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

        // Add to UI immediately
        messageIdsRef.current.add(tempId);
        setMessages((prev) => [...prev, optimisticMsg]);
        setInputText('');
        setIsSending(true);
        console.log('💬 STEP-2 [ChatVM] Optimistic message added to UI');

        // STEP-3: If offline, queue the message
        if (!isConnected) {
            console.log('🟡 STEP-3 [ChatVM] OFFLINE → Queuing message for later send');
            setMessages((prev) =>
                prev.map((m) =>
                    m.tempId === tempId ? { ...m, isSending: false, isFailed: true } : m
                )
            );
            setPendingMessages((prev) => [...prev, { tempId, text: trimmed }]);
            setIsSending(false);
            return;
        }

        // STEP-4: Emit through socket
        console.log('💬 STEP-3 [ChatVM] Emitting via socket:', CLIENT_EVENTS.SEND_MESSAGE);
        socketService.emit(CLIENT_EVENTS.SEND_MESSAGE, {
            message: trimmed,
            tempId,
        });

        // Mark as sent after fallback delay (if no server confirmation)
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

        console.log('💬 [ChatVM] retryMessage() → Re-sending tempId:', tempId, '| text:', msg.text.substring(0, 20));

        setMessages((prev) =>
            prev.map((m) =>
                m.tempId === tempId ? { ...m, isSending: true, isFailed: false } : m
            )
        );

        socketService.emit(CLIENT_EVENTS.SEND_MESSAGE, {
            message: msg.text,
            tempId,
        });

        setPendingMessages((prev) => prev.filter((p) => p.tempId !== tempId));
    }, [messages, isConnected, socketService]);

    // ════════════════════════════════════════════════════════════
    // MARK MESSAGE AS READ
    // ════════════════════════════════════════════════════════════
    const markAsRead = useCallback((messageId) => {
        if (!isConnected) return;
        console.log('💬 [ChatVM] markAsRead() → messageId:', messageId);
        socketService.emit(CLIENT_EVENTS.READ_MESSAGE, { messageId });
    }, [isConnected, socketService]);

    // ════════════════════════════════════════════════════════════
    // SOCKET EVENT LISTENERS
    // LEARNING: These handle REALTIME messages after initial REST load
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        if (!isConnected) return;
        console.log('💬 [ChatVM] Setting up socket listeners (connected=true)');

        // ── New message from server ──
        const onNewMessage = (data) => {
            console.log('💬 [ChatVM] 🔔 Socket event:', SERVER_EVENTS.NEW_MESSAGE, '| data.tempId:', data.tempId, '| data._id:', data._id);
            const msg = normalizeMessage(data, userId);

            // Case 1: Server echoed back our tempId → replace optimistic message
            if (data.tempId && messageIdsRef.current.has(data.tempId)) {
                console.log('💬 [ChatVM] Case 1: Replacing optimistic message with server-confirmed. tempId:', data.tempId);
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

            // Case 2: Our own message echoed back WITHOUT tempId
            if (msg.isOwn) {
                console.log('💬 [ChatVM] Case 2: Own message echo (no tempId). Checking for optimistic match...');
                setMessages((prev) => {
                    const optimisticIndex = prev.findIndex(
                        (m) => m.tempId && m.isOwn && m.text === msg.text && (m.isSending || !m.id || m.id === m.tempId)
                    );

                    if (optimisticIndex !== -1) {
                        console.log('💬 [ChatVM] Case 2a: Found optimistic match at index:', optimisticIndex, '→ replacing');
                        messageIdsRef.current.add(msg.id);
                        const updated = [...prev];
                        updated[optimisticIndex] = {
                            ...msg,
                            isSending: false,
                            messageStatus: msg.messageStatus || MESSAGE_STATUS.SENT,
                        };
                        return updated;
                    }

                    if (messageIdsRef.current.has(msg.id)) {
                        console.log('💬 [ChatVM] Case 2b: Already have this message by real ID → skip');
                        return prev;
                    }

                    console.log('💬 [ChatVM] Case 2c: New own message (maybe from another device) → appending');
                    messageIdsRef.current.add(msg.id);
                    return [...prev, msg];
                });
                return;
            }

            // Case 3: New message from the other party
            if (addMessageIfNew(msg)) {
                console.log('💬 [ChatVM] Case 3: New message from staff → appending. id:', msg.id);
                setMessages((prev) => [...prev, msg]);
            }
        };

        // ── Read receipt from server ──
        const onReadMessage = (data) => {
            const msgId = data?.messageId || data?._id;
            if (!msgId) return;
            console.log('💬 [ChatVM] 🔔 Socket event:', SERVER_EVENTS.READ_MESSAGE, '→ marking as SEEN:', msgId);

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
            console.log('💬 [ChatVM] Cleaning up socket listeners');
            socketService.off(SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
            socketService.off(SERVER_EVENTS.READ_MESSAGE, onReadMessage);
        };
    }, [isConnected, socketService, userId, addMessageIfNew]);

    // ════════════════════════════════════════════════════════════
    // FLUSH PENDING MESSAGES ON RECONNECT
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        if (isConnected && pendingMessages.length > 0) {
            console.log('💬 [ChatVM] Reconnected! Flushing', pendingMessages.length, 'pending messages...');
            pendingMessages.forEach((pending) => {
                socketService.emit(CLIENT_EVENTS.SEND_MESSAGE, {
                    message: pending.text,
                    tempId: pending.tempId,
                });

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
        console.log('💬 [ChatVM] Component mounted → triggering loadMessages()');
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

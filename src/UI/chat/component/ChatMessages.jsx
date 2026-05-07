/**
 * ChatMessages — message list container.
 * Handles auto-scroll, scroll-to-bottom FAB, date dividers, typing indicator,
 * and triggers load-more on scroll-to-top.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import ChatBubble from './ChatBubble';
import DateDivider from './DateDivider';
import TypingIndicator from './TypingIndicator';
import ScrollToBottom from './ScrollToBottom';
import EmptyChat from './EmptyChat';

/**
 * Helper: group messages by date for divider insertion.
 * Returns array of { type: 'date' | 'message', ... }
 */
function buildMessageList(messages) {
    const items = [];
    let lastDate = null;

    messages.forEach((msg) => {
        const msgDate = msg.timestamp
            ? new Date(msg.timestamp).toDateString()
            : null;

        // Insert date divider if the date changed
        if (msgDate && msgDate !== lastDate) {
            items.push({ type: 'date', date: msg.timestamp, key: `date-${msgDate}` });
            lastDate = msgDate;
        }

        items.push({ type: 'message', data: msg, key: msg.id || msg.tempId });
    });

    return items;
}

export default function ChatMessages({
    messages,
    isStaffTyping,
    hasMoreMessages,
    onLoadMore,
    onRetry,
    onMessageVisible,
}) {
    const containerRef = useRef(null);
    const bottomRef = useRef(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const isAtBottomRef = useRef(true);

    // ── Check if user is at bottom ──
    const checkIfAtBottom = useCallback(() => {
        const el = containerRef.current;
        if (!el) return true;
        const threshold = 100; // px from bottom
        return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }, []);

    // ── Scroll to bottom ──
    const scrollToBottom = useCallback((smooth = true) => {
        bottomRef.current?.scrollIntoView({
            behavior: smooth ? 'smooth' : 'instant',
        });
    }, []);

    // ── Auto-scroll when new messages arrive (only if already at bottom) ──
    useEffect(() => {
        if (isAtBottomRef.current) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    // ── Auto-scroll when typing indicator appears ──
    useEffect(() => {
        if (isStaffTyping && isAtBottomRef.current) {
            scrollToBottom();
        }
    }, [isStaffTyping, scrollToBottom]);

    // ── Handle scroll events ──
    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const atBottom = checkIfAtBottom();
        isAtBottomRef.current = atBottom;
        setShowScrollBtn(!atBottom);

        // Load more messages when scrolled to the top
        if (el.scrollTop === 0 && hasMoreMessages && onLoadMore) {
            onLoadMore();
        }
    }, [checkIfAtBottom, hasMoreMessages, onLoadMore]);

    // ── Mark unread staff messages as read when visible ──
    useEffect(() => {
        if (!onMessageVisible) return;

        const unreadStaffMessages = messages.filter(
            (m) => m.sender !== 'guest' && !m.read
        );

        unreadStaffMessages.forEach((msg) => {
            if (msg.id) onMessageVisible(msg.id);
        });
    }, [messages, onMessageVisible]);

    // ── Build the display list with date dividers ──
    const displayItems = buildMessageList(messages);

    // ── Empty state ──
    if (messages.length === 0) {
        return <EmptyChat />;
    }

    return (
        <div className="relative flex-1 flex flex-col min-h-0">
            {/* Message list */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-1 py-3 flex flex-col gap-3 scrollbar-thin"
            >
                {/* Load more indicator */}
                {hasMoreMessages && (
                    <div className="flex justify-center py-2">
                        <button
                            onClick={onLoadMore}
                            className="text-[11px] text-gray-500 bg-[#1a1a1a] border border-white/5
                                       rounded-full px-4 py-1.5 cursor-pointer hover:bg-[#222]
                                       transition-colors"
                        >
                            Load older messages
                        </button>
                    </div>
                )}

                {/* Messages + Date Dividers */}
                {displayItems.map((item) => {
                    if (item.type === 'date') {
                        return <DateDivider key={item.key} date={item.date} />;
                    }

                    const msg = item.data;
                    return (
                        <ChatBubble
                            key={item.key}
                            message={msg}
                            isOwn={msg.sender === 'guest'}
                            onRetry={onRetry}
                        />
                    );
                })}

                {/* Typing indicator */}
                {isStaffTyping && <TypingIndicator />}

                {/* Invisible scroll anchor */}
                <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom FAB */}
            <ScrollToBottom visible={showScrollBtn} onClick={() => scrollToBottom(true)} />
        </div>
    );
}

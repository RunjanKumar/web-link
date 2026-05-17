/**
 * ChatMessages — message list container.
 * Handles auto-scroll, scroll-to-bottom FAB, date dividers,
 * and triggers load-more on scroll-to-top.
 *
 * NOTE: TypingIndicator is commented out for now — will be enabled in the future.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import ChatBubble from './ChatBubble';
import DateDivider from './DateDivider';
// import TypingIndicator from './TypingIndicator'; // TODO: Enable when backend supports typing events
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
    hasMoreMessages,
    isLoadingMore,
    onLoadMore,
    onRetry,
    onMessageVisible,
}) {
    const containerRef = useRef(null);
    const bottomRef = useRef(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const isAtBottomRef = useRef(true);
    const prevScrollHeightRef = useRef(0);

    console.log('🖥️ [ChatMessages] Render. messages:', messages.length, '| hasMore:', hasMoreMessages, '| loadingMore:', isLoadingMore);

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

    // ── Preserve scroll position when loading older messages ──
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !isLoadingMore) return;
        prevScrollHeightRef.current = el.scrollHeight;
    }, [isLoadingMore]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || prevScrollHeightRef.current === 0) return;
        const newScrollHeight = el.scrollHeight;
        const diff = newScrollHeight - prevScrollHeightRef.current;
        if (diff > 0) {
            el.scrollTop += diff;
        }
        prevScrollHeightRef.current = 0;
    }, [messages]);

    // ── Handle scroll events ──
    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const atBottom = checkIfAtBottom();
        isAtBottomRef.current = atBottom;
        setShowScrollBtn(!atBottom);

        // Load more messages when scrolled to the top
        if (el.scrollTop <= 10 && hasMoreMessages && onLoadMore && !isLoadingMore) {
            onLoadMore();
        }
    }, [checkIfAtBottom, hasMoreMessages, onLoadMore, isLoadingMore]);

    // ── Mark unread staff messages as read when visible ──
    useEffect(() => {
        if (!onMessageVisible) return;

        const unreadStaffMessages = messages.filter(
            (m) => !m.isOwn && m.messageStatus < 3
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
                            disabled={isLoadingMore}
                            className={`text-[11px] text-gray-500 bg-[#1a1a1a] border border-white/5
                                       rounded-full px-4 py-1.5 cursor-pointer hover:bg-[#222]
                                       transition-colors ${isLoadingMore ? 'opacity-50' : ''}`}
                        >
                            {isLoadingMore ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full border border-gray-500 border-t-gray-300 animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                'Load older messages'
                            )}
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
                            onRetry={onRetry}
                        />
                    );
                })}

                {/* TypingIndicator — commented out for future use */}
                {/* {isStaffTyping && <TypingIndicator />} */}

                {/* Invisible scroll anchor */}
                <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom FAB */}
            <ScrollToBottom visible={showScrollBtn} onClick={() => scrollToBottom(true)} />
        </div>
    );
}

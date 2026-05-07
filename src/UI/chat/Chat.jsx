/**
 * ══════════════════════════════════════════════════════════════
 * CHAT PAGE — Orchestrator Component
 * ══════════════════════════════════════════════════════════════
 *
 * This is the main chat page. It is a THIN orchestrator only —
 * it connects the ViewModel to child components and does NOT
 * contain any business logic, socket code, or state management.
 *
 * Component Tree:
 *   Chat (this file)
 *   ├── ChatHeader          — back button, title, online status
 *   ├── ConnectionBanner    — offline/reconnecting/disconnected
 *   ├── LoadingChat         — skeleton loader (while loading)
 *   ├── ChatMessages        — message list container
 *   │   ├── DateDivider     — date separators
 *   │   ├── ChatBubble      — individual message
 *   │   │   └── MessageStatus — sent/read ticks
 *   │   ├── TypingIndicator — animated dots
 *   │   ├── ScrollToBottom  — FAB scroll button
 *   │   └── EmptyChat       — no messages state
 *   └── ChatInput           — text input + send button
 */
import useChatViewModel from '../../viewModel/chatViewModel';
import ChatHeader from './component/ChatHeader';
import ChatMessages from './component/ChatMessages';
import ChatInput from './component/ChatInput';
import ConnectionBanner from './component/ConnectionBanner';
import LoadingChat from './component/LoadingChat';
import './chat.css';

export default function Chat() {
    const {
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
    } = useChatViewModel();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1 min-h-0">

                {/* ── Header with online status ── */}
                <ChatHeader isConnected={isConnected} />

                {/* ── Connection status banner ── */}
                <ConnectionBanner status={connectionStatus} />

                {/* ── Chat Messages Area ── */}
                {isLoading ? (
                    <LoadingChat />
                ) : (
                    <ChatMessages
                        messages={messages}
                        isStaffTyping={isStaffTyping}
                        hasMoreMessages={hasMoreMessages}
                        onLoadMore={loadMoreMessages}
                        onRetry={retryMessage}
                        onMessageVisible={markAsRead}
                    />
                )}

                {/* ── Chat Input Bar ── */}
                <ChatInput
                    inputText={inputText}
                    setInputText={setInputText}
                    sendMessage={sendMessage}
                    onTyping={emitTyping}
                    isSending={isSending}
                    isConnected={isConnected}
                />
            </div>
        </div>
    );
}

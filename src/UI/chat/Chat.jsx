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
 *   │   ├── ChatBubble      — individual message (with show more/less)
 *   │   │   └── MessageStatus — WhatsApp-style ticks (✓ ✓✓ ✓✓blue)
 *   │   ├── ScrollToBottom  — FAB scroll button
 *   │   └── EmptyChat       — no messages state
 *   └── ChatInput           — text input + send button
 *
 * NOTE: TypingIndicator is commented out — will be enabled in future.
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
    } = useChatViewModel();

    console.log('🖥️ [Chat PAGE] Render. messages:', messages.length, '| loading:', isLoading, '| sending:', isSending, '| connected:', isConnected);

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
                        hasMoreMessages={hasMoreMessages}
                        isLoadingMore={isLoadingMore}
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
                    isSending={isSending}
                    isConnected={isConnected}
                />
            </div>
        </div>
    );
}

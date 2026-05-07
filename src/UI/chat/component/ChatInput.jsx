/**
 * ChatInput — message input bar with send button.
 * Sends message on Enter or button click.
 * NOTE: Typing indicator emission commented out — will be enabled in future.
 */
import { useCallback } from 'react';

export default function ChatInput({
    inputText,
    setInputText,
    sendMessage,
    // onTyping, // TODO: Enable when backend supports typing events
    isSending,
    isConnected,
}) {
    // Handle input change
    const handleChange = useCallback((e) => {
        setInputText(e.target.value);
        // if (onTyping) onTyping(); // TODO: Enable typing indicator in future
    }, [setInputText]);

    // Handle Enter key to send message
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    const hasText = inputText.trim().length > 0;

    return (
        <div className="mt-3">
            <div className={`bg-[#1a1a1a] rounded-full px-5 py-3 flex items-center gap-3
                           border transition-colors duration-200
                           ${hasText ? 'border-amber-500/30' : 'border-white/5'}`}>
                {/* Text Input */}
                <input
                    type="text"
                    value={inputText}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isConnected ? 'Write your message...' : 'Waiting for connection...'}
                    disabled={!isConnected && false} /* allow typing even offline — messages will queue */
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm
                              placeholder-gray-500 min-w-0"
                    autoComplete="off"
                />

                {/* Send Button */}
                <button
                    onClick={sendMessage}
                    disabled={!hasText || isSending}
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                              border-none cursor-pointer transition-all duration-200
                              ${hasText
                                  ? 'bg-amber-500 hover:bg-amber-400 scale-100'
                                  : 'bg-transparent scale-90'
                              }
                              ${isSending ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                    aria-label="Send message"
                >
                    {isSending ? (
                        /* Spinning loader when sending */
                        <div className="w-4 h-4 rounded-full border-2 border-[#0d0d0d]/20 border-t-[#0d0d0d] animate-spin" />
                    ) : (
                        <svg
                            width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke={hasText ? '#0d0d0d' : '#6b7280'}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

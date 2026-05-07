/**
 * ChatBubble — renders a single message bubble.
 * Handles alignment (guest right, staff left), styling, timestamp, and delivery status.
 */
import MessageStatus from './MessageStatus';

export default function ChatBubble({ message, isOwn, onRetry }) {
    const { text, timestamp, status, tempId } = message;

    // Format timestamp
    const time = timestamp
        ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    const isFailed = status === 'failed';

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
            <div
                className={`relative max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-200
                    ${isOwn
                        ? isFailed
                            ? 'bg-red-900/40 border border-red-500/30 text-white'
                            : 'bg-amber-500 text-[#0d0d0d]'
                        : 'bg-[#1a1a1a] text-white border border-white/5'
                    }
                    ${status === 'sending' ? 'opacity-70' : 'opacity-100'}
                `}
            >
                {/* Message text */}
                <p className="text-sm m-0 leading-relaxed">{text}</p>

                {/* Timestamp + Status row */}
                <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {time && (
                        <span className={`text-[10px] ${isOwn ? 'text-[#0d0d0d]/50' : 'text-gray-500'}`}>
                            {time}
                        </span>
                    )}
                    {isOwn && <MessageStatus status={status} />}
                </div>

                {/* Retry button for failed messages */}
                {isFailed && onRetry && (
                    <button
                        onClick={() => onRetry(tempId)}
                        className="absolute -bottom-6 right-0 text-[10px] text-red-400 bg-transparent border-none
                                   cursor-pointer hover:text-red-300 transition-colors flex items-center gap-1 p-0"
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}

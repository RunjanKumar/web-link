/**
 * ChatBubble — renders a single message bubble.
 * Features:
 *   • Alignment (guest right, staff left)
 *   • Timestamp + WhatsApp-style delivery status
 *   • "Show more / Show less" for long messages
 *   • Retry button for failed messages
 */
import { useState } from 'react';
import MessageStatus from './MessageStatus';

// ── Truncation threshold (characters) ──
const MAX_TEXT_LENGTH = 400;

export default function ChatBubble({ message, onRetry }) {
    const { text, timestamp, messageStatus, tempId, isOwn, isSending, isFailed } = message;
    const [isExpanded, setIsExpanded] = useState(false);


    // ── Format timestamp ──
    const time = timestamp
        ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    // ── Show more / Show less logic ──
    const isLongText = text.length > MAX_TEXT_LENGTH;
    const displayText = isLongText && !isExpanded
        ? text.slice(0, MAX_TEXT_LENGTH) + '...'
        : text;

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
                    ${isSending ? 'opacity-70' : 'opacity-100'}
                `}
            >
                {/* Message text */}
                <p className="text-sm m-0 leading-relaxed whitespace-pre-wrap break-words">
                    {displayText}
                </p>

                {/* Show more / Show less toggle */}
                {isLongText && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`text-[11px] font-semibold bg-transparent border-none cursor-pointer
                                   p-0 mt-1 transition-colors
                                   ${isOwn
                                       ? 'text-[#0d0d0d]/70 hover:text-[#0d0d0d]'
                                       : 'text-amber-400/80 hover:text-amber-400'
                                   }`}
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}

                {/* Timestamp + Status row */}
                <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {time && (
                        <span className={`text-[10px] ${isOwn ? 'text-[#0d0d0d]/50' : 'text-gray-500'}`}>
                            {time}
                        </span>
                    )}
                    {isOwn && (
                        <MessageStatus
                            status={messageStatus}
                            isSending={isSending}
                            isFailed={isFailed}
                        />
                    )}
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

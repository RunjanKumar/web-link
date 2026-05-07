/**
 * TypingIndicator — animated dots shown when staff is typing.
 * Renders 3 bouncing dots with staggered animation.
 */
export default function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <div className="typing-dot w-2 h-2 rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                <div className="typing-dot w-2 h-2 rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                <div className="typing-dot w-2 h-2 rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

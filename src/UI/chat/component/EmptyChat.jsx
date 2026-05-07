/**
 * EmptyChat — shown when there are no messages yet.
 * Encourages the user to start a conversation.
 */
export default function EmptyChat() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/5
                          flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>

            {/* Title */}
            <h3 className="text-white text-sm font-semibold m-0">
                No messages yet
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-xs text-center max-w-[240px] m-0 leading-relaxed">
                Send a message to the hotel reception. They're here to help with anything you need.
            </p>
        </div>
    );
}

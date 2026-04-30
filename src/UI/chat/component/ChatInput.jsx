export default function ChatInput({ inputText, setInputText, sendMessage }) {
    // Handle Enter key to send message
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="bg-[#1a1a1a] rounded-full px-5 py-3 flex items-center gap-3">
            {/* ── Text Input ── */}
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your message"
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 min-w-0"
            />

            {/* ── Send Button ── */}
            <button
                onClick={sendMessage}
                className="bg-transparent border-none flex items-center justify-center cursor-pointer shrink-0 p-0"
            >
                {/* TODO: Replace send icon with real icon from Figma if different */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </button>
        </div>
    );
}

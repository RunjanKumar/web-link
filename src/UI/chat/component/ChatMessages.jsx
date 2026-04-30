import { useEffect, useRef } from 'react';

export default function ChatMessages({ messages }) {
    const bottomRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-1 py-3 flex flex-col gap-4">
            {messages.map((msg) => {
                const isGuest = msg.sender === 'guest';

                return (
                    <div
                        key={msg.id}
                        className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                isGuest
                                    ? 'bg-amber-500 text-[#0d0d0d]'
                                    : 'bg-[#1a1a1a] text-white'
                            }`}
                        >
                            <p className="text-sm m-0 leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                );
            })}

            {/* Invisible element to scroll to */}
            <div ref={bottomRef} />
        </div>
    );
}

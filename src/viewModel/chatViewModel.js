import { useState, useCallback } from 'react';

// ── Dummy chat data (replace with real API data later) ──
const initialMessages = [
    {
        id: 1,
        text: 'Good evening! How may I assist you during your stay?',
        sender: 'staff',
    },
    {
        id: 2,
        text: 'Hi there! I just wanted to inquire about a few things',
        sender: 'guest',
    },
    {
        id: 3,
        text: 'Of course, I\'m here to help. What do you need assistance with?',
        sender: 'staff',
    },
    {
        id: 4,
        text: 'Sure, it seems like the air conditioning unit is not cooling the room properly. I\'ve adjusted the temperature settings, but it still feels warm and stuffy inside.',
        sender: 'guest',
    },
    {
        id: 5,
        text: 'I apologize for the inconvenience. Let me check our system to see if there are any reported issues with the air conditioning in your room. In the meantime, would you like us to send someone to take a look at it?',
        sender: 'staff',
    },
    {
        id: 6,
        text: 'Yes, that would be great. I appreciate your prompt assistance.',
        sender: 'guest',
    },
];

export default function useChatViewModel() {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');

    // Send a new message
    const sendMessage = useCallback(() => {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        const newMsg = {
            id: Date.now(),
            text: trimmed,
            sender: 'guest',
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
    }, [inputText]);

    return {
        messages,
        inputText,
        setInputText,
        sendMessage,
    };
}

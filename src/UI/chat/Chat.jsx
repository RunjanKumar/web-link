import BackButton from '../../globalComponents/BackButton';
import ChatMessages from './component/ChatMessages';
import ChatInput from './component/ChatInput';
import useChatViewModel from '../../viewModel/chatViewModel';

export default function Chat() {
    const { messages, inputText, setInputText, sendMessage } = useChatViewModel();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Chat Messages Area ── */}
                <ChatMessages messages={messages} />

                {/* ── Chat Input Bar ── */}
                <ChatInput
                    inputText={inputText}
                    setInputText={setInputText}
                    sendMessage={sendMessage}
                />
            </div>
        </div>
    );
}

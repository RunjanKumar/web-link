/**
 * ChatHeader — chat page header with back button, title, and online status.
 */
import BackButton from '../../../globalComponents/BackButton';

export default function ChatHeader({ isConnected }) {
    console.log('🖥️ [ChatHeader] Render. isConnected:', isConnected);
    return (
        <div className="flex items-center gap-3 mb-4">
            {/* Back button */}
            <BackButton />

            {/* Title area */}
            <div className="flex-1 ml-1">
                <h1 className="text-base font-semibold text-white m-0 leading-tight">
                    Reception
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {/* Online/offline dot */}
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                    <span className={`text-[11px] ${isConnected ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {isConnected ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Menu / more icon (placeholder for future) */}
            <button className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center
                             cursor-pointer hover:bg-[#222] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                </svg>
            </button>
        </div>
    );
}

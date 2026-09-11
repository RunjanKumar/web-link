import useRoomReadyViewModel from '../viewModel/roomReadyViewModel';

/**
 * RoomReadyBanner — "your room is ready, come and get the key".
 *
 * Mounted once at the app root, above the router, because the guest who needs it
 * is waiting in the lobby with the app open on whatever screen they wandered to.
 * It is dismissible, and renders nothing until the moment arrives.
 */
export default function RoomReadyBanner() {
    const { announcement, dismiss } = useRoomReadyViewModel();
    if (!announcement) return null;

    const room = announcement.roomNumber;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed top-0 left-0 right-0 z-[100] px-3 pt-3 pointer-events-none"
        >
            <div
                className="pointer-events-auto max-w-md md:max-w-2xl mx-auto flex items-start gap-3
                           bg-green-950/95 border border-green-700/70 rounded-2xl px-4 py-3 shadow-xl
                           backdrop-blur-sm"
            >
                <span className="h-9 w-9 shrink-0 rounded-full bg-green-500/15 flex items-center justify-center">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3" />
                    </svg>
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold m-0 leading-snug">
                        {room ? `Your room ${room} is ready` : 'Your room is ready'}
                    </p>
                    <p className="text-green-200/80 text-xs leading-relaxed mt-0.5 m-0">
                        Collect your key at reception.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-transparent
                               border-0 cursor-pointer text-green-200/70 hover:text-white transition-colors"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/**
 * Reusable Logout Modal component.
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Called when "Stay Logged In" is clicked
 * @param {function} onLogout - Called when "Log Out" is clicked
 *
 * Usage:
 *   <LogoutModal isOpen={showModal} onClose={() => setShowModal(false)} onLogout={handleLogout} />
 */
export default function LogoutModal({ isOpen, onClose, onLogout }) {
    if (!isOpen) return null;

    return (
        /* ── Backdrop ── */
        <div
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6"
            onClick={onClose}
        >
            {/* ── Modal Card ── */}
            <div
                className="bg-white rounded-2xl w-full max-w-[340px] pt-8 pb-4 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Emoji ── */}
                <div className="text-5xl mb-4">☺️</div>

                {/* ── Title ── */}
                <h2 className="text-xl font-bold text-[#0d0d0d] m-0 px-6">
                    Are You Ready to Log Out?
                </h2>

                {/* ── Description ── */}
                <p className="text-sm text-gray-500 leading-relaxed mt-3 mb-6 px-6 m-0">
                    Logging out will end your current session.
                    Don't forget to check your pending requests
                    or explore hotel services before you leave.
                </p>

                {/* ── Divider ── */}
                <div className="h-px bg-gray-200" />

                {/* ── Log Out Button ── */}
                <button
                    onClick={onLogout}
                    className="w-full py-4 bg-transparent border-none text-amber-500 text-lg font-semibold cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                >
                    Log Out
                </button>

                {/* ── Divider ── */}
                <div className="h-px bg-gray-200" />

                {/* ── Stay Logged In Button ── */}
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-transparent border-none text-blue-500 text-lg font-semibold cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                >
                    Stay Logged In
                </button>
            </div>
        </div>
    );
}

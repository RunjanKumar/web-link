import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';

/* ── Booking Status Constants ── */
const BOOKING_STATUS = {
    PENDING: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
    CANCEL: 4,
};

const STATUS_LABELS = {
    [BOOKING_STATUS.PENDING]: 'Pending',
    [BOOKING_STATUS.IN_PROGRESS]: 'In Progress',
    [BOOKING_STATUS.COMPLETED]: 'Completed',
    [BOOKING_STATUS.CANCEL]: 'Cancelled',
};

const STATUS_STYLES = {
    [BOOKING_STATUS.PENDING]: 'bg-yellow-500/15 border-yellow-500/60 text-yellow-400',
    [BOOKING_STATUS.IN_PROGRESS]: 'bg-blue-500/15 border-blue-500/60 text-blue-400',
    [BOOKING_STATUS.COMPLETED]: 'bg-green-500/15 border-green-500/60 text-green-400',
    [BOOKING_STATUS.CANCEL]: 'bg-red-500/15 border-red-500/60 text-red-400',
};

/* ── Success Toast ── */
function SuccessToast({ show, onClose }) {
    if (!show) return null;

    return (
        <div className="mb-5 bg-[#2d6a30] rounded-xl px-4 py-3 flex items-center gap-3 animate-slideDown">
            <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-white/20 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="text-white text-base font-bold m-0">Great!</p>
                <p className="text-white/80 text-xs m-0 mt-0.5">Your service request has been successfully submitted.</p>
            </div>
            <button
                onClick={onClose}
                className="shrink-0 w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-white/70 hover:text-white"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

/* ── Single pending service card (status only, no action buttons) ── */
function PendingServiceCard({ item }) {
    const isCompleted = item.status === BOOKING_STATUS.COMPLETED;
    const isCancelled = item.status === BOOKING_STATUS.CANCEL;

    return (
        <div className={`bg-[#111111] rounded-xl border border-gray-800/40 px-4 py-4 mb-3 transition-opacity duration-300 ${(isCompleted || isCancelled) ? 'opacity-50' : ''}`}>
            {/* Top row: name + time */}
            <div className="flex items-start justify-between gap-3">
                <h4 className="text-white text-sm font-semibold m-0 leading-snug">{item.name}</h4>
                <span className="text-gray-400 text-xs shrink-0">{item.requestedAt}</span>
            </div>

            {/* Description */}
            <p className="text-gray-500 text-xs m-0 mt-1 leading-relaxed">{item.description}</p>

            {/* Details (if added) */}
            {item.details && (
                <p className="text-yellow-400/70 text-xs m-0 mt-1.5 leading-relaxed italic">
                    Details : {item.details}
                </p>
            )}

            {/* Status badge */}
            <div className="flex items-center justify-end mt-3">
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                </span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── Pending Request Page ──
   ══════════════════════════════════════════════════ */
export default function PendingRequest() {
    const navigate = useNavigate();
    const location = useLocation();

    const showToastInitially = location.state?.showToast || false;
    const incomingItems = location.state?.submittedItems || [];

    // Build flat list with status and timestamp
    const [services] = useState(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

        return incomingItems.map((item) => ({
            ...item,
            status: BOOKING_STATUS.PENDING,
            requestedAt: timeStr,
        }));
    });

    const [showToast, setShowToast] = useState(showToastInitially);

    // Auto-dismiss toast after 4 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Group services by status for display order
    const pendingServices = services.filter((s) => s.status === BOOKING_STATUS.PENDING || s.status === BOOKING_STATUS.IN_PROGRESS);
    const completedServices = services.filter((s) => s.status === BOOKING_STATUS.COMPLETED);
    const cancelledServices = services.filter((s) => s.status === BOOKING_STATUS.CANCEL);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Success Toast ── */}
                <SuccessToast show={showToast} onClose={() => setShowToast(false)} />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-6 leading-tight">
                    Pending Request
                </h1>

                {/* ── Pending / In Progress Services ── */}
                {pendingServices.length > 0 && (
                    pendingServices.map((item) => (
                        <PendingServiceCard key={item.id} item={item} />
                    ))
                )}

                {/* ── Completed Services ── */}
                {completedServices.length > 0 && (
                    <>
                        <h2 className="text-gray-400 text-sm font-semibold m-0 mt-4 mb-3">Completed</h2>
                        {completedServices.map((item) => (
                            <PendingServiceCard key={item.id} item={item} />
                        ))}
                    </>
                )}

                {/* ── Cancelled Services ── */}
                {cancelledServices.length > 0 && (
                    <>
                        <h2 className="text-gray-400 text-sm font-semibold m-0 mt-4 mb-3">Cancelled</h2>
                        {cancelledServices.map((item) => (
                            <PendingServiceCard key={item.id} item={item} />
                        ))}
                    </>
                )}

                {/* ── Empty State ── */}
                {services.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">No service requests</p>
                    </div>
                )}

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Add New Request Button ── */}
                <button
                    onClick={() => navigate('/services')}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-4"
                >
                    Add New Request
                </button>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';

/* ── Booking Status Constants ── */
const BOOKING_STATUS = {
    PENDING: 1,
    CONFIRMED: 2,
    COMPLETED: 3,
    CANCELLED: 4,
};

const STATUS_LABELS = {
    [BOOKING_STATUS.PENDING]: 'Booking Pending',
    [BOOKING_STATUS.CONFIRMED]: 'Booking Confirm',
    [BOOKING_STATUS.COMPLETED]: 'Completed',
    [BOOKING_STATUS.CANCELLED]: 'Cancelled',
};

const STATUS_COLORS = {
    [BOOKING_STATUS.PENDING]: 'text-yellow-400',
    [BOOKING_STATUS.CONFIRMED]: 'text-green-400',
    [BOOKING_STATUS.COMPLETED]: 'text-blue-400',
    [BOOKING_STATUS.CANCELLED]: 'text-red-400',
};

/* ── Icons ── */
function CalendarIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function PeopleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function StatusIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

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
                <p className="text-white/80 text-xs m-0 mt-0.5">Your booking has been successfully submitted.</p>
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

/* ── Single Booking Card ── */
function BookingCard({ booking }) {
    const statusColor = STATUS_COLORS[booking.status] || 'text-gray-400';

    return (
        <div className="bg-[#111111] rounded-xl border border-gray-800/40 px-4 py-4 mb-4">
            {/* Date & Time */}
            <div className="flex items-center gap-3 mb-3">
                <CalendarIcon />
                <span className="text-gray-300 text-sm">{booking.dateTime}</span>
            </div>

            {/* Guests */}
            <div className="flex items-center gap-3 mb-3">
                <PeopleIcon />
                <span className="text-gray-300 text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
            </div>

            {/* Facility Name */}
            <div className="flex items-center gap-3 mb-3">
                <LocationIcon />
                <span className="text-gray-300 text-sm">{booking.facilityName}</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
                <StatusIcon />
                <span className={`text-sm font-semibold ${statusColor}`}>
                    {STATUS_LABELS[booking.status]}
                </span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── Upcoming Events Page ──
   ══════════════════════════════════════════════════ */
export default function UpcomingEvents() {
    const navigate = useNavigate();
    const location = useLocation();

    const showToastInitially = location.state?.showToast || false;
    const newBooking = location.state?.newBooking || null;
    const existingBookings = location.state?.bookings || [];

    // Build bookings list
    const [bookings] = useState(() => {
        const list = [...existingBookings];
        if (newBooking) {
            list.unshift({
                ...newBooking,
                id: Date.now(),
                status: BOOKING_STATUS.PENDING,
            });
        }
        return list;
    });

    const [showToast, setShowToast] = useState(showToastInitially);

    // Auto-dismiss toast after 4 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Success Toast ── */}
                <SuccessToast show={showToast} onClose={() => setShowToast(false)} />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-6 leading-tight">
                    Upcoming events
                </h1>

                {/* ── Booking Cards ── */}
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">No upcoming events</p>
                    </div>
                )}

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── New Booking Button ── */}
                <button
                    onClick={() => navigate('/facilities')}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-4"
                >
                    New Booking
                </button>
            </div>
        </div>
    );
}

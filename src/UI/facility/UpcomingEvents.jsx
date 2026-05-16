import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../../globalComponents/BackButton';
import useBookedFacilityViewModel from '../../viewModel/bookedFacilityViewModel';
import { formattedDate, formattedTime } from '../../utils/commonFunction';
import { BOOKING_STATUS, STATUS_LABELS, STATUS_STYLES } from '../../utils/constant';

/**
 * ══════════════════════════════════════════════════════════════
 * UPCOMING EVENTS / FACILITY BOOKINGS PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This page follows the EXACT same pattern as BookedService.jsx
 *
 * Compare side-by-side:
 *   BookedService.jsx → useBookedServiceModel → getServiceRequest()
 *   UpcomingEvents.jsx → useBookedFacilityViewModel → getFacilityReservations()
 *
 * Same MVVM pattern, different data source!
 */

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

/* ── Single Booking Card ── */
function BookingCard({ booking }) {
    // ── Adapt to backend field names ──
    const name = booking.name || booking.facilityName || booking.hotelFacilityId?.name || 'Facility';
    const dateTimeStr = booking.dateTime || booking.requestedAt || booking.createdAt;
    const guests = booking.numberOfPeople || booking.guests || '';
    const status = booking.status || BOOKING_STATUS.PENDING;

    const statusStyle = STATUS_STYLES[status] || 'bg-gray-500/15 border-gray-500/60 text-gray-400';
    const statusLabel = STATUS_LABELS[status] || 'Unknown';

    const isCompleted = status === BOOKING_STATUS.COMPLETED;
    const isCancelled = status === BOOKING_STATUS.CANCEL;

    return (
        <div className={`bg-[#111111] rounded-xl border border-gray-800/40 px-4 py-4 mb-4 transition-opacity duration-300 ${(isCompleted || isCancelled) ? 'opacity-50' : ''}`}>
            {/* Date & Time */}
            {dateTimeStr && (
                <div className="flex items-center gap-3 mb-3">
                    <CalendarIcon />
                    <span className="text-gray-300 text-sm">
                        {formattedDate(dateTimeStr)} {formattedTime(dateTimeStr)}
                    </span>
                </div>
            )}

            {/* Guests */}
            {guests && (
                <div className="flex items-center gap-3 mb-3">
                    <PeopleIcon />
                    <span className="text-gray-300 text-sm">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
            )}

            {/* Facility Name */}
            <div className="flex items-center gap-3 mb-3">
                <LocationIcon />
                <span className="text-gray-300 text-sm">{name}</span>
            </div>

            {/* Status badge */}
            <div className="flex items-center justify-end mt-3">
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${statusStyle}`}>
                    {statusLabel}
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

    // ── LEARNING: All data comes from the ViewModel ──
    // Compare with BookedService.jsx — exact same pattern!
    const {
        pendingReservations,
        inProgressReservations,
        completedReservations,
        cancelledReservations,
        hasAnyReservations,
        loading,
        error,
        refetch,
    } = useBookedFacilityViewModel();

    // Show success toast if navigated here after a successful booking
    useEffect(() => {
        if (showToastInitially) {
            toast.success('Your booking has been successfully submitted.');
            window.history.replaceState({}, '');
        }
    }, [showToastInitially]);

    // Show error toast when API fails
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-6 leading-tight">
                    My Bookings
                </h1>

                {/* ── Loading State ── */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading bookings…</p>
                        </div>
                    </div>
                )}

                {/* ── Error State ── */}
                {!loading && error && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-400 text-sm">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Booking Lists (grouped by status) ── */}
                {/* LEARNING: Same grouped-by-status pattern as BookedService.jsx */}
                {!loading && !error && (
                    <>
                        {/* ── Pending ── */}
                        {pendingReservations.length > 0 && (
                            <>
                                <h2 className="text-yellow-400/80 text-sm font-semibold m-0 mb-3">Pending</h2>
                                {pendingReservations.map((booking) => (
                                    <BookingCard key={booking._id} booking={booking} />
                                ))}
                            </>
                        )}

                        {/* ── In Progress / Confirmed ── */}
                        {inProgressReservations.length > 0 && (
                            <>
                                <h2 className="text-blue-400/80 text-sm font-semibold m-0 mt-4 mb-3">Confirmed</h2>
                                {inProgressReservations.map((booking) => (
                                    <BookingCard key={booking._id} booking={booking} />
                                ))}
                            </>
                        )}

                        {/* ── Completed ── */}
                        {completedReservations.length > 0 && (
                            <>
                                <h2 className="text-green-400/80 text-sm font-semibold m-0 mt-4 mb-3">Completed</h2>
                                {completedReservations.map((booking) => (
                                    <BookingCard key={booking._id} booking={booking} />
                                ))}
                            </>
                        )}

                        {/* ── Cancelled ── */}
                        {cancelledReservations.length > 0 && (
                            <>
                                <h2 className="text-red-400/80 text-sm font-semibold m-0 mt-4 mb-3">Cancelled</h2>
                                {cancelledReservations.map((booking) => (
                                    <BookingCard key={booking._id} booking={booking} />
                                ))}
                            </>
                        )}

                        {/* ── Empty State ── */}
                        {!hasAnyReservations && (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-500 text-sm">No bookings yet</p>
                            </div>
                        )}
                    </>
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

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../../globalComponents/BackButton';
import useBookedFacilityViewModel from '../../viewModel/bookedFacilityViewModel';
import BookingList from './components/BookingList';

/**
 * UpcomingEvents — Thin view layer (page).
 *
 * All business logic and data formatting lives in bookedFacilityViewModel.
 * This component only handles layout, navigation, and toast side-effects.
 */
export default function UpcomingEvents() {
    const navigate = useNavigate();
    const location = useLocation();
    const showToastInitially = location.state?.showToast || false;

    const {
        pendingReservations,
        approvedReservations,
        disapprovedReservations,
        hasAnyReservations,
        loading,
        error,
        refetch,
    } = useBookedFacilityViewModel();

    console.log('🖥️ [UpcomingEvents PAGE] Render. loading:', loading, '| error:', !!error, '| pending:', pendingReservations.length, '| approved:', approvedReservations.length);

    // Show success toast after a successful booking navigation
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

    /* ── Merge all bookings for the flat list ── */
    const allBookings = [
        ...pendingReservations,
        ...approvedReservations,
        ...disapprovedReservations,
    ];

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-6 leading-tight">
                    Upcoming events
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

                {/* ── Booking Cards ── */}
                {!loading && !error && (
                    <BookingList
                        bookings={allBookings}
                        hasAny={hasAnyReservations}
                        emptyMessage="No bookings yet"
                    />
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

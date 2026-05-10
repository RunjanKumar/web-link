import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';
import { useToast } from '../../globalComponents/Toast';
import { BOOKING_STATUS } from "../../utils/constant";
import BookedServiceCard from './components/BookedServiceCard';
import useBookedServiceModel from '../../viewModel/bookServiceViewModel';


/* ══════════════════════════════════════════════════
   ── Booked Service (Request History) Page ──
   ══════════════════════════════════════════════════ */
export default function BookedService() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { bookedServiceData, loading, error, refetch } = useBookedServiceModel();

    // Show success toast if navigated here after a successful submission
    const showToastInitially = location.state?.showToast || false;

    useEffect(() => {
        if (showToastInitially) {
            showToast('Your service request has been successfully submitted.', 'success');
            // Clear the navigation state so the toast doesn't re-appear on refresh
            window.history.replaceState({}, '');
        }
    }, [showToastInitially, showToast]);

    // Show error toast when API fails
    useEffect(() => {
        if (error) {
            showToast(error, 'error');
        }
    }, [error, showToast]);

    // ── Group services by status ──
    const pendingServices = bookedServiceData.filter(
        (s) => s.status === BOOKING_STATUS.PENDING
    );
    const inProgressServices = bookedServiceData.filter(
        (s) => s.status === BOOKING_STATUS.IN_PROGRESS
    );
    const completedServices = bookedServiceData.filter(
        (s) => s.status === BOOKING_STATUS.COMPLETED
    );
    const cancelledServices = bookedServiceData.filter(
        (s) => s.status === BOOKING_STATUS.CANCEL
    );

    const hasAnyServices = bookedServiceData.length > 0;

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-6 leading-tight">
                    Service Request
                </h1>

                {/* ── Loading State ── */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading requests…</p>
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

                {/* ── Service Lists (grouped by status) ── */}
                {!loading && !error && (
                    <>
                        {/* ── Pending Services ── */}
                        {pendingServices.length > 0 && (
                            <>
                                <h2 className="text-yellow-400/80 text-sm font-semibold m-0 mb-3">Pending</h2>
                                {pendingServices.map((item) => (
                                    <BookedServiceCard key={item._id} item={item} />
                                ))}
                            </>
                        )}

                        {/* ── In Progress Services ── */}
                        {inProgressServices.length > 0 && (
                            <>
                                <h2 className="text-blue-400/80 text-sm font-semibold m-0 mt-4 mb-3">In Progress</h2>
                                {inProgressServices.map((item) => (
                                    <BookedServiceCard key={item._id} item={item} />
                                ))}
                            </>
                        )}

                        {/* ── Completed Services ── */}
                        {completedServices.length > 0 && (
                            <>
                                <h2 className="text-green-400/80 text-sm font-semibold m-0 mt-4 mb-3">Completed</h2>
                                {completedServices.map((item) => (
                                    <BookedServiceCard key={item._id} item={item} />
                                ))}
                            </>
                        )}

                        {/* ── Cancelled Services ── */}
                        {cancelledServices.length > 0 && (
                            <>
                                <h2 className="text-red-400/80 text-sm font-semibold m-0 mt-4 mb-3">Cancelled</h2>
                                {cancelledServices.map((item) => (
                                    <BookedServiceCard key={item._id} item={item} />
                                ))}
                            </>
                        )}

                        {/* ── Empty State ── */}
                        {!hasAnyServices && (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-500 text-sm">No service requests</p>
                            </div>
                        )}
                    </>
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

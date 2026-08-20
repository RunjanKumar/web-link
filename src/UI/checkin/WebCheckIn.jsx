import { useNavigate } from 'react-router-dom';
import useWebCheckInViewModel from '../../viewModel/webCheckInViewModel';
import useCustomerProfile from '../../hooks/CustomerProfile';
import CheckInForm from './components/CheckInForm';
import CheckInPending from './components/CheckInPending';
import RejectionBanner from './components/RejectionBanner';
import PreArrivalCta from '../../globalComponents/PreArrivalCta';

/**
 * WebCheckIn — the pre-arrival registration page. An advance-booking guest lands
 * here (PortalModeGate) until staff approve their submission:
 *   FORM → fill & submit → PENDING (editable) → APPROVED (explore) | rejected → FORM + reason
 */
export default function WebCheckIn() {
    const vm = useWebCheckInViewModel();
    const { hotelData, customerData } = useCustomerProfile();
    const navigate = useNavigate();

    if (vm.screen === 'LOADING') {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
            </div>
        );
    }

    if (vm.screen === 'PENDING') {
        return (
            <CheckInPending
                submittedAt={vm.webCheckIn?.submittedAt}
                onEdit={vm.editSubmission}
            />
        );
    }

    if (vm.screen === 'APPROVED') {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-green-800 flex items-center justify-center mb-6">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                        stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold m-0 mb-3 leading-tight">You&apos;re all set!</h1>
                <p className="text-gray-400 text-sm leading-relaxed m-0 max-w-[300px]">
                    The hotel approved your web check-in. Explore everything on offer —
                    ordering unlocks once you&apos;re checked in on arrival.
                </p>
                <button
                    type="button"
                    onClick={async () => {
                        await vm.goExplore();
                        navigate('/dashboard', { replace: true });
                    }}
                    className="mt-8 bg-yellow-400 text-black font-semibold text-sm rounded-full px-8 py-3
                               hover:bg-yellow-300 transition-colors"
                >
                    Explore the hotel →
                </button>
            </div>
        );
    }

    // FORM (fresh, editing while pending, or after rejection)
    const checkInLabel = vm.booking?.checkInDate
        ? new Date(vm.booking.checkInDate).toDateString()
        : null;

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            <div className="max-w-md mx-auto px-4 pt-8 pb-6">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-1">
                        Web check-in
                    </p>
                    <h1 className="text-2xl font-bold m-0 leading-tight">
                        {hotelData?.name ? `Welcome to ${hotelData.name}` : 'Welcome'}
                        {customerData?.name ? `, ${customerData.name.split(' ')[0]}` : ''}
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                        Fill in your details before you arrive
                        {checkInLabel ? ` on ${checkInLabel}` : ''} and skip the paperwork at the desk.
                    </p>
                </div>

                <RejectionBanner reason={vm.rejectReason} />
                <CheckInForm vm={vm} />

                {/* The hotel's own questionnaire — separate from the statutory
                    details above, and answerable while this is still pending. */}
                <div className="mt-6">
                    <PreArrivalCta />
                </div>
            </div>
        </div>
    );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useWebCheckInViewModel, { STEP } from '../../viewModel/webCheckInViewModel';
import useCustomerProfile from '../../hooks/CustomerProfile';
import CheckInPending from './components/CheckInPending';
import CheckInApproved from './components/CheckInApproved';
import RejectionBanner from './components/RejectionBanner';
import ReviewSummary from './components/ReviewSummary';
import StepHeader from './components/StepHeader';
import StepNav from './components/StepNav';
import PreArrivalCta from '../../globalComponents/PreArrivalCta';
import SummaryStep from './steps/SummaryStep';
import PersonalStep from './steps/PersonalStep';
import AddressStep from './steps/AddressStep';
import IdentityStep from './steps/IdentityStep';
import TravelStep from './steps/TravelStep';
import CompanyStep from './steps/CompanyStep';
import RequestsStep from './steps/RequestsStep';
import ExtrasStep from './steps/ExtrasStep';
import ConsentStep from './steps/ConsentStep';
import ReviewStep from './steps/ReviewStep';

const STEP_COMPONENTS = {
    [STEP.SUMMARY]: SummaryStep,
    [STEP.PERSONAL]: PersonalStep,
    [STEP.ADDRESS]: AddressStep,
    [STEP.IDENTITY]: IdentityStep,
    [STEP.TRAVEL]: TravelStep,
    [STEP.COMPANY]: CompanyStep,
    [STEP.REQUESTS]: RequestsStep,
    // Present only when this hotel opted charges in for guests — the view-model
    // leaves EXTRAS out of `vm.steps` entirely when `offers` came back empty.
    [STEP.EXTRAS]: ExtrasStep,
    [STEP.CONSENT]: ConsentStep,
    [STEP.REVIEW]: ReviewStep,
};

/**
 * WebCheckIn — the pre-arrival registration page. An advance-booking guest lands
 * here (PortalModeGate) until staff approve their submission:
 *   FORM (9-step wizard) → submit → PENDING (editable) → APPROVED (explore)
 *   | rejected → FORM on the review step + reason
 */
export default function WebCheckIn() {
    const vm = useWebCheckInViewModel();
    const { hotelData, customerData, roomNumber } = useCustomerProfile();
    const navigate = useNavigate();

    // Each step opens at the top — the previous one may have been scrolled deep.
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [vm.stepIndex, vm.screen]);

    if (vm.screen === 'LOADING') {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
            </div>
        );
    }

    const summary = vm.submittedForm ? (
        <ReviewSummary
            form={vm.submittedForm}
            booking={vm.booking}
            consentDefinitions={vm.consentDefinitions}
            purposeOptions={vm.purposeOptions}
            travelModes={vm.travelModes}
            visaTypes={vm.visaTypes}
            hotelName={hotelData?.name}
            roomNumber={roomNumber}
        />
    ) : null;

    if (vm.screen === 'PENDING') {
        return (
            <CheckInPending
                submittedAt={vm.webCheckIn?.submittedAt}
                onEdit={vm.editSubmission}
                summary={summary}
            >
                {/* The hotel's own questionnaire stays answerable while this is under review. */}
                <PreArrivalCta />
            </CheckInPending>
        );
    }

    if (vm.screen === 'APPROVED') {
        return (
            <CheckInApproved
                checkInDate={vm.booking?.checkInDate}
                summary={summary}
                cardLoading={vm.cardLoading}
                cardUrl={vm.cardUrl}
                onDownloadCard={vm.downloadRegistrationCard}
                onExplore={async () => {
                    await vm.goExplore();
                    navigate('/dashboard', { replace: true });
                }}
            />
        );
    }

    // FORM (fresh, editing while pending, or after rejection) — the wizard.
    const step = vm.steps[vm.stepIndex];
    const StepComponent = STEP_COMPONENTS[step.key];
    const errorCount = Object.keys(vm.errors).length;
    const busy = vm.submitting || vm.uploading || vm.signatureState !== 'IDLE';
    const busyLabel = vm.submitting
        ? 'Submitting…'
        : vm.signatureState === 'PENDING' ? 'Saving your signature…' : 'Uploading…';

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            <div className="max-w-md md:max-w-2xl mx-auto px-4 pt-8 pb-6">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-1">
                        Web check-in
                    </p>
                    <h1 className="text-2xl font-bold m-0 leading-tight">
                        {hotelData?.name ? `Welcome to ${hotelData.name}` : 'Welcome'}
                        {customerData?.name ? `, ${customerData.name.split(' ')[0]}` : ''}
                    </h1>
                    {vm.isFirstStep ? (
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                            Complete your registration before you arrive and skip the paperwork at the desk.
                        </p>
                    ) : null}
                </div>

                <RejectionBanner reason={vm.rejectReason} />

                <StepHeader
                    index={vm.stepIndex}
                    total={vm.steps.length}
                    title={step.title}
                    subtitle={step.subtitle}
                    errorCount={errorCount}
                />

                <form
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        // Enter in a text input submits the form even while the Next
                        // button is disabled — hold the line while an upload is in flight.
                        if (busy) return;
                        if (vm.isReviewStep) vm.submit();
                        else vm.goNext();
                    }}
                >
                    <StepComponent vm={vm} />
                    <StepNav
                        showBack={!vm.isFirstStep}
                        onBack={vm.goBack}
                        busy={busy}
                        busyLabel={busyLabel}
                        nextLabel={
                            vm.isReviewStep
                                ? 'Submit for review'
                                : vm.returnToReview ? 'Save & back to review' : (vm.isFirstStep ? 'Yes, continue' : 'Next')
                        }
                    />
                </form>
            </div>
        </div>
    );
}

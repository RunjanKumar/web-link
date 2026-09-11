import useCustomerProfile from '../../../hooks/CustomerProfile';
import ReviewSummary from '../components/ReviewSummary';

/** Step 9 — everything, read-only, with an Edit link per section. */
export default function ReviewStep({ vm }) {
    const { hotelData, roomNumber } = useCustomerProfile();
    return (
        <div>
            <ReviewSummary
                form={vm.form}
                booking={vm.booking}
                consentDefinitions={vm.consentDefinitions}
                purposeOptions={vm.purposeOptions}
                travelModes={vm.travelModes}
                visaTypes={vm.visaTypes}
                onEdit={vm.editStep}
                hotelName={hotelData?.name}
                roomNumber={roomNumber}
            />
            <p className="text-gray-600 text-xs leading-relaxed mt-2 mb-4">
                By submitting you confirm these details are correct. The hotel reviews them before your
                arrival and will email you once approved — you can still edit until then.
            </p>
        </div>
    );
}

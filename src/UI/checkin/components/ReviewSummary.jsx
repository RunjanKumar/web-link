import { CDN_BASE_URL } from '../../../utils/constant';
import {
    STEP, PURPOSE_LABELS, TRAVEL_MODE_LABELS, VISA_TYPE_LABELS, OCI_VISA_TYPE, AADHAAR_ID_TYPE,
    DEFAULT_CONSENT_DEFINITIONS,
} from '../../../viewModel/webCheckInViewModel';
import {
    countryLabel, formatClock, formatDate, formatDayDate, isForeignGuest, isFormIIIExempt, titleCase,
} from '../../../utils/webCheckInHelpers';

/**
 * ReviewSummary — the read-only read-back of a submission, grouped the way the
 * wizard asked for it. Used on the review step (with Edit links), the PENDING
 * screen and the APPROVED screen (without). `purposeOptions` / `travelModes` /
 * `visaTypes` are the lists /me served (their labels win); the built-in labels
 * cover the rest.
 */

const optionLabel = (options, fallbackLabels, value) => {
    if (!value) return '';
    const hit = Array.isArray(options) ? options.find((o) => o.value === value) : null;
    return hit?.label || fallbackLabels[value] || titleCase(value);
};

function Row({ label, value }) {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex gap-3 py-1.5 border-b border-gray-800/60 last:border-b-0">
            <span className="text-gray-500 text-xs w-[38%] shrink-0">{label}</span>
            <span className="text-gray-200 text-xs min-w-0 break-words">{value}</span>
        </div>
    );
}

function Section({
    title, stepKey, onEdit, children,
}) {
    return (
        <section className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-white text-sm font-semibold m-0">{title}</h3>
                {onEdit ? (
                    <button
                        type="button"
                        onClick={() => onEdit(stepKey)}
                        className="text-yellow-400 text-xs font-medium hover:underline"
                        aria-label={`Edit ${title}`}
                    >
                        Edit
                    </button>
                ) : null}
            </div>
            <div>{children}</div>
        </section>
    );
}

const phone = (code, number) => (number ? [code, number].filter(Boolean).join(' ') : '');
const withDate = (date, time) => (time ? `${formatDayDate(date) || ''} ${formatClock(time)}`.trim() : '');

export default function ReviewSummary({
    form, booking, consentDefinitions, purposeOptions, travelModes, visaTypes, onEdit, hotelName, roomNumber,
}) {
    if (!form) return null;
    const isForeign = isForeignGuest(form);
    const isOci = form.isOciCardholder === true;
    // An OCI holder with no separate visa is filed with 'OCI' as the visa type (what submit sends).
    const visaType = form.visaType || (isOci && !form.ociHasVisa ? OCI_VISA_TYPE : '');
    const hasVisa = Boolean(form.visaNumber || form.visaPlaceOfIssue || form.visaIssueDate || form.visaExpiryDate);
    const hasIndiaEntry = Boolean(
        form.indiaArrivalDate || form.indiaArrivalTime || form.portOfEntry || form.arrivedFrom
        || typeof form.employedInIndia === 'boolean' || form.frroRegistrationNumber,
    );
    const defs = consentDefinitions?.length ? consentDefinitions : DEFAULT_CONSENT_DEFINITIONS;
    const consentLabel = (key) => defs.find((d) => d.key === key)?.label || titleCase(key);
    const acceptedConsents = Object.entries(form.consents || {}).filter(([, c]) => c?.accepted);
    const room = booking?.roomNumber || roomNumber;

    return (
        <div>
            <Section title="Your booking" stepKey={STEP.SUMMARY} onEdit={onEdit}>
                <Row label="Hotel" value={hotelName} />
                <Row
                    label="Room"
                    value={room ? `${room}${booking?.roomCategoryName ? ` · ${booking.roomCategoryName}` : ''}` : ''}
                />
                <Row label="Check-in" value={formatDayDate(booking?.checkInDate)} />
                <Row label="Check-out" value={formatDayDate(booking?.checkOutDate)} />
                <Row label="Guests" value={booking?.totalGuests} />
            </Section>

            <Section title="Personal details" stepKey={STEP.PERSONAL} onEdit={onEdit}>
                <Row label="Name" value={form.name} />
                <Row label="Email" value={form.email} />
                <Row label="Phone" value={phone(form.phoneCountryCode, form.phoneNumber)} />
                <Row label="Alternate phone" value={phone(form.alternatePhoneCountryCode, form.alternatePhoneNumber)} />
                <Row label="Gender" value={form.gender} />
                <Row label="Date of birth" value={formatDate(form.dateOfBirth)} />
                <Row label="Nationality" value={countryLabel(form.nationality)} />
                <Row label="Birth place" value={form.birthPlace} />
                <Row label="Birth country" value={countryLabel(form.birthCountry)} />
            </Section>

            <Section title="Home address" stepKey={STEP.ADDRESS} onEdit={onEdit}>
                <Row label="Address" value={[form.addressLine1, form.addressLine2].filter(Boolean).join(', ')} />
                <Row label="City" value={form.city} />
                <Row label="State" value={form.state} />
                <Row label="Postal code" value={form.postalCode} />
                <Row label="Country" value={countryLabel(form.country)} />
            </Section>

            <Section title="Identity document" stepKey={STEP.IDENTITY} onEdit={onEdit}>
                <Row label="ID type" value={form.idType} />
                <Row
                    label="ID number"
                    value={form.idNumber ? (form.idType === AADHAAR_ID_TYPE ? `XXXX XXXX ${form.idNumber}` : form.idNumber) : ''}
                />
                <Row
                    label="ID photos"
                    value={form.idDocument?.length ? (
                        <span className="flex gap-2 flex-wrap">
                            {form.idDocument.map((key, index) => (
                                <img
                                    key={key}
                                    src={`${CDN_BASE_URL}${key}`}
                                    alt={`ID document ${index + 1}`}
                                    className="w-14 h-10 object-cover rounded border border-gray-800"
                                />
                            ))}
                        </span>
                    ) : ''}
                />
                <Row
                    label="Your photo"
                    value={form.profilePic ? (
                        <img
                            src={`${CDN_BASE_URL}${form.profilePic}`}
                            alt="Guest"
                            className="w-10 h-10 object-cover rounded-full border border-gray-800"
                        />
                    ) : ''}
                />
                <Row label="OCI cardholder" value={isOci ? 'Yes' : ''} />
                <Row label="Passport" value={form.passportNumber} />
                {isForeign ? (
                    <>
                        <Row label="Passport issued at" value={form.passportPlaceOfIssue} />
                        <Row label="Passport issue date" value={formatDate(form.passportIssueDate)} />
                        <Row label="Passport expiry" value={formatDate(form.passportExpiryDate)} />
                        {isFormIIIExempt(form.nationality) ? (
                            <Row label="Form-III" value={<span className="text-gray-400">Exempt (Nepal/Bhutan citizen)</span>} />
                        ) : null}
                        <Row label="Visa type" value={optionLabel(visaTypes, VISA_TYPE_LABELS, visaType)} />
                        {hasVisa ? (
                            <>
                                <Row label="Visa number" value={form.visaNumber} />
                                <Row label="Visa issued at" value={form.visaPlaceOfIssue} />
                                <Row label="Visa issue date" value={formatDate(form.visaIssueDate)} />
                                <Row label="Visa expiry" value={formatDate(form.visaExpiryDate)} />
                            </>
                        ) : null}
                    </>
                ) : null}
            </Section>

            <Section title="Travel details" stepKey={STEP.TRAVEL} onEdit={onEdit}>
                <Row label="Arriving" value={withDate(booking?.checkInDate, form.arrivalTime)} />
                <Row label="Travelling by" value={optionLabel(travelModes, TRAVEL_MODE_LABELS, form.travelMode)} />
                <Row label="Flight / train / vehicle" value={form.travelNumber} />
                {isForeign && hasIndiaEntry ? (
                    <>
                        <Row label="Arrived in India" value={withDate(form.indiaArrivalDate, form.indiaArrivalTime) || formatDayDate(form.indiaArrivalDate)} />
                        <Row label="Port of entry" value={form.portOfEntry} />
                        <Row label="Arrived from" value={form.arrivedFrom} />
                        <Row label="Employed in India" value={typeof form.employedInIndia === 'boolean' ? (form.employedInIndia ? 'Yes' : 'No') : ''} />
                        <Row label="FRRO registration no." value={form.frroRegistrationNumber} />
                    </>
                ) : null}
                <Row label="Departing" value={withDate(booking?.checkOutDate, form.departureTime)} />
                <Row label="Next destination" value={form.nextDestination} />
                <Row label="Onward address" value={form.onwardAddress} />
                <Row label="Purpose of visit" value={optionLabel(purposeOptions, PURPOSE_LABELS, form.purposeOfVisit)} />
            </Section>

            <Section title="Company details" stepKey={STEP.COMPANY} onEdit={onEdit}>
                {form.needsCompanyInvoice ? (
                    <>
                        <Row label="Company" value={form.companyName} />
                        <Row label="GSTIN" value={form.companyGst} />
                        <Row
                            label="Address"
                            value={[
                                form.companyAddressLine1, form.companyAddressLine2, form.companyCity,
                                form.companyState, form.companyPostalCode, countryLabel(form.companyCountry),
                            ].filter(Boolean).join(', ')}
                        />
                        <Row label="Email" value={form.companyEmail} />
                    </>
                ) : (
                    <p className="text-gray-500 text-xs m-0">No GST invoice needed.</p>
                )}
            </Section>

            <Section title="Special requests" stepKey={STEP.REQUESTS} onEdit={onEdit}>
                {form.specialRequests ? (
                    <p className="text-gray-200 text-xs m-0 whitespace-pre-line">{form.specialRequests}</p>
                ) : (
                    <p className="text-gray-500 text-xs m-0">None.</p>
                )}
            </Section>

            <Section title="Consent & signature" stepKey={STEP.CONSENT} onEdit={onEdit}>
                <Row
                    label="Accepted"
                    value={acceptedConsents.length ? (
                        <span className="flex flex-col gap-0.5">
                            {acceptedConsents.map(([key]) => (
                                <span key={key} className="text-green-400">✓ {consentLabel(key)}</span>
                            ))}
                        </span>
                    ) : <span className="text-gray-500">Not yet accepted</span>}
                />
                <Row
                    label="Signed as"
                    value={form.signatureTypedName ? <span className="font-serif italic text-base">{form.signatureTypedName}</span> : ''}
                />
                <Row
                    label="Signature"
                    value={form.signatureImageKey ? (
                        <img
                            src={`${CDN_BASE_URL}${form.signatureImageKey}`}
                            alt="Drawn signature"
                            className="h-12 max-w-[180px] object-contain rounded bg-white border border-gray-800"
                        />
                    ) : ''}
                />
            </Section>
        </div>
    );
}

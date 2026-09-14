import Field, { SectionCard } from '../components/Field';
import { inputCls } from '../components/formStyles';
import { formatDayDate } from '../../../utils/webCheckInHelpers';

const EXEMPT_HINT = 'Nepal/Bhutan citizens are exempt from Form-III reporting — these fields are optional.';

/**
 * Step 5 — arrival and departure. Times are captured as 'HH:mm' and composed
 * with the stay dates on submit ('YYYY-MM-DDTHH:mm', what the booking stores).
 * Foreign guests also record their entry into India (Form-III): the arrival
 * date + time compose the same way, from the two inputs here.
 */
export default function TravelStep({ vm }) {
    const {
        form, errors, setField, booking, travelModes, purposeOptions, foreign,
    } = vm;
    const bind = (field, controlProps) => ({
        ...controlProps,
        value: form[field],
        onChange: (e) => setField(field, e.target.value),
        className: inputCls(Boolean(errors[field])),
    });
    const checkInLabel = formatDayDate(booking?.checkInDate);
    const checkOutLabel = formatDayDate(booking?.checkOutDate);
    const { foreign: isForeign, exempt, passportRequired: entryRequired } = foreign;
    const opt = (required) => (required ? '' : ' (optional)');
    const employedError = errors.employedInIndia;

    return (
        <div>
            <SectionCard title="Arrival" subtitle={checkInLabel ? `You check in on ${checkInLabel}.` : undefined}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field id="wc-arrival-time" label="Expected arrival time" required error={errors.arrivalTime} hint="Local time at the hotel.">
                        {(p) => <input type="time" {...bind('arrivalTime', p)} />}
                    </Field>
                    <Field id="wc-travel-mode" label="Travelling by (optional)" error={errors.travelMode}>
                        {(p) => (
                            <select {...bind('travelMode', p)}>
                                <option value="">Select</option>
                                {travelModes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        )}
                    </Field>
                </div>
                <Field id="wc-travel-number" label="Flight / train / vehicle number (optional)" error={errors.travelNumber}>
                    {(p) => <input type="text" placeholder="e.g. AI-302, 12951, KA 01 AB 1234" {...bind('travelNumber', p)} />}
                </Field>
            </SectionCard>

            {isForeign ? (
                <SectionCard
                    title="Entry into India"
                    subtitle="For your Form-III (FRRO) registration — as stamped in your passport."
                >
                    {exempt ? (
                        <p
                            className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-3 py-2.5 text-gray-400 text-xs m-0"
                            role="note"
                        >
                            {EXEMPT_HINT}
                        </p>
                    ) : null}
                    <Field
                        id="wc-india-arrival-date"
                        label={`Date & time of arrival in India${opt(entryRequired)}`}
                        required={entryRequired}
                        error={errors.indiaArrivalDate || errors.indiaArrivalTime}
                        hint="If you are already in India, the date you last entered the country."
                    >
                        {(p) => (
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="date"
                                    {...bind('indiaArrivalDate', p)}
                                    aria-invalid={errors.indiaArrivalDate ? true : undefined}
                                />
                                <input
                                    type="time"
                                    id="wc-india-arrival-time"
                                    aria-label="Time of arrival in India"
                                    aria-required={entryRequired || undefined}
                                    aria-invalid={errors.indiaArrivalTime ? true : undefined}
                                    aria-describedby={p['aria-describedby']}
                                    value={form.indiaArrivalTime}
                                    onChange={(e) => setField('indiaArrivalTime', e.target.value)}
                                    className={inputCls(Boolean(errors.indiaArrivalTime))}
                                />
                            </div>
                        )}
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field id="wc-port-of-entry" label={`Port of entry${opt(entryRequired)}`} required={entryRequired} error={errors.portOfEntry}>
                            {(p) => <input type="text" placeholder="e.g. Delhi (DEL) airport" {...bind('portOfEntry', p)} />}
                        </Field>
                        <Field id="wc-arrived-from" label={`Arrived from${opt(entryRequired)}`} required={entryRequired} error={errors.arrivedFrom}>
                            {(p) => <input type="text" placeholder="City, country" {...bind('arrivedFrom', p)} />}
                        </Field>
                    </div>
                    <Field
                        id="wc-employed-in-india"
                        label={`Employed in India?${opt(entryRequired)}`}
                        required={entryRequired}
                        group
                        error={employedError}
                    >
                        <div className="flex gap-6">
                            {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map((choice) => {
                                const id = `wc-employed-in-india-${choice.label.toLowerCase()}`;
                                return (
                                    <label key={id} htmlFor={id} className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                                        <input
                                            id={id}
                                            type="radio"
                                            name="wc-employed-in-india"
                                            checked={form.employedInIndia === choice.value}
                                            onChange={() => setField('employedInIndia', choice.value)}
                                            aria-invalid={employedError ? true : undefined}
                                            className="h-4 w-4 accent-yellow-400"
                                        />
                                        {choice.label}
                                    </label>
                                );
                            })}
                        </div>
                    </Field>
                    <Field
                        id="wc-frro-number"
                        label="FRRO registration number (optional)"
                        error={errors.frroRegistrationNumber}
                        hint="Only if you have already registered with the FRRO on this visit."
                    >
                        {(p) => <input type="text" autoComplete="off" placeholder="Registration number" {...bind('frroRegistrationNumber', p)} />}
                    </Field>
                </SectionCard>
            ) : null}

            <SectionCard title="Departure" subtitle={checkOutLabel ? `You check out on ${checkOutLabel}.` : undefined}>
                <Field id="wc-departure-time" label="Expected departure time (optional)" error={errors.departureTime}>
                    {(p) => <input type="time" {...bind('departureTime', p)} />}
                </Field>
                {/* Form-III fields, so required of foreign nationals only (the same
                    `entryRequired` gate the Entry-into-India block uses). Shown to
                    everyone, because the guest register prints them when given. */}
                <Field
                    id="wc-next-destination"
                    label={`Next destination${opt(entryRequired)}`}
                    required={entryRequired}
                    error={errors.nextDestination}
                >
                    {(p) => <input type="text" placeholder="City / town you travel to next" {...bind('nextDestination', p)} />}
                </Field>
                <Field
                    id="wc-onward-address"
                    label={`Onward address${opt(entryRequired)}`}
                    required={entryRequired}
                    error={errors.onwardAddress}
                    hint={
                        entryRequired
                            ? 'Indian hotel registration law requires the address you are proceeding to after your stay.'
                            : 'Helps us complete your registration card. Home is fine.'
                    }
                >
                    {(p) => (
                        <textarea
                            rows={3}
                            placeholder="Where you will be staying next (home is fine)"
                            {...bind('onwardAddress', p)}
                            className={`${inputCls(Boolean(errors.onwardAddress))} resize-none min-h-[88px]`}
                        />
                    )}
                </Field>
            </SectionCard>

            <SectionCard title="Purpose of visit">
                <Field id="wc-purpose" label="Purpose of visit" required error={errors.purposeOfVisit}>
                    {(p) => (
                        <select {...bind('purposeOfVisit', p)}>
                            <option value="">Select</option>
                            {purposeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    )}
                </Field>
            </SectionCard>
        </div>
    );
}

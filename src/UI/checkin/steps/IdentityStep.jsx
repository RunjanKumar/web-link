import { useRef } from 'react';
import { CDN_BASE_URL } from '../../../utils/constant';
import Field, { SectionCard } from '../components/Field';
import { inputCls, tickCls } from '../components/formStyles';
import IdDocumentUpload from '../components/IdDocumentUpload';
import { AADHAAR_ID_TYPE, ID_TYPE_OPTIONS } from '../../../viewModel/webCheckInViewModel';

/** The wizard's tick-box (same look as consents and the company toggle). */
function TickBox({
    id, checked, onToggle, label, hint, small,
}) {
    return (
        <button
            type="button"
            id={id}
            role="checkbox"
            aria-checked={checked}
            onClick={() => onToggle(!checked)}
            className="flex items-start gap-3 text-left w-full"
        >
            <span className={tickCls(checked)}>
                {checked ? (
                    <svg className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                    </svg>
                ) : null}
            </span>
            <span className="min-w-0">
                <span className={`block text-white ${small ? 'text-xs' : 'text-sm'} font-medium`}>{label}</span>
                {hint ? <span className="block text-xs text-gray-500 mt-0.5">{hint}</span> : null}
            </span>
        </button>
    );
}

const EXEMPT_HINT = 'Nepal/Bhutan citizens are exempt from Form-III reporting — these fields are optional.';

/**
 * Step 4 — the ID the guest will carry. Aadhaar is last-4 only (never the
 * 12-digit number) and the photo must be the UIDAI masked copy. Passport and
 * visa (the Form-III source fields) become required for foreign guests: anyone
 * resident outside India, an OCI cardholder, or a foreign national — except
 * Nepal/Bhutan nationals, who are exempt.
 */
export default function IdentityStep({ vm }) {
    const {
        form, errors, setField, setIdType, foreign, visaTypes, uploading,
        uploadDocument, removeDocument, uploadSelfie,
    } = vm;
    const selfieInputRef = useRef(null);
    const isAadhaar = form.idType === AADHAAR_ID_TYPE;
    const {
        foreign: isForeign, exempt, oci, passportRequired, visaRequired, visaShown,
    } = foreign;
    const opt = (required) => (required ? '' : ' (optional)');

    const bind = (field, controlProps) => ({
        ...controlProps,
        value: form[field],
        onChange: (e) => setField(field, e.target.value),
        className: inputCls(Boolean(errors[field])),
    });

    const ociTick = (
        <TickBox
            id="wc-oci"
            checked={form.isOciCardholder === true}
            onToggle={(next) => setField('isOciCardholder', next)}
            label="I hold an OCI (Overseas Citizen of India) card"
            hint="OCI cardholders are registered with the FRRO even when living in India."
        />
    );

    return (
        <div>
            <SectionCard title="Identity document" subtitle="A clear photo of the ID you'll carry — verified by the front desk.">
                <Field id="wc-id-type" label="ID type" required error={errors.idType}>
                    {(p) => (
                        <select
                            {...p}
                            value={form.idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className={inputCls(Boolean(errors.idType))}
                        >
                            <option value="">Select ID type</option>
                            {ID_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    )}
                </Field>

                {isAadhaar ? (
                    <Field
                        id="wc-id-number"
                        label="Aadhaar — last 4 digits only"
                        required
                        error={errors.idNumber}
                        hint="Enter only the last 4 digits. We never ask for, or store, your full 12-digit Aadhaar number."
                    >
                        {(p) => (
                            <input
                                {...p}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                autoComplete="off"
                                placeholder="1234"
                                value={form.idNumber}
                                onChange={(e) => setField('idNumber', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className={`${inputCls(Boolean(errors.idNumber))} tracking-[0.3em] md:w-40`}
                            />
                        )}
                    </Field>
                ) : (
                    <Field id="wc-id-number" label="ID number" required error={errors.idNumber}>
                        {(p) => <input type="text" placeholder="As printed on the document" {...bind('idNumber', p)} />}
                    </Field>
                )}

                <Field
                    id="wc-id-photos"
                    label="ID photos"
                    required
                    group
                    error={errors.idDocument}
                    hint={isAadhaar ? (
                        <span className="block bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-3 py-2.5 text-gray-400">
                            <span className="block text-yellow-300 text-xs font-semibold">Upload your masked Aadhaar only</span>
                            <span className="block mt-1">
                                Download it from{' '}
                                <a
                                    href="https://myaadhaar.uidai.gov.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-yellow-400 underline"
                                >
                                    myaadhaar.uidai.gov.in
                                </a>
                                {' '}(first 8 digits hidden). Do not upload an unmasked copy — the masked
                                form is the only one UIDAI permits hotels to keep.
                            </span>
                        </span>
                    ) : undefined}
                >
                    <IdDocumentUpload
                        documents={form.idDocument}
                        uploading={uploading}
                        onUpload={uploadDocument}
                        onRemove={removeDocument}
                    />
                </Field>

                <Field id="wc-selfie" label="Your photo (optional)" group>
                    <div className="flex items-center gap-3">
                        {form.profilePic ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-800">
                                <img
                                    src={`${CDN_BASE_URL}${form.profilePic}`}
                                    alt="Guest"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-dashed border-gray-700
                                            flex items-center justify-center text-gray-600 text-lg" aria-hidden="true">
                                🙂
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => selfieInputRef.current?.click()}
                            disabled={uploading}
                            className="text-yellow-400 text-xs font-medium border border-yellow-400/30 rounded-full px-4 py-2
                                       hover:bg-yellow-400/10 transition-colors disabled:opacity-50"
                        >
                            {form.profilePic ? 'Change photo' : 'Add a photo'}
                        </button>
                        <input
                            ref={selfieInputRef}
                            aria-label="Choose your photo"
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadSelfie(file);
                                e.target.value = '';
                            }}
                        />
                    </div>
                </Field>
            </SectionCard>

            {isForeign ? (
                <SectionCard
                    title="Passport & visa"
                    subtitle={oci
                        ? 'Required for OCI cardholders (Form-III registration).'
                        : 'Required for international guests (Form-III registration).'}
                >
                    {ociTick}
                    {exempt ? (
                        <p
                            className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-3 py-2.5 text-gray-400 text-xs m-0"
                            role="note"
                        >
                            {EXEMPT_HINT}
                        </p>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field id="wc-passport" label={`Passport number${opt(passportRequired)}`} required={passportRequired} error={errors.passportNumber}>
                            {(p) => <input type="text" autoComplete="off" placeholder="Passport number" {...bind('passportNumber', p)} />}
                        </Field>
                        <Field id="wc-passport-place" label={`Passport place of issue${opt(passportRequired)}`} required={passportRequired} error={errors.passportPlaceOfIssue}>
                            {(p) => <input type="text" placeholder="City / authority on the passport" {...bind('passportPlaceOfIssue', p)} />}
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field id="wc-passport-issue" label={`Passport issue date${opt(passportRequired)}`} required={passportRequired} error={errors.passportIssueDate}>
                            {(p) => <input type="date" max={form.passportExpiryDate || undefined} {...bind('passportIssueDate', p)} />}
                        </Field>
                        <Field id="wc-passport-expiry" label={`Passport expiry date${opt(passportRequired)}`} required={passportRequired} error={errors.passportExpiryDate}>
                            {(p) => <input type="date" min={form.passportIssueDate || undefined} {...bind('passportExpiryDate', p)} />}
                        </Field>
                    </div>

                    {oci ? (
                        <TickBox
                            id="wc-oci-has-visa"
                            small
                            checked={form.ociHasVisa === true}
                            onToggle={(next) => setField('ociHasVisa', next)}
                            label="I also have a visa"
                            hint="Most OCI cardholders travel on the card alone — tick this only if you hold a separate visa."
                        />
                    ) : null}

                    {visaShown ? (
                        <>
                            <Field id="wc-visa-type" label={`Visa type${opt(visaRequired)}`} required={visaRequired} error={errors.visaType}>
                                {(p) => (
                                    <select {...bind('visaType', p)}>
                                        <option value="">Select visa type</option>
                                        {visaTypes.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                                    </select>
                                )}
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field id="wc-visa-number" label={`Visa number${opt(visaRequired)}`} required={visaRequired} error={errors.visaNumber}>
                                    {(p) => <input type="text" autoComplete="off" placeholder="Visa number" {...bind('visaNumber', p)} />}
                                </Field>
                                <Field id="wc-visa-place" label={`Visa place of issue${opt(visaRequired)}`} required={visaRequired} error={errors.visaPlaceOfIssue}>
                                    {(p) => <input type="text" placeholder="Place of issue" {...bind('visaPlaceOfIssue', p)} />}
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field id="wc-visa-issue" label={`Visa issue date${opt(visaRequired)}`} required={visaRequired} error={errors.visaIssueDate}>
                                    {(p) => <input type="date" max={form.visaExpiryDate || undefined} {...bind('visaIssueDate', p)} />}
                                </Field>
                                <Field id="wc-visa-expiry" label={`Visa expiry date${opt(visaRequired)}`} required={visaRequired} error={errors.visaExpiryDate}>
                                    {(p) => <input type="date" min={form.visaIssueDate || undefined} {...bind('visaExpiryDate', p)} />}
                                </Field>
                            </div>
                        </>
                    ) : null}
                </SectionCard>
            ) : (
                <SectionCard title="Passport (optional)">
                    {ociTick}
                    <Field id="wc-passport" label="Passport number" error={errors.passportNumber}>
                        {(p) => <input type="text" autoComplete="off" placeholder="Passport number" {...bind('passportNumber', p)} />}
                    </Field>
                </SectionCard>
            )}
        </div>
    );
}

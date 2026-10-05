import Field, { SectionCard } from '../components/Field';
import { errorCls, inputCls, tickCls } from '../components/formStyles';
import SignaturePad from '../components/SignaturePad';

/**
 * Step 8 — the consents (from /me, or the built-in set on an older backend),
 * the typed signature and an optional drawn one.
 */
function ConsentTick({
    def, checked, error, onToggle,
}) {
    const id = `wc-consent-${def.key}`;
    const errorId = `${id}-error`;
    return (
        <div className="border-b border-gray-800/60 last:border-b-0 pb-4 last:pb-0">
            <button
                type="button"
                id={id}
                role="checkbox"
                aria-checked={checked}
                aria-required={def.required || undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onClick={() => onToggle(!checked)}
                className="flex items-start gap-3 text-left w-full"
            >
                <span className={tickCls(checked, Boolean(error))}>
                    {checked ? (
                        <svg className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                        </svg>
                    ) : null}
                </span>
                <span className="min-w-0">
                    <span className="block text-sm text-white font-medium">
                        {def.label}
                        {def.required ? <span className="text-yellow-400 ml-0.5" aria-hidden="true">*</span> : <span className="text-gray-600 text-xs ml-1.5">(optional)</span>}
                    </span>
                    {def.text ? (
                        <span className="block text-xs text-gray-400 leading-relaxed mt-1 whitespace-pre-line">{def.text}</span>
                    ) : null}
                </span>
            </button>
            {error ? <p id={errorId} role="alert" className={`${errorCls} ml-8`}>{error}</p> : null}
        </div>
    );
}

export default function ConsentStep({ vm }) {
    const {
        form, errors, setField, setConsent, consentDefinitions, consentVersion,
        signatureState, markSignaturePending, uploadSignature, clearSignature, submitting,
    } = vm;

    return (
        <div>
            <SectionCard
                title="Please read and accept"
                subtitle={consentVersion ? `Terms version ${consentVersion}` : undefined}
            >
                <div className="flex flex-col gap-4">
                    {consentDefinitions.map((def) => (
                        <ConsentTick
                            key={def.key}
                            def={def}
                            checked={form.consents?.[def.key]?.accepted === true}
                            error={errors[`consent.${def.key}`]}
                            onToggle={(accepted) => setConsent(def.key, accepted)}
                        />
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Sign" subtitle="Typing your full name is your signature. Drawing one is optional.">
                <Field id="wc-signature-name" label="Type your full name" required error={errors.signatureTypedName}>
                    {(p) => (
                        <input
                            {...p}
                            type="text"
                            autoComplete="off"
                            placeholder="Your full name"
                            value={form.signatureTypedName}
                            onChange={(e) => setField('signatureTypedName', e.target.value)}
                            className={`${inputCls(Boolean(errors.signatureTypedName))} font-serif italic text-base`}
                        />
                    )}
                </Field>
                <Field id="wc-signature-pad" label="Draw your signature (optional)" group>
                    <SignaturePad
                        id="wc-signature-canvas"
                        imageKey={form.signatureImageKey}
                        uploading={signatureState === 'UPLOADING'}
                        disabled={submitting}
                        onPending={markSignaturePending}
                        onExport={uploadSignature}
                        onClear={clearSignature}
                    />
                </Field>
            </SectionCard>
        </div>
    );
}

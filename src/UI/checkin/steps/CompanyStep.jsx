import Field, { SectionCard } from '../components/Field';
import { inputCls, tickCls } from '../components/formStyles';
import { COUNTRY_OPTIONS } from '../../../viewModel/webCheckInViewModel';

/** Step 6 — optional: the company a GST invoice should be raised to. */
export default function CompanyStep({ vm }) {
    const { form, errors, setField } = vm;
    const on = form.needsCompanyInvoice;
    const bind = (field, controlProps) => ({
        ...controlProps,
        value: form[field],
        onChange: (e) => setField(field, e.target.value),
        className: inputCls(Boolean(errors[field])),
    });

    return (
        <div>
            <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
                <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => setField('needsCompanyInvoice', !on)}
                    className="flex items-start gap-3 text-left w-full"
                >
                    <span className={tickCls(on)}>
                        {on ? (
                            <svg className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                            </svg>
                        ) : null}
                    </span>
                    <span>
                        <span className="block text-sm text-white font-medium">I need a GST invoice for a company</span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                            Skip this if you are paying personally — you can still add it at the desk.
                        </span>
                    </span>
                </button>
            </div>

            {on ? (
                <SectionCard title="Company details" subtitle="Printed on the invoice exactly as entered.">
                    <Field id="wc-company-name" label="Company name" required error={errors.companyName}>
                        {(p) => <input type="text" autoComplete="organization" placeholder="Registered company name" {...bind('companyName', p)} />}
                    </Field>
                    <Field id="wc-company-gst" label="GSTIN" required error={errors.companyGst} hint="15 characters, e.g. 22AAAAA0000A1Z5.">
                        {(p) => (
                            <input
                                {...p}
                                type="text"
                                maxLength={15}
                                placeholder="22AAAAA0000A1Z5"
                                value={form.companyGst}
                                onChange={(e) => setField('companyGst', e.target.value.toUpperCase().replace(/\s/g, ''))}
                                className={`${inputCls(Boolean(errors.companyGst))} uppercase tracking-wider`}
                            />
                        )}
                    </Field>
                    <Field id="wc-company-email" label="Company email (optional)" error={errors.companyEmail}>
                        {(p) => <input type="email" inputMode="email" placeholder="accounts@company.com" {...bind('companyEmail', p)} />}
                    </Field>
                    <Field id="wc-company-address1" label="Address line 1 (optional)" error={errors.companyAddressLine1}>
                        {(p) => <input type="text" placeholder="Building, street" {...bind('companyAddressLine1', p)} />}
                    </Field>
                    <Field id="wc-company-address2" label="Address line 2 (optional)" error={errors.companyAddressLine2}>
                        {(p) => <input type="text" placeholder="Area, landmark" {...bind('companyAddressLine2', p)} />}
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field id="wc-company-country" label="Country (optional)" error={errors.companyCountry}>
                            {(p) => (
                                <select {...bind('companyCountry', p)}>
                                    <option value="">Select country</option>
                                    {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                                </select>
                            )}
                        </Field>
                        <Field id="wc-company-state" label="State (optional)" error={errors.companyState}>
                            {(p) => <input type="text" placeholder="State / province" {...bind('companyState', p)} />}
                        </Field>
                        <Field id="wc-company-city" label="City (optional)" error={errors.companyCity}>
                            {(p) => <input type="text" placeholder="City" {...bind('companyCity', p)} />}
                        </Field>
                        <Field id="wc-company-postal" label="Postal code (optional)" error={errors.companyPostalCode}>
                            {(p) => <input type="text" placeholder="Postal code" {...bind('companyPostalCode', p)} />}
                        </Field>
                    </div>
                </SectionCard>
            ) : null}
        </div>
    );
}

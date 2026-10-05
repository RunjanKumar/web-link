import Field, { SectionCard } from '../components/Field';
import { inputCls } from '../components/formStyles';
import { COUNTRY_OPTIONS } from '../../../viewModel/webCheckInViewModel';

/** Step 3 — permanent address (line 1 required; the rest as the desk collects it). */
export default function AddressStep({ vm }) {
    const { form, errors, setField } = vm;
    const bind = (field, controlProps) => ({
        ...controlProps,
        value: form[field],
        onChange: (e) => setField(field, e.target.value),
        className: inputCls(Boolean(errors[field])),
    });

    return (
        <SectionCard title="Permanent address" subtitle="Printed on your registration card.">
            <Field id="wc-address1" label="Address line 1" required error={errors.addressLine1}>
                {(p) => <input type="text" autoComplete="address-line1" placeholder="House / flat no., building, street" {...bind('addressLine1', p)} />}
            </Field>
            <Field id="wc-address2" label="Address line 2 (optional)" error={errors.addressLine2}>
                {(p) => <input type="text" autoComplete="address-line2" placeholder="Area, landmark" {...bind('addressLine2', p)} />}
            </Field>
            <Field id="wc-country" label="Country" required error={errors.country}>
                {(p) => (
                    <select autoComplete="country" {...bind('country', p)}>
                        <option value="">Select country</option>
                        {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                )}
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field id="wc-state" label="State" required error={errors.state}>
                    {(p) => <input type="text" autoComplete="address-level1" placeholder="State / province" {...bind('state', p)} />}
                </Field>
                <Field id="wc-city" label="City" required error={errors.city}>
                    {(p) => <input type="text" autoComplete="address-level2" placeholder="City" {...bind('city', p)} />}
                </Field>
            </div>
            <Field id="wc-postal" label="Postal code" required error={errors.postalCode}>
                {(p) => <input type="text" autoComplete="postal-code" placeholder="Postal code" {...bind('postalCode', p)} />}
            </Field>
        </SectionCard>
    );
}

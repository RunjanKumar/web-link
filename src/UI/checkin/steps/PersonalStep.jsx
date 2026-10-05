import Field, { SectionCard } from '../components/Field';
import { inputCls } from '../components/formStyles';
import {
    COUNTRY_OPTIONS, GENDER_OPTIONS, TODAY_KEY,
} from '../../../viewModel/webCheckInViewModel';

/** Step 2 — who is staying: contact, gender, DOB, nationality, birth details. */
export default function PersonalStep({ vm }) {
    const { form, errors, setField } = vm;
    const bind = (field, controlProps) => ({
        ...controlProps,
        value: form[field],
        onChange: (e) => setField(field, e.target.value),
        className: inputCls(Boolean(errors[field])),
    });

    return (
        <div>
            <SectionCard title="Contact">
                <Field id="wc-name" label="Full name" required error={errors.name} hint="Exactly as printed on your ID.">
                    {(p) => <input type="text" autoComplete="name" placeholder="Full name" {...bind('name', p)} />}
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field id="wc-email" label="Email" required error={errors.email}>
                        {(p) => <input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...bind('email', p)} />}
                    </Field>
                    <Field id="wc-phone" label="Phone" required error={errors.phoneNumber || errors.phoneCountryCode}>
                        {(p) => (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    aria-label="Country code"
                                    autoComplete="tel-country-code"
                                    placeholder="+91"
                                    value={form.phoneCountryCode}
                                    onChange={(e) => setField('phoneCountryCode', e.target.value)}
                                    className={`${inputCls(Boolean(errors.phoneCountryCode))} w-20 shrink-0`}
                                />
                                <input type="tel" autoComplete="tel-national" placeholder="Phone number" {...bind('phoneNumber', p)} />
                            </div>
                        )}
                    </Field>
                </div>
                <Field id="wc-alt-phone" label="Alternate phone (optional)" error={errors.alternatePhoneNumber || errors.alternatePhoneCountryCode}>
                    {(p) => (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                aria-label="Alternate phone country code"
                                placeholder="+91"
                                value={form.alternatePhoneCountryCode}
                                onChange={(e) => setField('alternatePhoneCountryCode', e.target.value)}
                                className={`${inputCls(Boolean(errors.alternatePhoneCountryCode))} w-20 shrink-0`}
                            />
                            <input type="tel" placeholder="Phone number" {...bind('alternatePhoneNumber', p)} />
                        </div>
                    )}
                </Field>
            </SectionCard>

            <SectionCard title="About you">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field id="wc-gender" label="Gender" required error={errors.gender}>
                        {(p) => (
                            <select {...bind('gender', p)}>
                                <option value="">Select gender</option>
                                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        )}
                    </Field>
                    <Field id="wc-dob" label="Date of birth" required error={errors.dateOfBirth}>
                        {(p) => <input type="date" autoComplete="bday" max={TODAY_KEY} {...bind('dateOfBirth', p)} />}
                    </Field>
                </div>
                <Field id="wc-nationality" label="Nationality" required error={errors.nationality}>
                    {(p) => (
                        <select {...bind('nationality', p)}>
                            <option value="">Select nationality</option>
                            {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                    )}
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field id="wc-birth-place" label="Place of birth (optional)" error={errors.birthPlace}>
                        {(p) => <input type="text" placeholder="City / town" {...bind('birthPlace', p)} />}
                    </Field>
                    <Field id="wc-birth-country" label="Country of birth (optional)" error={errors.birthCountry}>
                        {(p) => (
                            <select {...bind('birthCountry', p)}>
                                <option value="">Select country</option>
                                {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                            </select>
                        )}
                    </Field>
                </div>
            </SectionCard>
        </div>
    );
}

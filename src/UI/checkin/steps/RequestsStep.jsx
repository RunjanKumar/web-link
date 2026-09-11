import Field, { SectionCard } from '../components/Field';
import { inputCls } from '../components/formStyles';
import { MAX_SPECIAL_REQUESTS } from '../../../viewModel/webCheckInViewModel';
import PreArrivalCta from '../../../globalComponents/PreArrivalCta';

/**
 * Step 7 — anything the guest wants the hotel to know. The hotel's own
 * pre-arrival questionnaire (a separate form) is invited below.
 */
export default function RequestsStep({ vm }) {
    const { form, errors, setField } = vm;
    const used = form.specialRequests.length;

    return (
        <div>
            <SectionCard title="Special requests" subtitle="Optional — a high floor, an early check-in, dietary needs…">
                <Field
                    id="wc-special-requests"
                    label="Your requests"
                    error={errors.specialRequests}
                    hint={`${used}/${MAX_SPECIAL_REQUESTS} characters. We will do our best; requests are not guaranteed.`}
                >
                    {(p) => (
                        <textarea
                            {...p}
                            rows={5}
                            maxLength={MAX_SPECIAL_REQUESTS}
                            placeholder="Tell us how we can make your stay better"
                            value={form.specialRequests}
                            onChange={(e) => setField('specialRequests', e.target.value)}
                            className={`${inputCls(Boolean(errors.specialRequests))} resize-none min-h-[130px]`}
                        />
                    )}
                </Field>
            </SectionCard>

            {/* The hotel's own questionnaire — separate from the statutory
                details, and answerable while this is still pending. */}
            <PreArrivalCta />
        </div>
    );
}

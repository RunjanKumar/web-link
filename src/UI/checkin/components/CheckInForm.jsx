import { useRef } from 'react';
import { CDN_BASE_URL } from '../../../utils/constant';
import {
    GENDER_OPTIONS, ID_TYPE_OPTIONS, COUNTRY_OPTIONS,
} from '../../../viewModel/webCheckInViewModel';
import IdDocumentUpload from './IdDocumentUpload';

const inputClass = 'w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm '
    + 'placeholder-gray-600 outline-none focus:border-yellow-400/60 transition-colors '
    + 'disabled:opacity-50 [color-scheme:dark]';
const labelClass = 'block text-gray-400 text-xs font-medium mb-1.5';

function Field({ label, required, children }) {
    return (
        <div>
            <label className={labelClass}>
                {label}
                {required && <span className="text-yellow-400 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

function SectionCard({ title, subtitle, children }) {
    return (
        <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
            <h2 className="text-white text-sm font-semibold m-0">{title}</h2>
            {subtitle && <p className="text-gray-500 text-xs mt-0.5 mb-0">{subtitle}</p>}
            <div className="grid grid-cols-1 gap-4 mt-4">{children}</div>
        </div>
    );
}

/**
 * CheckInForm — the pre-arrival details form. Field set mirrors what the front
 * desk collects at check-in; passport + visa become required for non-Indian guests.
 */
export default function CheckInForm({ vm }) {
    const {
        form, setField, isInternational, uploading, submitting,
        uploadDocument, removeDocument, uploadSelfie, submit,
    } = vm;
    const selfieInputRef = useRef(null);

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
        >
            <SectionCard title="Personal details">
                <Field label="Gender" required>
                    <select
                        className={inputClass}
                        value={form.gender}
                        onChange={(e) => setField('gender', e.target.value)}
                    >
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                </Field>
                <Field label="Date of birth" required>
                    <input
                        type="date"
                        className={inputClass}
                        value={form.dateOfBirth}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setField('dateOfBirth', e.target.value)}
                    />
                </Field>
                <Field label="Alternate phone (optional)">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className={`${inputClass} w-20`}
                            placeholder="+91"
                            value={form.alternatePhoneCountryCode}
                            onChange={(e) => setField('alternatePhoneCountryCode', e.target.value)}
                        />
                        <input
                            type="tel"
                            className={inputClass}
                            placeholder="Phone number"
                            value={form.alternatePhoneNumber}
                            onChange={(e) => setField('alternatePhoneNumber', e.target.value)}
                        />
                    </div>
                </Field>
            </SectionCard>

            <SectionCard title="Address">
                <Field label="Country" required>
                    <select
                        className={inputClass}
                        value={form.country}
                        onChange={(e) => setField('country', e.target.value)}
                    >
                        <option value="">Select country</option>
                        {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                </Field>
                <Field label="State" required>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="State / province"
                        value={form.state}
                        onChange={(e) => setField('state', e.target.value)}
                    />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="City" required>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="City"
                            value={form.city}
                            onChange={(e) => setField('city', e.target.value)}
                        />
                    </Field>
                    <Field label="Postal code" required>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Postal code"
                            value={form.postalCode}
                            onChange={(e) => setField('postalCode', e.target.value)}
                        />
                    </Field>
                </div>
            </SectionCard>

            <SectionCard
                title="Identity document"
                subtitle="A clear photo of the ID you'll carry — verified by the front desk."
            >
                <Field label="ID type" required>
                    <select
                        className={inputClass}
                        value={form.idType}
                        onChange={(e) => setField('idType', e.target.value)}
                    >
                        <option value="">Select ID type</option>
                        {ID_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </Field>
                <Field label="ID photos" required>
                    <IdDocumentUpload
                        documents={form.idDocument}
                        uploading={uploading}
                        onUpload={uploadDocument}
                        onRemove={removeDocument}
                    />
                </Field>
                <Field label="Your photo (optional)">
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
                                            flex items-center justify-center text-gray-600 text-lg">
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

            {isInternational && (
                <SectionCard
                    title="Passport & visa"
                    subtitle="Required for international guests."
                >
                    <Field label="Passport number" required>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Passport number"
                            value={form.passportNumber}
                            onChange={(e) => setField('passportNumber', e.target.value)}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Nationality">
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Nationality"
                                value={form.nationality}
                                onChange={(e) => setField('nationality', e.target.value)}
                            />
                        </Field>
                        <Field label="Birth place">
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Birth place"
                                value={form.birthPlace}
                                onChange={(e) => setField('birthPlace', e.target.value)}
                            />
                        </Field>
                    </div>
                    <Field label="Birth country">
                        <select
                            className={inputClass}
                            value={form.birthCountry}
                            onChange={(e) => setField('birthCountry', e.target.value)}
                        >
                            <option value="">Select country</option>
                            {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                    </Field>
                    <Field label="Visa number" required>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Visa number"
                            value={form.visaNumber}
                            onChange={(e) => setField('visaNumber', e.target.value)}
                        />
                    </Field>
                    <Field label="Visa place of issue" required>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Place of issue"
                            value={form.visaPlaceOfIssue}
                            onChange={(e) => setField('visaPlaceOfIssue', e.target.value)}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Visa issue date" required>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.visaIssueDate}
                                onChange={(e) => setField('visaIssueDate', e.target.value)}
                            />
                        </Field>
                        <Field label="Visa expiry date" required>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.visaExpiryDate}
                                onChange={(e) => setField('visaExpiryDate', e.target.value)}
                            />
                        </Field>
                    </div>
                </SectionCard>
            )}

            <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-yellow-400 text-black font-semibold text-sm rounded-full py-3.5 mt-2 mb-8
                           hover:bg-yellow-300 transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
        </form>
    );
}

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getMyWebCheckIn, submitWebCheckIn, uploadIdDocument } from '../api/service/webCheckInService';
import { getApiErrorMessage } from '../api/client';
import useCustomerProfile from '../hooks/CustomerProfile';

// Mirrors the backend's GENDER / ID_TYPES enums (constants.js) — values are stored verbatim.
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Master', 'Miss'];
export const ID_TYPE_OPTIONS = ['Aadhaar Card', 'Pancard', 'Voter ID', 'Driving License', 'Passport', 'Other'];

export const MAX_ID_DOCUMENTS = 3;
export const MAX_FILE_MB = 5;

// ISO 3166-1 alpha-2 codes; names come from the browser so no dependency is
// needed. The staff app stores the same ISO codes (country-state-city package),
// so both writers stay consistent. India is pinned first — most guests.
const ISO_CODES = ('IN AF AL DZ AD AO AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MK MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW').split(' ');

const regionNames = (() => {
    try {
        return new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
        return null;
    }
})();

export const COUNTRY_OPTIONS = ISO_CODES.map((code) => ({
    code,
    label: (regionNames && regionNames.of(code)) || code,
}));

/** Date (ISO/string/Date) → 'YYYY-MM-DD' for <input type="date">, or ''. */
const toInputDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
};

const EMPTY_FORM = {
    gender: '',
    dateOfBirth: '',
    idType: '',
    idDocument: [],
    profilePic: '',
    country: 'IN',
    city: '',
    state: '',
    postalCode: '',
    alternatePhoneCountryCode: '',
    alternatePhoneNumber: '',
    nationality: '',
    birthPlace: '',
    birthCountry: '',
    passportNumber: '',
    visaNumber: '',
    visaPlaceOfIssue: '',
    visaIssueDate: '',
    visaExpiryDate: '',
};

/**
 * Web check-in view-model.
 * screen: 'LOADING' | 'FORM' | 'PENDING' | 'APPROVED'
 *  - REJECTED shows as FORM with `rejectReason` set (banner) and prior values prefilled
 *  - PENDING offers "Edit details" (back to FORM, updates in place server-side)
 */
export default function useWebCheckInViewModel() {
    const { customerData, refetch: refetchProfile } = useCustomerProfile();

    const [screen, setScreen] = useState('LOADING');
    const [webCheckIn, setWebCheckIn] = useState(null);
    const [booking, setBooking] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isInternational = !!form.country && form.country !== 'IN';
    const rejectReason = webCheckIn?.status === 'REJECTED' ? webCheckIn?.rejectReason : null;

    const setField = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    // Prefill priority: what the guest last submitted, else what's on their profile.
    const buildPrefill = useCallback((doc, guest) => {
        const submission = doc?.submission || {};
        const source = (field) => submission[field] ?? guest?.[field] ?? '';
        return {
            gender: source('gender') || '',
            dateOfBirth: toInputDate(submission.dateOfBirth ?? guest?.dateOfBirth),
            idType: source('idType') || '',
            idDocument: submission.idDocument?.length ? submission.idDocument : (guest?.idDocument || []),
            profilePic: source('profilePic') || '',
            country: source('country') || 'IN',
            city: source('city') || '',
            state: source('state') || '',
            postalCode: source('postalCode') || '',
            alternatePhoneCountryCode: source('alternatePhoneCountryCode') || '',
            alternatePhoneNumber: source('alternatePhoneNumber') || '',
            nationality: source('nationality') || '',
            birthPlace: source('birthPlace') || '',
            birthCountry: source('birthCountry') || '',
            passportNumber: source('passportNumber') || '',
            visaNumber: source('visaNumber') || '',
            visaPlaceOfIssue: source('visaPlaceOfIssue') || '',
            visaIssueDate: toInputDate(submission.visaIssueDate ?? guest?.visaIssueDate),
            visaExpiryDate: toInputDate(submission.visaExpiryDate ?? guest?.visaExpiryDate),
        };
    }, []);

    const load = useCallback(async () => {
        try {
            const response = await getMyWebCheckIn();
            const data = response?.data || {};
            setWebCheckIn(data.webCheckIn || null);
            setBooking(data.booking || null);
            setForm(buildPrefill(data.webCheckIn, customerData));
            const status = data.webCheckIn?.status;
            if (status === 'PENDING') setScreen('PENDING');
            else if (status === 'APPROVED') setScreen('APPROVED');
            else setScreen('FORM'); // none / REJECTED / SUPERSEDED
        } catch (err) {
            toast.error(getApiErrorMessage(err));
            setScreen('FORM');
        }
    }, [buildPrefill, customerData]);

    useEffect(() => {
        load();
    }, [load]);

    const uploadDocument = useCallback(async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            toast.error('Please upload a photo (JPG, PNG or WebP).');
            return;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            toast.error(`Each photo must be under ${MAX_FILE_MB} MB.`);
            return;
        }
        if (form.idDocument.length >= MAX_ID_DOCUMENTS) {
            toast.error(`You can upload at most ${MAX_ID_DOCUMENTS} photos.`);
            return;
        }
        try {
            setUploading(true);
            const key = await uploadIdDocument(file);
            if (!key) throw new Error('Upload failed — please try again.');
            setForm((prev) => ({ ...prev, idDocument: [...prev.idDocument, key] }));
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Upload failed — please try again.'));
        } finally {
            setUploading(false);
        }
    }, [form.idDocument.length]);

    const removeDocument = useCallback((index) => {
        setForm((prev) => ({
            ...prev,
            idDocument: prev.idDocument.filter((_, i) => i !== index),
        }));
    }, []);

    const uploadSelfie = useCallback(async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            toast.error('Please upload a photo (JPG, PNG or WebP).');
            return;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            toast.error(`The photo must be under ${MAX_FILE_MB} MB.`);
            return;
        }
        try {
            setUploading(true);
            const key = await uploadIdDocument(file);
            if (key) setForm((prev) => ({ ...prev, profilePic: key }));
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Upload failed — please try again.'));
        } finally {
            setUploading(false);
        }
    }, []);

    const firstMissingField = useCallback(() => {
        if (!form.gender) return 'Please select your gender.';
        if (!form.dateOfBirth) return 'Please enter your date of birth.';
        if (!form.country) return 'Please select your country.';
        if (!form.state.trim()) return 'Please enter your state.';
        if (!form.city.trim()) return 'Please enter your city.';
        if (!form.postalCode.trim()) return 'Please enter your postal code.';
        if (!form.idType) return 'Please select your ID type.';
        if (form.idDocument.length === 0) return 'Please upload at least one photo of your ID.';
        if (isInternational) {
            if (!form.passportNumber.trim()) return 'Passport number is required for international guests.';
            if (!form.visaNumber.trim()) return 'Visa number is required for international guests.';
            if (!form.visaPlaceOfIssue.trim()) return 'Visa place of issue is required for international guests.';
            if (!form.visaIssueDate) return 'Visa issue date is required for international guests.';
            if (!form.visaExpiryDate) return 'Visa expiry date is required for international guests.';
        }
        return null;
    }, [form, isInternational]);

    const submit = useCallback(async () => {
        const missing = firstMissingField();
        if (missing) {
            toast.error(missing);
            return;
        }
        const body = {
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            idType: form.idType,
            idDocument: form.idDocument,
            country: form.country,
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
        };
        if (form.profilePic) body.profilePic = form.profilePic;
        if (form.alternatePhoneNumber.trim()) {
            body.alternatePhoneNumber = form.alternatePhoneNumber.trim();
            if (form.alternatePhoneCountryCode.trim()) body.alternatePhoneCountryCode = form.alternatePhoneCountryCode.trim();
        }
        if (form.nationality.trim()) body.nationality = form.nationality.trim();
        if (form.birthPlace.trim()) body.birthPlace = form.birthPlace.trim();
        if (form.birthCountry) body.birthCountry = form.birthCountry;
        if (isInternational) {
            body.passportNumber = form.passportNumber.trim();
            body.visaNumber = form.visaNumber.trim();
            body.visaPlaceOfIssue = form.visaPlaceOfIssue.trim();
            body.visaIssueDate = form.visaIssueDate;
            body.visaExpiryDate = form.visaExpiryDate;
        } else if (form.passportNumber.trim()) {
            body.passportNumber = form.passportNumber.trim();
        }

        try {
            setSubmitting(true);
            const response = await submitWebCheckIn(body);
            toast.success(response?.message || 'Details submitted — the hotel will review them shortly.');
            await load();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }, [firstMissingField, form, isInternational, load]);

    /** From the PENDING screen: reopen the form to edit the submission in place. */
    const editSubmission = useCallback(() => setScreen('FORM'), []);

    /** After APPROVED: pull the fresh profile so the gate flips to browse mode. */
    const goExplore = useCallback(async () => {
        await refetchProfile();
    }, [refetchProfile]);

    return {
        screen,
        webCheckIn,
        booking,
        form,
        setField,
        isInternational,
        rejectReason,
        uploading,
        submitting,
        uploadDocument,
        removeDocument,
        uploadSelfie,
        submit,
        editSubmission,
        goExplore,
    };
}

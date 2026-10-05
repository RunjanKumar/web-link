import {
    useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { toast } from 'sonner';
import {
    getMyOffers, getMyRegistrationCard, getMyWebCheckIn, requestOffer, saveWebCheckInDraft,
    submitWebCheckIn, uploadIdDocument, uploadSignatureImage, withdrawOffer,
} from '../api/service/webCheckInService';
import { getApiErrorMessage } from '../api/client';
import useCustomerProfile from '../hooks/CustomerProfile';
import {
    COUNTRY_OPTIONS, GSTIN_REGEX, aadhaarLast4, composeDateTime, isForeignGuest, isFormIIIExempt,
    isValidEmail, isValidPhone, titleCase, toInputDate, toInputTime, toLocalDateKey,
} from '../utils/webCheckInHelpers';

export { COUNTRY_OPTIONS, isForeignGuest, isFormIIIExempt };

// Mirrors the backend's GENDER / ID_TYPES enums (constants.js) — values are stored verbatim.
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Master', 'Miss'];
export const ID_TYPE_OPTIONS = ['Aadhaar Card', 'Pancard', 'Voter ID', 'Driving License', 'Passport', 'Visa', 'Other'];
export const AADHAAR_ID_TYPE = 'Aadhaar Card';

export const MAX_ID_DOCUMENTS = 3;
export const MAX_FILE_MB = 5;
export const MAX_SPECIAL_REQUESTS = 1000;
// The note that travels with a request for a paid extra (backend caps it at 300).
export const MAX_OFFER_NOTE = 300;

/** Mirrors EXTRA_REQUEST_STATUS — the life of one request for a paid extra. */
export const EXTRA_REQUEST_STATUS = {
    REQUESTED: 'REQUESTED',
    CONFIRMED: 'CONFIRMED',
    DECLINED: 'DECLINED',
};

// Mirrors WEB_CHECKIN_PURPOSE_OF_VISIT / ARRIVAL_TRAVEL_MODE. The lists /me sends
// (purposeOptions, travelModes) win when present; these cover an older backend.
export const PURPOSE_LABELS = {
    LEISURE: 'Leisure / holiday',
    WELLNESS: 'Wellness',
    BUSINESS: 'Business',
    MEDICAL: 'Medical',
    FAMILY: 'Visiting family or friends',
    OTHER: 'Other',
};
export const TRAVEL_MODE_LABELS = {
    CAR: 'Car',
    TRAIN: 'Train',
    FLIGHT: 'Flight',
    BUS: 'Bus',
    OTHER: 'Other',
};
export const DEFAULT_PURPOSE_OPTIONS = Object.keys(PURPOSE_LABELS);
export const DEFAULT_TRAVEL_MODES = Object.keys(TRAVEL_MODE_LABELS);

// Mirrors VISA_TYPES (Form-III). /me `visaTypes` wins when present.
export const OCI_VISA_TYPE = 'OCI';
export const VISA_TYPE_LABELS = {
    TOURIST: 'Tourist',
    BUSINESS: 'Business',
    MEDICAL: 'Medical',
    MEDICAL_ATTENDANT: 'Medical attendant',
    EMPLOYMENT: 'Employment',
    STUDENT: 'Student',
    CONFERENCE: 'Conference',
    E_VISA: 'e-Visa',
    [OCI_VISA_TYPE]: 'OCI (Overseas Citizen of India)',
    OTHER: 'Other',
};
export const DEFAULT_VISA_TYPES = Object.keys(VISA_TYPE_LABELS);

// Mirrors WEB_CHECKIN_CONSENT_KEYS / WEB_CHECKIN_CONSENTS — rendered when /me has
// no consentDefinitions (older backend). Same keys, so the submission shape holds.
export const CONSENT_KEYS = {
    DECLARATION: 'DECLARATION',
    HOUSE_RULES: 'HOUSE_RULES',
    PRIVACY: 'PRIVACY',
    MARKETING: 'MARKETING',
};
export const DEFAULT_CONSENT_DEFINITIONS = [
    {
        key: CONSENT_KEYS.DECLARATION,
        label: 'Declaration',
        text: 'I hereby declare that the above information is correct to the best of my knowledge. '
            + 'I agree to abide by the hotel rules and regulations during my stay. '
            + 'I am responsible for the settlement of my account upon check-out.',
        required: true,
    },
    {
        key: CONSENT_KEYS.HOUSE_RULES,
        label: 'House rules',
        text: "I agree to abide by the hotel's rules and regulations during my stay.",
        required: true,
    },
    {
        key: CONSENT_KEYS.PRIVACY,
        label: 'Privacy notice',
        text: 'We collect your identity, contact and address details, ID document images and travel '
            + 'details to complete the guest registration required by law (including Form-III for '
            + 'foreign nationals) and to run your stay. These records are kept for the statutory '
            + 'period. Contact the hotel to access, correct or erase any data that is not required by law.',
        required: true,
    },
    {
        key: CONSENT_KEYS.MARKETING,
        label: 'Offers and updates',
        text: 'I would like to receive offers and updates from the hotel.',
        required: false,
    },
];

export const STEP = {
    SUMMARY: 'SUMMARY',
    PERSONAL: 'PERSONAL',
    ADDRESS: 'ADDRESS',
    IDENTITY: 'IDENTITY',
    TRAVEL: 'TRAVEL',
    COMPANY: 'COMPANY',
    REQUESTS: 'REQUESTS',
    EXTRAS: 'EXTRAS',
    CONSENT: 'CONSENT',
    REVIEW: 'REVIEW',
};

export const STEPS = [
    { key: STEP.SUMMARY, title: 'Your booking', subtitle: 'Check the stay we have on record for you.' },
    { key: STEP.PERSONAL, title: 'Personal details', subtitle: 'As they appear on your ID.' },
    { key: STEP.ADDRESS, title: 'Home address', subtitle: 'Your permanent address for the registration card.' },
    { key: STEP.IDENTITY, title: 'Identity document', subtitle: 'The ID you will carry — verified at the desk.' },
    { key: STEP.TRAVEL, title: 'Travel details', subtitle: 'So we can have your room ready when you arrive.' },
    { key: STEP.COMPANY, title: 'Company details', subtitle: 'Only if you need a GST invoice.' },
    { key: STEP.REQUESTS, title: 'Special requests', subtitle: 'Anything that would make your stay better.' },
    { key: STEP.EXTRAS, title: 'Add to your stay', subtitle: 'Optional extras you can ask the hotel for.' },
    { key: STEP.CONSENT, title: 'Consent & signature', subtitle: 'Read, accept and sign your registration.' },
    { key: STEP.REVIEW, title: 'Review & submit', subtitle: 'One last look before the hotel reviews it.' },
];

/**
 * The wizard for this guest. Most hotels opt no charge in to guests at all, so
 * the extras step exists ONLY when the server actually returned offers — the
 * guest must never meet an empty step, or even see it in the step count.
 * REVIEW stays last either way, which is what every "jump to review" relies on.
 */
export const stepsFor = (hasExtras) => (
    hasExtras ? STEPS : STEPS.filter((s) => s.key !== STEP.EXTRAS)
);

// Company fields in the exact keys the backend's companyDetailsSchema accepts.
export const COMPANY_FIELDS = [
    'companyName', 'companyGst', 'companyAddressLine1', 'companyAddressLine2',
    'companyCountry', 'companyState', 'companyCity', 'companyPostalCode', 'companyEmail',
];

// Local calendar day at page load — DOB max + "not in the future" checks.
export const TODAY_KEY = toLocalDateKey(new Date());

/**
 * The browser-local half of the draft. sessionStorage rather than localStorage
 * on purpose: it survives a reload and moving around the portal, which is the
 * whole problem, but dies with the tab — this form holds passport and ID
 * numbers, and leaving those on disk on a shared or lobby device after the
 * guest walks away is not a trade worth making for a convenience feature.
 *
 * Every access is wrapped: a private window, a browser with site data blocked,
 * or a full quota all throw here, and none of them is a reason to break the form.
 */
const LOCAL_DRAFT_KEY = 'webCheckInDraft';

const readLocalDraft = () => {
    try {
        const raw = window.sessionStorage.getItem(LOCAL_DRAFT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && parsed.form ? parsed : null;
    } catch {
        return null;
    }
};

const writeLocalDraft = (draft) => {
    try {
        window.sessionStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
    } catch {
        /* storage unavailable or full — the server copy still has it */
    }
};

const clearLocalDraft = () => {
    try {
        window.sessionStorage.removeItem(LOCAL_DRAFT_KEY);
    } catch {
        /* nothing to do */
    }
};

const EMPTY_FORM = {
    // personal
    name: '',
    email: '',
    phoneCountryCode: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    birthPlace: '',
    birthCountry: '',
    alternatePhoneCountryCode: '',
    alternatePhoneNumber: '',
    // address
    addressLine1: '',
    addressLine2: '',
    country: 'IN',
    state: '',
    city: '',
    postalCode: '',
    // identity
    idType: '',
    idNumber: '',
    idDocument: [],
    profilePic: '',
    passportNumber: '',
    passportPlaceOfIssue: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    isOciCardholder: false,
    // OCI holders rarely hold a visa too — the visa fields hide behind this toggle for them.
    ociHasVisa: false,
    visaType: '',
    visaNumber: '',
    visaPlaceOfIssue: '',
    visaIssueDate: '',
    visaExpiryDate: '',
    // travel ('HH:mm' — composed with the stay dates on submit)
    arrivalTime: '',
    travelMode: '',
    travelNumber: '',
    departureTime: '',
    nextDestination: '',
    onwardAddress: '',
    purposeOfVisit: '',
    // entry into India (Form-III) — date + time composed to 'YYYY-MM-DDTHH:mm' on submit
    indiaArrivalDate: '',
    indiaArrivalTime: '',
    portOfEntry: '',
    arrivedFrom: '',
    employedInIndia: null, // true | false | null (not answered)
    frroRegistrationNumber: '',
    // company
    needsCompanyInvoice: false,
    companyName: '',
    companyGst: '',
    companyAddressLine1: '',
    companyAddressLine2: '',
    companyCountry: '',
    companyState: '',
    companyCity: '',
    companyPostalCode: '',
    companyEmail: '',
    // requests
    specialRequests: '',
    // consent — key → { accepted, acceptedAt }
    consents: {},
    signatureTypedName: '',
    signatureImageKey: '',
};

const firstFilled = (...values) => {
    for (let i = 0; i < values.length; i += 1) {
        const v = values[i];
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
};
const str = (...values) => String(firstFilled(...values) ?? '').trim();

/**
 * Build the wizard's form from what we know, per field: the guest's last
 * submission, else their profile (/me `guest`, or the login profile on an
 * older backend), else what the booking already carries.
 */
export const buildPrefill = ({ submission, guest, booking } = {}) => {
    const s = submission || {};
    const g = guest || {};
    const b = booking || {};
    const arrival = { ...(b.arrivalDetails || {}), ...(s.arrivalDetails || {}) };
    const departure = { ...(b.departureDetails || {}), ...(s.departureDetails || {}) };
    // An older backend omits foreignArrival entirely — every read below tolerates {}.
    const foreignArrival = { ...(b.foreignArrival || {}), ...(s.foreignArrival || {}) };
    const company = { ...(b.companyDetails || {}), ...(g.companyDetails || {}), ...(s.companyDetails || {}) };
    const signature = s.signature || {};

    const country = str(s.country, g.country) || 'IN';
    const idType = str(s.idType, g.idType);
    // The backend hands Aadhaar back masked ('XXXX-1234') — keep only the 4 we store.
    const rawIdNumber = str(s.idNumber, g.idNumber);
    const idNumber = idType === AADHAAR_ID_TYPE ? aadhaarLast4(rawIdNumber) : rawIdNumber;

    const consents = {};
    (Array.isArray(s.consents) ? s.consents : []).forEach((c) => {
        if (!c || !c.key) return;
        consents[c.key] = { accepted: c.accepted === true, acceptedAt: c.acceptedAt || null };
    });

    const form = {
        ...EMPTY_FORM,
        name: str(s.name, g.name),
        email: str(s.email, g.email),
        phoneCountryCode: str(s.phoneCountryCode, g.phoneCountryCode),
        phoneNumber: str(s.phoneNumber, g.phoneNumber),
        gender: str(s.gender, g.gender),
        dateOfBirth: toInputDate(firstFilled(s.dateOfBirth, g.dateOfBirth)),
        nationality: str(s.nationality, g.nationality) || country,
        birthPlace: str(s.birthPlace, g.birthPlace),
        birthCountry: str(s.birthCountry, g.birthCountry),
        alternatePhoneCountryCode: str(s.alternatePhoneCountryCode, g.alternatePhoneCountryCode),
        alternatePhoneNumber: str(s.alternatePhoneNumber, g.alternatePhoneNumber),
        addressLine1: str(s.addressLine1, g.addressLine1),
        addressLine2: str(s.addressLine2, g.addressLine2),
        country,
        state: str(s.state, g.state),
        city: str(s.city, g.city),
        postalCode: str(s.postalCode, g.postalCode),
        idType,
        idNumber,
        idDocument: s.idDocument?.length ? [...s.idDocument] : (Array.isArray(g.idDocument) ? [...g.idDocument] : []),
        profilePic: str(s.profilePic, g.profilePic),
        passportNumber: str(s.passportNumber, g.passportNumber),
        passportPlaceOfIssue: str(s.passportPlaceOfIssue, g.passportPlaceOfIssue),
        passportIssueDate: toInputDate(firstFilled(s.passportIssueDate, g.passportIssueDate)),
        passportExpiryDate: toInputDate(firstFilled(s.passportExpiryDate, g.passportExpiryDate)),
        isOciCardholder: firstFilled(s.isOciCardholder, g.isOciCardholder) === true,
        visaType: str(s.visaType, g.visaType),
        visaNumber: str(s.visaNumber, g.visaNumber),
        visaPlaceOfIssue: str(s.visaPlaceOfIssue, g.visaPlaceOfIssue),
        visaIssueDate: toInputDate(firstFilled(s.visaIssueDate, g.visaIssueDate)),
        visaExpiryDate: toInputDate(firstFilled(s.visaExpiryDate, g.visaExpiryDate)),
        arrivalTime: toInputTime(arrival.arrivalTime),
        travelMode: str(arrival.travelMode),
        travelNumber: str(arrival.travelNumber),
        departureTime: toInputTime(departure.departureTime),
        nextDestination: str(departure.nextDestination),
        onwardAddress: str(departure.onwardAddress),
        purposeOfVisit: str(s.purposeOfVisit, b.purposeOfVisit),
        // 'YYYY-MM-DDTHH:mm' → the local day + clock the two inputs hold
        indiaArrivalDate: toLocalDateKey(foreignArrival.indiaArrivalDate),
        indiaArrivalTime: toInputTime(foreignArrival.indiaArrivalDate),
        portOfEntry: str(foreignArrival.portOfEntry),
        arrivedFrom: str(foreignArrival.arrivedFrom),
        employedInIndia: typeof foreignArrival.employedInIndia === 'boolean' ? foreignArrival.employedInIndia : null,
        frroRegistrationNumber: str(foreignArrival.frroRegistrationNumber),
        specialRequests: str(s.specialRequests),
        consents,
        signatureTypedName: str(signature.typedName),
        signatureImageKey: str(signature.imageKey),
    };
    COMPANY_FIELDS.forEach((field) => {
        form[field] = str(company[field]);
    });
    form.needsCompanyInvoice = COMPANY_FIELDS.some((field) => Boolean(form[field]));
    // An OCI holder's visa toggle opens only for a real visa — 'OCI' as the type
    // is what we derive for them, not a visa they hold.
    form.ociHasVisa = form.isOciCardholder && (
        Boolean(form.visaNumber) || Boolean(form.visaPlaceOfIssue) || Boolean(form.visaIssueDate)
        || Boolean(form.visaExpiryDate) || (Boolean(form.visaType) && form.visaType !== OCI_VISA_TYPE)
    );
    return form;
};

/**
 * Which Form-III fields the guest must fill, from the form alone:
 *  - foreign: the passport & visa block and "Entry into India" are shown
 *  - passportRequired: shown AND not a Nepal/Bhutan national (exempt → optional)
 *  - visaRequired: passport required AND not an OCI cardholder
 *  - visaShown: the visa fields are on screen (OCI holders open them with a toggle)
 */
export const foreignRules = (form) => {
    const foreign = isForeignGuest(form);
    const exempt = isFormIIIExempt(form.nationality);
    const oci = form.isOciCardholder === true;
    const passportRequired = foreign && !exempt;
    return {
        foreign,
        exempt,
        oci,
        passportRequired,
        visaRequired: passportRequired && !oci,
        visaShown: foreign && (!oci || form.ociHasVisa === true),
    };
};

/** Server list (strings, {value,label} objects or an enum map) → [{ value, label }], else the fallback. */
const normaliseOptions = (raw, labels, fallback) => {
    let list = raw;
    if (list && !Array.isArray(list) && typeof list === 'object') list = Object.values(list);
    if (!Array.isArray(list) || list.length === 0) list = fallback;
    const seen = new Set();
    const options = [];
    list.forEach((item) => {
        const value = typeof item === 'string' ? item : (item?.value ?? item?.key);
        if (!value || seen.has(value)) return;
        seen.add(value);
        const label = (item && typeof item === 'object' && item.label) || labels[value] || titleCase(value);
        options.push({ value, label });
    });
    return options;
};

/** `consentDefinitions` from /me (array, or { consents|definitions, version }) → clean list. */
const normaliseConsents = (raw) => {
    let list = raw;
    if (raw && !Array.isArray(raw) && typeof raw === 'object') {
        list = raw.consents ?? raw.definitions ?? raw.items ?? raw.list;
    }
    if (!Array.isArray(list)) return DEFAULT_CONSENT_DEFINITIONS;
    const cleaned = list
        .filter((c) => c && c.key)
        .map((c) => ({
            key: c.key,
            label: c.label || titleCase(c.key),
            text: c.text || '',
            required: Boolean(c.required),
        }));
    return cleaned.length ? cleaned : DEFAULT_CONSENT_DEFINITIONS;
};

const consentVersionOf = (raw, data) => {
    if (raw && !Array.isArray(raw) && typeof raw === 'object' && raw.version) return String(raw.version);
    return data?.consentVersion ? String(data.consentVersion) : '';
};

/**
 * Validate ONE step. Returns { field: message } — empty when the step is fine.
 * ctx: { checkOutDate, consentDefinitions } — the parts of the world a rule needs.
 */
export const validateStep = (stepKey, form, ctx = {}) => {
    const errors = {};
    const value = (field) => String(form[field] ?? '').trim();
    const require = (field, message) => {
        if (!value(field)) {
            errors[field] = message;
            return false;
        }
        return true;
    };
    const maxLen = (field, max, label) => {
        if (!errors[field] && value(field).length > max) errors[field] = `${label} must be ${max} characters or fewer.`;
    };
    const rules = foreignRules(form);

    switch (stepKey) {
        case STEP.PERSONAL: {
            if (require('name', 'Please enter your full name.') && value('name').length < 2) {
                errors.name = 'Please enter your full name.';
            }
            maxLen('name', 120, 'Name');
            if (require('email', 'Please enter your email address.') && !isValidEmail(value('email'))) {
                errors.email = 'Please enter a valid email address.';
            }
            if (require('phoneNumber', 'Please enter your phone number.') && !isValidPhone(value('phoneNumber'))) {
                errors.phoneNumber = 'Please enter a valid phone number (5–20 digits).';
            }
            if (value('phoneCountryCode') && !/^\+?\d{1,5}$/.test(value('phoneCountryCode'))) {
                errors.phoneCountryCode = 'Use the +91 format.';
            }
            require('gender', 'Please select your gender.');
            if (require('dateOfBirth', 'Please enter your date of birth.') && value('dateOfBirth') > TODAY_KEY) {
                errors.dateOfBirth = 'Date of birth cannot be in the future.';
            }
            require('nationality', 'Please select your nationality.');
            maxLen('birthPlace', 120, 'Birth place');
            if (value('alternatePhoneNumber') && !isValidPhone(value('alternatePhoneNumber'))) {
                errors.alternatePhoneNumber = 'Please enter a valid phone number (5–20 digits).';
            }
            if (value('alternatePhoneCountryCode') && !/^\+?\d{1,5}$/.test(value('alternatePhoneCountryCode'))) {
                errors.alternatePhoneCountryCode = 'Use the +91 format.';
            }
            break;
        }
        case STEP.ADDRESS: {
            require('addressLine1', 'Please enter your street address.');
            maxLen('addressLine1', 200, 'Address line 1');
            maxLen('addressLine2', 200, 'Address line 2');
            require('country', 'Please select your country.');
            require('state', 'Please enter your state.');
            require('city', 'Please enter your city.');
            require('postalCode', 'Please enter your postal code.');
            break;
        }
        case STEP.IDENTITY: {
            require('idType', 'Please select your ID type.');
            if (form.idType === AADHAAR_ID_TYPE) {
                if (!/^\d{4}$/.test(value('idNumber'))) {
                    errors.idNumber = 'Enter only the last 4 digits of your Aadhaar number.';
                }
            } else {
                require('idNumber', 'Please enter your ID number.');
                maxLen('idNumber', 50, 'ID number');
            }
            if (!Array.isArray(form.idDocument) || form.idDocument.length === 0) {
                errors.idDocument = 'Please upload at least one photo of your ID.';
            }
            if (rules.foreign) {
                const who = rules.oci ? 'OCI cardholders' : 'international guests';
                if (rules.passportRequired) {
                    require('passportNumber', `Passport number is required for ${who}.`);
                    require('passportPlaceOfIssue', `Passport place of issue is required for ${who}.`);
                    require('passportIssueDate', `Passport issue date is required for ${who}.`);
                    require('passportExpiryDate', `Passport expiry date is required for ${who}.`);
                }
                maxLen('passportPlaceOfIssue', 100, 'Passport place of issue');
                const passportIssue = value('passportIssueDate');
                const passportExpiry = value('passportExpiryDate');
                if (passportIssue && passportExpiry && passportExpiry <= passportIssue) {
                    errors.passportExpiryDate = 'Passport expiry must be after the issue date.';
                }
                if (rules.visaRequired) {
                    require('visaType', 'Please select your visa type.');
                    require('visaNumber', 'Visa number is required for international guests.');
                    require('visaPlaceOfIssue', 'Visa place of issue is required for international guests.');
                    require('visaIssueDate', 'Visa issue date is required for international guests.');
                    require('visaExpiryDate', 'Visa expiry date is required for international guests.');
                }
                if (rules.visaShown) {
                    const issue = value('visaIssueDate');
                    const expiry = value('visaExpiryDate');
                    const departureKey = toLocalDateKey(ctx.checkOutDate);
                    if (expiry && !errors.visaExpiryDate) {
                        if (issue && expiry <= issue) {
                            errors.visaExpiryDate = 'Visa expiry must be after the issue date.';
                        } else if (departureKey && expiry < departureKey) {
                            errors.visaExpiryDate = 'Your visa must be valid until your departure date.';
                        }
                    }
                }
            }
            break;
        }
        case STEP.TRAVEL: {
            if (rules.foreign) {
                const date = value('indiaArrivalDate');
                const time = value('indiaArrivalTime');
                if (rules.passportRequired) {
                    require('indiaArrivalDate', 'Please enter the date you arrived (or arrive) in India.');
                    require('indiaArrivalTime', 'Please enter the time of arrival in India.');
                    require('portOfEntry', 'Please enter your port of entry into India.');
                    require('arrivedFrom', 'Please tell us where you arrived from.');
                    if (typeof form.employedInIndia !== 'boolean') {
                        errors.employedInIndia = 'Please tell us whether you are employed in India.';
                    }
                } else if (date || time) {
                    // Exempt nationals may skip this — but half a date-time cannot be stored.
                    if (!date) errors.indiaArrivalDate = 'Please enter the date of arrival in India.';
                    if (!time) errors.indiaArrivalTime = 'Please enter the time of arrival in India.';
                }
                if (date && !errors.indiaArrivalDate && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    errors.indiaArrivalDate = 'Please enter a valid date.';
                }
                if (time && !errors.indiaArrivalTime && !/^\d{2}:\d{2}$/.test(time)) {
                    errors.indiaArrivalTime = 'Please enter a valid time.';
                }
                maxLen('portOfEntry', 100, 'Port of entry');
                maxLen('arrivedFrom', 120, 'Arrived from');
                maxLen('frroRegistrationNumber', 60, 'FRRO registration number');
            }
            if (require('arrivalTime', 'Please tell us when you expect to arrive.') && !/^\d{2}:\d{2}$/.test(value('arrivalTime'))) {
                errors.arrivalTime = 'Please enter a valid time.';
            }
            maxLen('travelNumber', 40, 'Flight / train / vehicle number');
            if (value('departureTime') && !/^\d{2}:\d{2}$/.test(value('departureTime'))) {
                errors.departureTime = 'Please enter a valid time.';
            }
            // Where the guest goes next is a FORM-III field, and Form-III covers
            // foreign nationals only (Nepal and Bhutan exempt) — `passportRequired`
            // is that exact test. Demanding it of an Indian guest collected more
            // than any statute asks for, cost three fields of friction, and was
            // stricter than the backend, whose schema has both as optional.
            // They stay on screen for everyone: the guest register prints them
            // whenever someone volunteers them.
            if (rules.passportRequired) {
                require('nextDestination', 'Please enter where you are travelling to next.');
                require('onwardAddress', 'Please enter your onward address.');
            }
            maxLen('nextDestination', 120, 'Next destination');
            maxLen('onwardAddress', 300, 'Onward address');
            // Purpose of visit stays required for everyone: it prints on every
            // guest's registration card, not just a foreign national's.
            require('purposeOfVisit', 'Please select the purpose of your visit.');
            break;
        }
        case STEP.COMPANY: {
            if (form.needsCompanyInvoice) {
                require('companyName', 'Please enter the company name.');
                if (require('companyGst', 'Please enter the company GSTIN.') && !GSTIN_REGEX.test(value('companyGst').toUpperCase())) {
                    errors.companyGst = 'Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).';
                }
                if (value('companyEmail') && !isValidEmail(value('companyEmail'))) {
                    errors.companyEmail = 'Please enter a valid email address.';
                }
                maxLen('companyAddressLine1', 200, 'Company address line 1');
                maxLen('companyAddressLine2', 200, 'Company address line 2');
            }
            break;
        }
        case STEP.REQUESTS: {
            maxLen('specialRequests', MAX_SPECIAL_REQUESTS, 'Special requests');
            break;
        }
        case STEP.CONSENT: {
            (ctx.consentDefinitions || DEFAULT_CONSENT_DEFINITIONS).forEach((def) => {
                if (def.required && form.consents?.[def.key]?.accepted !== true) {
                    errors[`consent.${def.key}`] = 'Please accept to continue.';
                }
            });
            if (require('signatureTypedName', 'Please type your full name to sign.') && value('signatureTypedName').length < 2) {
                errors.signatureTypedName = 'Please type your full name to sign.';
            }
            maxLen('signatureTypedName', 120, 'Signature');
            break;
        }
        default:
            break;
    }
    return errors;
};

/** The POST body — the original 19 fields exactly as before, plus the new ones only when filled. */
export const buildBody = (form, { booking, consentDefinitions }) => {
    const t = (field) => String(form[field] ?? '').trim();
    const rules = foreignRules(form);
    const body = {
        gender: t('gender'),
        dateOfBirth: form.dateOfBirth,
        idType: t('idType'),
        idDocument: form.idDocument,
        country: t('country'),
        city: t('city'),
        state: t('state'),
        postalCode: t('postalCode'),
    };
    const setIf = (key, value) => {
        if (value) body[key] = value;
    };
    setIf('profilePic', form.profilePic);
    if (t('alternatePhoneNumber')) {
        body.alternatePhoneNumber = t('alternatePhoneNumber');
        setIf('alternatePhoneCountryCode', t('alternatePhoneCountryCode'));
    }
    setIf('nationality', t('nationality'));
    setIf('birthPlace', t('birthPlace'));
    setIf('birthCountry', form.birthCountry);
    // Passport & visa: the Form-III block. Exempt (Nepal/Bhutan) and OCI guests
    // may leave parts blank, so every field goes only when filled.
    setIf('passportNumber', t('passportNumber'));
    if (rules.foreign) {
        setIf('passportPlaceOfIssue', t('passportPlaceOfIssue'));
        setIf('passportIssueDate', form.passportIssueDate);
        setIf('passportExpiryDate', form.passportExpiryDate);
        if (rules.visaShown) {
            setIf('visaType', t('visaType'));
            setIf('visaNumber', t('visaNumber'));
            setIf('visaPlaceOfIssue', t('visaPlaceOfIssue'));
            setIf('visaIssueDate', form.visaIssueDate);
            setIf('visaExpiryDate', form.visaExpiryDate);
        } else if (rules.oci) {
            // No separate visa: the OCI card is what the FRRO filing lists as the visa type.
            body.visaType = OCI_VISA_TYPE;
        }
    }
    // Everyone sees the OCI checkbox, so the answer always travels — as a boolean.
    body.isOciCardholder = form.isOciCardholder === true;

    // ── Phase-1 additions (all optional server-side) ──
    setIf('name', t('name'));
    setIf('email', t('email'));
    setIf('phoneCountryCode', t('phoneCountryCode'));
    setIf('phoneNumber', t('phoneNumber'));
    setIf('addressLine1', t('addressLine1'));
    setIf('addressLine2', t('addressLine2'));
    setIf('idNumber', form.idType === AADHAAR_ID_TYPE ? aadhaarLast4(form.idNumber) : t('idNumber'));
    setIf('purposeOfVisit', t('purposeOfVisit'));

    const arrivalDetails = {};
    const arrivalTime = composeDateTime(booking?.checkInDate, form.arrivalTime);
    if (arrivalTime) arrivalDetails.arrivalTime = arrivalTime;
    if (t('travelMode')) arrivalDetails.travelMode = t('travelMode');
    if (t('travelNumber')) arrivalDetails.travelNumber = t('travelNumber');
    if (Object.keys(arrivalDetails).length) body.arrivalDetails = arrivalDetails;

    const departureDetails = {};
    const departureTime = composeDateTime(booking?.checkOutDate, form.departureTime);
    if (departureTime) departureDetails.departureTime = departureTime;
    if (t('nextDestination')) departureDetails.nextDestination = t('nextDestination');
    if (t('onwardAddress')) departureDetails.onwardAddress = t('onwardAddress');
    if (Object.keys(departureDetails).length) body.departureDetails = departureDetails;

    // Entry into India — only when the section was shown, and only what was filled.
    if (rules.foreign) {
        const foreignArrival = {};
        const indiaArrivalDate = composeDateTime(form.indiaArrivalDate, form.indiaArrivalTime);
        if (indiaArrivalDate) foreignArrival.indiaArrivalDate = indiaArrivalDate;
        if (t('portOfEntry')) foreignArrival.portOfEntry = t('portOfEntry');
        if (t('arrivedFrom')) foreignArrival.arrivedFrom = t('arrivedFrom');
        if (typeof form.employedInIndia === 'boolean') foreignArrival.employedInIndia = form.employedInIndia;
        if (t('frroRegistrationNumber')) foreignArrival.frroRegistrationNumber = t('frroRegistrationNumber');
        if (Object.keys(foreignArrival).length) body.foreignArrival = foreignArrival;
    }

    if (form.needsCompanyInvoice) {
        const companyDetails = {};
        COMPANY_FIELDS.forEach((field) => {
            const v = t(field);
            if (v) companyDetails[field] = field === 'companyGst' ? v.toUpperCase() : v;
        });
        if (Object.keys(companyDetails).length) body.companyDetails = companyDetails;
    }

    setIf('specialRequests', t('specialRequests'));

    body.consents = consentDefinitions.map((def) => {
        const choice = form.consents?.[def.key];
        if (choice?.accepted === true) {
            return { key: def.key, accepted: true, acceptedAt: choice.acceptedAt || new Date().toISOString() };
        }
        return { key: def.key, accepted: false };
    });

    if (t('signatureTypedName')) {
        body.signature = { typedName: t('signatureTypedName') };
        if (form.signatureImageKey) body.signature.imageKey = form.signatureImageKey;
    }
    return body;
};

/** Photo-only, size-capped — the same rule for ID photos and the selfie. */
const checkPhoto = (file, plural) => {
    if (!file.type?.startsWith('image/')) {
        toast.error('Please upload a photo (JPG, PNG or WebP).');
        return false;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${plural ? 'Each photo' : 'The photo'} must be under ${MAX_FILE_MB} MB.`);
        return false;
    }
    return true;
};

/**
 * Web check-in view-model.
 * screen: 'LOADING' | 'FORM' | 'PENDING' | 'APPROVED'
 *  - REJECTED shows as FORM with `rejectReason` set (banner) and prior values prefilled
 *  - PENDING offers "Edit details" (back to FORM, updates in place server-side)
 * The form is prefilled ONCE from /me; a profile refetch never touches it.
 */
export default function useWebCheckInViewModel() {
    const { customerData, refetch: refetchProfile } = useCustomerProfile();

    // The login profile is only a prefill fallback for an older backend whose
    // /me has no `guest`; a ref keeps profile refetches from re-running the load.
    const customerDataRef = useRef(null);
    useEffect(() => {
        customerDataRef.current = customerData;
    }, [customerData]);

    const [screen, setScreen] = useState('LOADING');
    const [webCheckIn, setWebCheckIn] = useState(null);
    const [booking, setBooking] = useState(null);
    const [guest, setGuest] = useState(null);
    const [consentDefinitions, setConsentDefinitions] = useState(DEFAULT_CONSENT_DEFINITIONS);
    const [consentVersion, setConsentVersion] = useState('');
    const [purposeOptions, setPurposeOptions] = useState(() => normaliseOptions(null, PURPOSE_LABELS, DEFAULT_PURPOSE_OPTIONS));
    const [travelModes, setTravelModes] = useState(() => normaliseOptions(null, TRAVEL_MODE_LABELS, DEFAULT_TRAVEL_MODES));
    const [visaTypes, setVisaTypes] = useState(() => normaliseOptions(null, VISA_TYPE_LABELS, DEFAULT_VISA_TYPES));

    const [form, setForm] = useState(EMPTY_FORM);
    const [stepIndex, setStepIndex] = useState(0);
    const [attempted, setAttempted] = useState({}); // stepKey → true once "Next" was tried
    const [returnToReview, setReturnToReview] = useState(false);

    // ── Paid extras the hotel offers this guest ──
    // `hasExtrasStep` is decided ONCE, on the first load, and never flips
    // afterwards: the step list must not grow or shrink under a guest who is
    // halfway through the wizard (every index would shift meaning).
    const [offers, setOffers] = useState([]);
    const [offersMeta, setOffersMeta] = useState({ currency: 'INR', checkInTime: '', checkOutTime: '' });
    const [hasExtrasStep, setHasExtrasStep] = useState(false);
    const [offerBusyId, setOfferBusyId] = useState(''); // chargeId of the offer being acted on

    // ── Draft autosave ──
    // A ten-step form on a phone loses everything to one stray back-swipe unless
    // it is saved as it is typed. Two layers, on purpose:
    //   sessionStorage — instant, no network, restores before the first paint, so
    //     a reload never shows an empty form while /me is in flight. Session-only
    //     rather than localStorage because this form holds identity data and must
    //     not sit on disk after the guest walks away from a shared device.
    //   the server — survives closing the tab and switching phone to laptop.
    // The server copy wins when both exist; it is the one that travels.
    const [draftSavedAt, setDraftSavedAt] = useState(null);
    const draftTimer = useRef(null);
    const draftDirty = useRef(false);
    const draftReady = useRef(false); // no saving until the first load has applied
    // Read by flushDraft, which must not re-create on every keystroke.
    const formRef = useRef(EMPTY_FORM);
    const stepKeyRef = useRef('');

    const [uploading, setUploading] = useState(false);
    const [signatureState, setSignatureState] = useState('IDLE'); // IDLE | PENDING | UPLOADING
    const signatureSeq = useRef(0);
    const [submitting, setSubmitting] = useState(false);
    const [cardState, setCardState] = useState({ loading: false, url: '' });

    const steps = useMemo(() => stepsFor(hasExtrasStep), [hasExtrasStep]);
    // Callbacks read the list through a ref so none of them has to re-create
    // when the extras step appears.
    const stepsRef = useRef(steps);
    useEffect(() => {
        stepsRef.current = steps;
    }, [steps]);

    // Clamped, so a step list that changed under us can never index past its end.
    const safeIndex = Math.min(stepIndex, steps.length - 1);
    const stepKey = steps[safeIndex].key;
    const foreign = useMemo(() => foreignRules(form), [form]);
    const rejectReason = webCheckIn?.status === 'REJECTED' ? webCheckIn?.rejectReason : null;

    /**
     * Apply a /me response. `prefill` is true only for the first load; `stepList`
     * is the wizard as it stands at that moment (the state behind it has not
     * committed yet when the first load lands).
     */
    const applyLoaded = useCallback((data, { prefill, stepList }) => {
        const doc = data.webCheckIn || null;
        setWebCheckIn(doc);
        setBooking(data.booking || null);
        setGuest(data.guest || null);
        setConsentDefinitions(normaliseConsents(data.consentDefinitions));
        setConsentVersion(consentVersionOf(data.consentDefinitions, data));
        setPurposeOptions(normaliseOptions(data.purposeOptions, PURPOSE_LABELS, DEFAULT_PURPOSE_OPTIONS));
        setTravelModes(normaliseOptions(data.travelModes, TRAVEL_MODE_LABELS, DEFAULT_TRAVEL_MODES));
        setVisaTypes(normaliseOptions(data.visaTypes, VISA_TYPE_LABELS, DEFAULT_VISA_TYPES));

        const status = doc?.status;
        if (prefill) {
            const prefilled = buildPrefill({
                submission: doc?.submission,
                guest: data.guest || customerDataRef.current,
                booking: data.booking,
            });
            // Resume an unfinished form. Prefer the server's copy (it travels
            // between devices) and fall back to this browser's. Layered OVER the
            // prefill, never instead of it, so a field the guest never touched
            // still shows what the hotel already knows.
            const local = readLocalDraft();
            const remote = data.draft && data.draft.form ? data.draft : null;
            const resumed = remote || local;
            setForm(resumed ? { ...prefilled, ...resumed.form } : prefilled);

            const list = stepList || stepsRef.current;
            // A rejected submission reopens on the review step: every prior value
            // is there with an Edit link, and the banner explains what to fix.
            if (status === 'REJECTED') {
                setStepIndex(list.length - 1); // REVIEW is always last
                setAttempted(Object.fromEntries(list.map((s) => [s.key, true])));
            } else if (resumed && resumed.stepKey) {
                const at = list.findIndex((s) => s.key === resumed.stepKey);
                if (at > 0) {
                    setStepIndex(at);
                    // Everything before where they stopped has been seen, so its
                    // errors should show immediately rather than on a second try.
                    setAttempted(Object.fromEntries(list.slice(0, at).map((s) => [s.key, true])));
                }
            }
            if (resumed && resumed.savedAt) setDraftSavedAt(resumed.savedAt);
            draftReady.current = true;
        }
        if (status === 'PENDING') setScreen('PENDING');
        else if (status === 'APPROVED') setScreen('APPROVED');
        else setScreen('FORM'); // none / REJECTED / SUPERSEDED
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            // Both in one round trip: the offers decide whether the wizard even
            // HAS an extras step, so the guest must never see the step count
            // change after the first paint. A hotel that offers nothing (the
            // normal case) and an older backend without the route look the same
            // here — an empty list, silently.
            const [meResult, offersResult] = await Promise.allSettled([getMyWebCheckIn(), getMyOffers()]);
            if (cancelled) return;

            const offersData = offersResult.status === 'fulfilled' ? (offersResult.value?.data || {}) : {};
            const loadedOffers = Array.isArray(offersData.offers) ? offersData.offers : [];
            setOffers(loadedOffers);
            setOffersMeta({
                currency: offersData.currency || 'INR',
                checkInTime: offersData.checkInTime || '',
                checkOutTime: offersData.checkOutTime || '',
            });
            setHasExtrasStep(loadedOffers.length > 0);

            if (meResult.status === 'rejected') {
                toast.error(getApiErrorMessage(meResult.reason));
                setScreen('FORM');
                return;
            }
            applyLoaded(meResult.value?.data || {}, {
                prefill: true,
                stepList: stepsFor(loadedOffers.length > 0),
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [applyLoaded]);

    // ── Autosave ──
    // The local copy is written on EVERY change, because it is free and it is
    // what rescues a reload. The server copy is debounced: a keystroke does not
    // deserve a round trip, and the guest is on hotel wifi.
    useEffect(() => {
        // Only while they are actually filling it in. A pending or approved form
        // has been sent; the server would refuse a draft for it anyway.
        formRef.current = form;
        stepKeyRef.current = stepKey;
        if (!draftReady.current || screen !== 'FORM') return undefined;

        writeLocalDraft({ form, stepKey, savedAt: new Date().toISOString() });
        draftDirty.current = true;

        clearTimeout(draftTimer.current);
        draftTimer.current = setTimeout(() => {
            saveWebCheckInDraft({ form, stepKey })
                .then((response) => {
                    draftDirty.current = false;
                    setDraftSavedAt(response?.data?.savedAt || new Date().toISOString());
                })
                // Silent by design: a failed autosave is not something to
                // interrupt a guest mid-form about, and the local copy still
                // holds everything. The next change retries.
                .catch(() => {});
        }, 1200);

        return () => clearTimeout(draftTimer.current);
    }, [form, stepKey, screen]);

    /** Save the working copy NOW rather than on the debounce. Never throws. */
    const flushDraft = useCallback(async () => {
        clearTimeout(draftTimer.current);
        if (!draftReady.current || !draftDirty.current) return;
        try {
            await saveWebCheckInDraft({ form: formRef.current, stepKey: stepKeyRef.current });
            draftDirty.current = false;
        } catch {
            /* the local copy still has it; the next change retries */
        }
    }, []);

    /** Re-read status after a submit — the form stays exactly as the guest left it. */
    const reload = useCallback(async () => {
        const response = await getMyWebCheckIn();
        applyLoaded(response?.data || {}, { prefill: false });
    }, [applyLoaded]);

    // ── Paid extras: ask / withdraw ────────────────────────────────────────
    /**
     * Re-read the offers after acting on one. This only ever refreshes the cards
     * (their price and the guest's own request state) — it never adds or removes
     * the extras STEP, which was settled at load.
     */
    const refreshOffers = useCallback(async () => {
        const response = await getMyOffers();
        const data = response?.data || {};
        setOffers(Array.isArray(data.offers) ? data.offers : []);
        setOffersMeta((prev) => ({
            currency: data.currency || prev.currency,
            checkInTime: data.checkInTime || prev.checkInTime,
            checkOutTime: data.checkOutTime || prev.checkOutTime,
        }));
    }, []);

    // Re-price the offers when the guest ARRIVES at the extras step.
    //
    // They were first read on load, before the guest had said anything about when
    // they get here — so the early-arrival suggestion could not possibly have
    // fired. The arrival time is typed three steps earlier and lives in the
    // autosaved draft, so push that to the server first and then ask again.
    // Without the flush the debounce would still be pending and the server would
    // price against a draft that does not yet mention the time.
    useEffect(() => {
        if (screen !== 'FORM' || stepKey !== STEP.EXTRAS) return;
        let cancelled = false;
        (async () => {
            await flushDraft();
            if (cancelled) return;
            // A failure here just leaves the cards as they were.
            await refreshOffers().catch(() => {});
        })();
        return () => {
            cancelled = true;
        };
    }, [screen, stepKey, flushDraft, refreshOffers]);

    /**
     * One write against the offers, then catch the cards up.
     *
     * THE ORDER HERE IS THE WHOLE POINT. What the guest is told is decided by
     * the WRITE's result and nothing else. The refresh that follows is a
     * courtesy: it runs after the verdict is already on screen, and its failure
     * leaves a stale card, never a false "that didn't work". Reporting a failed
     * refresh as a failed request tells a guest their early check-in was not
     * requested while the desk holds a live request it can turn into a real
     * folio charge — the guest then does not expect the money.
     *
     * A stale card is genuinely harmless: re-asking re-quotes an open request in
     * place server-side rather than stacking a second one.
     */
    const runOfferAction = useCallback(async (chargeId, write, { success, failure }) => {
        setOfferBusyId(chargeId);
        try {
            try {
                await write();
            } catch (err) {
                toast.error(getApiErrorMessage(err, failure));
                // The write's own failure may itself be news (the desk confirmed
                // it a second ago), so still try to show the truth — quietly.
                await refreshOffers().catch(() => {});
                return false;
            }
            toast.success(success);
            try {
                await refreshOffers();
            } catch {
                toast.message('Saved. This page could not refresh — reopen this step to see the latest.');
            }
            return true;
        } finally {
            setOfferBusyId('');
        }
    }, [refreshOffers]);

    /**
     * Ask the hotel for one extra. This is a REQUEST at the quoted price —
     * nothing is billed and nothing is reserved until the desk confirms it.
     */
    const askForOffer = useCallback(async (chargeId, note) => {
        if (!chargeId) return;
        await runOfferAction(
            chargeId,
            () => requestOffer({ chargeId, note: String(note || '').trim() }),
            {
                success: 'Request sent — the hotel will confirm it.',
                failure: 'Could not send your request. Please try again.',
            },
        );
    }, [runOfferAction]);

    /** Take back a request the desk has not decided yet. */
    const withdrawOfferRequest = useCallback(async (chargeId, requestId) => {
        if (!requestId) return;
        await runOfferAction(
            chargeId,
            () => withdrawOffer(requestId),
            {
                success: 'Request withdrawn.',
                // A request the desk confirmed in the meantime is a folio charge —
                // only they can reverse it, so send the guest to them.
                failure: 'Could not withdraw this request. Please speak to the front desk.',
            },
        );
    }, [runOfferAction]);

    // ── Field setters ──────────────────────────────────────────────────────
    const setField = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    /** Switching between Aadhaar (last-4) and any other ID clears the number — different thing. */
    const setIdType = useCallback((value) => {
        setForm((prev) => {
            const wasAadhaar = prev.idType === AADHAAR_ID_TYPE;
            const isAadhaar = value === AADHAAR_ID_TYPE;
            return { ...prev, idType: value, idNumber: wasAadhaar === isAadhaar ? prev.idNumber : '' };
        });
    }, []);

    const setConsent = useCallback((key, accepted) => {
        setForm((prev) => ({
            ...prev,
            consents: {
                ...prev.consents,
                [key]: { accepted, acceptedAt: accepted ? new Date().toISOString() : null },
            },
        }));
    }, []);

    // ── Uploads ────────────────────────────────────────────────────────────
    const uploadDocument = useCallback(async (file) => {
        if (!file || !checkPhoto(file, true)) return;
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
        if (!file || !checkPhoto(file, false)) return;
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

    // ── Signature pad ──────────────────────────────────────────────────────
    /** The pad is being drawn on — Next waits until the stroke is exported. */
    const markSignaturePending = useCallback(() => {
        setSignatureState('PENDING');
    }, []);

    /** PNG blob from the pad → S3 key. Only the latest export ever lands. */
    const uploadSignature = useCallback(async (blob) => {
        signatureSeq.current += 1;
        const seq = signatureSeq.current;
        if (!blob) {
            setSignatureState('IDLE');
            return;
        }
        setSignatureState('UPLOADING');
        try {
            const key = await uploadSignatureImage(blob);
            if (seq !== signatureSeq.current) return; // a newer stroke superseded this one
            if (!key) throw new Error('Could not save your signature — please try again.');
            setForm((prev) => ({ ...prev, signatureImageKey: key }));
        } catch (err) {
            if (seq === signatureSeq.current) {
                toast.error(getApiErrorMessage(err, 'Could not save your signature — please try again.'));
            }
        } finally {
            if (seq === signatureSeq.current) setSignatureState('IDLE');
        }
    }, []);

    const clearSignature = useCallback(() => {
        signatureSeq.current += 1;
        setSignatureState('IDLE');
        setForm((prev) => ({ ...prev, signatureImageKey: '' }));
    }, []);

    // ── Steps & validation ─────────────────────────────────────────────────
    const validationCtx = useMemo(
        () => ({ checkOutDate: booking?.checkOutDate, consentDefinitions }),
        [booking?.checkOutDate, consentDefinitions],
    );

    /** Errors of the CURRENT step — only once the guest tried to leave it. */
    const errors = useMemo(
        () => (attempted[stepKey] ? validateStep(stepKey, form, validationCtx) : {}),
        [attempted, stepKey, form, validationCtx],
    );

    const goToStep = useCallback((key) => {
        const index = stepsRef.current.findIndex((s) => s.key === key);
        if (index >= 0) setStepIndex(index);
    }, []);

    /** Validate the current step; advance only when it is clean. */
    const goNext = useCallback(() => {
        const stepErrors = validateStep(stepKey, form, validationCtx);
        if (Object.keys(stepErrors).length) {
            setAttempted((prev) => ({ ...prev, [stepKey]: true }));
            return false;
        }
        if (returnToReview) {
            setReturnToReview(false);
            setStepIndex(stepsRef.current.length - 1);
            return true;
        }
        setStepIndex((i) => Math.min(i + 1, stepsRef.current.length - 1));
        return true;
    }, [stepKey, form, validationCtx, returnToReview]);

    const goBack = useCallback(() => {
        setReturnToReview(false);
        setStepIndex((i) => Math.max(i - 1, 0));
    }, []);

    /** From the review step: jump to a step; its Next comes straight back here. */
    const editStep = useCallback((key) => {
        setReturnToReview(true);
        goToStep(key);
    }, [goToStep]);

    const submit = useCallback(async () => {
        // Every step must be clean — land the guest on the first one that is not.
        const list = stepsRef.current;
        for (let i = 0; i < list.length; i += 1) {
            const key = list[i].key;
            if (Object.keys(validateStep(key, form, validationCtx)).length) {
                setAttempted((prev) => ({ ...prev, [key]: true }));
                setReturnToReview(true);
                setStepIndex(i);
                toast.error(`Please complete the highlighted fields in "${list[i].title}".`);
                return;
            }
        }
        const body = buildBody(form, { booking, consentDefinitions });
        try {
            setSubmitting(true);
            const response = await submitWebCheckIn(body);
            // The submission supersedes the working copy. A pending autosave must
            // not fire after it and put half-typed values back on the server.
            clearTimeout(draftTimer.current);
            draftDirty.current = false;
            clearLocalDraft();
            setDraftSavedAt(null);
            toast.success(response?.message || 'Details submitted — the hotel will review them shortly.');
            await reload();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }, [form, validationCtx, booking, consentDefinitions, reload]);

    /** From the PENDING screen: reopen the wizard on the review step to edit in place. */
    const editSubmission = useCallback(() => {
        const list = stepsRef.current;
        setAttempted(Object.fromEntries(list.map((s) => [s.key, true])));
        setStepIndex(list.length - 1); // REVIEW is always last
        setScreen('FORM');
    }, []);

    /** After APPROVED: pull the fresh profile so the gate flips to browse mode. */
    const goExplore = useCallback(async () => {
        await refetchProfile();
    }, [refetchProfile]);

    /** APPROVED: fetch the PDF url and open it; the link stays on screen for blocked pop-ups. */
    const downloadRegistrationCard = useCallback(async () => {
        setCardState({ loading: true, url: '' });
        try {
            const response = await getMyRegistrationCard();
            const url = response?.data?.pdfUrl ?? response?.pdfUrl;
            if (!url) throw new Error('Your registration card is not ready yet — please try again shortly.');
            window.open(url, '_blank', 'noopener');
            setCardState({ loading: false, url });
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Could not fetch your registration card.'));
            setCardState({ loading: false, url: '' });
        }
    }, []);

    /** What the guest last submitted, in form shape — the PENDING/APPROVED read-back. */
    const submittedForm = useMemo(
        () => (webCheckIn?.submission ? buildPrefill({ submission: webCheckIn.submission }) : null),
        [webCheckIn],
    );

    return {
        screen,
        webCheckIn,
        booking,
        guest,
        consentDefinitions,
        consentVersion,
        purposeOptions,
        travelModes,
        visaTypes,
        form,
        submittedForm,
        errors,
        stepIndex: safeIndex,
        stepKey,
        steps,
        // When the working copy was last stored, so the wizard can reassure the
        // guest their progress is kept. null before the first save.
        draftSavedAt,
        isFirstStep: safeIndex === 0,
        isReviewStep: stepKey === STEP.REVIEW,
        returnToReview,
        setField,
        setIdType,
        setConsent,
        foreign,
        rejectReason,
        uploading,
        signatureState,
        submitting,
        uploadDocument,
        removeDocument,
        uploadSelfie,
        markSignaturePending,
        uploadSignature,
        clearSignature,
        offers,
        offersCurrency: offersMeta.currency,
        hotelCheckInTime: offersMeta.checkInTime,
        hotelCheckOutTime: offersMeta.checkOutTime,
        offerBusyId,
        askForOffer,
        withdrawOfferRequest,
        goNext,
        goBack,
        goToStep,
        editStep,
        submit,
        editSubmission,
        goExplore,
        downloadRegistrationCard,
        cardLoading: cardState.loading,
        cardUrl: cardState.url,
    };
}

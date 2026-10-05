/**
 * Pure helpers for the web check-in wizard — dates, times, labels. No React,
 * no API: the view-model owns state, these only shape values.
 */

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

/** ISO code → display name ('IN' → 'India'); unknown codes echo back. */
export const countryLabel = (code) => {
    if (!code) return '';
    const match = COUNTRY_OPTIONS.find((c) => c.code === code);
    return match ? match.label : code;
};

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Date-ish → Date, or null. A bare 'YYYY-MM-DD' (what the date inputs hold)
 * is read as a LOCAL calendar day — `new Date('2026-09-12')` would be UTC
 * midnight, which is the previous evening west of Greenwich.
 */
const parseDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const bare = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    const d = bare
        ? new Date(Number(bare[1]), Number(bare[2]) - 1, Number(bare[3]))
        : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
};

/** Date (ISO/string/Date) → 'YYYY-MM-DD' for <input type="date">, or ''. */
export const toInputDate = (value) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
};

/**
 * Date → LOCAL 'YYYY-MM-DD' — the calendar day the guest sees on screen
 * (toDateString() is local too), so composed arrival/departure times land on
 * the same day the summary shows.
 */
export const toLocalDateKey = (value) => {
    const d = parseDate(value);
    if (!d) return '';
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/** 'YYYY-MM-DDTHH:mm' (or anything Date-parseable) → 'HH:mm' for <input type="time">, or ''. */
export const toInputTime = (value) => {
    if (!value) return '';
    const match = /T(\d{2}:\d{2})/.exec(String(value));
    if (match) return match[1];
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/**
 * Compose the wall-clock string the booking stores ('YYYY-MM-DDTHH:mm' — the
 * same shape the staff app's datetime-local input writes) from the stay date
 * and a 'HH:mm' time. Either part missing → ''.
 */
export const composeDateTime = (dateValue, time) => {
    const day = toLocalDateKey(dateValue);
    if (!day || !/^\d{2}:\d{2}$/.test(time || '')) return '';
    return `${day}T${time}`;
};

/** Date-ish → 'Sat, 12 Sep 2026' (en-IN), or ''. */
export const formatDayDate = (value) => {
    const d = parseDate(value);
    if (!d) return '';
    return d.toLocaleDateString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    });
};

/** Date-ish → '12 Sep 2026' (en-IN) — for DOB / visa dates, where a weekday is noise. */
export const formatDate = (value) => {
    const d = parseDate(value);
    if (!d) return '';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** 'HH:mm' → '2:30 pm'; anything else echoes back. */
export const formatClock = (time) => {
    const match = /^(\d{2}):(\d{2})$/.exec(time || '');
    if (!match) return time || '';
    const hours = Number(match[1]);
    const suffix = hours >= 12 ? 'pm' : 'am';
    return `${hours % 12 || 12}:${match[2]} ${suffix}`;
};

/** 'YYYY-MM-DDTHH:mm' → 'Sat, 12 Sep 2026, 2:30 pm'. */
export const formatDateTime = (value) => {
    if (!value) return '';
    const day = formatDayDate(String(value).slice(0, 10));
    const time = formatClock(toInputTime(value));
    return [day, time].filter(Boolean).join(', ');
};

/** Whole nights between two dates (≥ 0); '' when either is missing. */
export const nightsBetween = (from, to) => {
    if (!from || !to) return '';
    const a = new Date(toLocalDateKey(from));
    const b = new Date(toLocalDateKey(to));
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '';
    return Math.max(0, Math.round((b - a) / 86400000));
};

/**
 * Rupees → '₹1,200' (en-IN grouping). Every amount the guest is shown is in
 * rupees; the paise conversion lives server-side.
 */
export const formatMoney = (amount, currency = 'INR') => {
    const value = Number(amount);
    const text = (Number.isFinite(value) ? value : 0)
        .toLocaleString('en-IN', { maximumFractionDigits: 2 });
    // An empty/absent currency means the caller had none to pass — INR, not a
    // bare number with a stray space where the symbol should be.
    const code = currency || 'INR';
    return code === 'INR' ? `₹${text}` : `${code} ${text}`;
};

/** 'LEISURE' → 'Leisure', 'OUT_FOR_DELIVERY' → 'Out for delivery'. */
export const titleCase = (value) => {
    const text = String(value || '').replace(/_/g, ' ').toLowerCase();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
};

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value || '');

/** Loose phone check — digits with an optional leading +, ignoring spaces/dashes. */
export const isValidPhone = (value, min = 5, max = 20) => {
    const compact = String(value || '').replace(/[\s-]/g, '');
    return new RegExp(`^\\+?\\d{${min},${max}}$`).test(compact);
};

/** The GSTIN format the backend validates (15 characters). */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** Last 4 digits of whatever was typed/prefilled — the ONLY Aadhaar form we keep. */
export const aadhaarLast4 = (value) => String(value || '').replace(/\D/g, '').slice(-4);

/**
 * Whether the Form-III (FRRO) block applies: a guest resident outside India, an
 * OCI cardholder (reportable even when resident here), or a foreign national.
 * Same rule the backend contract states for the wizard.
 */
export const isForeignGuest = ({ country, nationality, isOciCardholder } = {}) => (
    (Boolean(country) && country !== 'IN')
    || isOciCardholder === true
    || (Boolean(nationality) && nationality !== 'IN')
);

/** Nepal and Bhutan nationals are exempt from Form-III reporting. */
export const FORM_III_EXEMPT_NATIONALITIES = ['NP', 'BT'];
export const isFormIIIExempt = (nationality) => FORM_III_EXEMPT_NATIONALITIES.includes(nationality);

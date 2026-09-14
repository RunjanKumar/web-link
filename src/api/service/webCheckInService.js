import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * Web check-in (pre-arrival registration) transport.
 * The guest is resolved from the portal token — no ids are sent from the client.
 */

/** The guest's own web check-in state + booking window (used for form prefill). */
export async function getMyWebCheckIn() {
    const response = await apiClient.get(ENDPOINTS.WEB_CHECKIN_ME);
    return response.data;
}

/** Submit (or resubmit) the pre-arrival details for staff review. */
export async function submitWebCheckIn(body) {
    const response = await apiClient.post(ENDPOINTS.WEB_CHECKIN_SUBMIT, body);
    return response.data;
}

/**
 * Autosave the half-finished form so a reload, a closed tab or a different
 * device resumes where the guest stopped. This is NOT a submission: the hotel
 * never sees a draft, and the server refuses one once the form has been sent.
 */
export async function saveWebCheckInDraft({ form, stepKey }) {
    const response = await apiClient.put(ENDPOINTS.WEB_CHECKIN_DRAFT, { form, stepKey });
    return response.data;
}

/**
 * The guest's registration card as a PDF — `{ pdfUrl }`. The backend only
 * serves it once staff approved the web check-in (or the guest is in house).
 */
export async function getMyRegistrationCard() {
    const response = await apiClient.get(ENDPOINTS.WEB_CHECKIN_REGISTRATION_CARD);
    return response.data;
}

/**
 * Upload one ID photo. Returns the raw S3 key (`fileUrl`) that goes into the
 * submission's idDocument array. Preview it as `CDN_BASE_URL + key`.
 */
export async function uploadIdDocument(file) {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', 'customer');
    const response = await apiClient.post(ENDPOINTS.FILE_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data?.fileUrl ?? response.data?.fileUrl;
}

/**
 * Upload the drawn signature (a PNG blob exported from the canvas pad). Same
 * upload route as the ID photos — the key goes into `signature.imageKey`.
 */
export async function uploadSignatureImage(blob) {
    const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });
    return uploadIdDocument(file);
}

/* ══════════════════════════════════════════════════════════════
   ── Paid extras (guest offers) ──
   The hotel opts individual charges in; the server prices each one
   for THIS stay (it owns every multiplier) and hands back the guest's
   own request for it when one exists. Nothing here is a sale.
   ══════════════════════════════════════════════════════════════ */

/**
 * The extras this hotel offers the guest, priced for their stay:
 * `{ offers, currency, checkInTime, checkOutTime }`. Suggested offers come
 * first — keep the server's order. An empty list is the normal case.
 */
export async function getMyOffers() {
    const response = await apiClient.get(ENDPOINTS.WEB_CHECKIN_OFFERS);
    return response.data;
}

/**
 * Ask the hotel for one extra. This RECORDS A REQUEST at the quoted price —
 * it bills nothing. Only the front desk confirming it posts a folio charge.
 */
export async function requestOffer({ chargeId, note }) {
    const response = await apiClient.post(ENDPOINTS.WEB_CHECKIN_OFFER_REQUEST, {
        chargeId,
        note: note || '',
    });
    return response.data;
}

/**
 * Withdraw a request the desk has not decided yet. A CONFIRMED one is already a
 * folio charge, so the server refuses it — the guest must call the desk.
 */
export async function withdrawOffer(requestId) {
    const response = await apiClient.delete(`${ENDPOINTS.WEB_CHECKIN_OFFERS}/${requestId}`);
    return response.data;
}

/**
 * A Razorpay payment link for a pre-arrival deposit — `{ payment, paymentLink:
 * { id, shortUrl, status }, folio }`. Open `shortUrl`: the guest pays on
 * Razorpay's own hosted page, so NO card data ever enters this app.
 *
 * `amount` is in RUPEES and is capped server-side at the outstanding balance
 * (over it the call fails with INSTALLMENT_EXCEEDS_BALANCE). No hotelId travels
 * from here: the server takes it off the booking it resolved from the token,
 * which is the only copy a guest cannot influence.
 */
export async function createDepositLink({ amount, callbackUrl }) {
    const body = { amount };
    if (callbackUrl) body.callbackUrl = callbackUrl;
    const response = await apiClient.post(ENDPOINTS.WEB_CHECKIN_DEPOSIT_LINK, body);
    return response.data;
}

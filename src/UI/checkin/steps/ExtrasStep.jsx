import { useState } from 'react';
import Field from '../components/Field';
import { inputCls, secondaryBtnCls } from '../components/formStyles';
import { EXTRA_REQUEST_STATUS, MAX_OFFER_NOTE } from '../../../viewModel/webCheckInViewModel';
import { formatMoney } from '../../../utils/webCheckInHelpers';

/**
 * Step 8 — the paid extras this hotel offers, priced for this stay.
 *
 * THE COPY RULE THIS SCREEN EXISTS TO HOLD: picking one is a REQUEST, never a
 * purchase. An early check-in depends on the previous guest leaving; a late
 * checkout on the next one arriving. The desk is the only party that can judge
 * that, so nothing here is "booked", "bought" or "added to your bill" until
 * they confirm it — and only they can bill it.
 *
 * The step never renders at all when the hotel has opted nothing in: the
 * view-model leaves it out of the wizard entirely (see `stepsFor`).
 */

const chipCls = 'inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1';

/** "₹800 × 2 guests × 3 nights + ₹96 tax (12%)" — only the parts that apply. */
function priceBreakdown(offer, currency) {
    const multipliers = [];
    if (offer.isPerPerson && offer.numberOfPeople > 1) multipliers.push(`${offer.numberOfPeople} guests`);
    if (offer.isPerDay && offer.numberOfDays > 1) multipliers.push(`${offer.numberOfDays} nights`);
    const tax = Number(offer.taxAmount) > 0
        ? ` + ${formatMoney(offer.taxAmount, currency)} tax (${offer.taxPercentage}%)`
        : '';
    if (!multipliers.length && !tax) return '';
    return `${formatMoney(offer.unitAmount, currency)}${multipliers.length ? ` × ${multipliers.join(' × ')}` : ''}${tax}`;
}

/** The lightbulb that marks a suggestion as "shown to you for a reason". */
function SuggestionLine({ text }) {
    return (
        <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2.5 mt-3">
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#facc15"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-0.5"
                aria-hidden="true"
            >
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
            <p className="text-yellow-200/90 text-xs leading-relaxed m-0">{text}</p>
        </div>
    );
}

function OfferCard({
    offer, currency, busy, onRequest, onWithdraw,
}) {
    const [note, setNote] = useState('');
    const request = offer.request || null;
    const status = request?.status || null;
    const suggested = Boolean(offer.suggestion);
    const noteId = `wc-offer-note-${offer.chargeId}`;

    // The SERVER decides whether the guest may ask — never infer it from the
    // presence of a request. A DECLINED one does not close the door (the desk
    // may have said no for one date only), while REQUESTED and CONFIRMED do.
    // The fallback only covers a backend that predates `canRequest`.
    const canRequest = typeof offer.canRequest === 'boolean' ? offer.canRequest : !request;
    const declined = status === EXTRA_REQUEST_STATUS.DECLINED;

    // ONE price is on this card, and while a request is LIVE it is THEIR quote —
    // the server snapshots it and honours it at confirm time even if the hotel
    // re-priced the charge since. Headlining today's master price above "₹1,500
    // has been posted to your bill" would show a number that was never charged.
    // The breakdown is derived from today's price too, so it goes with it.
    // A declined quote is dead, though: asking again re-quotes at today's price,
    // so that card goes back to showing today's.
    const liveRequest = request && !declined ? request : null;
    const quoted = liveRequest && Number.isFinite(Number(liveRequest.quotedTotal))
        ? Number(liveRequest.quotedTotal)
        : null;
    const headline = quoted === null ? offer.total : quoted;
    const breakdown = quoted === null ? priceBreakdown(offer, currency) : '';

    return (
        <div
            className={`bg-[#141414] border rounded-2xl p-4 mb-3 ${
                suggested ? 'border-yellow-500/40' : 'border-gray-800/70'
            }`}
        >
            {suggested ? (
                <span className={`${chipCls} bg-yellow-500/15 text-yellow-300 mb-2`}>
                    Suggested for you
                </span>
            ) : null}

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-white text-sm font-semibold m-0 leading-snug">{offer.name}</h3>
                    {offer.blurb ? (
                        <p className="text-gray-400 text-xs leading-relaxed mt-1 m-0">{offer.blurb}</p>
                    ) : null}
                </div>
                <div className="text-right shrink-0">
                    <p className="text-yellow-400 text-base font-bold m-0 leading-none">
                        {formatMoney(headline, currency)}
                    </p>
                    {breakdown ? (
                        <p className="text-gray-600 text-[11px] mt-1 m-0 leading-snug">{breakdown}</p>
                    ) : null}
                    {quoted !== null ? (
                        <p className="text-gray-600 text-[11px] mt-1 m-0 leading-snug">Your quoted price</p>
                    ) : null}
                </div>
            </div>

            {offer.suggestion ? <SuggestionLine text={offer.suggestion} /> : null}

            {/* ── Asked for, undecided ── */}
            {status === EXTRA_REQUEST_STATUS.REQUESTED ? (
                <div className="mt-3 border-t border-gray-800/70 pt-3">
                    <span className={`${chipCls} bg-amber-500/15 text-amber-300`}>
                        Requested — the hotel will confirm
                    </span>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 m-0">
                        The hotel will honour the price above even if their rates change. Nothing is
                        charged unless they confirm it.
                    </p>
                    {request.note ? (
                        <p className="text-gray-500 text-xs leading-relaxed mt-2 m-0">
                            Your note: “{request.note}”
                        </p>
                    ) : null}
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onWithdraw(offer.chargeId, request._id)}
                        className="text-gray-400 text-xs font-medium underline mt-3 disabled:opacity-50
                                   hover:text-gray-200 transition-colors bg-transparent border-0 p-0 cursor-pointer"
                    >
                        {busy ? 'Withdrawing…' : 'Withdraw this request'}
                    </button>
                </div>
            ) : null}

            {/* ── The desk said yes: now it IS a charge ── */}
            {status === EXTRA_REQUEST_STATUS.CONFIRMED ? (
                <div className="mt-3 border-t border-gray-800/70 pt-3">
                    <span className={`${chipCls} bg-green-500/15 text-green-300`}>
                        Confirmed by the hotel
                    </span>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 m-0">
                        {formatMoney(request.quotedTotal, currency)} has been posted to your bill. To change
                        it now, please speak to the front desk.
                    </p>
                </div>
            ) : null}

            {/* ── The desk said no. Their reason, in their words — never leave a
                   guest guessing what happened to something they asked for. ── */}
            {declined ? (
                <div className="mt-3 border-t border-gray-800/70 pt-3">
                    <span className={`${chipCls} bg-gray-700/60 text-gray-300`}>Not available</span>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 m-0">
                        The hotel could not confirm this one, and nothing has been charged.
                    </p>
                    {request.declineReason ? (
                        <p className="text-gray-300 text-xs leading-relaxed mt-2 m-0">
                            They said: “{request.declineReason}”
                        </p>
                    ) : null}
                </div>
            ) : null}

            {/* ── The ask: an optional note, then the request. Shown whenever the
                   server says the guest may ask — including after a decline, which
                   may only have applied to one date. ── */}
            {canRequest ? (
                <div className="mt-3">
                    <Field
                        id={noteId}
                        label="Anything the hotel should know? (optional)"
                        hint={`The desk sees this with your request. ${note.length}/${MAX_OFFER_NOTE} characters.`}
                    >
                        {(p) => (
                            <textarea
                                {...p}
                                rows={2}
                                maxLength={MAX_OFFER_NOTE}
                                placeholder="e.g. landing at 8am, happy to wait for the room"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className={`${inputCls(false)} resize-none min-h-[64px]`}
                            />
                        )}
                    </Field>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onRequest(offer.chargeId, note)}
                        className={`${secondaryBtnCls} w-full mt-3`}
                    >
                        {busy
                            ? 'Sending your request…'
                            : (declined ? 'Ask again' : `Request ${offer.name}`)}
                    </button>
                    <p className="text-gray-600 text-[11px] leading-relaxed mt-2 m-0">
                        Requesting costs nothing. The hotel confirms it first — only then is it charged.
                    </p>
                </div>
            ) : null}
        </div>
    );
}

export default function ExtrasStep({ vm }) {
    const {
        offers, offersCurrency, offerBusyId, askForOffer, withdrawOfferRequest,
        hotelCheckInTime, hotelCheckOutTime,
    } = vm;

    // The step only exists because the first load found offers, but the hotel can
    // un-tick the last offerable charge while the guest is mid-wizard. The step
    // cannot be pulled out from under them at that point (every index after it
    // would shift), so it says so plainly rather than rendering a blank page.
    if (!offers.length) {
        return (
            <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
                <p className="text-white text-sm font-semibold m-0">Nothing to add right now</p>
                <p className="text-gray-400 text-xs leading-relaxed mt-1 m-0">
                    The hotel has no extras available for your stay at the moment. You can always ask at
                    the desk when you arrive — continue to the next step.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
                <p className="text-white text-sm font-semibold m-0">These are requests, not bookings</p>
                <p className="text-gray-400 text-xs leading-relaxed mt-1 m-0">
                    Ask for anything below and the hotel will confirm what it can — availability depends on
                    the rooms around yours. You are charged only for what they confirm.
                </p>
                {hotelCheckInTime || hotelCheckOutTime ? (
                    <p className="text-gray-600 text-[11px] leading-relaxed mt-2 m-0">
                        {hotelCheckInTime ? `Standard check-in is from ${hotelCheckInTime}` : ''}
                        {hotelCheckInTime && hotelCheckOutTime ? ' · ' : ''}
                        {hotelCheckOutTime ? `checkout by ${hotelCheckOutTime}` : ''}
                    </p>
                ) : null}
            </div>

            {/* Server order is deliberate — suggested offers come first. */}
            {offers.map((offer) => (
                <OfferCard
                    key={offer.chargeId}
                    offer={offer}
                    currency={offersCurrency}
                    busy={offerBusyId === offer.chargeId}
                    onRequest={askForOffer}
                    onWithdraw={withdrawOfferRequest}
                />
            ))}

            <p className="text-gray-600 text-xs leading-relaxed mt-1 mb-4">
                You can skip this entirely and ask at the desk instead.
            </p>
        </div>
    );
}

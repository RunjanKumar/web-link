import { Link } from 'react-router-dom';
import useCustomerProfile from '../../../hooks/CustomerProfile';
import DepositCard from '../components/DepositCard';
import { formatDayDate, nightsBetween } from '../../../utils/webCheckInHelpers';

const contactLinkCls = 'text-yellow-400 text-xs font-medium border border-yellow-400/30 rounded-full px-4 py-2 '
    + 'hover:bg-yellow-400/10 transition-colors';

/**
 * Step 1 — the booking as the hotel has it. Nothing to fill in: the guest
 * confirms it is theirs (or contacts the hotel) and continues.
 */
function Row({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-800/60 last:border-b-0">
            <span className="text-gray-500 text-xs">{label}</span>
            <span className="text-white text-sm font-medium text-right">{value || '—'}</span>
        </div>
    );
}

export default function SummaryStep({ vm }) {
    const { hotelData, roomNumber, isModuleEnabled } = useCustomerProfile();
    const { booking } = vm;

    const nights = booking?.totalDaysStayed || nightsBetween(booking?.checkInDate, booking?.checkOutDate);
    const room = booking?.roomNumber || roomNumber;
    const phone = Array.isArray(hotelData?.phone) ? hotelData.phone[0] : hotelData?.phone;
    const email = Array.isArray(hotelData?.email) ? hotelData.email[0] : hotelData?.email;
    // Reception chat is open to pre-arrival guests unless this hotel switched the module off.
    const chatAvailable = isModuleEnabled('CHAT');
    const hasContact = chatAvailable || phone || email;

    return (
        <div>
            <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
                <p className="text-yellow-400 text-xs font-semibold tracking-widest uppercase m-0 mb-1">Reservation</p>
                <h3 className="text-white text-lg font-bold m-0 leading-tight">{hotelData?.name || 'Your hotel'}</h3>
                <div className="mt-3">
                    <Row
                        label="Room"
                        value={room ? `${room}${booking?.roomCategoryName ? ` · ${booking.roomCategoryName}` : ''}` : (booking?.roomCategoryName || '')}
                    />
                    <Row label="Check-in" value={formatDayDate(booking?.checkInDate)} />
                    <Row label="Check-out" value={formatDayDate(booking?.checkOutDate)} />
                    <Row label="Nights" value={nights !== '' && nights !== undefined ? String(nights) : ''} />
                    <Row label="Guests" value={booking?.totalGuests ? String(booking.totalGuests) : ''} />
                </div>
            </div>

            <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
                <p className="text-white text-sm font-semibold m-0">Is this correct?</p>
                <p className="text-gray-400 text-xs leading-relaxed mt-1 m-0">
                    If anything above looks wrong, please contact the hotel before you continue —
                    the details you enter next are attached to this reservation.
                </p>
                {hasContact ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {chatAvailable ? (
                            <Link to="/chat" className={contactLinkCls}>
                                Message reception
                            </Link>
                        ) : null}
                        {phone ? (
                            <a href={`tel:${String(phone).replace(/\s/g, '')}`} className={contactLinkCls}>
                                Call {phone}
                            </a>
                        ) : null}
                        {email ? (
                            <a href={`mailto:${email}`} className={contactLinkCls}>
                                Email the hotel
                            </a>
                        ) : null}
                    </div>
                ) : (
                    <p className="text-gray-600 text-xs mt-2 m-0">Reach the reception on the number in your booking email.</p>
                )}
            </div>

            {/* Optional prepayment against the stay above — Razorpay's hosted page. */}
            <DepositCard />

            <p className="text-gray-600 text-xs leading-relaxed">
                Takes about 5 minutes. Have your ID handy — you will upload a photo of it.
            </p>
        </div>
    );
}

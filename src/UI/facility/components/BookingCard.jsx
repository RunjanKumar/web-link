import { CalendarIcon, PeopleIcon, LocationIcon, StatusIcon } from '../../../assets/icons';
import EventInfoRow from './EventInfoRow';

/**
 * BookingCard — Renders a single facility booking event.
 *
 * Receives pre-formatted display data from the ViewModel.
 * No business logic here — pure presentation.
 */
export default function BookingCard({ booking }) {
    const {
        displayDate,
        displayGuests,
        displayName,
        displayStatusLabel,
        displayStatusColor,
    } = booking;

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800/40 px-4 py-1 mb-4">
            {/* Date & Time */}
            <EventInfoRow
                icon={<CalendarIcon size={18} color="#facc15" />}
                text={displayDate}
                textClassName="text-gray-300"
            />

            {/* Guests */}
            <EventInfoRow
                icon={<PeopleIcon size={18} color="#facc15" />}
                text={displayGuests}
                textClassName="text-gray-300"
            />

            {/* Facility Name */}
            <EventInfoRow
                icon={<LocationIcon size={18} color="#facc15" />}
                text={displayName}
                textClassName="text-gray-300"
            />

            {/* Status */}
            <EventInfoRow
                icon={<StatusIcon size={18} color={displayStatusColor} />}
                text={displayStatusLabel}
                textClassName="font-semibold"
                textStyle={{ color: displayStatusColor }}
            />
        </div>
    );
}

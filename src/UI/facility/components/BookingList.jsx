import BookingCard from './BookingCard';

/**
 * BookingList — Renders a list of BookingCards with an empty state fallback.
 *
 * Props:
 *   bookings       — Array of formatted booking objects from ViewModel
 *   hasAny         — Boolean: whether there are any bookings at all
 *   emptyMessage   — Optional custom empty-state text
 */
export default function BookingList({ bookings = [], hasAny = true, emptyMessage = 'No bookings yet' }) {
    if (!hasAny) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
            ))}
        </div>
    );
}

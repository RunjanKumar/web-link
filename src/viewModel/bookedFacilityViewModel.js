import { useEffect, useState, useCallback, useMemo } from "react";
import { getFacilityReservations } from "../api/service/facilityService";
import { getApiErrorMessage } from "../api/client";
import {
    HOTEL_FACILITY_BOOKING_STATUS,
    FACILITY_STATUS_LABELS,
    FACILITY_STATUS_COLORS,
} from "../utils/constant";
import { formattedDate, formattedTime } from "../utils/commonFunction";

/**
 * ══════════════════════════════════════════════════════════════
 * BOOKED FACILITY VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * Responsibilities:
 *   1. Fetch all facility reservations from the API
 *   2. Transform raw data into display-ready format
 *   3. Group reservations by status (Pending, Approved, Disapproved)
 *   4. Expose formatted data + loading/error state to the View
 */

/* ── Transform a raw reservation into display-ready data ── */
function formatBookingForDisplay(booking) {
    const name =
        booking.name ||
        booking.facilityName ||
        booking.hotelFacilityId?.name ||
        'Facility';

    const dateTimeStr = booking.bookingDate || booking.dateTime || booking.requestedAt || booking.createdAt;
    const guests = booking.numberOfGuests || booking.numberOfPeople || booking.guests || 0;
    const status = booking.status || HOTEL_FACILITY_BOOKING_STATUS.PENDING;

    const formatted = {
        id: booking._id,
        displayDate: dateTimeStr
            ? `${formattedDate(dateTimeStr)} at ${formattedTime(dateTimeStr)}`
            : '',
        displayGuests: guests ? `${guests} ${guests === 1 ? 'guest' : 'guests'}` : '',
        displayName: name,
        displayStatusLabel: FACILITY_STATUS_LABELS[status] || 'Unknown',
        displayStatusColor: FACILITY_STATUS_COLORS[status] || '#6b7280',
        status,
    };

    console.log('📋 [BookedFacilityVM] formatBookingForDisplay():', {
        rawId: booking._id,
        rawStatus: status,
        '→ displayDate': formatted.displayDate,
        '→ displayGuests': formatted.displayGuests,
        '→ displayName': formatted.displayName,
        '→ displayStatusLabel': formatted.displayStatusLabel,
    });

    return formatted;
}

export default function useBookedFacilityViewModel() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch reservations from API ──
    const fetchReservations = useCallback(async () => {
        console.log('📋 STEP-1 [BookedFacilityVM] fetchReservations() — Starting...');
        setLoading(true);
        setError(null);

        try {
            // STEP-2: Call API service
            const response = await getFacilityReservations();
            console.log('📋 STEP-2 [BookedFacilityVM] API returned. Raw response keys:', Object.keys(response || {}));

            // STEP-3: Extract array
            const data = response?.data || response || [];
            console.log('📋 STEP-3 [BookedFacilityVM] Extracted', data.length, 'reservations');

            // Log first item shape for learning
            if (data.length > 0) {
                console.log('📋 STEP-4 [BookedFacilityVM] First reservation (shape reference):', Object.keys(data[0]));
            }

            setReservations(data);
        } catch (err) {
            console.error('🔴 [BookedFacilityVM] fetchReservations() FAILED:', err.message);
            const message = getApiErrorMessage(err, 'Failed to load reservations.');
            setError(message);
        } finally {
            setLoading(false);
            console.log('📋 STEP-5 [BookedFacilityVM] fetchReservations() — Complete');
        }
    }, []);

    // ── Auto-fetch on mount ──
    useEffect(() => {
        console.log('📋 [BookedFacilityVM] Component mounted → triggering fetchReservations()');
        fetchReservations();
    }, [fetchReservations]);

    // ── Format all reservations for display ──
    // LEARNING: useMemo caches the result. Reformatting only runs when `reservations` array changes.
    const formattedReservations = useMemo(() => {
        console.log('📋 [BookedFacilityVM] useMemo → formatting', reservations.length, 'reservations for display');
        return reservations.map(formatBookingForDisplay);
    }, [reservations]);

    // ── Group by status ──
    // LEARNING: Each useMemo filters the formatted list — only recomputes when formattedReservations changes
    const pendingReservations = useMemo(
        () => formattedReservations.filter((r) => r.status === HOTEL_FACILITY_BOOKING_STATUS.PENDING),
        [formattedReservations]
    );

    const approvedReservations = useMemo(
        () => formattedReservations.filter((r) => r.status === HOTEL_FACILITY_BOOKING_STATUS.APPROVED),
        [formattedReservations]
    );

    const disapprovedReservations = useMemo(
        () => formattedReservations.filter((r) => r.status === HOTEL_FACILITY_BOOKING_STATUS.DISAPPROVED),
        [formattedReservations]
    );

    const hasAnyReservations = reservations.length > 0;

    console.log('📋 [BookedFacilityVM] Groups → Pending:', pendingReservations.length, '| Approved:', approvedReservations.length, '| Disapproved:', disapprovedReservations.length);

    // ── Return everything the View needs ──
    return {
        pendingReservations,
        approvedReservations,
        disapprovedReservations,
        hasAnyReservations,
        loading,
        error,
        refetch: fetchReservations,
    };
}

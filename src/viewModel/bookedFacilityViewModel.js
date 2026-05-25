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
    // console.log(booking, "[BookedFacilityVM] Formatting booking for display");
    const name = booking.facilityName;
    const dateTimeStr = booking.bookingDate;
    const guests = booking.numberOfGuests;
    const status = booking.status;

    const formatted = {
        id: booking._id,
        displayDate: dateTimeStr
            ? `${formattedDate(dateTimeStr)} at ${formattedTime(dateTimeStr)}`
            : '',
        displayGuests: guests ? `${guests} ${guests === 1 ? 'guest' : 'guests'}` : '',
        displayName: name,
        displayFacilityTypeName: booking.facilityTypeName,
        displayStatusLabel: FACILITY_STATUS_LABELS[status] || 'Unknown',
        displayStatusColor: FACILITY_STATUS_COLORS[status] || '#6b7280',
        status,
    };
    return formatted;
}

export default function useBookedFacilityViewModel() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch reservations from API ──
    const fetchReservations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // STEP-2: Call API service
            const response = await getFacilityReservations();

            // STEP-3: Extract array
            const data = response?.data || response || [];

            setReservations(data);
        } catch (err) {
            console.error('🔴 [BookedFacilityVM] fetchReservations() FAILED:', err.message);
            const message = getApiErrorMessage(err, 'Failed to load reservations.');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Auto-fetch on mount ──
    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    // ── Format all reservations for display ──
    // LEARNING: useMemo caches the result. Reformatting only runs when `reservations` array changes.
    const formattedReservations = useMemo(() => {
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

import { useEffect, useState, useCallback, useMemo } from "react";
import { getFacilityReservations } from "../api/service/facilityService";
import { getApiErrorMessage } from "../api/client";
import { BOOKING_STATUS } from "../utils/constant";

/**
 * ══════════════════════════════════════════════════════════════
 * BOOKED FACILITY VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is the EXACT same pattern as bookServiceViewModel.js
 * but for facility reservations instead of service requests.
 *
 * Pattern:
 *   1. On mount → fetch all reservations from API
 *   2. Group them by status (Pending, Confirmed, Completed, Cancelled)
 *   3. Expose grouped lists + loading/error to the UI
 *
 * If you compare this with bookServiceViewModel.js side-by-side,
 * you'll see they're almost identical — that's the beauty of MVVM!
 */

export default function useBookedFacilityViewModel() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ══════════════════════════════════════════════════════════
    // FETCH RESERVATIONS
    //
    // LEARNING: useCallback ensures this function reference stays
    // stable across re-renders. Without it, useEffect would fire
    // on every render because the function would be "new" each time.
    // ══════════════════════════════════════════════════════════
    const fetchReservations = useCallback(async () => {
        console.log('📋 [BookedFacilityVM] fetchReservations() — Starting...');
        setLoading(true);
        setError(null);

        try {
            const response = await getFacilityReservations();
            console.log('📋 [BookedFacilityVM] Raw API response:', response);

            // ──────────────────────────────────────────────────
            // LEARNING: Extract the array from the response.
            // Backend may nest it differently, so we try multiple paths.
            // The console.log above shows you the ACTUAL shape.
            // ──────────────────────────────────────────────────
            const data = response?.data || response || [];
            console.log('📋 [BookedFacilityVM] Extracted reservations array:', data);
            console.log('📋 [BookedFacilityVM] Total reservations:', data.length);

            // Log first item shape for learning
            if (data.length > 0) {
                console.log('📋 [BookedFacilityVM] First reservation (shape reference):', JSON.stringify(data[0], null, 2));
            }

            setReservations(data);
        } catch (err) {
            console.error('❌ [BookedFacilityVM] fetchReservations() FAILED:', err);
            const message = getApiErrorMessage(err, 'Failed to load reservations.');
            setError(message);
        } finally {
            setLoading(false);
            console.log('📋 [BookedFacilityVM] fetchReservations() — Done');
        }
    }, []);

    // ── Auto-fetch on mount ──
    useEffect(() => {
        console.log('📋 [BookedFacilityVM] Component mounted → fetching reservations...');
        fetchReservations();
    }, [fetchReservations]);

    // ══════════════════════════════════════════════════════════
    // GROUP BY STATUS
    //
    // LEARNING: useMemo caches the filtered arrays.
    // They only re-compute when `reservations` changes.
    // This is the EXACT same pattern as bookServiceViewModel.js
    // ══════════════════════════════════════════════════════════
    const pendingReservations = useMemo(() => {
        const filtered = reservations.filter((r) => r.status === BOOKING_STATUS.PENDING);
        console.log('📋 [BookedFacilityVM] Pending count:', filtered.length);
        return filtered;
    }, [reservations]);

    const inProgressReservations = useMemo(() => {
        const filtered = reservations.filter((r) => r.status === BOOKING_STATUS.IN_PROGRESS);
        console.log('📋 [BookedFacilityVM] In Progress count:', filtered.length);
        return filtered;
    }, [reservations]);

    const completedReservations = useMemo(() => {
        const filtered = reservations.filter((r) => r.status === BOOKING_STATUS.COMPLETED);
        console.log('📋 [BookedFacilityVM] Completed count:', filtered.length);
        return filtered;
    }, [reservations]);

    const cancelledReservations = useMemo(() => {
        const filtered = reservations.filter((r) => r.status === BOOKING_STATUS.CANCEL);
        console.log('📋 [BookedFacilityVM] Cancelled count:', filtered.length);
        return filtered;
    }, [reservations]);

    const hasAnyReservations = reservations.length > 0;

    // ══════════════════════════════════════════════════════════
    // RETURN — everything the UpcomingEvents UI needs
    // ══════════════════════════════════════════════════════════
    return {
        reservations,
        pendingReservations,
        inProgressReservations,
        completedReservations,
        cancelledReservations,
        hasAnyReservations,
        loading,
        error,
        refetch: fetchReservations,
    };
}

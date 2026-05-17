import { useState, useCallback } from "react";
import { submitFacilityReservation } from "../api/service/facilityService";
import { getApiErrorMessage } from "../api/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * ══════════════════════════════════════════════════════════════
 * RESERVE VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This ViewModel handles the "Reserve a table" form.
 *
 * Pattern (same as reviewRequestViewModel.js for services):
 *   1. Hold form state (dateTime, numberOfPeople)
 *   2. On submit → validate → call API → handle success/error
 *   3. On success → navigate to bookings page with toast
 *
 * Data flow:
 *   User fills form → clicks Reserve → submitReservation()
 *   → submitFacilityReservation(payload) API call
 *   → Success → navigate('/facilities/upcoming-events')
 *   → Error → toast.error(message)
 */

export default function useReserveViewModel(facility) {
    // ── Form State ──
    const [dateTime, setDateTime] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState('');
    const [showPeoplePicker, setShowPeoplePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    // People options for the dropdown
    const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20];

    console.log('📝 [ReserveVM] Hook initialized for facility:', facility?.name || 'unknown');

    // ══════════════════════════════════════════════════════════
    // SELECT NUMBER OF PEOPLE
    // ══════════════════════════════════════════════════════════
    const selectPeople = useCallback((num) => {
        console.log('📝 [ReserveVM] selectPeople() →', num);
        setNumberOfPeople(num);
        setShowPeoplePicker(false);
    }, []);

    // ══════════════════════════════════════════════════════════
    // TOGGLE PEOPLE PICKER
    // ══════════════════════════════════════════════════════════
    const togglePeoplePicker = useCallback(() => {
        setShowPeoplePicker((prev) => !prev);
    }, []);

    // ══════════════════════════════════════════════════════════
    // SUBMIT RESERVATION
    // ══════════════════════════════════════════════════════════
    const submitReservation = useCallback(async () => {
        console.log('📝 STEP-1 [ReserveVM] submitReservation() called. Current form state:', { dateTime, numberOfPeople });

        // ── STEP-2: Validate ──
        if (!dateTime) {
            console.log('🟡 STEP-2 [ReserveVM] Validation FAILED: no dateTime selected');
            toast.error('Please select date and time');
            return;
        }
        if (!numberOfPeople) {
            console.log('🟡 STEP-2 [ReserveVM] Validation FAILED: no numberOfPeople selected');
            toast.error('Please select number of people');
            return;
        }
        console.log('📝 STEP-2 [ReserveVM] Validation PASSED ✓');

        // ── STEP-3: Build payload ──
        // LEARNING: facility is a types[] item from the backend.
        // It has _id (the type's ID), facilityId (parent category ID).
        const payload = {
            facilityId: facility?.facilityId,
            facilityTypeId: facility?._id,
            bookingDate: new Date(dateTime).toISOString(),
            numberOfGuests: Number(numberOfPeople),
        };

        console.log('📝 STEP-3 [ReserveVM] Payload built:', JSON.stringify(payload, null, 2));

        // ── STEP-4: Call API ──
        setIsSubmitting(true);
        try {
            console.log('📝 STEP-4 [ReserveVM] Calling submitFacilityReservation()...');
            const response = await submitFacilityReservation(payload);
            console.log('🟢 STEP-5 [ReserveVM] Reservation SUCCESS! Server response:', response);

            // ── STEP-6: Navigate on success ──
            toast.success('Your reservation has been successfully submitted!');
            console.log('📝 STEP-6 [ReserveVM] Navigating to /facilities/upcoming-events');
            navigate('/facilities/upcoming-events', {
                state: { showToast: false },
            });
        } catch (err) {
            console.error('🔴 STEP-5 [ReserveVM] Reservation FAILED:', err.message);
            const message = getApiErrorMessage(err, 'Failed to submit reservation.');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
            console.log('📝 [ReserveVM] submitReservation() — Complete');
        }
    }, [dateTime, numberOfPeople, facility, navigate]);

    // ══════════════════════════════════════════════════════════
    // RETURN — everything the ReserveTable UI needs
    // ══════════════════════════════════════════════════════════
    return {
        dateTime,
        setDateTime,
        numberOfPeople,
        showPeoplePicker,
        peopleOptions,
        selectPeople,
        togglePeoplePicker,
        submitReservation,
        isSubmitting,
    };
}

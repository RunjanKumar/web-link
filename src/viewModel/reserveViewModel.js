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


    // ══════════════════════════════════════════════════════════
    // SELECT NUMBER OF PEOPLE
    // ══════════════════════════════════════════════════════════
    const selectPeople = useCallback((num) => {
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

        // ── STEP-2: Validate ──
        if (!dateTime) {
            toast.error('Please select date and time');
            return;
        }
        if (!numberOfPeople) {
            toast.error('Please select number of people');
            return;
        }

        // ── STEP-3: Build payload ──
        // LEARNING: facility is a types[] item from the backend.
        // It has _id (the type's ID), facilityId (parent category ID).
        const payload = {
            facilityId: facility?.facilityId,
            facilityTypeId: facility?._id,
            bookingDate: dateTime,
            numberOfGuests: Number(numberOfPeople),
        };


        // ── STEP-4: Call API ──
        setIsSubmitting(true);
        try {
            const response = await submitFacilityReservation(payload);

            // ── STEP-6: Navigate on success ──
            toast.success('Your reservation has been successfully submitted!');
            navigate('/facilities/upcoming-events', {
                state: { showToast: false },
            });
        } catch (err) {
            console.error('🔴 STEP-5 [ReserveVM] Reservation FAILED:', err.message);
            const message = getApiErrorMessage(err, 'Failed to submit reservation.');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
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

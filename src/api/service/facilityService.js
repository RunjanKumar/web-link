import apiClient from '../client';
import { ENDPOINTS } from '../endpoint';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY SERVICE — API Layer
 * ══════════════════════════════════════════════════════════════
 *
 * This file is the API "gateway" for all facility-related calls.
 * It talks to the backend and returns raw data to the ViewModel.
 *
 * LEARNING: The flow is:
 *   UI Component → ViewModel → THIS SERVICE → apiClient (Axios) → Backend
 *   Backend Response → apiClient → THIS SERVICE → ViewModel → UI
 */

// ══════════════════════════════════════════════════════════════
// 1. GET ALL FACILITIES
//    GET /v1/hotelFacility
//    Returns: list of hotel facilities (restaurants, spas, etc.)
// ══════════════════════════════════════════════════════════════
export async function getFacility() {
    // STEP-1: Log that the service layer was called

    const response = await apiClient.get(ENDPOINTS.FACILITIES);

    // STEP-2: Log what the backend actually returned (helps debug shape mismatches)

    return response.data;
}

// ══════════════════════════════════════════════════════════════
// 2. SUBMIT A FACILITY RESERVATION (BOOKING)
//    POST /v1/hotelFacility/book
//    Payload: { facilityId, facilityTypeId, bookingDate, numberOfGuests }
// ══════════════════════════════════════════════════════════════
export async function submitFacilityReservation(payload) {
    // STEP-1: Log the exact payload being sent (useful if booking fails)

    const response = await apiClient.post(
        ENDPOINTS.FACILITIES_RESERVE,
        payload
    );

    // STEP-2: Log the server's confirmation
    return response.data;
}

// ══════════════════════════════════════════════════════════════
// 3. GET ALL FACILITY RESERVATIONS (BOOKINGS)
//    GET /v1/hotelFacility/book
//    Returns: list of the customer's facility bookings
// ══════════════════════════════════════════════════════════════
export async function getFacilityReservations() {

    const response = await apiClient.get(ENDPOINTS.FACILITIES_RESERVATIONS);

    return response.data;
}
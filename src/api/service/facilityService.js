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
    console.log('📡 [FacilityService] getFacility() called');
    console.log('📡 [FacilityService] Endpoint:', ENDPOINTS.FACILITIES);

    const response = await apiClient.get(ENDPOINTS.FACILITIES);

    console.log('✅ [FacilityService] getFacility() raw response:', response.data);
    return response.data;
}

// ══════════════════════════════════════════════════════════════
// 2. SUBMIT A FACILITY RESERVATION (BOOKING)
//    POST /v1/hotelFacility/book
//    Payload: { hotelFacilityId, dateTime, numberOfPeople, ... }
// ══════════════════════════════════════════════════════════════
export async function submitFacilityReservation(payload) {
    console.log('📡 [FacilityService] submitFacilityReservation() called');
    console.log('📡 [FacilityService] Endpoint:', ENDPOINTS.FACILITIES_RESERVE);
    console.log('📡 [FacilityService] Payload being sent:', JSON.stringify(payload, null, 2));

    const response = await apiClient.post(
        ENDPOINTS.FACILITIES_RESERVE,
        payload
    );

    console.log('✅ [FacilityService] submitFacilityReservation() response:', response.data);
    return response.data;
}

// ══════════════════════════════════════════════════════════════
// 3. GET ALL FACILITY RESERVATIONS (BOOKINGS)
//    GET /v1/hotelFacility/book
//    Returns: list of the customer's facility bookings
// ══════════════════════════════════════════════════════════════
export async function getFacilityReservations() {
    console.log('📡 [FacilityService] getFacilityReservations() called');
    console.log('📡 [FacilityService] Endpoint:', ENDPOINTS.FACILITIES_RESERVATIONS);

    const response = await apiClient.get(ENDPOINTS.FACILITIES_RESERVATIONS);

    console.log('✅ [FacilityService] getFacilityReservations() raw response:', response.data);
    return response.data;
}
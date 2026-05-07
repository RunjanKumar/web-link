import { useState, useEffect } from 'react';
import { getCustomerProfile, getQuickCall } from '../api/service/dashboardService';

/**
 * ViewModel for the Dashboard / UserProfile.
 * Fetches real guest profile data from the backend using the stored JWT.
 *
 * Returns:
 *   - profileData  : raw API response object (null while loading)
 *   - name         : guest display name
 *   - room         : room number/label
 *   - hotelName    : name of the hotel
 *   - checkIn      : check-in date string
 *   - checkOut     : check-out date string
 *   - isLoading    : true while API call is in-flight
 *   - error        : error message string if the call failed
 */
export default function useDashboardViewModel() {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quickCallData, setQuickCallData] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchProfile() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getCustomerProfile();
                if (!cancelled) {
                    setProfileData(data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Dashboard profile fetch error:', err);
                    setError(err?.response?.data?.message || 'Failed to load profile');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        async function fetchQuickCall() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getQuickCall();
                if (!cancelled) {
                    setQuickCallData(data.data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Quick Call fetch error:', err);
                    setError(err?.response?.data?.message || 'Failed to load quick call');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchProfile();
        fetchQuickCall();
        return () => { cancelled = true; };
    }, []);
    console.log("profileData", profileData);
    // ── Safely extract fields (adjust field names to match real API response) ──
    const name = profileData?.data?.user?.name;
    const room = profileData?.data?.bookRoomData[0]?.roomData?.roomNumber;
    const hotelName = profileData?.data?.hotelData?.name;
    const checkIn = profileData?.data?.bookRoomData[0]?.checkInDate
    const checkOut = profileData?.data?.bookRoomData[0]?.checkOutDate

    return {
        profileData, //infurtrue remobe name roomm all things and only pass profileData.
        name,
        room,
        hotelName,
        checkIn,
        checkOut,
        isLoading,
        error,
        quickCallData,
    };
}

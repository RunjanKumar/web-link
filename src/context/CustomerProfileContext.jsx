import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCustomerProfile } from '../api/service/dashboardService';
import { CustomerProfileContext } from './CustomerProfileDef';

export function CustomerProfileProvider({ children }) {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomerProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getCustomerProfile();
            setProfileData(response);
        } catch (err) {
            console.error('[CustomerProfile] Failed to load profile:', err);
            setError(err?.response?.data?.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadCustomerProfile() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await getCustomerProfile();
                if (!cancelled) {
                    setProfileData(response);
                }
            } catch (err) {
                console.error('[CustomerProfile] Failed to load profile:', err);
                if (!cancelled) {
                    setError(err?.response?.data?.message || 'Failed to load profile');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadCustomerProfile();

        return () => {
            cancelled = true;
        };
    }, [fetchCustomerProfile]);

    const value = useMemo(() => {
        const data = profileData?.data || {};
        const roomData = data.bookRoomData?.[0]?.roomData || {};

        // ── Portal mode (web check-in) ──────────────────────────────────────
        // customerStatus: 1 CHECK_IN, 2 CHECK_OUT, 3 BOOKED, 4 CANCELLED.
        // A BOOKED (advance-booking) guest lands on the pre-arrival form until
        // staff APPROVE their web check-in, then browses with ordering locked
        // until the real check-in. This is UX routing only — the server blocks
        // every order/write for non-checked-in guests regardless.
        const customerStatus = data.user?.customerStatus ?? null;
        const webCheckIn = data.webCheckIn || null;
        const checkInDate = data.bookRoomData?.[0]?.checkInDate || null;

        let portalMode = 'LOADING';
        if (!isLoading) {
            if (error || !customerStatus) portalMode = 'BLOCKED';
            else if (customerStatus === 1) portalMode = 'CHECKED_IN';
            else if (customerStatus === 3) {
                portalMode = webCheckIn?.status === 'APPROVED' ? 'PRE_CHECKIN_BROWSE' : 'FORM';
            } else portalMode = 'BLOCKED'; // CHECK_OUT / CANCELLED
        }

        const canOrder = portalMode === 'CHECKED_IN';
        const orderLockMessage = checkInDate
            ? `Ordering unlocks on ${new Date(checkInDate).toDateString()}, once the hotel checks you in.`
            : 'Ordering unlocks once the hotel checks you in.';

        return {
            profileData,
            isLoading,
            error,
            customerData: data.user || null,
            hotelData: data.hotelData || null,
            roomData,
            roomNumber: roomData.roomNumber,
            portalMode,
            canOrder,
            checkInDate,
            orderLockMessage,
            webCheckIn,
            refetch: fetchCustomerProfile,
        };
    }, [error, fetchCustomerProfile, isLoading, profileData]);

    return (
        <CustomerProfileContext.Provider value={value}>
            {children}
        </CustomerProfileContext.Provider>
    );
}

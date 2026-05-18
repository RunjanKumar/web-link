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

        return {
            profileData,
            isLoading,
            error,
            customerData: data.user || null,
            hotelData: data.hotelData || null,
            roomData,
            roomNumber: roomData.roomNumber,
            refetch: fetchCustomerProfile,
        };
    }, [error, fetchCustomerProfile, isLoading, profileData]);

    return (
        <CustomerProfileContext.Provider value={value}>
            {children}
        </CustomerProfileContext.Provider>
    );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyBill } from '../api/service/billService';
import { getApiErrorMessage } from '../api/client';
import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * ViewModel for the guest's room bill (folio summary).
 * The backend resolves the stay from the token, so the guest only ever sees
 * the bill for their own current stay — if there is no active stay or no
 * charges yet, the page shows an empty state.
 */
export default function useBillViewModel() {
    const { hotelData, isLoading: profileLoading } = useCustomerProfile();
    const hotelId = hotelData?._id;

    const [bill, setBill] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBill = useCallback(async () => {
        if (!hotelId) return;
        setFetchLoading(true);
        setError(null);
        try {
            const data = await getMyBill(hotelId);
            setBill(data?.data || null);
        } catch (err) {
            // 404 = no active stay found — an empty bill, not an error.
            if (err?.response?.status === 404) {
                setBill(null);
            } else {
                setError(getApiErrorMessage(err, 'Failed to load your bill.'));
            }
            console.error('Bill fetch error:', err);
        } finally {
            setFetchLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        fetchBill();
    }, [fetchBill]);

    const charges = useMemo(() => bill?.charges || [], [bill]);
    const payments = useMemo(() => bill?.payments || [], [bill]);

    // If the profile resolved without a hotel there is nothing to fetch —
    // fall straight through to the empty state instead of spinning forever.
    const loading = profileLoading || (Boolean(hotelId) && fetchLoading);

    return {
        bill,
        charges,
        payments,
        hasBill: charges.length > 0 || payments.length > 0,
        loading,
        error,
        refetch: fetchBill,
    };
}

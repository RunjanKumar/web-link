import { useCallback, useEffect, useState } from 'react';
import { getMyDincharya } from '../api/service/dincharyaService';
import { getApiErrorMessage } from '../api/client';
import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * ViewModel for the guest's Daily Wellness Rhythm ("My Day").
 *
 * The backend resolves the stay from the token and serves only the days the
 * wellness team has PUBLISHED, so there is nothing to guard here: whatever
 * comes back is the guest's own, and `publishedDates` is exactly the set of
 * days they are allowed to page through.
 *
 * `date` starts empty on purpose — the server picks the best day to open on
 * (today if it is live, else the next published one). Once the guest taps a
 * date we ask for that one specifically.
 */
export default function useDincharyaViewModel() {
    const { hotelData, isLoading: profileLoading } = useCustomerProfile();
    const hotelId = hotelData?._id;

    const [date, setDate] = useState('');
    const [day, setDay] = useState(null);
    const [publishedDates, setPublishedDates] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDay = useCallback(async () => {
        if (!hotelId) return;
        setFetchLoading(true);
        setError(null);
        try {
            const res = await getMyDincharya(hotelId, date);
            const data = res?.data || {};
            setDay(data.day || null);
            setPublishedDates(data.publishedDates || []);
        } catch (err) {
            // 404 = no active stay — nothing published yet, not an error.
            if (err?.response?.status === 404) {
                setDay(null);
                setPublishedDates([]);
            } else {
                setError(getApiErrorMessage(err, 'Failed to load your day.'));
            }
            console.error('Dincharya fetch error:', err);
        } finally {
            setFetchLoading(false);
        }
    }, [hotelId, date]);

    useEffect(() => {
        fetchDay();
    }, [fetchDay]);

    // If the profile resolved without a hotel there is nothing to fetch —
    // fall straight through to the empty state instead of spinning forever.
    const loading = profileLoading || (Boolean(hotelId) && fetchLoading);

    return {
        day,
        rows: day?.rows || [],
        publishedDates,
        // What the server actually served, which is what the date strip
        // highlights — it may differ from the date we asked for.
        activeDate: day?.date || '',
        selectDate: setDate,
        loading,
        error,
        refetch: fetchDay,
    };
}

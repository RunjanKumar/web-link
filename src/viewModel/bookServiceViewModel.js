import { useEffect, useState, useCallback } from "react";
import { getServiceRequest } from "../api/service/serviceService";
import { getApiErrorMessage } from "../api/client";

/**
 * ViewModel for the BookedService page.
 * Fetches all booked service requests for the customer and exposes
 * loading / error states for production-quality UX.
 */
export default function useBookedServiceModel() {
    const [bookedServiceData, setBookedServiceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookedServiceData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getServiceRequest();
            setBookedServiceData(data?.data || []);
        } catch (err) {
            const message = getApiErrorMessage(err, 'Failed to load service requests.');
            setError(message);
            console.error('BookedService fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookedServiceData();
    }, [fetchBookedServiceData]);

    return {
        bookedServiceData,
        loading,
        error,
        refetch: fetchBookedServiceData,
    };
}
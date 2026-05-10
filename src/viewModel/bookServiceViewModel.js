import { useEffect, useState, useCallback, useMemo } from "react";
import { getServiceRequest } from "../api/service/serviceService";
import { getApiErrorMessage } from "../api/client";
import { BOOKING_STATUS } from "../utils/constant";

/**
 * ViewModel for the BookedService page.
 * Fetches all booked service requests for the customer and exposes
 * loading / error states + status-grouped lists for production-quality UX.
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

    /* ── Group services by status ── */
    const pendingServices = useMemo(
        () => bookedServiceData.filter((s) => s.status === BOOKING_STATUS.PENDING),
        [bookedServiceData]
    );
    const inProgressServices = useMemo(
        () => bookedServiceData.filter((s) => s.status === BOOKING_STATUS.IN_PROGRESS),
        [bookedServiceData]
    );
    const completedServices = useMemo(
        () => bookedServiceData.filter((s) => s.status === BOOKING_STATUS.COMPLETED),
        [bookedServiceData]
    );
    const cancelledServices = useMemo(
        () => bookedServiceData.filter((s) => s.status === BOOKING_STATUS.CANCEL),
        [bookedServiceData]
    );

    const hasAnyServices = bookedServiceData.length > 0;

    return {
        bookedServiceData,
        pendingServices,
        inProgressServices,
        completedServices,
        cancelledServices,
        hasAnyServices,
        loading,
        error,
        refetch: fetchBookedServiceData,
    };
}
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getMyLaundryOrders, cancelLaundryOrder } from '../api/service/laundryService';
import { getApiErrorMessage } from '../api/client';
import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * ViewModel for the guest's laundry order history / tracker.
 * Orders split into active (still moving) and past (delivered or cancelled).
 */
export default function useLaundryOrdersViewModel() {
    const { hotelData } = useCustomerProfile();
    const hotelId = hotelData?._id;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!hotelId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getMyLaundryOrders(hotelId);
            setOrders(data?.data?.orders || []);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to load your laundry orders.'));
            console.error('Laundry orders fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const activeOrders = useMemo(
        () => orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)),
        [orders],
    );
    const pastOrders = useMemo(
        () => orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status)),
        [orders],
    );

    // Only a REQUESTED order can be cancelled by the guest — once housekeeping
    // has collected it, the backend refuses and the front desk must step in.
    const cancelOrder = useCallback(async (order) => {
        setCancellingId(order._id);
        try {
            await cancelLaundryOrder(order._id, hotelId, 'Cancelled by guest');
            toast.success(`Order ${order.orderNumber} cancelled.`);
            await fetchOrders();
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Could not cancel this order.'));
            console.error('Laundry cancel error:', err);
        } finally {
            setCancellingId(null);
        }
    }, [hotelId, fetchOrders]);

    return {
        orders,
        activeOrders,
        pastOrders,
        hasAnyOrders: orders.length > 0,
        loading,
        error,
        refetch: fetchOrders,
        cancelOrder,
        cancellingId,
    };
}

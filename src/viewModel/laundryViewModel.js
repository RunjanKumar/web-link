import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getLaundryRateList, createLaundryOrder } from '../api/service/laundryService';
import { getApiErrorMessage } from '../api/client';
import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * ViewModel for the Laundry rate-list page.
 *
 * Holds the guest's basket (itemId → { serviceType, qty }) and submits it as one
 * order. Rates come from the hotel's rate list, so the totals shown here are the
 * same ones the backend recomputes on submit — the guest is never billed from a
 * client-side number. The charge itself is only posted to the folio when staff
 * mark the order DELIVERED.
 */
export default function useLaundryViewModel() {
    const navigate = useNavigate();
    const { hotelData } = useCustomerProfile();
    const hotelId = hotelData?._id;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // itemId → { serviceType, qty }
    const [basket, setBasket] = useState({});
    const [isExpress, setIsExpress] = useState(false);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRateList = useCallback(async () => {
        if (!hotelId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getLaundryRateList(hotelId);
            setItems(data?.data?.items || []);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to load the laundry rate list.'));
            console.error('Laundry rate list fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        fetchRateList();
    }, [fetchRateList]);

    const rateFor = useCallback((item, serviceType) => (
        (item.rates || []).find((r) => r.serviceType === serviceType)?.rate ?? 0
    ), []);

    /* ── Basket mutations ── */

    // Adding an item defaults to its first available service type.
    const addItem = useCallback((item) => {
        setBasket((prev) => {
            if (prev[item._id]) return prev;
            const firstService = item.rates?.[0]?.serviceType;
            if (!firstService) return prev;
            return { ...prev, [item._id]: { serviceType: firstService, qty: 1 } };
        });
    }, []);

    const removeItem = useCallback((itemId) => {
        setBasket((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
    }, []);

    const setQty = useCallback((itemId, qty) => {
        const safeQty = Math.max(0, Math.round(Number(qty) || 0));
        setBasket((prev) => {
            if (!prev[itemId]) return prev;
            if (safeQty === 0) {
                const next = { ...prev };
                delete next[itemId];
                return next;
            }
            return { ...prev, [itemId]: { ...prev[itemId], qty: safeQty } };
        });
    }, []);

    const setServiceType = useCallback((itemId, serviceType) => {
        setBasket((prev) => (
            prev[itemId] ? { ...prev, [itemId]: { ...prev[itemId], serviceType } } : prev
        ));
    }, []);

    /* ── Totals (preview only — the backend recomputes on submit) ── */
    const summary = useMemo(() => {
        const lines = Object.entries(basket).map(([itemId, line]) => {
            const item = items.find((i) => i._id === itemId);
            if (!item) return null;
            const unitRate = rateFor(item, line.serviceType);
            return {
                itemId,
                name: item.name,
                serviceType: line.serviceType,
                qty: line.qty,
                unitRate,
                amount: unitRate * line.qty,
            };
        }).filter(Boolean);

        const subTotal = lines.reduce((sum, l) => sum + l.amount, 0);
        const taxPercentage = Number(hotelData?.bookedRoomTax || 0);
        const taxAmount = (subTotal * taxPercentage) / 100;

        return {
            lines,
            pieceCount: lines.reduce((sum, l) => sum + l.qty, 0),
            subTotal,
            taxPercentage,
            taxAmount,
            totalAmount: subTotal + taxAmount,
        };
    }, [basket, items, hotelData, rateFor]);

    const submitOrder = useCallback(async () => {
        if (!summary.lines.length) {
            toast.error('Add at least one item to request a pickup.');
            return;
        }
        setSubmitting(true);
        try {
            await createLaundryOrder({
                hotelId,
                items: summary.lines.map((l) => ({
                    itemId: l.itemId,
                    serviceType: l.serviceType,
                    qty: l.qty,
                })),
                isExpress,
                notes,
            });
            setBasket({});
            setNotes('');
            setIsExpress(false);
            navigate('/laundry/orders', { state: { showToast: true } });
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Could not place your laundry request.'));
            console.error('Laundry order submit error:', err);
        } finally {
            setSubmitting(false);
        }
    }, [summary, hotelId, isExpress, notes, navigate]);

    return {
        items,
        loading,
        error,
        refetch: fetchRateList,
        basket,
        addItem,
        removeItem,
        setQty,
        setServiceType,
        rateFor,
        isExpress,
        setIsExpress,
        notes,
        setNotes,
        summary,
        submitting,
        submitOrder,
    };
}

import { useEffect, useState, useCallback } from "react";
import { getService, getServiceRequest } from "../api/service/serviceService";
import { getApiErrorMessage } from "../api/client";
import { toast } from "sonner";
import { BOOKING_STATUS } from "../utils/constant";
import useServiceRequest from "../hooks/useServiceRequest";
import { useNavigate } from "react-router-dom";

export default function useServiceViewModel() {
    const navigate = useNavigate();
    const [categoriesData, setCategoriesData] = useState([]);
    const [loading, setLoading] = useState(true);
    // First category expanded by default
    const [openCategories, setOpenCategories] = useState({});
    // Set of subcategory IDs that are already booked (pending / in-progress)
    const [bookedSubCategoryIds, setBookedSubCategoryIds] = useState(new Set());


    // Pull request state from the shared context (persists across navigation)
    const {
        toggleRequest,
        isRequested,
        hasRequestedServices,
    } = useServiceRequest();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch services and booked requests in parallel
                const [serviceRes, bookedRes] = await Promise.all([
                    getService(),
                    getServiceRequest(),
                ]);

                // Process service categories
                const serviceData = serviceRes?.data?.serviceData || [];
                setCategoriesData(serviceData);
                setOpenCategories({
                    [serviceData[0]?._id]: true,
                });

                // Build a Set of subcategory IDs that are already booked
                // (status = PENDING or IN_PROGRESS)
                const bookedData = bookedRes?.data || [];
                const activeBookedIds = new Set();
                bookedData.forEach((item) => {
                    if (
                        item.status === BOOKING_STATUS.PENDING ||
                        item.status === BOOKING_STATUS.IN_PROGRESS
                    ) {
                        // The backend should return `subCategoryId` on each booked item
                        if (item.subCategoryId) {
                            activeBookedIds.add(item.subCategoryId);
                        }
                    }
                });
                setBookedSubCategoryIds(activeBookedIds);
            } catch (err) {
                const message = getApiErrorMessage(err, 'Failed to load services.');
                toast.error(message);
                console.error('ServiceViewModel fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const toggleCategory = (id) => {
        setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }))
    };

    /**
     * Check if a subcategory is already booked (pending or in-progress).
     * These items should show as "Requested" and not be toggleable.
     */
    const isAlreadyBooked = useCallback(
        (subCategoryId) => bookedSubCategoryIds.has(subCategoryId),
        [bookedSubCategoryIds]
    );

    const handleReviewRequest = () => {
        navigate('/services/review');
    };

    const menuItems = [
        { label: 'Request history', onClick: () => navigate('/services/pending', { state: { submittedItems: [], showToast: false } }) },
        { label: 'Help', onClick: () => navigate('/chat', { state: { submittedItems: [], showToast: false } }) },
    ];

    return {
        categoriesData,
        loading,
        openCategories,
        toggleCategory,
        toggleRequest,
        isRequested,
        isAlreadyBooked,
        hasRequestedServices,
        handleReviewRequest,
        menuItems,
    };
}

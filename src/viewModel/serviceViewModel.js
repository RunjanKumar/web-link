import { useEffect, useState } from "react";
import { getService, submitServiceRequest } from "../api/service/serviceService";
import useServiceRequest from "../hooks/useServiceRequest";

export default function useServiceViewModel() {

    const [categoriesData, setCategoriesData] = useState([]);
    // First category expanded by default
    const [openCategories, setOpenCategories] = useState({});
    // Submitting state for loading indicator
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pull request state from the shared context (persists across navigation)
    const {
        toggleRequest,
        isRequested,
        hasRequestedServices,
        getRequestedItemsGrouped,
        serviceDetails,
        clearAll,
    } = useServiceRequest();

    useEffect(() => {
        async function getServiceData() {
            const data = await getService();
            console.log('data', data.data.serviceData);
            setCategoriesData(data?.data?.serviceData);
            setOpenCategories({
                [data?.data?.serviceData[0]?._id]: true,
            });
        }
        getServiceData();
    }, []);

    const toggleCategory = (id) => {
        setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }))
    };

    /**
     * Build the grouped items for ReviewRequest page.
     * Uses categoriesData from API + requestedServices from context.
     */
    const buildGroupedItems = () => {
        return getRequestedItemsGrouped(categoriesData);
    };

    /**
     * Submit the service request to the backend.
     * On success → clears context state.
     * Returns { success, data } so the caller can navigate on success.
     */
    const submitRequest = async () => {
        const grouped = buildGroupedItems();
        const payload = grouped.flatMap((cat) =>
            cat.subcategories.map((sub) => ({
                subcategoryId: sub._id,
                details: serviceDetails[sub._id] || '',
            }))
        );

        setIsSubmitting(true);
        try {
            const result = await submitServiceRequest(payload);
            clearAll();
            return { success: true, data: result, items: grouped.flatMap((c) => c.subcategories) };
        } catch (error) {
            console.error('Service request submission failed:', error);
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        categoriesData,
        openCategories,
        toggleCategory,
        toggleRequest,
        isRequested,
        hasRequestedServices,
        buildGroupedItems,
        submitRequest,
        isSubmitting,
    };
}

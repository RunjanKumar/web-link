import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getService, submitServiceRequest } from "../api/service/serviceService";
import { getApiErrorMessage } from "../api/client";
import useServiceRequest from "../hooks/useServiceRequest";
import useCustomerProfile from "../hooks/CustomerProfile";
import { toast } from "sonner";

/**
 * ══════════════════════════════════════════════════════════════
 * REVIEW REQUEST VIEW MODEL
 * ══════════════════════════════════════════════════════════════
 *
 * Dedicated ViewModel for the ReviewRequest page.
 * Handles:
 *   - Building grouped items from context + API data
 *   - Deleting (un-requesting) a service
 *   - Navigating to add/edit details
 *   - Building the correct submit payload & calling the API
 *   - Toast feedback & post-submit navigation
 *
 * Submit payload format (one object per category):
 * {
 *   "hotelFacilityId": "<category _id>",
 *   "subCategory": [
 *     { "subCategoryId": "<subcategory _id>", "description": "<details text>" }
 *   ]
 * }
 */
export default function useReviewRequestViewModel() {
    const navigate = useNavigate();


    const [categoriesData, setCategoriesData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        toggleRequest,
        getRequestedItemsGrouped,
        serviceDetails,
        clearAll,
    } = useServiceRequest();
    const { canOrder, orderLockMessage } = useCustomerProfile();

    /* ── Fetch service categories from the API ── */
    const fetchCategories = async () => {
        try {
            const data = await getService();
            const serviceData = data?.data?.serviceData || [];
            setCategoriesData(serviceData);
            return serviceData;
        } catch (error) {
            console.error("Failed to fetch service categories:", error);
            return [];
        }
    };

    /* ── Build grouped items for the review list ── */
    const buildGroupedItems = () => {
        return getRequestedItemsGrouped(categoriesData);
    };

    /* ── Delete (un-request) a subcategory ── */
    const handleDelete = (subcategoryId) => {
        toggleRequest(subcategoryId);
    };

    /* ── Navigate to Add/Edit Details page ── */
    const handleAddDetails = (item) => {
        navigate("/services/add-details", {
            state: { serviceId: item._id, serviceName: item.name },
        });
    };

    /**
     * Build the payload in the required format and submit.
     *
     * Payload shape:
     * [
     *   {
     *     "hotelFacilityId": "<category _id>",
     *     "subCategory": [
     *       { "subCategoryId": "<sub _id>", "description": "<details>" }
     *     ]
     *   },
     *   ...
     * ]
     */
    const handleSendRequest = async () => {
        const grouped = buildGroupedItems();

        // Build one payload per category (backend accepts one hotelFacilityId per call)
        const payloads = grouped.map((cat) => ({
            hotelFacilityId: cat._id,
            subCategory: cat.subcategories.map((sub) => ({
                subCategoryId: sub._id,
                description: serviceDetails[sub._id] || "",
            })),
        }));

        setIsSubmitting(true);
        try {
            // Fire one API call per category sequentially
            const results = [];
            for (const payload of payloads) {
                const result = await submitServiceRequest(payload);
                results.push(result);
            }
            clearAll();
            return { success: true, data: results };
        } catch (error) {
            const errorMessage = getApiErrorMessage(error, 'Failed to submit service request.');
            console.error("Service request submission failed:", error);
            return { success: false, errorMessage };
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Full submit orchestration — calls API, shows toast, navigates.
     * The page just needs to call this single function.
     */
    const handleSubmit = async () => {
        // Pre-check-in browse mode: the server would reject the request anyway —
        // tell the guest when it unlocks instead of failing later.
        if (!canOrder) {
            toast.info(orderLockMessage);
            return;
        }
        const result = await handleSendRequest();
        if (result.success) {
            toast.success('Your service request has been successfully submitted.');
            navigate('/services/pending', { replace: true, state: { showToast: false } });
        } else {
            toast.error(result.errorMessage || 'Failed to submit request.');
        }
    };


    return {
        categoriesData,
        fetchCategories,
        buildGroupedItems,
        handleDelete,
        handleAddDetails,
        handleSubmit,
        isSubmitting,
        canOrder,
    };
}

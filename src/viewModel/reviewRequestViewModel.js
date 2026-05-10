import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getService, submitServiceRequest } from "../api/service/serviceService";
import { getApiErrorMessage } from "../api/client";
import useServiceRequest from "../hooks/useServiceRequest";

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
        isRequested,
        hasRequestedServices,
        getRequestedItemsGrouped,
        serviceDetails,
        clearAll,
    } = useServiceRequest();

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

    return {
        categoriesData,
        fetchCategories,
        buildGroupedItems,
        handleDelete,
        handleAddDetails,
        handleSendRequest,
        isSubmitting,
    };
}

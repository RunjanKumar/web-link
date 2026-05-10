import { createContext, useContext, useState, useCallback } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 * SERVICE REQUEST CONTEXT
 * ══════════════════════════════════════════════════════════════
 *
 * Persists selected services and their "why I want this" details
 * across all /services/* pages (ServiceRequest, ReviewRequest,
 * AddDetails).
 *
 * State is cleared ONLY after the submit API succeeds.
 */

const ServiceRequestContext = createContext(null);

export function ServiceRequestProvider({ children }) {
    // Set of subcategory _id strings the user has requested
    const [requestedServices, setRequestedServices] = useState(new Set());

    // Map of subcategoryId → details text (the "why I want this" message)
    const [serviceDetails, setServiceDetails] = useState({});

    /* ── Toggle a service in / out of the requested set ── */
    const toggleRequest = useCallback((subcategoryId) => {
        setRequestedServices((prev) => {
            const next = new Set(prev);
            if (next.has(subcategoryId)) {
                next.delete(subcategoryId);
                // Also remove details when un-requesting
                setServiceDetails((d) => {
                    const copy = { ...d };
                    delete copy[subcategoryId];
                    return copy;
                });
            } else {
                next.add(subcategoryId);
            }
            return next;
        });
    }, []);

    /* ── Check if a service is requested ── */
    const isRequested = useCallback(
        (subcategoryId) => requestedServices.has(subcategoryId),
        [requestedServices]
    );

    /* ── Store / update details text for a specific service ── */
    const setDetail = useCallback((subcategoryId, text) => {
        setServiceDetails((prev) => ({ ...prev, [subcategoryId]: text }));
    }, []);

    /* ── Get detail text for a specific service ── */
    const getDetail = useCallback(
        (subcategoryId) => serviceDetails[subcategoryId] || '',
        [serviceDetails]
    );

    /* ── Whether any services have been requested ── */
    const hasRequestedServices = requestedServices.size > 0;

    /**
     * Build the grouped items structure used by ReviewRequest.
     * Takes the full categoriesData from the API response and filters
     * down to only requested subcategories, enriching them with details.
     */
    const getRequestedItemsGrouped = useCallback(
        (categoriesData) => {
            if (!categoriesData) return [];
            return categoriesData
                .map((cat) => ({
                    ...cat,
                    subcategories: cat.subCategoriesIds
                        .filter((s) => requestedServices.has(s._id))
                        .map((s) => ({
                            ...s,
                            id: s._id,
                            details: serviceDetails[s._id] || '',
                        })),
                }))
                .filter((cat) => cat.subcategories.length > 0);
        },
        [requestedServices, serviceDetails]
    );

    /* ── Clear everything — called only after API success ── */
    const clearAll = useCallback(() => {
        setRequestedServices(new Set());
        setServiceDetails({});
    }, []);

    const value = {
        requestedServices,
        toggleRequest,
        isRequested,
        hasRequestedServices,
        serviceDetails,
        setDetail,
        getDetail,
        getRequestedItemsGrouped,
        clearAll,
    };

    return (
        <ServiceRequestContext.Provider value={value}>
            {children}
        </ServiceRequestContext.Provider>
    );
}

/**
 * Hook to consume the ServiceRequestContext.
 * Must be used within a <ServiceRequestProvider>.
 */
export default function useServiceRequest() {
    const context = useContext(ServiceRequestContext);
    if (!context) {
        throw new Error('useServiceRequest must be used within a ServiceRequestProvider');
    }
    return context;
}

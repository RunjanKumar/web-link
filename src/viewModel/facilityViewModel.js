import { useEffect, useState, useCallback } from "react";
import { getFacility } from "../api/service/facilityService";
import { getApiErrorMessage } from "../api/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY VIEWMODEL — "Brain" of the Facilities list page
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is the "brain" of the Facilities page.
 *
 * Backend response structure:
 *   data: [
 *     {
 *       _id, name: "Dining", imageUrl: "...",       ← Category (tab)
 *       types: [                                     ← Items inside this category
 *         { _id, name, description, image, startTime, endTime, days, isAvailable, ... }
 *       ]
 *     },
 *     { _id, name: "Spa", imageUrl: "...", types: [...] },
 *   ]
 *
 * So:
 *   - Tabs    = top-level items (each has _id, name, imageUrl)
 *   - Cards   = types[] array inside the selected tab's category
 */

export default function useFacilityViewModel() {
    // ── State ──
    // Raw categories from API — each has { _id, name, imageUrl, types: [...] }
    const [categories, setCategories] = useState([]);
    const [activeType, setActiveType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // ══════════════════════════════════════════════════════════
    // FETCH FACILITIES FROM API
    // ══════════════════════════════════════════════════════════
    const fetchFacilities = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // STEP-2: Call the API service (facilityService.js)
            const response = await getFacility();

            // STEP-3: Extract the categories array
            // LEARNING: Backend may nest data differently — try multiple paths
            const data = response?.data?.facilityData
                || response?.data?.data
                || response?.data
                || [];


            // STEP-4: Log first category shape (helps understand backend structure)

            setCategories(data);

            // STEP-5: Auto-select the first tab
            if (data.length > 0) {
                setActiveType(data[0]._id);
            }
        } catch (err) {
            console.error('🔴 [FacilityVM] fetchFacilities() FAILED:', err.message);
            const message = getApiErrorMessage(err, 'Failed to load facilities.');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Auto-fetch on mount ──
    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    // ══════════════════════════════════════════════════════════
    // DERIVED STATE
    // LEARNING: These are computed from categories — they update
    // automatically when categories or activeType changes.
    // ══════════════════════════════════════════════════════════

    // Build tabs from categories — each tab = { id, label, imageUrl }
    const facilityTypes = categories.map((cat) => ({
        id: cat._id,
        label: cat.name,
        imageUrl: cat.imageUrl || '',
    }));

    // Find the active category object
    const activeCategory = categories.find((cat) => cat._id === activeType) || null;

    // The items to show = types[] inside the active category
    const facilities = activeCategory?.types || [];


    // ══════════════════════════════════════════════════════════
    // HANDLE TAB CHANGE
    // ══════════════════════════════════════════════════════════
    const handleTypeChange = useCallback((typeId) => {
        setActiveType(typeId);
    }, []);

    // ══════════════════════════════════════════════════════════
    // NAVIGATION HANDLERS
    // ══════════════════════════════════════════════════════════
    const handleFacilityClick = useCallback((facilityItem) => {
        // Pass both the types[] item AND the parent category info
        navigate('/facilities/detail', {
            state: {
                facility: facilityItem,
                categoryName: activeCategory?.name || '',
                categoryImageUrl: activeCategory?.imageUrl || '',
            }
        });
    }, [navigate, activeCategory]);

    const menuItems = [
        { label: 'My Bookings', onClick: () => navigate('/facilities/upcoming-events') },
        { label: 'Help', onClick: () => navigate('/chat') },
    ];

    // ══════════════════════════════════════════════════════════
    // RETURN
    // ══════════════════════════════════════════════════════════
    return {
        // State
        facilities,          // types[] items for the active tab
        facilityTypes,       // tab definitions [{id, label, imageUrl}]
        activeType,          // currently selected tab _id
        activeCategory,      // full category object (for header image etc.)
        loading,
        error,

        // Actions
        setActiveType: handleTypeChange,
        handleFacilityClick,
        refetch: fetchFacilities,
        menuItems,
    };
}

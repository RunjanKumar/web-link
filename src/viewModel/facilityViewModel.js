import { useEffect, useState, useCallback } from "react";
import { getFacility } from "../api/service/facilityService";
import { getApiErrorMessage } from "../api/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY VIEWMODEL
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
        console.log('🏨 [FacilityVM] fetchFacilities() — Starting API call...');
        setLoading(true);
        setError(null);

        try {
            const response = await getFacility();
            console.log('🏨 [FacilityVM] Raw API response:', response);

            // ──────────────────────────────────────────────────
            // LEARNING: Extract the categories array
            //
            // Backend returns: { statusCode, message, data: [...] }
            // Each element = one category (Dining, Spa, etc.)
            // ──────────────────────────────────────────────────
            const data = response?.data?.facilityData
                || response?.data?.data
                || response?.data
                || [];

            console.log('🏨 [FacilityVM] Categories extracted:', data.length);

            // Log first category for shape reference
            if (data.length > 0) {
                console.log('🏨 [FacilityVM] First category shape:', JSON.stringify({
                    _id: data[0]._id,
                    name: data[0].name,
                    imageUrl: data[0].imageUrl,
                    typesCount: data[0].types?.length,
                    firstType: data[0].types?.[0],
                }, null, 2));
            }

            setCategories(data);

            // Set first tab as active by default
            if (data.length > 0) {
                console.log('🏨 [FacilityVM] Setting default active tab:', data[0]._id, '(', data[0].name, ')');
                setActiveType(data[0]._id);
            }

        } catch (err) {
            console.error('❌ [FacilityVM] fetchFacilities() FAILED:', err);
            const message = getApiErrorMessage(err, 'Failed to load facilities.');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
            console.log('🏨 [FacilityVM] fetchFacilities() — Done');
        }
    }, []);

    // ── Auto-fetch on mount ──
    useEffect(() => {
        console.log('🏨 [FacilityVM] Component mounted → fetching facilities...');
        fetchFacilities();
    }, [fetchFacilities]);

    // ══════════════════════════════════════════════════════════
    // DERIVED STATE
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

    console.log('🏨 [FacilityVM] Active tab:', activeCategory?.name, '→ Items count:', facilities.length);

    // ══════════════════════════════════════════════════════════
    // HANDLE TAB CHANGE
    // ══════════════════════════════════════════════════════════
    const handleTypeChange = useCallback((typeId) => {
        console.log('🏨 [FacilityVM] Tab changed to:', typeId);
        setActiveType(typeId);
    }, []);

    // ══════════════════════════════════════════════════════════
    // NAVIGATION HANDLERS
    // ══════════════════════════════════════════════════════════
    const handleFacilityClick = useCallback((facilityItem) => {
        console.log('🏨 [FacilityVM] Facility clicked:', facilityItem.name);
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

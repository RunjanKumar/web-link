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
 * It follows the MVVM pattern exactly like serviceViewModel.js:
 *
 *   1. On mount → fetch facilities from API
 *   2. Process the response → group by category type
 *   3. Expose state + actions → UI renders them
 *
 * Data flow:
 *   Component mounts → useEffect fires → getFacility() API call
 *   → Response arrives → normalize data → setState → UI re-renders
 */

export default function useFacilityViewModel() {
    // ── State ──
    const [facilities, setFacilities] = useState([]);
    const [activeType, setActiveType] = useState(null); // Will be set after API response
    const [facilityTypes, setFacilityTypes] = useState([]);
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
            // LEARNING: Extract data from backend response
            //
            // The backend typically returns:
            //   { statusCode: 200, message: "...", data: { facilityData: [...] } }
            //   OR { statusCode: 200, data: [...] }
            //
            // We try multiple paths to be safe:
            // ──────────────────────────────────────────────────
            const facilityData = response?.data?.facilityData
                || response?.data?.data
                || response?.data
                || [];

            console.log('🏨 [FacilityVM] Extracted facilityData:', facilityData);
            console.log('🏨 [FacilityVM] Number of facilities:', facilityData.length);

            // Log the first item to understand the shape
            if (facilityData.length > 0) {
                console.log('🏨 [FacilityVM] First facility item (for shape reference):', JSON.stringify(facilityData[0], null, 2));
            }

            setFacilities(facilityData);

            // ──────────────────────────────────────────────────
            // LEARNING: Build dynamic tabs from the data
            //
            // Each facility might have:
            //   - category / type / facilityType field
            //   - OR they might come pre-grouped
            //
            // We'll build tabs from unique category names
            // ──────────────────────────────────────────────────
            const uniqueTypes = [];
            const seenIds = new Set();

            facilityData.forEach((item) => {
                // Try multiple possible field names for the category
                const typeId = item.category?._id || item.categoryId || item.type || item._id;
                const typeLabel = item.category?.name || item.categoryName || item.type || item.name || 'Other';

                if (!seenIds.has(typeId)) {
                    seenIds.add(typeId);
                    uniqueTypes.push({
                        id: typeId,
                        label: typeLabel,
                    });
                }
            });

            console.log('🏨 [FacilityVM] Built dynamic tabs:', uniqueTypes);
            setFacilityTypes(uniqueTypes);

            // Set first tab as active by default
            if (uniqueTypes.length > 0 && !activeType) {
                console.log('🏨 [FacilityVM] Setting default active tab:', uniqueTypes[0].id);
                setActiveType(uniqueTypes[0].id);
            }

        } catch (err) {
            console.error('❌ [FacilityVM] fetchFacilities() FAILED:', err);
            const message = getApiErrorMessage(err, 'Failed to load facilities.');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
            console.log('🏨 [FacilityVM] fetchFacilities() — Done (loading = false)');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ══════════════════════════════════════════════════════════
    // INITIAL LOAD
    // LEARNING: useEffect with [] runs ONCE on mount.
    // This triggers the API call as soon as the page loads.
    // ══════════════════════════════════════════════════════════
    useEffect(() => {
        console.log('🏨 [FacilityVM] Component mounted → fetching facilities...');
        fetchFacilities();
    }, [fetchFacilities]);

    // ══════════════════════════════════════════════════════════
    // FILTERED FACILITIES
    // LEARNING: Filter the full list to show only the active tab's items
    // ══════════════════════════════════════════════════════════
    const filteredFacilities = facilities.filter((item) => {
        const typeId = item.category?._id || item.categoryId || item.type || item._id;
        return typeId === activeType;
    });

    console.log('🏨 [FacilityVM] Active tab:', activeType, '→ Filtered count:', filteredFacilities.length);

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
    const handleFacilityClick = useCallback((facility) => {
        console.log('🏨 [FacilityVM] Facility clicked:', facility.name || facility._id);
        navigate('/facilities/detail', {
            state: { facility, facilityType: activeType }
        });
    }, [navigate, activeType]);

    const menuItems = [
        { label: 'My Bookings', onClick: () => navigate('/facilities/upcoming-events') },
        { label: 'Help', onClick: () => navigate('/chat') },
    ];

    // ══════════════════════════════════════════════════════════
    // RETURN — everything the UI needs
    // LEARNING: The ViewModel returns a clean "contract" to the UI.
    // The UI doesn't know/care about API details.
    // ══════════════════════════════════════════════════════════
    return {
        // State
        facilities: filteredFacilities,
        allFacilities: facilities,
        facilityTypes,
        activeType,
        loading,
        error,

        // Actions
        setActiveType: handleTypeChange,
        handleFacilityClick,
        refetch: fetchFacilities,
        menuItems,
    };
}

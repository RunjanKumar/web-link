import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime12Hour, formatDays } from '../utils/commonFunction';

/**
 * ══════════════════════════════════════════════════════════════
 * FACILITY DETAIL VIEWMODEL
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This ViewModel extracts and prepares the data
 * for the FacilityDetail page.
 *
 * It receives the raw facility object from location.state
 * and prepares:
 *   - All display fields (formatted timings, days, etc.)
 *   - Navigation handlers (back, book)
 *   - Info sections as a clean array for easy rendering
 *
 * The UI component just maps over the infoSections array
 * and renders them — zero business logic in the view!
 */

export default function useFacilityDetailViewModel() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Extract raw data from navigation state ──
    const facility = location.state?.facility || {};
    const categoryName = location.state?.categoryName || '';

    console.log('🔍 [FacilityDetailVM] Received facility:', JSON.stringify(facility, null, 2));
    console.log('🔍 [FacilityDetailVM] Category:', categoryName);

    // ── Formatted display values ──
    const timingsText = (facility.startTime && facility.endTime)
        ? `${formatTime12Hour(facility.startTime)} – ${formatTime12Hour(facility.endTime)}`
        : '';

    const daysText = formatDays(facility.days);

    const pricingText = facility.pricing > 0 ? `₹ ${facility.pricing}` : '';

    const capacityText = facility.capacity > 0 ? `${facility.capacity} people` : '';

    // ── Info sections array ──
    // LEARNING: By building this array in the ViewModel,
    // the UI can just .map() over it — no conditional logic needed in the view.
    // InfoSection component auto-hides when value is empty.
    const infoSections = [
        { label: 'Type', value: facility.type || '' },
        { label: 'Cuisine', value: facility.cuisine || '' },
        { label: 'Timings', value: timingsText },
        { label: 'Available Days', value: daysText },
        { label: 'Location', value: facility.location || '' },
        { label: 'Location Area', value: facility.locationlink || '' },
        { label: 'Pricing', value: pricingText },
        { label: 'Contact', value: facility.phoneNumber || '' },
        { label: 'Capacity', value: capacityText },
        { label: 'Area', value: facility.area || '' },
    ];

    // ── Navigation handlers ──
    const goBack = useCallback(() => {
        console.log('🔍 [FacilityDetailVM] Going back');
        navigate(-1);
    }, [navigate]);

    const handleBookNow = useCallback(() => {
        console.log('🔍 [FacilityDetailVM] Navigating to reserve page for:', facility.name);
        navigate('/facilities/reserve', {
            state: { facility }
        });
    }, [navigate, facility]);

    // ── Return ──
    return {
        // Display data
        facility,
        categoryName,
        infoSections,

        // Actions
        goBack,
        handleBookNow,
    };
}

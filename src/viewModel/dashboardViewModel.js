import { useState, useEffect, useCallback } from "react";
import {
    getCustomerProfile,
    getQuickCall,
} from "../api/service/dashboardService";

import { REDIRECT_TYPES } from "../utils/constant";

export default function useDashboardViewModel() {
    const [profileData, setProfileData] = useState(null);
    const [quickCallData, setQuickCallData] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [profileError, setProfileError] = useState(null);
    const [quickCallError, setQuickCallError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchDashboardData() {
            try {
                setIsLoading(true);

                const [profileResult, quickCallResult] =
                    await Promise.allSettled([
                        getCustomerProfile(),
                        getQuickCall(),
                    ]);

                if (cancelled) return;

                // ── Profile API ──
                if (profileResult.status === "fulfilled") {
                    setProfileData(profileResult.value);
                } else {
                    console.error(
                        "Profile fetch error:",
                        profileResult.reason
                    );

                    setProfileError(
                        profileResult.reason?.response?.data?.message ||
                        "Failed to load profile"
                    );
                }

                // ── Quick Call API ──
                if (quickCallResult.status === "fulfilled") {
                    setQuickCallData(
                        quickCallResult.value?.data || []
                    );
                } else {
                    console.error(
                        "Quick Call fetch error:",
                        quickCallResult.reason
                    );

                    setQuickCallError(
                        quickCallResult.reason?.response?.data?.message ||
                        "Failed to load quick calls"
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchDashboardData();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleQuickCallClick = useCallback((item) => {
        if (
            item?.redirectTypes === REDIRECT_TYPES.CALL &&
            item?.supportNumber
        ) {
            window.location.href = `tel:${item.supportNumber}`;
        }
    }, []);

    return {
        profileData,
        quickCallData,

        profileError,
        quickCallError,

        isLoading,

        handleQuickCallClick,
    };
}
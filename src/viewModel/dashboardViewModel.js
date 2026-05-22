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
            console.log("[Dashboard] Starting dashboard data fetch", {
                path: window.location.pathname,
            });

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
                    console.log("[Dashboard] Profile fetch succeeded", {
                        hasUser: Boolean(profileResult.value?.data?.user),
                        roomCount:
                            profileResult.value?.data?.bookRoomData?.length ||
                            0,
                        hotelName:
                            profileResult.value?.data?.hotelData?.name ||
                            null,
                    });
                    setProfileData(profileResult.value);
                } else {
                    console.error("[Dashboard] Profile fetch failed", {
                        message:
                            profileResult.reason?.response?.data?.message ||
                            profileResult.reason?.message ||
                            "Unknown profile fetch error",
                        status: profileResult.reason?.response?.status,
                        error: profileResult.reason,
                    });

                    setProfileError(
                        profileResult.reason?.response?.data?.message ||
                        "Failed to load profile"
                    );
                }

                // ── Quick Call API ──
                if (quickCallResult.status === "fulfilled") {
                    console.log("[Dashboard] Quick call fetch succeeded", {
                        count: quickCallResult.value?.data?.length || 0,
                    });
                    setQuickCallData(
                        quickCallResult.value?.data || []
                    );
                } else {
                    console.error("[Dashboard] Quick call fetch failed", {
                        message:
                            quickCallResult.reason?.response?.data?.message ||
                            quickCallResult.reason?.message ||
                            "Unknown quick call fetch error",
                        status: quickCallResult.reason?.response?.status,
                        error: quickCallResult.reason,
                    });

                    setQuickCallError(
                        quickCallResult.reason?.response?.data?.message ||
                        "Failed to load quick calls"
                    );
                }
            } finally {
                if (!cancelled) {
                    console.log("[Dashboard] Dashboard data fetch finished");
                    setIsLoading(false);
                }
            }
        }

        fetchDashboardData();

        return () => {
            console.log("[Dashboard] Dashboard data fetch cleanup");
            cancelled = true;
        };
    }, []);

    const handleQuickCallClick = useCallback((item) => {
        console.log("[Dashboard] Quick call clicked", {
            id: item?._id,
            name: item?.name,
            redirectTypes: item?.redirectTypes,
            hasSupportNumber: Boolean(item?.supportNumber),
        });

        if (
            item?.redirectTypes === REDIRECT_TYPES.CALL &&
            item?.supportNumber
        ) {
            console.log("[Dashboard] Opening phone dialer", {
                supportNumber: item.supportNumber,
            });
            window.location.href = `tel:${item.supportNumber}`;
        } else {
            console.log("[Dashboard] Quick call click had no callable target", {
                id: item?._id,
            });
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

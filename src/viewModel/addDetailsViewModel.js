import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useServiceRequest from "../hooks/useServiceRequest";

/**
 * ViewModel for the AddDetails page.
 * Manages the detail text for a specific subcategory and
 * persists it into the shared ServiceRequest context.
 */
export default function useAddDetailsViewModel() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setDetail, getDetail } = useServiceRequest();

    const serviceId = location.state?.serviceId || '';
    const serviceName = location.state?.serviceName || 'Service';

    // Initialize from context (persisted details)
    const [message, setMessage] = useState(getDetail(serviceId));

    /* ── Save details into context & navigate back ── */
    const handleDone = () => {
        setDetail(serviceId, message);
        navigate(-1); // Go back to ReviewRequest
    };

    return {
        serviceName,
        message,
        setMessage,
        handleDone,
    };
}

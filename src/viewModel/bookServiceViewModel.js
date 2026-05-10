import { useEffect, useState } from "react";
import { BOOKING_STATUS, STATUS_LABELS, STATUS_STYLES } from "../utils/constant"
import { getServiceRequest } from "../api/service/serviceService"

export default function useBookedServiceModel() {
    const [bookedServiceData, setBookedServiceData] = useState([]);
    useEffect(() => {
        async function fetchBookedServiceData() {
            const data = await getServiceRequest();
            setBookedServiceData(data.data);
        }
        fetchBookedServiceData();

    }, [])
    return {
        bookedServiceData,
        setBookedServiceData
    }
} 
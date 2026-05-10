import { useEffect, useState } from "react";
import { getService } from "../api/service/serviceService";
import useServiceRequest from "../hooks/useServiceRequest";

export default function useServiceViewModel() {

    const [categoriesData, setCategoriesData] = useState([]);
    // First category expanded by default
    const [openCategories, setOpenCategories] = useState({});

    // Pull request state from the shared context (persists across navigation)
    const {
        toggleRequest,
        isRequested,
        hasRequestedServices,
    } = useServiceRequest();

    useEffect(() => {
        async function getServiceData() {
            const data = await getService();
            console.log('data', data.data.serviceData);
            setCategoriesData(data?.data?.serviceData);
            setOpenCategories({
                [data?.data?.serviceData[0]?._id]: true,
            });
        }
        getServiceData();
    }, []);

    const toggleCategory = (id) => {
        setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }))
    };

    return {
        categoriesData,
        openCategories,
        toggleCategory,
        toggleRequest,
        isRequested,
        hasRequestedServices,
    };
}


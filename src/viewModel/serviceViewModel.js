import { useEffect, useState } from "react";
import { getService } from "../api/service/serviceService";

export default function useServiceViewModel() {

    const [categoriesData, setCategoriesData] = useState([]);
    // First category expanded by default
    const [openCategories, setOpenCategories] = useState({});
    // Track which services have been requested (set of subcategory IDs)
    const [requestedServices, setRequestedServices] = useState(new Set());

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

    const toggleRequest = (subcategoryId) => {
        setRequestedServices((prev) => {
            console.log(prev, "subcategoryId", subcategoryId);
            const next = new Set(prev);
            if (next.has(subcategoryId)) {
                next.delete(subcategoryId);
            } else {
                next.add(subcategoryId);
            }
            return next;
        });
    };

    const isRequested = (subcategoryId) => requestedServices.has(subcategoryId);

    const hasRequestedServices = requestedServices.size > 0;

    const getRequestedItemsGrouped = () => {
        console.log("categoriesData", categoriesData);
        return categoriesData
            .map((cat) => ({
                ...cat,
                subcategories: cat.subCategoriesIds.filter((s) => requestedServices.has(s._id)),
            }))
            .filter((cat) => cat.subcategories.length > 0);
    };

    return {
        categoriesData,
        openCategories,
        toggleCategory,
        toggleRequest,
        isRequested,
        hasRequestedServices,
        getRequestedItemsGrouped,
    };
}

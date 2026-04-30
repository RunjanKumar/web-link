import { useState } from "react";

const servicesData = [
    {
        id: 1,
        categoryName: "House Keeping",
        availableFrom: "08:00 AM",
        availableTo: "10:00 PM",
        subcategories: [
            { id: 101, name: "Room Cleaning", description: "Lorem ipsum dolor sit amet consectetur....", price: 1000, isAvailable: true },
            { id: 102, name: "Washroom Cleaning", description: "Lorem ipsum dolor sit amet consectetur. Nulla at amet vitae dictum ornare in praesent.", price: 500, isAvailable: true },
            { id: 103, name: "Linen Change", description: "Lorem at amet vitae dictum ornare in praesent.", price: 300, isAvailable: false },
            { id: 104, name: "Replenish Amenities", description: "Lorem ipsum dolor sit amet dictum ornare in praesent.", price: 200, isAvailable: true },
        ]
    },
    {
        id: 2,
        categoryName: "Maintenance",
        availableFrom: "09:00 AM",
        availableTo: "06:00 PM",
        subcategories: [
            { id: 201, name: "AC Repair", description: "Air conditioning maintenance and repair service.", price: 0, isAvailable: true },
            { id: 202, name: "Plumbing Fix", description: "Fix leaks, blockages and plumbing issues.", price: 0, isAvailable: false },
            { id: 203, name: "Electrical Repair", description: "Light fixtures, switches and outlet repair.", price: 0, isAvailable: true },
        ]
    },
    {
        id: 3,
        categoryName: "Laundry",
        availableFrom: "07:00 AM",
        availableTo: "09:00 PM",
        subcategories: [
            { id: 301, name: "Wash & Fold", description: "Standard laundry service with folding.", price: 150, isAvailable: true },
            { id: 302, name: "Dry Cleaning", description: "Premium dry cleaning for delicate garments.", price: 500, isAvailable: true },
            { id: 303, name: "Ironing Service", description: "Professional ironing and pressing.", price: 100, isAvailable: false },
        ]
    }
];

export default function useServiceViewModel() {
    // First category expanded by default
    const [openCategories, setOpenCategories] = useState({ 1: true });
    // Track which services have been requested (set of subcategory IDs)
    const [requestedServices, setRequestedServices] = useState(new Set());

    const toggleCategory = (id) => {
        setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleRequest = (subcategoryId) => {
        setRequestedServices((prev) => {
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
        return servicesData
            .map((cat) => ({
                ...cat,
                subcategories: cat.subcategories.filter((s) => requestedServices.has(s.id)),
            }))
            .filter((cat) => cat.subcategories.length > 0);
    };

    return {
        servicesData,
        openCategories,
        toggleCategory,
        toggleRequest,
        isRequested,
        hasRequestedServices,
        getRequestedItemsGrouped,
    };
}

import { useState } from "react";

import facilityDining from "../assets/facility_dining.png";
import facilityEvent from "../assets/facility_event.png";
import facilityFitness from "../assets/facility_fitness.png";
import facilitySpa from "../assets/facility_spa.png";

/* ── Facility Types (tabs) ── */
const facilityTypes = [
    { id: 'dining', label: 'Dining', icon: 'dining' },
    { id: 'event', label: 'Event', icon: 'event' },
    { id: 'fitness', label: 'Fitness', icon: 'fitness' },
    { id: 'spa', label: 'Spa', icon: 'spa' },
];

/* ── Facilities Data ── */
const facilitiesData = {
    dining: [
        {
            id: 101,
            name: "Latitude",
            cuisine: "All Day Dining, Multi Cuisine",
            timings: "24×7 (except on Tuesday it will be closed between 12:00 AM to 06:00 AM)",
            avgPrice: 2500,
            image: facilityDining,
            isAvailable: true,
            detailDescription: "Savour the vibrant flavours and crisp textures of our meticulously authenticity crafted Buffet at Latitude. From crisp greens to seasonal vegetables, each bite promises a burst of freshness. Elevate your dining experience with our thoughtfully curated selection, designed to delight every palate and celebrate the art of fine cuisine.",
        },
        {
            id: 102,
            name: "Caramel",
            cuisine: "All Day Dining, Multi Cuisine",
            timings: "24×7 (except on Tuesday it will be closed between 12:00 AM to 06:00 AM)",
            avgPrice: 2500,
            image: facilityDining,
            isAvailable: true,
            detailDescription: "Caramel brings together the finest flavours from around the world in a warm, inviting atmosphere. Enjoy our carefully crafted menu featuring both traditional and contemporary dishes, prepared with the freshest ingredients by our award-winning chefs.",
        },
        {
            id: 103,
            name: "Azure Rooftop",
            cuisine: "Continental, Italian",
            timings: "06:00 PM to 11:00 PM",
            avgPrice: 3500,
            image: facilityDining,
            isAvailable: false,
            detailDescription: "Dine under the stars at Azure Rooftop, where panoramic city views meet exceptional Continental and Italian cuisine. Our open-air setting provides the perfect backdrop for romantic dinners and special celebrations.",
        },
    ],
    event: [
        {
            id: 201,
            name: "Tango",
            maxCapacity: 200,
            description: "Inbuilt technology allowing drop-down screen, high-speed wireless internet communication through the entire...",
            area: "320 Sq. Mt.",
            image: facilityEvent,
            isAvailable: true,
            detailDescription: "Inbuilt technology allowing drop-down screen, high-speed wireless internet communication through the entire venue. Tango is our premier event space featuring state-of-the-art audiovisual equipment, elegant décor, and flexible seating arrangements to accommodate conferences, weddings, and corporate events.",
        },
        {
            id: 202,
            name: "Rhythm",
            maxCapacity: 40,
            description: "Rhythm hall accommodates a maximum of 40 people and has area of 114 sq. m.",
            area: "320 Sq. Mt.",
            image: facilityEvent,
            isAvailable: true,
            detailDescription: "Rhythm hall accommodates a maximum of 40 people and has area of 114 sq. m. This intimate space is perfect for board meetings, small workshops, and private celebrations. Equipped with modern presentation tools and comfortable furnishings.",
        },
        {
            id: 203,
            name: "Harmony",
            maxCapacity: 100,
            description: "Perfect for medium-sized gatherings with modern audio-visual equipment.",
            area: "180 Sq. Mt.",
            image: facilityEvent,
            isAvailable: false,
            detailDescription: "Perfect for medium-sized gatherings with modern audio-visual equipment. Harmony offers a versatile event space suitable for seminars, receptions, and cocktail parties with a dedicated events team to ensure your occasion is seamless.",
        },
    ],
    fitness: [
        {
            id: 301,
            name: "Iron Forge Gym",
            timings: "05:00 AM to 10:00 PM",
            equipment: "Treadmills, Ellipticals, Free Weights, Cable Machines",
            area: "250 Sq. Mt.",
            image: facilityFitness,
            isAvailable: true,
            detailDescription: "Our fully equipped fitness center features state-of-the-art cardiovascular and strength training equipment. Certified personal trainers are available for one-on-one sessions. Complimentary towels, water, and post-workout refreshments provided.",
        },
        {
            id: 302,
            name: "Yoga Studio",
            timings: "06:00 AM to 08:00 PM",
            equipment: "Yoga Mats, Props, Meditation Space",
            area: "120 Sq. Mt.",
            image: facilityFitness,
            isAvailable: true,
            detailDescription: "Find your inner peace in our dedicated yoga studio. Daily group classes are available for all levels, from beginners to advanced practitioners. The space also features a quiet meditation corner for mindful relaxation.",
        },
        {
            id: 303,
            name: "Swimming Pool",
            timings: "06:00 AM to 09:00 PM",
            equipment: "Olympic-size pool, Kids pool, Jacuzzi",
            area: "500 Sq. Mt.",
            image: facilityFitness,
            isAvailable: false,
            detailDescription: "Enjoy our temperature-controlled Olympic-size swimming pool, a separate kids pool, and a relaxing Jacuzzi. Poolside loungers and a refreshment bar are available for your comfort. Lifeguard on duty at all times.",
        },
    ],
    spa: [
        {
            id: 401,
            name: "Serenity Spa",
            timings: "09:00 AM to 09:00 PM",
            treatments: "Swedish Massage, Deep Tissue, Aromatherapy",
            priceRange: "₹ 2000 - ₹ 5000",
            image: facilitySpa,
            isAvailable: true,
            detailDescription: "Escape to a world of tranquility at Serenity Spa. Our expert therapists offer a range of rejuvenating treatments using premium organic products. Each session is tailored to your needs, ensuring complete relaxation and renewal of body and mind.",
        },
        {
            id: 402,
            name: "Royal Thai Spa",
            timings: "10:00 AM to 08:00 PM",
            treatments: "Thai Massage, Hot Stone, Body Scrub",
            priceRange: "₹ 3000 - ₹ 7000",
            image: facilitySpa,
            isAvailable: true,
            detailDescription: "Experience authentic Thai wellness traditions at Royal Thai Spa. Our trained Thai therapists bring ancient healing techniques to modern luxury, offering traditional Thai massage, hot stone therapy, and revitalizing body scrub treatments.",
        },
        {
            id: 403,
            name: "Ayurveda Center",
            timings: "08:00 AM to 06:00 PM",
            treatments: "Panchakarma, Shirodhara, Abhyanga",
            priceRange: "₹ 4000 - ₹ 8000",
            image: facilitySpa,
            isAvailable: false,
            detailDescription: "Discover the ancient science of Ayurveda at our dedicated center. Our certified Ayurvedic practitioners offer personalized treatments including Panchakarma detox, Shirodhara oil therapy, and Abhyanga full-body massage for holistic wellness.",
        },
    ],
};

export default function useFacilityViewModel() {
    const [activeType, setActiveType] = useState('dining');

    const facilities = facilitiesData[activeType] || [];

    return {
        facilityTypes,
        activeType,
        setActiveType,
        facilities,
    };
}

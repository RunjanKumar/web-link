import { useState } from "react";

export default function useLightViewModel() {
    const lightsData = [
        { id: 1, name: 'Smart Light 1', defaultOn: false },
        { id: 2, name: 'Smart Light 2', defaultOn: true },
        { id: 3, name: 'Smart Light 3', defaultOn: false },
        { id: 4, name: 'Smart Light 4', defaultOn: false },
    ];
    const [masterSwitch, setMasterSwitch] = useState(false);
    const [lights, setLights] = useState(
        lightsData.reduce((acc, l) => ({ ...acc, [l.id]: l.defaultOn }), {})
    );

    const toggleLight = (id) => {
        setLights((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleMaster = () => {
        const newState = !masterSwitch;
        setMasterSwitch(newState);
        // Turn all lights on or off
        setLights((prev) => {
            const updated = {};
            for (const key in prev) updated[key] = newState;
            return updated;
        });
    };
    return { lightsData, masterSwitch, lights, toggleLight, toggleMaster };
}
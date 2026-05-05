import { useState, useEffect } from "react";
import { getRoomDevices } from '../api/service/dashboardService';

export default function useLightViewModel() {
    const [lightsData, setLightsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [masterSwitch, setMasterSwitch] = useState(false);
    const [lights, setLights] = useState({});

    useEffect(() => {
        let cancelled = false;

        async function fetchDevices() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await getRoomDevices();

                if (!cancelled && response?.data) {
                    // Filter: only devices that are NOT scene buttons
                    const nonSceneDevices = response.data.filter(
                        (device) => !device.isSceneButton
                    );
                    setLightsData(nonSceneDevices);

                    // Build initial toggle state from device status
                    const initialState = {};
                    nonSceneDevices.forEach((device) => {
                        try {
                            const parsed = JSON.parse(device.status);
                            initialState[device._id] = parsed?.state === 'ON';
                        } catch {
                            initialState[device._id] = false;
                        }
                    });
                    setLights(initialState);

                    // Master switch is ON if ALL lights are ON
                    const allOn = Object.values(initialState).length > 0 &&
                        Object.values(initialState).every(Boolean);
                    setMasterSwitch(allOn);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Light devices fetch error:', err);
                    setError(err?.response?.data?.message || 'Failed to load devices');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchDevices();
        return () => { cancelled = true; };
    }, []);

    const toggleLight = (id) => {
        setLights((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleMaster = () => {
        const newState = !masterSwitch;
        setMasterSwitch(newState);
        setLights((prev) => {
            const updated = {};
            for (const key in prev) updated[key] = newState;
            return updated;
        });
    };

    return { lightsData, masterSwitch, lights, toggleLight, toggleMaster, isLoading, error };
}
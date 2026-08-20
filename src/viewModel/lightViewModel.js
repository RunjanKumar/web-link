import { useState, useEffect, useRef, useCallback } from "react";
import { getRoomDevices, execDevice } from '../api/service/dashboardService';
import { toast } from 'sonner';
import useCustomerProfile from '../hooks/CustomerProfile';

const ROOM_CONTROL_LOCK_MESSAGE = 'Room controls activate once the hotel checks you in.';

export default function useLightViewModel() {
    const [lightsData, setLightsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [masterSwitch, setMasterSwitch] = useState(false);
    const [lights, setLights] = useState({});
    const [fanLevels, setFanLevels] = useState({});
    const [masterSceneDevice, setMasterSceneDevice] = useState(null); // The Master Scene channel device
    const { canOrder } = useCustomerProfile();



    // ─────────────────────────────────────────────────────────────
    // DEBOUNCE REFS FOR FAN SPEED
    // ─────────────────────────────────────────────────────────────
    //
    // WHY DEBOUNCE?
    // When you drag a range slider, the `onChange` event fires on EVERY
    // pixel the thumb moves (e.g. 30-50 times per second). If we call
    // the API on each event, it will hit the backend 30-50 times for
    // a single slide gesture — wasting bandwidth and overloading the server.
    //
    // HOW IT WORKS:
    // 1. We store a timer ID in a ref (useRef) so it persists across renders
    //    without causing re-renders itself.
    // 2. Every time the slider value changes, we:
    //    a) CANCEL the previous timer (clearTimeout)
    //    b) START a new 400ms timer
    // 3. The API call only fires when the user STOPS sliding for 400ms.
    //
    // We use `useRef` instead of `useState` because:
    //    - Refs don't trigger re-renders when they change
    //    - We need the timer ID to persist across renders but don't
    //      need to display it in the UI
    // ─────────────────────────────────────────────────────────────
    const fanDebounceTimers = useRef({}); // { [deviceId]: timeoutId }

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

                    // Find the Master Scene device — we need its channelid
                    // so the Master toggle button sends just ONE API call
                    const masterDevice = response.data.find(
                        (device) => device.isMasterScene === true
                    );
                    if (masterDevice) {
                        setMasterSceneDevice(masterDevice);
                    }

                    // Build initial toggle state from device status
                    const initialState = {};
                    const initialFanLevels = {};
                    nonSceneDevices.forEach((device) => {
                        try {
                            const parsed = JSON.parse(device.status);
                            initialState[device._id] = parsed?.state === 'ON';
                            // Extract fan level if device is a FAN
                            if (device.type === 'FAN') {
                                initialFanLevels[device._id] = parsed?.level ?? 0;
                            }
                        } catch (err) {
                            initialState[device._id] = false;
                            if (device.type === 'FAN') {
                                initialFanLevels[device._id] = 0;
                            }
                        }
                    });
                    setLights(initialState);
                    setFanLevels(initialFanLevels);

                    // Master switch state comes from the Master Scene device status
                    // (not from checking if all lights are ON — backend tracks this)
                    if (masterDevice) {
                        try {
                            const masterParsed = JSON.parse(masterDevice.status);
                            setMasterSwitch(masterParsed?.state === 'ON');
                        } catch {
                            setMasterSwitch(false);
                        }
                    }
                }
            } catch (err) {
                console.error('Light devices fetch error:', err);
                if (!cancelled) {
                    // ── Show backend error message in toast ──
                    const backendMsg = err?.response?.data?.msg;
                    if (backendMsg) {
                        toast.error(backendMsg);
                    }
                    setError(err?.response?.data?.message || 'Failed to load devices');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchDevices();
        return () => {
            cancelled = true;
        };
    }, []);

    // Helper: find device by _id from lightsData
    const getDevice = (id) => lightsData.find((d) => d._id === id);

    const toggleLight = async (id) => {
        // The guest isn't in the room before check-in — don't drive its devices.
        if (!canOrder) {
            toast.info(ROOM_CONTROL_LOCK_MESSAGE);
            return;
        }
        const device = getDevice(id);
        const wasOn = lights[id];
        const newAction = wasOn ? 'TurnOff' : 'TurnOn';


        // Optimistic UI update
        setLights((prev) => ({ ...prev, [id]: !prev[id] }));

        try {
            const payload = {
                channelid: device?.channelid,
                action: newAction,
            };
            // Include level for Fan devices
            if (device?.type === 'FAN') {
                payload.level = fanLevels[id] ?? 0;
            }
            await execDevice(payload);
        } catch (err) {
            console.error(`❌ execDevice failed for ${id}:`, err);
            // ── Show backend error message in toast ──
            const backendMsg = err?.response?.data?.msg;
            if (backendMsg) {
                toast.error(backendMsg);
            }
            // Rollback on failure
            setLights((prev) => ({ ...prev, [id]: wasOn }));
        }
    };

    // ── Master Scene toggle ──
    // Sends ONE API call with the Master Scene device's channelid.
    // The backend + ESP32 handles turning on/off all channels internally.
    const toggleMaster = async () => {
        if (!canOrder) {
            toast.info(ROOM_CONTROL_LOCK_MESSAGE);
            return;
        }
        const newState = !masterSwitch;
        const newAction = newState ? 'TurnOn' : 'TurnOff';


        // Optimistic UI update
        setMasterSwitch(newState);
        setLights((prev) => {
            const updated = {};
            for (const key in prev) updated[key] = newState;
            return updated;
        });

        // Send just ONE API call — backend handles all channels
        try {
            await execDevice({
                channelid: masterSceneDevice?.channelid,
                action: newAction,
            });
        } catch (err) {
            console.error(`❌ Master exec failed:`, err);
            const backendMsg = err?.response?.data?.msg;
            if (backendMsg) {
                toast.error(backendMsg);
            }
            // Rollback on failure
            setMasterSwitch(!newState);
            setLights((prev) => {
                const reverted = {};
                for (const key in prev) reverted[key] = !newState;
                return reverted;
            });
        }
    };

    // ─────────────────────────────────────────────────────────────
    // DEBOUNCED FAN LEVEL UPDATE
    // ─────────────────────────────────────────────────────────────
    //
    // This function is called on EVERY slider change event.
    // But the actual API call is DEBOUNCED:
    //
    //   1. We immediately update the UI (setFanLevels) so the slider
    //      feels responsive — the user sees the thumb move instantly.
    //
    //   2. We then clear any previously scheduled API call for this
    //      specific fan device. This means: if the user is still
    //      dragging, the old pending API call gets cancelled.
    //
    //   3. We schedule a NEW API call 400ms in the future. If the
    //      user keeps dragging, this call also gets cancelled by
    //      the next onChange event. Only the LAST call (when user
    //      stops for 400ms) actually hits the server.
    //
    // RESULT: Instead of 30-50 API calls per drag, we get just 1 call.
    // ─────────────────────────────────────────────────────────────
    const updateFanLevel = useCallback((id, level) => {
        if (!canOrder) {
            toast.info(ROOM_CONTROL_LOCK_MESSAGE);
            return;
        }
        const device = lightsData.find((d) => d._id === id);
        const prevLevel = fanLevels[id] ?? 0;


        // Step 1: Update UI immediately (optimistic update)
        // This makes the slider feel responsive without waiting for the API
        setFanLevels((prev) => ({ ...prev, [id]: level }));

        // Step 2: Clear the previous debounce timer for this fan
        // If a timer was already running for this fan, cancel it
        // because the user is still dragging
        if (fanDebounceTimers.current[id]) {
            clearTimeout(fanDebounceTimers.current[id]);
        }

        // Step 3: Set a new timer — API call fires after 400ms of no changes
        // 400ms is a good balance: short enough to feel responsive,
        // long enough to batch rapid slider movements into one API call
        fanDebounceTimers.current[id] = setTimeout(async () => {
            try {
                await execDevice({
                    channelid: device?.channelid,
                    action: 'TurnOn',
                    level,
                });
            } catch (err) {
                console.error(`❌ Fan level update failed for ${id}:`, err);
                // ── Show backend error message in toast ──
                const backendMsg = err?.response?.data?.msg;
                if (backendMsg) {
                    toast.error(backendMsg);
                }
                // Rollback on failure
                setFanLevels((prev) => ({ ...prev, [id]: prevLevel }));
            }
        }, 400);
    }, [lightsData, fanLevels, canOrder]);

    // ── Cleanup all debounce timers when component unmounts ──
    useEffect(() => {
        return () => {
            Object.values(fanDebounceTimers.current).forEach(clearTimeout);
        };
    }, []);

    return { lightsData, masterSwitch, lights, toggleLight, toggleMaster, isLoading, error, fanLevels, updateFanLevel };
}
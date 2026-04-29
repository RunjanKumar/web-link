import { useState } from "react";

export default function useAcViewModel() {
    const [isOn, setIsOn] = useState(true);
    const [mode, setMode] = useState('cooling'); // 'auto' | 'cooling' | 'heating'
    const [temperature, setTemperature] = useState(21);
    const currentTemp = 19;
    const humidity = 54;

    const toggleAc = () => setIsOn((prev) => !prev);

    const setTemp = (temp) => {
        const clamped = Math.max(16, Math.min(30, temp));
        setTemperature(clamped);
    };

    return { isOn, mode, setMode, temperature, setTemp, currentTemp, humidity, toggleAc };
}

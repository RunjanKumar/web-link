import { useRef, useCallback } from 'react';

// ── Mode Icons ──
function AutoIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}

function CoolingIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" /><path d="m8 4 4-2 4 2" /><path d="m8 20 4 2 4-2" />
            <path d="M2 12h20" /><path d="m4 8-2 4 2 4" /><path d="m20 8 2 4-2 4" />
        </svg>
    );
}

function HeatingIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12c0-3 2.5-6 2.5-6S17 9 17 12a5 5 0 0 1-10 0c0-3 2.5-6 2.5-6S12 9 12 12z" />
            <path d="M12 22v-2" />
        </svg>
    );
}

// ── Temperature Slider ──
function TempSlider({ temperature, setTemp }) {
    const sliderRef = useRef(null);
    const minTemp = 16;
    const maxTemp = 30;

    const handleInteraction = useCallback((clientY) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const ratio = 1 - (clientY - rect.top) / rect.height;
        const clamped = Math.max(0, Math.min(1, ratio));
        const temp = Math.round(minTemp + clamped * (maxTemp - minTemp));
        setTemp(temp);
    }, [setTemp]);

    const handlePointerDown = (e) => {
        e.preventDefault();
        handleInteraction(e.clientY);

        const onMove = (ev) => handleInteraction(ev.clientY);
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const fillPercent = ((temperature - minTemp) / (maxTemp - minTemp)) * 100;

    return (
        <div
            ref={sliderRef}
            className="relative w-full h-full rounded-2xl bg-[#2a2a2a] cursor-pointer overflow-hidden select-none"
            onPointerDown={handlePointerDown}
        >
            {/* Fill */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-amber-400 rounded-b-2xl transition-all duration-150"
                style={{ height: `${fillPercent}%` }}
            />
            {/* Temperature label */}
            <div
                className="absolute left-0 right-0 flex items-center justify-center transition-all duration-150"
                style={{ bottom: `calc(${fillPercent}% - 14px)` }}
            >
                <span className="text-lg font-bold text-[#0d0d0d]">{temperature}°</span>
            </div>
        </div>
    );
}

// ── Main AC Controls Component ──
export default function AcControls({ isOn, mode, setMode, temperature, setTemp, currentTemp, humidity, toggleAc }) {
    const modes = [
        { id: 'auto', label: 'Auto', icon: <AutoIcon /> },
        { id: 'cooling', label: 'Cooling', icon: <CoolingIcon /> },
        { id: 'heating', label: 'Heating', icon: <HeatingIcon /> },
    ];

    return (
        <div className="grid grid-cols-[1fr_auto_70px] gap-3 items-stretch">
            {/* ── Left Card: Status ── */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between border border-[rgba(55,55,55,0.5)]">
                {/* Current Temperature */}
                <div>
                    <div className="flex items-start gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-2">
                            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                        </svg>
                        <span className="text-4xl font-bold leading-none">{currentTemp}° C</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                        <span className="text-xs text-gray-400">{humidity}%</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[rgba(55,55,55,0.6)] my-3" />

                {/* Status & Toggle */}
                <div>
                    <p className="text-xs text-gray-400 m-0">
                        Air conditioner is {isOn ? 'ON' : 'OFF'}
                    </p>
                    <button
                        onClick={toggleAc}
                        className={`mt-2 w-12 h-7 rounded-full border-none relative cursor-pointer transition-colors duration-300 shrink-0 p-0 ${isOn ? 'bg-amber-500' : 'bg-gray-600'}`}
                    >
                        <div
                            className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${isOn ? 'translate-x-[22px]' : 'translate-x-[3px]'}`}
                        />
                    </button>
                </div>
            </div>

            {/* ── Middle Column: Modes ── */}
            <div className="flex flex-col gap-3 w-[110px]">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`flex-1 rounded-2xl flex items-center justify-center gap-2 border-none cursor-pointer transition-all duration-200 text-sm font-semibold ${
                            mode === m.id
                                ? 'bg-amber-400 text-[#0d0d0d]'
                                : 'bg-[#1a1a1a] text-gray-400 border border-[rgba(55,55,55,0.5)]'
                        }`}
                    >
                        {m.icon}
                        {m.label}
                    </button>
                ))}
            </div>

            {/* ── Right Column: Temperature Slider ── */}
            <div className="h-full">
                <TempSlider temperature={temperature} setTemp={setTemp} />
            </div>
        </div>
    );
}

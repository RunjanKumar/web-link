import lightOff from '../../../assets/images/light_off.png';
import lightOn from '../../../assets/images/light_on.png';

// ── WiFi Offline Icon (crossed-out wifi) ──
function WifiOfflineIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
    );
}

// ── Inline SVG fan icon ──
function FanIcon({ isOn }) {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
            className={`transition-all duration-300 ${isOn ? 'opacity-100 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'opacity-60'}`}
            stroke={isOn ? '#f59e0b' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12c-1.5-4-1-8 3-9s5 3 3 6" />
            <path d="M12 12c4-1.5 8-1 9 3s-3 5-6 3" />
            <path d="M12 12c1.5 4 1 8-3 9s-5-3-3-6" />
            <path d="M12 12c-4 1.5-8 1-9-3s3-5 6-3" />
            <circle cx="12" cy="12" r="1.5" fill={isOn ? '#f59e0b' : '#9ca3af'} />
        </svg>
    );
}

// ── Fan Speed Slider ──
function FanSpeedSlider({ level, onChange }) {
    return (
        <div className="mt-3 pt-3 border-t border-[rgba(55,55,55,0.5)]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Speed</span>
                <span className="text-xs font-semibold text-amber-500">{level}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={level}
                onChange={(e) => onChange(Number(e.target.value))}
                className="fan-speed-slider w-full"
                style={{
                    background: `linear-gradient(to right, #f59e0b ${level}%, #374151 ${level}%)`
                }}
            />
        </div>
    );
}

export default function LightGrid({ lightsData, lights, toggleLight, fanLevels, updateFanLevel }) {
    return (
        <>
            {/* ── Slider Styles ── */}
            <style>{`
                .fan-speed-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    border-radius: 3px;
                    outline: none;
                    cursor: pointer;
                }
                .fan-speed-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #f59e0b;
                    border: 3px solid #1a1a1a;
                    box-shadow: 0 0 6px rgba(245, 158, 11, 0.4);
                    cursor: pointer;
                }
                .fan-speed-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #f59e0b;
                    border: 3px solid #1a1a1a;
                    box-shadow: 0 0 6px rgba(245, 158, 11, 0.4);
                    cursor: pointer;
                }
            `}</style>

            <div className="grid grid-cols-2 gap-4 mt-2">
                {lightsData.map((device) => {
                    const isOn = lights[device._id];
                    const isFan = device.type === 'FAN';
                    const isOffline = device.onlinestate === 0;

                    return (
                        <div
                            key={device._id}
                            className={`rounded-2xl px-4 pb-4 flex flex-col justify-between min-h-[220px] transition-all duration-300 relative ${isOn
                                ? 'bg-[#1a1a1a] border-2 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                                : 'bg-[#1a1a1a] border border-[rgba(55,55,55,0.5)]'
                                }`}
                        >
                            {/* ── Offline Indicator ── */}
                            {isOffline && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-900/30 rounded-full px-2 py-1">
                                    <WifiOfflineIcon />
                                    <span className="text-[10px] text-red-400 font-medium">Offline</span>
                                </div>
                            )}

                            {/* Device Image */}
                            <div className="flex items-center justify-center pt-4">
                                {isFan ? (
                                    <FanIcon isOn={isOn} />
                                ) : (
                                    <img
                                        src={isOn ? lightOn : lightOff}
                                        alt={device.friendlyname}
                                        className={`w-[93px] h-[100px] object-contain transition-all duration-300 ${isOn ? 'opacity-100 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'opacity-60'
                                            }`}
                                    />
                                )}
                            </div>

                            {/* Device Info & Toggle */}
                            <div className="mt-2">
                                <p className="text-sm font-bold m-0">{device.friendlyname}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-xs text-gray-500">
                                        {isOn ? 'Power on' : 'Power off'}
                                    </span>
                                    <button
                                        onClick={() => toggleLight(device._id)}
                                        className={`w-12 h-7 rounded-full border-none relative cursor-pointer transition-colors duration-300 shrink-0 p-0 ${isOn ? 'bg-amber-500' : 'bg-gray-600'
                                            }`}
                                    >
                                        <div
                                            className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${isOn ? 'translate-x-[22px]' : 'translate-x-[3px]'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* ── Fan Speed Slider (only for FAN type) ── */}
                                {isFan && (
                                    <FanSpeedSlider
                                        level={fanLevels?.[device._id] ?? 0}
                                        onChange={(val) => updateFanLevel(device._id, val)}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    )
}

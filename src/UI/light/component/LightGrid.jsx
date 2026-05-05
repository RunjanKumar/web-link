import lightOff from '../../../assets/images/light_off.png';
import lightOn from '../../../assets/images/light_on.png';

// Inline SVG fan icon since we don't have a fan.png asset
function FanIcon({ isOn }) {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
            className={`transition-all duration-300 ${isOn ? 'opacity-100 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'opacity-60'}`}
            stroke={isOn ? '#f59e0b' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Fan blades */}
            <path d="M12 12c-1.5-4-1-8 3-9s5 3 3 6" />
            <path d="M12 12c4-1.5 8-1 9 3s-3 5-6 3" />
            <path d="M12 12c1.5 4 1 8-3 9s-5-3-3-6" />
            <path d="M12 12c-4 1.5-8 1-9-3s3-5 6-3" />
            <circle cx="12" cy="12" r="1.5" fill={isOn ? '#f59e0b' : '#9ca3af'} />
        </svg>
    );
}

export default function LightGrid({ lightsData, lights, toggleLight }) {
    return (
        <div className="grid grid-cols-2 gap-4 mt-2">
            {lightsData.map((device) => {
                const isOn = lights[device._id];
                const isFan = device.type === 'FAN';
                return (
                    <div
                        key={device._id}
                        className={`rounded-2xl px-4 pb-4 flex flex-col justify-between min-h-[220px] transition-all duration-300 ${isOn
                            ? 'bg-[#1a1a1a] border-2 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            : 'bg-[#1a1a1a] border border-[rgba(55,55,55,0.5)]'
                            }`}
                    >
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
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

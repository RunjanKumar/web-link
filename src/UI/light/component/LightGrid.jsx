import { useState } from "react";
import lightOff from '../../assets/images/light_off.png';
import lightOn from '../../assets/images/light_on.png';

export default function LightGrid({ lightsData, lights, toggleLight }) {
    return (
        <div className="grid grid-cols-2 gap-4 mt-2">
            {lightsData.map((light) => {
                const isOn = lights[light.id];
                return (
                    <div
                        key={light.id}
                        className={`rounded-2xl px-4 pb-4 flex flex-col justify-between min-h-[220px] transition-all duration-300 ${isOn
                            ? 'bg-[#1a1a1a] border-2 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            : 'bg-[#1a1a1a] border border-[rgba(55,55,55,0.5)]'
                            }`}
                    >
                        {/* Lamp Image */}
                        <div className="flex items-center justify-center ">
                            <img
                                src={isOn ? lightOn : lightOff}
                                alt={light.name}
                                className={`w-[93px] h-[100px] object-contain transition-all duration-300 ${isOn ? 'opacity-100 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'opacity-60'
                                    }`}
                            />
                        </div>

                        {/* Light Info & Toggle */}
                        <div className="mt-2">
                            <p className="text-sm font-bold m-0">{light.name}</p>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-gray-500">
                                    {isOn ? 'Power on' : 'Power off'}
                                </span>
                                <button
                                    onClick={() => toggleLight(light.id)}
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

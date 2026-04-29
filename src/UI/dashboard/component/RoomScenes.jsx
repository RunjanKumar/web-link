import { useState } from 'react';

/* ─── Child Component: Individual Scene Toggle ─── */
function SceneItem({ icon, iconBg, name, defaultOn = true }) {
  const [isOn, setIsOn] = useState(defaultOn);

  return (
    <div className="bg-[#1A1A1A] rounded-2xl px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${iconBg}`}
        >
          {icon}
        </div>
        <span className="font-medium text-sm">{name}</span>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={() => setIsOn(!isOn)}
        className={`w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0 ${
          isOn ? 'bg-amber-500' : 'bg-gray-600'
        }`}
      >
        <div
          className={`w-5.5 h-5.5 bg-white rounded-full absolute top-[3px] shadow-md transition-transform duration-300 ${
            isOn ? 'translate-x-[22px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );
}

/* ─── Parent Component: Room Scenes ─── */
export default function RoomScenes() {
  // Dummy data — replace with API data later
  const scenes = [
    {
      id: 1,
      icon: '📍',
      iconBg: 'bg-emerald-900/60',
      name: 'Master Scene',
      defaultOn: true,
    },
    {
      id: 2,
      icon: '🌙',
      iconBg: 'bg-orange-900/60',
      name: 'Night Scene',
      defaultOn: true,
    },
    {
      id: 3,
      icon: '🎬',
      iconBg: 'bg-purple-900/60',
      name: 'Movie Scene',
      defaultOn: true,
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">
        Room <span className="italic text-amber-400 font-semibold">Scenes</span>
      </h2>
      <div className="space-y-3">
        {scenes.map((scene) => (
          <SceneItem
            key={scene.id}
            icon={scene.icon}
            iconBg={scene.iconBg}
            name={scene.name}
            defaultOn={scene.defaultOn}
          />
        ))}
      </div>
    </div>
  );
}

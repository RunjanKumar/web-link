import { useState } from "react";
export default function RoomScene() {
  const scenesData = [
    { id: 1, icon: '📍', colorClass: 'bg-emerald-900/60', name: 'Master Scene' },
    { id: 2, icon: '🌙', colorClass: 'bg-orange-900/60', name: 'Night Scene' },
    { id: 3, icon: '🎬', colorClass: 'bg-purple-900/60', name: 'Movie Scene' },
  ];
  const [sceneToggles, setSceneToggles] = useState({ 1: true, 2: true, 3: true });
  const toggleScene = (id) => setSceneToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  return (
    <div>
      <h2 className="text-lg font-bold mb-3 m-0">Room <span className="italic text-amber-500 font-semibold">Scenes</span></h2>
      <div className="flex flex-col gap-3">
        {scenesData.map((s) => (
          <div className="bg-[#1a1a1a] rounded-2xl py-3 px-4 flex justify-between items-center" key={s.id}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${s.colorClass}`}>{s.icon}</div>
              <span className="text-sm font-medium">{s.name}</span>
            </div>
            <button className={`w-12 h-7 rounded-full border-none relative cursor-pointer transition-colors duration-300 shrink-0 p-0 ${sceneToggles[s.id] ? 'bg-amber-500' : 'bg-gray-600'}`} onClick={() => toggleScene(s.id)}>
              <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${sceneToggles[s.id] ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

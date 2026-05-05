import { useState, useEffect } from "react";
import { getRoomDevices } from '../../../api/service/dashboardService';

// Scene icon/color mapping based on friendlyname
const sceneStyles = {
  'Master Scene': { icon: '📍', colorClass: 'bg-emerald-900/60' },
  'Night Scene': { icon: '🌙', colorClass: 'bg-orange-900/60' },
  'Movie Scene': { icon: '🎬', colorClass: 'bg-purple-900/60' },
};

const defaultStyle = { icon: '🎭', colorClass: 'bg-blue-900/60' };

export default function RoomScene() {
  const [scenesData, setScenesData] = useState([]);
  const [sceneToggles, setSceneToggles] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchScenes() {
      try {
        setIsLoading(true);
        const response = await getRoomDevices();

        if (!cancelled && response?.data) {
          // Filter: only devices where isSceneButton is true
          const sceneDevices = response.data.filter(
            (device) => device.isSceneButton === true
          );
          setScenesData(sceneDevices);

          // Build initial toggle state from device status
          const initialToggles = {};
          sceneDevices.forEach((device) => {
            try {
              const parsed = JSON.parse(device.status);
              initialToggles[device._id] = parsed?.state === 'ON';
            } catch {
              initialToggles[device._id] = false;
            }
          });
          setSceneToggles(initialToggles);
        }
      } catch (err) {
        console.error('Scene devices fetch error:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchScenes();
    return () => { cancelled = true; };
  }, []);

  const toggleScene = (id) => setSceneToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  // Don't render the section if there are no scene buttons
  if (!isLoading && scenesData.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 m-0">Room <span className="italic text-amber-500 font-semibold">Scenes</span></h2>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-8 h-8 rounded-full border-3 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
      )}

      {/* Scenes List */}
      {!isLoading && (
        <div className="flex flex-col gap-3">
          {scenesData.map((device) => {
            const style = sceneStyles[device.friendlyname] || defaultStyle;
            return (
              <div className="bg-[#1a1a1a] rounded-2xl py-3 px-4 flex justify-between items-center" key={device._id}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${style.colorClass}`}>{style.icon}</div>
                  <span className="text-sm font-medium">{device.friendlyname}</span>
                </div>
                <button
                  className={`w-12 h-7 rounded-full border-none relative cursor-pointer transition-colors duration-300 shrink-0 p-0 ${sceneToggles[device._id] ? 'bg-amber-500' : 'bg-gray-600'}`}
                  onClick={() => toggleScene(device._id)}
                >
                  <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${sceneToggles[device._id] ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

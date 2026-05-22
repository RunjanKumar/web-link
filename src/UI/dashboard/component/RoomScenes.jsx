import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getRoomDevices, execDevice } from '../../../api/service/dashboardService';
import { toast } from 'sonner';

// ── WiFi Offline Icon (crossed-out wifi) ──
function WifiOfflineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
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

// Scene icon/color mapping based on friendlyname
const sceneStyles = {
  'Master Scene': { icon: '📍', colorClass: 'bg-emerald-900/60' },
  'Night Scene': { icon: '🌙', colorClass: 'bg-orange-900/60' },
  'Movie Scene': { icon: '🎬', colorClass: 'bg-purple-900/60' },
};

const defaultStyle = { icon: '🎭', colorClass: 'bg-blue-900/60' };

/**
 * RoomScene component — renders all scene buttons (Master Scene, DND, etc.)
 *
 * Props:
 *   onMasterSceneChange(isOn) — called whenever Master Scene state changes,
 *                                so the parent can keep QuickActions in sync.
 *
 * Ref methods (via forwardRef + useImperativeHandle):
 *   toggleMasterScene() — allows parent to trigger Master Scene toggle
 *                          (called when QuickActions Master Scene is clicked)
 */
const RoomScene = forwardRef(function RoomScene({ onMasterSceneChange }, ref) {
  const [scenesData, setScenesData] = useState([]);
  const [sceneToggles, setSceneToggles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [masterSceneId, setMasterSceneId] = useState(null);



  useEffect(() => {
    let cancelled = false;

    async function fetchScenes() {
      console.log('[Dashboard] Fetching room scene devices');

      try {
        setIsLoading(true);
        const response = await getRoomDevices();
        if (!cancelled && response?.data) {
          const sceneDevices = response.data.filter(
            (device) => device.isSceneButton === true
          );
          console.log('[Dashboard] Room scene devices loaded', {
            totalDevices: response.data.length,
            sceneCount: sceneDevices.length,
            masterSceneFound: sceneDevices.some((d) => d.isMasterScene === true),
          });
          setScenesData(sceneDevices);

          // Build initial toggle state from device status
          const initialToggles = {};
          sceneDevices.forEach((device) => {
            try {
              const parsed = JSON.parse(device.status);
              initialToggles[device._id] = parsed?.state === 'ON';
            } catch (err) {
              console.warn('[Dashboard] Could not parse scene status', {
                id: device._id,
                name: device.friendlyname,
                status: device.status,
                error: err,
              });
              initialToggles[device._id] = false;
            }
          });
          setSceneToggles(initialToggles);

          // Find the Master Scene device and notify parent of its initial state
          const masterDevice = sceneDevices.find((d) => d.isMasterScene === true);
          if (masterDevice) {
            setMasterSceneId(masterDevice._id);
            console.log('[Dashboard] Master scene initialized', {
              id: masterDevice._id,
              isOn: initialToggles[masterDevice._id] ?? false,
            });
            onMasterSceneChange?.(initialToggles[masterDevice._id] ?? false);
          } else {
            console.log('[Dashboard] Master scene device not found');
          }
        }
      } catch (err) {
        console.error('[Dashboard] Scene devices fetch failed', {
          message:
            err?.response?.data?.message ||
            err?.response?.data?.msg ||
            err?.message ||
            'Unknown scene devices fetch error',
          status: err?.response?.status,
          error: err,
        });
        const backendMsg = err?.response?.data?.msg;
        if (backendMsg) toast.error(backendMsg);
      } finally {
        if (!cancelled) {
          console.log('[Dashboard] Room scene devices fetch finished');
          setIsLoading(false);
        }
      }
    }

    fetchScenes();
    return () => {
      console.log('[Dashboard] Room scene cleanup');
      cancelled = true;
    };
  }, [onMasterSceneChange]);

  // ── Toggle any scene — ONE API call with the scene's own channelid ──
  const toggleScene = async (id) => {
    const device = scenesData.find((d) => d._id === id);
    const wasOn = sceneToggles[id];
    const newAction = wasOn ? 'TurnOff' : 'TurnOn';

    console.log('[Dashboard] Scene toggle requested', {
      id,
      name: device?.friendlyname,
      channelid: device?.channelid,
      wasOn,
      action: newAction,
      isMasterScene: Boolean(device?.isMasterScene),
    });

    // Optimistic UI update
    setSceneToggles((prev) => ({ ...prev, [id]: !prev[id] }));

    try {
      await execDevice({
        channelid: device?.channelid,
        action: newAction,
      });

      console.log('[Dashboard] Scene command succeeded', {
        id,
        name: device?.friendlyname,
        action: newAction,
      });

      // If this was the Master Scene, notify parent so QuickActions stays in sync
      if (device?.isMasterScene) {
        onMasterSceneChange?.(!wasOn);
      }
    } catch (err) {
      console.error('[Dashboard] Scene command failed', {
        id,
        name: device?.friendlyname,
        action: newAction,
        message:
          err?.response?.data?.message ||
          err?.response?.data?.msg ||
          err?.message ||
          'Unknown scene command error',
        status: err?.response?.status,
        error: err,
      });
      const backendMsg = err?.response?.data?.msg;
      if (backendMsg) toast.error(backendMsg);
      // Rollback on failure
      setSceneToggles((prev) => ({ ...prev, [id]: wasOn }));
      console.log('[Dashboard] Scene toggle rolled back', {
        id,
        restoredValue: wasOn,
      });
    }
  };

  // ── Expose toggleMasterScene() to parent via ref ──
  // This allows QuickActions to trigger the Master Scene toggle
  // through Dashboard, keeping both toggles in sync.
  useImperativeHandle(ref, () => ({
    toggleMasterScene: () => {
      if (masterSceneId) {
        console.log('[Dashboard] Imperative master scene toggle received', {
          masterSceneId,
        });
        toggleScene(masterSceneId);
      } else {
        console.log('[Dashboard] Imperative master scene toggle ignored; master scene is not ready');
      }
    },
  }));

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
            const isOffline = device.onlinestate === 0;
            return (
              <div className="bg-[#1a1a1a] rounded-2xl py-3 px-4 flex justify-between items-center" key={device._id}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${style.colorClass}`}>{style.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{device.friendlyname}</span>
                    {isOffline && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <WifiOfflineIcon />
                        <span className="text-[10px] text-red-400">Offline</span>
                      </div>
                    )}
                  </div>
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
});

export default RoomScene;

import { useNavigate } from 'react-router-dom';

function ActionIcon({ type }) {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const colors = { bell: '#facc15', bulb: '#4ade80', snow: '#60a5fa', food: '#fb923c' };
  const s = colors[type];

  switch (type) {
    case 'bell': return <svg {...props} stroke={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case 'bulb': return <svg {...props} stroke={s}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>;
    case 'snow': return <svg {...props} stroke={s}><path d="M12 2v20" /><path d="m8 4 4-2 4 2" /><path d="m8 20 4 2 4-2" /><path d="M2 12h20" /><path d="m4 8-2 4 2 4" /><path d="m20 8 2 4-2 4" /></svg>;
    case 'food': return <svg {...props} stroke={s}><path d="M17 8c0-5-5-5-5-5s-5 0-5 5" /><path d="M3 14h18" /><path d="M3 14c0 3.5 2.5 6.5 6 7.5V23h6v-1.5c3.5-1 6-4 6-7.5" /></svg>;
    default: return null;
  }
}

/**
 * QuickActions component
 *
 * Props:
 *   masterSwitch (boolean) — current Master Scene state (synced from RoomScene)
 *   onToggleMaster () — callback to toggle Master Scene (calls RoomScene's toggleMasterScene)
 */
export default function QuickActions({ masterSwitch, onToggleMaster }) {
  const navigate = useNavigate();
  const actionsData = [
    { id: 1, icon: 'bell', title: 'Service Request', sub: 'From 8:00 am - 11: pm', accent: 'bg-gradient-to-r from-amber-500 to-yellow-300' },
    { id: 2, icon: 'bulb', title: 'Lights Control', accent: 'bg-gradient-to-r from-green-500 to-emerald-400', hasSwitch: true, route: '/lights' },
    { id: 3, icon: 'snow', title: 'Air Conditioner', accent: 'bg-gradient-to-r from-blue-500 to-sky-400', route: '/ac' },
    { id: 4, icon: 'food', title: 'Food Order', accent: 'bg-gradient-to-r from-orange-400 to-red-400' },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 m-0">Quick <span className="italic text-amber-500 font-semibold">Actions</span></h2>
      <div className="grid grid-cols-2 gap-3">
        {actionsData.map((a) => (
          <div className={`bg-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] border border-[rgba(55,55,55,0.5)] relative overflow-hidden ${a.route ? 'cursor-pointer' : ''}`} key={a.id} onClick={() => a.route && navigate(a.route)}>
            <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${a.accent}`} />
            <div className="flex justify-between items-start">
              <ActionIcon type={a.icon} />
              <button className="w-7 h-7 rounded-full border border-gray-600 bg-transparent flex items-center justify-center text-white cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4M8.5 3.5V8" />
                </svg>
              </button>
            </div>
            <div className="mt-auto pt-3">
              <p className="text-sm font-bold m-0">{a.title}</p>
              {a.sub && <p className="text-[0.625rem] text-gray-500 mt-1 m-0">{a.sub}</p>}
              {a.hasSwitch && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className={`w-10 h-[22px] rounded-full border-none relative cursor-pointer transition-colors duration-300 p-0 ${masterSwitch ? 'bg-amber-500' : 'bg-gray-600'}`}
                    onClick={(e) => {
                      // Stop propagation so clicking the toggle doesn't also navigate to /lights
                      e.stopPropagation();
                      onToggleMaster?.();
                    }}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${masterSwitch ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
                  </button>
                  <span className="text-[0.625rem] text-gray-400">Master Scene</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
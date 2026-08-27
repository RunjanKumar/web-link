import { useNavigate } from 'react-router-dom';

function ActionIcon({ type }) {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const colors = { bell: '#facc15', bulb: '#4ade80', snow: '#60a5fa', food: '#fb923c', facilities: '#a78bfa', laundry: '#22d3ee', bill: '#f472b6', shop: '#c084fc', myday: '#34d399' };
  const s = colors[type];

  switch (type) {
    // sunrise over a horizon — the daily wellness rhythm
    case 'myday': return <svg {...props} stroke={s}><path d="M12 2v3" /><path d="m4.9 6.9 2.1 2.1" /><path d="m19.1 6.9-2.1 2.1" /><path d="M2 18h20" /><path d="M6 22h12" /><path d="M8 14a4 4 0 0 1 8 0" /></svg>;
    case 'shop': return <svg {...props} stroke={s}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
    case 'bill': return <svg {...props} stroke={s}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M14 8H8" /><path d="M16 12H8" /></svg>;
    case 'laundry': return <svg {...props} stroke={s}><path d="M3 6h18v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M3 6l2-3h14l2 3" /><circle cx="12" cy="14" r="4" /></svg>;
    case 'bell': return <svg {...props} stroke={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case 'bulb': return <svg {...props} stroke={s}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>;
    case 'snow': return <svg {...props} stroke={s}><path d="M12 2v20" /><path d="m8 4 4-2 4 2" /><path d="m8 20 4 2 4-2" /><path d="M2 12h20" /><path d="m4 8-2 4 2 4" /><path d="m20 8 2 4-2 4" /></svg>;
    case 'food': return <svg {...props} stroke={s}><path d="M17 8c0-5-5-5-5-5s-5 0-5 5" /><path d="M3 14h18" /><path d="M3 14c0 3.5 2.5 6.5 6 7.5V23h6v-1.5c3.5-1 6-4 6-7.5" /></svg>;
    case 'facilities': return <svg {...props} stroke={s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
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
    { id: 1, icon: 'bell', title: 'Service Request', sub: 'From 8:00 am - 11: pm', accent: 'bg-gradient-to-r from-amber-500 to-yellow-300', route: '/services' },
    { id: 2, icon: 'bulb', title: 'Lights Control', accent: 'bg-gradient-to-r from-green-500 to-emerald-400', hasSwitch: true, route: '/lights' },
    { id: 3, icon: 'facilities', title: 'Facilities', accent: 'bg-gradient-to-r from-blue-500 to-sky-400', route: '/facilities' },
    { id: 4, icon: 'food', title: 'Food Order', accent: 'bg-gradient-to-r from-orange-400 to-red-400',route: '/food' },
    { id: 5, icon: 'laundry', title: 'Laundry', sub: 'Billed to your room', accent: 'bg-gradient-to-r from-cyan-500 to-teal-400', route: '/laundry' },
    { id: 6, icon: 'bill', title: 'View Bill', sub: 'Your stay charges', accent: 'bg-gradient-to-r from-pink-500 to-rose-400', route: '/bill' },
    { id: 7, icon: 'shop', title: 'Dukaan', sub: 'Shop essentials', accent: 'bg-gradient-to-r from-purple-500 to-fuchsia-400', route: '/dukaan' },
    // Wellness guests only in practice: the page shows an empty state when the
    // team has published nothing, which is what a non-wellness stay always sees.
    { id: 8, icon: 'myday', title: 'My Day', sub: 'Your wellness rhythm', accent: 'bg-gradient-to-r from-emerald-500 to-teal-400', route: '/my-day' },
  ];

  const handleActionClick = (action) => {
    console.log("[Dashboard] Quick action clicked", {
      id: action.id,
      title: action.title,
      route: action.route,
      hasSwitch: Boolean(action.hasSwitch),
    });

    if (action.route) {
      console.log("[Dashboard] Navigating from quick action", {
        route: action.route,
      });
      navigate(action.route);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 m-0">Quick <span className="italic text-amber-500 font-semibold">Actions</span></h2>
      <div className="grid grid-cols-2 gap-3">
        {actionsData.map((a) => (
          <div className={`bg-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] border border-[rgba(55,55,55,0.5)] relative overflow-hidden ${a.route ? 'cursor-pointer' : ''}`} key={a.id} onClick={() => handleActionClick(a)}>
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
                      console.log("[Dashboard] Master scene switch clicked", {
                        currentValue: masterSwitch,
                        nextValue: !masterSwitch,
                      });
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

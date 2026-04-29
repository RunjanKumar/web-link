import { useState } from 'react';

// ── Dummy Data (replace with API later) ──
const userData = { name: 'James Miller', room: 'Room 208', tagline: 'smart management' };

const scenesData = [
  { id: 1, icon: '📍', colorClass: 'bg-emerald-900/60', name: 'Master Scene' },
  { id: 2, icon: '🌙', colorClass: 'bg-orange-900/60', name: 'Night Scene' },
  { id: 3, icon: '🎬', colorClass: 'bg-purple-900/60', name: 'Movie Scene' },
];

const callsData = [
  { id: 1, icon: '🏨', title: 'Call Reception', desc: 'Need help? Call reception!' },
  { id: 2, icon: '🍵', title: 'Tea', desc: 'Need a break? Tea is coming!' },
  { id: 3, icon: '🍪', title: 'Snack', desc: 'Peckish? Snack time!' },
];

const actionsData = [
  { id: 1, icon: 'bell', title: 'Service Request', sub: 'From 8:00 am - 11: pm', accent: 'bg-gradient-to-r from-amber-500 to-yellow-300' },
  { id: 2, icon: 'bulb', title: 'Lights Control', accent: 'bg-gradient-to-r from-green-500 to-emerald-400', hasSwitch: true },
  { id: 3, icon: 'snow', title: 'Air Conditioner', accent: 'bg-gradient-to-r from-blue-500 to-sky-400' },
  { id: 4, icon: 'food', title: 'Food Order', accent: 'bg-gradient-to-r from-orange-400 to-red-400' },
];

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'reception', label: 'Reception' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'services', label: 'Services' },
];

// ── SVG Icon Helper ──
function ActionIcon({ type }) {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const colors = { bell: '#facc15', bulb: '#4ade80', snow: '#60a5fa', food: '#fb923c' };
  const s = colors[type];

  switch (type) {
    case 'bell': return <svg {...props} stroke={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'bulb': return <svg {...props} stroke={s}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>;
    case 'snow': return <svg {...props} stroke={s}><path d="M12 2v20"/><path d="m8 4 4-2 4 2"/><path d="m8 20 4 2 4-2"/><path d="M2 12h20"/><path d="m4 8-2 4 2 4"/><path d="m20 8 2 4-2 4"/></svg>;
    case 'food': return <svg {...props} stroke={s}><path d="M17 8c0-5-5-5-5-5s-5 0-5 5"/><path d="M3 14h18"/><path d="M3 14c0 3.5 2.5 6.5 6 7.5V23h6v-1.5c3.5-1 6-4 6-7.5"/></svg>;
    default: return null;
  }
}

function NavIcon({ id, active }) {
  const c = active ? '#facc15' : '#6b7280';
  const f = active ? '#facc15' : 'none';
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: f, stroke: c, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (id) {
    case 'home': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'reception': return <svg {...p} fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'facilities': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'services': return <svg {...p} fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    default: return null;
  }
}

// ── Main Dashboard Component ──
export default function Dashboard() {
  const [doorClosed, setDoorClosed] = useState(true);
  const [sceneToggles, setSceneToggles] = useState({ 1: true, 2: true, 3: true });
  const [masterSwitch, setMasterSwitch] = useState(true);
  const [activeNav, setActiveNav] = useState('home');

  const toggleScene = (id) => setSceneToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white relative">
      <div className="pt-14 px-5 pb-28 flex flex-col gap-6">

        {/* ── User Profile ── */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 m-0">Welcome,</p>
            <h1 className="text-[1.625rem] font-bold mt-1 m-0">
              {userData.name} <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1 m-0">{userData.room}, {userData.tagline}</p>
          </div>
          <button className="w-10 h-10 rounded-full border border-gray-700 bg-transparent flex items-center justify-center cursor-pointer shrink-0 hover:bg-white/5">
            <svg width="4" height="18" viewBox="0 0 4 18" fill="none">
              <circle cx="2" cy="2" r="1.8" fill="white" />
              <circle cx="2" cy="9" r="1.8" fill="white" />
              <circle cx="2" cy="16" r="1.8" fill="white" />
            </svg>
          </button>
        </div>

        {/* ── Door Control ── */}
        <div className="bg-[#1a1a1a] rounded-2xl px-5 py-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold m-0">{doorClosed ? 'Doors are closed' : 'Doors are open'}</p>
            <p className="text-xs text-gray-500 mt-1 m-0">Switch to open or close the doors</p>
          </div>
          <button className={`w-11 h-11 rounded-full border-none flex items-center justify-center cursor-pointer text-white transition-colors duration-300 ${doorClosed ? 'bg-amber-500' : 'bg-gray-600'}`} onClick={() => setDoorClosed(!doorClosed)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {doorClosed
                ? <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>
              }
            </svg>
          </button>
        </div>

        {/* ── Room Scenes ── */}
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

        {/* ── Quick Calls ── */}
        <div>
          <h2 className="text-lg font-bold mb-3 m-0">Quick <span className="italic text-amber-500 font-semibold">Calls</span></h2>
          <div className="grid grid-cols-3 gap-3">
            {callsData.map((c) => (
              <div className="bg-[#1a1a1a] rounded-2xl py-4 px-3 flex flex-col items-center text-center border border-[rgba(55,55,55,0.5)] cursor-pointer transition-colors duration-200 hover:bg-[#222]" key={c.id}>
                <div className="text-[1.75rem] mb-2">{c.icon}</div>
                <p className="text-xs font-semibold m-0">{c.title}</p>
                <p className="text-[0.625rem] text-gray-500 mt-1 m-0 leading-tight">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-lg font-bold mb-3 m-0">Quick <span className="italic text-amber-500 font-semibold">Actions</span></h2>
          <div className="grid grid-cols-2 gap-3">
            {actionsData.map((a) => (
              <div className="bg-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] border border-[rgba(55,55,55,0.5)] relative overflow-hidden" key={a.id}>
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
                      <button className={`w-10 h-[22px] rounded-full border-none relative cursor-pointer transition-colors duration-300 p-0 ${masterSwitch ? 'bg-amber-500' : 'bg-gray-600'}`} onClick={() => setMasterSwitch(!masterSwitch)}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${masterSwitch ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
                      </button>
                      <span className="text-[0.625rem] text-gray-400">Master Switch</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-[rgba(55,55,55,0.6)] py-2 px-4 z-50">
        <ul className="flex justify-around items-center max-w-[28rem] mx-auto p-0 m-0 list-none">
          {navItems.map((n) => (
            <li key={n.id}>
              <button className={`flex flex-col items-center gap-1 py-1 px-3 bg-transparent border-none cursor-pointer transition-colors duration-200 ${activeNav === n.id ? 'text-amber-500' : 'text-gray-500'}`} onClick={() => setActiveNav(n.id)}>
                <NavIcon id={n.id} active={activeNav === n.id} />
                <span className="text-[0.625rem] font-medium">{n.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

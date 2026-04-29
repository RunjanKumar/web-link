import { useState } from 'react';
import './dashboard.css';

// ── Dummy Data (replace with API later) ──
const userData = { name: 'James Miller', room: 'Room 208', tagline: 'smart management' };

const scenesData = [
  { id: 1, icon: '📍', colorClass: 'scene-icon--green', name: 'Master Scene' },
  { id: 2, icon: '🌙', colorClass: 'scene-icon--orange', name: 'Night Scene' },
  { id: 3, icon: '🎬', colorClass: 'scene-icon--purple', name: 'Movie Scene' },
];

const callsData = [
  { id: 1, icon: '🏨', title: 'Call Reception', desc: 'Need help? Call reception!' },
  { id: 2, icon: '🍵', title: 'Tea', desc: 'Need a break? Tea is coming!' },
  { id: 3, icon: '🍪', title: 'Snack', desc: 'Peckish? Snack time!' },
];

const actionsData = [
  { id: 1, icon: 'bell', title: 'Service Request', sub: 'From 8:00 am - 11: pm', accent: 'amber' },
  { id: 2, icon: 'bulb', title: 'Lights Control', accent: 'green', hasSwitch: true },
  { id: 3, icon: 'snow', title: 'Air Conditioner', accent: 'blue' },
  { id: 4, icon: 'food', title: 'Food Order', accent: 'orange' },
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
    <div className="dashboard">
      <div className="dashboard-content">

        {/* ── User Profile ── */}
        <div className="user-profile">
          <div>
            <p className="user-profile__greeting">Welcome,</p>
            <h1 className="user-profile__name">
              {userData.name} <span className="user-profile__wave">👋</span>
            </h1>
            <p className="user-profile__room">{userData.room}, {userData.tagline}</p>
          </div>
          <button className="menu-btn">
            <svg width="4" height="18" viewBox="0 0 4 18" fill="none">
              <circle cx="2" cy="2" r="1.8" fill="white" />
              <circle cx="2" cy="9" r="1.8" fill="white" />
              <circle cx="2" cy="16" r="1.8" fill="white" />
            </svg>
          </button>
        </div>

        {/* ── Door Control ── */}
        <div className="door-control">
          <div>
            <p className="door-control__title">{doorClosed ? 'Doors are closed' : 'Doors are open'}</p>
            <p className="door-control__sub">Switch to open or close the doors</p>
          </div>
          <button className={`door-btn ${doorClosed ? 'door-btn--closed' : 'door-btn--open'}`} onClick={() => setDoorClosed(!doorClosed)}>
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
          <h2 className="section-title">Room <span>Scenes</span></h2>
          <div className="scenes-list">
            {scenesData.map((s) => (
              <div className="scene-item" key={s.id}>
                <div className="scene-item__left">
                  <div className={`scene-icon ${s.colorClass}`}>{s.icon}</div>
                  <span className="scene-item__name">{s.name}</span>
                </div>
                <button className={`toggle ${sceneToggles[s.id] ? 'toggle--on' : 'toggle--off'}`} onClick={() => toggleScene(s.id)}>
                  <div className={`toggle__thumb ${sceneToggles[s.id] ? 'toggle__thumb--on' : 'toggle__thumb--off'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Calls ── */}
        <div>
          <h2 className="section-title">Quick <span>Calls</span></h2>
          <div className="calls-grid">
            {callsData.map((c) => (
              <div className="call-card" key={c.id}>
                <div className="call-card__icon">{c.icon}</div>
                <p className="call-card__title">{c.title}</p>
                <p className="call-card__desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="section-title">Quick <span>Actions</span></h2>
          <div className="actions-grid">
            {actionsData.map((a) => (
              <div className="action-card" key={a.id}>
                <div className={`action-card__accent action-card__accent--${a.accent}`} />
                <div className="action-card__header">
                  <ActionIcon type={a.icon} />
                  <button className="arrow-btn">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4M8.5 3.5V8" />
                    </svg>
                  </button>
                </div>
                <div className="action-card__body">
                  <p className="action-card__title">{a.title}</p>
                  {a.sub && <p className="action-card__sub">{a.sub}</p>}
                  {a.hasSwitch && (
                    <div className="action-card__switch">
                      <button className={`toggle toggle--sm ${masterSwitch ? 'toggle--on' : 'toggle--off'}`} onClick={() => setMasterSwitch(!masterSwitch)}>
                        <div className={`toggle__thumb ${masterSwitch ? 'toggle__thumb--on' : 'toggle__thumb--off'}`} />
                      </button>
                      <span className="action-card__switch-label">Master Switch</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav">
        <ul className="bottom-nav__list">
          {navItems.map((n) => (
            <li key={n.id}>
              <button className={`nav-btn ${activeNav === n.id ? 'nav-btn--active' : ''}`} onClick={() => setActiveNav(n.id)}>
                <NavIcon id={n.id} active={activeNav === n.id} />
                <span className="nav-btn__label">{n.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

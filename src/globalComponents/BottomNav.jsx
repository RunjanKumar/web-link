import { useNavigate, useLocation } from "react-router-dom";

function NavIcon({ id, active }) {
    const c = active ? '#facc15' : '#6b7280';
    const f = active ? '#facc15' : 'none';
    const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: f, stroke: c, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

    switch (id) {
        case 'home': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
        case 'reception': return <svg {...p} fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
        case 'food': return <svg {...p} fill="none"><path d="M17 8c0-5-5-5-5-5s-5 0-5 5" /><path d="M3 14h18" /><path d="M3 14c0 3.5 2.5 6.5 6 7.5V23h6v-1.5c3.5-1 6-4 6-7.5" /></svg>;
        case 'facilities': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
        case 'services': return <svg {...p} fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
        default: return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    }
}

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = [
        { id: 'home', label: 'Home', route: '/dashboard' },
        { id: 'reception', label: 'Reception', route: '/reception' },
        { id: 'food', label: 'Food', route: '/food' },
        { id: 'facilities', label: 'Facilities' },
        { id: 'services', label: 'Services', route: '/services' },
    ];
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-[rgba(55,55,55,0.6)] py-2 px-4 z-50">
            <ul className="flex justify-around items-center max-w-[28rem] mx-auto p-0 m-0 list-none">
                {navItems.map((n) => (
                    <li key={n.id}>
                        <button className={`flex flex-col items-center gap-1 py-1 px-3 bg-transparent border-none cursor-pointer transition-colors duration-200 ${location.pathname === n.route ? 'text-amber-500' : 'text-gray-500'}`} onClick={() => { if (n.route) navigate(n.route); }}>
                            <NavIcon id={n.id} active={location.pathname === n.route} />
                            <span className="text-[0.625rem] font-medium">{n.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
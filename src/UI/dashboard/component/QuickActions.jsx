import { useState } from 'react';

/* ─── Arrow Button (shared) ─── */
function ArrowButton() {
  return (
    <div className="w-7 h-7 rounded-full border border-gray-600 flex items-center justify-center">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4M8.5 3.5V8" />
      </svg>
    </div>
  );
}

/* ─── Child Component: Action Card ─── */
function ActionCard({ icon, title, subtitle, accentColor, children }) {
  return (
    <div
      className="bg-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] border border-gray-800/40 relative overflow-hidden"
    >
      {/* Colored accent line at bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[3px] ${accentColor}`}
      />

      <div className="flex justify-between items-start">
        <div className="text-2xl">{icon}</div>
        <ArrowButton />
      </div>

      <div className="mt-auto pt-3">
        <p className="font-bold text-sm leading-tight">{title}</p>
        {subtitle && (
          <p className="text-gray-500 text-[10px] mt-1">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}

/* ─── Parent Component: Quick Actions ─── */
export default function QuickActions() {
  const [masterSwitch, setMasterSwitch] = useState(true);

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">
        Quick{' '}
        <span className="italic text-amber-400 font-semibold">Actions</span>
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Service Request */}
        <ActionCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          }
          title="Service Request"
          subtitle="From 8:00 am - 11: pm"
          accentColor="bg-gradient-to-r from-amber-500 to-yellow-300"
        />

        {/* Lights Control */}
        <ActionCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
          }
          title="Lights Control"
          accentColor="bg-gradient-to-r from-green-500 to-emerald-400"
        >
          {/* Master Switch Toggle */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setMasterSwitch(!masterSwitch)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                masterSwitch ? 'bg-amber-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-md transition-transform duration-300 ${
                  masterSwitch ? 'translate-x-[20px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
            <span className="text-gray-400 text-[10px]">Master Switch</span>
          </div>
        </ActionCard>

        {/* Air Conditioner */}
        <ActionCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v8" />
              <path d="m4.93 10.93 1.41 1.41" />
              <path d="M2 18h2" />
              <path d="M20 18h2" />
              <path d="m19.07 10.93-1.41 1.41" />
              <path d="M22 22H2" />
              <path d="m8 6 4-4 4 4" />
              <path d="M16 18a4 4 0 0 0-8 0" />
            </svg>
          }
          title="Air Conditioner"
          accentColor="bg-gradient-to-r from-blue-500 to-sky-400"
        />

        {/* Food Order */}
        <ActionCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8c0-5-5-5-5-5s-5 0-5 5" />
              <path d="M3 14h18" />
              <path d="M3 14c0 3.5 2.5 6.5 6 7.5V23h6v-1.5c3.5-1 6-4 6-7.5" />
              <line x1="12" y1="8" x2="12" y2="14" />
            </svg>
          }
          title="Food Order"
          accentColor="bg-gradient-to-r from-orange-500 to-red-400"
        />
      </div>
    </div>
  );
}

/* ─── Child Component: Quick Call Card ─── */
function CallCard({ icon, title, description }) {
  return (
    <button className="bg-[#1A1A1A] rounded-2xl px-3 py-4 flex flex-col items-center text-center hover:bg-[#222] transition-colors duration-200 border border-gray-800/50">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="font-semibold text-xs">{title}</p>
      <p className="text-gray-500 text-[10px] mt-1 leading-tight">{description}</p>
    </button>
  );
}

/* ─── Parent Component: Quick Calls ─── */
export default function QuickCalls() {
  const calls = [
    {
      id: 1,
      icon: '🏨',
      title: 'Call Reception',
      description: 'Need help? Call reception!',
    },
    {
      id: 2,
      icon: '🍵',
      title: 'Tea',
      description: 'Need a break? Tea is coming!',
    },
    {
      id: 3,
      icon: '🍪',
      title: 'Snack',
      description: 'Peckish? Snack time!',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">
        Quick <span className="italic text-amber-400 font-semibold">Calls</span>
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {calls.map((call) => (
          <CallCard
            key={call.id}
            icon={call.icon}
            title={call.title}
            description={call.description}
          />
        ))}
      </div>
    </div>
  );
}

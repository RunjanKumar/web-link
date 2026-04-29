export default function QuickCalls() {
  const callsData = [
    { id: 1, icon: '🏨', title: 'Call Reception', desc: 'Need help? Call reception!' },
    { id: 2, icon: '🍵', title: 'Tea', desc: 'Need a break? Tea is coming!' },
    { id: 3, icon: '🍪', title: 'Snack', desc: 'Peckish? Snack time!' },
  ];
  return (
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
  );
}
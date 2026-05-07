export default function QuickCalls({ quickCallData, handleQuickCallClick, error }) { //in future show error 
  console.log("quickCallData", quickCallData);

  const count = quickCallData?.length || 0;

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 m-0">
        Quick{" "}
        <span className="italic text-amber-500 font-semibold">Calls</span>
      </h2>

      <div
        className="flex gap-3 overflow-x-auto quick-calls-scroll"
        style={{
          scrollbarWidth: "none",        /* Firefox */
          msOverflowStyle: "none",       /* IE / Edge */
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`.quick-calls-scroll::-webkit-scrollbar { display: none; }`}</style>

        {quickCallData?.map((c) => (
          <div
            key={c._id}
            onClick={() => handleQuickCallClick(c)}
            className="bg-[#1a1a1a] rounded-2xl py-4 px-3 flex flex-col items-center text-center border border-[rgba(55,55,55,0.5)] cursor-pointer transition-colors duration-200 hover:bg-[#222] shrink-0"
            style={{
              width:
                count <= 3
                  ? `calc((100% - ${(count - 1) * 0.75}rem) / ${count})`
                  : "calc((100% - 1.5rem) / 3)",
            }}
          >
            {/* Icon image */}
            <div className="w-14 h-14 rounded-xl bg-[#252525] flex items-center justify-center mb-2 overflow-hidden">
              <img
                src={c.icon}
                alt={c.name}
                className="w-full h-full object-contain p-1"
              />
            </div>

            <p className="text-xs font-semibold m-0 truncate w-full">
              {c.name}
            </p>
            <p className="text-[0.625rem] text-gray-500 mt-1 m-0 leading-tight line-clamp-2">
              {c.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
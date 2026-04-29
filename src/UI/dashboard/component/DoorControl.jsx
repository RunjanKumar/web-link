import { useState } from 'react';

export default function DoorControl() {
  const [doorClosed, setDoorClosed] = useState(true);

  return (
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
  );
}

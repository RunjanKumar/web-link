import { useState } from 'react';

export default function DoorControl() {
  const [isClosed, setIsClosed] = useState(true);

  return (
    <div className="bg-[#1A1A1A] rounded-2xl px-5 py-4 flex justify-between items-center">
      <div>
        <p className="font-semibold text-sm">
          {isClosed ? 'Doors are closed' : 'Doors are open'}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Switch to open or close the doors
        </p>
      </div>

      <button
        onClick={() => setIsClosed(!isClosed)}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300 shrink-0 ${
          isClosed ? 'bg-amber-500' : 'bg-gray-600'
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isClosed ? (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          ) : (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

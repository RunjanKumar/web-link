export default function UserProfile() {
  // Dummy data — replace with API data later
  const userData = { name: 'James Miller', room: 'Room 208', tagline: 'smart management' };

  return (
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
  );
}

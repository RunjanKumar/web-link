export default function UserProfile() {
  // Dummy data — replace with API data later
  const user = {
    name: 'James Miller',
    room: 'Room 208',
    tagline: 'smart management',
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm">Welcome,</p>
        <h1 className="text-[26px] font-bold mt-1">
          {user.name} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1">
          {user.room}, {user.tagline}
        </p>
      </div>

      {/* Kebab Menu */}
      <button className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors">
        <svg width="4" height="18" viewBox="0 0 4 18" fill="none">
          <circle cx="2" cy="2" r="1.8" fill="white" />
          <circle cx="2" cy="9" r="1.8" fill="white" />
          <circle cx="2" cy="16" r="1.8" fill="white" />
        </svg>
      </button>
    </div>
  );
}

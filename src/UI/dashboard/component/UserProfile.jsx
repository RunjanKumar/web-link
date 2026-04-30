import ThreeDotMenu from '../../../globalComponents/ThreeDotMenu';

export default function UserProfile() {
  // Dummy data — replace with API data later
  const userData = { name: 'James Miller', room: 'Room 208', tagline: 'smart management' };

  // Menu items for three dot menu
  const menuItems = [
    { label: 'Share feedback', onClick: () => { /* TODO: Add share feedback logic */ } },
    { label: 'Logout out', onClick: () => { /* TODO: Add logout logic */ } },
  ];

  return (
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400 m-0">Welcome,</p>
        <h1 className="text-[1.625rem] font-bold mt-1 m-0">
          {userData.name} <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1 m-0">{userData.room}, {userData.tagline}</p>
      </div>

      {/* ── Three Dot Menu ── */}
      <ThreeDotMenu items={menuItems} />
    </div>
  );
}

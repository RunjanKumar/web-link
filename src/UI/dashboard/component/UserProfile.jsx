import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeDotMenu from '../../../globalComponents/ThreeDotMenu';
import LogoutModal from '../../../globalComponents/LogoutModal';

export default function UserProfile() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  // Dummy data — replace with API data later
  const userData = { name: 'James Miller', room: 'Room 208', tagline: 'smart management' };

  // Menu items for three dot menu
  const menuItems = [
    { label: 'Share feedback', onClick: () => navigate('/feedback') },
    { label: 'Logout out', onClick: () => setShowLogout(true) },
  ];

  const handleLogout = () => {
    setShowLogout(false);
    // TODO: Add actual logout logic (clear session, API call, etc.)
    navigate('/');
  };

  return (
    <>
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

      {/* ── Logout Modal ── */}
      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onLogout={handleLogout}
      />
    </>
  );
}

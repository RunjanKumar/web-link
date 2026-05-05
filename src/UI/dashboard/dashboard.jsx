import useDashboardViewModel from '../../viewModel/dashboardViewModel';
import UserProfile from './component/UserProfile';
import DoorControl from './component/DoorControl';
import RoomScene from "./component/RoomScenes";
import QuickCalls from './component/QuickCalls';
import QuickActions from "./component/QuickActions";
import BottomNav from '../../globalComponents/BottomNav';

// ── Main Dashboard Component ──
export default function Dashboard() {
  const { name, room, hotelName, isLoading, error } = useDashboardViewModel();

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white relative">
      <div className="pt-14 px-5 pb-28 flex flex-col gap-6">
        {/* user profile — receives real data from API */}
        <UserProfile
          name={name}
          room={room}
          hotelName={hotelName}
          isLoading={isLoading}
          error={error}
        />

        <DoorControl />

        <RoomScene />

        <QuickCalls />

        {/* ── Quick Actions ── */}
        <QuickActions />
      </div>

      <BottomNav />
    </div>
  );
}

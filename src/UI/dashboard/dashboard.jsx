import UserProfile from './component/UserProfile';
import DoorControl from './component/DoorControl';
import RoomScene from "./component/RoomScenes";
import QuickCalls from './component/QuickCalls';
import QuickActions from "./component/QuickActions";
import BottomNav from '../../globalComponents/BottomNav';

// ── Main Dashboard Component ──
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white relative">
      <div className="pt-14 px-5 pb-28 flex flex-col gap-6">
        {/*user profile data should send by props*/}
        <UserProfile />

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

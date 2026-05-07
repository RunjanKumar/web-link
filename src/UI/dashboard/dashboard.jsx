import { useState, useRef, useCallback } from 'react';
import useDashboardViewModel from '../../viewModel/dashboardViewModel';
import UserProfile from './component/UserProfile';
import DoorControl from './component/DoorControl';
import RoomScene from "./component/RoomScenes";
import QuickCalls from './component/QuickCalls';
import QuickActions from "./component/QuickActions";
import BottomNav from '../../globalComponents/BottomNav';

// ── Main Dashboard Component ──
export default function Dashboard() {
  const { name, room, hotelName, isLoading, error, quickCallData, handleQuickCallClick } = useDashboardViewModel();

  // ── Master Scene sync state ──
  // This state is shared between RoomScene and QuickActions
  // so both toggles always show the same on/off value.
  const [masterSceneOn, setMasterSceneOn] = useState(false);
  const roomSceneRef = useRef(null);

  // Called by RoomScene whenever Master Scene state changes
  const handleMasterSceneChange = useCallback((isOn) => {
    setMasterSceneOn(isOn);
  }, []);

  // Called by QuickActions when its Master Scene toggle is clicked
  // This triggers RoomScene's toggleMasterScene() which sends the API call
  // and then calls onMasterSceneChange to update the shared state.
  const handleToggleMaster = useCallback(() => {
    roomSceneRef.current?.toggleMasterScene();
  }, []);

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

        <RoomScene
          ref={roomSceneRef}
          onMasterSceneChange={handleMasterSceneChange}
        />

        <QuickCalls
          quickCallData={quickCallData}
          handleQuickCallClick={handleQuickCallClick}
        />

        {/* ── Quick Actions ── */}
        <QuickActions
          masterSwitch={masterSceneOn}
          onToggleMaster={handleToggleMaster}
        />
      </div>

      <BottomNav />
    </div>
  );
}

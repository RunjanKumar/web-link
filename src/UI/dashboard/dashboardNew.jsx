import { useState, useRef, useCallback, useEffect } from 'react';
import useDashboardViewModel from '../../viewModel/dashboardViewModel';
import UserProfile from './component/UserProfile';
import DoorControl from './component/DoorControl';
import RoomScene from "./component/RoomScenes";
import QuickCalls from './component/QuickCalls';
import QuickActions from "./component/QuickActions";
import BottomNav from '../../globalComponents/BottomNav';

// ── Main Dashboard Component ──
export default function DashboardNew() {
  const { profileData, isLoading, profileError, quickCallError, quickCallData, handleQuickCallClick } = useDashboardViewModel();

  // ── Master Scene sync state ──
  // This state is shared between RoomScene and QuickActions
  // so both toggles always show the same on/off value.
  const [masterSceneOn, setMasterSceneOn] = useState(false);
  const roomSceneRef = useRef(null);

  useEffect(() => {
    console.log("[Dashboard] Page mounted", {
      path: window.location.pathname,
    });

    return () => {
      console.log("[Dashboard] Page unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("[Dashboard] Render state changed", {
      isLoading,
      hasProfile: Boolean(profileData),
      quickCallCount: quickCallData?.length || 0,
      profileError,
      quickCallError,
      masterSceneOn,
    });
  }, [
    isLoading,
    profileData,
    quickCallData,
    profileError,
    quickCallError,
    masterSceneOn,
  ]);

  // Called by RoomScene whenever Master Scene state changes
  const handleMasterSceneChange = useCallback((isOn) => {
    console.log("[Dashboard] Master scene state synced from RoomScene", {
      isOn,
    });
    setMasterSceneOn(isOn);
  }, []);

  // Called by QuickActions when its Master Scene toggle is clicked
  // This triggers RoomScene's toggleMasterScene() which sends the API call
  // and then calls onMasterSceneChange to update the shared state.
  const handleToggleMaster = useCallback(() => {
    console.log("[Dashboard] Master scene toggle requested from QuickActions", {
      hasRoomSceneRef: Boolean(roomSceneRef.current),
    });
    roomSceneRef.current?.toggleMasterScene();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white relative">
      <div className="pt-14 px-5 pb-28 flex flex-col gap-6">
        {/* user profile — receives real data from API */}
        {/* <h2>HI</h2> */}
        <UserProfile
          name={profileData?.data?.user?.name}
          room={profileData?.data?.bookRoomData[0]?.roomData?.roomNumber}
          hotelName={profileData?.data?.hotelData?.name}
          isLoading={isLoading}
          error={profileError}
        />

        <DoorControl />

        <RoomScene
          ref={roomSceneRef}
          onMasterSceneChange={handleMasterSceneChange}
        />

        <QuickCalls
          quickCallData={quickCallData}
          handleQuickCallClick={handleQuickCallClick}
          error={quickCallError}
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

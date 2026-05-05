import BottomNav from '../../globalComponents/BottomNav';
import BackButton from "../../globalComponents/BackButton";
import LightGrid from "./component/LightGrid";
import useLightViewModel from '../../viewModel/lightViewModel';

export default function LightControl() {
  const { masterSwitch, lights, toggleLight, toggleMaster, lightsData, isLoading, error } = useLightViewModel();

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white relative">
      <div className="pt-12 px-5 pb-28 flex flex-col gap-6">

        {/* ── Back Button ── */}
        <BackButton />

        {/* ── Title ── */}
        <h1 className="text-[1.75rem] font-bold m-0 -mt-2">Lights Control</h1>

        {/* ── Loading State ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          </div>
        )}

        {/* ── Error State ── */}
        {error && !isLoading && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm m-0">{error}</p>
          </div>
        )}

        {/* ── Content ── */}
        {!isLoading && !error && (
          <>
            {/* ── Master Scene ── */}
            <div className="bg-[#1a1a1a] rounded-full px-5 py-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold m-0">Master Scene</p>
                <p className="text-xs text-gray-500 mt-0.5 m-0">Turn on Master Scene, to turn on all the lights.</p>
              </div>
              <button
                onClick={toggleMaster}
                className={`w-11 h-11 rounded-full border-none flex items-center justify-center cursor-pointer transition-colors duration-300 shrink-0 ${masterSwitch ? 'bg-amber-500' : 'bg-gray-600'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
              </button>
            </div>

            {/* ── Lights Grid ── */}
            <LightGrid lightsData={lightsData} lights={lights} toggleLight={toggleLight} />
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

import BottomNav from '../../globalComponents/BottomNav';
import BackButton from '../../globalComponents/BackButton';
import AcControls from './component/AcControls';
import useAcViewModel from '../../viewModel/acViewModel';

export default function AirConditioner() {
    const acState = useAcViewModel();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative">
            <div className="pt-12 px-5 pb-28 flex flex-col gap-6">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 -mt-2">Air Conditioner</h1>

                {/* ── AC Controls ── */}
                <AcControls {...acState} />
            </div>

            <BottomNav />
        </div>
    );
}

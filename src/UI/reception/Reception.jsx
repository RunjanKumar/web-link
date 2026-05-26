import { useNavigate } from 'react-router-dom';
import BottomNav from '../../globalComponents/BottomNav';
import BackButton from '../../globalComponents/BackButton';

// TODO: Replace this placeholder image with the real receptionist illustration from Figma
import banner from '../../assets'; // ⚠️ WRONG IMAGE — Replace with real receptionist illustration from Figma
import AppImage from '../../globalComponents/AppImage';

export default function Reception() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-28 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 -mt-2 leading-tight">
                    Contact the Hotel{'\n'}
                    <span className="block">Receptionist</span>
                </h1>

                {/* ── Description ── */}
                <p className="text-sm text-gray-400 leading-relaxed mt-3 mb-0">
                    We hope you're enjoying your stay with us! Our team is
                    dedicated to ensuring your comfort and satisfaction
                    throughout your time here. If you have any questions, doubts,
                    or require assistance with anything at all, please don't hesitate
                    to reach out to us
                </p>

                {/* ── Illustration ── */}
                <div className="flex-1 flex items-center justify-center my-6">
                    {/* TODO: Replace this image with real receptionist/chat illustration from Figma */}
                    <AppImage
                        src={banner} // ⚠️ WRONG IMAGE — Replace with real illustration from Figma
                        alt="Contact Receptionist Illustration"
                        className="w-[280px] h-auto object-contain opacity-90"
                    />
                </div>

                {/* ── Continue Button ── */}
                <button
                    onClick={() => navigate('/chat')}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 mt-auto"
                >
                    Continue
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <BottomNav />
        </div>
    );
}

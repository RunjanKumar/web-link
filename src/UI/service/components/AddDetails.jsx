import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../../../globalComponents/BackButton';
import useServiceRequest from '../../../hooks/useServiceRequest';

/* ══════════════════════════════════════════════════
   ── Add Details Page ──
   ══════════════════════════════════════════════════ */
export default function AddDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setDetail, getDetail } = useServiceRequest();

    const serviceId = location.state?.serviceId || '';
    const serviceName = location.state?.serviceName || 'Service';

    // Initialize from context (persisted details)
    const [message, setMessage] = useState(getDetail(serviceId));

    const handleDone = () => {
        // Save details into context — persists across navigation
        setDetail(serviceId, message);
        navigate(-1); // Go back to ReviewRequest
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mt-1 leading-tight">
                    Add Details
                </h1>

                {/* ── Service Name Badge ── */}
                <div className="mt-4 mb-6">
                    <span className="inline-block bg-[#1a1a1a] border border-gray-800 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-xl">
                        {serviceName}
                    </span>
                </div>

                {/* ── Message Textarea ── */}
                <p className="text-sm font-semibold m-0 mb-2 text-gray-300">Description</p>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write Something"
                    className="w-full h-[200px] bg-[#141414] text-white text-sm rounded-2xl px-4 py-4 border border-gray-800 outline-none resize-none placeholder-gray-600 box-border focus:border-yellow-500/50 transition-colors duration-200"
                />

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Done Button ── */}
                <button
                    onClick={handleDone}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-6"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

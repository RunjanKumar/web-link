import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* ── Back button overlayed on image ── */
function OverlayBackButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute top-12 left-4 z-10 w-9 h-9 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full border-none cursor-pointer text-white hover:bg-black/50 transition-colors duration-200"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
            </svg>
        </button>
    );
}

/* ── Calendar Icon ── */
function CalendarIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

/* ── Chevron Icon ── */
function ChevronDown() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/* ══════════════════════════════════════════════════
   ── Reserve Table Page ──
   ══════════════════════════════════════════════════ */
export default function ReserveTable() {
    const navigate = useNavigate();
    const location = useLocation();

    const facility = location.state?.facility || {};

    const [dateTime, setDateTime] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState('');
    const [showPeoplePicker, setShowPeoplePicker] = useState(false);

    const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20];

    const handleReserve = () => {
        // TODO: Replace with actual API call to reserve
        if (!dateTime) {
            alert('Please select date and time');
            return;
        }
        if (!numberOfPeople) {
            alert('Please select number of people');
            return;
        }

        const dt = new Date(dateTime);
        const formattedDate = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const formattedTime = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

        navigate('/facilities/upcoming-events', {
            state: {
                showToast: true,
                newBooking: {
                    dateTime: `${formattedDate} at ${formattedTime}`,
                    guests: numberOfPeople,
                    facilityName: facility.name,
                },
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">

            {/* ── Hero Image ── */}
            <div className="relative w-full h-[45vh] min-h-[280px] overflow-hidden">
                <OverlayBackButton onClick={() => navigate(-1)} />
                <img
                    src={facility.image}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
            </div>

            {/* ── Content ── */}
            <div className="px-5 pb-6 flex flex-col flex-1 -mt-2">

                {/* ── Date and Time Field ── */}
                <div className="relative mb-4">
                    <label
                        className="block text-gray-400 text-xs font-medium mb-1.5"
                        htmlFor="dateTime"
                    >
                    </label>
                    <div className="relative">
                        <input
                            id="dateTime"
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            className="w-full bg-[#141414] text-white text-sm rounded-xl px-4 py-4 pr-12 border border-gray-800 outline-none box-border focus:border-yellow-500/50 transition-colors duration-200 appearance-none [color-scheme:dark]"
                            placeholder="Date and time"
                        />
                        {/* Calendar icon overlay */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <CalendarIcon />
                        </div>
                        {/* Placeholder text when empty */}
                        {!dateTime && (
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                                Date and time
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Number of People Field ── */}
                <div className="relative mb-4">
                    <button
                        onClick={() => setShowPeoplePicker(!showPeoplePicker)}
                        className="w-full bg-[#141414] text-left text-sm rounded-xl px-4 py-4 pr-12 border border-gray-800 outline-none box-border cursor-pointer hover:border-gray-700 focus:border-yellow-500/50 transition-colors duration-200"
                    >
                        <span className={numberOfPeople ? 'text-white' : 'text-gray-500'}>
                            {numberOfPeople ? `${numberOfPeople} people` : 'Number of people'}
                        </span>
                    </button>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown />
                    </div>

                    {/* Dropdown */}
                    {showPeoplePicker && (
                        <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl z-20 max-h-[200px] overflow-y-auto">
                            {peopleOptions.map((num) => (
                                <button
                                    key={num}
                                    onClick={() => { setNumberOfPeople(num); setShowPeoplePicker(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm border-none cursor-pointer transition-colors duration-150 ${numberOfPeople === num
                                        ? 'bg-yellow-400/10 text-yellow-400 font-semibold'
                                        : 'bg-transparent text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    {num} {num === 1 ? 'person' : 'people'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Reserve Button ── */}
                <button
                    onClick={handleReserve}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-6"
                >
                    Reserve a table
                </button>
            </div>
        </div>
    );
}

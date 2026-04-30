import { useState } from 'react';
import BackButton from '../../globalComponents/BackButton';

export default function Feedback() {
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        // TODO: Add submit feedback logic (API call)
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 -mt-2 leading-tight">
                    Rate Your Stay – We Value Your Opinion!
                </h1>

                {/* ── Subtitle ── */}
                <p className="text-sm text-gray-400 mt-2 mb-0">
                    Share your thoughts to help us improve your experience.
                </p>

                {/* ── Rate Your Stay ── */}
                <p className="text-base font-semibold mt-8 mb-3 m-0">Rate your stay</p>

                {/* ── Star Rating ── */}
                <div className="flex gap-8 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="bg-transparent border-none cursor-pointer p-0"
                        >
                            <svg
                                width="36"
                                height="36"
                                viewBox="0 0 24 24"
                                fill={star <= rating ? '#facc15' : 'none'}
                                stroke="#facc15"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </button>
                    ))}
                </div>

                {/* ── Share Your Experience ── */}
                <p className="text-base font-semibold mt-8 mb-3 m-0">Share Your Experience</p>

                {/* ── Message Textarea ── */}
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message"
                    className="w-full h-[180px] bg-white text-[#0d0d0d] text-sm rounded-2xl px-4 py-4 border-none outline-none resize-none placeholder-gray-400 box-border"
                />

                {/* ── Spacer to push button to bottom ── */}
                <div className="flex-1" />

                {/* ── Submit Button ── */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 mt-6"
                >
                    Submit
                </button>
            </div>
        </div>
    );
}

/**
 * FeedbackTextarea – Message input area for feedback.
 *
 * @param {string}   value    – Current text value
 * @param {function} onChange – Called on every keystroke (receives the event)
 */
export default function FeedbackTextarea({ value, onChange }) {
    return (
        <>
            {/* ── Section Label ── */}
            <p className="text-base font-semibold mt-8 mb-3 m-0">Share Your Experience</p>

            {/* ── Message Textarea ── */}
            <textarea
                value={value}
                onChange={onChange}
                placeholder="Write your message"
                className="w-full h-[180px] bg-white text-[#0d0d0d] text-sm rounded-2xl px-4 py-4 border-none outline-none resize-none placeholder-gray-400 box-border"
            />
        </>
    );
}

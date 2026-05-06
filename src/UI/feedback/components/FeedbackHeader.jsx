import BackButton from '../../../globalComponents/BackButton';

/**
 * FeedbackHeader – Title + subtitle section of the Feedback screen.
 */
export default function FeedbackHeader() {
    return (
        <>
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
        </>
    );
}

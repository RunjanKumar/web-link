import useFeedbackViewModel from '../../viewModel/feedbackViewModel';
import FeedbackHeader from './components/FeedbackHeader';
import StarRating from './components/StarRating';
import FeedbackTextarea from './components/FeedbackTextarea';
import SubmitButton from './components/SubmitButton';

export default function Feedback() {
    const {
        star,
        notes,
        loading,
        handleRatingChange,
        handleMessageChange,
        handleSubmit
    } = useFeedbackViewModel();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Header (Back + Title + Subtitle) ── */}
                <FeedbackHeader />

                {/* ── Rate Your Stay ── */}
                <p className="text-base font-semibold mt-8 mb-3 m-0">Rate your stay</p>

                {/* ── Star Rating ── */}
                <StarRating rating={star} onSelect={handleRatingChange} />

                {/* ── Message Textarea ── */}
                <FeedbackTextarea value={notes} onChange={handleMessageChange} />

                {/* ── Spacer to push button to bottom ── */}
                <div className="flex-1" />

                {/* ── Submit Button ── */}
                <SubmitButton onClick={handleSubmit} loading={loading} />
            </div>
        </div>
    );
}

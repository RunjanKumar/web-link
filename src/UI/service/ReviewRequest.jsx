import { useEffect } from 'react';
import BackButton from '../../globalComponents/BackButton';
import useReviewRequestViewModel from '../../viewModel/reviewRequestViewModel';
import ReviewCategorySection from './components/ReviewCategorySection';


/* ══════════════════════════════════════════════════
   ── Review Request Page ──
   ══════════════════════════════════════════════════ */
export default function ReviewRequest() {
    const {
        fetchCategories,
        buildGroupedItems,
        handleDelete,
        handleAddDetails,
        handleSubmit,
        isSubmitting,
    } = useReviewRequestViewModel();

    // Fetch categories on mount so grouped items can be built
    useEffect(() => {
        fetchCategories();
    }, []);

    // Build grouped items from context (persisted state)
    const groupedItems = buildGroupedItems();
    const totalItems = groupedItems.reduce((sum, cat) => sum + cat.subcategories.length, 0);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                {/* ── Back Button ── */}
                <BackButton />

                {/* ── Title ── */}
                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-6 leading-tight">
                    Review Request
                </h1>

                {/* ── Grouped Service Categories ── */}
                {totalItems > 0 ? (
                    groupedItems.map((cat) => (
                        <ReviewCategorySection
                            key={cat._id}
                            category={cat}
                            onDelete={handleDelete}
                            onAddDetails={handleAddDetails}
                        />
                    ))
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">No services selected</p>
                    </div>
                )}

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Send Request Button ── */}
                {totalItems > 0 && (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-4 ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Send Request'}
                    </button>
                )}
            </div>
        </div>
    );
}

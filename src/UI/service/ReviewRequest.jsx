import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';
import TrashIcon from '../../globalComponents/TrashIcon';
import { useToast } from '../../globalComponents/Toast';
import useReviewRequestViewModel from '../../viewModel/reviewRequestViewModel';

/* ── Single review service item ── */
function ReviewServiceItem({ item, onDelete, onAddDetails }) {
    const hasDetails = item.details && item.details.trim().length > 0;

    return (
        <div className="py-4 border-b border-gray-800/40 last:border-b-0">
            {/* Top row: info + delete */}
            <div className="flex items-start gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-semibold m-0 leading-snug">{item.name}</h4>
                    <p className="text-gray-500 text-xs m-0 mt-0.5 leading-relaxed">{item.description}</p>
                    {item.price > 0 && (
                        <p className="text-gray-400 text-xs m-0 mt-1 font-medium">₹ {item.price}</p>
                    )}
                </div>

                {/* Delete button */}
                <button
                    onClick={() => onDelete(item.id)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-lg hover:bg-white/5 transition-colors duration-150"
                >
                    <TrashIcon />
                </button>
            </div>

            {/* Details text (shown when details have been added) */}
            {hasDetails && (
                <p className="text-yellow-400/80 text-xs m-0 mt-2 leading-relaxed">
                    Details : {item.details}
                </p>
            )}

            {/* Add Details / Edit Details button */}
            <button
                onClick={() => onAddDetails(item)}
                className="mt-3 px-4 py-1.5 rounded-md text-xs font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
            >
                {hasDetails ? 'Edit Details' : 'Add Details'}
            </button>
        </div>
    );
}

/* ── Category group section ── */
function ReviewCategorySection({ category, onDelete, onAddDetails }) {
    return (
        <div className="mb-5">
            {/* Category header */}
            <div className="bg-[#141414] border border-gray-800/60 rounded-t-xl px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-yellow-400 rounded-full" />
                    <h3 className="text-white text-base font-bold m-0">{category.categoryName || category.name}</h3>
                </div>
            </div>

            {/* Service items */}
            <div className="bg-[#111111] border border-t-0 border-gray-800/40 rounded-b-xl px-4">
                {category.subcategories.map((sub) => (
                    <ReviewServiceItem
                        key={sub.id}
                        item={sub}
                        onDelete={onDelete}
                        onAddDetails={onAddDetails}
                    />
                ))}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── Review Request Page ──
   ══════════════════════════════════════════════════ */
export default function ReviewRequest() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const {
        fetchCategories,
        buildGroupedItems,
        handleDelete,
        handleAddDetails,
        handleSendRequest,
        isSubmitting,
    } = useReviewRequestViewModel();

    // Wraps the ViewModel's submit with toast + navigation
    const onSubmit = async () => {
        const result = await handleSendRequest();
        if (result.success) {
            showToast('Your service request has been successfully submitted.', 'success');
            navigate('/services/pending', { state: { showToast: false } });
        } else {
            showToast(result.errorMessage || 'Failed to submit request.', 'error');
        }
    };

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
                        onClick={onSubmit}
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

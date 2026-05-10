import ReviewServiceItem from "./ReviewServiceItem";

/* ── Category group section ── */
export default function ReviewCategorySection({ category, onDelete, onAddDetails }) {
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
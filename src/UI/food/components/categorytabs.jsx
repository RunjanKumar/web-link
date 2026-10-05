import useCategoryTabsViewModel from '../../../viewModel/categoryTabsViewModel';

export default function CategoryTabs({ categories, activeIndex = 0, onCategorySelect }) {
    const { scrollRef, tabRefs, handleTabClick } = useCategoryTabsViewModel({
        categories,
        activeIndex,
        onCategorySelect,
    });

    return (
        <div className="sticky top-0 z-30 bg-[#111111] pt-4 pb-4">
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories?.map((category, index) => (
                    <button
                        key={category._id || category.id || index}
                        ref={(el) => (tabRefs.current[index] = el)}
                        onClick={() => handleTabClick(index)}
                        className={`px-5 py-2 rounded-full text-[15px] whitespace-nowrap transition-colors duration-200 ${
                            activeIndex === index
                                ? "bg-yellow-500 text-black font-semibold"
                                : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
                        }`}
                    >
                        {category.name || category.title || 'Category'}
                    </button>
                ))}
            </div>
        </div>
    );
}

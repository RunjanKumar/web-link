import { useRef, useEffect } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 * CATEGORY TABS COMPONENT (KFC-style — sticky)
 * ══════════════════════════════════════════════════════════════
 *
 * Always visible at the top (sticky). Highlights the current
 * category based on scroll position. Tab click scrolls to
 * that food section.
 */

export default function CategoryTabs({ categories, activeIndex = 0, onCategorySelect }) {
    const scrollRef = useRef(null);
    const tabRefs = useRef({});

    // When activeIndex changes, scroll the TAB strip horizontally
    // (NOT scrollIntoView which moves the whole page)
    useEffect(() => {
        const activeTab = tabRefs.current[activeIndex];
        const container = scrollRef.current;
        if (!activeTab || !container) return;

        // Calculate the scroll position to center the active tab
        const tabLeft = activeTab.offsetLeft;
        const tabWidth = activeTab.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);

        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
        });
    }, [activeIndex]);

    const handleTabClick = (index) => {
        if (onCategorySelect) {
            onCategorySelect(index);
        }
    };

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
                        className={`px-6 py-3 rounded-full text-lg whitespace-nowrap transition-colors duration-200 ${
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
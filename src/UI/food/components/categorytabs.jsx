import { useRef, useEffect } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 * CATEGORY TABS COMPONENT (KFC-style — sticky)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This component has TWO data sources:
 *   1. categories[] — the list of food categories from API
 *   2. activeIndex — which tab is highlighted (controlled by parent)
 *
 * activeIndex changes in TWO ways:
 *   a. User clicks a tab → parent sets activeIndex + scrolls FoodList
 *   b. User scrolls → FoodList detects visible section → parent sets activeIndex
 *
 * The tab strip auto-scrolls horizontally to keep the active tab centered.
 */

export default function CategoryTabs({ categories, activeIndex = 0, onCategorySelect }) {
    const scrollRef = useRef(null);
    const tabRefs = useRef({});

    console.log('[CategoryTabs] STEP 9: Rendered with activeIndex:', activeIndex,
        '| categories:', categories?.length || 0);

    // LEARNING: When activeIndex changes, we scroll the tab strip HORIZONTALLY only.
    // We use container.scrollTo() instead of element.scrollIntoView() because
    // scrollIntoView() would also scroll the WHOLE PAGE vertically.
    useEffect(() => {
        const activeTab = tabRefs.current[activeIndex];
        const container = scrollRef.current;
        if (!activeTab || !container) return;

        const tabLeft = activeTab.offsetLeft;
        const tabWidth = activeTab.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);

        console.log('[CategoryTabs] Auto-scrolling tab strip to center tab:', activeIndex);
        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
        });
    }, [activeIndex]);

    const handleTabClick = (index) => {
        console.log('[CategoryTabs] Tab clicked:', index, '→ name:', categories?.[index]?.name);
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
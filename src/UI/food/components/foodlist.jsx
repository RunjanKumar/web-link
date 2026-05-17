import { useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import FoodCard from './foodcard';

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD LIST COMPONENT (KFC-style)
 * ══════════════════════════════════════════════════════════════
 *
 * ALL foods always rendered, grouped by category.
 * - scrollToCategory(index) → smooth scroll to that section
 * - IntersectionObserver → auto-highlight tab when section
 *   enters the top area of the viewport (like KFC)
 */

const FoodList = forwardRef(function FoodList(
    { searchText, foodItemData, onVisibleCategoryChange },
    ref
) {
    const sectionRefs = useRef({});
    const blockObserverUntil = useRef(0);
    const lastReportedIndex = useRef(-1);

    // Build sections from API data — include food `type` for veg/non-veg
    const sections = useMemo(() => {
        if (!foodItemData || foodItemData.length === 0) return [];

        return foodItemData
            .map((category, index) => {
                const foods = (category.foodsInCategories || []).map((food) => ({
                    id: food._id || food.id,
                    title: food.name || food.title,
                    description: food.description || '',
                    price: food.price || 0,
                    imageURL: food.imageURL || food.image || food.imageUrl || null,
                    calories: food.calories || 0,
                    type: food.type || null,  // 1 = veg, 2 = non-veg
                }));

                return {
                    categoryId: category._id || category.id,
                    categoryName: category.name || category.title || 'Category',
                    globalIndex: index,
                    foods,
                };
            })
            .filter((s) => s.foods.length > 0);
    }, [foodItemData]);

    // Filter by search text
    const displaySections = useMemo(() => {
        if (!searchText) return sections;

        return sections
            .map((section) => ({
                ...section,
                foods: section.foods.filter(
                    (food) =>
                        food.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                        food.description?.toLowerCase().includes(searchText.toLowerCase())
                ),
            }))
            .filter((section) => section.foods.length > 0);
    }, [sections, searchText]);

    /**
     * Expose scrollToCategory to parent.
     * Offset = sticky tabs height (~56px) + extra padding (16px)
     */
    useImperativeHandle(ref, () => ({
        scrollToCategory(globalIndex) {
            const section = displaySections.find((s) => s.globalIndex === globalIndex);
            if (!section) return;

            const el = sectionRefs.current[section.categoryId];
            if (!el) return;

            blockObserverUntil.current = Date.now() + 900;
            lastReportedIndex.current = globalIndex;

            // 56px sticky tabs + 16px breathing room
            const offset = 72;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        },
    }), [displaySections]);

    /**
     * IntersectionObserver — triggers when a section's TOP edge
     * enters the observation zone (just below the sticky tabs).
     */
    useEffect(() => {
        if (!onVisibleCategoryChange) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (Date.now() < blockObserverUntil.current) return;

                // Collect all currently intersecting sections
                const visible = [];
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        visible.push({
                            index: parseInt(entry.target.dataset.categoryIndex, 10),
                            top: entry.boundingClientRect.top,
                        });
                    }
                }

                if (visible.length === 0) return;

                // Pick the one closest to the top (but still visible)
                visible.sort((a, b) => a.top - b.top);
                const best = visible[0];

                if (!isNaN(best.index) && best.index !== lastReportedIndex.current) {
                    lastReportedIndex.current = best.index;
                    onVisibleCategoryChange(best.index);
                }
            },
            {
                // Observation zone: from 72px below top (under sticky tabs)
                // to 70% down the viewport — so it switches early as
                // the last items of previous section scroll up
                threshold: [0, 0.05, 0.15],
                rootMargin: '-72px 0px -30% 0px',
            }
        );

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displaySections.length, onVisibleCategoryChange]);

    if (displaySections.length === 0) {
        return (
            <div className="mt-8 text-center py-12">
                <p className="text-gray-500">
                    {searchText ? 'No food items found' : 'No food available'}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-10">
            {displaySections.map((section) => (
                <div
                    key={section.categoryId}
                    ref={(el) => (sectionRefs.current[section.categoryId] = el)}
                    data-category-index={section.globalIndex}
                >
                    {/* Category section header */}
                    <h3 className="text-[22px] font-bold text-white mb-5 pt-2">
                        {section.categoryName}
                    </h3>

                    <div className="flex flex-col gap-5">
                        {section.foods.map((item) => (
                            <FoodCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
});

export default FoodList;
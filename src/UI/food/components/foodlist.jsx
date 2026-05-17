import { useRef, useEffect, useMemo, useImperativeHandle, forwardRef, useCallback } from 'react';
import FoodCard from './foodcard';

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD LIST COMPONENT (KFC-style)
 * ══════════════════════════════════════════════════════════════
 *
 * ALL foods always rendered, grouped by category.
 *
 * Scroll detection uses a scroll event listener (not IntersectionObserver)
 * which checks every section's position on each scroll frame.
 * This is how KFC/Zomato actually detect the active category —
 * it's 100% reliable in both scroll directions.
 */

// Height of the sticky tab bar (used as scroll offset)
const STICKY_OFFSET = 72;

const FoodList = forwardRef(function FoodList(
    { searchText, foodItemData, onVisibleCategoryChange },
    ref
) {
    const sectionRefs = useRef({});
    const blockUntil = useRef(0);
    const lastReported = useRef(-1);
    const rafId = useRef(null);

    // Build sections from API data
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
                    type: food.type || null,
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

    // Expose scrollToCategory to parent
    useImperativeHandle(ref, () => ({
        scrollToCategory(globalIndex) {
            const section = displaySections.find((s) => s.globalIndex === globalIndex);
            if (!section) return;

            const el = sectionRefs.current[section.categoryId];
            if (!el) return;

            // Block scroll detection during programmatic scroll
            blockUntil.current = Date.now() + 900;
            lastReported.current = globalIndex;

            const top = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
            window.scrollTo({ top, behavior: 'smooth' });
        },
    }), [displaySections]);

    /**
     * Scroll handler — on every scroll frame, find which section's
     * top edge is closest to (but at or above) the sticky offset line.
     *
     * Logic: The "active" section is the LAST section whose top edge
     * has scrolled past the sticky tabs. This works perfectly for
     * both scroll up and scroll down.
     */
    const detectActiveSection = useCallback(() => {
        if (Date.now() < blockUntil.current) return;
        if (!onVisibleCategoryChange) return;

        let activeIndex = -1;

        for (const section of displaySections) {
            const el = sectionRefs.current[section.categoryId];
            if (!el) continue;

            const rect = el.getBoundingClientRect();

            // If the section's top is at or above the sticky offset,
            // it means this section has scrolled into the "active" zone.
            // We keep updating activeIndex — the LAST one that passes
            // this check is the one currently at the top.
            if (rect.top <= STICKY_OFFSET + 20) {
                activeIndex = section.globalIndex;
            }
        }

        // Default to first section if nothing has scrolled past yet
        if (activeIndex === -1 && displaySections.length > 0) {
            activeIndex = displaySections[0].globalIndex;
        }

        if (activeIndex !== -1 && activeIndex !== lastReported.current) {
            lastReported.current = activeIndex;
            onVisibleCategoryChange(activeIndex);
        }
    }, [displaySections, onVisibleCategoryChange]);

    // Attach scroll listener with requestAnimationFrame throttle
    useEffect(() => {
        if (!onVisibleCategoryChange) return;

        const handleScroll = () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
            rafId.current = requestAnimationFrame(detectActiveSection);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Run once on mount to set initial state
        detectActiveSection();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [detectActiveSection, onVisibleCategoryChange]);

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
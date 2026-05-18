import { useRef, useEffect, useMemo, useImperativeHandle, forwardRef, useCallback } from 'react';
import FoodCard from './foodcard';

/**
 * ══════════════════════════════════════════════════════════════
 * FOOD LIST COMPONENT (KFC-style scroll detection)
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This is the most complex component. It does 3 things:
 *
 *   1. DATA MAPPING: Transforms raw API food data into card-ready objects
 *   2. SCROLL-TO: Exposes scrollToCategory() via useImperativeHandle
 *      so the parent can call it when a tab is clicked
 *   3. SCROLL DETECTION: Uses a scroll event listener to detect which
 *      category section is at the top and reports it to the parent
 *
 * IMPORTANT: Why scroll listener instead of IntersectionObserver?
 *   IntersectionObserver only fires at threshold boundaries (miss events).
 *   Scroll listener checks EVERY frame — 100% reliable in both directions.
 */

// Height of sticky tabs — used to offset scroll calculations
const STICKY_OFFSET = 72;

const FoodList = forwardRef(function FoodList(
    { searchText, foodItemData, onVisibleCategoryChange },
    ref
) {
    const sectionRefs = useRef({});
    const blockUntil = useRef(0);
    const lastReported = useRef(-1);
    const rafId = useRef(null);

    /**
     * LEARNING — STEP 10: DATA MAPPING
     * Transform raw API data → UI-ready structure.
     *
     * Raw API structure (from GET /v1/foodCategory):
     *   foodItemData = [
     *     {
     *       _id: "cat1",
     *       name: "Indian Cuisine",
     *       foodsInCategories: [
     *         { _id: "food1", name: "Biryani", price: 349, kcal: 450, type: 1, ... },
     *         { _id: "food2", name: "Butter Chicken", price: 550, kcal: 380, ... },
     *       ]
     *     },
     *     { _id: "cat2", name: "Italian", foodsInCategories: [...] },
     *   ]
     *
     * Mapped structure (what UI components receive):
     *   sections = [
     *     {
     *       categoryId: "cat1",
     *       categoryName: "Indian Cuisine",
     *       globalIndex: 0,
     *       foods: [
     *         { id: "food1", title: "Biryani", price: 349, calories: 450, ... }
     *       ]
     *     }
     *   ]
     */
    const sections = useMemo(() => {
        if (!foodItemData || foodItemData.length === 0) return [];

        console.log('┌──────────────────────────────────────────────────────────┐');
        console.log('│ [FoodList] STEP 10: Mapping raw API data → UI structure  │');
        console.log('└──────────────────────────────────────────────────────────┘');

        // Log the FIRST raw food item to see ALL backend fields
        if (foodItemData[0]?.foodsInCategories?.[0]) {
            const raw = foodItemData[0].foodsInCategories[0];
            console.log('[FoodList] ★ RAW first food item (ALL backend fields):');
            console.log('  Backend field → UI field mapping:');
            console.log(`  raw._id = "${raw._id}" → id`);
            console.log(`  raw.name = "${raw.name}" → title`);
            console.log(`  raw.price = ${raw.price} → price`);
            console.log(`  raw.kcal = ${raw.kcal} → calories`);
            console.log(`  raw.type = ${raw.type} → type (1=veg, 2=nonveg)`);
            console.log(`  raw.description = "${raw.description}" → description`);
            console.log(`  raw.imageURL = "${raw.imageURL}" → imageURL`);
            console.log(`  raw.inGridients = [${(raw.inGridients || []).join(', ')}] → inGridients`);
            console.log(`  raw.choiceOfAddOn = [${(raw.choiceOfAddOn || []).join(', ')}] → choiceOfAddOn`);
            console.log(`    ↑ Are these ObjectIDs (strings) or populated objects?`);
            console.log(`    Type of first item: ${typeof raw.choiceOfAddOn?.[0]}`);
            if (raw.choiceOfAddOn?.[0] && typeof raw.choiceOfAddOn[0] === 'object') {
                console.log('    ✅ POPULATED! Has:', Object.keys(raw.choiceOfAddOn[0]));
            } else {
                console.log('    ⚠️ NOT POPULATED — just ObjectID strings. Need backend .populate()');
            }
            console.log(`  raw.isAvailable = ${raw.isAvailable} → isAvailable`);
            console.log(`  raw.mealType = [${(raw.mealType || []).join(', ')}] → mealType`);
            console.log('  Full raw object:', raw);
        }

        return foodItemData
            .map((category, index) => {
                const foods = (category.foodsInCategories || []).map((food) => ({
                    id: food._id || food.id,
                    title: food.name || food.title,
                    description: food.description || '',
                    price: food.price || 0,
                    imageURL: food.imageURL || food.image || food.imageUrl || null,
                    calories: food.kcal || food.calories || 0,
                    type: food.type || null,
                    inGridients: food.inGridients || [],
                    choiceOfAddOn: food.choiceOfAddOn || [],
                    isAvailable: food.isAvailable !== false,
                    mealType: food.mealType || [],
                }));

                console.log(`[FoodList] Category "${category.name}": ${foods.length} foods mapped`);

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

        console.log('[FoodList] Filtering foods by search text:', searchText);
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
     * LEARNING — scrollToCategory:
     * This is exposed to the parent via useImperativeHandle + forwardRef.
     * When user clicks a tab, parent calls: foodListRef.current.scrollToCategory(2)
     * → This scrolls the page to category index 2.
     *
     * We block the scroll detector for 900ms so it doesn't fight
     * the programmatic scroll and cause flickering.
     */
    useImperativeHandle(ref, () => ({
        scrollToCategory(globalIndex) {
            console.log('[FoodList] scrollToCategory called for index:', globalIndex);
            const section = displaySections.find((s) => s.globalIndex === globalIndex);
            if (!section) return;

            const el = sectionRefs.current[section.categoryId];
            if (!el) return;

            blockUntil.current = Date.now() + 900;
            lastReported.current = globalIndex;

            const top = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
            console.log('[FoodList] Scrolling to y:', top, '(offset:', STICKY_OFFSET, ')');
            window.scrollTo({ top, behavior: 'smooth' });
        },
    }), [displaySections]);

    /**
     * LEARNING — Scroll detection:
     * On every scroll frame, check each section's position.
     * The LAST section whose top is at or above STICKY_OFFSET = the active one.
     *
     * Why "last"? Because as you scroll down, multiple sections might
     * be above the offset line. The lowest one (last in the loop)
     * is the one currently visible at the top.
     */
    const detectActiveSection = useCallback(() => {
        if (Date.now() < blockUntil.current) return;
        if (!onVisibleCategoryChange) return;

        let activeIndex = -1;

        for (const section of displaySections) {
            const el = sectionRefs.current[section.categoryId];
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            if (rect.top <= STICKY_OFFSET + 20) {
                activeIndex = section.globalIndex;
            }
        }

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
        detectActiveSection(); // Initial check

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
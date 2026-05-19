import { useRef, useEffect, useMemo, useImperativeHandle, useCallback } from 'react';

const STICKY_OFFSET = 72;

export default function useFoodListViewModel({
    ref,
    searchText,
    foodItemData,
    onVisibleCategoryChange,
}) {
    const sectionRefs = useRef({});
    const blockUntil = useRef(0);
    const lastReported = useRef(-1);
    const rafId = useRef(null);

    const sections = useMemo(() => {
        if (!foodItemData || foodItemData.length === 0) return [];

        // console.log("foodItemData", foodItemData);

        if (foodItemData[0]?.foodsInCategories?.[0]) {
            const raw = foodItemData[0].foodsInCategories[0];
            console.log('[FoodList] â˜… RAW first food item (ALL backend fields):');
            console.log('  Backend field â†’ UI field mapping:');
            console.log(`  raw._id = "${raw._id}" â†’ id`);
            console.log(`  raw.name = "${raw.name}" â†’ title`);
            console.log(`  raw.price = ${raw.price} â†’ price`);
            console.log(`  raw.kcal = ${raw.kcal} â†’ calories`);
            console.log(`  raw.type = ${raw.type} â†’ type (1=veg, 2=nonveg)`);
            console.log(`  raw.description = "${raw.description}" â†’ description`);
            console.log(`  raw.imageURL = "${raw.imageURL}" â†’ imageURL`);
            console.log(`  raw.inGridients = [${(raw.inGridients || []).join(', ')}] â†’ inGridients`);
            console.log(`  raw.choiceOfAddOn = [${(raw.choiceOfAddOn || []).join(', ')}] â†’ choiceOfAddOn`);
            console.log(`    â†‘ Are these ObjectIDs (strings) or populated objects?`);
            console.log(`    Type of first item: ${typeof raw.choiceOfAddOn?.[0]}`);
            if (raw.choiceOfAddOn?.[0] && typeof raw.choiceOfAddOn[0] === 'object') {
                console.log('    âœ… POPULATED! Has:', Object.keys(raw.choiceOfAddOn[0]));
            } else {
                console.log('    âš ï¸ NOT POPULATED â€” just ObjectID strings. Need backend .populate()');
            }
            console.log(`  raw.isAvailable = ${raw.isAvailable} â†’ isAvailable`);
            console.log(`  raw.mealType = [${(raw.mealType || []).join(', ')}] â†’ mealType`);
            console.log('  Full raw object:', raw);
        }

        return foodItemData
            .map((category, index) => {
                const foods = (category.foodsInCategories || []).map((food) => ({
                    id: food._id || food.id,
                    title: food.name || food.title,
                    description: food.description || '',
                    price: food.price || 0,
                    priceAfterDiscount: food.priceAfterDiscount || food.price,
                    imageURL: food.imageURL || food.image || food.imageUrl || null,
                    calories: food.kcal || food.calories || 0,
                    type: food.type || null,
                    inGridients: food.inGridients || [],
                    choiceOfAddOn: food.choiceOfAddOn || [],
                    choiceOfAddOnDetails: food.choiceOfAddOnDetails || [],
                    isAvailable: food.isAvailable !== false,
                    mealType: food.mealType || [],
                    couponData: food.couponData,
                }));

                console.log(`[FoodList] Category "${category.name}": ${foods.length} foods mapped`);

                return {
                    categoryId: category._id,
                    categoryName: category.name,
                    globalIndex: index,
                    foods,
                };
            })
            .filter((section) => section.foods.length > 0);
    }, [foodItemData]);

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

    useImperativeHandle(ref, () => ({
        scrollToCategory(globalIndex) {
            console.log('[FoodList] scrollToCategory called for index:', globalIndex);
            const section = displaySections.find((item) => item.globalIndex === globalIndex);
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

    useEffect(() => {
        if (!onVisibleCategoryChange) return;

        const handleScroll = () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
            rafId.current = requestAnimationFrame(detectActiveSection);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        detectActiveSection();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [detectActiveSection, onVisibleCategoryChange]);

    return {
        displaySections,
        sectionRefs,
    };
}

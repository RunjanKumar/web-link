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
            const section = displaySections.find((item) => item.globalIndex === globalIndex);
            if (!section) return;

            const el = sectionRefs.current[section.categoryId];
            if (!el) return;

            blockUntil.current = Date.now() + 900;
            lastReported.current = globalIndex;

            const top = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
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

import { useRef, useEffect } from 'react';

export default function useCategoryTabsViewModel({ categories, activeIndex, onCategorySelect }) {
    const scrollRef = useRef(null);
    const tabRefs = useRef({});

    console.log('[CategoryTabs] STEP 9: Rendered with activeIndex:', activeIndex,
        '| categories:', categories?.length || 0);

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
        console.log('[CategoryTabs] Tab clicked:', index, 'â†’ name:', categories?.[index]?.name);
        if (onCategorySelect) {
            onCategorySelect(index);
        }
    };

    return {
        scrollRef,
        tabRefs,
        handleTabClick,
    };
}

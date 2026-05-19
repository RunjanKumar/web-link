import { useRef, useEffect } from 'react';

export default function useCategoryTabsViewModel({ categories, activeIndex, onCategorySelect }) {
    const scrollRef = useRef(null);
    const tabRefs = useRef({});


    useEffect(() => {
        const activeTab = tabRefs.current[activeIndex];
        const container = scrollRef.current;
        if (!activeTab || !container) return;

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

    return {
        scrollRef,
        tabRefs,
        handleTabClick,
    };
}

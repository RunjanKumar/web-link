import { useRef, useCallback } from 'react';
import useCouponViewModel from './couponViewModel';

export default function useOfferSliderViewModel(couponData) {
    const {
        coupons,
        activeIndex,
        totalCoupons,
        goToIndex,
    } = useCouponViewModel(couponData);

    const scrollRef = useRef(null);

    const handleScroll = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;

        const cardWidth = 320 + 20;
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / cardWidth);

        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < totalCoupons) {
            goToIndex(newIndex);
        }
    }, [activeIndex, totalCoupons, goToIndex]);

    const handleDotClick = useCallback((index) => {
        goToIndex(index);
        const container = scrollRef.current;
        if (container) {
            const cardWidth = 320 + 20;
            container.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth',
            });
        }
    }, [goToIndex]);

    return {
        coupons,
        activeIndex,
        totalCoupons,
        scrollRef,
        handleScroll,
        handleDotClick,
    };
}

import { useNavigate } from 'react-router-dom';

export default function useCouponFoodCardViewModel(item) {
    const navigate = useNavigate();
    const isAvailable = item.isAvailable !== false;
    const hasDiscount = item.priceAfterDiscount < item.price;

    const handleNavigate = () => {
        navigate('/food-details', { state: item });
    };

    return {
        isAvailable,
        hasDiscount,
        handleNavigate,
    };
}

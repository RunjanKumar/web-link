import { useNavigate } from 'react-router-dom';

export default function useCouponCardViewModel(coupon) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/coupon-detail', { state: coupon });
    };

    return {
        imageURL: coupon.imageURL,
        handleClick,
    };
}

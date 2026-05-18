import { useNavigate } from "react-router-dom";
import useGlobal from "../hooks/FoodOrder";

export default function useFoodCartButtonViewModel() {
    const navigate = useNavigate();
    const { getFoodCartCount, getFoodCartTotal } = useGlobal();
    const itemCount = getFoodCartCount();
    const total = getFoodCartTotal();

    const handleOpenCart = () => {
        navigate('/cart');
    };

    return {
        itemCount,
        total,
        handleOpenCart,
    };
}

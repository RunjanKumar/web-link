import { useNavigate } from "react-router-dom";

export default function useFoodCardViewModel(item) {
    const navigate = useNavigate();
    const isAvailable = item.isAvailable !== false;

    const handleNavigate = () => {
        navigate("/food-details", { state: item });
    };

    return {
        isAvailable,
        handleNavigate,
    };
}

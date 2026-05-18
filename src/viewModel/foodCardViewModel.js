import { useNavigate } from "react-router-dom";

export default function useFoodCardViewModel(item) {
    const navigate = useNavigate();
    const isAvailable = item.isAvailable !== false;

    const handleNavigate = () => {
        console.log(item, '[FoodCard] Clicked:', item.title);
        console.log('[FoodCard] Navigating to /food-details with state:', item);
        console.log('[FoodCard] â˜… Data being passed to FoodDetails:');
        console.log('  id:', item.id);
        console.log('  title:', item.title);
        console.log('  price:', item.price);
        console.log('  calories:', item.calories);
        console.log('  type:', item.type);
        console.log('  inGridients:', item.inGridients);
        console.log('  choiceOfAddOn:', item.choiceOfAddOn, '(count:', item.choiceOfAddOn?.length, ')');
        console.log('  isAvailable:', item.isAvailable);
        navigate("/food-details", { state: item });
    };

    return {
        isAvailable,
        handleNavigate,
    };
}

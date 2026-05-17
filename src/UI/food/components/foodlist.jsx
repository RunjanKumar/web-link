

import FoodCard from "./foodcard";
import useFoodViewModel from "../../../viewModel/foodViewModel";

export default function FoodList({ searchText, foodItemData, selectedCategory }) {
  console.log('FoodList received selectedCategory:', selectedCategory);
  console.log('FoodList received foodItemData:', foodItemData);

  // Get foods from selected category or all foods
  const getFoods = () => {
    if (selectedCategory?.foodsInCategories) {
      return selectedCategory.foodsInCategories;
    }
    return [];
  };

  // Flatten all foods from all categories if no category selected
  const getAllFoods = () => {
    if (!foodItemData || foodItemData.length === 0) {
      return [];
    }
    return foodItemData.flatMap(category => 
      category.foodsInCategories || []
    );
  };

  const foods = selectedCategory ? getFoods() : getAllFoods();

  // Filter foods by search text if provided
  const filteredFoods = searchText
    ? foods.filter(food =>
        food.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    : foods;

  // Map API food structure to FoodCard structure
  const foodItems = filteredFoods.map(food => ({
    id: food._id || food.id,
    title: food.name || food.title,
    description: food.description || '',
    price: food.price || 0,
    image: food.image || food.imageUrl || 'https://via.placeholder.com/142x131',
    calories: food.calories || 0,
  }));

  // Empty state
  if (foodItems.length === 0) {
    return (
      <div className="mt-8 text-center py-12">
        <p className="text-gray-500">
          {searchText ? 'No food items found' : 'No food available'}
        </p>
      </div>
    );
  }

  // Render food list
  return (
    <div className="mt-8 flex flex-col gap-5">
      {foodItems.map((item) => (
        <FoodCard key={item.id} item={item} />
      ))}
    </div>
  );
}
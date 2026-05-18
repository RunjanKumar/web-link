import { forwardRef } from 'react';
import useFoodListViewModel from '../../../viewModel/foodListViewModel';
import FoodCard from './foodcard';

const FoodList = forwardRef(function FoodList(
    { searchText, foodItemData, onVisibleCategoryChange },
    ref
) {
    const { displaySections, sectionRefs } = useFoodListViewModel({
        ref,
        searchText,
        foodItemData,
        onVisibleCategoryChange,
    });

    if (displaySections.length === 0) {
        return (
            <div className="mt-8 text-center py-12">
                <p className="text-gray-500">
                    {searchText ? 'No food items found' : 'No food available'}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-10">
            {displaySections.map((section) => (
                <div
                    key={section.categoryId}
                    ref={(el) => (sectionRefs.current[section.categoryId] = el)}
                    data-category-index={section.globalIndex}
                >
                    <h3 className="text-[22px] font-bold text-white mb-5 pt-2">
                        {section.categoryName}
                    </h3>

                    <div className="flex flex-col gap-5">
                        {section.foods.map((item) => (
                            <FoodCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
});

export default FoodList;

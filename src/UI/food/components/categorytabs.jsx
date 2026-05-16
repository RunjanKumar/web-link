import { useState } from 'react';
import useFoodViewModel from '../../../viewModel/foodViewModel';

export default function CategoryTabs({ categories, onCategorySelect }) {
//   const { categories } = useFoodViewModel();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleCategoryClick = (index, category) => {
    setSelectedIndex(index);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-semibold mb-5">
        Categories
      </h2>

      <div className="flex gap-4 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories?.map((category, index) => (
          <button
            key={category._id || category.id || index}
            onClick={() => handleCategoryClick(index, category)}
            className={`px-6 py-3 rounded-full text-lg whitespace-nowrap transition-colors duration-200 ${
              selectedIndex === index
                ? "bg-yellow-500 text-black"
                : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
            }`}
          >
            {category.name || category.title || 'Category'}
          </button>
        ))}
      </div>
    </div>
  );
}
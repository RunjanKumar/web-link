import ChevronIcon from '../../../globalComponents/ChevronIcon';
import SubcategoryCard from './SubcategoryCard';
import { formatTime12Hour } from '../../../utils/commonFunction';

export default function CategorySection({ category, isOpen, onToggle, onToggleRequest, isRequested, isAlreadyBooked }) {
    return (
        <div className="mb-4">
            {/* Category header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between bg-[#141414] border border-gray-800/60 rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] group"
            >
                <div className="flex items-center gap-3">
                    {/* Yellow accent bar */}
                    <div className="w-1 h-6 bg-yellow-400 rounded-full" />
                    <div className="text-left">
                        <h3 className="text-white text-base font-bold m-0">{category.name}</h3>
                        {/* From – To time */}
                        <p className="text-gray-500 text-[0.65rem] m-0 mt-0.5">
                            {formatTime12Hour(category.from)} – {formatTime12Hour(category.to)}
                        </p>
                    </div>
                </div>
                <ChevronIcon isOpen={isOpen} />
            </button>

            {/* Collapsible subcategories */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
            >
                <div className="bg-[#111111] rounded-xl border border-gray-800/40 px-3 py-1">
                    {category.subCategoriesIds.map((sub) => (
                        <SubcategoryCard
                            key={sub._id}
                            item={sub}
                            onToggleRequest={onToggleRequest}
                            requested={isRequested(sub._id)}
                            alreadyBooked={isAlreadyBooked?.(sub._id)}
                            disabled={!category.isAvailable}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
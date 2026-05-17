import { Search, X } from "lucide-react";

export default function SearchBar({
  searchText,
  setSearchText,
  isSearchFocused,
  setIsSearchFocused,
}) {
  return (
    <div
      className={`border border-[#3A3A3A] rounded-full px-5 py-4 flex items-center gap-3 ${
        isSearchFocused ? "mt-0" : "mt-8"
      }`}
    >
      {/* Search Icon */}
      <Search className="text-[#8F8F8F]" size={20} />

      {/* Input */}
      <input
        type="text"
        value={searchText}
        placeholder="Search favourite food"
        onFocus={() => setIsSearchFocused(true)}
        onChange={(e) => setSearchText(e.target.value)}
        className="flex-1 bg-transparent outline-none text-white placeholder:text-[#6B6B6B]"
      />

      {/* Close Button */}
      {isSearchFocused && (
        <button
          onClick={() => {
            setIsSearchFocused(false);
            setSearchText("");
          }}
        >
          <X className="text-white" size={18} />
        </button>
      )}
    </div>
  );
}
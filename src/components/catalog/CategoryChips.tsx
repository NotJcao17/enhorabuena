"use client";

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex w-full overflow-x-auto md:flex-wrap md:justify-center pb-4 pt-2 gap-2 md:gap-3 snap-x hide-scrollbar">
      <button
        onClick={() => onSelectCategory(null)}
        className={`shrink-0 snap-start px-5 py-2 rounded-xl text-sm font-bold transition-all border-2 shadow-sm ${
          selectedCategory === null
            ? "bg-primary text-white border-primary shadow-primary/30"
            : "bg-white/90 backdrop-blur-sm text-gray-600 border-primary/20 hover:border-primary/50 hover:text-primary hover:bg-surface-tint"
        }`}
      >
        Todos
      </button>

      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`shrink-0 snap-start px-5 py-2 rounded-xl text-sm font-bold transition-all border-2 shadow-sm ${
              isSelected
                ? "bg-primary text-white border-primary shadow-primary/30"
                : "bg-white/90 backdrop-blur-sm text-gray-600 border-primary/20 hover:border-primary/50 hover:text-primary hover:bg-surface-tint"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

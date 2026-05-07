import { ChevronRight } from "lucide-react";

type Category = {
  name: string;
  slug: string;
  count: number;
};

const categories: Category[] = [
  { name: "All Collections", slug: "all", count: 0 },
  { name: "Eternal Moon", slug: "eternal-moon", count: 3 },
  { name: "Star", slug: "star", count: 1 },
  { name: "Rainbow", slug: "rainbow", count: 1 },
  { name: "Fun Moments", slug: "fun-moments", count: 2 },
  { name: "Trading Card Game", slug: "tcg", count: 2 },
  { name: "Promotional Cards", slug: "promos", count: 3 },
  { name: "Other Kayou Merch", slug: "merch", count: 3 },
];

interface CatalogSidebarProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

const CatalogSidebar = ({
  activeCategory,
  onCategoryChange,
}: CatalogSidebarProps) => {
  return (
    <aside className="w-56 shrink-0 hidden md:block">
      <nav className="space-y-2 p-3 rounded-xl bg-gradient-to-b from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/40 shadow-lg">

        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;

          return (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#f5e6a8]/90 text-[#3b2a1a] font-semibold shadow-inner"
                  : "text-[#f5e6a8]/80 hover:text-[#fff3c4] hover:bg-white/10"
              }`}
            >
              <span>{cat.name}</span>

              {isActive && (
                <ChevronRight className="h-4 w-4 text-[#3b2a1a]" />
              )}
            </button>
          );
        })}

      </nav>
    </aside>
  );
};

export { categories };
export default CatalogSidebar;
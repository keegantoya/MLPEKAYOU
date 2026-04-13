import { useState } from "react";
import { ChevronRight } from "lucide-react";

type Category = {
  name: string;
  slug: string;
  count: number;
};

const categories: Category[] = [
  { name: "All Collections", slug: "all", count: 0 },
  { name: "Eternal Moon Edition", slug: "eternal-moon", count: 3 },
  { name: "Star Edition", slug: "star", count: 1 },
  { name: "Rainbow Edition", slug: "rainbow", count: 2 },
  { name: "Fun Moments Edition", slug: "fun-moments", count: 2 },
  { name: "Trading Card Game", slug: "tcg", count: 3 },
  { name: "Promotional Cards", slug: "promos", count: 5 },
  { name: "Serialized/Limited", slug: "limited", count: 1 },
];

interface CatalogSidebarProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

const CatalogSidebar = ({ activeCategory, onCategoryChange }: CatalogSidebarProps) => {
  return (
    <aside className="w-48 shrink-0 border-r border-border pr-4 hidden md:block">
      <nav className="space-y-1">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onCategoryChange(cat.slug)}
            className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.slug
                ? "bg-primary/10 text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span>{cat.name}</span>
            {activeCategory === cat.slug && (
              <ChevronRight className="h-4 w-4 text-primary" />
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export { categories };
export default CatalogSidebar;

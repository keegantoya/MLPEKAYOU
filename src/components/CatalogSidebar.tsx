import { ChevronRight } from "lucide-react";
type Category = {
  name: string;
  slug: string;
};
const categories: Category[] = [
  { name: "All Collections", slug: "all" },
  { name: "Moon", slug: "eternal-moon" },
  { name: "Star", slug: "star" },
  { name: "Rainbow", slug: "rainbow" },
  { name: "Fun Moments", slug: "fun-moments" },
  { name: "Card Game", slug: "tcg" },
  { name: "Promotional", slug: "promos" },
  { name: "Other", slug: "merch" },
];
interface CatalogSidebarProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  hideMastered: boolean;
  onToggleHideMastered: () => void;
  sortBy: "release" | "set";
  onSortChange: (value: "release" | "set") => void;
}
const CatalogSidebar = ({
  activeCategory,
  onCategoryChange,
  hideMastered,
  onToggleHideMastered,
  sortBy,
  onSortChange,
}: CatalogSidebarProps) => {
  return (
    <aside className="hidden w-52 shrink-0 text-sm md:block">
      <nav className="rounded-[24px] border border-black/10 bg-white p-3 dark:border-white/[0.08] dark:bg-[#151718]">
        <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
          Collections
        </div>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onCategoryChange(cat.slug)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                    : "border-black/10 bg-zinc-50 text-zinc-600 hover:border-[#c89d13]/40 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:border-[#FFD54A]/40 dark:hover:text-white"
                }`}
              >
                <span>{cat.name}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
        <div className="my-3 h-px bg-black/[0.08] dark:bg-white/[0.07]" />
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
          Sort
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onSortChange("release")}
            className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
              sortBy === "release"
                ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                : "border-black/10 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300"
            }`}
          >
            Release
          </button>
          <button
            type="button"
            onClick={() => onSortChange("set")}
            className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
              sortBy === "set"
                ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                : "border-black/10 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300"
            }`}
          >
            Set
          </button>
        </div>
        <button
          type="button"
          onClick={onToggleHideMastered}
          aria-pressed={hideMastered}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-black/10 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300"
        >
          <span>Hide Mastered</span>
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
              hideMastered
                ? "border-[#FFD54A] bg-[#FFD54A]"
                : "border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-all ${
                hideMastered ? "left-[18px]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </nav>
    </aside>
  );
};
export { categories };
export default CatalogSidebar;

import {
  ChevronRight,
} from "lucide-react";

type Category = {
  name: string;
  slug: string;
};

const categories: Category[] = [
  { name: "All Collections", slug: "all" },
  { name: "Eternal Moon", slug: "eternal-moon" },
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
    <aside className="w-56 shrink-0 hidden md:block text-xs">
<nav
  className="rounded-3xl border border-[#FFD400]/20 shadow-[0_20px_50px_rgba(0,0,0,0.55)] p-4 relative overflow-hidden"
  style={{
    background: `
      radial-gradient(circle at top right, rgba(255,212,0,0.08), transparent 35%),
      radial-gradient(circle at bottom left, rgba(255,212,0,0.04), transparent 40%),
      linear-gradient(
        180deg,
        #1b1b1b 0%,
        #171717 45%,
        #101010 100%
      )
    `,
  }}
>
  <div
    className="absolute inset-0 pointer-events-none opacity-20"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255,212,0,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,212,0,0.05) 1px, transparent 1px)
      `,
      backgroundSize: "28px 28px",
    }}
  />

        {/* SECTION TITLE */}
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFD400]">
  Browse Collections
</h3>

        {/* CATEGORY LIST */}
        <div className="space-y-1 mb-6">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const Icon = cat

            return (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className={`group w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
  isActive
    ? "bg-[#f5e6a8] text-[#111111] border border-[#FFD400] shadow-[0_0_20px_rgba(255,212,0,.35)]"
    : "bg-[#181818] border border-[#FFD400]/10 text-white/80 hover:border-[#FFD400]/40 hover:bg-[#202020]"
}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  
                  <span className="truncate text-left font-medium text-[12px] leading-tight">
  {cat.name}
</span>
                </div>

                <div className="shrink-0" />
              </button>
            );
          })}
        </div>

        {/* FILTERS TITLE */}
       <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFD400] border-t border-[#FFD400]/15 pt-4">
  Filters
</h3>

{/* SORT BY */}
<div className="mb-4">
<label className="block mb-2 text-xs font-medium text-white/60">
  Sort By
</label>

  <div className="space-y-2">
    <button
      type="button"
      onClick={() => onSortChange("release")}
className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
  sortBy === "release"
    ? "bg-[#f5e6a8] text-[#111111] border border-[#FFD400] shadow-[0_0_20px_rgba(255,212,0,.35)]"
    : "bg-[#181818] border border-[#FFD400]/10 text-white/80 hover:border-[#FFD400]/40 hover:bg-[#202020]"
}`}
    >
      <span>Release Order</span>
      {sortBy === "release" && (
        <ChevronRight className="h-4 w-4 text-[#111111]" />
      )}
    </button>

    <button
      type="button"
      onClick={() => onSortChange("set")}
      className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        sortBy === "set"
          ? "bg-gradient-to-r from-[#f6e1a0] to-[#e5c56b] text-[#3b2a1a] shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
          : "bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.06]"
      }`}
    >
      <span>Set Order</span>
      {sortBy === "set" && (
        <ChevronRight className="h-4 w-4 text-[#111111]" />
      )}
    </button>
  </div>
</div>

{/* HIDE MASTERED TOGGLE */}
<div className="flex items-center justify-between">
<span className="text-sm font-medium text-white/85">
  Hide Mastered Sets
</span>

  <button
    type="button"
    onClick={onToggleHideMastered}
    aria-pressed={hideMastered}
className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all duration-200 ${
  hideMastered
    ? "bg-[#FFD400] border-[#FFD400]"
    : "bg-[#202020] border-[#FFD400]/20"
}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-transform duration-200 ${
        hideMastered ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
</div>
      </nav>
    </aside>
  );
};

export { categories };
export default CatalogSidebar;
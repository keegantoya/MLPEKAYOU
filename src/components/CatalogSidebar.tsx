import {
  Search,
  LayoutGrid,
  Circle,
  Star,
  Rainbow,
  FlaskConical,
  Gamepad2,
  BadgePercent,
  Package,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import fluttershyCutieMark from "/website-assets/fluttershycutiemark.webp";
import applejackCutieMark from "/website-assets/applejackcutiemark.webp";
import pinkiePieCutieMark from "/website-assets/pinkiecutiemark.webp";
import rainbowDashCutieMark from "/website-assets/rainbowdashcutiemark.webp";
import rarityCutieMark from "/website-assets/raritycutiemark.webp";
import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.webp";

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
  className="rounded-3xl border border-[#d4af37]/25 shadow-[0_25px_60px_rgba(90,62,132,0.28)] p-4 relative overflow-hidden"
  style={{
    backgroundColor: "#6b4b99",
    backgroundImage: `
      linear-gradient(rgba(107, 75, 153, 0.58), rgba(90, 62, 132, 0.62)),
      url(${applejackCutieMark}),
      url(${twilightSparkleCutieMark}),
      url(${rainbowDashCutieMark}),
      url(${fluttershyCutieMark}),
      url(${pinkiePieCutieMark}),
      url(${rarityCutieMark}),
      url(${applejackCutieMark}),
      url(${twilightSparkleCutieMark}),
      url(${rainbowDashCutieMark}),
      url(${fluttershyCutieMark}),
      url(${pinkiePieCutieMark}),
      url(${rarityCutieMark}),
      url(${applejackCutieMark}),
      url(${twilightSparkleCutieMark}),
      url(${rainbowDashCutieMark}),
      linear-gradient(
        180deg,
        #7c5aa6 0%,
        #6b4b99 45%,
        #5a3e84 100%
      )
    `,
    backgroundRepeat: `
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat,
      no-repeat
    `,
    backgroundPosition: `
      center,
      6% 8%,
      82% 6%,
      18% 22%,
      74% 20%,
      10% 38%,
      84% 34%,
      22% 50%,
      70% 48%,
      8% 62%,
      86% 60%,
      18% 74%,
      74% 76%,
      12% 90%,
      82% 88%,
      48% 58%,
      center
    `,
    backgroundSize: `
      cover,
      72px,
      78px,
      68px,
      74px,
      66px,
      70px,
      72px,
      78px,
      68px,
      74px,
      66px,
      70px,
      72px,
      78px,
      68px,
      cover
    `,
  }}
>

        {/* SECTION TITLE */}
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5c86d]">
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
                className={`group w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#f6e1a0] to-[#e5c56b] text-[#3b2a1a] shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                    : "text-white/85 hover:bg-white/[0.05] hover:text-white"
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
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5c86d] border-t border-white/10 pt-4">
          Filters
        </h3>

{/* SORT BY */}
<div className="mb-4">
  <label className="block mb-2 text-xs font-medium text-white/65">
    Sort By
  </label>

  <div className="space-y-2">
    <button
      type="button"
      onClick={() => onSortChange("release")}
      className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        sortBy === "release"
          ? "bg-gradient-to-r from-[#f6e1a0] to-[#e5c56b] text-[#3b2a1a] shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
          : "bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.06]"
      }`}
    >
      <span>Release Order</span>
      {sortBy === "release" && (
        <ChevronRight className="h-4 w-4 text-[#6b4b12]" />
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
        <ChevronRight className="h-4 w-4 text-[#6b4b12]" />
      )}
    </button>
  </div>
</div>

{/* HIDE MASTERED TOGGLE */}
<div className="flex items-center justify-between">
  <span className="text-sm font-medium text-white/80">
    Hide Mastered Sets
  </span>

  <button
    type="button"
    onClick={onToggleHideMastered}
    aria-pressed={hideMastered}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all duration-200 focus:outline-none ${
      hideMastered
        ? "bg-[#7c5aa6] border-[#a98bd1]"
        : "bg-white/10 border-white/15"
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
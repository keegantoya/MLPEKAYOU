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
<div className="mb-4 flex items-center gap-2 border-b border-[#252b2f] pb-3">
  <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_7px_#E7C84B]" />

  <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#E7C84B]">
    Browse Collections
  </h3>

  <span className="ml-auto font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-700">
    NAV
  </span>
</div>

{/* CATEGORY LIST */}
<div className="mb-6 space-y-1">

  {categories.map((cat, index) => {
    const isActive = activeCategory === cat.slug;

    return (
      <button
        key={cat.slug}
        onClick={() => onCategoryChange(cat.slug)}
        className={`group relative flex w-full items-center overflow-hidden border px-3 py-2.5 text-left transition-all duration-200 ${
          isActive
            ? "border-[#E7C84B] bg-[#E7C84B] text-[#090b0c] shadow-[0_0_18px_rgba(231,200,75,.18)]"
            : "border-[#30363a] bg-[#101518] text-zinc-400 hover:border-[#E7C84B]/70 hover:bg-[#13191c] hover:text-white"
        }`}
      >

        {/* Active indicator */}
        <span
          className={`mr-3 h-1.5 w-1.5 shrink-0 ${
            isActive
              ? "bg-[#090b0c]"
              : "bg-[#E7C84B]/30 group-hover:bg-[#E7C84B]"
          }`}
        />

        <span className="min-w-0 flex-1 truncate font-mono text-[9px] font-bold uppercase tracking-[0.16em]">
          {cat.name}
        </span>

        <span
          className={`ml-3 font-mono text-[7px] tracking-[0.12em] ${
            isActive
              ? "text-[#090b0c]/50"
              : "text-zinc-700 group-hover:text-[#E7C84B]/60"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* HUD corner */}
        {isActive && (
          <>
            <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[#090b0c]/50" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[#090b0c]/30" />
          </>
        )}

      </button>
    );
  })}

</div>


{/* SORT BY */}
<div className="mb-4">
  <div className="mb-2 flex items-center gap-2">
    <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_7px_#E7C84B]" />

    <label className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#E7C84B]">
      Sort By
    </label>

    <span className="ml-auto font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-700">
      ORDER
    </span>
  </div>

  <div className="space-y-2">


{/* SORT BY */}

<div className="space-y-1">
  <button
    type="button"
    onClick={() => onSortChange("release")}
    className={`group relative flex w-full items-center justify-between overflow-hidden border px-4 py-3 text-left transition-all duration-200 ${
      sortBy === "release"
        ? "border-[#E7C84B] bg-[#E7C84B] text-[#090b0c] shadow-[0_0_18px_rgba(231,200,75,.16)]"
        : "border-[#30363a] bg-[#101518] text-zinc-400 hover:border-[#E7C84B]/70 hover:bg-[#13191c] hover:text-white"
    }`}
  >
    <span className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 ${
          sortBy === "release"
            ? "bg-[#090b0c]"
            : "bg-[#E7C84B]/30 group-hover:bg-[#E7C84B]"
        }`}
      />

      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
        Release Order
      </span>
    </span>

    {sortBy === "release" && (
      <ChevronRight className="h-4 w-4" />
    )}
  </button>

  <button
    type="button"
    onClick={() => onSortChange("set")}
    className={`group relative flex w-full items-center justify-between overflow-hidden border px-4 py-3 text-left transition-all duration-200 ${
      sortBy === "set"
        ? "border-[#E7C84B] bg-[#E7C84B] text-[#090b0c] shadow-[0_0_18px_rgba(231,200,75,.16)]"
        : "border-[#30363a] bg-[#101518] text-zinc-400 hover:border-[#E7C84B]/70 hover:bg-[#13191c] hover:text-white"
    }`}
  >
    <span className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 ${
          sortBy === "set"
            ? "bg-[#090b0c]"
            : "bg-[#E7C84B]/30 group-hover:bg-[#E7C84B]"
        }`}
      />

      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
        Set Order
      </span>
    </span>

    {sortBy === "set" && (
      <ChevronRight className="h-4 w-4" />
    )}
  </button>
</div>
  </div>
</div>

{/* HIDE MASTERED TOGGLE */}

<button
  type="button"
  onClick={onToggleHideMastered}
  aria-pressed={hideMastered}
  className={`group relative flex h-11 w-full items-center justify-between overflow-hidden border px-4 transition-all duration-200 ${
    hideMastered
      ? "border-[#E7C84B] bg-[#E7C84B]/10"
      : "border-[#30363a] bg-[#101518] hover:border-[#E7C84B]/60 hover:bg-[#13191c]"
  }`}
>
  <span
    className={`font-mono text-[9px] font-bold uppercase tracking-[0.18em] ${
      hideMastered
        ? "text-[#E7C84B]"
        : "text-zinc-500 group-hover:text-white"
    }`}
  >
    Hide Mastered
  </span>

  <span
    className={`relative flex h-5 w-9 shrink-0 items-center border transition-all duration-200 ${
      hideMastered
        ? "border-[#E7C84B] bg-[#E7C84B]"
        : "border-[#454c50] bg-[#171c1f]"
    }`}
  >
    <span
      className={`absolute left-0.5 h-3.5 w-3.5 transition-transform duration-200 ${
        hideMastered
          ? "translate-x-[16px] bg-[#090b0c]"
          : "translate-x-0 bg-zinc-500"
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
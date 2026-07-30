import { useState, useEffect, useMemo } from "react";
import CatalogSidebar from "@/components/CatalogSidebar";
import CollectionCard from "@/components/CollectionCard";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

type Collection = {
  id: string;
  title: string;
  setName: string;
  imageUrl: string;
  totalCards: number;
  category: string;
  progress?: number;
  collectedCards?: number;
  released: boolean;
};

const collections: Collection[] = [
  {
    id: "1",
    title: "Eternal Moon",
    setName: "One",
    imageUrl: "/thumbnails/moon-fe.webp",
    totalCards: 186,
    category: "eternal-moon",
     released: true,
  },
   {
    id: "5",
    title: "Rainbow",
    setName: "One",
    imageUrl: "/thumbnails/rainbow1thumbnail.webp",
    totalCards: 146,
    category: "rainbow",
    released: true,
  },
  {
    id: "7",
    title: "Fun Moments",
    setName: "One",
    imageUrl: "/thumbnails/fme01TN.webp",
    totalCards: 127,
    category: "fun-moments",
    released: true,
  },
  {
    id: "2",
    title: "Eternal Moon",
    setName: "Two",
    imageUrl: "/thumbnails/moon-se.webp",
    totalCards: 189,
    category: "eternal-moon",
    released: true,
  },
  {
    id: "8",
    title: "Fun Moments",
    setName: "Two",
    imageUrl: "/thumbnails/fme02TN.webp",
    totalCards: 136,
    category: "fun-moments",
    released: true,
  },
  {
    id: "tcg",
    title: "Fantasy",
    setName: "Wonderland",
    imageUrl: "/thumbnails/fantasy-wonderland-thumbnail.webp",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
  {
    id: "friendshipsbegin",
    title: "Friendships",
    setName: "Begin",
    imageUrl: "/thumbnails/friendship-begins-thumbnail.webp",
    totalCards: 194,
    category: "tcg",
    released: true,
  },
  {
    id: "3",
    title: "Eternal Moon",
    setName: "Three",
    imageUrl: "/thumbnails/moon-te.webp",
    totalCards: 290,
    category: "eternal-moon",
    released: true,
  },
   {
    id: "11",
    title: "Fun Moments",
    setName: "Three",
    imageUrl: "/thumbnails/fme03TN.webp",
    totalCards: 148,
    category: "fun-moments",
    released: true,
  },
  {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/s1-thumbnail.webp",
    totalCards: 105,
    category: "star",
    released: true,
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbow2thumbnail.webp",
    totalCards: 170,
    category: "rainbow",
    released: true,
  },
     {
    id: "12",
    title: "Discord",
    setName: "TCG",
    imageUrl: "/thumbnails/discord.webp",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
  {
    id: "9",
    title: "Promotional",
    setName: "Cards",
    imageUrl: "/thumbnails/promos-thumbnail.webp",
    totalCards: 30,
    category: "promos",
    released: true,
  },
{
    id: "OTHERMERCH",
    title: "Kayou US",
    setName: "Leaping Ponies",
    imageUrl: "/thumbnails/other-merch-tn.webp",
    totalCards: 6,
    category: "merch",
     released: true,
  },
];

const unreleasedSetIds = [
];

const Collections = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(
  location.state?.category || "all"
);
  const [sets, setSets] = useState<Collection[]>([]);
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [hideMastered, setHideMastered] = useState(true);
  const [sortBy, setSortBy] = useState<"release" | "set">("release");
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  useEffect(() => {
    const load = async (userOverride?: any) => {
      let user = userOverride;

if (!user) {
  const { data } = await supabase.auth.getSession();
  user = data.session?.user;
}

      if (!user) {
        setSets(
          collections.map((set) => ({
            ...set,
            progress: 0,
            collectedCards: 0,
          }))
        );
        return;
      }

const { data: rawData } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", user.id);

const { data: progressData } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);

const mergedBySet: Record<string, Record<string, boolean>> = {};

[...(rawData || []), ...(progressData || [])].forEach((row: any) => {
  if (!mergedBySet[row.set_id]) {
    mergedBySet[row.set_id] = {};
  }

Object.entries(row.progress || {}).forEach(([key, value]) => {
  const isOwned =
    value === true ||
    (typeof value === "object" &&
      value !== null &&
      (value as any).owned === true);

  if (isOwned) {
    mergedBySet[row.set_id][key] = true;
  }
});
});

const progressMap: Record<string, number> = {};

Object.entries(mergedBySet).forEach(([setId, progress]) => {
  const count = Object.keys(progress).length;

  switch (setId) {
    case "FW":
      progressMap["tcg"] = count;
      break;

    case "SD":
      progressMap["friendshipsbegin"] = count;
      break;

    case "OTHERMERCH":
      progressMap["OTHERMERCH"] = count;
      break;

    case "9":
      progressMap["9"] = count;
      break;

    case "tcgpromos":
      progressMap["9"] = (progressMap["9"] || 0) + count;
      break;

    default:
      progressMap[setId] = count;
  }
});
const { data: profile } = await supabase
  .from("profiles")
  .select(
    "iso_hidden_sets, iso_hidden_sets"
  )
  .eq("id", user.id)
  .single();

const legacyHidden = profile?.iso_hidden_sets || [];

const hiddenCCG =
  profile?.iso_hidden_sets?.length
    ? profile.iso_hidden_sets
    : legacyHidden;

const hiddenTCG =
  profile?.iso_hidden_sets?.length
    ? profile.iso_hidden_sets
    : legacyHidden;

// Convert stored hidden IDs to the collection IDs used on this page
const mappedHiddenSets: string[] = [
  ...hiddenCCG.flatMap((id: string) => {
    switch (id) {
      case "SD":
      case "SD_STARTERS":
      case "SD_BONUS":
        return ["friendshipsbegin"];

      default:
        return [id];
    }
  }),

  ...hiddenTCG.flatMap((id: string) => {
    switch (id) {
      case "FW":
        return ["tcg"];

      case "SD":
      case "SD_STARTERS":
      case "SD_BONUS":
        return ["friendshipsbegin"];

      case "TCG_PROMOS":
        return ["tcgpromos"];

      default:
        return [id];
    }
  }),
];

setHiddenSets([...new Set(mappedHiddenSets)]);
const updated = collections.map((set) => {
  let collected = progressMap[set.id] || 0;

  const percent =
    set.totalCards > 0
      ? Math.round((collected / set.totalCards) * 100)
      : 0;

  return {
    ...set,
    collectedCards: collected,
    progress: percent,
  };
});

setSets(updated);
    };

    load();

    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  load(session?.user);
});

    return () => subscription.unsubscribe();
  }, []);

const setOrder: Record<string, number> = {
  star: 1,
  "eternal-moon": 2,
  rainbow: 3,
  "fun-moments": 4,
  tcg: 5,
  promos: 6,
  merch: 7,
};

const filtered = (
  activeCategory === "all"
    ? sets
        .filter((c) => c.category !== "merch")
        .filter((c) => !hideMastered || c.progress !== 100)
        .filter((c) => !hiddenSets.includes(c.id))
    : sets
        .filter((c) => c.category === activeCategory)
)
  .filter((c) => c.released)
  .sort((a, b) => {
    // SET ORDER
    if (sortBy === "set") {
      const categoryDiff =
        (setOrder[a.category] ?? 999) - (setOrder[b.category] ?? 999);

      if (categoryDiff !== 0) {
        return categoryDiff;
      }
    }

    return (
      collections.findIndex((s) => s.id === a.id) -
      collections.findIndex((s) => s.id === b.id)
    );
  });
  return (
<div
  className="min-h-screen relative overflow-hidden font-['Oxanium']"
  style={{
    backgroundColor: "#0f0f0f",
    backgroundImage: `
      radial-gradient(circle at top, rgba(255,212,0,0.06) 0%, transparent 35%),
      radial-gradient(circle at bottom right, rgba(255,212,0,0.03) 0%, transparent 30%),
      linear-gradient(
        180deg,
        #1b1b1b 0%,
        #151515 35%,
        #101010 70%,
        #0a0a0a 100%
      )
    `,
  }}
>

<div
  className="absolute inset-0 pointer-events-none opacity-30"
  style={{
    backgroundImage: `
      linear-gradient(rgba(255,212,0,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,212,0,0.05) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)",
    WebkitMaskImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)",
  }}
/>

     {/* MOBILE CATEGORY BAR */}
<div className="md:hidden px-4 pt-6 pb-3 overflow-x-auto scrollbar-hide">
  <div className="flex gap-2 min-w-max">

    {[
      { label: "All", value: "all" },
      { label: "Star", value: "star" },
      { label: "Moon", value: "eternal-moon" },
      { label: "Rainbow", value: "rainbow" },
      { label: "Fun", value: "fun-moments" },
      { label: "TCG", value: "tcg" },
      { label: "Promos", value: "promos" },
      { label: "Merch", value: "merch" },
    ].map((item) => (
      <button
        key={item.value}
        onClick={() => setActiveCategory(item.value)}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-200 border ${
          activeCategory === item.value
            ? "bg-[#FFD400] text-[#111111] border-[#FFD400] shadow-[0_0_16px_rgba(255,212,0,0.35)]"
            : "bg-[#181818] text-white border-[#FFD400]/15 hover:border-[#FFD400]/40"
        }`}
      >
        {item.label}
      </button>
    ))}

  </div>
</div>

{/* Mobile Collections Hero */}
<div className="md:hidden px-4 pt-4 mb-4">
  {(() => {
    const releasedSets = sets.filter(
  (set) =>
    set.released &&
    set.category !== "merch" &&
    !hiddenSets.includes(set.id)
);

    const countedSets = releasedSets.filter(
  (set) => !["9", "tcgpromos"].includes(set.id)
);

const totalSets = countedSets.length;

const completedSets = countedSets.filter(
  (set) => set.progress === 100
).length;

    const totalCardsCollected = releasedSets.reduce(
      (sum, set) => sum + (set.collectedCards || 0),
      0
    );

    const totalCardsAvailable = releasedSets.reduce(
      (sum, set) => sum + set.totalCards,
      0
    );

    const completionRate =
      totalCardsAvailable > 0
        ? Math.round((totalCardsCollected / totalCardsAvailable) * 100)
        : 0;

    return (
      <div
  className="relative overflow-hidden rounded-[2rem] border border-[#d4af37]/30 px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
  style={{
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>

  <div className="absolute inset-0 bg-black/35 pointer-events-none" />

<div className="relative z-10">
  {/* Stats */}
  <div className="grid grid-cols-3 gap-3 text-center">
    {[
      { value: `${completedSets}/${totalSets}`, label: "SETS FINISHED" },
      {
        value: totalCardsCollected.toLocaleString(),
        label: "CARDS COLLECTED",
      },
      { value: `${completionRate}%`, label: "COMPLETE" },
    ].map((stat) => (
      <div key={stat.label}>
        <div className="text-lg font-bold leading-none text-[#f5e6a8] whitespace-nowrap">
          {stat.value}
        </div>
        <div className="mt-1 text-[8px] uppercase tracking-[0.14em] font-semibold text-[#f5e6a8]/80">
          {stat.label}
        </div>
      </div>
    ))}
  </div>

  {/* Progress Bar */}
  <div className="mt-3">
    <div className="h-3 rounded-full bg-white/15 overflow-hidden shadow-inner">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#f5e6a8] via-[#d4af37] to-[#b8962e]"
        style={{
          width: `${completionRate}%`,
        }}
      />
    </div>

    <div className="mt-2 text-center text-[11px] font-semibold tracking-wide text-[#f5e6a8]/90">
      {totalCardsCollected.toLocaleString()} /{" "}
      {totalCardsAvailable.toLocaleString()} Cards Collected
    </div>
  </div>

  {/* Title */}
  <div className="mt-4">
<h1
  className="font-['Oxanium'] text-4xl font-semibold leading-[0.95] tracking-[0.06em] text-[#f5e6a8] text-center"
  style={{
    textShadow:
      "0 2px 0 rgba(91,46,134,0.45), 0 4px 18px rgba(0,0,0,0.22)",
  }}
>
      <span className="block">KAYOU US</span>
      <span className="block">COLLECTIONS</span>
    </h1>
  </div>
</div>
      </div>
    );
  })()}
</div>


<div className="container mt-6 md:mt-6 pt-0 pb-24 md:pb-8">

{/* FULL-WIDTH TITLE HERO */}
<div className="hidden sm:block mb-0">
  {(() => {
    const releasedSets = sets.filter(
  (set) =>
    set.released &&
    set.category !== "merch" &&
    !hiddenSets.includes(set.id)
);

    const countedSets = releasedSets.filter(
  (set) => !["9", "tcgpromos"].includes(set.id)
);

const totalSets = countedSets.length;

const completedSets = countedSets.filter(
  (set) => set.progress === 100
).length;

    const totalCardsCollected = releasedSets.reduce(
      (sum, set) => sum + (set.collectedCards || 0),
      0
    );

    const totalCardsAvailable = releasedSets.reduce(
      (sum, set) => sum + set.totalCards,
      0
    );

    const completionRate =
      totalCardsAvailable > 0
        ? Math.round((totalCardsCollected / totalCardsAvailable) * 100)
        : 0;

    return (
<div
  className="w-full rounded-[2rem] overflow-hidden border border-[#FFD400]/20 shadow-[0_20px_60px_rgba(0,0,0,0.65)] px-8 pt-4 pb-20 relative"
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
    className="absolute inset-0 pointer-events-none opacity-25"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255,212,0,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,212,0,0.05) 1px, transparent 1px)
      `,
      backgroundSize: "42px 42px",
    }}
  />
  
{/* Main content */}
<div className="relative z-10 grid grid-cols-3 items-center translate-y-7">

  {/* LEFT: Stats */}
  <div className="flex justify-center w-full">
    <div className="inline-grid grid-cols-3 gap-4 mx-auto">
      {[
        { value: `${completedSets}/${totalSets}`, label: "SETS" },
        {
          value: totalCardsCollected.toLocaleString(),
          label: "CARDS",
        },
        {
          value: `${completionRate}%`,
          label: "COMPLETE",
        },
      ].map((stat) => (
       <div
  key={stat.label}
  className="relative min-w-[110px] rounded-xl border border-[#FFD400]/20 bg-[#181818]/80 backdrop-blur-sm px-4 py-4 flex flex-col items-center justify-center text-center"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255,212,0,.03), 0 0 18px rgba(255,212,0,.05)",
          }}
        >
          <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-[#FFD400]/70" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-[#FFD400]/70" />

          <div className="text-2xl font-black tracking-wide text-[#f5e6a8] leading-none text-center w-full">
            {stat.value}
          </div>

          <div className="mt-2 text-[9px] uppercase tracking-[0.28em] font-semibold text-[#f5e6a8]/65 text-center w-full">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* CENTER: Title */}
  <div className="flex justify-center">
<h1
  className="font-['Oxanium'] text-4xl font-semibold leading-[0.95] tracking-[0.06em] text-[#f5e6a8] text-center"
  style={{
    textShadow:
      "0 2px 0 rgba(91,46,134,0.45), 0 4px 18px rgba(0,0,0,0.22)",
  }}
>
      <span className="block">KAYOU US</span>
      <span className="block">COLLECTIONS</span>
    </h1>
  </div>

  {/* RIGHT: Progress */}
  <div className="flex items-center justify-center h-full">
    <div className="w-full max-w-[360px] rounded-xl border border-[#FFD400]/20 bg-[#181818]/80 px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.35em] font-semibold text-[#FFD400]/70">
          COLLECTION PROGRESS
        </span>

        <span className="text-sm font-bold text-[#FFD400]">
          {completionRate}%
        </span>
      </div>

      <div className="h-2 rounded-full overflow-hidden bg-[#0d0d0d] border border-[#FFD400]/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FFD400] via-[#f5e6a8] to-[#FFB800]"
          style={{
            width: `${completionRate}%`,
            boxShadow: "0 0 12px rgba(255,212,0,.5)",
          }}
        />
      </div>

      <div className="mt-4 text-center text-[11px] tracking-[0.15em] font-semibold text-white/75">
        <span className="text-[#FFD400]">
          {totalCardsCollected.toLocaleString()}
        </span>{" "}
        / {totalCardsAvailable.toLocaleString()} CARDS
      </div>
    </div>
  </div>
</div>
      </div>
    );
  })()}
</div>
  {/* SIDEBAR + COLLECTIONS */}
  <div className="flex gap-8 pt-6">

    {/* Sidebar wrapper */}
    <div className="hidden md:block p-4">
      <CatalogSidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        hideMastered={hideMastered}
        onToggleHideMastered={() => setHideMastered((prev) => !prev)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </div>

    <main className="flex-1">


{activeCategory === "all" && (
  <p className="hidden sm:block mt-4 mb-6 text-sm md:text-base text-[#555] leading-relaxed">
  </p>
)}

          {activeCategory === "" ? (
            <div className="flex items-center justify-center py-20">
            </div>
          ) : (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
  {filtered.map((col) => {
    const isHidden = hiddenSets.includes(col.id);

      const isMastered = col.progress === 100;
    const waitingOnKayouIds = [
      
    ];

    const isUnreleased = unreleasedSetIds.includes(col.id);
    const isWaiting = waitingOnKayouIds.includes(col.id);

    return (
      <div key={col.id} className="relative">

        

        {/* Card */}
<div
  className={`cursor-pointer ${
    isUnreleased || isWaiting
      ? "opacity-50 grayscale pointer-events-none"
      : isHidden
      ? "opacity-50 grayscale"
      : ""
  }`}
>
  <CollectionCard {...col} />
          {(col.id === "3" || col.id === "11" || col.id === "6" || col.id === "4") && (
  <div
    className="
      absolute
      top-12
      right-2
      z-20
      bg-gradient-to-r
      from-[#fff2a6]
      via-[#d4af37]
      to-[#fff2a6]
      text-[#5a3e00]
      text-[9px]
      font-black
      tracking-[0.22em]
      px-2.5
      py-1
      rounded-full
      border
      border-[#fff7c7]
      shadow-[0_4px_10px_rgba(212,175,55,0.45)]
      pointer-events-none
    "
  >
    NEW
  </div>
)}
        </div>

{/* SET HIDDEN */}
{isHidden && !isUnreleased && !isWaiting && (
  <div className="absolute inset-0 flex items-center justify-center translate-y-5 pointer-events-none">
    <div className="rounded-xl border border-[#FFD400]/30 bg-[#111111]/90 backdrop-blur-sm px-4 py-2 shadow-[0_0_18px_rgba(255,212,0,0.2)]">
      <span className="font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFD400]">
        MARKED AS NOT COLLECTING IN YOUR ISO
      </span>
    </div>
  </div>
)}

        {/* MASTERSET */}
{isMastered && !isHidden && !isUnreleased && !isWaiting && (
  <div className="absolute inset-0 flex items-center justify-center translate-y-5 pointer-events-none">
    <div
  className="text-[11px] sm:text-[10px] md:text-[10px] font-semibold px-7 py-3 sm:px-3 sm:py-1.5 rounded-md shadow tracking-wide text-center flex items-center justify-center border border-[#5a3e84]/50"
  style={{
    background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)",
    color: "#3b2a1a"
  }}
>
  <span className="block text-center w-full">FULLY MASTERED</span>
</div>
  </div>
)}

      </div>
    );
  })}
</div>
          )}

        </main>
      </div>
</div>
    </div>
  );
};

export default Collections;
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
    title: "Moon",
    setName: "One",
    imageUrl: "/thumbnails/moononesetimage.webp",
    totalCards: 186,
    category: "eternal-moon",
     released: true,
  },
   {
    id: "5",
    title: "Rainbow",
    setName: "One",
    imageUrl: "/thumbnails/rainbowonesetimage.webp",
    totalCards: 146,
    category: "rainbow",
    released: true,
  },
  {
    id: "7",
    title: "Fun Moments",
    setName: "One",
    imageUrl: "/thumbnails/funonesetimage.webp",
    totalCards: 127,
    category: "fun-moments",
    released: true,
  },
  {
    id: "2",
    title: "Moon",
    setName: "Two",
    imageUrl: "/thumbnails/moontwosetimage.webp",
    totalCards: 189,
    category: "eternal-moon",
    released: true,
  },
  {
    id: "8",
    title: "Fun Moments",
    setName: "Two",
    imageUrl: "/thumbnails/funtwosetimage.webp",
    totalCards: 136,
    category: "fun-moments",
    released: true,
  },
  {
    id: "tcg",
    title: "Fantasy Wonderland",
    setName: "TCG",
    imageUrl: "/thumbnails/fantasysetimage.webp",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
  {
    id: "friendshipsbegin",
    title: "Friendships Begin",
    setName: "TCG",
    imageUrl: "/thumbnails/friendshipsbeginsetimage.webp",
    totalCards: 194,
    category: "tcg",
    released: true,
  },
  {
    id: "3",
    title: "Moon",
    setName: "Three",
    imageUrl: "/thumbnails/moonthreesetimage.webp",
    totalCards: 290,
    category: "eternal-moon",
    released: true,
  },
   {
    id: "11",
    title: "Fun Moments",
    setName: "Three",
    imageUrl: "/thumbnails/funthreesetimage.webp",
    totalCards: 148,
    category: "fun-moments",
    released: true,
  },
  {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/staronesetimage.webp",
    totalCards: 105,
    category: "star",
    released: true,
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbowtwosetimage.webp",
    totalCards: 170,
    category: "rainbow",
    released: true,
  },
     {
    id: "12",
    title: "Discord",
    setName: "TCG",
    imageUrl: "/thumbnails/discordsetimage.webp",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
{
  id: "9",
  title: "Promos",
  setName: "Promotional Cards",
  imageUrl: "/thumbnails/promossetimage.webp",
  totalCards: 30,
  category: "promos",
  released: true,
},
{
    id: "OTHERMERCH",
    title: "Kayou US",
    setName: "Leaping Ponies",
    imageUrl: "/thumbnails/plushiessetimage.webp",
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
  progressMap["tcgpromos"] = count;
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
case "tcgpromos":
  return ["tcgpromos"];
  return ["TCG_PROMOS"];

      default:
        return [id];
    }
  }),
];

setHiddenSets([...new Set(mappedHiddenSets)]);
const updated = collections.map((set) => {
  let collected = progressMap[set.id] || 0;
  let totalCards = set.totalCards;

  // PROMOS = set 9 (12 CCG promo cards) + tcgpromos (18 TCG promo cards)
  // They share the Promos card, but remain separate for hidden-set logic.
if (set.id === "9") {
  const ccgPromosHidden = mappedHiddenSets.includes("9");
  const tcgPromosHidden = mappedHiddenSets.includes("tcgpromos");

  const ccgCollected = progressMap["9"] || 0;
  const tcgCollected = progressMap["tcgpromos"] || 0;

  const visibleCCGCollected = ccgPromosHidden
    ? 0
    : Math.min(ccgCollected, 12);

  const visibleTCGCollected = tcgPromosHidden
    ? 0
    : Math.min(tcgCollected, 18);

  const visibleCCGTotal = ccgPromosHidden ? 0 : 12;
  const visibleTCGTotal = tcgPromosHidden ? 0 : 18;

  collected = visibleCCGCollected + visibleTCGCollected;
  totalCards = visibleCCGTotal + visibleTCGTotal;
}

  const percent =
    totalCards > 0
      ? Math.round((collected / totalCards) * 100)
      : 0;

  return {
    ...set,
    collectedCards: collected,
    totalCards,
    progress: percent,
  };
});

setSets(updated);

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
    className="relative min-h-screen overflow-hidden font-['Oxanium'] text-white"
    style={{
      backgroundColor: "#07090a",
      backgroundImage: `
        radial-gradient(circle at 50% -15%, rgba(231,200,75,0.10), transparent 28%),
        radial-gradient(circle at 100% 35%, rgba(231,200,75,0.025), transparent 24%),
        linear-gradient(180deg, #111518 0%, #0a0d0f 42%, #07090a 100%)
      `,
    }}
  >

  <div
    className="pointer-events-none absolute inset-0 opacity-40"
    style={{
      backgroundImage: `
        linear-gradient(rgba(231,200,75,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(231,200,75,0.035) 1px, transparent 1px)
      `,
      backgroundSize: "36px 36px",
      maskImage: "linear-gradient(to bottom, black 0%, transparent 75%)",
      WebkitMaskImage:
        "linear-gradient(to bottom, black 0%, transparent 75%)",
    }}
  />

      {/* MOBILE CATEGORY BAR */}
  <div className="md:hidden overflow-x-auto px-4 pt-5 pb-3 scrollbar-hide">
    <div className="flex min-w-max gap-1.5">

      {[
        { label: "ALL", value: "all" },
        { label: "STAR", value: "star" },
        { label: "MOON", value: "eternal-moon" },
        { label: "RAINBOW", value: "rainbow" },
        { label: "FUN", value: "fun-moments" },
        { label: "TCG", value: "tcg" },
        { label: "PROMOS", value: "promos" },
        { label: "MERCH", value: "merch" },
      ].map((item, index) => {
        const active = activeCategory === item.value;

        return (
          <button
            key={item.value}
            onClick={() => setActiveCategory(item.value)}
            className={`relative overflow-hidden border px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
              active
                ? "border-[#E7C84B] bg-[#E7C84B] text-[#090b0c] shadow-[0_0_16px_rgba(231,200,75,0.25)]"
                : "border-[#30363a] bg-[#101417] text-zinc-500 hover:border-[#E7C84B]/60 hover:text-zinc-200"
            }`}
          >
            <span
              className={`mr-2 inline-block h-1 w-1 ${
                active
                  ? "bg-[#090b0c]"
                  : "bg-[#E7C84B]/40"
              }`}
            />

            {item.label}

            {active && (
              <span className="absolute bottom-0 left-0 h-px w-full bg-[#090b0c]/40" />
            )}
          </button>
        );
      })}

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
const ccgSets = releasedSets
  .filter((set) => set.category !== "tcg")
  .filter((set) => set.id !== "9")
  .filter((set) => set.id !== "tcgpromos");

  const totalSets = ccgSets.length;

  const completedSets = ccgSets.filter(
    (set) => set.progress === 100
  ).length;

  const totalCardsCollected = ccgSets.reduce(
    (sum, set) => sum + (set.collectedCards || 0),
    0
  );

  const totalCardsAvailable = ccgSets.reduce(
    (sum, set) => sum + (set.totalCards || 0),
    0
  );

      const completionRate =
        totalCardsAvailable > 0
          ? Math.round((totalCardsCollected / totalCardsAvailable) * 100)
          : 0;

      return (
  <div className="relative overflow-hidden border border-[#30363a] bg-[#0b0f11] px-4 py-4">

    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage: `
          linear-gradient(rgba(231,200,75,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(231,200,75,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    />

    <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#E7C84B]" />
    <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#E7C84B]/50" />
    <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#E7C84B]/50" />
    <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#E7C84B]" />

    <div className="relative z-10">

      <div className="mb-4 flex items-center justify-between border-b border-[#252b2f] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_8px_#E7C84B]" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-[#E7C84B]">
            COLLECTION SYSTEM
          </span>
        </div>

        <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-green-400/70">
          ● ONLINE
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { value: `${completedSets}/${totalSets}`, label: "SETS" },
          {
            value: totalCardsCollected.toLocaleString(),
            label: "CARDS",
          },
          { value: `${completionRate}%`, label: "COMPLETE" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="relative border border-[#30363a] bg-[#101518] px-2 py-3 text-center"
          >
            <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/40" />

            <div className="text-lg font-black leading-none text-[#E7C84B]">
              {stat.value}
            </div>

            <div className="mt-1.5 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-600">
          <span>COLLECTION PROGRESS</span>
          <span className="text-[#E7C84B]">{completionRate}%</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden bg-[#171c1f]">
          <div
            className="h-full bg-gradient-to-r from-[#8e761c] via-[#E7C84B] to-[#fff1a8]"
            style={{
              width: `${completionRate}%`,
              boxShadow: "0 0 10px rgba(231,200,75,0.55)",
            }}
          />
        </div>

        <div className="mt-2 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-500">
          {totalCardsCollected.toLocaleString()} /{" "}
          {totalCardsAvailable.toLocaleString()} CARDS
        </div>
      </div>

      <div className="mt-5 text-center">
        <div className="font-mono text-[7px] uppercase tracking-[0.3em] text-[#E7C84B]/60">
          KAYOU US
        </div>

        <h1 className="mt-1 font-['Oxanium'] text-3xl font-black uppercase leading-none tracking-[0.12em] text-white">
          Collections
        </h1>

        <div className="mx-auto mt-3 h-px w-16 bg-[#E7C84B] shadow-[0_0_8px_#E7C84B]" />
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

const ccgSets = releasedSets.filter(
  (set) =>
    set.category !== "tcg" &&
    set.id !== "9" &&
    set.id !== "tcgpromos"
);

  const totalSets = ccgSets.length;

  const completedSets = ccgSets.filter(
    (set) => set.progress === 100
  ).length;

  const totalCardsCollected = ccgSets.reduce(
    (sum, set) => sum + (set.collectedCards || 0),
    0
  );

  const totalCardsAvailable = ccgSets.reduce(
    (sum, set) => sum + (set.totalCards || 0),
    0
  );

      const completionRate =
        totalCardsAvailable > 0
          ? Math.round((totalCardsCollected / totalCardsAvailable) * 100)
          : 0;

      return (
        <div className="relative w-full overflow-hidden border border-[#30363a] bg-[#0b0f11]">

          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: `
                linear-gradient(rgba(231,200,75,0.035) 1px, transparent 1px),
                linear-gradient(90deg, rgba(231,200,75,0.035) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[#E7C84B]" />
          <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#E7C84B]/50" />
          <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[#E7C84B]/40" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[#E7C84B]" />

          <div className="relative border-b border-[#252b2f] bg-[#0d1113] px-6 py-3">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_8px_#E7C84B]" />

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.35em] text-[#E7C84B]">
                  COLLECTION DATABASE
                </span>

                <span className="h-px w-10 bg-[#E7C84B]/30" />

                <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-700">
                  MODULE 01
                </span>
              </div>

              <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-green-400/70">
                ● SYSTEM ONLINE
              </span>

            </div>
          </div>

  <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-8 px-8 py-5">

    <div className="flex justify-end">
      <div className="grid grid-cols-3 gap-2">

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
            className="relative min-w-[95px] border border-[#30363a] bg-[#101518] px-3 py-3 text-center"
          >
            <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/40" />

            <div className="text-xl font-black leading-none text-[#E7C84B]">
              {stat.value}
            </div>

            <div className="mt-1.5 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              {stat.label}
            </div>
          </div>
        ))}

      </div>
    </div>

    <div className="flex flex-col items-center justify-center">

      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#E7C84B]/50" />

        <span className="font-mono text-[7px] font-bold uppercase tracking-[0.4em] text-[#E7C84B]/70">
          KAYOU US
        </span>

        <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#E7C84B]/50" />
      </div>

      <h1 className="mt-2 whitespace-nowrap font-['Oxanium'] text-3xl font-black uppercase leading-none tracking-[0.12em] text-white">
        Collections
      </h1>

      <div className="mt-2 h-px w-16 bg-[#E7C84B] shadow-[0_0_8px_rgba(231,200,75,0.7)]" />

      <span className="mt-2 font-mono text-[7px] uppercase tracking-[0.25em] text-zinc-600">
        PERSONAL COLLECTION DATABASE
      </span>

    </div>

    <div className="flex justify-start">

      <div className="w-full max-w-[340px] border border-[#30363a] bg-[#101518] px-4 py-3">

        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            COLLECTION PROGRESS
          </span>

          <span className="font-mono text-xs font-black text-[#E7C84B]">
            {completionRate}%
          </span>
        </div>

        <div className="h-1 overflow-hidden bg-[#171c1f]">
          <div
            className="h-full bg-gradient-to-r from-[#8e761c] via-[#E7C84B] to-[#fff1a8]"
            style={{
              width: `${completionRate}%`,
              boxShadow: "0 0 10px rgba(231,200,75,.55)",
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.16em] text-zinc-600">
          <span>
            {totalCardsCollected.toLocaleString()} ACQUIRED
          </span>

          <span>
            {totalCardsAvailable.toLocaleString()} TOTAL
          </span>
        </div>

      </div>

    </div>

  </div>

          <div className="relative flex items-center gap-3 border-t border-[#252b2f] bg-[#0d1113] px-6 py-2.5">

            <span className="h-1 w-1 bg-[#E7C84B] shadow-[0_0_7px_#E7C84B]" />

            <span className="font-mono text-[7px] uppercase tracking-[0.22em] text-zinc-600">
              COLLECTION DATABASE // {totalCardsCollected.toLocaleString()} CARDS INDEXED
            </span>

            <span className="ml-auto font-mono text-[7px] uppercase tracking-[0.22em] text-zinc-700">
              ACCESS GRANTED
            </span>

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
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
    {filtered.map((col) => {
      const isHidden = hiddenSets.includes(col.id);

      const isMastered = col.progress === 100;
      const waitingOnKayouIds = [
        
      ];

      const isUnreleased = unreleasedSetIds.includes(col.id);
      const isWaiting = waitingOnKayouIds.includes(col.id);

  return (
    <div
      key={col.id}
      className="group relative"
    >

      <div
        className={`relative cursor-pointer ${
          isUnreleased || isWaiting
            ? "pointer-events-none opacity-50 grayscale"
            : isHidden
            ? "opacity-50 grayscale"
            : ""
        }`}
      >

        <div className="pointer-events-none absolute -inset-px z-20 border border-transparent transition-all duration-200 group-hover:border-[#E7C84B]/60 group-hover:shadow-[0_0_20px_rgba(231,200,75,0.14)]" />

        <span className="pointer-events-none absolute left-0 top-0 z-30 h-3 w-3 border-l-2 border-t-2 border-[#E7C84B]/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <span className="pointer-events-none absolute right-0 top-0 z-30 h-3 w-3 border-r-2 border-t-2 border-[#E7C84B]/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <span className="pointer-events-none absolute bottom-0 left-0 z-30 h-3 w-3 border-b-2 border-l-2 border-[#E7C84B]/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <span className="pointer-events-none absolute bottom-0 right-0 z-30 h-3 w-3 border-b-2 border-r-2 border-[#E7C84B]/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    <CollectionCard {...col} />
            {(col.id === "" || col.id === "" || col.id === "" || col.id === "") && (
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
    <div className="absolute left-2 top-2 pointer-events-none">
      <div className="flex items-center gap-1.5 rounded-md border border-[#FFD400]/25 bg-[#111111]/85 px-2 py-1 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FFD400]/70" />

        <span className="font-['Oxanium'] text-[7px] font-semibold uppercase tracking-[0.12em] text-[#FFD400]/80">
          NOT COLLECTING
        </span>
      </div>
    </div>
  )}

  {/* MASTERSET */}
  {isMastered && !isHidden && !isUnreleased && !isWaiting && (
    <div className="absolute left-2 top-2 pointer-events-none">
      <div
        className="
          flex items-center gap-1.5
          rounded-md
          border border-[#FFD400]/50
          bg-[#161616]/90
          px-2 py-1
          shadow-[0_0_14px_rgba(255,212,0,0.22)]
          backdrop-blur-sm
        "
      >
        <span className="text-[9px] text-[#FFD400]">✦</span>

        <span className="font-['Oxanium'] text-[8px] font-bold uppercase tracking-[0.14em] text-[#FFD400]">
          MASTERED
        </span>

        <span className="text-[9px] text-[#FFD400]/70">✦</span>
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
import { useState, useEffect } from "react";
import CatalogSidebar from "@/components/CatalogSidebar";
import CollectionCard from "@/components/CollectionCard";
import { supabase } from "@/lib/supabase";
import { useLocation } from "react-router-dom";
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
    id: "13",
    title: "Moon",
    setName: "Four",
    imageUrl: "/thumbnails/moonfoursetimage.webp",
    totalCards: 162,
    category: "eternal-moon",
    released: false,
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
    id: "14",
    title: "Nightmare Night",
    setName: "TCG",
    imageUrl: "/thumbnails/nightmarenightsetimage.webp",
    totalCards: 194,
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
const unreleasedSetIds: string[] = ["13", "14"];
const databaseSetId: Record<string, string> = {
  tcg: "FW",
  friendshipsbegin: "SD",
};
const Collections = () => {
const location = useLocation();
const [activeCategory, setActiveCategory] = useState(
    location.state?.category || "all"
  );
const [sets, setSets] = useState<Collection[]>([]);
const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [hideMastered, setHideMastered] = useState(true);
const [sortBy, setSortBy] = useState<"release" | "set">("release");
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
  useEffect(() => {
const syncTheme = () => {
    setIsLightMode(document.documentElement.dataset.theme === "light");
  };
  syncTheme();
const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  return () => observer.disconnect();
}, []);
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
        setHiddenSets([]);
        setSets(
          collections.map((set) => ({
            ...set,
            progress: 0,
            collectedCards: 0,
          }))
        );
        return;
      }
const { data: collectionData, error: collectionError } =
        await supabase
          .from("collection_progress")
          .select("set_id, progress")
          .eq("user_id", user.id);
      if (collectionError) {
        console.error(
          "Failed to load collection progress:",
          collectionError
        );
      }
const progressRows = new Map<string, any>(
        (collectionData || []).map((row: any) => [
          String(row.set_id),
          row,
        ])
      );
const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .single();
      if (profileError) {
        console.error(
          "Failed to load hidden collection sets:",
          profileError
        );
      }
const storedHiddenSets: string[] = Array.isArray(
        profile?.iso_hidden_sets
      )
        ? profile.iso_hidden_sets
        : [];
const mappedHiddenSets = storedHiddenSets.flatMap(
        (id: string) => {
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
            default:
              return [id];
          }
        }
      );
const uniqueHiddenSets = [...new Set(mappedHiddenSets)];
      setHiddenSets(uniqueHiddenSets);
const countProgress = (row: any, setId: string): number => {
        if (!row?.progress) {
          return 0;
        }
        if (setId === "3") {
const validKeys = new Set<string>();
const rarities: Record<string, number> = {
            R: 60,
            SR: 40,
            SSR: 40,
            HR: 60,
            LSR: 32,
            UR: 18,
            SGR: 16,
            ZR: 14,
            SC: 7,
            SZR: 3,
          };
          Object.entries(rarities).forEach(([rarity, count]) => {
            for (let i = 1; i <= count; i++) {
              validKeys.add(`${rarity}-${i}`);
            }
          });
          return Object.entries(row.progress).filter(
            ([key, value]) => Boolean(value) && validKeys.has(key)
          ).length;
        }
        return Object.values(row.progress).filter(Boolean).length;
      };
const progressMap: Record<string, number> = {};
      collections.forEach((set) => {
const dbId = databaseSetId[set.id] || set.id;
const row = progressRows.get(dbId);
        progressMap[set.id] = countProgress(row, String(dbId));
      });
      progressMap["tcgpromos"] = countProgress(
        progressRows.get("tcgpromos"),
        "tcgpromos"
      );
const updated = collections.map((set) => {
let collected = progressMap[set.id] || 0;
let totalCards = set.totalCards;
        if (set.id === "9") {
const ccgPromosHidden =
            uniqueHiddenSets.includes("9");
const tcgPromosHidden =
            uniqueHiddenSets.includes("tcgpromos");
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
          collected =
            visibleCCGCollected + visibleTCGCollected;
          totalCards =
            visibleCCGTotal + visibleTCGTotal;
        }
const progress =
          totalCards > 0
            ? Math.min(
                100,
                Math.floor((collected / totalCards) * 100)
              )
            : 0;
        return {
          ...set,
          collectedCards: collected,
          totalCards,
          progress,
        };
      });
      setSets(updated);
    };
    load();
const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        load(session?.user);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
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
const promoNodeFullyHidden =
    hiddenSets.includes("9") &&
    hiddenSets.includes("tcgpromos");
const filtered = (
    activeCategory === "all"
      ? sets
          .filter((c) => c.category !== "merch")
          .filter(
            (c) => !hideMastered || c.progress !== 100
          )
          .filter((c) => {
            if (c.id === "9") {
              return !promoNodeFullyHidden;
            }
            return !hiddenSets.includes(c.id);
          })
      : sets
          .filter(
            (c) => c.category === activeCategory
          )
          .filter((c) => {
            if (c.id === "9") {
              return !promoNodeFullyHidden;
            }
            return true;
          })
  )
    .filter((c) => c.released || unreleasedSetIds.includes(c.id))
    .sort((a, b) => {
      if (sortBy === "set") {
const categoryDiff =
          (setOrder[a.category] ?? 999) -
          (setOrder[b.category] ?? 999);
        if (categoryDiff !== 0) {
          return categoryDiff;
        }
      }
      return (
        collections.findIndex(
          (s) => s.id === a.id
        ) -
        collections.findIndex(
          (s) => s.id === b.id
        )
      );
    });
const ccgSets = sets.filter(
    (set) =>
      set.released &&
      set.category !== "tcg" &&
      set.category !== "merch" &&
      set.id !== "9" &&
      set.id !== "tcgpromos" &&
      !hiddenSets.includes(set.id)
  );
const totalSets = ccgSets.length;
const completedSets = ccgSets.filter(
    (set) => set.progress === 100
  ).length;
const ccgCardsCollected = ccgSets.reduce(
    (sum, set) => sum + (set.collectedCards || 0),
    0
  );
const ccgCardsAvailable = ccgSets.reduce(
    (sum, set) => sum + (set.totalCards || 0),
    0
  );
const promoSet = sets.find((set) => set.id === "9");
const promoCardsCollected = promoSet?.collectedCards || 0;
const promoCardsAvailable = promoSet?.totalCards || 0;
const totalCardsCollected =
    ccgCardsCollected + promoCardsCollected;
const totalCardsAvailable =
    ccgCardsAvailable + promoCardsAvailable;
const completionRate =
    totalCardsAvailable > 0
      ? Math.round(
          (totalCardsCollected / totalCardsAvailable) * 100
        )
      : 0;
  return (
  <div
    className={`min-h-screen pb-24 font-['Oxanium'] transition-colors duration-200 sm:pb-10 ${
      isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
    }`}
  >
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <section
        className={`rounded-[24px] border p-4 sm:p-5 ${
          isLightMode
            ? "border-black/10 bg-white shadow-[0_10px_28px_rgba(0,0,0,.04)]"
            : "border-white/[0.08] bg-[#151718]"
        }`}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            {
              label: "Sets Mastered",
              value: `${completedSets}/${totalSets}`,
            },
            {
              label: "Cards Collected",
              value: totalCardsCollected.toLocaleString(),
            },
            {
              label: "Complete",
              value: `${completionRate}%`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border px-3 py-3 text-center sm:px-4 ${
                isLightMode
                  ? "border-black/10 bg-zinc-50"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <div
                className={`text-xl font-semibold sm:text-2xl ${
                  isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                }`}
              >
                {stat.value}
              </div>
              <div
                className={`mt-1 text-[11px] font-medium sm:text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div
            className={`h-2 flex-1 overflow-hidden rounded-full ${
              isLightMode ? "bg-zinc-200" : "bg-white/[0.08]"
            }`}
          >
            <div
              className="h-full rounded-full bg-[#FFD54A]"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span
            className={`shrink-0 text-xs font-medium ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {totalCardsCollected.toLocaleString()} / {totalCardsAvailable.toLocaleString()}
          </span>
        </div>
      </section>
      <div className="mt-4 md:hidden">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" },
            { label: "Star", value: "star" },
            { label: "Moon", value: "eternal-moon" },
            { label: "Rainbow", value: "rainbow" },
            { label: "Fun Moments", value: "fun-moments" },
            { label: "TCG", value: "tcg" },
            { label: "Promos", value: "promos" },
            { label: "Merch", value: "merch" },
          ].map((item) => {
const active = activeCategory === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveCategory(item.value)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                    : isLightMode
                    ? "border-black/10 bg-white text-zinc-600"
                    : "border-white/10 bg-[#151718] text-zinc-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex gap-6">
          <aside className="hidden shrink-0 md:block">
            <CatalogSidebar
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              hideMastered={hideMastered}
              onToggleHideMastered={() => setHideMastered((prev) => !prev)}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </aside>
          <div className="min-w-0 flex-1">
            {activeCategory === "" ? (
              <div className="py-20" />
            ) : filtered.length === 0 ? (
              <div
                className={`rounded-2xl border border-dashed p-10 text-center text-sm sm:text-base ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 text-zinc-500"
                    : "border-white/10 bg-white/[0.03] text-zinc-400"
                }`}
              >
                No sets to show with the current filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
                {filtered.map((col) => {
const isHidden =
                    col.id === "9"
                      ? promoNodeFullyHidden
                      : hiddenSets.includes(col.id);
const isMastered =
                    (col.collectedCards ?? 0) >= col.totalCards;
const waitingOnKayouIds: string[] = [];
const isUnreleased = unreleasedSetIds.includes(col.id);
const isWaiting = waitingOnKayouIds.includes(col.id);
                  return (
                    <div key={col.id} className="group relative">
                      <div
                        className={`relative overflow-hidden rounded-[18px] ${
                          isUnreleased || isWaiting
                            ? "pointer-events-none opacity-50 grayscale"
                            : isHidden
                            ? "opacity-50 grayscale"
                            : ""
                        }`}
                      >
                        <CollectionCard {...col} />
                      </div>
                      {isUnreleased && (
                        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                          <div className={`rounded-xl border px-4 py-2 text-center text-sm font-bold tracking-wide shadow-lg sm:text-base ${
                            isLightMode
                              ? "border-[#8a6a00]/30 bg-white/90 text-[#725700]"
                              : "border-[#FFD54A]/40 bg-black/85 text-[#FFE27A]"
                          }`}>
                            COMING SOON
                          </div>
                        </div>
                      )}
                      {isHidden && !isUnreleased && !isWaiting && (
                        <div className="pointer-events-none absolute inset-x-2 top-2 z-30">
                          <div
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                              isLightMode
                                ? "border-[#8a6a00]/20 bg-white/95 text-[#725700]"
                                : "border-[#FFD54A]/25 bg-black/80 text-[#FFE27A]"
                            }`}
                          >
                            Not collecting this set
                          </div>
                        </div>
                      )}
                      {isMastered && !isHidden && !isUnreleased && !isWaiting && (
                        <div className="pointer-events-none absolute left-2 top-2 z-30">
                          <div
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              isLightMode
                                ? "border-[#8a6a00]/20 bg-white/95 text-[#725700]"
                                : "border-[#FFD54A]/25 bg-black/75 text-[#FFE27A]"
                            }`}
                          >
                            Mastered
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </div>
    </main>
  </div>
);
};
export default Collections;
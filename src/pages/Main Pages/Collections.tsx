import { useState, useEffect, type CSSProperties } from "react";
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
    totalCards: 190,
    category: "tcg",
    released: true,
  },
  {
    id: "13",
    title: "Moon",
    setName: "Four",
    imageUrl: "/thumbnails/moonfoursetimage.webp",
    totalCards: 162,
    category: "eternal-moon",
    released: true,
  },
{
    id: "hearthswarming-eve",
    title: "HearthsWarming Eve",
    setName: "TCG",
    imageUrl: "/thumbnails/hearthswarmingsetimage.png",
    totalCards: 197,
    category: "tcg",
    released: true,
  },
  {
    id: "9",
    title: "Promos",
    setName: "Promotional Cards",
    imageUrl: "/thumbnails/promossetimage.webp",
    totalCards: 42,
    category: "promos",
    released: true,
  },
];
const unreleasedSetIds: string[] = [];
const databaseSetId: Record<string, string> = {
  tcg: "FW",
  friendshipsbegin: "SD",
};
const Collections = () => {
const location = useLocation();
const [activeCategory, setActiveCategory] = useState(
    location.state?.category || "all",
  );
const [sets, setSets] = useState<Collection[]>([]);
const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [hideMastered, setHideMastered] = useState(true);
const [sortBy, setSortBy] = useState<"release" | "set">("release");
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
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
          })),
        );
        return;
      }
const { data: collectionData, error: collectionError } = await supabase
        .from("collection_progress")
        .select("set_id, progress")
        .eq("user_id", user.id);
      if (collectionError) {
        console.error("Failed to load collection progress:", collectionError);
      }
const progressRows = new Map<string, any>(
        (collectionData || []).map((row: any) => [String(row.set_id), row]),
      );
const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .single();
      if (profileError) {
        console.error("Failed to load hidden collection sets:", profileError);
      }
const storedHiddenSets: string[] = Array.isArray(profile?.iso_hidden_sets)
        ? profile.iso_hidden_sets
        : [];
const mappedHiddenSets = storedHiddenSets.flatMap((id: string) => {
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
      });
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
            ([key, value]) => Boolean(value) && validKeys.has(key),
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
        "tcgpromos",
      );
const updated = collections.map((set) => {
let collected = progressMap[set.id] || 0;
let totalCards = set.totalCards;
        if (set.id === "9") {
const ccgPromosHidden = uniqueHiddenSets.includes("9");
const tcgPromosHidden = uniqueHiddenSets.includes("tcgpromos");
const ccgCollected = progressMap["9"] || 0;
const tcgCollected = progressMap["tcgpromos"] || 0;
const visibleCCGCollected = ccgPromosHidden
            ? 0
            : Math.min(ccgCollected, 14);
const visibleTCGCollected = tcgPromosHidden
            ? 0
            : Math.min(tcgCollected, 28);
const visibleCCGTotal = ccgPromosHidden ? 0 : 14;
const visibleTCGTotal = tcgPromosHidden ? 0 : 28;
          collected = visibleCCGCollected + visibleTCGCollected;
          totalCards = visibleCCGTotal + visibleTCGTotal;
        }
const progress =
          totalCards > 0
            ? Math.min(100, Math.floor((collected / totalCards) * 100))
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user);
    });
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
  };
const promoNodeFullyHidden =
    hiddenSets.includes("9") && hiddenSets.includes("tcgpromos");
const filtered = (
    activeCategory === "all"
      ? sets
          .filter((c) => !hideMastered || c.progress !== 100)
          .filter((c) => {
            if (c.id === "9") {
              return !promoNodeFullyHidden;
            }
            return !hiddenSets.includes(c.id);
          })
      : sets
          .filter((c) => c.category === activeCategory)
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
const ccgSets = sets.filter(
    (set) =>
      set.released &&
      set.id !== "9" &&
      set.id !== "tcgpromos" &&
      !hiddenSets.includes(set.id),
  );
const totalSets = ccgSets.length;
const completedSets = ccgSets.filter((set) => set.progress === 100).length;
const ccgCardsCollected = ccgSets.reduce(
    (sum, set) => sum + (set.collectedCards || 0),
    0,
  );
const ccgCardsAvailable = ccgSets.reduce(
    (sum, set) => sum + (set.totalCards || 0),
    0,
  );
const promoSet = sets.find((set) => set.id === "9");
const promoCardsCollected = promoSet?.collectedCards || 0;
const promoCardsAvailable = promoSet?.totalCards || 0;
const totalCardsCollected = ccgCardsCollected + promoCardsCollected;
const totalCardsAvailable = ccgCardsAvailable + promoCardsAvailable;
const completionRate =
    totalCardsAvailable > 0
      ? Math.round((totalCardsCollected / totalCardsAvailable) * 100)
      : 0;
  return (
    <div
      className={`collections-workspace min-h-screen pb-24 font-['Oxanium'] transition-colors duration-200 sm:pb-10 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
      <main className="w-full max-w-none px-4 py-5 sm:px-6 sm:py-8">
        <section className="collections-summary" aria-label="Collection progress">
          <div className="collections-summary-title"><h1>English Collections</h1><span>{totalSets} sets in your collection</span></div>
          <div className="collections-summary-stats">
            <div><strong>{completedSets}<small> / {totalSets}</small></strong><span>Sets mastered</span></div>
            <div><strong>{totalCardsCollected.toLocaleString()}<small> / {totalCardsAvailable.toLocaleString()}</small></strong><span>Cards collected</span></div>
            <div><strong>{completionRate}<small>%</small></strong><span>Complete</span></div>
          </div>
          <div className="collections-summary-track" role="progressbar" aria-label="Overall collection completion" aria-valuenow={Math.min(100, Math.max(0, completionRate))} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }} /></div>
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
            ].map((item) => {
const active = activeCategory === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveCategory(item.value)}
                  aria-pressed={active}
                  className={`collections-mobile-category rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
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
            <div className="collections-results"><h2>{({ all: "All collections", star: "Star", "eternal-moon": "Moon", rainbow: "Rainbow", "fun-moments": "Fun Moments", tcg: "Card Game", promos: "Promotional", merch: "Other" } as Record<string, string>)[activeCategory] || "Collections"}</h2><span>{filtered.length} {filtered.length === 1 ? "set" : "sets"}</span></div>
            <div className="collections-mobile-options md:hidden"><button type="button" aria-pressed={hideMastered} onClick={() => setHideMastered(value => !value)}>{hideMastered ? "Show mastered" : "Hide mastered"}</button><label>Sort <select aria-label="Sort collections" value={sortBy} onChange={event => setSortBy(event.target.value as "release" | "set")}><option value="release">Release</option><option value="set">Set</option></select></label></div>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(auto-fill,minmax(165px,1fr))]">
                {filtered.map((col, index) => {
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
                    <div key={col.id} className="collection-grid-item group relative" style={{ "--entry-delay": `${Math.min(index, 8) * 25}ms` } as CSSProperties}>
                      <div
                        className={`relative rounded-[16px] ${
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
                          <div
                            className={`rounded-xl border px-4 py-2 text-center text-sm font-bold tracking-wide shadow-lg sm:text-base ${
                              isLightMode
                                ? "border-[#8a6a00]/30 bg-white/90 text-[#725700]"
                                : "border-[#FFD54A]/40 bg-black/85 text-[#FFE27A]"
                            }`}
                          >
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
                      {isMastered &&
                        !isHidden &&
                        !isUnreleased &&
                        !isWaiting && (
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
      <style>{`
.collections-workspace{--collections-accent:hsl(var(--primary));--collections-muted:#92969e}
html[data-theme="light"] .collections-workspace{--collections-muted:#6b7078}
.collections-summary{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;padding:0 0 24px;margin-bottom:26px;border-bottom:1px solid #80808025}
.collections-summary-title h1{margin:0 0 6px;font-size:24px;line-height:1.2;letter-spacing:-.035em;font-weight:650}
.collections-summary-title>span{font-size:11px;color:var(--collections-muted)}
.collections-summary-stats{display:flex;align-items:center;gap:32px}
.collections-summary-stats>div{display:flex;flex-direction:column;gap:5px}
.collections-summary-stats strong{font-size:24px;line-height:1.2;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.04em}
.collections-summary-stats small{font-size:12px;font-weight:400;letter-spacing:0;color:var(--collections-muted)}
.collections-summary-stats>div>span{font-size:10px;color:var(--collections-muted)}
.collections-summary-stats>div:last-child strong{color:var(--collections-accent)}
.collections-summary-track{flex-basis:100%;height:4px;border-radius:4px;background:#80808020;overflow:hidden}
.collections-summary-track>span{display:block;height:100%;background:var(--collections-accent);border-radius:inherit;transition:width .7s ease}
.collections-results{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 17px}
.collections-results h2{margin:0;font-size:14px;font-weight:600}
.collections-results>span{font-size:11px;color:var(--collections-muted)}
.collections-mobile-category[aria-pressed="true"]{background:var(--collections-accent)!important;border-color:var(--collections-accent)!important;color:hsl(var(--primary-foreground))!important}
.collection-grid-item{animation:collection-enter .3s ease backwards;animation-delay:var(--entry-delay)}
.collections-mobile-options{align-items:center;justify-content:space-between;margin-bottom:16px;color:var(--collections-muted);font-size:11px}
.collections-mobile-options button{min-height:36px;padding:6px 10px;border:1px solid #80808030;border-radius:7px}
.collections-mobile-options label{display:flex;align-items:center;gap:8px}
.collections-mobile-options select{font-size:16px;background:hsl(var(--background));border:1px solid #80808030;border-radius:7px;padding:6px;color:inherit}
@media(max-width:767px){.collections-summary{gap:18px;margin-bottom:16px;padding-bottom:18px}.collections-summary-title h1{font-size:21px}.collections-summary-stats{width:100%;justify-content:space-between;gap:12px}.collections-summary-stats strong{font-size:22px}.collections-summary-stats small{font-size:10px}.collections-summary-stats>div>span{font-size:9px}.collections-mobile-options{display:flex}}
@keyframes collection-enter{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.collection-grid-item{animation:none}.collections-summary-track>span{transition:none}}
      `}</style>
    </div>
  );
};
export default Collections;

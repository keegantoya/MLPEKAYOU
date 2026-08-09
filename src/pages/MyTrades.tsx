import CollectionCard from "@/components/CollectionCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyTrades() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("moon");
  const [sortBy, setSortBy] = useState("set");

  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [ownedSets, setOwnedSets] = useState<string[]>([]);
const [tradeSets, setTradeSets] = useState<string[]>([]);

  useEffect(() => {
  const loadData = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }

    if (!user) {
      setHiddenSets([]);
      setTradeSets([]);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("iso_hidden_sets")
      .eq("id", user.id)
      .single();

    setHiddenSets(profile?.iso_hidden_sets || []);

const { data: progress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);

const owned =
  (progress || [])
    .filter((row) => {
      const cards = row.progress || {};
      return Object.values(cards).some(Boolean);
    })
    .map((row) => String(row.set_id).trim());

setOwnedSets([...new Set(owned)]);

const { data: trades } = await supabase
  .from("for_trade")
  .select("set_id")
  .eq("user_id", user.id);

const activeTrades = [
  ...new Set((trades || []).map((t) => String(t.set_id).trim()))
];

setTradeSets(activeTrades);
  };

  loadData();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    loadData(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

  const collections = [
    {
      id: "1",
      title: "Eternal Moon",
      setName: "One",
      imageUrl: "/thumbnails/moononesetimage.webp",
      totalCards: 186,
      category: "eternal-moon",
    },
    {
      id: "5",
      title: "Rainbow",
      setName: "One",
      imageUrl: "/thumbnails/rainbowonesetimage.webp",
      totalCards: 146,
      category: "rainbow",
    },
    {
      id: "7",
      title: "Fun Moments",
      setName: "One",
      imageUrl: "/thumbnails/funonesetimage.webp",
      totalCards: 127,
      category: "fun-moments",
    },
    {
      id: "2",
      title: "Eternal Moon",
      setName: "Two",
      imageUrl: "/thumbnails/moontwosetimage.webp",
      totalCards: 189,
      category: "eternal-moon",
    },
    {
      id: "3",
      title: "Eternal Moon",
      setName: "Three",
      imageUrl: "/thumbnails/moonthreesetimage.webp",
      totalCards: 290,
      category: "eternal-moon",
    },
    {
      id: "8",
      title: "Fun Moments",
      setName: "Two",
      imageUrl: "/thumbnails/funtwosetimage.webp",
      totalCards: 136,
      category: "fun-moments",
    },
    {
      id: "11",
      title: "Fun Moments",
      setName: "Three",
      imageUrl: "/thumbnails/funthreesetimage.webp",
      totalCards: 148,
      category: "fun-moments",
    },
      {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/staronesetimage.webp",
    totalCards: 105,
    category: "star",
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbowtwosetimage.webp",
    totalCards: 170,
    category: "rainbow",
  },
    {
  id: "FW",
  title: "Fantasy",
  setName: "Wonderland",
  imageUrl: "/thumbnails/fantasysetimage.webp",
  totalCards:  191,
  category: "fantasy-wonderland",
},
{
  id: "SD",
  title: "Friendships",
  setName: "Begin",
  imageUrl: "/thumbnails/friendshipsbeginsetimage.webp",
  totalCards: 194,
  category: "friendships-begin",
},
{
  id: "12",
  title: "Discord",
  setName: "TCG",
  imageUrl: "/thumbnails/discordsetimage.webp",
  totalCards: 191,
  category: "discord",
},
{
  id: "9",
  title: "Promotional",
  setName: "Cards",
  imageUrl: "/thumbnails/promossetimage.webp",
  totalCards: 12,
  category: "promo-cards",
},
{
  id: "tcgpromos",
  title: "TCG",
  setName: "Promos",
  imageUrl: "/thumbnails/tcgpromossetimage.webp",
  totalCards: 18,
  category: "tcgpromos",
},
  ];

  const normalizeSetId = (id: string) => {
    const normalized = String(id).trim();
    return normalized === "FB" ? "SD" : normalized;
  };

  const normalizedOwnedSets = new Set(ownedSets.map(normalizeSetId));
  const normalizedHiddenSets = new Set(hiddenSets.map(normalizeSetId));
  const normalizedTradeSets = new Set(tradeSets.map(normalizeSetId));

  const filteredCollections = collections.filter((col) => {
    if (normalizedHiddenSets.has(normalizeSetId(col.id))) return false;
    if (!normalizedOwnedSets.has(normalizeSetId(col.id))) return false;

    if (activeFilter === "moon") {
      return col.id === "1" || col.id === "2" || col.id === "3";
    }

    if (activeFilter === "star") {
      return col.id === "4";
    }

    if (activeFilter === "fun") {
      return col.id === "7" || col.id === "8" || col.id === "11";
    }

    if (activeFilter === "rainbow") {
      return col.id === "5" || col.id === "6";
    }

    if (activeFilter === "promos") {
      return col.id === "9" || col.id === "tcgpromos";
    }

    if (activeFilter === "tcg") {
      return col.id === "SD" || col.id === "FW" || col.id === "12";
    }

    return activeFilter === "moon";
  });

  const knownOwnedSetCount = collections.filter((col) =>
    normalizedOwnedSets.has(normalizeSetId(col.id))
  ).length;

  const categoryCounts = {
    moon: collections.filter((col) => ["1", "2", "3"].includes(col.id) && normalizedOwnedSets.has(normalizeSetId(col.id)) && !normalizedHiddenSets.has(normalizeSetId(col.id))).length,
    star: collections.filter((col) => col.id === "4" && normalizedOwnedSets.has(normalizeSetId(col.id)) && !normalizedHiddenSets.has(normalizeSetId(col.id))).length,
    fun: collections.filter((col) => ["7", "8", "11"].includes(col.id) && normalizedOwnedSets.has(normalizeSetId(col.id)) && !normalizedHiddenSets.has(normalizeSetId(col.id))).length,
    rainbow: collections.filter((col) => ["5", "6"].includes(col.id) && normalizedOwnedSets.has(normalizeSetId(col.id)) && !normalizedHiddenSets.has(normalizeSetId(col.id))).length,
    tcg: collections.filter((col) => ["SD", "FW", "12"].includes(col.id) && normalizedOwnedSets.has(normalizeSetId(col.id)) && !normalizedHiddenSets.has(normalizeSetId(col.id))).length,
    promos: collections.filter((col) => ["9", "tcgpromos"].includes(col.id) && normalizedOwnedSets.has(normalizeSetId(col.id)) && !normalizedHiddenSets.has(normalizeSetId(col.id))).length,
  };

  const categoryItems = [
    { id: "star", title: "STAR", subtitle: "STAR EDITION", count: categoryCounts.star, icon: "S" },
    { id: "moon", title: "MOON", subtitle: "ETERNAL MOON", count: categoryCounts.moon, icon: "M" },
    { id: "rainbow", title: "RAINBOW", subtitle: "ETERNAL RAINBOW", count: categoryCounts.rainbow, icon: "R" },
    { id: "fun", title: "FUN MOMENTS", subtitle: "FUN MOMENTS", count: categoryCounts.fun, icon: "FM" },
    { id: "tcg", title: "TCG", subtitle: "TRADING CARD GAME", count: categoryCounts.tcg, icon: "TCG" },
    { id: "promos", title: "PROMOS", subtitle: "PROMOTIONAL", count: categoryCounts.promos, icon: "PR" },
  ];

  const activeCategoryLabel =
    categoryItems.find((item) => item.id === activeFilter)?.title || "MOON";

  const slugMap: Record<string, string> = {
    "1": "moon-one",
    "2": "moon-two",
    "3": "moon-three",
    "4": "star-one",
    "5": "rainbow-one",
    "6": "rainbow-two",
    "7": "fun-moments-one",
    "8": "fun-moments-two",
    "11": "fun-moments-three",
    "9": "promotional-cards",
    "FW": "fantasy-wonderland",
    "SD": "friendships-begin",
    "12": "discord",
    "tcgpromos": "tcg-promos",
  };

  return (
    <div
      className="min-h-screen bg-[#0b0c0c] text-[#e8e8e2]"
      style={{
        fontFamily: "Oxanium, sans-serif",
        backgroundImage: `
          radial-gradient(circle at 48% 0%, rgba(236,191,59,.10), transparent 28%),
          linear-gradient(rgba(255,255,255,.014) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.014) 1px, transparent 1px)
        `,
        backgroundSize: "auto, 42px 42px, 42px 42px",
      }}
    >
      <div className="mx-auto max-w-[1600px] px-3 pt-3 pb-24 sm:px-5 sm:py-5 lg:px-7">

        {/* PAGE TITLE STRIP */}
        <div className="relative mb-4 overflow-hidden border border-[#34362f] bg-[#111313] shadow-[0_18px_55px_rgba(0,0,0,.55)]">
          <div className="absolute left-0 top-0 h-full w-1 bg-[#e4bd43]" />
          <div className="absolute right-0 top-0 h-px w-1/3 bg-gradient-to-l from-[#e4bd43] to-transparent" />
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#e8c14a] shadow-[0_0_9px_#e8c14a]" />
                <span className="text-[8px] font-bold uppercase tracking-[.3em] text-[#656861]">
                  COLLECTION DATABASE // PERSONAL ACCESS
                </span>
              </div>
              <h1
                className="text-4xl font-black uppercase leading-none tracking-[-.04em] sm:text-6xl"
                style={{
                  background: "linear-gradient(180deg,#fffde8 0%,#f6dd78 35%,#d9a92d 72%,#986006 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                MY INVENTORY
              </h1>
            </div>

            <div className="grid grid-cols-3 border border-[#2d302c] bg-[#0c0e0e]">
              <div className="border-r border-[#2d302c] px-3 py-2.5 sm:px-5">
                <div className="text-[7px] uppercase tracking-[.2em] text-[#555852]">SETS</div>
                <div className="mt-1 text-lg font-black text-[#e4bd43]">{collections.length}</div>
              </div>
              <div className="border-r border-[#2d302c] px-3 py-2.5 sm:px-5">
                <div className="text-[7px] uppercase tracking-[.2em] text-[#555852]">VISIBLE</div>
                <div className="mt-1 text-lg font-black text-[#e8e8e1]">{filteredCollections.length}</div>
              </div>
              <div className="px-3 py-2.5 sm:px-5">
                <div className="text-[7px] uppercase tracking-[.2em] text-[#555852]">TRADES</div>
                <div className="mt-1 text-lg font-black text-[#e8e8e1]">{tradeSets.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* THREE-PANEL WORKSPACE */}
        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_300px]">

          {/* LEFT CATEGORY NAV */}
          <aside className="border border-[#34362f] bg-[#111313] shadow-[0_18px_55px_rgba(0,0,0,.5)]">
            <div className="border-b border-[#2b2d29] bg-[#0d0f0f] px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-[.28em] text-[#5e615a]">
                    CATEGORIES OF SETS
                  </div>
                  <div className="mt-2 text-[7px] uppercase leading-relaxed tracking-[.13em] text-[#4f524d]">
                    Select a category to filter your collection.
                  </div>
                </div>
                <span className="text-[7px] text-[#555850]">{collections.length.toString().padStart(2, "0")}</span>
              </div>
            </div>

            <div className="p-3">
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`group mb-2 flex w-full items-center gap-3 border px-3 py-3 text-left transition-all ${
                    activeFilter === item.id
                      ? "border-[#dfba42] bg-[#1a1913] shadow-[inset_3px_0_0_#e2bc43]"
                      : "border-[#292c28] bg-[#151717] hover:border-[#5c5029] hover:bg-[#191b1a]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center border text-base ${
                      activeFilter === item.id
                        ? "border-[#6c5925] bg-[#242014] text-[#efc84b]"
                        : "border-[#30332e] bg-[#1c1e1d] text-[#73766e]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[10px] font-black uppercase tracking-[.14em] ${
                      activeFilter === item.id ? "text-[#efc84b]" : "text-[#d2d3cc]"
                    }`}>
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-[7px] uppercase tracking-[.14em] text-[#50534d]">
                      {item.subtitle}
                    </span>
                  </span>
                  <span className={`text-[8px] font-bold ${activeFilter === item.id ? "text-[#efc84b]" : "text-[#555850]"}`}>
                    {item.count.toString().padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-[#292c28] px-4 py-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-5 bg-[#9b7d2d]" />
                <span className="text-[7px] font-bold uppercase tracking-[.25em] text-[#8c722b]">
                  INVENTORY ACCESS
                </span>
              </div>
              <p className="text-[7px] leading-relaxed tracking-[.12em] text-[#555852]">
                Hidden sets remain excluded from the workspace. Only sets with collected cards are displayed.
              </p>
            </div>
          </aside>

          {/* CENTER INVENTORY */}
          <main className="min-w-0 border border-[#34362f] bg-[#101212] shadow-[0_18px_55px_rgba(0,0,0,.5)]">
            <div className="border-b border-[#2b2d29] bg-[#0d0f0f] px-4 py-4 sm:px-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[7px] font-bold uppercase tracking-[.3em] text-[#555852]">ACTIVE CHANNEL</div>
                  <h2 className="mt-1 text-2xl font-black uppercase tracking-[.05em] text-[#e8e8e1] sm:text-3xl">
                    {activeCategoryLabel}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-[7px] uppercase tracking-[.22em] text-[#555852]">VISIBLE SETS</div>
                  <div className="mt-1 text-2xl font-black text-[#e4bd43]">
                    {filteredCollections.length.toString().padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-5">
              {filteredCollections.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredCollections.map((col, index) => (
                    <button
                      key={col.id}
                      onClick={() => navigate(`/inventory/${slugMap[col.id]}`)}
                      className="group relative overflow-hidden border border-[#30322e] bg-[#171919] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b89534] hover:bg-[#1b1d1d] hover:shadow-[0_18px_35px_rgba(0,0,0,.5)]"
                    >
                      <div className="absolute left-0 top-0 h-px w-1/3 bg-[#dcb541] opacity-60" />
                      <div className="absolute bottom-0 right-0 h-px w-1/4 bg-[#dcb541] opacity-30" />
                      <div className="grid min-h-[205px] grid-cols-[1fr_112px] gap-3 p-4">
                        <div className="flex min-w-0 flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[7px] font-bold uppercase tracking-[.25em] text-[#5a5d57]">
                                VOL. {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="h-px flex-1 bg-[#292c28]" />
                            </div>

                            <h3 className="mt-5 text-xl font-black uppercase leading-tight tracking-[.02em] text-[#ecece5]">
                              {col.title}
                            </h3>
                            <div className="mt-1 text-sm font-bold uppercase tracking-[.1em] text-[#b49438]">
                              {col.setName}
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center gap-2">
                              <span className="h-px w-7 bg-[#a9862f]" />
                              <span className="text-[7px] font-bold uppercase tracking-[.2em] text-[#8e732a]">
                                COLLECTION NODE
                              </span>
                            </div>
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <div className="text-[7px] uppercase tracking-[.18em] text-[#50534d]">CARD CAPACITY</div>
                                <div className="mt-1 text-lg font-black text-[#d7d8d1]">{col.totalCards}</div>
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-[.18em] text-[#b39337] transition-transform group-hover:translate-x-1">
                                OPEN →
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                          <div className="absolute inset-2 border border-[#4a4024] bg-[#0c0e0e]" />
                          <div className="absolute right-0 top-2 border border-[#5b4a20] bg-[#e1b936] px-1.5 py-1 text-[7px] font-black text-[#151515]">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <img
                            src={col.imageUrl}
                            alt={col.title}
                            className="relative h-[104px] w-[82px] rounded-sm border border-[#66562a] object-cover shadow-[0_12px_24px_rgba(0,0,0,.6)]"
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[330px] items-center justify-center border border-dashed border-[#30322e] bg-[#0d0f0f]">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-2 w-2 bg-[#555850]" />
                    <div className="text-[9px] font-bold uppercase tracking-[.22em] text-[#666961]">No active collection nodes</div>
                    <div className="mt-2 text-[7px] uppercase tracking-[.14em] text-[#484b46]">Select another category.</div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* RIGHT STATUS / TRADES */}
          <aside className="space-y-4">
            <div className="border border-[#34362f] bg-[#111313] shadow-[0_18px_55px_rgba(0,0,0,.5)]">
              <div className="border-b border-[#2b2d29] bg-[#0d0f0f] px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] font-bold uppercase tracking-[.28em] text-[#5e615a]">INVENTORY STATUS</div>
                  <span className="flex items-center gap-1.5 text-[7px] uppercase tracking-[.18em] text-[#b19236]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e3bd43] shadow-[0_0_8px_#e3bd43]" />
                    VERIFIED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-[#2a2c28]">
                <div className="bg-[#111313] p-4">
                  <div className="text-[7px] uppercase tracking-[.2em] text-[#535650]">OWNED SETS</div>
                  <div className="mt-2 text-3xl font-black text-[#e5bd43]">{knownOwnedSetCount.toString().padStart(2, "0")}</div>
                </div>
                <div className="bg-[#111313] p-4">
                  <div className="text-[7px] uppercase tracking-[.2em] text-[#535650]">TRADE SETS</div>
                  <div className="mt-2 text-3xl font-black text-[#e6e6df]">{tradeSets.length.toString().padStart(2, "0")}</div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-px w-6 bg-[#a27f27]" />
                  <span className="text-[7px] font-bold uppercase tracking-[.25em] text-[#8b7029]">ACTIVE FILTER</span>
                </div>
                <div className="text-sm font-black uppercase tracking-[.08em] text-[#dfe0d9]">{activeCategoryLabel}</div>
                <p className="mt-2 text-[7px] uppercase leading-relaxed tracking-[.12em] text-[#555852]">
                  Inventory view is limited to visible sets containing collected cards.
                </p>
              </div>
            </div>

            <div className="border border-[#34362f] bg-[#111313] shadow-[0_18px_55px_rgba(0,0,0,.5)]">
              <div className="border-b border-[#2b2d29] bg-[#0d0f0f] px-4 py-4">
                <div className="text-[8px] font-bold uppercase tracking-[.28em] text-[#5e615a]">TRADE NETWORK</div>
                <div className="mt-1 text-lg font-black uppercase tracking-[.05em] text-[#e4e5de]">My Trades</div>
              </div>

              <div className="p-3">
                {tradeSets.length > 0 ? (
                  <div className="space-y-2">
                    {collections
                      .filter((col) => normalizedTradeSets.has(normalizeSetId(col.id)))
                      .map((col) => (
                        <button
                          key={col.id}
                          onClick={() => navigate(`/my-trades/view/${col.id}`)}
                          className="group flex w-full items-center gap-3 border border-[#2b2e29] bg-[#171919] p-2.5 text-left transition-all hover:border-[#b49335] hover:bg-[#1c1e1d]"
                        >
                          <img
                            src={col.imageUrl}
                            alt={col.title}
                            className="h-10 w-10 shrink-0 rounded-md border border-[#504423] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[9px] font-bold uppercase tracking-[.08em] text-[#dfe0d9]">
                              {col.setName
                                ? ["friendshipsbegin", "FW", "9"].includes(col.id)
                                  ? `${col.title} ${col.setName}`
                                  : `${col.title} (${col.setName})`
                                : col.title}
                            </div>
                            <div className="mt-1 text-[7px] uppercase tracking-[.16em] text-[#a1842e]">
                              OPEN TRADES →
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-[#2d302c] px-3 py-7 text-center">
                    <div className="mx-auto mb-3 h-1.5 w-1.5 bg-[#555850]" />
                    <div className="text-[8px] font-bold uppercase tracking-[.2em] text-[#666961]">
                      Trades/Sales channel idle
                    </div>
                    <div className="mt-1 text-[7px] uppercase tracking-[.12em] text-[#474a45]">
                      No active trade/sale sets
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-[#34362f] bg-[#0e1010] p-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#e0b940] shadow-[0_0_8px_#e0b940]" />
                <span className="text-[7px] font-bold uppercase tracking-[.25em] text-[#8d732b]">SYSTEM ONLINE</span>
              </div>
              <div className="mt-3 text-[7px] uppercase leading-relaxed tracking-[.13em] text-[#4f524d]">
                MLPEKAYOU // PERSONAL COLLECTION DATABASE
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#393b34]" />
          <span className="text-[7px] font-bold uppercase tracking-[.35em] text-[#41443e]">MLPEKAYOU // INVENTORY</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#393b34]" />
        </div>
      </div>
    </div>
  );
}
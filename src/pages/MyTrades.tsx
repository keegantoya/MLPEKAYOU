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
const [tradePage, setTradePage] = useState(0);
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light");
});
useEffect(() => {
  const syncTheme = () => {
    const root = document.documentElement;
    setIsLightMode(
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      !root.classList.contains("dark")
    );
  };
  syncTheme();
  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
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
const categoryItems = [
    { id: "star", title: "STAR", subtitle: "STAR EDITION", icon: "S" },
    { id: "moon", title: "MOON", subtitle: "ETERNAL MOON", icon: "M" },
    { id: "rainbow", title: "RAINBOW", subtitle: "ETERNAL RAINBOW", icon: "R" },
    { id: "fun", title: "FUN MOMENTS", subtitle: "FUN MOMENTS", icon: "FM" },
    { id: "tcg", title: "TCG", subtitle: "TRADING CARD GAME", icon: "TCG" },
    { id: "promos", title: "PROMOS", subtitle: "PROMOTIONAL", icon: "PR" },
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
const activeTradeCollections = collections.filter((col) =>
  normalizedTradeSets.has(normalizeSetId(col.id))
);
const tradePageCount = Math.max(1, Math.ceil(activeTradeCollections.length / 2));
const visibleTradeCollections = activeTradeCollections.slice(
  tradePage * 2,
  tradePage * 2 + 2
);
useEffect(() => {
  if (tradePage > tradePageCount - 1) {
    setTradePage(Math.max(0, tradePageCount - 1));
  }
}, [tradePage, tradePageCount]);
  return (
    <div
      className={`min-h-screen transition-colors ${
        isLightMode
          ? "bg-[#f5f5f3] text-zinc-900"
          : "bg-[#0d0f10] text-zinc-100"
      }`}
    >
      <div className="mx-auto max-w-[1500px] px-3 pb-24 pt-4 sm:px-5 lg:px-7">
        <section
          className={`mb-4 rounded-2xl border p-4 sm:p-5 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/10 bg-zinc-900"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">My Inventory</h1>
              <p className={`mt-1 text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Your collected sets and active trades.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`rounded-xl px-3 py-2 text-center ${
                  isLightMode ? "bg-zinc-100" : "bg-white/5"
                }`}
              >
                <div className="text-lg font-bold">{filteredCollections.length}</div>
                <div className={`text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Visible
                </div>
              </div>
              <div
                className={`rounded-xl px-3 py-2 text-center ${
                  isLightMode ? "bg-zinc-100" : "bg-white/5"
                }`}
              >
                <div className="text-lg font-bold">{tradeSets.length}</div>
                <div className={`text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Trades
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
          <aside
            className={`rounded-2xl border p-3 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/10 bg-zinc-900"
            }`}
          >
            <h2 className="px-2 pb-3 text-sm font-semibold">Categories</h2>
            <div className="space-y-1.5">
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    activeFilter === item.id
                      ? "bg-[#FFD54A] font-semibold text-zinc-950"
                      : isLightMode
                      ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      : "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </aside>
          <main
            className={`min-w-0 rounded-2xl border ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/10 bg-zinc-900"
            }`}
          >
            <div
              className={`flex items-center justify-between rounded-t-2xl border-b px-4 py-3 sm:px-5 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            >
              <h2 className="text-lg font-semibold">{activeCategoryLabel}</h2>
              <span className={`text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                {filteredCollections.length} set{filteredCollections.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="p-3 sm:p-4">
              {filteredCollections.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredCollections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => navigate(`/inventory/${slugMap[col.id]}`)}
                      className={`group flex min-h-[130px] items-center gap-4 rounded-2xl border p-3 text-left transition ${
                        isLightMode
                          ? "border-black/10 bg-zinc-50 hover:bg-zinc-100"
                          : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                      }`}
                    >
                      <img
                        src={col.imageUrl}
                        alt={col.title}
                        className="h-[104px] w-[82px] shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-base font-semibold leading-tight ${
                          isLightMode ? "text-zinc-900" : "text-white"
                        }`}>
                          {col.title}
                        </h3>
                        <div className={`mt-1 text-sm ${
                          isLightMode ? "text-[#806100]" : "text-[#E5C24A]"
                        }`}>
                          {col.setName}
                        </div>
                        <div className={`mt-4 flex items-center justify-between gap-3 text-xs ${
                          isLightMode ? "text-zinc-500" : "text-zinc-400"
                        }`}>
                          <span>{col.totalCards} cards</span>
                          <span className={`font-medium ${
                            isLightMode ? "text-zinc-700" : "text-zinc-300"
                          }`}>
                            Open →
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`flex min-h-[220px] items-center justify-center text-center text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-500"
                }`}>
                  No sets in this category.
                </div>
              )}
            </div>
          </main>
          <aside className="space-y-4">
            <section
              className={`rounded-2xl border p-4 ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Inventory</h2>
                <span className={`text-xs ${
                  isLightMode ? "text-[#806100]" : "text-[#E5C24A]"
                }`}>
                  Verified
                </span>
              </div>
              <div
                className={`mt-3 rounded-xl p-3 ${
                  isLightMode ? "bg-zinc-100" : "bg-white/[0.04]"
                }`}
              >
                <div className="text-xl font-bold">{tradeSets.length}</div>
                <div className={`mt-1 text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Trade sets
                </div>
              </div>
            </section>
            <section
              className={`rounded-2xl border ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-zinc-900"
              }`}
            >
              <div
                className={`flex items-center justify-between rounded-t-2xl border-b px-3 py-2.5 ${
                  isLightMode ? "border-black/10" : "border-white/10"
                }`}
              >
                {activeTradeCollections.length > 2 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setTradePage((page) =>
                        page === 0 ? tradePageCount - 1 : page - 1
                      )
                    }
                    aria-label="Previous trade sets"
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]"
                    }`}
                  >
                    ←
                  </button>
                ) : (
                  <span className="h-8 w-8" />
                )}
                <h2 className="text-sm font-semibold">My Trades</h2>
                {activeTradeCollections.length > 2 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setTradePage((page) =>
                        page === tradePageCount - 1 ? 0 : page + 1
                      )
                    }
                    aria-label="Next trade sets"
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]"
                    }`}
                  >
                    →
                  </button>
                ) : (
                  <span className="h-8 w-8" />
                )}
              </div>
              <div className="p-3">
                {activeTradeCollections.length > 0 ? (
                  <div className="space-y-2">
                    {visibleTradeCollections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => navigate(`/my-trades/view/${col.id}`)}
                        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                          isLightMode
                            ? "bg-zinc-100 hover:bg-zinc-200"
                            : "bg-white/[0.04] hover:bg-white/[0.08]"
                        }`}
                      >
                        <img
                          src={col.imageUrl}
                          alt={col.title}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {col.setName
                              ? ["friendshipsbegin", "FW", "9"].includes(col.id)
                                ? `${col.title} ${col.setName}`
                                : `${col.title} (${col.setName})`
                              : col.title}
                          </div>
                          <div className={`mt-0.5 text-xs ${
                            isLightMode ? "text-zinc-500" : "text-zinc-500"
                          }`}>
                            Open trades →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={`py-6 text-center text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-500"
                  }`}>
                    No active trade or sale sets.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";
type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
  actively_trading?: boolean;
  listing_type?: "trade" | "purchase";
};
const rarityMap: Record<string, string[]> = {
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "3": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],
  "4": ["SSR","SCR","UR","USR","AR","OR","BP","SAR"],
  "5": ["R","FR","SR","SSR","TR","TGR","MTR","UR","USR","XR"],
  "6": [ "BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],
  "7": ["N","SN","R","SR","SSR","UR","CR"],
  "8": ["N", "SN","R","SR","SSR","UR","UGR","CR"],
  "11": ["N", "SN","R","SR","SSR","UR","UGR","CR", "SCR"],
  "9": ["PR"],
  "tcgpromos": ["PR"],
  "friendshipsbegin": ["C", "U", "SR", "SPR", "ER", "GR", "CR", "PER", "PRR"],
  "FW": ["C","U","ER","SR","SPR","GR","CR","RR","PER","PSPR","PGR","PCR","PRR"],
  "12": ["C","U","ER","SR","SPR","GR","CR","RR","PER","PSPR","PGR","PCR","PRR"],
};
const getCardImage = (card: TradeCard) => {
const [rarity, number] = card.card_key.split("-");
if (card.set_id === "SD" || card.set_id === "friendshipsbegin") {
  return `/friendships-begin/${card.card_key}.webp`;
}
if (card.set_id === "FW") {
const num = card.card_key.slice(-2);
  if (card.card_key.startsWith("BP01ER")) {
    return `/fantasy-wonderland/SD01ER${num}.webp`;
  }
  if (card.card_key.startsWith("BP01PER")) {
    return `/fantasy-wonderland/SD01PER${num}.webp`;
  }
  return `/fantasy-wonderland/${card.card_key}.webp`;
}
if (card.set_id === "12") {
  return `/cards/discord/${card.card_key}.webp`;
}
  if (card.set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }
  if (card.set_id === "tcgpromos") {
  return `/tcgpromos/${card.card_key}.webp`;
}
const config: any = {
  "1": { folder: "first-edition-moon", prefix: "M1" },
  "2": { folder: "second-edition-moon", prefix: "M2" },
  "3": { folder: "third-edition-moon", prefix: "M3" },
  "4": { folder: "star-one", prefix: "S1" },
  "5": { folder: "rainbow-one", prefix: "R1" },
  "6": { folder: "rainbow-two", prefix: "R2" },
  "7": { folder: "fun-moments-one", prefix: "FM1" },
  "8": { folder: "fun-moments-two", prefix: "FM2" },
  "11": { folder: "fun-moments-three", prefix: "FM3" },
};
const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };
const c = config[card.set_id];
  if (!c) return "";
  return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}${
  card.set_id === "6" &&
  ["ST", "TR", "TGR"].includes(rarity)
    ? ".webp"
    : ".webp"
}`;
};
export default function TradingPostInner() {
const { setId } = useParams();
const navigate = useNavigate();
const [groupedTrades, setGroupedTrades] = useState<Record<string, TradeCard[]>>({});
const [profiles, setProfiles] = useState<Record<string, any>>({});
const [tradingProfiles, setTradingProfiles] = useState<Record<string, string>>({});
const [loading, setLoading] = useState(true);
const [showLoginModal, setShowLoginModal] = useState(false);
const [selectedRarity, setSelectedRarity] = useState<string | null>(
  setId === "9" || setId === "tcgpromos" ? "PR" : null
);
const [page, setPage] = useState(0);
const [openProfile, setOpenProfile] = useState<string | null>(null);
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark");
});
useEffect(() => {
  const syncTheme = () => {
    const root = document.documentElement;
    setIsLightMode(root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark"));
  };
  syncTheme();
  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
const USERS_PER_PAGE = 10;
const setNames: Record<string, string> = {
  "1": "Eternal Moon: First Edition",
  "5": "Rainbow: First Edition",
  "7": "Fun Moments: First Edition",
  "2": "Eternal Moon: Second Edition",
  "8": "Fun Moments: Second Edition",
  "3": "Eternal Moon: Third Edition",
  "11": "Fun Moments: Third Edition",
  "4": "Star: First Edition",
  "6": "Rainbow: Second Edition",
  "9": "Promo Cards",
  "friendshipsbegin": "Friendships Begin",
  "FW": "Fantasy Wonderland",
"12": "Discord",
"tcgpromos": "TCG Promos",
};
useEffect(() => {
const checkAuth = async () => {
const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setShowLoginModal(true);
    }
  };
  checkAuth();
}, []);
  useEffect(() => {
  if (!setId) return;
const load = async () => {
  setLoading(true);
let allTrades: any[] = [];
let from = 0;
const pageSize = 1000;
while (true) {
let query = supabase
  .from("for_trade")
  .select("*")
  .order("id", { ascending: false })
  .range(from, from + pageSize - 1);
if (setId === "friendshipsbegin" || setId === "SD") {
  query = query.eq("set_id", setId);
} else {
  query = query.eq("set_id", setId);
}
const { data } = await query;
  if (!data || data.length === 0) break;
  allTrades = [...allTrades, ...data];
  if (data.length < pageSize) break;
  from += pageSize;
}
const trades = allTrades;
const { data: profileData } = await supabase
  .from("profiles")
  .select("id, username, avatar_url");
const { data: tradingData } = await supabase
  .from("trading_profiles")
  .select("user_id, discord_username");
const profileMap: Record<string, any> = {};
  (profileData || []).forEach(p => profileMap[p.id] = p);
const tradingMap: Record<string, string> = {};
  (tradingData || []).forEach(p => tradingMap[p.user_id] = p.discord_username);
const tradeMap: Record<string, TradeCard[]> = {};
  (trades || []).forEach((card: TradeCard) => {
    if (!tradeMap[card.user_id]) {
      tradeMap[card.user_id] = [];
    }
    tradeMap[card.user_id].push(card);
  });
  setGroupedTrades({});
  setTimeout(() => {
    setProfiles(profileMap);
    setTradingProfiles(tradingMap);
    setGroupedTrades(tradeMap);
    setLoading(false);
  }, 0);
};
  load();
const channel = supabase
    .channel("trades")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "for_trade" },
      () => load()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}, [setId]);
if (showLoginModal) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 ${
        isLightMode ? "bg-zinc-100/95" : "bg-black/80"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-[24px] border p-6 text-center shadow-xl ${
          isLightMode
            ? "border-black/10 bg-white text-zinc-900"
            : "border-white/10 bg-[#17191a] text-white"
        }`}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD54A] text-lg font-bold text-zinc-900">
          !
        </div>
        <h2 className="mt-4 text-xl font-semibold">Login required</h2>
        <p className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
          Sign in to access collector listings in the Trading Post.
        </p>
        <button
          type="button"
          onClick={() => navigate("/trading-post")}
          className="mt-5 w-full rounded-2xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[#ffe06a]"
        >
          Return to Trading Post
        </button>
      </div>
    </div>
  );
}
const getRarity = (key: string) => {
  if (key.startsWith("RR")) return "PR";
  if (setId === "friendshipsbegin") {
const match = key.match(/SD01([A-Z]+)\d+/);
    return match ? match[1] : "";
  }
  if (setId === "FW") {
const match = key.match(/BP01([A-Z]+)\d+/);
    return match ? match[1] : "";
  }
  if (setId === "12") {
    if (key.startsWith("BP02-PER")) return "PER";
const match = key.match(/BP02-([A-Z]+)\d+/);
    return match ? match[1] : "";
  }
  if (key.includes("-")) {
    return key.split("-")[0].trim();
  }
  return "";
};
const visibleUsers = Object.entries(groupedTrades).filter(([userId, cards]) => {
  if (!tradingProfiles[userId]) return false;
  if (
    !selectedRarity &&
    setId !== "9" &&
    setId !== "tcgpromos"
  ) {
    return false;
  }
  return cards.some((c) => getRarity(c.card_key) === selectedRarity);
});
const totalPages = Math.ceil(
  visibleUsers.length / USERS_PER_PAGE
);
const filterCardsForRarity = (cards: TradeCard[]) => {
  if (setId === "9" || setId === "tcgpromos") {
    return cards.filter((card) => getRarity(card.card_key) === "PR");
  }
  if (!selectedRarity) return [];
  return cards.filter((card) => getRarity(card.card_key) === selectedRarity);
};
const sortedVisibleUsers = [...visibleUsers].sort(
  ([, cardsA], [, cardsB]) =>
    filterCardsForRarity(cardsB).length - filterCardsForRarity(cardsA).length
);
const pagedUsers = sortedVisibleUsers.slice(
  page * USERS_PER_PAGE,
  page * USERS_PER_PAGE + USERS_PER_PAGE
);
return (
  <div
    className={`min-h-screen pb-16 font-['Oxanium'] transition-colors ${
      isLightMode ? "bg-[#f6f4ef] text-zinc-900" : "bg-[#0f1112] text-white"
    }`}
  >
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate("/trading-post")}
        className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
          isLightMode
            ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
            : "border-white/10 bg-[#17191a] text-zinc-300 hover:bg-white/[0.05]"
        }`}
      >
        <ArrowLeft size={16} />
        Trading Post
      </button>
      <section
        className={`mb-4 overflow-hidden rounded-[26px] border ${
          isLightMode
            ? "border-black/10 bg-white"
            : "border-white/[0.08] bg-[#17191a]"
        }`}
      >
        <div className="h-1 bg-gradient-to-r from-[#FFD54A] via-[#e8c446] to-transparent" />
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={`text-sm font-medium ${isLightMode ? "text-[#7c6000]" : "text-[#E8CA55]"}`}>
                Collector listings
              </div>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {setNames[setId || ""] || `Set ${setId}`}
              </h1>
              <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${
                isLightMode ? "text-zinc-600" : "text-zinc-400"
              }`}>
                Choose a rarity, then click a collector's name or the View profile button to open their profile, ISO, wishlist, and trades.
              </p>
            </div>
            <div
              className={`w-fit rounded-full px-3 py-1.5 text-sm ${
                isLightMode ? "bg-zinc-100 text-zinc-600" : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              {visibleUsers.length} collectors
            </div>
          </div>
        </div>
      </section>
      {setId &&
        rarityMap[setId] &&
        setId !== "9" &&
        setId !== "tcgpromos" && (
          <section
            className={`mb-4 rounded-[22px] border p-2 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#17191a]"
            }`}
          >
            <div className="flex gap-2 overflow-x-auto">
              {rarityMap[setId].map((rarity) => {
                const active = selectedRarity === rarity;
                const label =
                  rarity === "SHINING ZR" || rarity === "SZR"
                    ? "⬦ZR"
                    : rarity === "SN"
                    ? "⬦N"
                    : rarity === "LC"
                    ? "PR"
                    : rarity === "SCR" && setId !== "4"
                    ? "⬦CR"
                    : rarity === "SAR"
                    ? "◇AR"
                    : (setId === "FW" || setId === "friendshipsbegin") &&
                      rarity.startsWith("P")
                    ? `※${rarity.slice(1)}`
                    : rarity;
                return (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => {
                      setSelectedRarity(active ? null : rarity);
                      setPage(0);
                    }}
                    className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-[#FFD54A] text-zinc-900"
                        : isLightMode
                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      {loading && (
        <section
          className={`rounded-[24px] border py-12 text-center ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#17191a]"
          }`}
        >
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-400/30 border-t-[#D5AD1F]" />
          <div className={`mt-3 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
            Loading listings…
          </div>
        </section>
      )}
      {!loading && !selectedRarity && setId !== "9" && setId !== "tcgpromos" && (
        <section
          className={`rounded-[24px] border px-6 py-10 text-center ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#17191a]"
          }`}
        >
          <div className="text-base font-semibold">Choose a rarity</div>
          <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
            Collector listings will appear here.
          </p>
        </section>
      )}
      {!loading &&
        (selectedRarity || setId === "9" || setId === "tcgpromos") &&
        pagedUsers.length === 0 && (
          <section
            className={`rounded-[24px] border px-6 py-10 text-center ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#17191a]"
            }`}
          >
            <div className="text-base font-semibold">No listings found</div>
            <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              No collectors match this rarity right now.
            </p>
          </section>
        )}
      {!loading && pagedUsers.length > 0 && (
        <div className="space-y-3">
          {pagedUsers.map(([userId, cards]) => {
            const filteredCards = filterCardsForRarity(cards);
            const assets = getProfileAssets(profiles[userId]);
            const tradeCount = filteredCards.filter(
              (card) => card.listing_type !== "purchase"
            ).length;
            const saleCount = filteredCards.filter(
              (card) => card.listing_type === "purchase"
            ).length;
            if (openProfile === userId) {
              return (
                <section
                  key={userId}
                  className={`overflow-hidden rounded-[24px] border ${
                    isLightMode
                      ? "border-[#c9a62d]/40 bg-white"
                      : "border-[#FFD54A]/25 bg-[#17191a]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${
                      isLightMode ? "border-black/10" : "border-white/[0.08]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={assets.avatar}
                        alt={profiles[userId]?.username || userId}
                        className={`h-11 w-11 shrink-0 rounded-full border object-cover ${
                          isLightMode ? "border-black/10" : "border-white/15"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold">
                          {profiles[userId]?.username || userId}
                        </div>
                        <div className={`mt-0.5 text-sm ${
                          isLightMode ? "text-zinc-500" : "text-zinc-400"
                        }`}>
                          Collector profile · ISO · Wishlist · Trades
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenProfile(null)}
                      className={`rounded-full px-3 py-2 text-sm font-medium ${
                        isLightMode
                          ? "bg-zinc-100 text-zinc-700"
                          : "bg-white/[0.06] text-zinc-300"
                      }`}
                    >
                      Close
                    </button>
                  </div>
                  <iframe
                    src={`/${encodeURIComponent(
                      profiles[userId]?.username ?? ""
                    )}?embed=1`}
                    className="h-[70vh] w-full border-0 sm:h-[540px]"
                    loading="lazy"
                  />
                </section>
              );
            }
            return (
              <section
                key={userId}
                className={`overflow-hidden rounded-[24px] border ${
                  isLightMode
                    ? "border-black/10 bg-white"
                    : "border-white/[0.08] bg-[#17191a]"
                }`}
              >
                <div
                  className={`flex items-center gap-3 border-b px-4 py-3 sm:px-5 ${
                    isLightMode ? "border-black/10" : "border-white/[0.08]"
                  }`}
                >
                  <img
                    src={assets.avatar}
                    alt={profiles[userId]?.username || userId}
                    className={`h-12 w-12 shrink-0 rounded-full border object-cover ${
                      isLightMode ? "border-black/10" : "border-white/15"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenProfile(userId)}
                        className={`truncate text-base font-semibold underline decoration-2 underline-offset-4 ${
                          isLightMode
                            ? "text-[#715700] decoration-[#b99826]/40 hover:text-black"
                            : "text-[#FFD54A] decoration-[#FFD54A]/40 hover:text-[#ffe98a]"
                        }`}
                      >
                        {profiles[userId]?.username || userId}
                      </button>
                      {assets.verification && (
                        <img
                          src={assets.verification.badge}
                          alt={assets.verification.label}
                          title={assets.verification.label}
                          className="h-4 w-4 shrink-0 object-contain"
                        />
                      )}
                    </div>
                    <div className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}>
                      {tradingProfiles[userId] && (
                        <span>Discord: {tradingProfiles[userId]}</span>
                      )}
                      <span>{tradeCount} trade{tradeCount === 1 ? "" : "s"}</span>
                      <span>{saleCount} sale{saleCount === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenProfile(userId)}
                    className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        : "bg-white/[0.07] text-zinc-200 hover:bg-white/[0.12]"
                    }`}
                  >
                    View profile →
                  </button>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">Available cards</div>
                    <div className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      {filteredCards.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 [grid-auto-flow:dense]">
                    {filteredCards
                      .sort((a, b) => {
                        if (setId === "friendshipsbegin") {
                          return a.card_key.localeCompare(b.card_key);
                        }
                        const getNum = (key: string) => {
                          if (!key.includes("-")) {
                            const match = key.match(/(\d+)$/);
                            return match ? parseInt(match[1]) : 0;
                          }
                          return parseInt(key.split("-")[1]);
                        };
                        return getNum(a.card_key) - getNum(b.card_key);
                      })
                      .map((card) => {
                        const [rarity, number] = card.card_key.split("-");
                        const isDoubleCard =
                          card.set_id === "3" &&
                          rarity === "SZR" &&
                          Number(number) === 1;
                        return (
                          <div
                            key={card.id}
                            className={`relative overflow-hidden rounded-[14px] border ${
                              isLightMode
                                ? "border-black/10 bg-zinc-100"
                                : "border-white/[0.08] bg-[#0d0f10]"
                            } ${
                              isDoubleCard ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"
                            }`}
                          >
                            <img
                              src={getCardImage(card)}
                              alt={card.card_key}
                              className="absolute inset-[-2.5%] h-[105%] w-[105%] max-w-none object-cover"
                            />
                            {card.actively_trading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                <span className="rounded-full bg-[#FFD54A] px-2.5 py-1 text-xs font-semibold text-zinc-900">
                                  Active
                                </span>
                              </div>
                            )}
                            <div
                              className={`absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                card.listing_type === "trade"
                                  ? "bg-black/75 text-[#FFD54A]"
                                  : "bg-[#FFD54A] text-zinc-900"
                              }`}
                            >
                              {card.listing_type === "trade" ? "⇄" : "$"}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
      {totalPages > 1 && (
        <div
          className={`mt-5 flex items-center justify-between rounded-[20px] border p-2 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#17191a]"
          }`}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-30 ${
              isLightMode
                ? "bg-zinc-100 text-zinc-700"
                : "bg-white/[0.06] text-zinc-300"
            }`}
          >
            ← Previous
          </button>
          <span className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-30 ${
              isLightMode
                ? "bg-zinc-100 text-zinc-700"
                : "bg-white/[0.06] text-zinc-300"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  </div>
);
}

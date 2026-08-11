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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050707]/95 px-4 backdrop-blur-md">
      {/* TECH GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,212,74,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* SCANLINES */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.025)_4px)]" />

      {/* AMBIENT GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD54A]/[0.025] blur-3xl" />

      {/* LOGIN PANEL */}
      <div className="relative w-[92%] max-w-lg overflow-hidden border border-white/[0.10] bg-[#080b0b] shadow-[0_30px_100px_rgba(0,0,0,.8)]">

        {/* TOP STATUS BAR */}
        <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#050707] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.9)]" />

            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-red-300/95">
              ACCESS DENIED
            </span>
          </div>

          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
            AUTH NODE
          </span>
        </div>

        {/* CONTENT */}
        <div className="relative p-6 sm:p-8">

          {/* CORNER BRACKETS */}
          <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l border-t border-[#FFD54A]/50" />
          <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/25" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b border-l border-[#FFD54A]/20" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b border-r border-[#FFD54A]/50" />

          {/* ACCESS CORE */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#FFD54A]/30 bg-[#FFD54A]/[0.06] shadow-[0_0_30px_rgba(255,212,74,.08)]">
            <div className="relative flex h-8 w-8 items-center justify-center border border-[#FFD54A]/70">
              <span className="absolute h-2 w-2 bg-[#FFD54A] shadow-[0_0_12px_#FFD54A]" />
              <span className="absolute inset-1 border border-[#FFD54A]/20" />
            </div>
          </div>

          {/* TITLE */}
          <div className="mt-6 text-center">
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.35em] text-zinc-300">
              TRADING POST
            </div>

            <h2 className="mt-2 font-['Oxanium'] text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
              Login Required
            </h2>

            <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#FFD54A]/70 to-transparent" />
          </div>

          {/* MESSAGE */}
          <div className="mt-6 border border-white/[0.07] bg-[#050707] px-5 py-4 text-center">
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Authorization Required
            </div>

            <p className="mt-2 font-mono text-[8px] uppercase leading-5 tracking-[0.07em] text-zinc-300">
              You cannot access this page without being signed in to an account.
            </p>
          </div>

          {/* RETURN BUTTON */}
          <button
            onClick={() => navigate("/trading-post")}
            className="group relative mt-5 w-full overflow-hidden border border-[#FFD54A]/60 bg-[#FFD54A] px-4 py-3 font-['Oxanium'] text-[10px] font-black uppercase tracking-[0.2em] text-[#090b0d] transition-all duration-200 hover:bg-[#FFE27A] hover:shadow-[0_0_30px_rgba(255,212,74,.18)]"
          >
            <span className="absolute left-0 top-0 h-px w-10 bg-white/80" />
            <span className="absolute bottom-0 right-0 h-px w-10 bg-black/30" />

            <span className="flex items-center justify-center gap-3">
              <span>RETURN TO TRADING POST</span>
              <span className="text-sm transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </span>
          </button>

          {/* SYSTEM FOOTER */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-white/[0.06]" />

            <span className="font-mono text-[7px] uppercase tracking-[0.3em] text-zinc-400">
              SECURE SESSION GATE
            </span>

            <span className="h-px w-8 bg-white/[0.06]" />
          </div>
        </div>

        {/* BOTTOM STATUS */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#050707] px-4 py-2">
          <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-400">
            STATUS: UNAUTHORIZED
          </span>

          <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-[#FFD54A]/40">
            MLPEKAYOU // SYSTEM
          </span>
        </div>
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
return (
  <div className="min-h-screen bg-[#171717] font-['Oxanium'] text-white">
    {/* SUBTLE TECH GRID */}
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.018]"
      style={{
        backgroundImage:
          "linear-gradient(#FFD400 1px, transparent 1px), linear-gradient(90deg, #FFD400 1px, transparent 1px)",
        backgroundSize: "46px 46px",
      }}
    />

    <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">

      {/* TOP BAR */}
      <div className="mb-6 flex items-center justify-between border-b border-white/[0.07] pb-4">
        <button
          onClick={() => navigate("/trading-post")}
          className="
            group
            flex
            items-center
            gap-2
            border
            border-white/[0.08]
            bg-[#121212]
            px-3
            py-2
            font-mono
            text-[7px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-white/35
            transition-all
            hover:border-[#FFD400]/40
            hover:text-[#FFD400]
          "
        >
          <ArrowLeft
            className="transition-transform group-hover:-translate-x-0.5"
            size={12}
          />
          Trading Post
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.6)]" />

          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/60">
            TRADING NETWORK
          </span>

          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#FFD400]/85">
            ONLINE
          </span>
        </div>
      </div>

      {/* SET HEADER */}
      <div className="relative mb-6 overflow-hidden border border-white/[0.08] bg-[#121212]">
        {/* Technical corners */}
        <div className="absolute left-0 top-0 h-6 w-6 border-l border-t border-[#FFD400]/55" />
        <div className="absolute right-0 top-0 h-6 w-6 border-r border-t border-[#FFD400]/30" />
        <div className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#FFD400]/20" />
        <div className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#FFD400]/35" />

        <div className="px-5 py-5 sm:px-7">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.6)]" />

            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[#FFD400]/90">
              TRADING POST // SET MARKET
            </span>

            <span className="h-px w-10 bg-[#FFD400]/25" />
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-['Oxanium'] text-2xl font-black uppercase leading-none tracking-[0.025em] text-white sm:text-4xl">
                {setNames[setId || ""] || `Set ${setId}`}
              </h1>

              <p className="mt-2 max-w-2xl font-mono text-[8px] uppercase leading-[1.7] tracking-[0.12em] text-white/65 sm:text-[8px]">
                Select a rarity to view available collector listings.
                Click a username to inspect their ISO, wishlist, and full
                trading inventory.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 border-l border-white/[0.08] pl-4">
              <div>
                <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
                  COLLECTORS
                </div>

                <div className="mt-1 font-['Oxanium'] text-lg font-black text-[#FFD400]">
                  {visibleUsers.length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>

              <div className="h-8 w-px bg-white/[0.08]" />

              <div>
                <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
                  PAGE
                </div>

                <div className="mt-1 font-['Oxanium'] text-lg font-black text-white/70">
                  {(page + 1)
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RARITY SELECTOR */}
      {setId &&
        rarityMap[setId] &&
        setId !== "9" &&
        setId !== "tcgpromos" && (
          <div className="mb-6 border border-white/[0.07] bg-[#121212]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 bg-[#FFD400]" />

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/65">
                  FILTER BY RARITY
                </span>
              </div>

              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#FFD400]/80">
                {selectedRarity
                  ? `ACTIVE // ${selectedRarity}`
                  : "SELECT RARITY"}
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto p-2">
              {rarityMap[setId].map((rarity) => {
                const active =
                  selectedRarity === rarity;

                return (
                  <button
                    key={rarity}
                    onClick={() => {
                      setSelectedRarity(
                        active ? null : rarity
                      );
                      setPage(0);
                    }}
                    className={`
                      relative
                      shrink-0
                      border
                      px-3
                      py-2
                      font-['Oxanium']
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      transition-all
                      duration-200
                      ${
                        active
                          ? "border-[#FFD400] bg-[#FFD400] text-[#171717] shadow-[0_0_12px_rgba(255,212,0,.15)]"
                          : "border-white/[0.08] bg-[#1a1a1a] text-white/35 hover:border-[#FFD400]/35 hover:text-white/75"
                      }
                    `}
                  >
                    {(() => {
                      if (
                        rarity === "SHINING ZR"
                      )
                        return "⬦ZR";

                      if (rarity === "SZR")
                        return "⬦ZR";

                      if (rarity === "SN")
                        return "⬦N";

                      if (rarity === "LC")
                        return "PR";

                      if (
                        rarity === "SCR" &&
                        setId !== "4"
                      )
                        return "⬦CR";

                      if (rarity === "SAR")
                        return "◇AR";

                      if (
                        (setId === "FW" ||
                          setId ===
                            "friendshipsbegin") &&
                        rarity.startsWith("P")
                      ) {
                        return `※${rarity.slice(1)}`;
                      }

                      return rarity;
                    })()}
                  </button>
                );
              })}
            </div>

            {!selectedRarity && (
              <div className="border-t border-white/[0.05] px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
                Select a rarity above to access collector listings.
              </div>
            )}
          </div>
        )}

      {/* LOADING */}
      {loading && (
        <div className="border border-white/[0.07] bg-[#121212] py-16 text-center">
          <div className="mx-auto mb-3 h-5 w-5 animate-spin border-2 border-white/10 border-t-[#FFD400]" />

          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/65">
            Loading Trading Network
          </div>
        </div>
      )}

      {/* COLLECTOR LIST */}
      {!loading && (
        <>
          <div className="space-y-3">
            {visibleUsers
              .sort(
                (
                  [userIdA, cardsA],
                  [userIdB, cardsB]
                ) => {
                  const hasDiscordA =
                    !!tradingProfiles[userIdA];

                  const hasDiscordB =
                    !!tradingProfiles[userIdB];

                  if (
                    hasDiscordA !==
                    hasDiscordB
                  ) {
                    return hasDiscordA ? -1 : 1;
                  }

                  const getRarity = (
                    key: string
                  ) => {
                    if (key.startsWith("RR"))
                      return "PR";

                    if (
                      setId ===
                      "friendshipsbegin"
                    ) {
                      const match =
                        key.match(
                          /SD01([A-Z]+)\d+/
                        );

                      return match
                        ? match[1]
                        : "";
                    }

                    if (setId === "FW") {
                      const match =
                        key.match(
                          /BP01([A-Z]+)\d+/
                        );

                      return match
                        ? match[1]
                        : "";
                    }

                    if (setId === "12") {
                      if (
                        key.startsWith(
                          "BP02-PER"
                        )
                      )
                        return "PER";

                      const match =
                        key.match(
                          /BP02-([A-Z]+)\d+/
                        );

                      return match
                        ? match[1]
                        : "";
                    }

                    if (key.includes("-")) {
                      return key
                        .split("-")[0]
                        .trim();
                    }

                    return "";
                  };

                  const countA =
                    selectedRarity
                      ? cardsA.filter(
                          (c) =>
                            getRarity(
                              c.card_key
                            ) ===
                            selectedRarity
                        ).length
                      : 0;

                  const countB =
                    selectedRarity
                      ? cardsB.filter(
                          (c) =>
                            getRarity(
                              c.card_key
                            ) ===
                            selectedRarity
                        ).length
                      : 0;

                  return countB - countA;
                }
              )
              .filter(
                ([userId, cards]) => {
                  if (
                    !tradingProfiles[userId]
                  )
                    return false;

                  if (
                    !selectedRarity &&
                    setId !== "9" &&
                    setId !== "tcgpromos"
                  ) {
                    return false;
                  }

                  const filteredCards =
                    cards.filter((c) => {
                      if (
                        c.card_key.startsWith(
                          "RR"
                        )
                      ) {
                        return (
                          selectedRarity ===
                          "PR"
                        );
                      }

                      if (
                        setId ===
                        "friendshipsbegin"
                      ) {
                        const match =
                          c.card_key.match(
                            /SD01([A-Z]+)\d+/
                          );

                        return !!(
                          match &&
                          match[1] ===
                            selectedRarity
                        );
                      }

                      if (setId === "FW") {
                        const match =
                          c.card_key.match(
                            /BP01([A-Z]+)\d+/
                          );

                        return !!(
                          match &&
                          match[1] ===
                            selectedRarity
                        );
                      }

                      if (setId === "12") {
                        if (
                          c.card_key.startsWith(
                            "BP02-PER"
                          )
                        ) {
                          return (
                            selectedRarity ===
                            "PER"
                          );
                        }

                        const match =
                          c.card_key.match(
                            /BP02-([A-Z]+)\d+/
                          );

                        return !!(
                          match &&
                          match[1] ===
                            selectedRarity
                        );
                      }

                      return (
                        c.card_key
                          .split("-")[0]
                          .trim() ===
                        selectedRarity
                      );
                    });

                  return (
                    filteredCards.length > 0
                  );
                }
              )
              .slice(
                page * USERS_PER_PAGE,
                page * USERS_PER_PAGE +
                  USERS_PER_PAGE
              )
              .map(
                ([userId, cards], index) => {
                  if (
                    !tradingProfiles[userId]
                  )
                    return null;

                  if (
                    !selectedRarity &&
                    setId !== "9" &&
                    setId !== "tcgpromos"
                  )
                    return null;

                  const filteredCards =
                    cards.filter((c) => {
                      if (
                        c.card_key.startsWith(
                          "RR"
                        )
                      ) {
                        return (
                          selectedRarity ===
                          "PR"
                        );
                      }

                      if (
                        setId ===
                        "friendshipsbegin"
                      ) {
                        const match =
                          c.card_key.match(
                            /SD01([A-Z]+)\d+/
                          );

                        return (
                          match &&
                          match[1] ===
                            selectedRarity
                        );
                      }

                      if (setId === "FW") {
                        const match =
                          c.card_key.match(
                            /BP01([A-Z]+)\d+/
                          );

                        return (
                          match &&
                          match[1] ===
                            selectedRarity
                        );
                      }

                      if (setId === "12") {
                        if (
                          c.card_key.startsWith(
                            "BP02-PER"
                          )
                        ) {
                          return (
                            selectedRarity ===
                            "PER"
                          );
                        }

                        const match =
                          c.card_key.match(
                            /BP02-([A-Z]+)\d+/
                          );

                        return (
                          match &&
                          match[1] ===
                            selectedRarity
                        );
                      }

                      return (
                        c.card_key
                          .split("-")[0]
                          .trim() ===
                        selectedRarity
                      );
                    });

                  if (
                    filteredCards.length === 0
                  )
                    return null;

                  const assets =
                    getProfileAssets(
                      profiles[userId]
                    );

                  const tradeCount =
                    filteredCards.filter(
                      (c) =>
                        c.listing_type !==
                        "purchase"
                    ).length;

                  const saleCount =
                    filteredCards.filter(
                      (c) =>
                        c.listing_type ===
                        "purchase"
                    ).length;

                  /*
                   * PROFILE DRAWER
                   * Keep the existing username
                   * interaction, but make the
                   * opened state feel intentional.
                   */
                  if (
                    openProfile === userId
                  ) {
                    return (
                      <div
                        key={userId}
                        className="
                          overflow-hidden
                          border
                          border-[#FFD400]/30
                          bg-[#111111]
                          shadow-[0_12px_40px_rgba(0,0,0,.45)]
                        "
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#151515] px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={assets.avatar}
                                alt={
                                  profiles[userId]
                                    ?.username ||
                                  userId
                                }
                                className="
                                  h-9
                                  w-9
                                  rounded-full
                                  border
                                  border-[#FFD400]/45
                                  object-cover
                                "
                              />

                              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#FFD400] shadow-[0_0_7px_rgba(255,212,0,.7)]" />
                            </div>

                            <div className="min-w-0">
                              <div className="truncate font-['Oxanium'] text-[10px] font-bold uppercase tracking-[0.04em] text-white/85">
                                {profiles[userId]
                                  ?.username ||
                                  userId}
                              </div>

                              <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD400]/85">
                                PROFILE TERMINAL //{" "}
                                {index + 1}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setOpenProfile(null)
                            }
                            className="
                              shrink-0
                              border
                              border-white/[0.08]
                              bg-[#1b1b1b]
                              px-3
                              py-2
                              font-mono
                              text-[6px]
                              font-bold
                              uppercase
                              tracking-[0.16em]
                              text-white/35
                              transition-all
                              hover:border-[#FFD400]/40
                              hover:text-[#FFD400]
                            "
                          >
                            CLOSE
                          </button>
                        </div>

                        <div className="border-b border-white/[0.05] bg-[#0f0f0f] px-4 py-2">
                          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
                            ISO / WISHLIST / FULL TRADES
                          </span>
                        </div>

                        <iframe
                          src={`/${encodeURIComponent(
                            profiles[userId]
                              ?.username ?? ""
                          )}?embed=1`}
                          className="h-[70vh] w-full border-0 sm:h-[540px]"
                          loading="lazy"
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={userId}
                      className="
                        group
                        relative
                        overflow-hidden
                        border
                        border-white/[0.08]
                        bg-[#121212]
                        transition-all
                        duration-200
                        hover:border-[#FFD400]/30
                        hover:bg-[#151515]
                      "
                    >
                      {/* GOLD EDGE */}
                      <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-[#FFD400]/10 transition-colors duration-200 group-hover:bg-[#FFD400]/60" />

                      {/* COLLECTOR HEADER */}
                      <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-3">
                          {/* RANK */}
                          <div className="hidden h-8 w-8 shrink-0 items-center justify-center border border-white/[0.08] bg-[#0e0e0e] sm:flex">
                            <span className="font-['Oxanium'] text-[9px] font-black text-white/20">
                              {(index + 1)
                                .toString()
                                .padStart(
                                  2,
                                  "0"
                                )}
                            </span>
                          </div>

                          {/* AVATAR */}
                          <img
                            src={assets.avatar}
                            alt={
                              profiles[userId]
                                ?.username ||
                              userId
                            }
                            className="
                              h-11
                              w-11
                              shrink-0
                              rounded-full
                              border
                              border-[#FFD400]/35
                              object-cover
                              transition-colors
                              group-hover:border-[#FFD400]/70
                            "
                          />

                          {/* USER INFO */}
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <button
                                onClick={() =>
                                  setOpenProfile(
                                    openProfile ===
                                      userId
                                      ? null
                                      : userId
                                  )
                                }
                                className="
                                  truncate
                                  font-['Oxanium']
                                  text-sm
                                  font-bold
                                  uppercase
                                  tracking-[0.025em]
                                  text-[#FFD400]
                                  transition-colors
                                  hover:text-[#ffe98a]
                                  hover:underline
                                  hover:decoration-[#FFD400]/30
                                  hover:underline-offset-4
                                "
                              >
                                {profiles[userId]
                                  ?.username ||
                                  userId}
                              </button>

                              {assets.verification && (
                                <img
                                  src={
                                    assets
                                      .verification
                                      .badge
                                  }
                                  alt={
                                    assets
                                      .verification
                                      .label
                                  }
                                  title={
                                    assets
                                      .verification
                                      .label
                                  }
                                  className="h-4 w-4 shrink-0 object-contain"
                                />
                              )}

                              {tradingProfiles[
                                userId
                              ] && (
                                <span
                                  title="Trading profile connected"
                                  className="
                                    h-1.5
                                    w-1.5
                                    shrink-0
                                    rounded-full
                                    bg-[#FFD400]
                                    shadow-[0_0_7px_rgba(255,212,0,.65)]
                                  "
                                />
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                              {tradingProfiles[
                                userId
                              ] && (
                                <span className="truncate font-mono text-[8px] uppercase tracking-[0.13em] text-white/60">
                                  DISCORD //{" "}
                                  <span className="text-white/45">
                                    {
                                      tradingProfiles[
                                        userId
                                      ]
                                    }
                                  </span>
                                </span>
                              )}

                              <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/60">
                                {tradeCount} TRADE
                                {tradeCount === 1
                                  ? ""
                                  : "S"}
                              </span>

                              <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/60">
                                {saleCount} SALE
                                {saleCount === 1
                                  ? ""
                                  : "S"}
                              </span>
                            </div>
                          </div>

                          {/* USERNAME ACTION */}
                          <button
                            onClick={() =>
                              setOpenProfile(
                                openProfile ===
                                  userId
                                  ? null
                                  : userId
                              )
                            }
                            className="
                              hidden
                              shrink-0
                              border
                              border-white/[0.08]
                              bg-[#171717]
                              px-3
                              py-2
                              font-mono
                              text-[6px]
                              font-bold
                              uppercase
                              tracking-[0.14em]
                              text-white/25
                              transition-all
                              hover:border-[#FFD400]/40
                              hover:text-[#FFD400]
                              sm:block
                            "
                          >
                            VIEW PROFILE
                          </button>
                        </div>
                      </div>

                      {/* MOBILE DISCORD LINE */}
                      {tradingProfiles[userId] && (
                        <div className="border-b border-white/[0.04] bg-[#101010] px-4 py-2 sm:hidden">
                          <span className="font-mono text-[6px] uppercase tracking-[0.14em] text-white/20">
                            DISCORD //
                          </span>

                          <span className="ml-2 font-mono text-[8px] font-bold tracking-[0.08em] text-[#FFD400]/90">
                            {
                              tradingProfiles[
                                userId
                              ]
                            }
                          </span>
                        </div>
                      )}

                      {/* CARD AREA */}
                      <div className="p-3 sm:p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-1 w-1 bg-[#FFD400]/70" />

                            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/60">
                              AVAILABLE LISTINGS
                            </span>
                          </div>

                          <span className="font-mono text-[8px] font-bold tracking-[0.12em] text-[#FFD400]/85">
                            {filteredCards.length
                              .toString()
                              .padStart(2, "0")}{" "}
                            CARDS
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 [grid-auto-flow:dense]">
                          {filteredCards
                            .sort((a, b) => {
                              if (
                                setId ===
                                "friendshipsbegin"
                              ) {
                                return a.card_key.localeCompare(
                                  b.card_key
                                );
                              }

                              const getNum = (
                                key: string
                              ) => {
                                if (
                                  !key.includes(
                                    "-"
                                  )
                                ) {
                                  const match =
                                    key.match(
                                      /(\d+)$/
                                    );

                                  return match
                                    ? parseInt(
                                        match[1]
                                      )
                                    : 0;
                                }

                                return parseInt(
                                  key.split(
                                    "-"
                                  )[1]
                                );
                              };

                              return (
                                getNum(
                                  a.card_key
                                ) -
                                getNum(
                                  b.card_key
                                )
                              );
                            })
                            .map((card) => {
                              const [
                                rarity,
                                number,
                              ] =
                                card.card_key.split(
                                  "-"
                                );

                              const isDoubleCard =
                                card.set_id ===
                                  "3" &&
                                rarity ===
                                  "SZR" &&
                                Number(
                                  number
                                ) === 1;

                              return (
                              <div
                                key={card.id}
                                className={`
                                  group/card
                                  relative
                                  overflow-hidden
                                  rounded-[10px]
                                  border
                                  border-white/[0.08]
                                  bg-[#0d0d0d]
                                  shadow-[0_2px_8px_rgba(0,0,0,.28)]
                                  transition-all
                                  duration-200
                                  hover:border-[#FFD400]/35
                                  hover:shadow-[0_4px_14px_rgba(0,0,0,.4)]
                                  ${
                                    isDoubleCard
                                      ? "col-span-2 aspect-[10/7]"
                                      : "aspect-[5/7]"
                                  }
                                `}
                              >
                                <img
                                  src={getCardImage(card)}
                                  alt={card.card_key}
                                  className="
                                    absolute
                                    inset-[-3%]
                                    h-[106%]
                                    w-[106%]
                                    max-w-none
                                    object-cover
                                    transition-transform
                                    duration-300
                                    group-hover/card:scale-[1.025]
                                  "
                                />

                                  {/* ACTIVE TRADING */}
                                  {card.actively_trading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#0b0b0b]/80">
                                      <div className="border border-[#FFD400]/45 bg-[#111111]/90 px-2 py-1.5 text-center">
                                        <div className="mb-1 h-px bg-[#FFD400]/30" />

                                        <span className="font-mono text-[6px] font-bold uppercase tracking-[0.14em] text-[#FFD400] sm:text-[7px]">
                                          ACTIVELY
                                          <br />
                                          TRADING
                                        </span>

                                        <div className="mt-1 h-px bg-[#FFD400]/30" />
                                      </div>
                                    </div>
                                  )}

                                  {/* LISTING TYPE */}
                                  <div
                                    className={`
                                      absolute
                                      left-1.5
                                      top-1.5
                                      flex
                                      h-6
                                      w-6
                                      items-center
                                      justify-center
                                      border
                                      text-[11px]
                                      font-black
                                      shadow-[0_2px_8px_rgba(0,0,0,.45)]
                                      ${
                                        card.listing_type ===
                                        "trade"
                                          ? "border-[#FFD400]/40 bg-[#111111]/90 text-[#FFD400]"
                                          : "border-[#FFD400] bg-[#FFD400] text-[#171717]"
                                      }
                                    `}
                                  >
                                    {card.listing_type ===
                                    "trade"
                                      ? "⇄"
                                      : "$"}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* BOTTOM STATUS RAIL */}
                      <div className="flex items-center justify-between border-t border-white/[0.05] bg-[#101010] px-4 py-2">
                        <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-white/55">
                          LISTING NODE //
                          {(index + 1)
                            .toString()
                            .padStart(
                              2,
                              "0"
                            )}
                        </span>

                        <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-[#FFD400]/80">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
{/* EMPTY / SELECT RARITY */}
{visibleUsers.length === 0 && (
  <>
    {!selectedRarity &&
    setId !== "9" &&
    setId !== "tcgpromos" ? (
      <div className="border border-white/[0.07] bg-[#121212] px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center border border-[#FFD400]/20 bg-[#171717]">
          <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.7)]" />
        </div>

        <div className="font-['Oxanium'] text-xs font-bold uppercase tracking-[0.12em] text-white/55">
          Select a rarity from the list to begin your search.
        </div>
      </div>
    ) : (
      <div className="border border-dashed border-white/[0.1] bg-[#121212] px-6 py-16 text-center">
        <div className="mx-auto mb-3 h-8 w-8 border border-[#FFD400]/20 bg-[#171717]" />

        <div className="font-['Oxanium'] text-xs font-bold uppercase tracking-[0.16em] text-white/30">
          NO LISTINGS FOUND
        </div>

        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/55">
          NO COLLECTORS MATCH THE CURRENT FILTER
        </div>
      </div>
    )}
  </>
)}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between border border-white/[0.07] bg-[#121212] px-3 py-2">
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.max(0, p - 1)
                  )
                }
                disabled={page === 0}
                className="
                  border
                  border-white/[0.08]
                  bg-[#171717]
                  px-3
                  py-2
                  font-mono
                  text-[6px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-white/30
                  transition-all
                  hover:border-[#FFD400]/35
                  hover:text-[#FFD400]
                  disabled:cursor-not-allowed
                  disabled:opacity-20
                "
              >
                ← PREVIOUS
              </button>

              <div className="text-center">
                <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/55">
                  PAGE
                </div>

                <div className="mt-0.5 font-['Oxanium'] text-xs font-bold text-[#FFD400]/70">
                  {page + 1} / {totalPages}
                </div>
              </div>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages - 1,
                      p + 1
                    )
                  )
                }
                disabled={
                  page >= totalPages - 1
                }
                className="
                  border
                  border-white/[0.08]
                  bg-[#171717]
                  px-3
                  py-2
                  font-mono
                  text-[6px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-white/30
                  transition-all
                  hover:border-[#FFD400]/35
                  hover:text-[#FFD400]
                  disabled:cursor-not-allowed
                  disabled:opacity-20
                "
              >
                NEXT →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
}
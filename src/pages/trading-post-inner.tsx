import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
  actively_trading?: boolean;
};

const rarityMap: Record<string, string[]> = {
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "3": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],
  "5": ["R","FR","SR","SSR","TR","TGR","MTR","UR","USR","XR"],
  "7": ["N","SN","R","SR","SSR","UR","CR"],
  "8": ["N", "SN","R","SR","SSR","UR","UGR","CR"],
  "9": ["PR"],
  "10": ["LC"],
  "tcgpromos": ["PR"],
  "friendshipsbegin": ["C", "U", "SR", "SPR", "ER", "GR", "CR", "PER", "PRR"],
  "FW": ["C","U","ER","SR","SPR","GR","CR","RR","PER","PSPR","PGR","PCR","PRR"],
};

const getCardImage = (card: TradeCard) => {
  const [rarity, number] = card.card_key.split("-");

if (card.set_id === "SD" || card.set_id === "friendshipsbegin") {
  return `/friendships-begin/${card.card_key}.png`;
}

if (card.set_id === "FW") {

  const num = card.card_key.slice(-2);

  if (card.card_key.startsWith("BP01ER")) {
    return `/fantasy-wonderland/SD01ER${num}.png`;
  }

  if (card.card_key.startsWith("BP01PER")) {
    return `/fantasy-wonderland/SD01PER${num}.png`;
  }

  return `/fantasy-wonderland/${card.card_key}.png`;
}

  if (card.set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (card.set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }
  if (card.set_id === "tcgpromos") {
  return `/tcgpromos/${card.card_key}.png`;
}

  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
    "3": { folder: "third-edition-moon", prefix: "M3" },
  };

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const c = config[card.set_id];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
};

export default function TradingPostInner() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [groupedTrades, setGroupedTrades] = useState<Record<string, TradeCard[]>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [tradingProfiles, setTradingProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  const setNames: Record<string, string> = {
  "1": "Eternal Moon: First Edition",
  "5": "Rainbow: First Edition",
  "7": "Fun Moments: First Edition",
  "2": "Eternal Moon: Second Edition",
  "8": "Fun Moments: Second Edition",
  "3": "Eternal Moon: Third Edition",
  "9": "Promo Cards",
  "10": "Serialized & Limited Cards",
  "friendshipsbegin": "Friendships Begin",
  "FW": "Fantasy Wonderland",
  "tcgpromos": "TCG Promos",
};

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
    .select("id, username");

  const { data: tradingData } = await supabase
    .from("trading_profiles")
    .select("*");

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
  return (
    <div
      className="min-h-screen"
      style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
    >
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/trading-post")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trading Post
        </button>

        <h1
  className="
    block
    w-fit
    max-w-full
    mx-auto
    mb-6
    px-4 sm:px-6
    py-2
    text-center
    rounded-lg
    bg-gradient-to-b
    from-[#7c5aa6]
    to-[#5a3e84]
    border border-[#d4af37]/40
    font-bold
    text-xl sm:text-3xl
    tracking-wide
    text-[#f5e6a8]
    [text-shadow:1px_1px_0_#3b2a6a,-1px_-1px_0_#ffffff40]
    shadow-sm
  "
>
  {setNames[setId || ""] || `Set ${setId}`}
</h1>

        {/* 🔥 RARITY FILTER */}
        {setId && rarityMap[setId] && (
          <>
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {rarityMap[setId].map((rarity) => (
                <button
                  key={rarity}
                  onClick={() =>
                    setSelectedRarity(
                      selectedRarity === rarity ? null : rarity
                    )
                  }
                  className={`px-4 py-1.5 text-xs font-medium rounded-full border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 shadow-sm transition-all duration-150 ${
  selectedRarity === rarity
    ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md scale-105"
    : "hover:bg-gray-100 hover:shadow-sm hover:scale-105"
}`}
                >
                 {(() => {
  if (rarity === "SHINING ZR") return "⬦ZR";
   if (rarity === "SZR") return "⬦ZR";
  if (rarity === "SN") return "⬦N";
  if (rarity === "LC") return "PR";
  if (
    (setId === "FW" || setId === "friendshipsbegin") &&
    rarity.startsWith("P")
  ) {
    return `※${rarity.slice(1)}`;
  }

  return rarity;
})()}
                </button>
              ))}
            </div>

            {!selectedRarity && (
              <div className="text-center text-sm text-muted-foreground mb-6">
                Select a rarity to view trades.
              </div>
            )}
          </>
        )}

        {loading && <div className="text-center">Loading...</div>}

        {!loading && (
          <div className="space-y-6 max-w-5xl mx-auto">

            {Object.entries(groupedTrades)
              .sort(([userIdA, cardsA], [userIdB, cardsB]) => {

                const hasDiscordA = !!tradingProfiles[userIdA];
                const hasDiscordB = !!tradingProfiles[userIdB];

                if (hasDiscordA !== hasDiscordB) {
                  return hasDiscordA ? -1 : 1;
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

  if (key.includes("-")) {
    return key.split("-")[0].trim();
  }

  return "";
};

const countA = selectedRarity ? cardsA.filter(c => getRarity(c.card_key) === selectedRarity).length : 0;
const countB = selectedRarity ? cardsB.filter(c => getRarity(c.card_key) === selectedRarity).length : 0;

                return countA - countB;
              })
              .map(([userId, cards]) => {

                  if (!tradingProfiles[userId]) return null;

                if (!selectedRarity) return null;

const filteredCards = cards.filter(c => {

  // ✅ TCG PROMOS FIX
  if (c.card_key.startsWith("RR")) {
    return selectedRarity === "PR";
  }

  if (setId === "friendshipsbegin") {
    const match = c.card_key.match(/SD01([A-Z]+)\d+/);
    return match && match[1] === selectedRarity;
  }

  if (setId === "FW") {
    const match = c.card_key.match(/BP01([A-Z]+)\d+/);
    return match && match[1] === selectedRarity;
  }

  return c.card_key.split("-")[0].trim() === selectedRarity;
});
                if (filteredCards.length === 0) return null;

                return (
                  <div key={userId} className="border rounded-xl p-4 bg-card w-full shadow-sm">

                    {/* USER HEADER */}
                    <div className="font-semibold mb-1">
                      {profiles[userId]?.username || userId}

                      {tradingProfiles[userId] && (
                        <span className="ml-2 text-green-500 text-xs">●</span>
                      )}

                      <span className="text-xs text-muted-foreground ml-2">
                        ({filteredCards.length} for trade)
                      </span>
                    </div>

                    {/* DISCORD */}
                    {tradingProfiles[userId] && (
                      <div className="text-xs text-muted-foreground mb-3">
                        Discord:{" "}
                        <span className="text-foreground font-medium">
                          {tradingProfiles[userId]}
                        </span>
                      </div>
                    )}

                    {/* CARDS */}
<div className="grid gap-2 grid-cols-4 sm:grid-cols-6 [grid-auto-flow:dense]">
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
          className={`relative rounded-md overflow-hidden ${
            isDoubleCard
              ? "col-span-2 aspect-[10/7]"
              : "aspect-[5/7]"
          }`}
        >
          <img
            src={getCardImage(card)}
            className="w-full h-full object-cover rounded-md"
          />

          {card.actively_trading && (
            <div className="absolute inset-0 bg-purple-900/80 flex items-center justify-center">
              <span className="text-white text-[9px] sm:text-xs md:text-sm font-bold text-center px-1 leading-tight">
                ACTIVELY<br />TRADING
              </span>
            </div>
          )}
        </div>
      );
    })}
</div>

                  </div>
                );
              })}

          </div>
        )}

      </div>
    </div>
  );
}
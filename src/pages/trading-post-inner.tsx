import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";


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

const VERIFIED_USERS = {
  "17e57e39-bc0c-44e7-b373-ac34c6690185": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "94a1c998-d040-4dd2-b2fb-5f606287139d": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "408a516c-ee80-4ff8-a869-493e1fd5d961": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "6247b70d-3f55-493c-8eee-3badedf581db": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
    "2e62bcda-f311-42a1-bf32-cfe74a43d3ef": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  "325585dd-c617-4dd2-8314-d608273cd5f6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
  "22f7a392-b5b5-4aec-a3b3-6546071593fd": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
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
    .select("id, username");

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
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">

        <h2 className="text-3xl font-bold text-[#5a3e84] mb-3">
          Login Required
        </h2>

        <p className="text-gray-600 mb-8">
          You cannot access this page without being signed in to an account.
        </p>

        <button
          onClick={() => navigate("/trading-post")}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] font-semibold"
        >
          Return
        </button>

      </div>
    </div>
  );
}
  return (
<div
  className="min-h-screen bg-[#e3e3e3]"
>

      <div className="container py-8">

        <button
          onClick={() => navigate("/trading-post")}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trading Post
        </button>

<div className="mb-10">

  <p className="text-xs uppercase tracking-[0.3em] font-semibold text-zinc-500">
    Trading Post
  </p>

  <h1 className="text-5xl font-black uppercase leading-none text-zinc-900 mt-2">
    {setNames[setId || ""] || `Set ${setId}`}
  </h1>

  <p className="mt-3 text-zinc-500">
    Browse collectors currently offering cards from this set.
  </p>

</div>

        {/* RARITY FILTER */}
        {setId &&
  rarityMap[setId] &&
  setId !== "9" &&
  setId !== "tcgpromos" && (
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
                  className={`px-4 py-2 rounded-lg border font-bold text-sm transition-all ${
selectedRarity === rarity
    ? "text-[#4a3200] border-[#d4af37] bg-gradient-to-br from-[#fff7c2] via-[#f6d365] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.45)]"
    : "bg-zinc-800 border-zinc-600 text-zinc-100 hover:bg-zinc-700"
}`}
                >
                 {(() => {
  if (rarity === "SHINING ZR") return "⬦ZR";
   if (rarity === "SZR") return "⬦ZR";
  if (rarity === "SN") return "⬦N";
  if (rarity === "LC") return "PR";
  if (
  rarity === "SCR" &&
  setId !== "4"
) return "⬦CR";
if (rarity === "SAR") return "◇AR";
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

        {loading && <div className="text-center text-zinc-600 font-semibold py-10">
  Loading Trading Post...
</div>}

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

const countA = selectedRarity ? cardsA.filter(c => getRarity(c.card_key) === selectedRarity).length : 0;
const countB = selectedRarity ? cardsB.filter(c => getRarity(c.card_key) === selectedRarity).length : 0;

                return countA - countB;
              })
              .map(([userId, cards]) => {

                  if (!tradingProfiles[userId]) return null;

                if (
  !selectedRarity &&
  setId !== "9" &&
  setId !== "tcgpromos"
)
  return null;

const filteredCards = cards.filter(c => {

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

if (setId === "12") {
  if (c.card_key.startsWith("BP02-PER")) {
    return selectedRarity === "PER";
  }

  const match = c.card_key.match(/BP02-([A-Z]+)\d+/);
  return match && match[1] === selectedRarity;
}

return c.card_key.split("-")[0].trim() === selectedRarity;
});
                if (filteredCards.length === 0) return null;

                return (
                  <div key={userId} className="border rounded-xl p-4 bg-card w-full shadow-sm">

                    {/* USER HEADER */}
                    <div className="flex items-center flex-wrap gap-2 font-bold text-lg mb-2">
  <span>
    {profiles[userId]?.username || userId}
  </span>

{VERIFIED_USERS[userId] && (
  <img
    src={VERIFIED_USERS[userId].badge}
    alt={VERIFIED_USERS[userId].label}
    title={VERIFIED_USERS[userId].label}
    className="w-4 h-4 object-contain flex-shrink-0"
  />
)}

  {tradingProfiles[userId] && (
    <span className="text-green-500 text-xs">●</span>
  )}

<span className="text-xs uppercase tracking-wider text-zinc-400">
  ({
    filteredCards.filter(c => c.listing_type !== "purchase").length
  } for trade • {
    filteredCards.filter(c => c.listing_type === "purchase").length
  } for sale)
</span>
</div>

                    {/* DISCORD */}
                    {tradingProfiles[userId] && (
                      <div className="text-sm text-zinc-400 mb-4">
                        Discord:{" "}
                        <span className="text-zinc-700 font-semibold">
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
  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
    <span className="text-white text-[9px] sm:text-xs md:text-sm font-bold text-center px-1 leading-tight">
      ACTIVELY<br />TRADING
    </span>
  </div>
)}

<div
  className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white/20 z-10 ${
card.listing_type === "trade"
      ? "bg-[#5a3e84]"
      : "bg-[#d4af37] text-[#4a3200]"
  }`}
>
  {card.listing_type === "trade" ? "⇄" : "$"}
</div>
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
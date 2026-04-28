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
};

const rarityMap: Record<string, string[]> = {
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "5": ["R","FR","SR","SSR","TR","TGR","MTR","UR","USR","XR"],
  "7": ["N","SN","R","SR","SSR","UR","CR"],
  "8": ["N", "SN","R","SR","SSR","UR","UGR","CR"],
  "9": ["PR"],
  "10": ["LC"]
};

const getCardImage = (card: TradeCard) => {
  const [rarity, number] = card.card_key.split("-");

  if (card.set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (card.set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }

  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
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
  "9": "Promo Cards",
  "10": "Serialized & Limited Cards"
};

  useEffect(() => {
  if (!setId) return;

  const load = async () => {
  setLoading(true);

  const { data: trades } = await supabase
    .from("for_trade")
    .select("*")
    .eq("set_id", setId)
    .order("id", { ascending: false }); // 🔥 FORCE FRESH ORDER

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

  // 🔥 FORCE STATE RESET (THIS IS THE REAL FIX)
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

        <h1 className="text-3xl font-bold text-center mb-6 text-[#d4af37] [text-shadow:1px_1px_0_#5a3e84,-1px_1px_0_#5a3e84,1px_-1px_0_#5a3e84,-1px_-1px_0_#5a3e84]">
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
                  className={`px-3 py-1 text-xs border rounded bg-white text-black shadow-sm ${
                    selectedRarity === rarity
                      ? "bg-yellow-400 text-black border-yellow-500"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {rarity === "SHINING ZR"
                    ? "⬦ZR"
                    : rarity === "SN"
                    ? "⬦N"
                    : rarity === "LC"
                    ? "PR"
                    : rarity}
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
          <div className="space-y-6">

            {Object.entries(groupedTrades)
              .sort(([userIdA, cardsA], [userIdB, cardsB]) => {

                const hasDiscordA = !!tradingProfiles[userIdA];
                const hasDiscordB = !!tradingProfiles[userIdB];

                if (hasDiscordA !== hasDiscordB) {
                  return hasDiscordA ? -1 : 1;
                }

                const getRarity = (key: string) => key.split("-")[0].trim();

const countA = selectedRarity
  ? cardsA.filter(c => c.card_key.split("-")[0].trim() === selectedRarity).length
  : 0;

const countB = selectedRarity
  ? cardsB.filter(c => c.card_key.split("-")[0].trim() === selectedRarity).length
  : 0;

                return countA - countB;
              })
              .map(([userId, cards]) => {

                if (!selectedRarity) return null;

                const getRarity = (key: string) => key.split("-")[0].trim();

const filteredCards = cards.filter(c => {
  return c.card_key.split("-")[0].trim() === selectedRarity;
});

                if (filteredCards.length === 0) return null;

                return (
                  <div key={userId} className="border rounded-xl p-4 bg-card">

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
                    <div className="grid gap-2 grid-cols-4 sm:grid-cols-6">
                      {filteredCards
                        .sort((a, b) => {
                          const numA = parseInt(a.card_key.split("-")[1]);
                          const numB = parseInt(b.card_key.split("-")[1]);
                          return numA - numB;
                        })
                        .map((card) => (
                          <img
                            key={card.id}
                            src={getCardImage(card)}
                            className="w-full rounded-md"
                          />
                        ))}
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
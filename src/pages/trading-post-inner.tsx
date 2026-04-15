import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KayouHeader from "@/components/KayouHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const sets: Record<string, any> = {
  "1": {
    name: "Eternal Moon First Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  "2": {
    name: "Eternal Moon Second Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  "3": {
    name: "Eternal Moon Third Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, ZR: 7, SC: 7 }
  },
  "4": {
    name: "Star First Edition",
    rarities: { R: 30, SR: 20, SSR: 30, UR: 25 }
  },
  "5": {
    name: "Rainbow First Edition",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  "6": {
    name: "Rainbow Second Edition",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, SSR: 15, UR: 15 }
  },
  "7": {
    name: "Fun Moments First Edition",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  "8": {
    name: "Fun Moments Second Edition",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  "9": {
    name: "Promos",
    rarities: { PR: 5 }
  },
  "10": {
    name: "Serialized & Limited Cards",
    rarities: { LC: 1 }
  }
};

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
};

const TradingPostInner = () => {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [groupedTrades, setGroupedTrades] = useState<Record<string, TradeCard[]>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [tradingProfiles, setTradingProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<Record<string, "trade" | "iso">>({});
const [groupedISO, setGroupedISO] = useState<Record<string, TradeCard[]>>({});
const [selectedIsoSet, setSelectedIsoSet] = useState<Record<string, string>>({});


  const set = setId ? sets[setId] : undefined;

  const releasedSetIds = ["1","2","5","7","9","10"];

  useEffect(() => {
    if (!setId) return;

    const loadData = async () => {
      setLoading(true);

      const { data: trades } = await supabase
        .from("for_trade")
        .select("*")
        .eq("set_id", setId);

  const { data: progress } = await supabase
  .from("collection_progress")
  .select("*");

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

      const grouped: Record<string, TradeCard[]> = {};
(trades || []).forEach(card => {
  if (!grouped[card.user_id]) grouped[card.user_id] = [];
  grouped[card.user_id].push(card);
});

const isoMap: Record<string, TradeCard[]> = {};

(progress || []).forEach((row: any) => {
  const userId = row.user_id;

  // 🚫 STOP unreleased sets from ever being used
  if (!releasedSetIds.includes(row.set_id)) return;

  if (!isoMap[userId]) isoMap[userId] = [];

  const setConfig = sets[row.set_id];
  if (!setConfig) return;

  Object.entries(setConfig.rarities).forEach(([rarity, count]: any) => {
  for (let i = 1; i <= count; i++) {
    const key = `${rarity}-${i}`;

    if (!row.progress?.[key]) {
      isoMap[userId].push({
        id: `${userId}-${row.set_id}-${key}`,
        user_id: userId,
        set_id: row.set_id,
        card_key: key
      });
    }
  }
});

});

setProfiles(profileMap);
setTradingProfiles(tradingMap);
setGroupedTrades(grouped);
setGroupedISO(isoMap);
setLoading(false);
    };

    loadData();
  }, [setId]);

  if (!set) return null;

  const getCardImage = (card: TradeCard) => {
    const [rarity, number] = card.card_key.split("-");

    if (rarity === "PR") return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
    if (rarity === "LC") return "/serialized-limited-cards/andypricepromo.jpg";

    const config: any = {
      "1": { folder: "first-edition-moon", prefix: "M1" },
      "2": { folder: "second-edition-moon", prefix: "M2" },
      "3": { folder: "third-edition-moon", prefix: "M3" },
      "4": { folder: "star-first-edition", prefix: "S1" },
      "5": { folder: "rainbow-one", prefix: "R1" },
      "6": { folder: "rainbow-two", prefix: "R2" },
      "7": { folder: "fun-moments-one", prefix: "FM1" },
      "8": { folder: "fun-moments-two", prefix: "FM2" }
    };

    const c = config[card.set_id];
    if (!c) return "";

    const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
  };

  const allRarities = Object.keys(set.rarities);

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/trading-post")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trading Post
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">
          {set.name}
        </h1>

        {loading && <div className="text-center">Loading...</div>}

        {!loading && (
          <>
            {/* RARITY BUTTONS (NOT FOR PROMOS / SERIALIZED) */}
            {!["9","10"].includes(setId || "") && (
              <>
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  {allRarities.map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() =>
                        setSelectedRarity(
                          selectedRarity === rarity ? null : rarity
                        )
                      }
                      className={`px-3 py-1 text-xs border rounded ${
                        selectedRarity === rarity ? "bg-primary text-white" : ""
                      }`}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>

                {!selectedRarity && (
                  <div className="text-center text-sm text-muted-foreground mb-6">
                    Choose a rarity and display what cards are for trade right now from all users.
                  </div>
                )}
              </>
            )}

            {/* TRADES */}
            {(["9","10"].includes(setId || "") || selectedRarity) && (
              <div className="space-y-6">
  {(() => {
    const filteredUsers = Object.entries(groupedTrades).filter(([userId, cards]) => {
      if (viewMode[userId] === "iso") return true;

      if (["9","10"].includes(setId || "")) return true;

      return selectedRarity
        ? cards.some(c => c.card_key.startsWith(selectedRarity))
        : false;
    });

    if (
  filteredUsers.length === 0 &&
  selectedRarity &&
  !Object.values(viewMode).includes("iso")
) {
      return (
        <div className="text-center text-sm text-muted-foreground mt-8">
          There are no trades currently listed for this rarity of this set.
        </div>
      );
    }

    return filteredUsers.map(([userId, cards]) => {
      const sourceCards =
        viewMode[userId] === "iso"
          ? groupedISO[userId] || []
          : cards;

      const filteredCards =
        viewMode[userId] === "iso"
          ? sourceCards
          : ["9","10"].includes(setId || "")
          ? cards
          : cards.filter(c => c.card_key.startsWith(selectedRarity!));

      if (filteredCards.length === 0) {
        return (
          <div key={userId} className="border rounded-xl p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">
                {profiles[userId]?.username || userId}
              </div>

              <button
                onClick={() =>
                  setViewMode(prev => ({
                    ...prev,
                    [userId]: prev[userId] === "iso" ? "trade" : "iso"
                  }))
                }
                className="text-xs px-2 py-1 border rounded"
              >
                {viewMode[userId] === "iso" ? "SEE FOR TRADE" : "SEE ISO"}
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              {viewMode[userId] === "iso"
                ? "This user has not listed any ISO cards."
                : "No cards available."}
            </div>
          </div>
        );
      }

      return (
        <div key={userId} className="border rounded-xl p-4 bg-card">

          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">
              {profiles[userId]?.username || userId}
            </div>

            <button
              onClick={() =>
                setViewMode(prev => ({
                  ...prev,
                  [userId]: prev[userId] === "iso" ? "trade" : "iso"
                }))
              }
              className="text-xs px-2 py-1 border rounded"
            >
              {viewMode[userId] === "iso" ? "SEE FOR TRADE" : "SEE ISO"}
            </button>
          </div>

          {tradingProfiles[userId] && (
            <div className="text-xs text-muted-foreground mb-3">
              This person's Discord username is{" "}
              <span className="text-foreground font-medium">
                {tradingProfiles[userId]}
              </span>
            </div>
          )}

          {viewMode[userId] === "iso" ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(
                  filteredCards.reduce((acc: any, card) => {
                    if (releasedSetIds.includes(card.set_id)) {
                      acc[card.set_id] = true;
                    }
                    return acc;
                  }, {})
                ).map((setKey) => (
                  <button
                    key={setKey}
                    onClick={() =>
                      setSelectedIsoSet(prev => ({
                        ...prev,
                        [userId]: prev[userId] === setKey ? "" : setKey
                      }))
                    }
                    className={`px-3 py-1 text-xs border rounded ${
                      selectedIsoSet[userId] === setKey ? "bg-primary text-white" : ""
                    }`}
                  >
                    {sets[setKey]?.name || setKey}
                  </button>
                ))}
              </div>

              <div className="text-sm text-muted-foreground mb-3 h-[20px]">
  {!selectedIsoSet[userId]
    ? "Select a set to view this user's ISO."
    : ""}
</div>

              {selectedIsoSet[userId] && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 min-h-[120px]">
                  {filteredCards
                    .filter(card => card.set_id === selectedIsoSet[userId])
                    .map((card) => (
                      <img
                        key={card.id}
                        src={getCardImage(card)}
                        loading="lazy"
                        className="w-full rounded-md"
                      />
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {filteredCards.map((card) => (
                <img
                  key={card.id}
                  src={getCardImage(card)}
                  className="w-full rounded-md"
                />
              ))}
            </div>
          )}

        </div>
      );
    });
  })()}
</div>

            )}
          </>
        )}

      </div>
    </div>
  );
};

export default TradingPostInner;
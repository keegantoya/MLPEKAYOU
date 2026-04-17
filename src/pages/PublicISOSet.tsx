import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KayouHeader from "@/components/KayouHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
};

const sets: Record<string, any> = {
  "1": { name: "Eternal Moon First Edition" },
  "2": { name: "Eternal Moon Second Edition" },
  "5": { name: "Rainbow First Edition" },
  "7": { name: "Fun Moments First Edition" },
  "9": { name: "Promos" },
  "10": { name: "Serialized & Limited" }
};

const rarityMap: Record<string, string[]> = {
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "5": ["R","FR","SR","SSR","TR","TGR","MTR","UR","USR","XR"],
  "7": ["N","SN","R","SR","SSR","UR","CR"],
  "9": ["PR"],
  "10": ["LC"]
};

const setConfigs: Record<string, any> = {
  "1": {
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  "2": {
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  "5": {
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  "7": {
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },

  // ✅ PROMOS (set_id = 9)
  "9": {
    rarities: { PR: 5 }
  },

  // ✅ LIMITED (set_id = 10)
  "10": {
    rarities: { LC: 1 }
  }
};

export default function PublicISOSet() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [groupedISO, setGroupedISO] = useState<Record<string, TradeCard[]>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [tradingProfiles, setTradingProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) return;

    const load = async () => {
      setLoading(true);

      const { data: progress } = await supabase
        .from("collection_progress_raw")
        .select("*")
        .eq("set_id", setId)
        .range(0, 5000);

      const { data: profileData } = await supabase
  .from("profiles")
  .select("id, username, iso_hidden_sets");

      const { data: tradingData } = await supabase
        .from("trading_profiles")
        .select("*");

      const profileMap: Record<string, any> = {};
      (profileData || []).forEach(p => profileMap[p.id] = p);

      const hiddenMap: Record<string, string[]> = {};

      const tradingMap: Record<string, string> = {};
      (tradingData || []).forEach(p => tradingMap[p.user_id] = p.discord_username);

      // ✅ FIXED ISO LOGIC (matches personal ISO)
      const isoMap: Record<string, TradeCard[]> = {};
      const ownedByRarity: Record<string, Set<string>> = {};

      (progress || []).forEach((row: any) => {
        const userId = row.user_id;
        if (!tradingMap[userId]) return;
        if (hiddenMap[userId]?.includes(setId)) return;
        if (!isoMap[userId]) isoMap[userId] = [];

        const progressData = row.progress || {};
        const config = setConfigs[row.set_id];

        if (!config) return;

        // build full checklist
        const allCards = Object.entries(config.rarities).flatMap(([rarity, count]) =>
          Array.from({ length: count as number }, (_, i) => ({
            rarity,
            number: i + 1
          }))
        );

        // compare against owned
        // ✅ PASS 1 — Track what the user actually owns per rarity
allCards.forEach((card) => {
  const key = `${card.rarity}-${card.number}`;
  const value = progressData[key];

  const isOwned =
    value === true ||
    value?.owned === true;

  if (isOwned) {
    if (!ownedByRarity[card.rarity]) {
      ownedByRarity[card.rarity] = new Set();
    }
    ownedByRarity[card.rarity].add(userId);
  }
});

// ✅ PASS 2 — Build ISO with filtering rules
allCards.forEach((card) => {
  const key = `${card.rarity}-${card.number}`;
  const value = progressData[key];

  const isOwned =
    value === true ||
    value?.owned === true;

  if (!isOwned) {
    const rarity = card.rarity;

    const isLimited = rarity === "LC";
    const hasDiscord = !!tradingMap[userId];

    const isUltraRare =
      rarity === "SC" ||
      rarity === "ZR" ||
      rarity === "SHINING ZR" ||
      rarity === "USR" ||
      rarity === "CR" ||
      rarity === "UGR" ||
      rarity === "XR";

    const hasOwnedInRarity =
      ownedByRarity[rarity]?.has(userId);

    const hasAnyProgress =
      Object.keys(progressData).length > 0;

    // ✅ THE FILTER THAT FIXES EVERYTHING
    if (
  // ANDY PRICE PROMO
  (isLimited && hasDiscord) ||

  // ULTRA RARE CARDS (ZR, SC, <>ZR)
  (isUltraRare && hasAnyProgress) ||

  // COMMON CARDS (R, SR, SSR, UR, SGR, LSR, HR, ETC...)
  (!isUltraRare && !isLimited && hasOwnedInRarity)
) {
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
      setGroupedISO(isoMap);
      setLoading(false);
    };

    load();
  }, [setId]);

  const getCardImage = (card: TradeCard) => {
  const [rarity, number] = card.card_key.split("-");

  // ✅ PROMOS (set_id = 9)
  if (card.set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  // ✅ SERIALIZED / LIMITED (set_id = 10)
  if (card.set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }

  // ✅ DEFAULT SETS
  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
  };

  const c = config[card.set_id];
  if (!c) return "";

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
};

  const set = setId ? sets[setId] : null;

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/public-iso")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All ISOs
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">
          {set?.name}
        </h1>

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
  className={`px-3 py-1 text-xs border rounded ${
    selectedRarity === rarity ? "bg-primary text-white" : ""
  }`}
>
  {rarity === "SHINING ZR"
  ? "⬦ZR"
  : rarity === "LC"
  ? "PR"
  : rarity}
</button>
              ))}
            </div>

            {!selectedRarity && (
              <div className="text-center text-sm text-muted-foreground mb-6">
                Choose a rarity to view what users are looking for.
              </div>
            )}
          </>
        )}

        {loading && <div className="text-center">Loading...</div>}

        {!loading && (
          <div className="space-y-6">
  {Object.entries(groupedISO)
    .sort(([userIdA, cardsA], [userIdB, cardsB]) => {

      const hasDiscordA = !!tradingProfiles[userIdA];
      const hasDiscordB = !!tradingProfiles[userIdB];

      // PRIORITY 1: Discord users first
      if (hasDiscordA !== hasDiscordB) {
        return hasDiscordA ? -1 : 1;
      }

      // PRIORITY 2: Fewest missing cards (correct parsing)
      const getCount = (cards: TradeCard[]) => {
        if (!selectedRarity) return cards.length;

        return cards.filter(c => {
          const [rarity] = c.card_key.split("-");
          return rarity.trim() === selectedRarity;
        }).length;
      };

      const countA = getCount(cardsA);
      const countB = getCount(cardsB);

      if (countA !== countB) {
        return countA - countB;
      }

      // Stable fallback
      return userIdA.localeCompare(userIdB);
    })
    .map(([userId, cards]) => {

      const filteredCards = selectedRarity
        ? cards.filter(c => {
            const [rarity] = c.card_key.split("-");
            return rarity.trim() === selectedRarity;
          })
        : [];

      if (!selectedRarity || filteredCards.length === 0) return null;

      return (
        <div key={userId} className="border rounded-xl p-4 bg-card">

          <div className="font-semibold mb-1">
            {profiles[userId]?.username || userId}

            {tradingProfiles[userId] && (
              <span className="ml-2 text-green-500 text-xs">●</span>
            )}

            <span className="text-xs text-muted-foreground ml-2">
              ({filteredCards.length} missing)
            </span>
          </div>

          {tradingProfiles[userId] && (
            <div className="text-xs text-muted-foreground mb-3">
              Discord:{" "}
              <span className="text-foreground font-medium">
                {tradingProfiles[userId]}
              </span>
            </div>
          )}

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
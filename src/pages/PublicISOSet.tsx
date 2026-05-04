import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KayouHeader from "@/components/KayouHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
};

const sets: Record<string, any> = {
  "1": { name: "ETERNAL MOON FIRST EDITION" },
  "2": { name: "ETERNAL MOON SECOND EDITION" },
  "5": { name: "RAINBOW FIRST EDITION" },
  "7": { name: "FUN MOMENTS FIRST EDITION" },

  "9": { name: "PROMOTIONAL CARDS" },
  "TCG_PROMOS": { name: "TCG PROMOS" },
  "10": { name: "LIMITED CARDS" },

  "FW": { name: "FANTASY WONDERLAND" },
  "friendshipsbegin": { name: "FRIENDSHIPS BEGIN" },
};

const rarityMap: Record<string, string[]> = {
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "5": ["R","FR","SR","SSR","TR","TGR","MTR","UR","USR","XR"],
  "7": ["N","SN","R","SR","SSR","UR","CR"],
  "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR" ],

  "9": ["PR"],
  "TCG_PROMOS": ["PR"],
  "10": ["LC"],

  "FW": ["C","U","ER","SR","SPR", "GR", "CR", "RR", "PER", "PSPR", "PGR", "PCR", "PRR" ], 
  "friendshipsbegin": ["C", "U", "SR", "SPR", "ER", "GR", "CR", "PER", "PRR" ], 
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
  "8": {
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
  },
  "9": {
    rarities: { PR: 5 }
  },
  "10": {
    rarities: { LC: 1 }
  }
};

export default function PublicISOSet() {
  const { setId } = useParams();
const isPromoSet =
  setId === "9" ||
  setId === "10" ||
  setId === "TCG_PROMOS" ||
  setId?.toLowerCase() === "tcg_promos";
  const navigate = useNavigate();

  const [groupedISO, setGroupedISO] = useState<Record<string, TradeCard[]>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [tradingProfiles, setTradingProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!setId) return;

    const load = async () => {
      setLoading(true);

const normalizedSetId =
  setId === "friendshipsbegin"
    ? "SD"
    : setId?.toLowerCase() === "tcg_promos"
    ? "tcgpromos"
    : setId;

const { data: progress } = await supabase
  .from("collection_progress_raw")
  .select("*")
  .eq("set_id", normalizedSetId)
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
      const isoMap: Record<string, TradeCard[]> = {};
      const ownedByRarity: Record<string, Set<string>> = {};

      (progress || []).forEach((row: any) => {
        const userId = row.user_id;
        if (!tradingMap[userId]) return;
        if (hiddenMap[userId]?.includes(setId)) return;
        if (!isoMap[userId]) isoMap[userId] = [];

        const progressData = row.progress || {};
       const config = setConfigs[row.set_id];

if (
  !config &&
  row.set_id !== "SD" &&
  row.set_id !== "FW" &&
  row.set_id !== "tcgpromos"
) return;
        let allCards: any[] = [];

if (row.set_id === "SD") {

  const BONUS_STRUCTURE = [
    { prefix: "SD01C", count: 9 },
    { prefix: "SD01U", count: 7 },
    { prefix: "SD01SR", count: 6 },
    { prefix: "SD01SPR", count: 10 },
    { prefix: "SD01GR", count: 6 },
    { prefix: "SD01CR", count: 6 },
    { prefix: "SD01ER", count: 6 },
    { prefix: "SD01PER", count: 12 },
    { prefix: "SD01PRR", count: 6 },
  ];

  BONUS_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 1; i <= count; i++) {

    let actualIndex = i;

    // ✅ MATCH YOUR MAIN SET LOGIC
    if (prefix === "SD01PER") {
      actualIndex = i + 6; // 01–12 → 07–18 (we'll cap next)
      if (actualIndex > 18) continue;
    }

    const num = String(actualIndex).padStart(2, "0");

    allCards.push({
      rarity: prefix.replace("SD01", ""),
      number: actualIndex,
      key: `${prefix}${num}`
    });
  }
});

}
else if (row.set_id === "FW") {

  const FW_STRUCTURE = [
    { prefix: "BP01C", count: 48 },
    { prefix: "BP01U", count: 18 },
    { prefix: "BP01ER", count: 6 },
    { prefix: "BP01SR", count: 14 },
    { prefix: "BP01SPR", count: 28 },
    { prefix: "BP01GR", count: 12 },
    { prefix: "BP01CR", count: 12 },
    { prefix: "BP01RR", count: 6 },
    { prefix: "BP01PER", count: 6 },
    { prefix: "BP01PSPR", count: 11 },
    { prefix: "BP01PGR", count: 6 },
    { prefix: "BP01PCR", count: 12 },
    { prefix: "BP01PRR", count: 6 },
  ];

  FW_STRUCTURE.forEach(({ prefix, count }) => {
    for (let i = 1; i <= count; i++) {
      allCards.push({
        rarity: prefix.replace("BP01", ""),
        number: i,
        key: `${prefix}${String(i).padStart(2,"0")}`
      });
    }
  });

}
else if (row.set_id === "tcgpromos") {

  for (let i = 1; i <= 6; i++) {
    allCards.push({
      rarity: "PR",
      number: i,
      key: `RR${String(i).padStart(2, "0")}`
    });
  }

}
else {

  const config = setConfigs[row.set_id];
  if (!config) return;

  allCards = Object.entries(config.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1
    }))
  );

}
allCards.forEach((card) => {
 const key = card.key || `${card.rarity}-${card.number}`;

const actualKey = key;

const value = progressData[actualKey];

  const isOwned =
    value === true ||
    value?.owned === true;

  if (isOwned) {
    const rarity = card.rarity;

    if (!ownedByRarity[rarity]) {
      ownedByRarity[rarity] = new Set();
    }

    ownedByRarity[rarity].add(userId);
  }
});

allCards.forEach((card) => {
const key = card.key || `${card.rarity}-${card.number}`;

const actualKey = key;

const value = progressData[actualKey];

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

// ✅ SD (unchanged)
if (row.set_id === "SD") {

  const isSpecial = rarity === "PER" || rarity === "PRR";

  if (
    (isSpecial && hasAnyProgress) ||
    (!isSpecial && hasAnyProgress)
  ) {
    isoMap[userId].push({
      id: `${userId}-${row.set_id}-${key}`,
      user_id: userId,
      set_id: row.set_id,
      card_key: key
    });
  }

}
// ✅ FW (treat same as SD logic, BUT uses its own keys)
else if (row.set_id === "FW") {

  if (hasAnyProgress) {
    isoMap[userId].push({
      id: `${userId}-${row.set_id}-${key}`,
      user_id: userId,
      set_id: row.set_id,
      card_key: key
    });
  }

}
else if (row.set_id === "tcgpromos") {

  if (hasAnyProgress) {
    isoMap[userId].push({
      id: `${userId}-${row.set_id}-${key}`,
      user_id: userId,
      set_id: row.set_id,
      card_key: key
    });
  }

}

else {

  if (
    (rarity === "LC" && hasDiscord) ||

    (
      rarity === "SC" ||
      rarity === "ZR" ||
      rarity === "SHINING ZR" ||
      rarity === "USR" ||
      rarity === "CR" ||
      rarity === "UGR" ||
      rarity === "XR"
    ) && hasAnyProgress ||

    (![
      "SC","ZR","SHINING ZR","USR","CR","UGR","XR","LC"
    ].includes(rarity) && hasOwnedInRarity)
  ) {
    isoMap[userId].push({
      id: `${userId}-${row.set_id}-${key}`,
      user_id: userId,
      set_id: row.set_id,
      card_key: key
    });
  }

}
}});
      });

      setProfiles(profileMap);
      setTradingProfiles(tradingMap);
      setGroupedISO(isoMap);
      setLoading(false);
    };

    load();
  }, [setId]);

  const getCardImage = (card: TradeCard) => {
if (card.set_id === "SD") {
  return `/friendships-begin/${card.card_key}.png`;
}
  if (card.set_id === "FW") {
    return `/cards/fantasywonderland/${card.card_key}.jpg`;
  }
  const [rarity, number] = card.card_key.split("-");

  if (card.set_id === "tcgpromos") {
  return `/tcgpromos/${card.card_key}.png`;
}
  if (card.set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (card.set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }

  // ✅ DEFAULT SETS
  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
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
          onClick={() => navigate("/public-iso")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All ISOs
        </button>

        <h1 className="block w-fit mx-auto mb-6 px-6 py-2
  rounded-lg
  bg-gradient-to-b from-[#7c5aa6] to-[#5a3e84]
  border border-[#d4af37]/40
  font-bold text-2xl sm:text-3xl tracking-wide
  text-[#f5e6a8]
  [text-shadow:1px_1px_0_#3b2a6a,-1px_-1px_0_#ffffff40]
  shadow-sm">
          {set?.name}
        </h1>

        {!isPromoSet && setId && rarityMap[setId] && (
          <>
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {rarityMap[setId].map((rarity) => (
                <button
  key={rarity}
  onClick={() => {
  const newRarity =
    selectedRarity === rarity ? null : rarity;

  setSelectedRarity(newRarity);
  setPage(1);
}}
  className={`px-4 py-1.5 text-xs font-medium rounded-full border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 shadow-sm transition-all duration-150 ${
  selectedRarity === rarity
  ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md scale-105"
  : "hover:bg-gray-100 hover:shadow-sm hover:scale-105"
}`}
>
  {rarity === "SHINING ZR"
  ? "⬦ZR"
  : rarity === "SN"
  ? "⬦N"
  : rarity === "LC"
  ? "PR"
  : rarity === "PER"
  ? "※ER"
  : rarity === "PRR"
  ? "※RR"
   : rarity === "PCR"
  ? "※CR"
   : rarity === "PGR"
  ? "※GR"
   : rarity === "PSPR"
  ? "※SPR"
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
  <>
    <div className="space-y-6 max-w-5xl mx-auto">
      {Object.entries(groupedISO)
  .map(([userId, cards]) => {

    const filteredCards = isPromoSet
  ? cards
  : selectedRarity
  ? cards.filter(c => {

      const getRarity = (key: string) => {

        if (key.startsWith("RR")) return "PR";

        if (key.startsWith("SD01")) {
          const match = key.match(/SD01([A-Z]+)\d+/);
          return match ? match[1] : "";
        }

        if (key.startsWith("BP01")) {
          const match = key.match(/BP01([A-Z]+)\d+/);
          return match ? match[1] : "";
        }

        if (key.includes("-")) {
          return key.split("-")[0];
        }

        return "";
      };

      return getRarity(c.card_key) === selectedRarity;
    })
  : [];

    return {
      userId,
      cards,
      filteredCards
    };
  })
  .filter(entry => entry.filteredCards.length > 0)
  .sort((a, b) => {

    const hasDiscordA = !!tradingProfiles[a.userId];
    const hasDiscordB = !!tradingProfiles[b.userId];

    if (hasDiscordA !== hasDiscordB) {
      return hasDiscordA ? -1 : 1;
    }

    if (a.filteredCards.length !== b.filteredCards.length) {
      return a.filteredCards.length - b.filteredCards.length;
    }

    return a.userId.localeCompare(b.userId);
  })
  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  .map(({ userId, filteredCards }) => {

    if (!selectedRarity && !isPromoSet) return null;

    return (
      <div key={userId} className="border rounded-xl p-4 bg-card w-full">

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
          const getNumber = (key: string) => {
            if (!key.includes("-")) {
              const match = key.match(/(\d+)$/);
              return match ? parseInt(match[1]) : 0;
            }
            return parseInt(key.split("-")[1]);
          };

          const numA = getNumber(a.card_key);
          const numB = getNumber(b.card_key);
          return numA - numB;
        })
        .map((card) => (
          <div key={card.id} className="relative">

            <img
              src={getCardImage(card)}
              className="w-full rounded-md"
            />

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={watermark}
                    className="absolute opacity-10 rotate-[-25deg] w-[140%] left-1/2 -translate-x-1/2"
                    style={{ top: `${i * 25 - 20}%` }}
                  />
                ))}
              </div>
            </div>

          </div>
        ))}
    </div>

  </div>
);
        })}
    </div>

{(selectedRarity || isPromoSet) && (() => {

  const totalResults = Object.entries(groupedISO)
    .map(([userId, cards]) => {
      const filteredCards = cards.filter(c => {
const getRarity = (key: string) => {

  // ✅ TCG PROMOS
  if (key.startsWith("RR")) {
    return "PR";
  }

  // SD (Friendships Begin)
  if (key.startsWith("SD01")) {
    const match = key.match(/SD01([A-Z]+)\d+/);
    return match ? match[1] : "";
  }

  // FW (Fantasy Wonderland)
  if (key.startsWith("BP01")) {
    const match = key.match(/BP01([A-Z]+)\d+/);
    return match ? match[1] : "";
  }

  // Normal sets
  if (key.includes("-")) {
    return key.split("-")[0];
  }

  return "";
};
        return getRarity(c.card_key) === selectedRarity;
      });

      return filteredCards.length > 0 ? userId : null;
    })
    .filter(Boolean).length;

  const maxPage = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  return (
    <div className="flex justify-center gap-4 mt-6">

      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Back
      </button>

      <span className="text-sm flex items-center">
        Page {page} / {maxPage}
      </span>

      <button
        onClick={() => setPage(p => Math.min(p + 1, maxPage))}
        disabled={page >= maxPage}
        className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>

    </div>
  );

})()}
  </>
)}
      </div>
    </div>
  );
}
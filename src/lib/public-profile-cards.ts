import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Card = {
  set_id: string;
  card_key: string;
};

export function usePublicProfileCards(userId?: string) {
  const [isoCards, setIsoCards] = useState<Card[]>([]);
  const [wishlistCards, setWishlistCards] = useState<Card[]>([]);
  const [tradeCards, setTradeCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsoCards([]);
      setWishlistCards([]);
      setTradeCards([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

// ISO
const generatedSets = [
  {
    id: "1",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7,
    },
  },
  {
    id: "2",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 30,
      UR: 16,
      LSR: 16,
      SGR: 8,
      ZR: 7,
      SC: 7,
      "SHINING ZR": 1,
    },
  },
  {
    id: "3",
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      UR: 18,
      LSR: 32,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
  },
  {
    id: "4",
    rarities: {
      SSR: 20,
      SCR: 18,
      UR: 18,
      USR: 15,
      AR: 9,
      OR: 7,
      BP: 9,
      SAR: 9,
    },
  },
  {
    id: "5",
    rarities: {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7,
    },
  },
  {
    id: "6",
    rarities: {
      BASE: 18,
      R: 30,
      SR: 14,
      ST: 20,
      SSR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      UR: 19,
      USR: 8,
      XR: 8,
    },
  },
  {
    id: "7",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12,
    },
  },
  {
    id: "8",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
    },
  },
  {
    id: "11",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
      SCR: 12,
    },
  },
];



const { data: collection } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", userId);

const progressMap: Record<string, any> = {};

(collection ?? []).forEach((row: any) => {
  progressMap[String(row.set_id)] = row.progress || {};
});

const { data: profile } = await supabase
  .from("profiles")
  .select("hide_iso, iso_hidden_sets")
  .eq("id", userId)
  .maybeSingle();

if (profile?.hide_iso) {
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("card_key")
    .eq("user_id", userId);

  const wishlistCards: Card[] = (wishlist ?? []).map((row: any) => {
    const [set_id, card_key] = String(row.card_key).split(":");
    return { set_id, card_key };
  });

  const { data: trades } = await supabase
    .from("for_trade")
    .select("set_id, card_key")
    .eq("user_id", userId);

  setIsoCards([]);
  setWishlistCards(wishlistCards);
  setTradeCards((trades ?? []) as Card[]);
  setLoading(false);
  return;
}

const hiddenSets = [
  ...(profile?.iso_hidden_sets ?? []),
];


const { data: isoStatuses } = await supabase
  .from("iso_status")
  .select("card_key, status")
  .eq("user_id", userId);

const hiddenIsoCards = new Set(
  (isoStatuses ?? [])
    .filter(
      (row: any) =>
        row.status === "trade_in_progress" ||
        row.status === "purchase_in_progress"
    )
    .flatMap((row: any) => {
      const cardKey = String(row.card_key);

      if (cardKey.startsWith("BONUS-")) {
        return [
          cardKey,
          `SD-${cardKey}`,
        ];
      }

      return [cardKey];
    })
);

const iso: Card[] = [];


generatedSets.forEach((set) => {
  Object.entries(set.rarities).forEach(([rarity, count]) => {
    for (let i = 1; i <= Number(count); i++) {
      const key = `${rarity}-${i}`;

      const value = progressMap[set.id]?.[key];

      const owned =
        value === true ||
        (typeof value === "object" &&
          value !== null &&
          value.owned === true);

      if (!owned) {
        iso.push({
          set_id: set.id,
          card_key: key,
        });
      }
    }
  });
});

for (const cardKey of [
  "PR-1",
  "PR-2",
  "PR-3",
  "PR-4",
  "PR-5",
  "PR-7",
  "PR-8",
  "PR-9",
  "PR-10",
  "PR-11",
  "PR-12",
  "PR-13",
]) {
  const value = progressMap["9"]?.[cardKey];

  const owned =
    value === true ||
    (typeof value === "object" &&
      value !== null &&
      value.owned === true);

  if (!owned) {
    iso.push({
      set_id: "9",
      card_key: cardKey,
    });
  }
}

for (let i = 1; i <= 18; i++) {
  const cardKey = `RR${String(i).padStart(2, "0")}`;

  const value = progressMap["tcgpromos"]?.[cardKey];

  const owned =
    value === true ||
    (typeof value === "object" &&
      value !== null &&
      value.owned === true);

  if (!owned) {
    iso.push({
      set_id: "tcgpromos",
      card_key: cardKey,
    });
  }
}

// Fantasy Wonderland (FW)
const fwProgress = progressMap["FW"] || {};

const FW_STRUCTURE = [
  { prefix: "BP01C", count: 48 },
  { prefix: "BP01U", count: 18 },
  { prefix: "BP01ER", count: 6 },
  { prefix: "BP01SR", count: 14 },
  { prefix: "BP01SPR", count: 28 },
  { prefix: "BP01GR", count: 12 },
  { prefix: "BP01CR", count: 12 },
  { prefix: "BP01RR", count: 6 },
  { prefix: "BP01PER", count: 12 },
  { prefix: "BP01PSPR", count: 11 },
  { prefix: "BP01PGR", count: 6 },
  { prefix: "BP01PCR", count: 12 },
  { prefix: "BP01PRR", count: 6 },
];

FW_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 0; i < count; i++) {
    let num = i + 1;

    if (prefix === "BP01ER") {
      num = i + 7;
    }

    if (prefix === "BP01PSPR") {
      const PSPR_NUMBERS = [
        1,
        2,
        3,
        5,
        7,
        8,
        9,
        12,
        13,
        18,
        21,
      ];

      num = PSPR_NUMBERS[i];

      if (!num) continue;
    }

    const cardKey = `${prefix}${String(num).padStart(2, "0")}`;

    const value = fwProgress[cardKey];

    const owned =
      value === true ||
      (typeof value === "object" &&
        value !== null &&
        value.owned === true);

    if (!owned) {
      iso.push({
        set_id: "FW",
        card_key: cardKey,
      });
    }
  }
});

// Discord (Set 12)
const discordProgress = progressMap["12"] || {};

const DISCORD_STRUCTURE = [
  { prefix: "BP02-C", count: 48 },
  { prefix: "BP02-U", count: 18 },
  { prefix: "BP02-ER", count: 6 },
  { prefix: "BP02-SR", count: 14 },
  { prefix: "BP02-SPR", count: 28 },
  { prefix: "BP02-GR", count: 12 },
  { prefix: "BP02-CR", count: 12 },
  { prefix: "BP02-RR", count: 6 },
  { prefix: "BP02-PER", count: 12 },
  { prefix: "BP02-PSPR", count: 11 },
  { prefix: "BP02-PGR", count: 6 },
  { prefix: "BP02-PCR", count: 12 },
  { prefix: "BP02-PRR", count: 6 },
];

DISCORD_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 0; i < count; i++) {
    let cardKey = "";

    if (prefix === "BP02-PER") {
      const num = Math.floor(i / 2) + 1;
      const side = i % 2 === 0 ? "A2" : "B2";

      cardKey = `${prefix}${String(num).padStart(2, "0")}-${side}`;
    } else {
      cardKey = `${prefix}${String(i + 1).padStart(2, "0")}`;
    }

    const value = discordProgress[cardKey];

    const owned =
      value === true ||
      (typeof value === "object" &&
        value !== null &&
        value.owned === true);

    if (!owned) {
      iso.push({
        set_id: "12",
        card_key: cardKey,
      });
    }
  }
});

// Friendships Begin (SD)
const sdProgress = progressMap["SD"] || {};

const SD_STRUCTURE = [
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

SD_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 0; i < count; i++) {
    let cardKey = "";

    if (prefix === "SD01PER") {
      cardKey = `${prefix}${String(i + 7).padStart(2, "0")}`;
    } else if (prefix === "SD01ER") {
      cardKey = `${prefix}${String(i + 1).padStart(2, "0")}`;
    } else {
      cardKey = `${prefix}${String(i + 1).padStart(2, "0")}`;
    }

    const value = sdProgress[`BONUS-${cardKey}`];

    const owned =
      value === true ||
      (typeof value === "object" &&
        value !== null &&
        value.owned === true);

    if (!owned) {
      iso.push({
        set_id: "SD",
        card_key: `BONUS-${cardKey}`,
      });
    }
  }
});

// Everything else (Rainbow, Fun, Star, Promos, etc.)
(collection ?? []).forEach((row: any) => {
  const setId = String(row.set_id);

if (
  [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "11",
    "12",
    "FW",
    "SD",
    "tcgpromos",
  ].includes(setId)
)
  return;

  Object.entries(row.progress || {}).forEach(([cardKey, value]) => {
    const owned =
      value === true ||
      (typeof value === "object" &&
        value !== null &&
        (value as any).owned === true);

    if (!owned) {
      iso.push({
        set_id: setId,
        card_key: String(cardKey),
      });
    }
  });
});

// Wishlist
const { data: wishlist } = await supabase
  .from("wishlists")
  .select("card_key")
  .eq("user_id", userId);

const wishlistCards: Card[] = (wishlist ?? []).map((row: any) => {
  const [set_id, card_key] = String(row.card_key).split(":");

  return {
    set_id,
    card_key,
  };
});

      // Trades
      const { data: trades } = await supabase
        .from("for_trade")
        .select("set_id, card_key")
        .eq("user_id", userId);

setIsoCards(
  iso.filter(
    (card) =>
      !hiddenIsoCards.has(`${card.set_id}-${card.card_key}`) &&
      !hiddenSets.includes(String(card.set_id))
  )
);
      setWishlistCards(wishlistCards);
      setTradeCards((trades ?? []) as Card[]);

      setLoading(false);
    };

    load();
  }, [userId]);

  return {
    loading,
    isoCards,
    wishlistCards,
    tradeCards,
  };
}
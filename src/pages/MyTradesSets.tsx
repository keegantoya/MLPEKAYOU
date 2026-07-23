import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  {
    id: "6",
    name: "Rainbow: Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: { BASE: 18, R: 30, SR: 14, ST: 20, TR: 12, TGR: 8, SSR: 15, FR: 18, UR: 19, USR: 8, XR: 8 }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  {
    id: "8",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
  },
  {
    id: "11",
    name: "Fun Moments: Third Edition",
    folder: "fun-moments-three",
    prefix: "FM3",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 }
  },
  {
    id: "3",
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: { R: 60, SR: 40, SSR: 40, HR: 60, UR: 18, LSR: 32, SGR: 16, ZR: 14, SC: 7, "SZR": 3 }
  },
  {
    id: "4",
    name: "Star: First Edition",
    folder: "star-one",
    prefix: "S1",
    rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }
  },
  {
    id: "9",
    name: "Promotional Cards",
    folder: "promos",
    prefix: "PR",
    rarities: { PR: 12 }
  },
  {
  id: "FW",
  name: "Fantasy Wonderland",
  folder: "fantasy-wonderland",
  prefix: "FW",
  rarities: {}
},
{
  id: "friendshipsbegin",
  name: "Friendships Begin",
  folder: "friendshipsbegin",
  prefix: "SD01",
  rarities: {}
},
{
  id: "12",
  name: "Discord",
  folder: "discord",
  prefix: "BP02",
  rarities: {}
},
{
  id: "tcgpromos",
  name: "TCG Promos",
  folder: "tcgpromos",
  prefix: "RR",
  rarities: { PR: 18 }
},
];

export default function MyTradesSets() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

  const [collapsedRarities, setCollapsedRarities] = useState<Record<string, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [tradeCards, setTradeCards] = useState<
  Record<string, "trade" | "purchase">
>({});

const [listingMode, setListingMode] = useState<
  "trade" | "purchase"
>("trade");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState(false);
  const [activeDeck, setActiveDeck] = useState<number | null>(null);

  useEffect(() => {
  const load = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }

    // handle logged-out case
    if (!user) {
      setProgressMap({});
      setTradeCards({});
      setQuantities({});
      return;
    }

    // 🔹 LOAD PROGRESS
   const { data: progress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);

    const map: Record<string, any> = {};
    progress?.forEach((row: any) => {
      map[row.set_id] = row.progress || {};
    });

    setProgressMap(map);

    // 🔹 LOAD TRADE
    const { data: trades } = await supabase
  .from("for_trade")
  .select("card_key, listing_type")
  .eq("set_id", resolvedSetId)
  .eq("user_id", user.id);

    const tradeMap: Record<string, "trade" | "purchase"> = {};

trades?.forEach((card: any) => {
  tradeMap[card.card_key] = card.listing_type || "trade";
});

    setTradeCards(tradeMap);

    // 🔹 LOAD QUANTITIES
    const { data: qtyData } = await supabase
  .from("card_quantity")
  .select("card_key, quantity")
  .eq("set_id", resolvedSetId)
  .eq("user_id", user.id);

    const qtyMap: Record<string, number> = {};
    qtyData?.forEach((row: any) => {
      qtyMap[row.card_key] = row.quantity;
    });

    setQuantities(qtyMap);
  };

  // initial load
  load();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    load(session?.user);
  });

  return () => subscription.unsubscribe();
}, [setId]);

const changeQuantity = async (cardKey: string, value: number) => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;

  const next = Math.max(1, value);

  await supabase
    .from("card_quantity")
    .upsert({
      user_id: user.id,
      set_id: resolvedSetId,
      card_key: cardKey,
      quantity: next
    });

  setQuantities((prev) => ({
    ...prev,
    [cardKey]: next
  }));
};

  const toggleTrade = async (cardKey: string) => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const currentType = tradeCards[cardKey];

    if (currentType) {
      await supabase
        .from("for_trade")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", resolvedSetId)
        .eq("card_key", cardKey);

      setTradeCards((prev) => {
        const updated = { ...prev };
        delete updated[cardKey];
        return updated;
      });
    } else {
await supabase.from("for_trade").upsert({
  user_id: user.id,
  set_id: resolvedSetId,
  card_key: cardKey,
  listing_type: listingMode
});

setTradeCards((prev) => ({
  ...prev,
  [cardKey]: listingMode
}));
    }
  };

const slugMap: Record<string, string> = {
  "moon-one": "1",
  "moon-two": "2",
  "moon-three": "3",
  "star-one": "4",
  "rainbow-one": "5",
  "rainbow-two": "6",
  "fun-moments-one": "7",
  "fun-moments-two": "8",
  "fun-moments-three": "11",
  "promotional-cards": "9",
  "fantasy-wonderland": "FW",
  "friendships-begin": "friendshipsbegin",
  "discord": "12",
  "tcg-promos": "tcgpromos",
};

const resolvedSetId = slugMap[setId || ""] || setId;

const set = sets.find((s) => s.id === resolvedSetId);

if (!set) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#faf7ef] to-[#f4efe3]">
      <div className="container py-8 text-center text-gray-500">
        Invalid set
      </div>
    </div>
  );
}

  let cards: any[] = [];

if (set.id === "friendshipsbegin") {

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

    if (prefix === "SD01PER") {
      actualIndex = i + 6; // shift to 07–18
    }

    const num = String(actualIndex).padStart(2, "0");

    cards.push({
      key: `${prefix}${num}`,
      image: `/friendships-begin/${prefix}${num}.webp`
    });
  }
});

  } else if (set.id === "FW") {

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
  if (prefix === "BP01ER") {
    for (let i = 0; i < 6; i++) {
      const num = String(i + 7).padStart(2, "0");

      cards.push({
        key: `BP01ER${num}`,
        image: `/fantasy-wonderland/SD01ER${num}.webp`
      });
    }
    return;
  }
if (prefix === "BP01PSPR") {
  const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];

  PSPR_NUMBERS.forEach((n) => {
    const num = String(n).padStart(2, "0");

    cards.push({
      key: `BP01PSPR${num}`,
      image: `/fantasy-wonderland/BP01PSPR${num}.webp`
    });
  });

  return;
}

for (let i = 1; i <= count; i++) {
  const num = String(i).padStart(2, "0");

  cards.push({
    key: `${prefix}${num}`,
    image:
      prefix === "BP01PER"
        ? `/fantasy-wonderland/SD01PER${num}.webp`
        : `/fantasy-wonderland/${prefix}${num}.webp`
  });
}
});

} else if (set.id === "12") {

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

    if (prefix === "BP02-PER") {
      for (let i = 0; i < 6; i++) {
        const num = String(i + 1).padStart(2, "0");

        cards.push({
          key: `BP02-PER${num}-A2`,
          image: `/cards/discord/BP02-PER${num}-A2.webp`,
        });

        cards.push({
          key: `BP02-PER${num}-B2`,
          image: `/cards/discord/BP02-PER${num}-B2.webp`,
        });
      }
      return;
    }

    for (let i = 1; i <= count; i++) {
      const num = String(i).padStart(2, "0");

      cards.push({
        key: `${prefix}${num}`,
        image: `/cards/discord/${prefix}${num}.webp`,
      });
    }
  });


} else if (set.id === "tcgpromos") {

  for (let i = 1; i <= 18; i++) {
    const num = String(i).padStart(2, "0");

    cards.push({
      key: `RR${num}`,
      image: `/tcgpromos/RR${num}.webp`
    });
  }

} else if (set.id === "9") {

  cards = [1, 2, 3, 4, 5, 7].map((num) => ({
    rarity: "PR",
    number: num,
    key: `PR-${num}`
  }));

} else {

  cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1,
      key: `${rarity}-${i + 1}`
    }))
  );

}

const progress =
  set.id === "friendshipsbegin"
    ? (
        progressMap["friendshipsbegin"] ||
        progressMap["SD"] ||
        {}
      )
    : set.id === "FW"
    ? (
        progressMap["FW"] ||
        progressMap["fantasywonderland"] ||
        progressMap["fantasy-wonderland"] ||
        progressMap["BP01"] ||
        {}
      )
    : progressMap[set.id] || {};

const ownedBonusCards = cards.filter(card => 
  progress[card.key] || progress[`BONUS-${card.key}`]
);

const hasStarterDeck = set.id === "friendshipsbegin" &&
  ["SD01A","SD01B","SD01C","SD01D","SD01E","SD01F"].some(deck =>
    Array.from({ length: 21 }).some((_, i) =>
      progress[`${deck}-${i + 1}`]
    )
  );

const rarityOrders: Record<string, string[]> = {

  //Star
  "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],

  // Eternal Moon
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "3": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],

  // Rainbow
  "5": ["R","SR","FR","TR","TGR","MTR","SSR","UR","USR","XR"],
  "6": ["BASE", "R", "SR", "ST", "TR", "TGR", "SSR", "FR", "UR", "USR", "XR"],

  // Fun Moments
  "7": ["N","SN","R","SR","SSR","UR","CR"],
  "8": ["N","SN","R","SR","SSR","UR","UGR","CR"],

  // Fantasy Wonderland
  "FW": [
    "C",
    "U",
    "ER",
    "SR",
    "SPR",
    "GR",
    "CR",
    "RR",
    "※ER",
    "※SPR",
    "※GR",
    "※CR",
    "※RR"
  ],

  // Friendships Begin
  "friendshipsbegin": [
    "C",
    "U",
    "SR",
    "SPR",
    "GR",
    "CR",
    "ER",
    "※ER",
    "※RR"
  ],

  // Promos
  "9": ["PR"],
  "tcgpromos": ["PR"]

};

  return (
    <div
  className="min-h-screen"
  style={{
    background: `
      radial-gradient(circle at top, rgba(255,255,255,.035), transparent 45%),
      linear-gradient(180deg,#090909 0%,#111111 45%,#0a0a0a 100%)
    `,
  }}
>
      <div className="max-w-7xl mx-auto px-5 py-8">
<div className="mb-10">
  <button
    onClick={() => navigate("/inventory")}
    className="
group
inline-flex
items-center
gap-3
rounded-2xl
border
border-[#2f2f2f]
bg-[#181818]
px-5
py-3
text-white
transition-all
duration-200
hover:border-[#d4af37]
hover:bg-[#202020]
hover:-translate-y-0.5
"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#393939] bg-[#232323]">
      ←
    </div>

    <div>
      <div className="text-[10px] uppercase tracking-[0.28em] text-[#808080]">
        Collection
      </div>
      <div className="font-semibold">
        Back to Inventory
      </div>
    </div>
  </button>
</div>

<div className="relative overflow-hidden rounded-[34px] border border-[#2b2b2b] bg-gradient-to-b from-[#1d1d1d] via-[#171717] to-[#101010] shadow-[0_22px_60px_rgba(0,0,0,.65)] mb-10">

  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,.06),transparent_55%)] pointer-events-none" />

  <div className="px-10 py-10 relative z-10">

    <div className="text-center">

      <div className="text-[11px] uppercase tracking-[0.4em] text-[#7f7f7f] mb-3">
        Collection Inventory
      </div>

      <h1 className="text-5xl font-black tracking-tight text-[#f5f5f5]">
        {set.name}
      </h1>

      <div className="mx-auto mt-6 mb-7 h-[3px] w-28 rounded-full bg-gradient-to-r from-[#8a6b19] via-[#d4af37] to-[#8a6b19]" />

      <p className="mx-auto max-w-3xl text-[15px] leading-7 text-[#b9b9b9]">
        {set.id === "friendshipsbegin"
          ? "Starter Deck cards cannot be traded, but you can still edit your inventory. Only Bonus Pack cards may be marked for trade."
          : "Tap cards to mark them for trade or purchase. Enable Edit Inventory to adjust your quantities."}
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-4">

        <button
          onClick={() => setListingMode("trade")}
          className={`rounded-2xl border px-7 py-3 font-semibold transition-all ${
            listingMode === "trade"
              ? "border-[#d4af37] bg-[#d4af37] text-[#111111] shadow-[0_0_18px_rgba(212,175,55,.25)]"
              : "border-[#3b3b3b] bg-[#232323] text-[#f5f5f5] hover:border-[#d4af37] hover:bg-[#2a2a2a]"
          }`}
        >
          For Trade
        </button>

        <button
          onClick={() => setEditMode(!editMode)}
          className={`rounded-2xl border px-7 py-3 font-semibold transition-all ${
            editMode
              ? "border-[#d4af37] bg-[#d4af37] text-[#111111] shadow-[0_0_18px_rgba(212,175,55,.25)]"
              : "border-[#3b3b3b] bg-[#232323] text-[#f5f5f5] hover:border-[#d4af37] hover:bg-[#2a2a2a]"
          }`}
        >
          {editMode ? "Done Editing" : "Edit Inventory"}
        </button>

        <button
          onClick={() => setListingMode("purchase")}
          className={`rounded-2xl border px-7 py-3 font-semibold transition-all ${
            listingMode === "purchase"
              ? "border-[#d4af37] bg-[#d4af37] text-[#111111] shadow-[0_0_18px_rgba(212,175,55,.25)]"
              : "border-[#3b3b3b] bg-[#232323] text-[#f5f5f5] hover:border-[#d4af37] hover:bg-[#2a2a2a]"
          }`}
        >
          For Purchase
        </button>

      </div>

    </div>

  </div>

</div>

        {(set.id === "friendshipsbegin"
  ? ownedBonusCards.length === 0 && !hasStarterDeck
  : ownedBonusCards.length === 0
) ? (
        <div
  className="
    rounded-3xl
    border
    border-[#2c2c2c]
    bg-[#181818]
    shadow-[0_18px_50px_rgba(0,0,0,.55)]
    px-8
    py-16
    text-center
  "
>
  <div className="text-[11px] uppercase tracking-[0.35em] text-[#7f7f7f] mb-3">
    Inventory
  </div>

  <h2 className="text-3xl font-black text-[#f5f5f5]">
    No Cards Found
  </h2>

  <div className="mx-auto mt-5 mb-6 h-[2px] w-20 rounded-full bg-[#d4af37]" />

  <p className="mx-auto max-w-xl text-[15px] leading-7 text-[#b3b3b3]">
    You don't currently own any cards in this set. Add cards to your collection
    first, then they'll appear here for trading or purchase listings.
  </p>
</div>
        ) : (
            <>

{set.id === "friendshipsbegin" && (
      <div className="mb-6">

        <h2 className="text-center text-sm text-[#5c4022] mb-4">
          Starter Decks
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {[
  { code: "SD01A", name: "Twilight Sparkle", img: "/starter-decks-boxes/SDTWILIGHT.webp" },
  { code: "SD01B", name: "Fluttershy", img: "/starter-decks-boxes/SDFLUTTERSHY.webp" },
  { code: "SD01C", name: "Pinkie Pie", img: "/starter-decks-boxes/SDPINKIEPIE.webp" },
  { code: "SD01D", name: "Applejack", img: "/starter-decks-boxes/SDAPPLEJACK.webp" },
  { code: "SD01E", name: "Rainbow Dash", img: "/starter-decks-boxes/SDRAINBOWDASH.webp" },
  { code: "SD01F", name: "Rarity", img: "/starter-decks-boxes/SDRARITY.webp" },
].filter((deck) => {

  const deckLetter = deck.code.slice(-1);
  const deckIndex = deckLetter.charCodeAt(0) - 64;

  const requiredCards: string[] = [];

  const add = (rarity: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      requiredCards.push(
        `${deck.code}${rarity}${String(i).padStart(2, "0")}`
      );
    }
  };

  add("C", 9);
  add("U", 4);
  add("SR", 2);

  requiredCards.push(
    `SD01ER${String(deckIndex).padStart(2, "0")}`
  );

  add("SPR", 4);

  requiredCards.push(
    `SD01RR${String(deckIndex).padStart(2, "0")}`
  );

  return requiredCards.every(
    (key) => progress[`STARTER-${key}`]
  );

}).map((deck, i) => {

  const isActive = activeDeck === i;

  return (
    <div
  key={deck.code}
  onClick={(e) => e.stopPropagation()}
  className={`cursor-pointer p-2 rounded-2xl transition flex flex-col items-center ${
    isActive
      ? "scale-105 bg-purple-100 shadow-md"
      : "opacity-80 hover:opacity-100"
  }`}
>
      <div className="relative">
  <img
    src={deck.img}
    className="h-28 sm:h-32 md:h-36 object-contain rounded-xl"
  />

  {/* INVENTORY CONTROL */}
  <div
    onClick={(e) => e.stopPropagation()}
    className="absolute bottom-1 right-1 flex items-center bg-[#5a3e84] text-[#f5e6a8] text-[10px] rounded-full px-2 py-[2px] border border-[#d4af37] shadow"
  >
    {editMode && (
      <button
        onClick={() =>
  changeQuantity(
    deck.code,
    (quantities[deck.code] || 1) - 1
  )
}
        className="px-1"
      >
        −
      </button>
    )}

    <span className="px-1 font-semibold">
      {quantities[deck.code] || 1}
    </span>

    {editMode && (
      <button
        onClick={() =>
  changeQuantity(
    deck.code,
    (quantities[deck.code] || 1) + 1
  )
}
        className="px-1"
      >
        +
      </button>
    )}
  </div>
</div>

      <p className="text-xs text-center mt-1 text-gray-600">
        {deck.name}
      </p>
    </div>
  );
})}
        </div>

      </div>    
    )}


          <div className="space-y-8">

  {Object.entries(
    ownedBonusCards.reduce((acc: Record<string, any[]>, card) => {

      let rarity = card.rarity || "OTHER";

      // TCG parsing
      if (
  set.id === "FW" ||
  set.id === "friendshipsbegin" ||
  set.id === "tcgpromos"
) {

        const match = card.key.match(
          /(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|SSR|ZR|HR|LSR|SGR|SZR|UR|R|U|C)/
        );

        rarity = match?.[0] || "OTHER";

        if (set.id === "tcgpromos") {
  rarity = "PR";
}

        if (rarity === "PER") rarity = "※ER";
        if (rarity === "PSPR") rarity = "※SPR";
        if (rarity === "PCR") rarity = "※CR";
        if (rarity === "PRR") rarity = "※RR";
        if (rarity === "PGR") rarity = "※GR";
      }

      if (!acc[rarity]) {
        acc[rarity] = [];
      }

      acc[rarity].push(card);

      return acc;

    }, {})
  )
    .sort(([a], [b]) => {
      const currentOrder = rarityOrders[set.id] || [];

const indexA = currentOrder.indexOf(a);
const indexB = currentOrder.indexOf(b);

      return indexB - indexA;
    })
    .map(([rarity, rarityCards]: [string, any[]]) => {

      const collapseKey = `${set.id}-${rarity}`;
      const isCollapsed = collapsedRarities[collapseKey];

      return (

        <div key={rarity}>

          {/* HEADER */}
          <button
            onClick={() =>
              setCollapsedRarities((prev) => ({
                ...prev,
                [collapseKey]: !prev[collapseKey],
              }))
            }
            className="relative w-full flex items-center justify-center gap-3 mb-3 group"
          >

            <div className="h-px bg-[#2f2f2f] flex-1 max-w-[120px]" />

            <span className="
px-4
py-1.5
rounded-full
bg-[#202020]
border
border-[#3a3a3a]
text-[#d4af37]
text-[11px]
tracking-[0.22em]
font-bold
uppercase
">
{rarity === "SHINING ZR" || rarity === "SZR"
  ? "◇ZR"
  : rarity === "SN"
  ? "◇N"
  : rarity === "SCR" && set.id !== "4"
  ? "◇CR"
  : rarity}
</span>

            <div className="h-px bg-[#2f2f2f] flex-1 max-w-[120px]" />

            <div className="absolute right-0 text-[#8b6a2b] text-sm">
              {isCollapsed ? "+" : "−"}
            </div>

          </button>

          {!isCollapsed && (

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">

              {rarityCards.map((card) => {

                const key = card.key;
                const listingType = tradeCards[key];

                const isStarterDeck =
                  set.id === "friendshipsbegin" &&
                  key.includes("-");

                const isDoubleCard =
  set.id === "3" &&
  card.rarity === "SZR" &&
  card.number === 1;

                return (

                  <div
                    key={key}
                    onClick={() => {
                      if (!isStarterDeck) toggleTrade(key);
                    }}
                    className={`relative rounded-xl p-[2px] ${
                      isStarterDeck ? "" : "cursor-pointer"
                    } ${
                      listingType === "trade"
  ? "border-2 border-green-500"
  : listingType === "purchase"
  ? "border-2 border-blue-500"
  : ""
                    } ${
                      isDoubleCard
                        ? "col-span-2 aspect-[10/7]"
                        : "aspect-[5/7]"
                    }`}
                  >

                    <img
                      src={
                        set.id === "9"
                          ? `/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.webp`
                          : set.id === "tcgpromos"
                          ? `/tcgpromos/${card.key}.webp`
                          : card.image ||
  `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}${
    set.id === "6" &&
    ["ST", "TR", "TGR"].includes(card.rarity)
      ? ".webp"
      : ".webp"
  }`
                      }
                      className="rounded-lg w-full"
                    />

                    <div
  onClick={(e) => e.stopPropagation()}
  className="absolute bottom-1 right-1"
>
  {editMode && window.innerWidth >= 768 ? (
  <div className="flex items-center bg-[#5a3e84] text-[#f5e6a8] text-[10px] rounded-full px-2 py-[2px] border border-[#d4af37] shadow">
    <input
  type="text"
  inputMode="numeric"
  value={String(quantities[key] || "")}
  placeholder="1"
  onClick={(e) => e.stopPropagation()}
  onFocus={(e) => e.target.select()}
onChange={(e) => {
  const raw = e.target.value;

  // Allow temporary blank input while typing
  if (raw === "") {
    setQuantities((prev) => ({
      ...prev,
      [key]: 0,
    }));
    return;
  }

  const value = Number(raw);

  if (!isNaN(value)) {
    setQuantities((prev) => ({
      ...prev,
      [key]: value,
    }));
  }
}}
onBlur={async () => {
  const finalValue = Math.max(1, quantities[key] || 1);

  setQuantities((prev) => ({
    ...prev,
    [key]: finalValue,
  }));

  await changeQuantity(key, finalValue);
}}
  className="w-12 bg-transparent text-center font-semibold outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
/>
  </div>
)  : (
    <div className="flex items-center bg-[#5a3e84] text-[#f5e6a8] text-[10px] rounded-full px-1.5 py-[2px] border border-[#d4af37] shadow">
      {editMode && (
        <button
          onClick={() =>
  changeQuantity(key, (quantities[key] || 1) - 1)
}
          className="px-1 leading-none hover:text-[#ffd700]"
        >
          −
        </button>
      )}

      <span className="px-1 font-semibold">
        {quantities[key] || 1}
      </span>

      {editMode && (
        <button
          onClick={() =>
  changeQuantity(key, (quantities[key] || 1) + 1)
}
          className="px-1 leading-none hover:text-[#ffd700]"
        >
          +
        </button>
      )}
    </div>
  )}
</div>

                    {listingType && (
                      <div
  className={`absolute top-2 right-2 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow ${
    listingType === "trade"
      ? "bg-green-500"
      : "bg-blue-500"
  }`}
>
  ✓
</div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>
      );
    })}

</div>
          </>
        )}
      </div>
    </div>
  );
}
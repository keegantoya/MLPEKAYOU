import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

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
    id: "9",
    name: "Promotional Cards",
    folder: "promos",
    prefix: "PR",
    rarities: { PR: 5 }
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
  id: "tcgpromos",
  name: "TCG Promos",
  folder: "tcgpromos",
  prefix: "RR",
  rarities: { PR: 6 }
},
];

export default function MyTradesSets() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [tradeCards, setTradeCards] = useState<Record<string, boolean>>({});
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

    // 🔴 handle logged-out case
    if (!user) {
      setProgressMap({});
      setTradeCards({});
      setQuantities({});
      return;
    }

    // 🔹 LOAD PROGRESS
    const { data: progress } = await supabase
      .from("collection_progress")
      .select("*")
      .eq("user_id", user.id);

    const map: Record<string, any> = {};
    progress?.forEach((row: any) => {
      map[row.set_id] = row.progress || {};
    });

    setProgressMap(map);

    // 🔹 LOAD TRADE
    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("set_id", setId)
      .eq("user_id", user.id);

    const tradeMap: Record<string, boolean> = {};
    trades?.forEach((card: any) => {
      tradeMap[card.card_key] = true;
    });

    setTradeCards(tradeMap);

    // 🔹 LOAD QUANTITIES
    const { data: qtyData } = await supabase
      .from("card_quantity")
      .select("*")
      .eq("set_id", setId)
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

const changeQuantity = async (cardKey: string, delta: number) => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;

  const current = quantities[cardKey] || 1;
  const next = Math.max(1, current + delta);

  await supabase
    .from("card_quantity")
    .upsert({
      user_id: user.id,
      set_id: setId,
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

    const isTrade = tradeCards[cardKey];

    if (isTrade) {
      await supabase
        .from("for_trade")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", setId)
        .eq("card_key", cardKey);

      setTradeCards((prev) => {
        const updated = { ...prev };
        delete updated[cardKey];
        return updated;
      });
    } else {
      await supabase.from("for_trade").insert({
        user_id: user.id,
        set_id: setId,
        card_key: cardKey
      });

      setTradeCards((prev) => ({
        ...prev,
        [cardKey]: true
      }));
    }
  };

  const set = sets.find(s => s.id === setId);

if (!set) {
  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />
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
      image: `/friendships-begin/${prefix}${num}.png`
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
        image: `/fantasy-wonderland/SD01ER${num}.png`
      });
    }
    return;
  }
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, "0");

    cards.push({
      key: `${prefix}${num}`,
      image:
        prefix === "BP01PER"
          ? `/fantasy-wonderland/SD01PER${num}.png`
          : `/fantasy-wonderland/${prefix}${num}.png`
    });
  }
});

} else if (set.id === "tcgpromos") {

  for (let i = 1; i <= 6; i++) {
    const num = String(i).padStart(2, "0");

    cards.push({
      key: `RR${num}`,
      image: `/tcgpromos/RR${num}.png`
    });
  }

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
    ? progressMap["SD"] || {}
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

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/my-trades")}
          className="text-sm text-gray-500 hover:text-black mb-4"
        >
          ← Back to My Trades
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{set.name}</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
  {set.id === "friendshipsbegin"
    ? "Starter Deck cards cannot be traded, but you can still edit your inventory. Only Bonus Pack cards may be marked for trade."
    : "Only cards you have collected can be marked for trade, which can be done by simply tapping the card. If you'd like to track your duplicates, there is a private inventory function. Nopony else can see your inventory."
  }
</p>
          <button
  onClick={() => setEditMode(!editMode)}
  className="mt-3 px-3 py-1 rounded-lg bg-[#5a3e84] text-[#f5e6a8] border border-[#d4af37] text-sm font-semibold shadow hover:brightness-110"
>
  {editMode ? "Done Editing" : "Edit Inventory"}
</button>
        </div>

        {(set.id === "friendshipsbegin"
  ? ownedBonusCards.length === 0 && !hasStarterDeck
  : ownedBonusCards.length === 0
) ? (
          <div className="text-center text-gray-500">
            You don’t own any cards in this set.
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
  { code: "SD01A", name: "Twilight Sparkle", img: "/starter-decks-boxes/SDTWILIGHT.png" },
  { code: "SD01B", name: "Fluttershy", img: "/starter-decks-boxes/SDFLUTTERSHY.png" },
  { code: "SD01C", name: "Pinkie Pie", img: "/starter-decks-boxes/SDPINKIEPIE.png" },
  { code: "SD01D", name: "Applejack", img: "/starter-decks-boxes/SDAPPLEJACK.png" },
  { code: "SD01E", name: "Rainbow Dash", img: "/starter-decks-boxes/SDRAINBOWDASH.png" },
  { code: "SD01F", name: "Rarity", img: "/starter-decks-boxes/SDRARITY.png" },
].filter((deck) =>
  Object.keys(progress).some(key =>
    key.startsWith(`STARTER-${deck.code}`)
  )
).map((deck, i) => {

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
        onClick={() => changeQuantity(deck.code, -1)}
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
        onClick={() => changeQuantity(deck.code, 1)}
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


          <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {ownedBonusCards.map((card) => {
              const key = card.key;
              const isTrade = tradeCards[key];
              const isStarterDeck =
  set.id === "friendshipsbegin" && key.includes("-");

              return (
                <div
                  key={key}
                  onClick={() => {
  if (!isStarterDeck) toggleTrade(key);
}}
                  className={`relative rounded-xl p-[2px] ${isStarterDeck ? "" : "cursor-pointer"} ${
  isTrade ? "border-2 border-green-500" : ""
}`}
                >
                  <img
                    src={
  set.id === "9"
  ? `/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`
  : set.id === "tcgpromos"
  ? `/tcgpromos/${card.key}.png`
  : card.image || `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`
}
                    className="rounded-lg w-full"
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
                  
                  <div
  onClick={(e) => e.stopPropagation()}
  className="absolute bottom-1 right-1 flex items-center bg-[#5a3e84] text-[#f5e6a8] text-[10px] rounded-full px-1.5 py-[2px] border border-[#d4af37] shadow"
>
  {editMode && (
    <button
      onClick={() => changeQuantity(key, -1)}
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
      onClick={() => changeQuantity(key, 1)}
      className="px-1 leading-none hover:text-[#ffd700]"
    >
      +
    </button>
  )}
</div>

                  {isTrade && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow">
                      ✓
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
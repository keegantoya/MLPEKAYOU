import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import myProgressBadge from "@/assets/avatars/myprogressbadge.png";

const sets = [
  {
    id: "friendshipsbegin_bonus",
    name: "Friendships Begin — Bonus Deck",
    total: 68,
    rarities: {}
  },
  {
    id: "friendshipsbegin_decks",
    name: "Friendships Begin — Starter Decks",
    total: 6,
    rarities: null
  },
  {
    id: "FW",
    name: "Fantasy Wonderland",
    total: 191,
    rarities: {}
  },
  {
  id: "tcgpromos",
  name: "TCG Promos",
  total: 6,
  rarities: null
},
];

const releasedRoutes: Record<string, string> = {
  "friendshipsbegin_bonus": "/friendshipsbegin",
  "friendshipsbegin_decks": "/friendshipsbegin",
  "FW": "/fantasy-wonderland",
  "tcgpromos": "/tcgpromos",
};

const MyProgressTCG = () => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const { data: collectionData } = await supabase
        .from("collection_progress")
        .select("*")
        .eq("user_id", user.id);

        const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets")
  .eq("id", user.id)
  .single();

setHiddenSets(profile?.iso_hidden_sets || []);

      const progressMap = new Map(
        collectionData?.map((row) => [String(row.set_id), row]) || []
      );

const { data: rawPromos } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "tcgpromos")
  .maybeSingle();

const tcgPromosProgress = rawPromos?.progress || {};

      const newProgress: Record<string, number> = {};

      sets.forEach((set) => {
        const found =
          set.id === "friendshipsbegin_bonus" ||
          set.id === "friendshipsbegin_decks"
            ? progressMap.get("SD")
            : progressMap.get(set.id);

        // BONUS
        if (set.id === "friendshipsbegin_bonus") {
  const progressData = found?.progress || {};

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

  let owned = 0;

BONUS_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 1; i <= count; i++) {
    let actualIndex = i;

    if (prefix === "SD01PER") {
      actualIndex = i + 6; // match your real PER numbering (07–16)
    }

    const key = `${prefix}${String(actualIndex).padStart(2, "0")}`;
    const stateKey = `BONUS-${key}`;

    if (progressData[stateKey]) owned++;
  }
});
  newProgress[set.id] = owned;
  return;
}

        // STARTER DECKS
        if (set.id === "friendshipsbegin_decks") {
          const progressData = found?.progress || {};

          const decks = [
            { code: "SD01A", count: 21 },
            { code: "SD01B", count: 21 },
            { code: "SD01C", count: 21 },
            { code: "SD01D", count: 21 },
            { code: "SD01E", count: 21 },
            { code: "SD01F", count: 21 },
          ];

          let completed = 0;

         const getDeckCards = (deckCode: string) => {
  const cards: string[] = [];

  const deckLetter = deckCode.slice(-1);
  const deckIndex = deckLetter.charCodeAt(0) - 64;

  const add = (rarity: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      cards.push(`${deckCode}${rarity}${String(i).padStart(2, "0")}`);
    }
  };

  add("C", 9);
  add("U", 4);
  add("SR", 2);
  cards.push(`SD01ER${String(deckIndex).padStart(2, "0")}`);
  add("SPR", 4);
  cards.push(`SD01RR${String(deckIndex).padStart(2, "0")}`);

  return cards;
};

decks.forEach((deck) => {
  const cards = getDeckCards(deck.code);

  const complete = cards.every(
    (key) => progressData[`STARTER-${key}`]
  );

  if (complete) completed++;
});

          newProgress[set.id] = completed;
          return;
        }

        // TCG PROMOS
if (set.id === "tcgpromos") {
  const owned = Object.values(tcgPromosProgress).filter(Boolean).length;
  newProgress[set.id] = owned;
  return;
}

        // FANTASY WONDERLAND

const STRUCTURE = [
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

        const validKeys = new Set(
  STRUCTURE.flatMap(({ prefix, count }) => {

    if (prefix === "BP01ER") {
      return Array.from({ length: 6 }, (_, i) =>
        `BP01ER${String(i + 7).padStart(2, "0")}`
      );
    }

    if (prefix === "BP01PSPR") {
      return [1,2,3,5,7,8,9,12,13,18,21].map(n =>
        `BP01PSPR${String(n).padStart(2, "0")}`
      );
    }

    return Array.from({ length: count }, (_, i) =>
      `${prefix}${String(i + 1).padStart(2, "0")}`
    );
  })
);

const progressData = found?.progress || {};

const owned = Object.entries(progressData).filter(
  ([key, val]) => val && validKeys.has(key)
).length;

newProgress[set.id] = owned;
      });

      setProgress(newProgress);
    };

    loadProgress();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#e9e2f3",
        backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
        backgroundSize: "26px 26px",
      }}
    >
      <KayouHeader />

      <div className="container py-8 flex-1">
        <img
          src={myProgressBadge}
          alt="My Progress"
          className="mx-auto h-14 sm:h-16 md:h-20 object-contain mb-2"
        />

        <p className="text-[#5c4022] text-sm sm:text-base mb-6 max-w-xl mx-auto text-center">
          All progress updates based on the cards you own. Progress is saved to your account and accessible on any device.
        </p>

{/* ---- SETS ---- */}
<div className="my-10 border-t border-gray-300 text-center relative">
  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
    Sets
  </span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sets
    .filter((set) =>
      ["friendshipsbegin_bonus", "friendshipsbegin_decks", "FW"].includes(set.id)
    )
    .map((set) => {
     const owned = progress[set.id] || 0;
     const isHidden = hiddenSets.includes(set.id);
const percent = Math.round((owned / set.total) * 100);
const isMastered = percent === 100;
const hasStarted = owned > 0;
      const route = releasedRoutes[set.id];

      return (
  <div key={set.id} className="relative">

    {isHidden && (
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/60 text-[10px] sm:text-xs px-2 py-1 rounded-md">
          SET HIDDEN
        </div>
      </div>
    )}

    <button
  onClick={() => navigate(route)}
  className={`
    relative
    w-full bg-gradient-to-b from-[#7c5aa6] to-[#5a3e84]
        border border-[#d4af37]/40 rounded-xl p-4 text-left
        transition hover:shadow-md hover:scale-[1.01]
        ${isHidden ? "opacity-40" : ""}
      `}
    >
      {isMastered && (
  <div className="absolute inset-0 bg-[#3b2a6a]/70 rounded-xl pointer-events-none" />
)}

{isMastered && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div
      className="text-[11px] sm:text-[10px] md:text-[10px] font-semibold px-7 py-3 sm:px-3 sm:py-1.5 rounded-md shadow tracking-wide text-center flex items-center justify-center border border-[#5a3e84]/50"
      style={{
        background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)",
        color: "#3b2a1a"
      }}
    >
      <span className="block text-center w-full">MASTERED</span>
    </div>
  </div>
)}
      <div className="flex justify-between mb-2">
        <span className="text-[#f5e6a8]">{set.name}</span>
        <span className="text-xs text-[#f5e6a8]">{percent}%</span>
      </div>

      <div className="w-full h-2 bg-[#3b2a1a]/40 rounded-full overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, #f5e6a8, #d4af37)",
          }}
        />
      </div>

      <div className="text-xs text-[#f5e6a8] mt-2">
        {owned} / {set.total}
      </div>
    </button>
  </div>
);
    })}
</div>

{/* ---- PROMOS ---- */}
<div className="my-10 border-t border-gray-300 text-center relative">
  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
    Promotional Cards
  </span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sets
    .filter((set) =>
      ["tcgpromos"].includes(set.id)
    )
    .map((set) => {
      const owned = progress[set.id] || 0;
      const percent = Math.round((owned / set.total) * 100);
      const isMastered = percent === 100;
      const route = releasedRoutes[set.id];

      return (
  <button
    key={set.id}
    onClick={() => navigate(route)}
    className="relative w-full bg-gradient-to-b from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/40 rounded-xl p-4 text-left"
  >

    {percent === 100 && (
      <div className="absolute inset-0 bg-[#3b2a6a]/70 rounded-xl pointer-events-none" />
    )}

    {percent === 100 && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
  className="text-[11px] sm:text-[10px] md:text-[10px] font-semibold px-7 py-3 sm:px-3 sm:py-1.5 rounded-md shadow tracking-wide text-center flex items-center justify-center border border-[#5a3e84]/50"
  style={{
    background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)",
    color: "#3b2a1a"
  }}
>
  <span className="block text-center w-full">MASTERED</span>
</div>
      </div>
    )}

    <div className="flex justify-between mb-2">
      <span className="text-[#f5e6a8]">{set.name}</span>
      <span className="text-xs text-[#f5e6a8]">{percent}%</span>
    </div>

    <div className="w-full h-2 bg-[#3b2a1a]/40 rounded-full overflow-hidden">
      <div
        className="h-full"
        style={{
          width: `${percent}%`,
          background: "linear-gradient(90deg, #f5e6a8, #d4af37)",
        }}
      />
    </div>

    <div className="text-xs text-[#f5e6a8] mt-2">
      {owned} / {set.total}
    </div>

  </button>
);
    })}
</div>
      </div>
    </div>
  );
};

export default MyProgressTCG;
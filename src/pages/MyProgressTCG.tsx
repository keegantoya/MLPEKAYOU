import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import fluttershyCutieMark from "/website-assets/fluttershycutiemark.webp";
import applejackCutieMark from "/website-assets/applejackcutiemark.webp";
import pinkiePieCutieMark from "/website-assets/pinkiecutiemark.webp";
import rainbowDashCutieMark from "/website-assets/rainbowdashcutiemark.webp";
import rarityCutieMark from "/website-assets/raritycutiemark.webp";
import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.webp";

const cutieMarks = [
  fluttershyCutieMark,
  applejackCutieMark,
  pinkiePieCutieMark,
  rainbowDashCutieMark,
  rarityCutieMark,
  twilightSparkleCutieMark,
];

const setImages: Record<string, string> = {
  friendshipsbegin_bonus: "/thumbnails/friendship-begins-bonus-thumbnail.webp",
  friendshipsbegin_decks: "/thumbnails/friendship-begins-thumbnail.webp",
  FW: "/thumbnails/fantasy-wonderland-thumbnail.webp",
  tcgpromos: "/thumbnails/tcgpromosthumbnail.webp",
};

const setBadgeImages: Record<string, string> = {
  friendshipsbegin_bonus: "/starter-decks-boxes/SDBONUSPACKS.webp",
  friendshipsbegin_decks: "/starter-decks-boxes/SDRAINBOWDASH.webp",
  FW: "/set-pictures/fantasywonderlandpack.webp",
  tcgpromos: "/set-pictures/promopackfriendshipsbegin.webp",
};

const sets = [
  {
    id: "friendshipsbegin_bonus",
    name: "Friendships Begin — Bonus Deck",
    total: 68,
    rarities: {},
    isNew: false,
  },
  {
    id: "friendshipsbegin_decks",
    name: "Friendships Begin — Starter Decks",
    total: 6,
    rarities: null,
    isNew: false,
  },
  {
    id: "FW",
    name: "Fantasy Wonderland",
    total: 191,
    rarities: {},
    isNew: false,
  },
  {
  id: "tcgpromos",
  name: "TCG Promos",
  total: 6,
  rarities: null,
  isNew: false,
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
  .select("set_id, progress")
  .eq("user_id", user.id);

const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets_tcg")
  .eq("id", user.id)
  .single();

setHiddenSets(profile?.iso_hidden_sets_tcg || []);

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
  background: `
    radial-gradient(circle at 10% 15%, rgba(255,255,255,0.75), transparent 28%),
    radial-gradient(circle at 90% 10%, rgba(255,223,128,0.18), transparent 24%),
    radial-gradient(circle at 75% 30%, rgba(251,207,232,0.16), transparent 26%),
    radial-gradient(circle at 20% 65%, rgba(196,181,253,0.18), transparent 32%),
    radial-gradient(circle at 80% 85%, rgba(147,197,253,0.14), transparent 30%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35), transparent 45%),
    linear-gradient(
      180deg,
      #fcf8ff 0%,
      #f8f1ff 22%,
      #f4ecff 48%,
      #efe6ff 72%,
      #e8ddff 100%
    )
  `,
}}
    >

<div className="container py-8 flex-1">
{/* HERO */}
<div className="max-w-6xl mx-auto mb-6">
  <div
    className="relative overflow-hidden rounded-[2rem] border border-[#f3d98b]/50 shadow-[0_10px_30px_rgba(168,85,247,0.08)]"
    style={{
      background: `
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.85), transparent 25%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.75), transparent 22%),
        radial-gradient(circle at 50% 10%, rgba(255,255,255,0.65), transparent 18%),
        linear-gradient(
          180deg,
          #d8c8ff 0%,
          #eadfff 18%,
          #f8f3ff 42%,
          #fff9ff 72%,
          #f7eeff 100%
        )
      `,
    }}
  >
    {/* Background Artwork */}
    <div className="absolute inset-0 pointer-events-none">
      {/* Castle */}
      <div
        className="absolute left-0 bottom-0 w-[30%] h-full opacity-20"
        style={{
          background:
            "url('/website-assets/twilightcastle.webp') left bottom / contain no-repeat",
        }}
      />

      {/* Rainbow */}
      <div
        className="absolute right-0 bottom-8 w-[35%] h-[45%] opacity-20"
        style={{
          background:
            "url('/website-assets/rainbow.webp') right center / contain no-repeat",
        }}
      />

      {/* Clouds */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />

      {/* Sparkles and Cutie Marks */}
      {Array.from({ length: 80 }).map((_, i) => (
        <img
          key={i}
          src={cutieMarks[i % cutieMarks.length]}
          alt=""
          className="absolute select-none"
          style={{
            left: `${(i * 13) % 100}%`,
            top: `${(i * 19) % 100}%`,
            width: `${14 + (i % 6) * 6}px`,
            opacity: 0.08,
            transform: `rotate(${(i * 37) % 360}deg)`,
          }}
        />
      ))}
    </div>

    {/* Content */}
    <div className="relative z-10 px-4 md:px-6 py-2 md:py-3 text-center">

      {/* Title */}
      <h1
        className="text-3xl md:text-4xl font-black leading-none mb-2"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#7c3aed",
          WebkitTextStroke: "0px rgba(255,255,255,0)",
          textShadow: `
            0 0 0 #d4af37,
            0 4px 0 #d4af37,
            0 8px 20px rgba(124,58,237,0.25)
          `,
          letterSpacing: "0.03em",
        }}
      >
        TCG Progress
      </h1>

      {/* Decorative Star */}
      <div className="text-sm mb-0.5 text-[#f5c542] drop-shadow-sm">✦</div>

      {/* Stats Strip */}
      <div className="max-w-2xl mx-auto mb-2 rounded-xl bg-white/85 backdrop-blur-sm border border-[#f3d98b]/40 shadow-sm px-3 py-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-black text-[#7c3aed]">
              {sets.filter((set) => set.id !== "tcgpromos").length}
            </div>
            <div className="text-sm uppercase tracking-[0.15em] text-[#7c5aa6] mt-1">
              Total Sets
            </div>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-black text-[#d4af37]">
{
  sets.filter(
    (set) =>
      set.id !== "tcgpromos" &&
      set.total > 0 &&
      (progress[set.id] || 0) === set.total
  ).length
}
            </div>
            <div className="text-sm uppercase tracking-[0.15em] text-[#7c5aa6] mt-1">
              Mastered
            </div>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-black text-[#ec4899]">
              {Math.round(
  (
    sets
      .filter((set) => set.id !== "tcgpromos")
      .reduce((sum, set) => sum + (progress[set.id] || 0), 0) /
    sets
      .filter((set) => set.id !== "tcgpromos")
      .reduce((sum, set) => sum + set.total, 0)
  ) *
    100
) || 0}
%
            </div>
            <div className="text-sm uppercase tracking-[0.15em] text-[#7c5aa6] mt-1">
              Overall Progress
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* REUSABLE SECTION HEADER */}
{(() => {
  const renderSectionHeader = (title: string) => (
    <div className="max-w-6xl mx-auto my-10 flex items-center gap-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/35 to-[#d4af37]/15" />
      <h2
        className="text-xl md:text-3xl font-semibold tracking-[0.08em] uppercase text-[#44306a]"
        style={{
          fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
        }}
      >
        {title}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4af37]/35 to-[#d4af37]/15" />
    </div>
  );

  const renderSetCard = (set: any) => {
    const owned = progress[set.id] || 0;
    const percent =
      set.total > 0 ? Math.round((owned / set.total) * 100) : 0;
    const isMastered = percent === 100;
    const isHidden = hiddenSets.includes(set.id);
    const route = releasedRoutes[set.id];
    const image = setImages[set.id];
      const badgeImage = setBadgeImages[set.id];
        const showBadgeImage = true;

    return (
      <button
        key={set.id}
        onClick={() => route && navigate(route)}
        className="group relative overflow-hidden rounded-[2rem]
  border-2 border-white/80 bg-white/95 backdrop-blur-sm
  shadow-[0_18px_45px_rgba(168,85,247,0.14),0_6px_18px_rgba(212,175,55,0.10)]
  hover:-translate-y-2
  hover:shadow-[0_30px_70px_rgba(168,85,247,0.22),0_10px_25px_rgba(212,175,55,0.16)]
  transition-all duration-500 text-left
  w-full
  scale-100 sm:scale-[0.8] origin-top"
      >
        {/* Thumbnail */}
        <div className="relative h-36 overflow-hidden rounded-t-[2rem]">
  {/* Main artwork */}
  <img
    src={image}
    alt={set.name}
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  />

  {/* Soft magical glow overlay */}
  <div
    className="absolute inset-0"
    style={{
      background: `
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.28), transparent 30%),
        radial-gradient(circle at 80% 15%, rgba(255,255,255,0.18), transparent 22%),
        linear-gradient(to top, rgba(47,33,80,0.18), rgba(47,33,80,0.02))
      `,
    }}
  />

  {/* Top-left NEW ribbon */}
  {set.isNew && (
  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#ff6fb3] to-[#f9a8d4] text-white text-[10px] font-bold tracking-[0.12em] shadow-lg uppercase">
    New
  </div>
)}

  {/* Top-right collectible badge */}
{showBadgeImage && (
  <div
    className="absolute top-2 right-2 z-20 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl p-0.5 sm:p-1"
    style={{
  backgroundColor: "#ffffff",
  border: "2px solid #8b5cf6",
  boxShadow: `
    inset 0 0 0 1px rgba(255,255,255,1),
    0 0 12px rgba(139,92,246,0.35),
    0 8px 20px rgba(0,0,0,0.18)
  `,
}}
  >
    <img
      src={badgeImage}
      alt=""
      className="w-full h-full object-contain"
    />
  </div>
)}

  {/* Mastered overlay replaces NEW */}
  {isMastered && !isHidden && (
    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#f5e6a8] via-[#d4af37] to-[#b8962e] text-white text-[10px] font-bold tracking-[0.12em] shadow-lg uppercase">
      Mastered
    </div>
  )}

  {/* Hidden overlay */}
  {isHidden && (
    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#6b4a97]/90 text-[#f5e6a8] text-[10px] font-bold tracking-[0.12em] shadow-lg uppercase">
      Hidden
    </div>
  )}
</div>

        {/* Content */}
        <div
  className="relative overflow-visible px-5 pb-5 pt-0 h-[210px] flex flex-col"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.98) 100%)",
          }}
        >
          {/* Cutie Mark Background Pattern */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <img
                key={i}
                src={cutieMarks[i % cutieMarks.length]}
                alt=""
                className="absolute select-none"
                style={{
                  left: `${(i * 23) % 100}%`,
                  top: `${(i * 37) % 100}%`,
                  width: `${14 + (i % 4) * 4}px`,
                  opacity: 0.08,
                  transform: `rotate(${(i * 41) % 360}deg)`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="relative -mt-6 mb-4 flex justify-center z-30">
  <div
    className="w-20 h-20 rounded-full border-4 border-white shadow-xl flex items-center justify-center"
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,238,255,0.98) 100%)",
    }}
  >
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
      style={{
        background:
          "linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f9a8d4 100%)",
        color: "white",
        textShadow: "0 1px 2px rgba(0,0,0,0.15)",
      }}
    >
      {percent}%
    </div>
  </div>
</div>

<h3 className="font-semibold text-[#2f2150] text-base md:text-lg leading-snug text-center mb-2">
  {set.name}
</h3>

<div className="mt-auto">
  <div className="h-2 rounded-full bg-[#ede7f7] overflow-hidden">
    <div
      className="h-full rounded-full"
      style={{
        width: `${percent}%`,
        background:
          "linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #d4af37 100%)",
      }}
    />
  </div>

  <div className="pt-3 flex justify-between items-center text-sm">
    <span className="font-semibold text-[#2f2150]">
      {owned} / {set.total}
    </span>

    <span className="text-[#7c5aa6] font-medium">
  {set.id === "friendshipsbegin_decks"
    ? `${set.total} decks`
    : `${set.total} cards`}
</span>
  </div>
</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="pb-0">

<div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
  {sets
    .filter(
      (set) =>
        [
          "friendshipsbegin_bonus",
          "friendshipsbegin_decks",
          "FW",
          "tcgpromos",
        ].includes(set.id) &&
        releasedRoutes[set.id] &&
        !hiddenSets.includes(set.id)
    )
    .filter((set) => (progress[set.id] || 0) < set.total)
    .map(renderSetCard)}
</div>
      {/* Mastered Set Plates */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-5xl mx-auto mt-8 pb-0 px-4">
        {sets
          .filter((set) => {
            const owned = progress[set.id] || 0;
            return set.total > 0 && owned === set.total;
          })
          .map((set) => (
            <div
              key={`mastered-${set.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/92 border border-[#d4af37]/40 shadow-md"
            >
              <span className="text-xs md:text-sm font-semibold text-[#2f2150]">
                {set.name}
              </span>

              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-[#f5e6a8] via-[#d4af37] to-[#b8962e] text-white text-[10px] font-bold shadow-sm">
                ✓
              </span>
            </div>
          ))}
      </div>
    </div>
  );
})()}
</div>
    </div>
  );
};

export default MyProgressTCG;
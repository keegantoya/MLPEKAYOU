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
  total: 12,
  rarities: null,
  isNew: false,
},
];

const releasedRoutes: Record<string, string> = {
  "friendshipsbegin_bonus": "/friendships-begin",
  "friendshipsbegin_decks": "/friendships-begin",
  "FW": "/fantasy-wonderland",
  "tcgpromos": "/promotional-cards",
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
      radial-gradient(circle at 15% 15%, rgba(212,175,55,.08), transparent 28%),
      radial-gradient(circle at 85% 10%, rgba(212,175,55,.06), transparent 26%),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,.03), transparent 40%),
      linear-gradient(
        180deg,
        #202020 0%,
        #181818 28%,
        #111111 65%,
        #0b0b0b 100%
      )
    `,
  }}
>

<div className="container py-8 flex-1">
{/* HERO */}
<div className="max-w-6xl mx-auto mb-6">
  <div
    className="
relative
overflow-hidden
rounded-[2rem]
border
border-[#caa43a]
bg-gradient-to-b
from-[#2a2a2a]
via-[#1d1d1d]
to-[#121212]
shadow-[0_25px_60px_rgba(0,0,0,.45)]
"
    style={{
      background: `
linear-gradient(
180deg,
#313131 0%,
#252525 22%,
#191919 60%,
#111111 100%
)
`,
    }}
  >
    <div className="relative z-10 px-4 md:px-6 py-2 md:py-3 text-center">

      <h1
        className="text-4xl md:text-5xl font-black mb-2 tracking-[.12em]"
        style={{
          fontFamily: "Oxanium",
          color: "#f5d37a",
          textShadow: "0 0 25px rgba(212,175,55,.25)",
        }}
      >
        TCG Progress
      </h1>

      <div
        className="
max-w-3xl
mx-auto
rounded-2xl
bg-[#151515]/95
border
border-[#caa43a]
backdrop-blur-xl
shadow-[0_12px_30px_rgba(0,0,0,.45)]
px-6
py-5
"
      >
        <div className="grid grid-cols-3 gap-2 text-center">

          <div>
            <div
              className="text-2xl md:text-3xl font-black text-[#f5d37a]"
              style={{ fontFamily: "Oxanium, sans-serif" }}
            >
              {sets.filter((s) => s.id !== "tcgpromos").length}
            </div>

            <div
              className="text-sm uppercase tracking-[0.15em] text-[#a6a6a6] mt-1"
              style={{ fontFamily: "Oxanium, sans-serif" }}
            >
              Total Sets
            </div>
          </div>

          <div>
            <div
              className="text-2xl md:text-3xl font-black text-[#f5d37a]"
              style={{ fontFamily: "Oxanium, sans-serif" }}
            >
              {
                sets.filter(
                  (set) =>
                    set.id !== "tcgpromos" &&
                    set.total > 0 &&
                    (progress[set.id] || 0) === set.total
                ).length
              }
            </div>

            <div
              className="text-sm uppercase tracking-[0.15em] text-[#a6a6a6] mt-1"
              style={{ fontFamily: "Oxanium, sans-serif" }}
            >
              Mastered
            </div>
          </div>

          <div>
            <div
              className="text-2xl md:text-3xl font-black text-[#f5d37a]"
              style={{ fontFamily: "Oxanium, sans-serif" }}
            >
              {Math.round(
                (
                  sets
                    .filter((set) => set.id !== "tcgpromos")
                    .reduce(
                      (sum, set) => sum + (progress[set.id] || 0),
                      0
                    ) /
                  sets
                    .filter((set) => set.id !== "tcgpromos")
                    .reduce((sum, set) => sum + set.total, 0)
                ) * 100
              ) || 0}
              %
            </div>

            <div
              className="text-sm uppercase tracking-[0.15em] text-[#a6a6a6] mt-1"
              style={{ fontFamily: "Oxanium, sans-serif" }}
            >
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

  return (
    <button
      key={set.id}
      onClick={() => route && navigate(route)}
      className="
        group
        relative
        overflow-hidden
        rounded-[2rem]
        border
        border-[#caa43a]
        bg-gradient-to-b
        from-[#2b2b2b]
        via-[#1d1d1d]
        to-[#121212]
        shadow-[0_18px_45px_rgba(0,0,0,.35)]
        hover:border-[#f5d37a]
        hover:-translate-y-1
        transition-all
        duration-300

        aspect-square
        sm:aspect-auto
        sm:scale-[0.8]
        origin-top
      "
    >
      {/* IMAGE */}
      <div className="relative h-[55%] sm:h-36 overflow-hidden">

        <img
          src={image}
          alt={set.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {badgeImage && (
          <div
            className="
              hidden
              sm:flex
              absolute
              top-2
              right-2
              w-14
              h-14
              rounded-xl
              bg-white
              border-2
              border-[#8b5cf6]
              p-1
              items-center
              justify-center
            "
          >
            <img
              src={badgeImage}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {set.isNew && (
          <div className="absolute left-2 top-2 px-3 py-1 rounded-full bg-[#ffe470] text-[#222] text-[10px] font-bold uppercase">
            NEW
          </div>
        )}

        {isMastered && (
          <div className="absolute left-2 top-2 px-3 py-1 rounded-full bg-[#d4af37] text-[#111] text-[10px] font-bold uppercase">
            MASTERED
          </div>
        )}

        {isHidden && (
          <div className="absolute left-2 top-2 px-3 py-1 rounded-full bg-[#555] text-white text-[10px] font-bold uppercase">
            HIDDEN
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 p-3 sm:p-5">

        <div className="flex justify-center -mt-10 sm:-mt-12 mb-3 z-10">

          <div
            className="
              px-5
              py-2
              rounded-full
              border
              border-[#d4af37]
              bg-gradient-to-b
              from-[#2d2d2d]
              to-[#171717]
              shadow-[0_8px_18px_rgba(0,0,0,.45)]
              flex
              items-center
              justify-center
              mx-auto
            "
          >
            <span
              className="
                text-xl
                sm:text-2xl
                font-black
                tracking-wide
                text-[#f5d37a]
              "
              style={{
                fontFamily: "Oxanium, sans-serif",
                textShadow: "0 0 10px rgba(212,175,55,.35)",
              }}
            >
              {percent}%
            </span>
          </div>

        </div>

        <h3
          className="
            text-center
            text-sm
            sm:text-lg
            font-semibold
            text-[#f4ead0]
            leading-tight
            line-clamp-2
            min-h-[2.8rem]
            sm:min-h-[3.5rem]
          "
          style={{ fontFamily: "Oxanium, sans-serif" }}
        >
          {set.name}
        </h3>

        <div className="hidden sm:block mt-auto">

          <div className="h-2 rounded-full bg-[#333] overflow-hidden">

            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                background:
                  "linear-gradient(90deg,#b48b24,#d4af37,#f7e28f)",
              }}
            />

          </div>

          <div className="flex justify-between mt-3 text-sm">

            <span className="text-[#f4ead0] font-semibold">
              {owned} / {set.total}
            </span>

            <span className="text-[#9f9f9f]">
              {set.id === "friendshipsbegin_decks"
                ? `${set.total} decks`
                : `${set.total} cards`}
            </span>

          </div>

        </div>

      </div>

    </button>
  );
};

  return (
    <div className="pb-0">

<div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
  {[
    ...sets.filter(
      (set) =>
        [
          "friendshipsbegin_bonus",
          "friendshipsbegin_decks",
          "FW",
        ].includes(set.id) &&
        releasedRoutes[set.id] &&
        !hiddenSets.includes(set.id)
    ),

    ...sets.filter(
      (set) =>
        ["tcgpromos"].includes(set.id) &&
        releasedRoutes[set.id] &&
        !hiddenSets.includes(set.id)
    ),
  ]
    .filter((set) => (progress[set.id] || 0) < set.total)
    .map(renderSetCard)}
</div>
{/* MASTERED COLLECTION */}
<div className="max-w-7xl mx-auto mt-16 pb-32">

  <div className="flex items-center gap-5 mb-8">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#caa43a]/40 to-transparent" />

    <h2
      className="text-2xl md:text-3xl font-bold tracking-[0.25em] text-[#f5d37a]"
      style={{ fontFamily: "Oxanium, sans-serif" }}
    >
      MASTERED COLLECTION
    </h2>

    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#caa43a]/40 to-transparent" />
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">

    {sets
      .filter((set) => {
        const owned = progress[set.id] || 0;
        return set.total > 0 && owned === set.total;
      })
      .map((set) => {

        const image =
          set.id === "tcgpromos"
            ? "/promo-cards/mlpepr002.webp"
            : setBadgeImages[set.id];

return (
  <button
    key={set.id}
    onClick={() => releasedRoutes[set.id] && navigate(releasedRoutes[set.id])}
    className="
      relative
      overflow-hidden
      rounded-3xl
      border
      border-[#caa43a]
      bg-gradient-to-b
      from-[#262626]
      via-[#1a1a1a]
      to-[#101010]
      hover:border-[#f5d37a]
      hover:-translate-y-1
      transition-all
      duration-300
      shadow-[0_12px_30px_rgba(0,0,0,.45)]
      p-5
      text-left
    "
  >

    {/* White Artwork Display */}
    <div
      className="
        rounded-2xl
        bg-white
        border
        border-[#e5e5e5]
        h-36
        flex
        items-center
        justify-center
        p-4
        shadow-inner
      "
    >
      <img
        src={image}
        alt={set.name}
        className="max-h-full max-w-full object-contain"
      />
    </div>

    <h3
      className="mt-5 text-center text-sm font-semibold text-[#f4ead0] min-h-[42px]"
      style={{ fontFamily: "Oxanium, sans-serif" }}
    >
      {set.name}
    </h3>

    <div className="mt-4 flex justify-center">
      <div
        className="
          px-4
          py-1.5
          rounded-full
          bg-gradient-to-r
          from-[#b88a24]
          via-[#d4af37]
          to-[#f5d37a]
          text-[#151515]
          text-xs
          font-bold
          tracking-[0.18em]
        "
      >
        MASTERED
      </div>
    </div>

  </button>
);
      })}

  </div>

</div>
    </div>
  );
})()}
</div>
    </div>
  );
};

export default MyProgressTCG;
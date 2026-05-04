import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import watermark from "@/assets/avatars/mlpekayouwiki.png";


const FriendshipBegins = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [activeDeck, setActiveDeck] = useState<number | null>(null);

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  // ✅ SET CONFIG
  const set = {
    name: "Friendships Begin",
    folder: "friendshipsbegin",
    prefix: "SD",
  };

  const sections = [
    { title: "Bonus Pack Deck", count: 68 },
    { title: "Twilight Sparkle Starter Deck", count: 21 },
    { title: "Fluttershy Starter Deck", count: 21 },
    { title: "Pinkie Pie Starter Deck", count: 21 },
    { title: "Applejack Starter Deck", count: 21 },
    { title: "Rainbow Dash Starter Deck", count: 21 },
    { title: "Rarity Starter Deck", count: 21 },
  ];

  const starterDeckImages = [
    "/starter-decks-boxes/SDBONUSPACKS.png",
  "/starter-decks-boxes/SDTWILIGHT.png",
  "/starter-decks-boxes/SDFLUTTERSHY.png",
  "/starter-decks-boxes/SDPINKIEPIE.png",
  "/starter-decks-boxes/SDAPPLEJACK.png",
  "/starter-decks-boxes/SDRAINBOWDASH.png",
  "/starter-decks-boxes/SDRARITY.png"
];
const starterDeckGroups = [
  { name: "Twilight Sparkle", code: "SD01A", start: 1, end: 21 },
  { name: "Fluttershy", code: "SD01B", start: 22, end: 42 },
  { name: "Pinkie Pie", code: "SD01C", start: 43, end: 63 },
  { name: "Applejack", code: "SD01D", start: 64, end: 84 },
  { name: "Rainbow Dash", code: "SD01E", start: 85, end: 105 },
  { name: "Rarity", code: "SD01F", start: 106, end: 126 },
];

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // LOAD PROGRESS
  useEffect(() => {
    const loadProgress = async (userOverride?: any) => {
      let user = userOverride;

      if (!user) {
        const { data } = await supabase.auth.getSession();
        user = data.session?.user;
      }

      if (user) {
        const { data: saved } = await supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", "SD")
          .single();

        setFlipped(saved?.progress || {});
      } else {
        setFlipped({});
      }

      setLoaded(true);
    };

    loadProgress();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProgress(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // SAVE PROGRESS
  useEffect(() => {
    if (!loaded) return;

    const saveProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      await supabase
        .from("collection_progress_raw")
        .upsert(
          {
            user_id: user.id,
            set_id: "SD",
            progress: flipped,
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

  // TOTAL CARDS
  const totalCards = sections.reduce((sum, s) => sum + s.count, 0);

  // CONFETTI
  useEffect(() => {
    if (!loaded || celebrated) return;

    const owned = Object.values(flipped).filter(Boolean).length;

    if (totalCards > 0 && owned === totalCards) {
      fireConfetti();
      setCelebrated(true);
    }
  }, [flipped, loaded, celebrated, totalCards]);

const isDeckComplete = (deck) => {
  const cards = getDeckCards(deck.code);

  return cards.every((key) => flipped[`STARTER-${key}`]);
};

const getCharacterDeckProgress = () => {
  let completed = 0;

  starterDeckGroups.forEach((deck) => {
    if (isDeckComplete(deck)) {
      completed++;
    }
  });

  return {
    completed,
    total: starterDeckGroups.length,
    percent: Math.round((completed / starterDeckGroups.length) * 100),
  };
};

const getBonusPackProgress = () => {
  let owned = 0;

  BONUS_STRUCTURE.forEach(({ prefix, count }) => {
for (let i = 1; i <= count; i++) {
  let actualIndex = i;

  if (prefix === "SD01PER") {
    actualIndex = i + 6;
  }

  const key = `${prefix}${String(actualIndex).padStart(2, "0")}`;
  const stateKey = `BONUS-${key}`;

  if (flipped[stateKey]) owned++;
}
  });

  return {
    owned,
    total: 68,
    percent: Math.round((owned / 68) * 100),
  };
};

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
  const getCardBack = () => {
    return "/card-backs/tcgdefaultback.png";
  };

const getDeckCards = (deckCode: string) => {
  const cards: string[] = [];

  const deckLetter = deckCode.slice(-1);
  const deckIndex = deckLetter.charCodeAt(0) - 64; // A=1, B=2...

  const add = (rarity: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      cards.push(`${deckCode}${rarity}${String(i).padStart(2, "0")}`);
    }
  };

  // ✅ CORRECT ORDER
  add("C", 9);
  add("U", 4);
  add("SR", 2);

  // ER (no deck letter)
  cards.push(`SD01ER${String(deckIndex).padStart(2, "0")}`);

  // SPR still uses deck letter
  add("SPR", 4);

  // RR (no deck letter)
  cards.push(`SD01RR${String(deckIndex).padStart(2, "0")}`);

  return cards;
};

  return (
    <div className="min-h-screen bg-white">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="mb-6 flex items-center px-2">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-amber-900 hover:text-amber-700 mr-3 whitespace-nowrap"
          >
            ← Back
          </button>

          <h1 className="text-lg font-semibold text-center flex-1">
            {set.name}
          </h1>
        </div>

        {/* DESCRIPTION */}
        <div className="text-center text-sm md:text-base text-gray-500 max-w-3xl md:max-w-5xl mx-auto mt-2 px-4 space-y-3">
  <p>
    Below you will find checklists for all starter decks and bonus packs.
  </p>

  <p>
    Each starter decks contains every card listed in that deck.
  </p>

  <p>
    Due to their abundance, starter decks themselves will not be available for trade or ISO.
  </p>

  <p>
    Bonus pack cards will be available for trade and ISO. 
  </p>
  <div className="text-center text-sm md:text-base text-gray-500 max-w-3xl md:max-w-5xl mx-auto mt-2 mb-6 px-4 space-y-3">
</div>
</div>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (
          
          <div className="space-y-8">

            {/* STARTER DECK ROW */}
<div className="mt-6">
  <h2 className="text-center text-sm text-[#5c4022] mb-4 tracking-wide">
    Starter Decks
  </h2>

  <div className="flex flex-wrap justify-center gap-4">
    {starterDeckGroups.map((deck, i) => {
      return (
        <div
          key={deck.code}
          onClick={() => {
            setActiveDeck(activeDeck === i ? null : i);
          }}
          className={`cursor-pointer transition p-2 rounded-2xl ${
  activeDeck === i
    ? "scale-105 bg-purple-100 shadow-md"
    : "opacity-70 hover:opacity-100"
}`}
        >
          <img
            src={starterDeckImages[i + 1]}
            className="h-20 sm:h-24 object-contain rounded-xl"
          />

          <p className="text-xs text-center mt-1 text-gray-600">
            {deck.name}
          </p>
        </div>
      );
    })}
  </div>
</div>

{/* OPEN DECK (UNDER THE ROW) */}
{activeDeck !== null && (
  <div className="mb-10">

    <h2 className="text-center text-sm text-[#5c4022] mb-4">
      {starterDeckGroups[activeDeck].name} Starter Deck
    </h2>
    <div className="flex justify-center mb-4">
  <button
onClick={() => {
  const updated = { ...flipped };
  const deck = starterDeckGroups[activeDeck];

const cards = getDeckCards(deck.code);

const isComplete = cards.every((key) => flipped[`STARTER-${key}`]);
const shouldComplete = !isComplete;

cards.forEach((key) => {
  updated[`STARTER-${key}`] = shouldComplete;
});

  setFlipped(updated);
}}
    className="text-xs sm:text-sm px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 transition shadow-sm"
  >
    CLICK HERE IF YOU OWN THE FULL DECK
  </button>
</div>

    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
{getDeckCards(starterDeckGroups[activeDeck].code).map((key) => {
  const stateKey = `STARTER-${key}`;

  return (
    <div
      key={key}
      className="aspect-[5/7] cursor-pointer perspective relative"
      onClick={() => toggleFlip(stateKey)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          flipped[stateKey] ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT */}
        <img
          src={`/friendships-begin/${key}.png`}
          className="absolute w-full h-full object-cover rounded-lg backface-hidden"
        />

{/* BACK */}
<img
  src={
    // C06–C09 (deck-specific)
    key.includes("C06") ||
    key.includes("C07") ||
    key.includes("C08") ||
    key.includes("C09")
      ? `/tcg-card-backs/${key}BACK.png`

      // RR (starter decks)
      : key.startsWith("SD01RR")
        ? `/tcg-card-backs/SDRR${key.slice(-2)}BACK.png`

        // ER (ALL ER, but NOT PER)
        : key.includes("ER") && !key.includes("PER")
          ? `/tcg-card-backs/SCENECARDBACK.png`

          // default
          : "/card-backs/tcgdefaultback.png"
  }
  className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
/>
{/* WATERMARK */}
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
  );
})}
    </div>
  </div>
)}
            {sections.slice(0, 1).map((section, sectionIndex) => {
              return (
                <div key={sectionIndex}>

                  {/* STARTER DECK IMAGE (ALL SECTIONS) */}
<div className="flex justify-center mb-2">
  <img
    src={starterDeckImages[sectionIndex]}
    alt={section.title}
    className="h-20 sm:h-28 object-contain"
  />
</div>


                  {/* SECTION TITLE */}
                  <h2 className="text-center text-xs sm:text-sm text-[#5c4022] mb-3 mt-4 tracking-wide">
                    {section.title}
                  </h2>

                  {/* GRID */}
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {BONUS_STRUCTURE.flatMap(({ prefix, count }) =>
  Array.from({ length: count }, (_, i) => {
    let actualIndex = i + 1;

    if (prefix === "SD01PER") {
      actualIndex = i + 7;
      if (actualIndex > 118) return null;
    }

    const num = String(actualIndex).padStart(2, "0");
    const key = `${prefix}${num}`;
    const stateKey = `BONUS-${key}`;
    const isFlipped = flipped[stateKey];

    return (
      <div
        key={key}
        className="aspect-[5/7] cursor-pointer perspective relative"
        onClick={() => toggleFlip(stateKey)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          <img
            src={`/friendships-begin/${key}.png`}
            className="absolute w-full h-full object-cover rounded-lg backface-hidden"
          />

          <img
  src={
    key.startsWith("SD01ER") || key.startsWith("SD01PER")
      ? "/tcg-card-backs/SCENECARDBACK.png"

      : key.startsWith("SD01PRR")
        ? `/tcg-card-backs/PRR${key.slice(-2)}BACK.png`

        : getCardBack()
  }
  className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
/>
          {/* WATERMARK */}
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
    );
  }).filter(Boolean)
)}
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default FriendshipBegins;
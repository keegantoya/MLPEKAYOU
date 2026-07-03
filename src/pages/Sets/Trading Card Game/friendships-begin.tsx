import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import friendshipsBeginBoxes from "/set-pictures/friendshipsbeginboxes.webp";

const FriendshipsBegin = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState("");

  const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("C");

  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
  const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
  const [activeDeck, setActiveDeck] = useState<number | null>(null);

const set = {
  folder: "friendships-begin",
  setId: "SD",

  rarities: {
    C: 9,
    U: 7,
    SR: 6,
    SPR: 10,
    GR: 6,
    CR: 6,
    ER: 6,
    PER: 12,
    PRR: 6,
  },
};

const starterDeckImages = [
  "/starter-decks-boxes/SDTWILIGHT.webp",
  "/starter-decks-boxes/SDFLUTTERSHY.webp",
  "/starter-decks-boxes/SDPINKIEPIE.webp",
  "/starter-decks-boxes/SDAPPLEJACK.webp",
  "/starter-decks-boxes/SDRAINBOWDASH.webp",
  "/starter-decks-boxes/SDRARITY.webp",
];

const starterDeckGroups = [
  { name: "Twilight Sparkle", code: "SD01A" },
  { name: "Fluttershy", code: "SD01B" },
  { name: "Pinkie Pie", code: "SD01C" },
  { name: "Applejack", code: "SD01D" },
  { name: "Rainbow Dash", code: "SD01E" },
  { name: "Rarity", code: "SD01F" },
];

const rarityNames: Record<string, string> = {
  C: "COMMON",
  U: "UNCOMMON",
  SR: "SILVER RARE",
  SPR: "SAPPHIRE RARE",
  GR: "GOLD RARE",
  CR: "COLORFUL RARE",
  ER: "EMERALD RARE",
  PER: "SHINING EMERALD RARE",
  PRR: "SHINING RUBY RARE",
};

const cards = Object.entries(set.rarities).flatMap(([rarity, count]) => {
  if (rarity === "PER") {
    return Array.from({ length: 12 }, (_, i) => ({
      rarity,
      key: `SD01PER${String(i + 7).padStart(2, "0")}`,
    }));
  }

  return Array.from({ length: count }, (_, i) => ({
    rarity,
    key: `SD01${rarity}${String(i + 1).padStart(2, "0")}`,
  }));
});

const isRarityComplete = (rarity: string) => {
  const total = set.rarities[rarity as keyof typeof set.rarities];

  const owned = cards.filter(
    (card) => card.rarity === rarity && flipped[`BONUS-${card.key}`]
  ).length;

  return owned === total;
};

const getRarityCode = (rarity: string) => {
  return rarity;
};

const getCardBack = (key: string) => {
  // Emerald Rares and Shining Emeralds use the scene back
  if (key.startsWith("SD01ER") || key.startsWith("SD01PER")) {
    return "/tcg-card-backs/SCENECARDBACK.webp";
  }

  // Shining Ruby Rares have unique backs
  if (key.startsWith("SD01PRR")) {
    return `/tcg-card-backs/PRR${key.slice(-2)}BACK.webp`;
  }

  // Everything else uses the standard TCG back
  return "/card-backs/tcgdefaultback.webp";
};

const getCardFront = (key: string) => {
  return `/friendships-begin/${key}.webp`;
};

const toggleFlip = (key: string) => {
  if (viewMode) {
    setZoomedCard(getCardFront(key));
    setZoomedCardBack(getCardBack(key));
    setZoomedCardFlipped(false);
    return;
  }

  setFlipped((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

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

useEffect(() => {
  const loadProgress = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) {
      setLoaded(true);
      return;
    }

    const { data: saved } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
      .eq("set_id", set.setId)
      .single();

    if (saved?.progress) {
      setFlipped(saved.progress);
      setLastSavedProgress(JSON.stringify(saved.progress));
    }

    setLoaded(true);
  };

  loadProgress();
}, []);

useEffect(() => {
  if (!loaded) return;

  const current = JSON.stringify(flipped);

  if (current === lastSavedProgress) return;

  const saveProgress = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    await supabase
      .from("collection_progress_raw")
      .upsert(
        {
          user_id: user.id,
          set_id: set.setId,
          progress: flipped,
        },
        {
          onConflict: "user_id,set_id",
        }
      );

    setLastSavedProgress(current);
  };

  saveProgress();
}, [flipped, loaded, lastSavedProgress]);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="mx-auto max-w-[1800px] px-6 py-8">

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">

          {/* LEFT SIDEBAR */}
          <aside
  className="sidebar-scroll xl:sticky xl:top-[84px] self-start max-h-[calc(100vh-100px)] overflow-y-auto pr-2"
>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

             {/* Set Header */}
<div className="p-6 border-b border-gray-200">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Trading Card Game
                </p>

                <button
  onClick={() => navigate("/collections")}
  className="mt-6 mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
>
  ← Back to Collections
</button>

                <h1 className="mt-2 text-4xl font-black uppercase leading-none">
                  Friendships Begin
                </h1>

                <p className="mt-2 text-lg text-gray-500">
  Character Decks + Bonus Packs
</p>

<p className="mt-4 text-xs leading-relaxed text-gray-400">
  Click on a card to flip it over. This means you own that card.
  Your ISO list will automatically update to reflect the cards you
  still need.
</p>

              </div>

              {/* Rarities */}
              <div className="p-6">

                <div className="flex justify-between mb-4 text-gray-500 text-sm font-semibold uppercase">
                  <span>9 Rarity Tiers</span>
                  <span>194 Cards</span>
                </div>

                <div className="grid grid-cols-2 gap-2">

  {Object.keys(set.rarities).map((rarity) => (
    <button
      key={rarity}
      onClick={() => {
  if (window.innerWidth < 768) {
    setSelectedRarity(rarity);

    requestAnimationFrame(() => {
      document
        .getElementById(`rarity-${rarity}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  } else {
    document
      .getElementById(`rarity-${rarity}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }
}}
      className={`rounded-lg border p-2 text-sm font-bold transition-all

      ${
  isRarityComplete(rarity)
    ? "text-[#4a3200] border-[#d4af37] bg-gradient-to-br from-[#fff7c2] via-[#f6d365] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.45)]"
    : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
    }`}
    >
      {rarity === "PER"
  ? "※ER"
  : rarity === "PSPR"
  ? "※SPR"
  : rarity === "PGR"
  ? "※GR"
  : rarity === "PCR"
  ? "※CR"
  : rarity === "PRR"
  ? "※RR"
  : rarity}
    </button>
  ))}

</div>

              </div>

              {/* View Mode */}
<div className="border-t border-gray-200 p-6">
  <button
    onClick={() => setViewMode(!viewMode)}
    className={`w-full rounded-lg py-3 text-sm font-bold transition-colors ${
      viewMode
        ? "bg-yellow-500 text-white hover:bg-yellow-600"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {viewMode ? "View Mode: ON" : "View Mode: OFF"}
  </button>

  <p className="mt-2 text-xs text-gray-500">
    {viewMode
      ? "Click a card to view the front and back without marking it as owned."
      : "Click cards to mark them as owned."}
  </p>
</div>

              {/* Product Info */}
              <div className="border-t border-gray-200 p-6">

                <h2 className="text-lg font-bold uppercase mb-5">
                  Product Information
                </h2>

                <div className="space-y-5">

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Product Name
                    </p>

                    <p className="font-semibold">
                      Friendships Begin
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Release Date
                    </p>

                    <p className="font-semibold">
                      March 2026
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Pull Rates
                    </p>

                    <p className="font-semibold">
                      —
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </aside>

          {/* RIGHT SIDE */}
          <main
  className="card-scroll space-y-20 overflow-y-auto pr-3
             xl:h-[calc(100vh-100px)]"
             
>
    {/* CHARACTER DECKS */}

<div className="mb-12">

  <h2 className="text-center text-2xl font-black uppercase tracking-wide mb-6">
    Character Starter Decks
  </h2>

  <div className="flex flex-wrap justify-center gap-5">

    {starterDeckGroups.map((deck, i) => (

      <button
        key={deck.code}
        onClick={() => setActiveDeck(activeDeck === i ? null : i)}
        className={`transition-all duration-200 rounded-2xl p-2

          ${
            activeDeck === i
              ? "bg-yellow-100 ring-2 ring-yellow-400 scale-105"
              : "hover:scale-105"
          }
        `}
      >

        <img
          src={starterDeckImages[i]}
          className="w-24 h-24 object-contain"
        />

        <p className="mt-2 text-xs font-semibold">
          {deck.name}
        </p>
        

      </button>

    ))}
    

  </div>
  

</div>

{/* OPEN DECK (UNDER THE ROW) */}
{activeDeck !== null && (
  <div className="mb-10 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-br from-white/80 to-[#f6f0ff]/70 backdrop-blur-sm shadow-lg p-4 sm:p-6">

    {/* TITLE */}
    <div className="text-center mb-5">

      <h2 className="text-lg sm:text-xl font-bold text-[#5a3e84]">
        {starterDeckGroups[activeDeck].name} Starter Deck
      </h2>

    </div>

    {/* COMPLETE BUTTON */}
    <div className="flex justify-center mb-6">
      <button
        onClick={() => {
          const updated = { ...flipped };
          const deck = starterDeckGroups[activeDeck];

          const cards = getDeckCards(deck.code);

          const isComplete = cards.every(
            (key) => flipped[`STARTER-${key}`]
          );

          const shouldComplete = !isComplete;

          cards.forEach((key) => {
            updated[`STARTER-${key}`] = shouldComplete;
          });

          setFlipped(updated);
        }}
        className="text-xs sm:text-sm px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/50 shadow-md hover:brightness-110 transition"
      >
        MARK FULL DECK COMPLETE
      </button>
    </div>

    {/* CARD GRID */}
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {getDeckCards(starterDeckGroups[activeDeck].code).map((key) => {
        const stateKey = `STARTER-${key}`;

        return (
          <div
            key={key}
            className="group aspect-[5/7] cursor-pointer perspective relative"
            onClick={() => toggleFlip(viewMode ? key : stateKey)}
          >
            <div
             className={`relative w-full h-full transform-style-preserve-3d transition-all duration-200
  md:hover:-translate-y-2
  md:hover:scale-[1.04]
  md:hover:rotate-1
  md:hover:shadow-2xl
  md:hover:z-20
  ${
    flipped[stateKey] && !viewMode ? "rotate-y-180" : ""
  }`}
            >

              {/* FRONT */}
              <img
                src={`/friendships-begin/${key}.webp`}
                className="absolute w-full h-full object-cover rounded-xl backface-hidden shadow-md"
              />

              {/* BACK */}
              <img
                src={
                  key.includes("C06") ||
                  key.includes("C07") ||
                  key.includes("C08") ||
                  key.includes("C09")
                    ? `/tcg-card-backs/${key}BACK.webp`
                    : key.startsWith("SD01RR")
                    ? `/tcg-card-backs/SDRR${key.slice(-2)}BACK.webp`
                    : key.includes("ER") && !key.includes("PER")
                    ? `/tcg-card-backs/SCENECARDBACK.webp`
                    : "/card-backs/tcgdefaultback.webp"
                }
                className="absolute w-full h-full object-cover rounded-xl rotate-y-180 backface-hidden shadow-md"
              />

            </div>
          </div>
        );
      })}
    </div>

  </div>
)}


            {/* Section */}
            {Object.entries(set.rarities)
  .filter(([rarity]) =>
    window.innerWidth >= 768 || rarity === selectedRarity
  )
  .map(([rarity, count], index) => (
  <section
  key={rarity}
  id={`rarity-${rarity}`}
>

    <div className="flex items-end justify-between mb-5">

      <div>

        <h2 className="text-5xl font-black leading-none">
{rarity === "PER"
  ? "※ER"
  : rarity === "PSPR"
  ? "※SPR"
  : rarity === "PGR"
  ? "※GR"
  : rarity === "PCR"
  ? "※CR"
  : rarity === "PRR"
  ? "※RR"
  : rarity}
  <span className="ml-3 text-3xl font-light text-gray-500">
    {rarityNames[rarity]}
  </span>
</h2>

<p className="uppercase tracking-widest text-gray-400 mt-2">
  {count} Cards
</p>

      </div>

      <div className="text-6xl font-black text-yellow-500">
        {String(index + 1).padStart(2, "0")}
      </div>

    </div>

    <div className="h-px bg-yellow-400 mb-8" />

    <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">

      {cards
        .filter(card => card.rarity === rarity)
        .map((card) => {
const key = card.key;
const stateKey = `BONUS-${key}`;
const owned = flipped[stateKey];

  return (
    <div
  key={key}
  className="group aspect-[5/7] cursor-pointer perspective relative"
  onClick={() => toggleFlip(viewMode ? key : stateKey)}
>
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-all duration-200
  md:hover:-translate-y-2
  md:hover:scale-[1.04]
  md:hover:rotate-1
  md:hover:shadow-2xl
  md:hover:z-20
  ${
    flipped[stateKey] && !viewMode ? "rotate-y-180" : ""
  }`}
      >
        {/* FRONT */}
        <img
          src={getCardFront(key)}
          className="absolute w-full h-full object-cover rounded-lg backface-hidden"
        />

        {/* BACK */}
        <img
          src={getCardBack(key)}
          className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
        />
      </div>
    </div>
  );
})}

    </div>

  </section>
))}

            {/* Duplicate sections here */}

          </main>

        </div>

      </div>

{zoomedCard && (
  <div
    className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setZoomedCard(null)}
  >
    <div
      style={{ perspective: "1200px" }}
      onClick={(e) => {
        e.stopPropagation();
        setZoomedCardFlipped(!zoomedCardFlipped);
      }}
    >
      <div
        className={`relative transition-transform duration-500 transform-style-preserve-3d ${
          zoomedCardFlipped ? "rotate-y-180" : ""
        }`}
      >
        <img
          src={zoomedCard}
          className="absolute inset-0 max-h-[65vh] max-w-[50vw] rounded-2xl shadow-2xl backface-hidden"
        />

        <img
          src={zoomedCardBack || ""}
          className="max-h-[65vh] max-w-[50vw] rounded-2xl shadow-2xl backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        />
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FriendshipsBegin;
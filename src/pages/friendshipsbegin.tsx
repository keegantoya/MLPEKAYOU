import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";


const FriendshipBegins = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [activeDeck, setActiveDeck] = useState<number | null>(null);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

const [viewMode, setViewMode] = useState(false);
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const [isClosingZoom, setIsClosingZoom] = useState(false);

const rarityButtonNames: Record<string, string> = {
  SD01C: "C",
  SD01U: "U",
  SD01SR: "SR",
  SD01SPR: "SPR",
  SD01GR: "GR",
  SD01CR: "CR",
  SD01ER: "ER",
  SD01PER: "※ER",
  SD01PRR: "※RR"
};

const rarityContainerNames: Record<string, string> = {
  SD01C: "COMMON CARDS",
  SD01U: "UNCOMMON CARDS",
  SD01SR: "SILVER RARE CARDS",
  SD01SPR: "SAPPHIRE RARE CARDS",
  SD01GR: "GOLD RARE CARDS",
  SD01CR: "COLORFUL RARE CARDS",
  SD01ER: "EMERALD RARE CARDS",
  SD01PER: "※EMERALD RARE",
  SD01PRR: "※RUBY RARE"
};

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
  if (viewMode) {
    const cleanKey = key.replace(/^STARTER-/, "").replace(/^BONUS-/, "");

    let backSrc = "/card-backs/tcgdefaultback.png";

    // Starter Deck custom backs (C06-C09)
    if (
      cleanKey.includes("C06") ||
      cleanKey.includes("C07") ||
      cleanKey.includes("C08") ||
      cleanKey.includes("C09")
    ) {
      backSrc = `/tcg-card-backs/${cleanKey}BACK.png`;
    }

    // RR cards
    else if (cleanKey.startsWith("SD01RR")) {
      backSrc = `/tcg-card-backs/SDRR${cleanKey.slice(-2)}BACK.png`;
    }

    // ER cards (scene card back)
    else if (cleanKey.includes("ER") && !cleanKey.includes("PER")) {
      backSrc = "/tcg-card-backs/SCENECARDBACK.png";
    }

    // PRR cards
    else if (cleanKey.startsWith("SD01PRR")) {
      backSrc = `/tcg-card-backs/PRR${cleanKey.slice(-2)}BACK.png`;
    }

    setZoomedCardFlipped(false);
    setZoomedCardBack(backSrc);
    setZoomedCard(`/friendships-begin/${cleanKey}.png`);
    return;
  }

  // Normal mode: toggle owned/unowned
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

  useEffect(() => {
  const html = document.documentElement;
  const body = document.body;

  if (zoomedCard) {
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
  } else {
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.touchAction = "";
  }

  return () => {
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.touchAction = "";
  };
}, [zoomedCard]);

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

const isZoomedLandscape =
  zoomedCard &&
  /SD01[A-F].*C0[6-9]/.test(zoomedCard);

  return (
    <div className="min-h-screen bg-white">
      <KayouHeader />

      <div className="container py-8">

       {/* HEADER */}
<div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-0 mb-8 mt-6 sm:mt-0">

  {/* Back Button */}
  <button
    onClick={() => window.history.back()}
    className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
  >
    <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
      ← Back
    </span>
  </button>

  {/* Center Content */}
  <div className="flex-1 text-center">

    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5a3e84] leading-tight">
      {set.name}
    </h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-5 mb-1">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        SD01
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <div className="text-sm md:text-base text-[#555] max-w-3xl mx-auto leading-relaxed px-4 space-y-3">

    </div>

  </div>

<button
  onClick={() => setViewMode(!viewMode)}
  className="self-center sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
>
  <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
    {viewMode ? "Exit View" : "View Set"}
  </span>
</button>
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
  className="h-20 sm:h-24 w-20 sm:w-24 object-contain object-center mx-auto rounded-xl"
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
            className="aspect-[5/7] cursor-pointer perspective relative hover:scale-[1.02] transition-transform"
            onClick={() => toggleFlip(stateKey)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                (!viewMode && flipped[stateKey]) ? "rotate-y-180" : ""
              }`}
            >

              {/* FRONT */}
              <img
                src={`/friendships-begin/${key}.png`}
                className="absolute w-full h-full object-cover rounded-xl backface-hidden shadow-md"
              />

              {/* BACK */}
              <img
                src={
                  key.includes("C06") ||
                  key.includes("C07") ||
                  key.includes("C08") ||
                  key.includes("C09")
                    ? `/tcg-card-backs/${key}BACK.png`
                    : key.startsWith("SD01RR")
                    ? `/tcg-card-backs/SDRR${key.slice(-2)}BACK.png`
                    : key.includes("ER") && !key.includes("PER")
                    ? `/tcg-card-backs/SCENECARDBACK.png`
                    : "/card-backs/tcgdefaultback.png"
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

{/* BONUS PACK DIVIDER */}
<div className="flex items-center justify-center gap-3 sm:gap-5 mt-10 mb-6">

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px] sm:max-w-[180px]" />

  <img
    src="/starter-decks-boxes/SDBONUSPACKS.png"
    alt="Bonus Packs"
    className="h-16 sm:h-20 object-contain drop-shadow-md"
  />

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px] sm:max-w-[180px]" />

</div>


{/* BONUS PACK RARITY BUTTONS */}
<div className="flex flex-wrap justify-center gap-2 mt-2 mb-10">
  {BONUS_STRUCTURE.map(({ prefix, count }) => {
    const complete = (() => {
      for (let i = 1; i <= count; i++) {
        let actualIndex = i;

        if (prefix === "SD01PER") {
          actualIndex = i + 6;
        }

        const key = `${prefix}${String(actualIndex).padStart(2, "0")}`;
        if (!flipped[`BONUS-${key}`]) return false;
      }
      return true;
    })();

    
    return (
      <button
        key={prefix}
        onClick={() => {
          const el = document.getElementById(`rarity-${prefix}`);
          if (!el) return;

          const yOffset = -80;
          const y =
            el.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }}
        className={`px-3 py-1 text-xs md:text-sm rounded-full border transition-all
          ${
            complete
              ? "bg-[#5a3e84] text-white border-[#5a3e84]"
              : "border-[#d4af37] text-[#5a3e84] hover:bg-[#f5e6ff]"
          }`}
      >
        {rarityButtonNames[prefix]}
      </button>
    );
  })}
</div>

{/* BONUS PACK RARITY SECTIONS */}
{BONUS_STRUCTURE.map(({ prefix, count }) => (
  <div key={prefix} id={`rarity-${prefix}`} className="mb-10">

    <div className="relative bg-white border border-gray-200 rounded-xl p-3 md:p-4 pt-8">

      {/* COLLAPSE BUTTON */}
      <button
        onClick={() =>
          setCollapsed((prev) => ({
            ...prev,
            [prefix]: !prev[prefix],
          }))
        }
        className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 shadow-sm"
      >
        {collapsed[prefix] ? "+" : "−"}
      </button>

      {/* TITLE */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs md:text-sm font-semibold text-gray-700">
        {rarityContainerNames[prefix]}
      </div>

      {!collapsed[prefix] && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Array.from({ length: count }, (_, i) => {
            let actualIndex = i + 1;

            if (prefix === "SD01PER") {
              actualIndex = i + 7;
              if (actualIndex > 118) return null;
            }

            const num = String(actualIndex).padStart(2, "0");
            const key = `${prefix}${num}`;
            const stateKey = `BONUS-${key}`;
             const isFlipped = !viewMode && flipped[stateKey];

            return (
              <div
                key={key}
                className="aspect-[5/7] cursor-pointer perspective relative"
                onClick={() => {
  if (viewMode) {
    setZoomedCardFlipped(false);

const backSrc =
  key.startsWith("SD01ER") || key.startsWith("SD01PER")
    ? "/tcg-card-backs/SCENECARDBACK.png"
    : key.startsWith("SD01PRR")
      ? `/tcg-card-backs/PRR${key.slice(-2)}BACK.png`
      : getCardBack();

setZoomedCardBack(backSrc);
setZoomedCard(`/friendships-begin/${key}.png`);
  } else {
    toggleFlip(stateKey);
  }
}}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
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
                      key.startsWith("SD01ER") || key.startsWith("SD01PER")
                        ? "/tcg-card-backs/SCENECARDBACK.png"
                        : key.startsWith("SD01PRR")
                          ? `/tcg-card-backs/PRR${key.slice(-2)}BACK.png`
                          : getCardBack()
                    }
                    className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
                  />
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      )}
    </div>
  </div>
))}

          </div>
        )}
<div
  className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
    zoomedCard
      ? "bg-black/70 backdrop-blur-sm opacity-100 pointer-events-auto"
      : "bg-black/0 opacity-0 pointer-events-none"
  }`}
  onClick={() => setZoomedCard(null)}
>
  {zoomedCard && (
    <div
  className={`relative transition-all duration-300 ${
    isClosingZoom
      ? "opacity-0 scale-90"
      : "opacity-100 scale-100 animate-[zoomIn_0.4s_cubic-bezier(0.22,1,0.36,1)]"
  }`}
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
    {/* FRONT */}
    <img
      src={zoomedCard}
      className={`absolute inset-0 ${
  isZoomedLandscape
    ? "rotate-90 max-h-[45vh] max-w-[95vw] sm:max-h-[75vh] sm:max-w-[90vw]"
    : "max-h-[60vh] max-w-[60vw] sm:max-h-[65vh] sm:max-w-[50vw]"
} rounded-2xl shadow-2xl backface-hidden`}
    />

    {/* BACK */}
    <img
  src={zoomedCardBack || "/card-backs/tcgdefaultback.png"}
  className={`${
    isZoomedLandscape
      ? "max-h-[45vh] max-w-[95vw] sm:max-h-[75vh] sm:max-w-[90vw]"
      : "max-h-[60vh] max-w-[60vw] sm:max-h-[65vh] sm:max-w-[50vw]"
  } rounded-2xl shadow-2xl backface-hidden`}
  style={{
  transform: isZoomedLandscape
    ? "rotateY(180deg) rotate(-90deg)"
    : "rotateY(180deg)",
}}
/>
  </div>
</div>
  )}
</div>
      </div>
    </div>
  );
};

export default FriendshipBegins;
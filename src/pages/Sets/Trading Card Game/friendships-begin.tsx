import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";

import friendshipsBeginBoxes from "/set-pictures/friendshipsbeginboxes.webp";

const FriendshipsBegin = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState("");

const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("C");
const [hoverEffects, setHoverEffects] = useState(true);

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

const getDisplayCardCode = (key: string) => {
  const prrMatch = key.match(/^SD01PRR(\d{2})$/);
  if (prrMatch) {
    return `※SD01-RR${prrMatch[1]}`;
  }

  const perMatch = key.match(/^SD01PER(\d{2})$/);
  if (perMatch) {
    const sourceNumber = Number(perMatch[1]);
    const displayNumber = Math.ceil(sourceNumber / 2);
    return `※SD01-ER${String(displayNumber).padStart(2, "0")}`;
  }

  return key;
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
    <div className="relative min-h-screen overflow-hidden bg-[#050707] pb-28 text-white sm:pb-0">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.34]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,212,74,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.032) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 opacity-[0.055] bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.08)_4px)]" />
      <div className="pointer-events-none fixed left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#FFD54A] to-transparent" />

      <div className="relative mx-auto max-w-[1800px] px-3 py-3 sm:px-6 sm:py-6">
        <header className="mb-4 border border-white/[0.08] bg-[#080b0b] shadow-[0_18px_55px_rgba(0,0,0,.5)]">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#050707] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-emerald-300/95">
                COLLECTION NETWORK // ONLINE
              </span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-zinc-400">
              TCG / FRIENDSHIPS BEGIN / NODE SD
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5">
            <button
              onClick={() => navigate("/collections")}
              className="group flex items-center gap-3 border border-[#FFD54A]/20 bg-[#0a0d0d] px-3 py-2 transition hover:border-[#FFD54A]/60 hover:bg-[#101414]"
            >
              <span className="flex h-8 w-8 items-center justify-center border border-[#FFD54A]/20 bg-[#060909] text-[#FFD54A]">
                ←
              </span>
              <span className="text-left">
                <span className="block font-mono text-[8px] uppercase tracking-[0.26em] text-zinc-300">
                  COLLECTIONS
                </span>
                <span className="mt-1 block font-['Oxanium'] text-[9px] font-black uppercase tracking-[0.12em] text-zinc-200">
                  Back to Collections
                </span>
              </span>
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">
                  SYSTEM
                </div>
                <div className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                  SYNC ACTIVE
                </div>
              </div>
              <span className="h-2 w-2 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div className="overflow-hidden border border-white/[0.09] bg-[#080b0b] shadow-[0_20px_55px_rgba(0,0,0,.5)]">
              <div className="border-b border-white/[0.07] bg-[#050707] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-300">
                    CONTROL DECK
                  </span>
                  <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-[#FFD54A]/60">
                    SD / 194
                  </span>
                </div>
              </div>

              <div className="relative border-b border-white/[0.07] p-4 sm:p-5">
                <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/30" />
                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.32em] text-zinc-300">
                  SERIES IDENTIFICATION
                </div>
                <h1 className="mt-3 font-['Oxanium'] text-3xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-4xl">
                  Friendships
                  <span className="block text-[#FFD54A]">Begin</span>
                </h1>
                <div className="mt-4 h-px bg-gradient-to-r from-[#FFD54A]/50 to-transparent" />
                <p className="mt-4 font-mono text-[7px] uppercase leading-5 tracking-[0.08em] text-zinc-500">
                  Character starter decks plus bonus pack assets. Click a card
                  to mark it as owned. Your ISO list updates automatically.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px border-b border-white/[0.07] bg-white/[0.06]">
                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">ASSETS</div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-[#FFD54A]">194</div>
                </div>
                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">TIERS</div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-white">09</div>
                </div>
                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">COLLECTED</div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-emerald-400">
                    {Object.values(flipped).filter(Boolean).length}
                  </div>
                </div>
                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">REMAINING</div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-zinc-300">
                    {Math.max(0, 194 - Object.values(flipped).filter(Boolean).length)}
                  </div>
                </div>
              </div>

              <div className="border-b border-white/[0.07] p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                    RARITY SELECTOR
                  </span>
                  <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-[#FFD54A]/50">
                    09 NODES
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {Object.keys(set.rarities).map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setSelectedRarity(rarity);
                          requestAnimationFrame(() => {
                            document.getElementById(`rarity-${rarity}`)?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          });
                        } else {
                          document.getElementById(`rarity-${rarity}`)?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }}
                      className={`border px-2 py-2 text-left font-mono text-[7px] font-bold uppercase tracking-[0.1em] transition ${
                        isRarityComplete(rarity)
                          ? "border-[#FFD54A]/60 bg-[#FFD54A]/10 text-[#FFD54A]"
                          : selectedRarity === rarity
                          ? "border-[#FFD54A]/35 bg-white/[0.05] text-white"
                          : "border-white/[0.07] bg-[#060909] text-zinc-500 hover:border-white/[0.16] hover:text-zinc-200"
                      }`}
                    >
                      <span className="mr-2 text-[#FFD54A]/60">
                        {String(Object.keys(set.rarities).indexOf(rarity) + 1).padStart(2, "0")}
                      </span>
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

              <div className="border-b border-white/[0.07] p-4 sm:p-5">
                <div className="mb-3 font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                  DISPLAY SYSTEMS
                </div>

                <button
                  onClick={() => setViewMode(!viewMode)}
                  className={`mb-2 w-full border px-3 py-3 text-left font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition ${
                    viewMode
                      ? "border-[#FFD54A]/60 bg-[#FFD54A]/10 text-[#FFD54A]"
                      : "border-white/[0.08] bg-[#070a0a] text-zinc-400 hover:border-white/[0.18]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>VIEW MODE</span>
                    <span>{viewMode ? "ONLINE" : "OFFLINE"}</span>
                  </span>
                </button>

                <button
                  onClick={() => setHoverEffects(!hoverEffects)}
                  className={`hidden w-full border px-3 py-3 text-left font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition md:block ${
                    hoverEffects
                      ? "border-emerald-400/35 bg-emerald-400/[0.05] text-emerald-400"
                      : "border-white/[0.08] bg-[#070a0a] text-zinc-500 hover:border-white/[0.18]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>HOVER EFFECTS</span>
                    <span>{hoverEffects ? "ONLINE" : "OFFLINE"}</span>
                  </span>
                </button>

                <p className="mt-3 font-mono text-[8px] uppercase leading-4 tracking-[0.06em] text-zinc-400">
                  {viewMode
                    ? "Click a card to inspect the front and back without changing ownership."
                    : "Click cards to mark them as owned."}
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="mb-4 font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                  PRODUCT DATA
                </div>

                <div className="space-y-3">
                  <div className="border-l border-[#FFD54A]/25 pl-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                      PRODUCT NAME
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase text-zinc-200">
                      Friendships Begin
                    </div>
                  </div>

                  <div className="border-l border-white/[0.08] pl-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                      RELEASE DATE
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase text-zinc-400">
                      March 2026
                    </div>
                  </div>

                  <div className="border-l border-white/[0.08] pl-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                      PULL RATES
                    </div>
                    <button
                      onClick={() => navigate("/faq")}
                      className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[#FFD54A] transition hover:text-white"
                    >
                      SEE FAQ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 flex items-center justify-between border border-white/[0.08] bg-[#080b0b] px-4 py-3">
              <div>
                <div className="font-mono text-[5px] font-bold uppercase tracking-[0.3em] text-zinc-700">
                  ASSET MATRIX
                </div>
                <div className="mt-1 font-['Oxanium'] text-sm font-black uppercase tracking-[0.08em] text-white">
                  Friendships Begin / Series One
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.8)]" />
                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-300/95">
                  LIVE
                </span>
              </div>
            </div>

            {/* CHARACTER DECKS */}
            <section className="mb-6 relative overflow-hidden border border-white/[0.08] bg-[#080b0b] p-3 shadow-[0_18px_45px_rgba(0,0,0,.42)] sm:p-4">
              <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l border-t border-[#FFD54A]/45" />
              <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-[#FFD54A]/20" />

              <div className="mb-4 flex items-end justify-between border-b border-white/[0.07] pb-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                      DECK ARRAY
                    </span>
                    <span className="h-px w-8 bg-[#FFD54A]/25" />
                    <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD54A]/85">
                      06 NODES
                    </span>
                  </div>
                  <h2 className="font-['Oxanium'] text-2xl font-black uppercase leading-none text-white sm:text-3xl">
                    Character
                    <span className="ml-2 text-zinc-500">Starter Decks</span>
                  </h2>
                </div>
                <div className="font-['Oxanium'] text-3xl font-black text-[#FFD54A]/25 sm:text-5xl">
                  SD
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {starterDeckGroups.map((deck, i) => (
                  <button
                    key={deck.code}
                    type="button"
                    onClick={() => setActiveDeck(activeDeck === i ? null : i)}
                    className={`group relative overflow-hidden rounded-md border bg-[#050707] p-2 text-center transition-all duration-200 ${
                      activeDeck === i
                        ? "border-[#FFD54A]/70 bg-[#FFD54A]/[0.06] shadow-[0_0_22px_rgba(255,212,74,.1)]"
                        : "border-white/[0.08] hover:-translate-y-1 hover:border-[#FFD54A]/40"
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md bg-[#080b0b]">
                      <img
                        src={starterDeckImages[i]}
                        className="h-full w-full object-contain rounded-md"
                        alt={deck.name}
                      />
                      <div className="pointer-events-none absolute inset-0 border border-white/[0.05]" />
                    </div>
                    <div className="mt-2 font-['Oxanium'] text-[8px] font-black uppercase leading-tight text-zinc-200">
                      {deck.name}
                    </div>
                    <div className="mt-1 font-mono text-[5px] uppercase tracking-[0.16em] text-[#FFD54A]/55">
                      {deck.code}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {activeDeck !== null && (
              <section className="mb-6 relative overflow-hidden border border-[#FFD54A]/20 bg-[#080b0b] p-3 shadow-[0_18px_45px_rgba(0,0,0,.42)] sm:p-4">
                <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <div>
                    <div className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                      ACTIVE DECK NODE
                    </div>
                    <h2 className="mt-1 font-['Oxanium'] text-xl font-black uppercase text-[#FFD54A]">
                      {starterDeckGroups[activeDeck].name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...flipped };
                      const deck = starterDeckGroups[activeDeck];
                      const deckCards = getDeckCards(deck.code);
                      const isComplete = deckCards.every(
                        (key) => flipped[`STARTER-${key}`]
                      );
                      const shouldComplete = !isComplete;

                      deckCards.forEach((key) => {
                        updated[`STARTER-${key}`] = shouldComplete;
                      });

                      setFlipped(updated);
                    }}
                    className="border border-[#FFD54A]/30 bg-[#FFD54A]/[0.08] px-3 py-2 font-mono text-[6px] font-bold uppercase tracking-[0.14em] text-[#FFD54A] transition hover:border-[#FFD54A]/60 hover:bg-[#FFD54A]/[0.14]"
                  >
                    MARK FULL DECK COMPLETE
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {getDeckCards(starterDeckGroups[activeDeck].code).map((key) => {
                    const stateKey = `STARTER-${key}`;

                    return (
                      <div
                        key={key}
                        className="group relative aspect-[5/7] cursor-pointer overflow-hidden rounded-md border border-white/[0.08] bg-[#050707] transition-all duration-200 hover:border-[#FFD54A]/40"
                        onClick={() => toggleFlip(viewMode ? key : stateKey)}
                      >
                        <div
                          className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-300 ${
                            hoverEffects
                              ? "md:group-hover:-translate-y-1 md:group-hover:rotate-1 md:group-hover:shadow-2xl"
                              : ""
                          } ${flipped[stateKey] && !viewMode ? "rotate-y-180" : ""}`}
                        >
                          <img
                            src={`/friendships-begin/${key}.webp`}
                            className="absolute inset-0 h-full w-full rounded-md object-cover backface-hidden"
                            alt=""
                          />
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
                            className="absolute inset-0 h-full w-full rounded-md object-cover rotate-y-180 backface-hidden"
                            alt=""
                          />
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-7">
                          <span className="font-mono text-[5px] font-bold uppercase tracking-[0.12em] text-white/70">
                            {getDisplayCardCode(key)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="space-y-6">
              {Object.entries(set.rarities)
                .filter(([rarity]) => window.innerWidth >= 768 || rarity === selectedRarity)
                .map(([rarity, count], index) => (
                  <section
                    key={rarity}
                    id={`rarity-${rarity}`}
                    className="relative overflow-hidden border border-white/[0.08] bg-[#080b0b] p-3 shadow-[0_18px_45px_rgba(0,0,0,.42)] sm:p-4"
                  >
                    <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l border-t border-[#FFD54A]/45" />
                    <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-[#FFD54A]/20" />

                    <div className="mb-4 flex items-end justify-between border-b border-white/[0.07] pb-3">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                            NODE {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="h-px w-8 bg-[#FFD54A]/25" />
                          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD54A]/85">
                            ACTIVE
                          </span>
                        </div>

                        <h2 className="font-['Oxanium'] text-2xl font-black uppercase leading-none text-white sm:text-3xl">
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
                          <span className="ml-2 text-sm font-normal tracking-normal text-zinc-500 sm:text-base">
                            {rarityNames[rarity]}
                          </span>
                        </h2>

                        <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                          {count} ASSETS / {isRarityComplete(rarity) ? "COMPLETE" : "IN PROGRESS"}
                        </p>
                      </div>

                      <div className="font-['Oxanium'] text-3xl font-black text-[#FFD54A]/25 sm:text-5xl">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {cards
                        .filter((card) => card.rarity === rarity)
                        .map((card) => {
                          const key = card.key;
                          const stateKey = `BONUS-${key}`;
                          const owned = flipped[stateKey];

                          return (
                            <div
                              key={key}
                              className="group relative aspect-[5/7] cursor-pointer overflow-hidden rounded-md border border-white/[0.08] bg-[#050707] shadow-[0_10px_25px_rgba(0,0,0,.42)] transition-all duration-200 md:hover:z-20 md:hover:-translate-y-2 md:hover:border-[#FFD54A]/45 md:hover:shadow-[0_18px_38px_rgba(0,0,0,.58)]"
                              onClick={() => toggleFlip(viewMode ? key : stateKey)}
                            >
                              <div
                                className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-300 ${
                                  hoverEffects
                                    ? "md:group-hover:rotate-1"
                                    : ""
                                } ${flipped[stateKey] && !viewMode ? "rotate-y-180" : ""}`}
                              >
                                <img
                                  src={getCardFront(key)}
                                  className="absolute inset-0 h-full w-full rounded-md object-cover backface-hidden"
                                  alt=""
                                />
                                <img
                                  src={getCardBack(key)}
                                  className="absolute inset-0 h-full w-full rounded-md object-cover rotate-y-180 backface-hidden"
                                  alt=""
                                />
                              </div>

                              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-7">
                                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-white/90">
                                  {getDisplayCardCode(key)}
                                </div>
                                {owned && !viewMode && (
                                  <div className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                                    OWNED
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2">
                      <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
                        FRIENDSHIPS BEGIN / RARITY NODE
                      </span>
                      <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-zinc-700">
                        {count} CARD SLOTS
                      </span>
                    </div>
                  </section>
                ))}
            </div>
          </main>
        </div>
      </div>

      {zoomedCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
          onClick={() => setZoomedCard(null)}
        >
          <div
            className="relative flex max-h-[84vh] w-[min(72vw,320px)] flex-col sm:w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-2 flex h-10 shrink-0 items-center justify-between overflow-hidden border border-[#FFD54A]/25 bg-[#070a0a] px-3 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#FFD54A] shadow-[0_0_8px_rgba(255,212,74,.9)]" />
                <div>
                  <div className="font-mono text-[8px] font-black uppercase tracking-[0.25em] text-[#FFD54A]">
                    CARD INSPECTION
                  </div>
                  <div className="font-mono text-[5px] uppercase tracking-[0.18em] text-zinc-700">
                    FRONT / BACK SYSTEM
                  </div>
                </div>
              </div>

              <button
                onClick={() => setZoomedCard(null)}
                className="border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition hover:border-[#FFD54A]/35 hover:text-[#FFD54A]"
              >
                CLOSE
              </button>
            </div>

            <TiltCard>
              <div
                className="relative mx-auto w-full overflow-hidden rounded-md border border-[#FFD54A]/30 bg-[#050707] shadow-[0_22px_60px_rgba(0,0,0,.85)]"
                onClick={() => setZoomedCardFlipped(!zoomedCardFlipped)}
              >
                <div className="relative aspect-[5/7] w-full max-h-[66vh] overflow-hidden rounded-md">
                  <div
                    className={`absolute inset-0 transform-style-preserve-3d transition-transform duration-500 ${
                      zoomedCardFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    <img
                      src={zoomedCard}
                      className="absolute inset-0 h-full w-full rounded-md object-cover backface-hidden"
                      alt=""
                    />
                    <img
                      src={zoomedCardBack || ""}
                      className="absolute inset-0 h-full w-full rounded-md object-cover backface-hidden"
                      style={{ transform: "rotateY(180deg)" }}
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </TiltCard>

            <div className="mt-2 flex shrink-0 items-center justify-between border border-white/[0.06] bg-[#070a0a] px-3 py-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                {zoomedCardFlipped ? "REAR ASSET" : "FRONT ASSET"}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#FFD54A]/80">
                TAP CARD TO FLIP
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendshipsBegin;
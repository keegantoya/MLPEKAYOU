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
const deckMatch = key.match(/^(SD01[A-F])(C|U|SR|SPR)(\d{2})$/);
  if (deckMatch) {
const [, deck, rarity, number] = deckMatch;
    return `${deck}-${rarity}${number}`;
  }
const specialMatch = key.match(/^SD01(ER|RR)(\d{2})$/);
  if (specialMatch) {
const [, rarity, number] = specialMatch;
const deckLetter = String.fromCharCode(64 + Number(number));
    return `${"SD01" + deckLetter}-${rarity}${number}`;
  }
const match = key.match(/^SD01(C|U|SR|SPR|GR|CR|ER|RR|PER|PRR)(\d{2})$/);
  if (!match) return key;
const [, rarity, number] = match;
  if (rarity === "PRR") {
    return `※SD01-RR${number}`;
  }
  if (rarity === "PER") {
const sourceNumber = Number(number);
const displayNumber = Math.ceil(sourceNumber / 2);
    return `※SD01-ER${String(displayNumber).padStart(2, "0")}`;
  }
  return `SD01-${rarity}${number}`;
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
const collectedCount = Object.values(flipped).filter(Boolean).length;
const displayRarity = (rarity: string) =>
    rarity === "PER" ? "※ER" : rarity === "PRR" ? "※RR" : rarity;
  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24 text-zinc-900 transition-colors dark:bg-[#101112] dark:text-white sm:pb-8">
      <style>{`
        @keyframes deckOpen {
          0% { opacity: 0; transform: translateY(-10px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="mx-auto max-w-[1800px] px-3 py-3 sm:px-6 sm:py-6">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
          <button type="button" onClick={() => navigate("/collections")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-700 transition hover:bg-zinc-200 active:scale-95 dark:bg-white/[0.08] dark:text-zinc-200 dark:hover:bg-white/[0.12]" aria-label="Back to collections">‹</button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">Friendships Begin</h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Starter decks and bonus cards.</p>
          </div>
          <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600 dark:bg-white/[0.07] dark:text-zinc-300">{collectedCount}</div>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-[64px] xl:self-start">
            <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
              <div className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Rarity</div>
              <div className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:grid-cols-2 xl:overflow-visible">
                {Object.keys(set.rarities).map((rarity) => (
                  <button key={rarity} type="button" onClick={() => { setSelectedRarity(rarity); requestAnimationFrame(() => document.getElementById(`rarity-${rarity}`)?.scrollIntoView({ behavior: "smooth", block: "start" })); }} className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${selectedRarity === rarity ? "bg-[#FFD54A] text-zinc-900" : isRarityComplete(rarity) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/[0.07] dark:text-zinc-300 dark:hover:bg-white/[0.11]"}`}>{displayRarity(rarity)}</button>
                ))}
              </div>
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <button type="button" onClick={() => setViewMode(!viewMode)} className="flex w-full items-center justify-between rounded-2xl bg-zinc-100 px-3.5 py-3 text-left transition hover:bg-zinc-200 dark:bg-white/[0.07] dark:hover:bg-white/[0.11]">
                <span>
                  <span className="block text-sm font-semibold">Inspect cards</span>
                  <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">Open a larger front/back view</span>
                </span>
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${viewMode ? "bg-[#FFD54A]" : "bg-zinc-300 dark:bg-zinc-600"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${viewMode ? "left-[22px]" : "left-0.5"}`} /></span>
              </button>
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]"><div className="text-lg font-semibold">{collectedCount}</div><div className="text-xs text-zinc-500 dark:text-zinc-400">Collected</div></div>
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]"><div className="text-lg font-semibold">{Math.max(0, 194 - collectedCount)}</div><div className="text-xs text-zinc-500 dark:text-zinc-400">Remaining</div></div>
              </div>
            </div>
          </aside>
          <main className="min-w-0 space-y-4">
            <section className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold sm:text-lg">Character Starter Decks</h2>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Choose a deck to view its cards.</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:bg-white/[0.07] dark:text-zinc-300">6 decks</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {starterDeckGroups.map((deck, i) => (
                  <button key={deck.code} type="button" onClick={() => setActiveDeck(activeDeck === i ? null : i)} className={`overflow-hidden rounded-2xl border p-2 text-center transition duration-200 active:scale-[0.97] ${activeDeck === i ? "border-[#FFD54A] bg-[#FFD54A]/10 shadow-sm ring-2 ring-[#FFD54A]/20" : "border-black/10 bg-zinc-50 hover:-translate-y-0.5 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"}`}>
                    <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/[0.04]"><img src={starterDeckImages[i]} className="h-full w-full rounded-xl object-contain" alt={deck.name} /></div>
                    <div className="mt-2 text-[11px] font-semibold leading-tight">{deck.name}</div>
                  </button>
                ))}
              </div>
            </section>
            {activeDeck !== null && (
              <section
                key={`active-deck-${activeDeck}`}
                className="animate-[deckOpen_280ms_cubic-bezier(0.22,1,0.36,1)] rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4"
                style={{ transformOrigin: "top center" }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold sm:text-lg">{starterDeckGroups[activeDeck].name}</h2>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{starterDeckGroups[activeDeck].code}</p>
                  </div>
                  <button type="button" onClick={() => { const updated = { ...flipped }; const deckCards = getDeckCards(starterDeckGroups[activeDeck].code); const isComplete = deckCards.every((key) => flipped[`STARTER-${key}`]); deckCards.forEach((key) => { updated[`STARTER-${key}`] = !isComplete; }); setFlipped(updated); }} className="rounded-full bg-[#FFD54A] px-3 py-2 text-xs font-semibold text-zinc-900 transition hover:brightness-95">Toggle full deck</button>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3 lg:grid-cols-6">
                  {getDeckCards(starterDeckGroups[activeDeck].code).map((key) => {
const stateKey = `STARTER-${key}`;
const owned = flipped[stateKey];
const back = key.includes("C06") || key.includes("C07") || key.includes("C08") || key.includes("C09") ? `/tcg-card-backs/${key}BACK.webp` : key.startsWith("SD01RR") ? `/tcg-card-backs/SDRR${key.slice(-2)}BACK.webp` : key.includes("ER") && !key.includes("PER") ? "/tcg-card-backs/SCENECARDBACK.webp" : "/card-backs/tcgdefaultback.webp";
                    return (
                      <div key={key} className="group relative aspect-[5/7] cursor-pointer rounded-xl transition-transform duration-200 ease-out md:hover:z-20 md:hover:scale-[1.035]" onClick={() => toggleFlip(viewMode ? key : stateKey)}>
                        <div className="relative h-full w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-100 shadow-sm transition-shadow duration-200 group-hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
                          <div className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${owned && !viewMode ? "rotate-y-180" : ""}`}>
                            <img src={`/friendships-begin/${key}.webp`} className="absolute inset-0 h-full w-full rounded-xl object-cover backface-hidden" alt=""
                              loading="lazy"
                              decoding="async"
                            />
                            {!viewMode && owned && (
                              <img src={back} className="absolute inset-0 h-full w-full rounded-xl object-cover backface-hidden" style={{ transform: "rotateY(180deg) scale(1.035)" }} alt=""
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                          </div>
                          {owned && !viewMode && <div className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">✓</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            <div className="space-y-4">
              {Object.entries(set.rarities).filter(([rarity]) => window.innerWidth >= 768 || rarity === selectedRarity).map(([rarity, count]) => (
                <section key={rarity} id={`rarity-${rarity}`} className="scroll-mt-4 rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold sm:text-lg">{displayRarity(rarity)}<span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">{rarityNames[rarity]}</span></h2>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{count} cards</p>
                    </div>
                    {isRarityComplete(rarity) && <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">Complete</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3 lg:grid-cols-6">
                    {cards.filter((card) => card.rarity === rarity).map((card) => {
const key = card.key;
const stateKey = `BONUS-${key}`;
const owned = flipped[stateKey];
                      return (
                        <div key={key} className="group relative aspect-[5/7] cursor-pointer rounded-xl transition-transform duration-200 ease-out md:hover:z-20 md:hover:scale-[1.035]" onClick={() => toggleFlip(viewMode ? key : stateKey)}>
                          <div className="relative h-full w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-100 shadow-sm transition-shadow duration-200 group-hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
                            <div className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${owned && !viewMode ? "rotate-y-180" : ""}`}>
                              <img src={getCardFront(key)} className="absolute inset-0 h-full w-full rounded-xl object-cover backface-hidden" alt=""
                                loading="lazy"
                                decoding="async"
                              />
                              {!viewMode && owned && (
                                <img src={getCardBack(key)} className="absolute inset-0 h-full w-full rounded-xl object-cover backface-hidden" style={{ transform: "rotateY(180deg) scale(1.035)" }} alt=""
                                  loading="lazy"
                                  decoding="async"
                                />
                              )}
                            </div>
                            {owned && !viewMode && <div className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">✓</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
      {zoomedCard && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setZoomedCard(null)}>
          <div className="w-[min(78vw,340px)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:bg-[#1c1c1e]/95">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Card preview</span>
              <button type="button" onClick={() => setZoomedCard(null)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5f57] text-sm font-bold text-[#6e120d] transition hover:brightness-95" aria-label="Close card preview">×</button>
            </div>
            <TiltCard>
              <div className="relative aspect-[5/7] w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl" onClick={() => setZoomedCardFlipped(!zoomedCardFlipped)}>
                <div className={`absolute inset-0 transform-style-preserve-3d transition-transform duration-500 ${zoomedCardFlipped ? "rotate-y-180" : ""}`}>
                  <img src={zoomedCard} className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center backface-hidden" alt=""
                                  />
                  <img src={zoomedCardBack || ""} className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center backface-hidden" style={{ transform: "rotateY(180deg) scale(1.035)" }} alt=""
                                  />
                </div>
              </div>
            </TiltCard>
            <div className="mt-3 text-center text-sm font-medium text-white/80">Tap card to flip</div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FriendshipsBegin;

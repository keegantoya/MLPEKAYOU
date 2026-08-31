import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";
const StarOne = () => {
const navigate = useNavigate();
const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);
const [lastSavedProgress, setLastSavedProgress] = useState("");
const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("SSR");
const [hoverEffects] = useState(true);
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const set = {
  folder: "star-one",
  prefix: "S1",
  setId: "4",
  rarities: {
    SSR: 20,
    SCR: 18,
    UR: 18,
    USR: 15,
    AR: 9,
    OR: 7,
    BP: 9,
    SAR: 9,
  },
};
const rarityNames: Record<string, string> = {
  SAR: "SHINING ART RARE CARDS",
  OR: "ORIGIN RARE CARDS",
  BP: "BRILLIANT PRINT CARDS",
  AR: "ART RARE CARDS",
  USR: "ULTRA SPECIAL RARE CARDS",
  UR: "ULTRA RARE CARDS",
  SCR: "SKETCH RARE CARDS",
  SSR: "SUPER SPARK RARE CARDS",
};
const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
  Array.from({ length: count }, (_, i) => ({
    rarity,
    number: i + 1,
  }))
);
const isRarityComplete = (rarity: string) => {
const total = set.rarities[rarity as keyof typeof set.rarities];
const owned = cards.filter(card =>
    card.rarity === rarity &&
    flipped[`${card.rarity}-${card.number}`]
  ).length;
  return owned === total;
};
const getRarityCode = (rarity: string) => {
  return rarity;
};
const getCardBack = (rarity: string, number?: number) => {
  if (rarity === "SAR") {
    return "/card-backs/star-one/S1SARBACK.webp";
  }
  if (rarity === "OR") {
    return "/card-backs/star-one/S1ORBACK.webp";
  }
  if (rarity === "BP" && number) {
    return `/card-backs/star-one/S1BPBACK${String(number).padStart(3, "0")}.webp`;
  }
  if (rarity === "AR") {
    return "/card-backs/star-one/S1ARBACK.webp";
  }
  if (rarity === "USR") {
const specialBack2 = [1, 3, 6, 13, 14];
    if (number && specialBack2.includes(number)) {
      return "/card-backs/star-one/S1USRBACK2.webp";
    }
    return "/card-backs/star-one/S1USRBACK1.webp";
  }
  if (rarity === "UR") {
    return "/card-backs/star-one/S1URBACK.webp";
  }
  if (rarity === "SCR") {
    return "/card-backs/star-one/S1SCRBACK.webp";
  }
  if (rarity === "SSR") {
    return "/card-backs/star-one/S1SSRBACK.webp";
  }
  return "/card-backs/star-one/S1SSRBACK.webp";
};
const toggleFlip = (key: string) => {
  if (viewMode) {
const [rarity, numberStr] = key.split("-");
const number = Number(numberStr);
    setZoomedCard(
      `/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(
        3,
        "0"
      )}.webp`
    );
    setZoomedCardBack(getCardBack(rarity, number));
    setZoomedCardFlipped(false);
    return;
  }
  setFlipped((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
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
const collectedCount = cards.filter(
    (card) => flipped[`${card.rarity}-${card.number}`]
  ).length;
  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24 text-zinc-900 transition-colors dark:bg-[#000000] dark:text-white sm:pb-8">
      <div className="mx-auto max-w-[1800px] px-3 py-3 sm:px-5 sm:py-5">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[24px] border border-black/[0.08] bg-white/90 p-3 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#1c1c1e]/90 sm:p-4">
          <button
            type="button"
            onClick={() => navigate("/collections")}
            className="flex min-w-0 items-center gap-3 rounded-full pr-3 text-left transition active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff5f57] text-sm font-bold text-[#5c1714] shadow-sm">
              ×
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-zinc-900 dark:text-white">
                Star One
              </span>
              <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                Back to Collections
              </span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-white/[0.07] dark:text-zinc-300 sm:inline-flex">
              {collectedCount} / {cards.length}
            </span>
            <span className="rounded-full bg-[#FFD54A] px-3 py-1.5 text-xs font-semibold text-zinc-900">
              {Math.round((collectedCount / cards.length) * 100)}%
            </span>
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-3 xl:self-start">
            <div className="rounded-[24px] border border-black/[0.08] bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:p-4">
              <div className="mb-4">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Star One
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Tap cards to mark them owned.
                </p>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-white/[0.06]">
                  <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Collected
                  </div>
                  <div className="mt-1 text-xl font-semibold">{collectedCount}</div>
                </div>
                <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-white/[0.06]">
                  <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Remaining
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {cards.length - collectedCount}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Rarity
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:grid-cols-2 xl:overflow-visible">
                  {Object.keys(set.rarities).map((rarity) => (
                    <button
                      key={rarity}
                      type="button"
                      onClick={() => {
                        setSelectedRarity(rarity);
                        requestAnimationFrame(() =>
                          document
                            .getElementById(`rarity-${rarity}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                        );
                      }}
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                        isRarityComplete(rarity)
                          ? "bg-[#FFD54A] text-zinc-900"
                          : selectedRarity === rarity
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
                      }`}
                    >
                      {rarity === "SAR" ? "◇AR" : rarity}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewMode(!viewMode)}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.99] ${
                  viewMode
                    ? "bg-[#FFD54A] text-zinc-900"
                    : "bg-zinc-100 text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-200"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">Inspect cards</span>
                  <span className={`mt-0.5 block text-xs ${viewMode ? "text-zinc-700" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {viewMode
                      ? "Cards stay front-facing"
                      : "View front and back"}
                  </span>
                </span>
                <span className={`relative h-7 w-12 rounded-full transition ${
                  viewMode ? "bg-white/70" : "bg-zinc-300 dark:bg-zinc-700"
                }`}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    viewMode ? "left-6" : "left-1"
                  }`} />
                </span>
              </button>
            </div>
          </aside>
          <main className="min-w-0">
            <div className="space-y-4">
              {Object.entries(set.rarities)
                .filter(
                  ([rarity]) =>
                    typeof window === "undefined" ||
                    window.innerWidth >= 768 ||
                    rarity === selectedRarity
                )
                .map(([rarity, count]) => {
const rarityCards = cards.filter(
                    (card) => card.rarity === rarity
                  );
const rarityOwned = rarityCards.filter(
                    (card) => flipped[`${card.rarity}-${card.number}`]
                  ).length;
                  return (
                    <section
                      key={rarity}
                      id={`rarity-${rarity}`}
                      className="scroll-mt-3 rounded-[24px] border border-black/[0.08] bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <h2 className="text-lg font-semibold">
                              {rarity === "SAR" ? "◇AR" : rarity}
                            </h2>
                            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {rarityNames[rarity]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {rarityOwned} of {count} collected
                          </p>
                        </div>
                        {isRarityComplete(rarity) && (
                          <span className="shrink-0 rounded-full bg-[#FFD54A] px-2.5 py-1 text-[11px] font-semibold text-zinc-900">
                            Complete
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7">
                        {rarityCards.map((card) => {
const key = `${card.rarity}-${card.number}`;
const owned = flipped[key];
                          return (
                            <button
                              type="button"
                              key={key}
                              onClick={() => toggleFlip(key)}
                              className="group relative aspect-[5/7] w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-100 shadow-sm outline-none transition duration-200 hover:z-10 hover:scale-[1.025] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#FFD54A] dark:bg-white/[0.04]"
                              aria-label={`${rarity} ${card.number}${owned ? ", owned" : ""}`}
                            >
                              <div
                                className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${
                                  owned && !viewMode ? "rotate-y-180" : ""
                                }`}
                              >
                                <img
                                  src={`/cards/${set.folder}/${set.prefix}${card.rarity}${String(
                                    card.number
                                  ).padStart(3, "0")}.webp`}
                                  className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                  style={{ transform: "scale(1.035)" }}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  draggable={false}
                                />
                                {!viewMode && owned && (
                                  <img
                                    src={getCardBack(card.rarity, card.number)}
                                    className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                    style={{
                                      transform: "rotateY(180deg) scale(1.05)",
                                    }}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    draggable={false}
                                  />
                                )}
                              </div>
                              {owned && !viewMode && (
                                <span className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD54A] text-xs font-bold text-zinc-900 shadow-sm">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
            </div>
          </main>
        </div>
      </div>
      {zoomedCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-6"
          onClick={() => setZoomedCard(null)}
        >
          <div
            className="w-[min(82vw,340px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between rounded-[20px] bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:bg-[#1c1c1e]/95">
              <button
                type="button"
                onClick={() => setZoomedCard(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5f57] text-sm font-bold text-[#5c1714]"
                aria-label="Close"
              >
                ×
              </button>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {zoomedCardFlipped ? "Card back" : "Card front"}
              </span>
              <span className="h-8 w-8" />
            </div>
            <TiltCard>
              <button
                type="button"
                onClick={() => setZoomedCardFlipped(!zoomedCardFlipped)}
                className="relative block aspect-[5/7] w-full overflow-hidden rounded-[20px] bg-black shadow-2xl"
              >
                <div
                  className={`absolute inset-0 transform-style-preserve-3d transition-transform duration-500 ${
                    zoomedCardFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  <img
                    src={zoomedCard}
                    className="absolute inset-0 h-full w-full rounded-[20px] object-cover object-center backface-hidden"
                    style={{ transform: "scale(1.035)" }}
                    alt=""
                    draggable={false}

                                  />
                  <img
                    src={zoomedCardBack || ""}
                    className="absolute inset-0 h-full w-full rounded-[20px] object-cover object-center backface-hidden"
                    style={{ transform: "rotateY(180deg) scale(1.05)" }}
                    alt=""
                    draggable={false}

                                  />
                </div>
              </button>
            </TiltCard>
            <div className="mt-2 rounded-full bg-white/90 px-4 py-2 text-center text-xs font-medium text-zinc-600 shadow-lg backdrop-blur-xl dark:bg-[#1c1c1e]/90 dark:text-zinc-300">
              Tap card to flip
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StarOne;

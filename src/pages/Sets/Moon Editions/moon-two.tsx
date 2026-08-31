import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";
const MoonTwo = () => {
const navigate = useNavigate();
const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);
const [lastSavedProgress, setLastSavedProgress] = useState("");
const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("R");
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const set = {
  folder: "second-edition-moon",
  prefix: "M2",
  setId: "2",
  rarities: {
    R: 30,
    SR: 20,
    SSR: 54,
    HR: 30,
    UR: 16,
    LSR: 16,
    SGR: 8,
    ZR: 7,
    SC: 7,
    "SHINING ZR": 1,
  },
};
const rarityNames: Record<string, string> = {
  R: "RARE",
  SR: "SUPER RARE",
  SSR: "SUPER SPARK RARE",
  HR: "HOLOGRAPHIC RARE",
  UR: "ULTRA RARE",
  LSR: "LIMITED SUPERRARE",
  SGR: "SUPER GOLDEN RARE",
  ZR: "ZENITH RARE",
  SC: "SECRET CARD",
  "SHINING ZR":  "CELEBRATION ZENITH RARE",
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
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};
const getDisplayRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR" || rarity === "SZR") return "◇ZR";
  return rarity;
};
const getCardBack = (rarity: string, number: number) => {
const padded = String(number).padStart(3, "0");
  if (rarity === "R") {
    return `/moon-2-other-backs/M2RB${padded}.webp`;
  }
  if (rarity === "SR") {
    return `/moon-2-other-backs/M2SRB${padded}.webp`;
  }
  if (rarity === "HR") {
    if (number <= 22) {
      return `/card-backs/M1SCBACK.webp`;
    }
    return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
  }
  if (rarity === "SSR") {
    return `/card-backs/M2SSRBACK.webp`;
  }
  if (rarity === "UR") {
    return `/card-backs/M1URBACK.webp`;
  }
  if (rarity === "SGR") {
    return `/card-backs/M2SGRBACK.webp`;
  }
  if (rarity === "ZR") {
    return `/card-backs/M2ZRBACK.webp`;
  }
  if (rarity === "SC") {
    if (number === 7) {
      return `/card-backs/M2SC007BACK.webp`;
    }
    return `/card-backs/M2SCBACK.webp`;
  }
  if (rarity === "SHINING ZR") {
    return `/card-backs/M2SZRBACK.webp`;
  }
  if (rarity === "LSR") {
    return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
  }
  return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
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
  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24 text-zinc-900 transition-colors dark:bg-[#101112] dark:text-white sm:pb-8">
      <div className="mx-auto max-w-[1800px] px-3 py-3 sm:px-6 sm:py-6">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
          <button
            type="button"
            onClick={() => navigate("/collections")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-700 transition hover:bg-zinc-200 active:scale-95 dark:bg-white/[0.08] dark:text-zinc-200 dark:hover:bg-white/[0.12]"
            aria-label="Back to collections"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              Moon — Second Edition
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Tap a card to mark it owned.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600 dark:bg-white/[0.07] dark:text-zinc-300">
            {cards.filter((card) => flipped[`${card.rarity}-${card.number}`]).length}/189
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-[64px] xl:self-start">
            <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
              <div>
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
                        requestAnimationFrame(() => {
                          document.getElementById(`rarity-${rarity}`)?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        });
                      }}
                      className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${
                        selectedRarity === rarity
                          ? "bg-[#FFD54A] text-zinc-900"
                          : isRarityComplete(rarity)
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/[0.07] dark:text-zinc-300 dark:hover:bg-white/[0.11]"
                      }`}
                    >
                      {getDisplayRarityCode(rarity)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setViewMode(!viewMode)}
                  className="flex w-full items-center justify-between rounded-2xl bg-zinc-100 px-3.5 py-3 text-left transition hover:bg-zinc-200 dark:bg-white/[0.07] dark:hover:bg-white/[0.11]"
                >
                  <span>
                    <span className="block text-sm font-semibold">Inspect cards</span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Open a larger front/back view
                    </span>
                  </span>
                  <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    viewMode ? "bg-[#FFD54A]" : "bg-zinc-300 dark:bg-zinc-600"
                  }`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      viewMode ? "left-[22px]" : "left-0.5"
                    }`} />
                  </span>
                </button>
              </div>
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">
                    {cards.filter((card) => flipped[`${card.rarity}-${card.number}`]).length}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Collected</div>
                </div>
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">
                    {189 - cards.filter((card) => flipped[`${card.rarity}-${card.number}`]).length}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Remaining</div>
                </div>
              </div>
            </div>
          </aside>
          <main className="min-w-0">
            <div className="space-y-4">
              {Object.entries(set.rarities)
                .filter(([rarity]) => window.innerWidth >= 768 || rarity === selectedRarity)
                .map(([rarity, count]) => (
                  <section
                    key={rarity}
                    id={`rarity-${rarity}`}
                    className="scroll-mt-4 rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold sm:text-lg">
                          {getDisplayRarityCode(rarity)}
                          <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                            {rarityNames[rarity]}
                          </span>
                        </h2>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                          {count} cards
                        </p>
                      </div>
                      {isRarityComplete(rarity) && (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                          Complete
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3 lg:grid-cols-6">
                      {cards
                        .filter((card) => card.rarity === rarity)
                        .map((card) => {
const key = `${card.rarity}-${card.number}`;
const owned = flipped[key];
                          return (
                            <div
                              key={key}
                              className="group relative aspect-[5/7] cursor-pointer rounded-xl transition-transform duration-200 ease-out md:hover:z-20 md:hover:scale-[1.035]"
                              onClick={() => toggleFlip(key)}
                            >
                              <div className="relative h-full w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-100 shadow-sm transition-shadow duration-200 group-hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
                                <div
                                  className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${
                                    viewMode ? "" : owned ? "rotate-y-180" : ""
                                  }`}
                                >
                                  <img
                                    src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.webp`}
                                    className="absolute inset-0 h-full w-full scale-[1.04] rounded-xl object-cover object-center backface-hidden"
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                  />
                                  {!viewMode && owned && (
                                    <img
                                    src={getCardBack(card.rarity, card.number)}
                                    className="absolute left-0 top-[-7px] h-[calc(100%+14px)] w-full rounded-xl object-cover object-center rotate-y-180 backface-hidden"
                                    alt=""
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  )}
                                </div>
                                {owned && !viewMode && (
                                  <div className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">
                                    ✓
                                  </div>
                                )}
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
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setZoomedCard(null)}
        >
          <div
            className="w-[min(78vw,340px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:bg-[#1c1c1e]/95">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                Card preview
              </span>
              <button
                type="button"
                onClick={() => setZoomedCard(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5f57] text-sm font-bold text-[#6e120d] transition hover:brightness-95"
                aria-label="Close card preview"
              >
                ×
              </button>
            </div>
            <TiltCard>
              <div
                className="relative aspect-[5/7] w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl"
                onClick={() => setZoomedCardFlipped(!zoomedCardFlipped)}
              >
                <div
                  className={`absolute inset-0 transform-style-preserve-3d transition-transform duration-500 ${
                    zoomedCardFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  <img
                    src={zoomedCard}
                    className="absolute inset-0 h-full w-full scale-[1.04] rounded-2xl object-cover object-center backface-hidden"
                    alt=""
                                  />
                  <img
                    src={zoomedCardBack || ""}
                    className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center backface-hidden"
                    style={{ transform: "rotateY(180deg) scale(1.035)" }}
                    alt=""
                                  />
                </div>
              </div>
            </TiltCard>
            <div className="mt-3 text-center text-sm font-medium text-white/80">
              Tap card to flip
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MoonTwo;

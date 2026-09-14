import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";
// Edit only the quoted text to change the source shown under each CCG promo.
const CCG_PROMO_SOURCES: Record<string, string> = {
  "PR-1": "Thailand Exclusive",
  "PR-2": "Moon One 24-Pack Box",
  "PR-3": "Rainbow One Box",
  "PR-4": "Fun Moments One Box",
  "PR-5": "Moon Two 12-Pack Box",
  "PR-7": "Rainbow Two Box",
  "PR-8": "San Diego Comic-Con 2026",
  "PR-9": "San Diego Comic-Con 2026",
  "PR-10": "San Diego Comic-Con 2026",
  "PR-11": "San Diego Comic-Con 2026",
  "PR-12": "San Diego Comic-Con 2026",
  "PR-13": "San Diego Comic-Con 2026",
};
// Edit only the quoted text to change the source shown under each TCG promo.
const TCG_PROMO_SOURCES: Record<string, string> = {
  RR01: "Tournament Prize",
  RR02: "Tournament Prize",
  RR03: "Tournament Prize",
  RR04: "Tournament Prize",
  RR05: "Tournament Prize",
  RR06: "Tournament Prize",
  RR07: "Anime Expo 2026",
  RR08: "Anime Expo 2026",
  RR09: "Anime Expo 2026",
  RR10: "Anime Expo 2026",
  RR11: "Anime Expo 2026",
  RR12: "Anime Expo 2026",
  RR13: "Discord Box",
  RR14: "Discord Box",
  RR15: "Discord Box",
  RR16: "Discord Box",
  RR17: "Discord Box",
  RR18: "Discord Box",
  RR19: "Nightmare Night Box",
  RR20: "Nightmare Night Box",
  RR21: "Nightmare Night Box",
  RR22: "Nightmare Night Binder Set",
  RR23: "Nightmare Night Binder Set",
  RR24: "Nightmare Night Binder Set",
  RR25: "Nightmare Night Binder Set",
  RR26: "Nightmare Night Binder Set",
  RR27: "Nightmare Night Binder Set",
};
// Change each number independently to adjust only that CCG card's front image
// inside its grid container. 1 = no zoom, 1.04 = 4% zoom, 0.98 = 2% smaller.
const CCG_CARD_ZOOM: Record<string, number> = {
  "PR-1": 1.009,
  "PR-2": 1.04,
  "PR-3": 1.035,
  "PR-4": 1.035,
  "PR-5": 1.033,
  "PR-7": 1.035,
  "PR-8": 1.04,
  "PR-9": 1.04,
  "PR-10": 1.04,
  "PR-11": 1.04,
  "PR-12": 1.04,
  "PR-13": 1.04,
};
// Change each number independently to adjust only that TCG card's front image
// inside its grid container. The backs and full-screen preview are unchanged.
const TCG_CARD_ZOOM: Record<string, number> = {
  RR01: 0.99,
  RR02: 0.99,
  RR03: 0.99,
  RR04: 0.99,
  RR05: 0.99,
  RR06: 0.99,
  RR07: 0.99,
  RR08: 0.99,
  RR09: 1.035,
  RR10: 1.025,
  RR11: 1.025,
  RR12: 1.025,
  RR13: 0.99,
  RR14: 0.99,
  RR15: 0.99,
  RR16: 0.99,
  RR17: 0.99,
  RR18: 0.99,
  RR19: 0.99,
  RR20: 0.99,
  RR21: 0.99,
  RR22: 0.99,
  RR23: 0.99,
  RR24: 0.99,
  RR25: 0.99,
  RR26: 0.99,
  RR27: 0.99,
};
const PromotionalCards = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState("");
  const [viewMode, setViewMode] = useState(false);
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
  const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
  const ccgCards = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13];
  const tcgCards = Array.from({ length: 27 }, (_, i) => i + 1);
  const ccgHidden = hiddenSets.includes("9");
  const tcgHidden = hiddenSets.includes("tcgpromos");
  const getCardBack = (number?: number) => {
    if (number && number >= 8) {
      return "/card-backs/promos/sdccboombacks.webp";
    }
    return "/card-backs/M1R-SR-SGR-SCBACK.webp";
  };
  const toggleFlip = (key: string) => {
    if (viewMode) {
      if (key.startsWith("PR-")) {
        const number = Number(key.split("-")[1]);
        setZoomedCard(
          `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`,
        );
        setZoomedCardBack(getCardBack(number));
      } else {
        setZoomedCard(`/tcgpromos/${key}.webp`);
        setZoomedCardBack("/card-backs/tcgdefaultback.webp");
      }
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .maybeSingle();
      const hidden = (profile?.iso_hidden_sets || []).map((id: string) => {
        switch (id) {
          case "TCG_PROMOS":
            return "tcgpromos";
          default:
            return id;
        }
      });
      setHiddenSets(hidden);
      const [{ data: ccg }, { data: tcg }] = await Promise.all([
        supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", "9")
          .maybeSingle(),
        supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", "tcgpromos")
          .maybeSingle(),
      ]);
      const merged = {
        ...(ccg?.progress || {}),
        ...(tcg?.progress || {}),
      };
      setFlipped(merged);
      setLastSavedProgress(JSON.stringify(merged));
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
      const ccgProgress: Record<string, boolean> = {};
      const tcgProgress: Record<string, boolean> = {};
      Object.entries(flipped).forEach(([key, value]) => {
        if (key.startsWith("PR-")) {
          ccgProgress[key] = value;
        } else if (key.startsWith("RR")) {
          tcgProgress[key] = value;
        }
      });
      await Promise.all([
        supabase.from("collection_progress_raw").upsert(
          {
            user_id: user.id,
            set_id: "9",
            progress: ccgProgress,
          },
          {
            onConflict: "user_id,set_id",
          },
        ),
        supabase.from("collection_progress_raw").upsert(
          {
            user_id: user.id,
            set_id: "tcgpromos",
            progress: tcgProgress,
          },
          {
            onConflict: "user_id,set_id",
          },
        ),
      ]);
      setLastSavedProgress(JSON.stringify(flipped));
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
              Promotional Cards
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              CCG and TCG promotional cards.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600 dark:bg-white/[0.07] dark:text-zinc-300">
            {Object.values(flipped).filter(Boolean).length}/
            {ccgCards.length + tcgCards.length}
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-[64px] xl:self-start">
            <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
              <div>
                <h2 className="text-base font-semibold">Promo sets</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Jump between your CCG and TCG promotional cards.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("ccg-promos")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200 dark:bg-white/[0.07] dark:text-zinc-300 dark:hover:bg-white/[0.11]"
                >
                  CCG Promos
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("tcg-promos")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200 dark:bg-white/[0.07] dark:text-zinc-300 dark:hover:bg-white/[0.11]"
                >
                  TCG Promos
                </button>
              </div>
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <button
                type="button"
                onClick={() => setViewMode(!viewMode)}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-100 px-3.5 py-3 text-left transition hover:bg-zinc-200 dark:bg-white/[0.07] dark:hover:bg-white/[0.11]"
              >
                <span>
                  <span className="block text-sm font-semibold">
                    Inspect cards
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                    Open a larger front/back view
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    viewMode ? "bg-[#FFD54A]" : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      viewMode ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">
                    {Object.values(flipped).filter(Boolean).length}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Collected
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">
                    {ccgCards.length +
                      tcgCards.length -
                      Object.values(flipped).filter(Boolean).length}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Remaining
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <main className="min-w-0 space-y-4">
            <section id="ccg-promos" className="relative scroll-mt-20">
              {ccgHidden && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[24px] bg-white/70 p-4 backdrop-blur-sm dark:bg-[#101112]/75">
                  <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center shadow-lg dark:border-white/10 dark:bg-[#1c1c1e]">
                    <div className="text-sm font-semibold">
                      CCG Promos are hidden
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      This set is hidden in your ISO settings.
                    </div>
                  </div>
                </div>
              )}
              <div
                className={
                  ccgHidden ? "pointer-events-none select-none blur-sm" : ""
                }
              >
                <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold sm:text-lg">
                        CCG Promos
                      </h2>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {ccgCards.length} cards
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {ccgCards.map((number) => {
                      const key = `PR-${number}`;
                      const owned = flipped[key];
                      return (
                        <div key={key} className="group min-w-0">
                          <div
                            className="relative aspect-[5/7] w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-100 shadow-sm transition duration-200 ease-out group-hover:shadow-lg md:group-hover:scale-[1.035] dark:bg-white/[0.04]"
                            onClick={() => toggleFlip(key)}
                          >
                            <div
                              className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${
                                viewMode ? "" : owned ? "rotate-y-180" : ""
                              }`}
                            >
                              <img
                                src={`/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`}
                                className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                style={{
                                  transform: `scale(${CCG_CARD_ZOOM[key] ?? 1})`,
                                }}
                                alt=""
                              />
                              <img
                                src={getCardBack(number)}
                                className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                style={{
                                  transform: "rotateY(180deg) scale(1.035)",
                                }}
                                alt=""
                              />
                            </div>
                            {owned && !viewMode && (
                              <div className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">
                                ✓
                              </div>
                            )}
                          </div>
                          <p className="mt-2 min-h-[2.5rem] w-full max-w-full overflow-hidden break-words px-1 text-center text-xs leading-4 text-zinc-500 [overflow-wrap:anywhere] dark:text-zinc-400">
                            {CCG_PROMO_SOURCES[key] || "Source not added yet"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
            <section id="tcg-promos" className="relative scroll-mt-20">
              {tcgHidden && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[24px] bg-white/70 p-4 backdrop-blur-sm dark:bg-[#101112]/75">
                  <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center shadow-lg dark:border-white/10 dark:bg-[#1c1c1e]">
                    <div className="text-sm font-semibold">
                      TCG Promos are hidden
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      This set is hidden in your ISO settings.
                    </div>
                  </div>
                </div>
              )}
              <div
                className={
                  tcgHidden ? "pointer-events-none select-none blur-sm" : ""
                }
              >
                <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold sm:text-lg">
                        TCG Promos
                      </h2>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {tcgCards.length} cards
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {tcgCards.map((number) => {
                      const key = `RR${String(number).padStart(2, "0")}`;
                      const owned = flipped[key];
                      return (
                        <div key={key} className="group min-w-0">
                          <div
                            className="relative aspect-[5/7] w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-100 shadow-sm transition duration-200 ease-out group-hover:shadow-lg md:group-hover:scale-[1.035] dark:bg-white/[0.04]"
                            onClick={() => toggleFlip(key)}
                          >
                            <div
                              className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${
                                viewMode ? "" : owned ? "rotate-y-180" : ""
                              }`}
                            >
                              <img
                                src={`/tcgpromos/${key}.webp`}
                                className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                style={{
                                  transform: `scale(${TCG_CARD_ZOOM[key] ?? 1})`,
                                }}
                                alt=""
                              />
                              <img
                                src="/card-backs/tcgdefaultback.webp"
                                className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                style={{ transform: "rotateY(180deg)" }}
                                alt=""
                              />
                            </div>
                            {owned && !viewMode && (
                              <div className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">
                                ✓
                              </div>
                            )}
                          </div>
                          <p className="mt-2 min-h-[2.5rem] w-full max-w-full overflow-hidden break-words px-1 text-center text-xs leading-4 text-zinc-500 [overflow-wrap:anywhere] dark:text-zinc-400">
                            {TCG_PROMO_SOURCES[key] || "Source not added yet"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
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
export default PromotionalCards;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";
const PromotionalCards = () => {
const navigate = useNavigate();
const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);
const [lastSavedProgress, setLastSavedProgress] = useState("");
const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("PR");
const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const set = {
  folder: "promo-cards",
  prefix: "MLPEPR",
  setId: "9",
};
const ccgCards = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13];
const tcgCards = Array.from({ length: 18 }, (_, i) => i + 1);
const ccgHidden = hiddenSets.includes("9");
const tcgHidden = hiddenSets.includes("tcgpromos");
const getCardBack = (number?: number) => {
  if (number && number >= 8) {
    return "/card-backs/promos/sdccboombacks.webp";
  }
  return "/card-backs/M1R-SR-SGR-SCBACK.webp";
};
const getPromoDisplayCode = (key: string) => {
  if (key.startsWith("PR-")) {
const number = Number(key.split("-")[1]);
// CCG promo cards 8–13 are SDCC-01 through SDCC-06.
    if (number >= 8 && number <= 13) {
      return `SDCC-${String(number - 7).padStart(2, "0")}`;
    }
    return `PR-${String(number).padStart(3, "0")}`;
  }
const number = Number(key.replace("RR", ""));
// TCG promo cards:
// RR01–RR06
// ※BP01-CR07–※BP01-CR12
// ※BP02-CR01–※BP02-CR06
  if (number >= 1 && number <= 6) {
    return `RR${String(number).padStart(2, "0")}`;
  }
  if (number >= 7 && number <= 12) {
    return `※BP01-CR${String(number).padStart(2, "0")}`;
  }
  return `※BP02-CR${String(number - 12).padStart(2, "0")}`;
};
const toggleFlip = (key: string) => {
  if (viewMode) {
if (key.startsWith("PR-")) {
const number = Number(key.split("-")[1]);
  setZoomedCard(
    `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`
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
      }
    ),
    supabase.from("collection_progress_raw").upsert(
      {
        user_id: user.id,
        set_id: "tcgpromos",
        progress: tcgProgress,
      },
      {
        onConflict: "user_id,set_id",
      }
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
            {Object.values(flipped).filter(Boolean).length}/{ccgCards.length + tcgCards.length}
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
                  onClick={() => document.getElementById("ccg-promos")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200 dark:bg-white/[0.07] dark:text-zinc-300 dark:hover:bg-white/[0.11]"
                >
                  CCG Promos
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("tcg-promos")?.scrollIntoView({ behavior: "smooth", block: "start" })}
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
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">
                    {Object.values(flipped).filter(Boolean).length}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Collected</div>
                </div>
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">
                    {ccgCards.length + tcgCards.length - Object.values(flipped).filter(Boolean).length}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Remaining</div>
                </div>
              </div>
            </div>
          </aside>
          <main className="min-w-0 space-y-4">
            <section id="ccg-promos" className="relative scroll-mt-20">
              {ccgHidden && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[24px] bg-white/70 p-4 backdrop-blur-sm dark:bg-[#101112]/75">
                  <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center shadow-lg dark:border-white/10 dark:bg-[#1c1c1e]">
                    <div className="text-sm font-semibold">CCG Promos are hidden</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      This set is hidden in your ISO settings.
                    </div>
                  </div>
                </div>
              )}
              <div className={ccgHidden ? "pointer-events-none select-none blur-sm" : ""}>
                <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold sm:text-lg">CCG Promos</h2>
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
                        <div
                          key={key}
                          className="group relative aspect-[5/7] cursor-pointer rounded-xl transition-transform duration-200 ease-out md:hover:z-20 md:hover:scale-[1.035]"
                          onClick={() => toggleFlip(key)}
                        >
                          <div className="relative h-full w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-100 shadow-sm transition-shadow duration-200 group-hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
                            <div className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${
                              viewMode ? "" : owned ? "rotate-y-180" : ""
                            }`}>
                              <img
                                src={`/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`}
                                className="absolute inset-0 h-full w-full scale-[1.04] rounded-xl object-cover object-center backface-hidden"
                                alt=""
                                loading="lazy"
                                decoding="async"
                              />
                              {!viewMode && owned && (
                                <img
                                src={getCardBack(number)}
                                className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                style={{ transform: "rotateY(180deg) scale(1.035)" }}
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
                </div>
              </div>
            </section>
            <section id="tcg-promos" className="relative scroll-mt-20">
              {tcgHidden && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[24px] bg-white/70 p-4 backdrop-blur-sm dark:bg-[#101112]/75">
                  <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center shadow-lg dark:border-white/10 dark:bg-[#1c1c1e]">
                    <div className="text-sm font-semibold">TCG Promos are hidden</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      This set is hidden in your ISO settings.
                    </div>
                  </div>
                </div>
              )}
              <div className={tcgHidden ? "pointer-events-none select-none blur-sm" : ""}>
                <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold sm:text-lg">TCG Promos</h2>
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
                        <div
                          key={key}
                          className="group relative aspect-[5/7] cursor-pointer rounded-xl transition-transform duration-200 ease-out md:hover:z-20 md:hover:scale-[1.035]"
                          onClick={() => toggleFlip(key)}
                        >
                          <div className="relative h-full w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-100 shadow-sm transition-shadow duration-200 group-hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
                            <div className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${
                              viewMode ? "" : owned ? "rotate-y-180" : ""
                            }`}>
                              <img
                                src={`/tcgpromos/${key}.webp`}
                                className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                alt=""
                                loading="lazy"
                                decoding="async"
                              />
                              {!viewMode && owned && (
                                <img
                                src="/card-backs/tcgdefaultback.webp"
                                className="absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                style={{ transform: "rotateY(180deg)" }}
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
                <div className={`absolute inset-0 transform-style-preserve-3d transition-transform duration-500 ${
                  zoomedCardFlipped ? "rotate-y-180" : ""
                }`}>
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

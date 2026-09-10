import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";
const NightmareNight = () => {
const navigate = useNavigate();
const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);
const [lastSavedProgress, setLastSavedProgress] = useState("");
const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("C");
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const [zoomedCardKey, setZoomedCardKey] = useState<string | null>(null);
const set = {
    folder: "nightmare-night",
    setId: "14",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PGR: 5,
      PSPR: 11,
      PCR: 12,
      PRR: 6,
    },
  };
const rarityNames: Record<string, string> = {
    C: "COMMON",
    U: "UNCOMMON",
    ER: "EMERALD RARE",
    SR: "SILVER RARE",
    SPR: "SAPPHIRE RARE",
    GR: "GOLD RARE",
    CR: "COLORFUL RARE",
    RR: "RUBY RARE",
    PER: "SHINING EMERALD RARE",
    PSPR: "SHINING SAPPHIRE RARE",
    PGR: "SHINING GOLD RARE",
    PCR: "SHINING COLORFUL RARE",
    PRR: "SHINING RUBY RARE",
  };
const cards = Object.entries(set.rarities).flatMap(([rarity]) => {
    if (rarity === "ER") {
      return ["01", "02"].flatMap((number) =>
        ["A", "B", "C"].map((variant) => ({
          rarity,
          key: `BP03-ER${number}-${variant}`,
        })),
      );
    }
    if (rarity === "PER") {
      return ["01", "02"].flatMap((number) =>
        ["A", "A2", "B", "B2", "C", "C2"].map((variant) => ({
          rarity,
          key: `PBP03-ER${number}-${variant}`,
        })),
      );
    }
    if (rarity === "PGR") {
      return ["07", "08", "09", "11", "12"].map((number) => ({
        rarity,
        key: `PBP03-GR${number}`,
      }));
    }
    if (rarity === "PSPR") {
      return [
        "01",
        "02",
        "05",
        "10",
        "14",
        "15",
        "16",
        "18",
        "23",
        "24",
        "26",
      ].map((number) => ({ rarity, key: `PBP03-SPR${number}` }));
    }
    if (rarity === "PCR") {
      return Array.from({ length: 12 }, (_, i) => ({
        rarity,
        key: `PBP03-CR${String(i + 1).padStart(2, "0")}`,
      }));
    }
    if (rarity === "PRR") {
      return Array.from({ length: 6 }, (_, i) => ({
        rarity,
        key: `PBP03-RR${String(i + 1).padStart(2, "0")}`,
      }));
    }
const count = set.rarities[rarity as keyof typeof set.rarities];
    return Array.from({ length: count }, (_, i) => ({
      rarity,
      key: `BP03-${rarity}${String(i + 1).padStart(2, "0")}`,
    }));
  });
const isRarityComplete = (rarity: string) => {
    if (rarity === "PSPR" || rarity === "PRR") return false;
const total = set.rarities[rarity as keyof typeof set.rarities];
const owned = cards.filter(
      (card) => card.rarity === rarity && flipped[card.key],
    ).length;
    return owned === total;
  };
const getRarityCode = (rarity: string) => {
    return rarity;
  };
const getDisplayCardCode = (key: string) => {
const parallelMatch = key.match(
      /^PBP03-(ER|GR|SPR|CR|RR)(\d{2})(-(?:A|A2|B|B2|C|C2))?$/,
    );
    if (parallelMatch) {
      return `\u203BBP03-${parallelMatch[1]}${parallelMatch[2]}${parallelMatch[3] ?? ""}`;
    }
const match = key.match(
      /^BP03-(C|U|ER|SR|SPR|GR|CR|RR|PER|PGR|PSPR|PCR|PRR)(\d{2})(-A|-B|-C|-A2|-B2)?$/,
    );
    if (!match) return key.replace("BP03-", "");
const [, rarity, number, variant = ""] = match;
    if (rarity === "PER") return `\u203BBP03-ER${number}`;
    if (rarity === "PGR") return `\u203BBP03-GR${number}${variant}`;
    if (rarity === "PSPR") {
const psprDisplayNumbers: Record<string, string> = {
        "01": "01",
        "02": "02",
        "03": "05",
        "04": "10",
        "05": "14",
        "06": "15",
        "07": "16",
        "08": "18",
        "09": "23",
        "10": "24",
        "11": "26",
      };
      return `\u203BBP03-SPR${psprDisplayNumbers[number] ?? number}`;
    }
    if (rarity === "PCR") return `\u203BBP03-CR${number}${variant}`;
    if (rarity === "PRR") return `\u203BBP03-RR${number}${variant}`;
    return `BP03-${rarity}${number}${variant}`;
  };
const getCardBack = (key: string) => {
    if (key.startsWith("BP03-ER") || key.startsWith("PBP03-ER")) {
      return "/tcg-card-backs/SCENECARDBACK.webp";
    }
// C25-C48 have unique backs
    if (key.startsWith("BP03-C")) {
const num = Number(key.replace("BP03-C", ""));
      if (num >= 25 && num <= 48) {
        return `/card-backs/nightmare-night/${key}.webp`;
      }
    }
// RR01-RR06 have unique backs
const rrMatch = key.match(/^BP03-RR(0[1-6])$/);
    if (rrMatch) {
      return `/tcg-card-backs/BP02-RR${rrMatch[1]}.webp`;
    }
    return `/card-backs/tcgdefaultback.webp`;
  };
const getCardFront = (key: string) => {
    return `/cards/nightmare-night/${key}.webp`;
  };
const isLandscapeCommon = (key: string) => {
const match = key.match(/^BP03-C(\d{2})$/);
const number = match ? Number(match[1]) : 0;
    return number >= 25 && number <= 48;
  };
const toggleFlip = (key: string) => {
    if (viewMode) {
      setZoomedCard(getCardFront(key));
      setZoomedCardBack(getCardBack(key));
      setZoomedCardFlipped(false);
      setZoomedCardKey(key);
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
      await supabase.from("collection_progress_raw").upsert(
        {
          user_id: user.id,
          set_id: set.setId,
          progress: flipped,
        },
        {
          onConflict: "user_id,set_id",
        },
      );
      setLastSavedProgress(current);
    };
    saveProgress();
  }, [flipped, loaded, lastSavedProgress]);
const ownedCount = cards.filter((card) => flipped[card.key]).length;
const rarityLabel = (rarity: string) =>
    rarity === "PER"
      ? "\u203BER"
      : rarity === "PGR"
        ? "\u203BGR"
        : rarity === "PSPR"
          ? "\u203BSPR"
          : rarity === "PCR"
            ? "\u203BCR"
            : rarity === "PRR"
              ? "\u203BRR"
              : getRarityCode(rarity);
  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24 text-zinc-900 dark:bg-[#0b0b0c] dark:text-white sm:pb-8">
      <div className="mx-auto max-w-[1800px] px-3 py-3 sm:px-5 sm:py-5">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white p-2.5 shadow-sm dark:border-white/[0.08] dark:bg-[#171719]">
          <button
            type="button"
            onClick={() => navigate("/collections")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-700 transition hover:bg-zinc-200 active:scale-95 dark:bg-white/[0.08] dark:text-zinc-200 dark:hover:bg-white/[0.12]"
            aria-label="Back to collections"
          >
            &lsaquo;
          </button>
          <div className="min-w-0 flex-1 px-1">
            <div className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              My Little Pony TCG
            </div>
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              Nightmare Night
            </h1>
          </div>
          <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:bg-white/[0.07] dark:text-zinc-300">
            {ownedCount} / {cards.length}
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-3 xl:self-start">
            <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#171719]">
              <div className="mb-3 px-1">
                <h2 className="text-base font-semibold">Collection</h2>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {cards.length - ownedCount} cards remaining
                </p>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-white/[0.06]">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Collected
                  </div>
                  <div className="mt-0.5 text-xl font-semibold">
                    {ownedCount}
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-white/[0.06]">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Remaining
                  </div>
                  <div className="mt-0.5 text-xl font-semibold">
                    {cards.length - ownedCount}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewMode(!viewMode)}
                className={`mb-3 flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition ${viewMode ? "bg-[#FFD54A] text-zinc-900" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.1]"}`}
              >
                <span>Inspect cards</span>
                <span
                  className={`relative h-6 w-11 rounded-full transition ${viewMode ? "bg-zinc-900/20" : "bg-zinc-300 dark:bg-zinc-700"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${viewMode ? "left-[22px]" : "left-0.5"}`}
                  />
                </span>
              </button>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">Rarity</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {Object.keys(set.rarities).length}
                </span>
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
                          }),
                      );
                    }}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition xl:text-left ${isRarityComplete(rarity) ? "bg-[#FFD54A] text-zinc-900" : selectedRarity === rarity ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.1]"}`}
                  >
                    {rarityLabel(rarity)}
                  </button>
                ))}
              </div>
              <p className="mt-3 px-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {viewMode
                  ? "Tap any card to inspect its front and back. Ownership will not change."
                  : "Tap a card to mark it as collected."}
              </p>
            </div>
          </aside>
          <main className="min-w-0">
            <div className="space-y-4">
              {Object.entries(set.rarities)
                .filter(
                  ([rarity]) =>
                    window.innerWidth >= 768 || rarity === selectedRarity,
                )
                .map(([rarity, count]) => {
const rarityCards = cards.filter(
                    (card) => card.rarity === rarity,
                  );
const isComingSoon = rarity === "PSPR" || rarity === "PRR";
const rarityOwned = rarityCards.filter(
                    (card) => flipped[card.key],
                  ).length;
                  return (
                    <section
                      key={rarity}
                      id={`rarity-${rarity}`}
                      className="scroll-mt-3 rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#171719] sm:p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold">
                            {rarityLabel(rarity)}{" "}
                            <span className="font-normal text-zinc-400">
                              {rarityNames[rarity]}
                            </span>
                          </h2>
                          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                            {isComingSoon
                              ? "Images coming soon"
                              : `${rarityOwned} of ${count} collected`}
                          </p>
                        </div>
                        {!isComingSoon && isRarityComplete(rarity) && (
                          <span className="rounded-full bg-[#FFD54A] px-2.5 py-1 text-xs font-semibold text-zinc-900">
                            Complete
                          </span>
                        )}
                      </div>
                      {rarity === "ER" && (
                        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-100 px-3.5 py-3 text-amber-950 ring-1 ring-inset ring-amber-400/60 dark:bg-amber-400/10 dark:text-amber-100 dark:ring-amber-300/25">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white dark:bg-amber-300 dark:text-zinc-950">
                            !
                          </span>
                          <div>
                            <div className="text-sm font-bold">
                              Official image quality warning
                            </div>
                            <p className="mt-0.5 text-xs font-medium leading-5 sm:text-sm">
                              These six previews use the original image files
                              provided by Kayou. I cannot make them a higher
                              quality. They will be updated when Kayou sends
                              better images!
                            </p>
                          </div>
                        </div>
                      )}
                      {isComingSoon && (
                        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-100 px-3.5 py-3 text-amber-950 ring-1 ring-inset ring-amber-400/60 dark:bg-amber-400/10 dark:text-amber-100 dark:ring-amber-300/25">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white dark:bg-amber-300 dark:text-zinc-950">
                            !
                          </span>
                          <div>
                            <div className="text-sm font-bold">
                              Card images coming soon
                            </div>
                            <p className="mt-0.5 text-xs font-medium leading-5 sm:text-sm">
                              Kayou did not provide the {rarityLabel(rarity)}{" "}
                              card images with the rest of the set. These cards
                              will be added as soon as Kayou supplies the
                              missing files.
                            </p>
                          </div>
                        </div>
                      )}
                      {isComingSoon ? (
                        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-amber-400/70 bg-amber-50/70 px-6 py-10 text-center dark:border-amber-300/30 dark:bg-amber-400/[0.06]">
                          <div className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black tracking-[0.18em] text-white dark:bg-amber-300 dark:text-zinc-950">
                            COMING SOON
                          </div>
                          <p className="mt-3 max-w-lg text-sm font-medium text-amber-950 dark:text-amber-100">
                            No {rarityLabel(rarity)} card images were supplied
                            by Kayou, so there are no previews to show yet.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">
                          {rarityCards.map((card) => {
const key = card.key;
const owned = flipped[key];
const landscape = isLandscapeCommon(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggleFlip(key)}
                                aria-label={`${getDisplayCardCode(key)}${owned ? ", collected" : ""}`}
                                className="group relative aspect-[5/7] w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-100 shadow-sm transition duration-200 md:hover:z-10 md:hover: md:hover:shadow-lg dark:bg-white/[0.04]"
                              >
                                <div
                                  className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-500 ${owned && !viewMode ? "rotate-y-180" : ""}`}
                                >
                                  <img
                                    src={getCardFront(key)}
                                    className={
                                      landscape
                                        ? "absolute left-1/2 top-1/2 h-[71.4286%] w-[140%] max-w-none rounded-xl object-cover object-center backface-hidden"
                                        : "absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                    }
                                    style={
                                      landscape
                                        ? {
                                            transform:
                                              "translate(-50%, -50%) rotate(-90deg)",
                                          }
                                        : undefined
                                    }
                                    alt=""
                                  />
                                  <img
                                    src={getCardBack(key)}
                                    className={
                                      landscape
                                        ? "absolute left-1/2 top-1/2 h-[71.4286%] w-[140%] max-w-none rounded-xl object-cover object-center backface-hidden"
                                        : "absolute inset-0 h-full w-full rounded-xl object-cover object-center backface-hidden"
                                    }
                                    style={
                                      landscape
                                        ? {
                                            transform:
                                              "translate(-50%, -50%) rotateY(180deg) rotateZ(-90deg)",
                                          }
                                        : { transform: "rotateY(180deg)" }
                                    }
                                    alt=""
                                  />
                                </div>
                                {owned && !viewMode && (
                                  <span className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD54A] text-sm font-bold text-zinc-900 shadow-sm">
                                    &#10003;
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
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
                &times;
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
                    className={`absolute rounded-2xl backface-hidden ${
                      zoomedCardKey && isLandscapeCommon(zoomedCardKey)
                        ? "left-1/2 top-1/2 h-full w-[140%] max-w-none object-contain"
                        : `inset-0 h-full w-full ${
                            zoomedCardKey && /^BP03-ER0[12]-[ABC]$/.test(zoomedCardKey)
                              ? "object-contain"
                              : "object-scale-down"
                          }`
                    }`}
                    style={
                      zoomedCardKey && isLandscapeCommon(zoomedCardKey)
                        ? { transform: "translate(-50%, -50%) rotate(-90deg)" }
                        : undefined
                    }
                    alt=""
                  />
                  <img
                    src={zoomedCardBack || ""}
                    className={`absolute h-full w-full rounded-2xl backface-hidden ${
                      zoomedCardKey && /^BP03-RR0[1-6]$/.test(zoomedCardKey)
                        ? "inset-0 object-scale-down"
                        : "object-cover object-center"
                    }`}
                    style={
                      zoomedCardKey && /^BP03-RR0[1-6]$/.test(zoomedCardKey)
                        ? { transform: "rotateY(180deg)" }
                        : zoomedCardKey && isLandscapeCommon(zoomedCardKey)
                          ? {
                              left: "50%",
                              top: "50%",
                              width: "140%",
                              height: "71.4285714286%",
                              maxWidth: "none",
                              transform: "translate(-50%, -50%) rotateY(180deg) rotateZ(-90deg)",
                            }
                          : {
                              inset: 0,
                              transform: "rotateY(180deg) scale(1.05)",
                            }
                    }
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
export default NightmareNight;

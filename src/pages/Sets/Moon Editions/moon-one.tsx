import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";

const MoonOne = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState("");

  const [viewMode, setViewMode] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState("R");
  const [hoverEffects, setHoverEffects] = useState(true);

  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
  const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);

  const set = {
    folder: "first-edition-moon",
    prefix: "M1",
    setId: "1",

    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7,
    },
  };
  
  const rarityNames: Record<string, string> = {
  R: "RARE",
  SR: "SUPER RARE",
  SSR: "SUPER SPARK RARE",
  HR: "HOLOGRAPHIC RARE",
  UR: "ULTRA RARE",
  LSR: "LIMITED SECRET RARE",
  SGR: "SUPER GOLDEN RARE",
  SC: "SECRET CARD",
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

const getCardBack = (rarity: string, number: number) => {
  const padded = String(number).padStart(3, "0");

  if (rarity === "R") {
    return `/moon-1-other-backs/M1RBK${padded}.webp`;
  }

  if (rarity === "SR") {
    return `/moon-1-other-backs/M1SRB${padded}.webp`;
  }

  if (rarity === "HR") {
    const sideways = [8, 9, 10, 18, 19, 21, 23, 27, 32, 34, 36];

    if (sideways.includes(number)) {
      return `/card-backs/M1HRSIDEWAYSBACK.webp`;
    }

    return `/card-backs/M1HRBACK.webp`;
  }

  if (rarity === "SSR") {
    return `/card-backs/M1SSRBACK.webp`;
  }

  if (rarity === "UR") {
    if (number === 16) {
      return `/card-backs/M1URSIDEWAYSBACK.webp`;
    }

    return `/card-backs/M1URBACK.webp`;
  }

  if (rarity === "SGR") {
    return `/card-backs/M1SGRBACK.webp`;
  }

  if (rarity === "SC") {
    if (number === 7) {
      return `/card-backs/M1SCBACK.webp`;
    }

    return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
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
              M1 / ASSET NODE 01
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
                <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">SYSTEM</div>
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
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-300">CONTROL DECK</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#FFD54A]/85">M1</span>
                </div>
              </div>

              <div className="relative border-b border-white/[0.07] p-4 sm:p-5">
                <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/30" />
                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.32em] text-zinc-300">SERIES IDENTIFICATION</div>
                <h1 className="mt-3 font-['Oxanium'] text-3xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-4xl">
                  Moon Edition
                  <span className="block text-[#FFD54A]">Series One</span>
                </h1>
                <div className="mt-4 h-px bg-gradient-to-r from-[#FFD54A]/50 to-transparent" />
                <p className="mt-4 font-mono text-[9px] uppercase leading-5 tracking-[0.08em] text-zinc-300">
                  Click a card to mark it as owned. Your ISO list updates automatically based on the cards you still need.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px border-b border-white/[0.07] bg-white/[0.06]">
                <div className="bg-[#070a0a] p-4"><div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">ASSETS</div><div className="mt-1 font-['Oxanium'] text-2xl font-black text-[#FFD54A]">186</div></div>
                <div className="bg-[#070a0a] p-4"><div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">TIERS</div><div className="mt-1 font-['Oxanium'] text-2xl font-black text-white">08</div></div>
                <div className="bg-[#070a0a] p-4"><div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">COLLECTED</div><div className="mt-1 font-['Oxanium'] text-2xl font-black text-emerald-400">{cards.filter((card) => flipped[`${card.rarity}-${card.number}`]).length}</div></div>
                <div className="bg-[#070a0a] p-4"><div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">REMAINING</div><div className="mt-1 font-['Oxanium'] text-2xl font-black text-zinc-300">{186 - cards.filter((card) => flipped[`${card.rarity}-${card.number}`]).length}</div></div>
              </div>

              <div className="border-b border-white/[0.07] p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">RARITY SELECTOR</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD54A]/80">08 NODES</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.keys(set.rarities).map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setSelectedRarity(rarity);
                          requestAnimationFrame(() => document.getElementById(`rarity-${rarity}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
                        } else {
                          document.getElementById(`rarity-${rarity}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                      <span className="mr-2 text-[#FFD54A]/60">{String(Object.keys(set.rarities).indexOf(rarity) + 1).padStart(2, "0")}</span>
                      {rarity === "SN" ? "◇N" : rarity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-white/[0.07] p-4 sm:p-5">
                <div className="mb-3 font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">DISPLAY SYSTEMS</div>
                <button
                  onClick={() => setViewMode(!viewMode)}
                  className={`mb-2 w-full border px-3 py-3 text-left font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition ${
                    viewMode ? "border-[#FFD54A]/60 bg-[#FFD54A]/10 text-[#FFD54A]" : "border-white/[0.08] bg-[#070a0a] text-zinc-400 hover:border-white/[0.18]"
                  }`}
                >
                  <span className="flex items-center justify-between"><span>VIEW MODE</span><span>{viewMode ? "ONLINE" : "OFFLINE"}</span></span>
                </button>
                <button
                  onClick={() => setHoverEffects(!hoverEffects)}
                  className={`hidden w-full border px-3 py-3 text-left font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition md:block ${
                    hoverEffects ? "border-emerald-400/35 bg-emerald-400/[0.05] text-emerald-400" : "border-white/[0.08] bg-[#070a0a] text-zinc-500 hover:border-white/[0.18]"
                  }`}
                >
                  <span className="flex items-center justify-between"><span>HOVER EFFECTS</span><span>{hoverEffects ? "ONLINE" : "OFFLINE"}</span></span>
                </button>
                <p className="mt-3 font-mono text-[8px] uppercase leading-4 tracking-[0.06em] text-zinc-400">
                  {viewMode ? "Click a card to view the front and back without marking it as owned." : "Click cards to mark them as owned."}
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="mb-4 font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">PRODUCT DATA</div>
                <div className="space-y-3">
                  <div className="border-l border-[#FFD54A]/25 pl-3"><div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">PRODUCT</div><div className="mt-1 text-xs font-bold uppercase text-zinc-200">Moon One</div></div>
                  <div className="border-l border-white/[0.08] pl-3"><div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">RELEASE</div><div className="mt-1 text-xs font-bold uppercase text-zinc-400">September 2025</div></div>
                  <div className="border-l border-white/[0.08] pl-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">PULL RATES</div>
                    <button onClick={() => navigate("/faq")} className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[#FFD54A] transition hover:text-white">SEE FAQ</button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 flex items-center justify-between border border-white/[0.08] bg-[#080b0b] px-4 py-3">
              <div><div className="font-mono text-[5px] font-bold uppercase tracking-[0.3em] text-zinc-700">ASSET MATRIX</div><div className="mt-1 font-['Oxanium'] text-sm font-black uppercase tracking-[0.08em] text-white">Collection Cards</div></div>
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.8)]" /><span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-300/95">LIVE</span></div>
            </div>

            <div className="space-y-6">
              {Object.entries(set.rarities)
                .filter(([rarity]) => window.innerWidth >= 768 || rarity === selectedRarity)
                .map(([rarity, count], index) => (
                  <section key={rarity} id={`rarity-${rarity}`} className="relative overflow-hidden border border-white/[0.08] bg-[#080b0b] p-3 shadow-[0_18px_45px_rgba(0,0,0,.42)] sm:p-4">
                    <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l border-t border-[#FFD54A]/45" />
                    <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-[#FFD54A]/20" />

                    <div className="mb-4 flex items-end justify-between border-b border-white/[0.07] pb-3">
                      <div>
                        <div className="mb-2 flex items-center gap-2"><span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-400">NODE {String(index + 1).padStart(2, "0")}</span><span className="h-px w-8 bg-[#FFD54A]/25" /><span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD54A]/85">ACTIVE</span></div>
                        <h2 className="font-['Oxanium'] text-2xl font-black uppercase leading-none text-white sm:text-3xl">
                          {rarity === "SN" ? "◇N" : rarity}
                          <span className="ml-2 text-sm font-normal tracking-normal text-zinc-500 sm:text-base">{rarityNames[rarity]}</span>
                        </h2>
                        <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">{count} ASSETS / {isRarityComplete(rarity) ? "COMPLETE" : "IN PROGRESS"}</p>
                      </div>
                      <div className="font-['Oxanium'] text-3xl font-black text-[#FFD54A]/25 sm:text-5xl">{String(index + 1).padStart(2, "0")}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {cards.filter((card) => card.rarity === rarity).map((card) => {
                        const key = `${card.rarity}-${card.number}`;
                        const owned = flipped[key];

                        return (
                          <div
                            key={key}
                            className="group relative aspect-[5/7] cursor-pointer overflow-hidden rounded-md border border-white/[0.08] bg-[#050707] shadow-[0_10px_25px_rgba(0,0,0,.42)] transition-all duration-200 md:hover:z-20 md:hover:-translate-y-2 md:hover:border-[#FFD54A]/45 md:hover:shadow-[0_18px_38px_rgba(0,0,0,.58)]"
                            onClick={() => toggleFlip(key)}
                          >
                            <div className={`relative h-full w-full transform-style-preserve-3d transition-all duration-200 ${hoverEffects ? "md:group-hover:rotate-1 md:group-hover:scale-[1.035]" : ""} ${owned && !viewMode ? "rotate-y-180" : ""}`}>
                              <img
                                src={`/cards/${set.folder}/${set.prefix}${card.rarity}${String(card.number).padStart(3, "0")}.webp`}
                                className="absolute inset-0 h-full w-full scale-[1.05] rounded-md object-cover object-center backface-hidden"
                                alt=""
                              />
                              <img
                                src={getCardBack(card.rarity, card.number)}
                                className="absolute inset-0 h-full w-full rounded-md object-cover object-center backface-hidden"
                                style={{ transform: "rotateY(180deg) scale(1.05)" }}
                                alt=""
                              />
                            </div>
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-7">
                              <div className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-white/70">
                                {getRarityCode(card.rarity)}-{String(card.number).padStart(3, "0")}
                              </div>
                            </div>
                            {owned && !viewMode && (
                              <div className="pointer-events-none absolute left-2 top-2 border border-emerald-400/30 bg-[#07100d]/85 px-1.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                                OWNED
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2">
                      <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">M1 / RARITY NODE</span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">{count} CARD SLOTS</span>
                    </div>
                  </section>
                ))}
            </div>
          </main>
        </div>
      </div>

      {zoomedCard && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6" onClick={() => setZoomedCard(null)}>
          <div className="relative flex max-h-[84vh] w-[min(72vw,320px)] flex-col sm:w-[280px]" onClick={(e) => e.stopPropagation()}>
            <div className="relative mb-2 flex h-10 shrink-0 items-center justify-between overflow-hidden border border-[#FFD54A]/25 bg-[#070a0a] px-3 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
              <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-[#FFD54A]/70" />
              <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-[#FFD54A]/40" />
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-[#FFD54A] shadow-[0_0_8px_rgba(255,212,74,.9)]" /><div><div className="font-mono text-[8px] font-black uppercase tracking-[0.25em] text-[#FFD54A]">CARD INSPECTION</div><div className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">FRONT / BACK SYSTEM</div></div></div>
              <button onClick={() => setZoomedCard(null)} className="border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition hover:border-[#FFD54A]/35 hover:text-[#FFD54A]">CLOSE</button>
            </div>

            <TiltCard>
              <div className="relative mx-auto w-full overflow-hidden rounded-md border border-[#FFD54A]/30 bg-[#050707] shadow-[0_22px_60px_rgba(0,0,0,.85)]" onClick={() => setZoomedCardFlipped(!zoomedCardFlipped)}>
                <div className="relative aspect-[5/7] w-full max-h-[66vh] overflow-hidden rounded-md">
                  <div className={`absolute inset-0 transform-style-preserve-3d transition-transform duration-500 ${zoomedCardFlipped ? "rotate-y-180" : ""}`}>
                    <img src={zoomedCard} className="absolute inset-0 h-full w-full scale-[1.05] rounded-md object-cover object-center backface-hidden" alt="" />
                    <img src={zoomedCardBack || ""} className="absolute inset-0 h-full w-full rounded-md object-cover object-center backface-hidden" style={{ transform: "rotateY(180deg) scale(1.05)" }} alt="" />
                  </div>
                </div>
              </div>
            </TiltCard>

            <div className="mt-2 flex shrink-0 items-center justify-between border border-white/[0.06] bg-[#070a0a] px-3 py-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">{zoomedCardFlipped ? "REAR ASSET" : "FRONT ASSET"}</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#FFD54A]/80">TAP CARD TO FLIP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonOne;
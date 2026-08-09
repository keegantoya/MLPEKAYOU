import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";




const setImages: Record<string, string> = {
  "1": "/thumbnails/moononesetimage.webp",
  "5": "/thumbnails/rainbowonesetimage.webp",
  "7": "/thumbnails/funonesetimage.webp",
  "2": "/thumbnails/moontwosetimage.webp",
  "8": "/thumbnails/funtwosetimage.webp",
  "3": "/thumbnails/moonthreesetimage.webp",
  "11": "/thumbnails/funthreesetimage.webp",
  "4": "/thumbnails/staronesetimage.webp",
  "6": "/thumbnails/rainbowtwosetimage.webp",
  "9": "/thumbnails/promossetimage.webp",
};


const sets = [
  {
    id: "9",
    name: "Promotional Cards",
    total: 12,
    rarities: { PR: 12 },
  },
  {
    id: "1",
    name: "Eternal Moon First Edition",
    total: 186,
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
  },
  {
    id: "5",
    name: "Rainbow First Edition",
    total: 146,
    rarities: {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7,
    },
  },
  {
    id: "7",
    name: "Fun Moments First Edition",
    total: 127,
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12,
    },
  },
  {
    id: "2",
    name: "Eternal Moon Second Edition",
    total: 189,
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
  },
  {
    id: "8",
    name: "Fun Moments Second Edition",
    total: 136,
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
    },
  },
  {
    id: "3",
    name: "Eternal Moon Third Edition",
    total: 290,
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      LSR: 32,
      UR: 18,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
  },
  {
    id: "11",
    name: "Fun Moments Three",
    total: 148,
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
      SCR: 12,
    },
  },
  {
    id: "4",
    name: "Star First Edition",
    total: 105,
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
  },
  {
    id: "6",
    name: "Rainbow Second Edition",
    total: 170,
    rarities: {
      BASE: 18,
      R: 30,
      SR: 14,
      ST: 20,
      SSR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      UR: 19,
      USR: 8,
      XR: 8,
    },
  },
];

const releasedRoutes: Record<string, string> = {
  "1": "/moon-one",
  "2": "/moon-two",
  "5": "/rainbow-one",
  "3": "/moon-three",
  "7": "/fun-moments-one",
  "11": "/fun-moments-three",
  "9": "/promotional-cards",
  "8": "/fun-moments-two",
  "4": "/star-one",
  "6": "/rainbow-two",
};

const MyProgress = () => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async (userOverride?: any) => {
      let user = userOverride;

      if (!user) {
        const { data } = await supabase.auth.getUser();
        user = data.user;
      }

      if (!user) {
        setProgress({});
        return;
      }

      const { data: collectionData } = await supabase
        .from("collection_progress")
        .select("set_id, progress")
        .eq("user_id", user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .single();

      const legacyHidden = profile?.iso_hidden_sets || [];

      const hiddenCCG =
        profile?.iso_hidden_sets?.length
          ? profile.iso_hidden_sets
          : legacyHidden;

      setHiddenSets(hiddenCCG);

      const progressMap = new Map(
        collectionData?.map((row) => [String(row.set_id), row]) || []
      );

      const newProgress: Record<string, number> = {};

      sets.forEach((set) => {
        const found = progressMap.get(set.id);

        if (!found?.progress || !set.rarities) {
          newProgress[set.id] = 0;
          return;
        }

        let owned = 0;

        Object.entries(found.progress).forEach(([key, value]) => {
          if (value) owned++;
        });

        newProgress[set.id] = owned;
      });

      setProgress(newProgress);
    };

    loadProgress();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProgress(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mainSets = sets.filter((s) =>
    ["1", "5", "7", "2", "3", "8", "11"].includes(s.id)
  );

  const promoSets = sets.filter((s) => ["9"].includes(s.id));

  const visibleSets = sets.filter(
    (set) =>
      !hiddenSets.includes(set.id) &&
      !!releasedRoutes[set.id]
  );

  const totalVisibleCards = visibleSets.reduce(
    (sum, set) => sum + set.total,
    0
  );

  const totalOwnedVisibleCards = visibleSets.reduce(
    (sum, set) => sum + (progress[set.id] || 0),
    0
  );

  const masteredVisibleSets = visibleSets.filter(
    (set) =>
      set.total > 0 &&
      (progress[set.id] || 0) === set.total
  ).length;

  const overallVisiblePercent =
    totalVisibleCards > 0
      ? Math.round((totalOwnedVisibleCards / totalVisibleCards) * 100)
      : 0;

  const activeSets = sets.filter(
    (set) =>
      [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "11",
        "9",
      ].includes(set.id) &&
      releasedRoutes[set.id] &&
      !hiddenSets.includes(set.id) &&
      (progress[set.id] || 0) < set.total
  );

  const masteredSets = sets.filter((set) => {
    const owned = progress[set.id] || 0;

    return (
      set.total > 0 &&
      owned === set.total &&
      !hiddenSets.includes(set.id)
    );
  });

  const renderSectionHeader = (
    eyebrow: string,
    title: string,
    count?: number
  ) => (
    <div className="mx-auto mb-6 mt-12 max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="h-6 w-1 bg-[#FFD400] shadow-[0_0_10px_rgba(255,212,0,.3)]" />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.24em] text-[#FFD400]/50">
              {eyebrow}
            </span>

            <span className="h-px w-8 bg-[#FFD400]/20" />
          </div>

          <div className="flex items-center gap-3">
            <h2 className="font-['Oxanium'] text-lg font-bold uppercase tracking-[0.12em] text-white sm:text-xl">
              {title}
            </h2>

            {typeof count === "number" && (
              <span className="border border-white/[0.08] bg-[#111111] px-2 py-0.5 font-mono text-[7px] font-bold text-[#FFD400]/70">
                {String(count).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        <div className="hidden h-px flex-1 bg-gradient-to-r from-[#FFD400]/20 to-transparent sm:block" />
      </div>
    </div>
  );

  const renderSetCard = (set: any) => {
    const owned = progress[set.id] || 0;

    const percent =
      set.total > 0
        ? Math.min(100, Math.round((owned / set.total) * 100))
        : 0;

    const isMastered = percent === 100;
    const isHidden = hiddenSets.includes(set.id);
    const route = releasedRoutes[set.id];
    const image = setImages[set.id];

    return (
      <button
        key={set.id}
        onClick={() => route && navigate(route)}
        disabled={!route}
        className="
          group
          relative
          flex
          min-w-0
          flex-col
          overflow-hidden
          border
          border-white/[0.08]
          bg-[#111111]
          text-left
          shadow-[0_14px_35px_rgba(0,0,0,.32)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-[#FFD400]/45
          hover:shadow-[0_18px_42px_rgba(0,0,0,.45)]
          disabled:cursor-default
          disabled:hover:translate-y-0
        "
      >
        {/* TOP STATUS STRIP */}
        <div className="flex h-6 items-center justify-between border-b border-white/[0.06] bg-[#0b0b0b] px-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 ${
                isMastered
                  ? "bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.8)]"
                  : "bg-white/20"
              }`}
            />
          </div>

          <span className="font-mono text-[5px] uppercase tracking-[0.15em] text-white/15">
            {set.total} CARDS
          </span>
        </div>

        {/* ARTWORK */}
        <div className="relative h-40 overflow-hidden bg-[#181818] sm:h-44">
          {image ? (
            <img
              src={image}
              alt={set.name}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.06]
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#151515]">
              <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-white/20">
                IMAGE UNAVAILABLE
              </span>
            </div>
          )}

          {/* Artwork overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/10" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FFD400]/0 to-transparent transition-all duration-300 group-hover:via-[#FFD400]/65" />

          {/* Corner brackets */}
          <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-[#FFD400]/50 transition-colors group-hover:border-[#FFD400]" />
          <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-white/20 transition-colors group-hover:border-[#FFD400]/60" />

          {/* Mastered */}
          {isMastered && (
            <div className="absolute left-2 bottom-2 flex items-center gap-1.5 border border-[#FFD400]/50 bg-[#111111]/90 px-2 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_7px_rgba(255,212,0,.8)]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#FFD400]">
                MASTERED
              </span>
            </div>
          )}

          {/* Hidden */}
          {isHidden && (
            <div className="absolute left-2 bottom-2 border border-white/15 bg-[#111111]/90 px-2 py-1 backdrop-blur-sm">
              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-white/45">
                HIDDEN
              </span>
            </div>
          )}
        </div>

        {/* CARD CONTENT */}
        <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
          {/* Small title identifier */}
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-4 bg-[#FFD400]/50" />

            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-[#FFD400]/55">
              COLLECTION
            </span>
          </div>

          <h3 className="min-h-[2.5rem] font-['Oxanium'] text-sm font-bold uppercase leading-tight tracking-[0.02em] text-white transition-colors duration-300 group-hover:text-[#f5d37a] sm:text-base">
            {set.name}
          </h3>

          {/* Percentage + counts */}
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <div className="font-['Oxanium'] text-xl font-black leading-none text-[#FFD400]">
                {percent}%
              </div>

              <div className="mt-1 font-mono text-[5px] uppercase tracking-[0.16em] text-white/20">
                COMPLETE
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-[8px] font-bold tracking-[0.04em] text-white/55">
                {owned}
                <span className="text-white/20"> / </span>
                {set.total}
              </div>

              <div className="mt-1 font-mono text-[5px] uppercase tracking-[0.14em] text-white/15">
                CARDS
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="relative h-1 overflow-hidden bg-white/[0.07]">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8f6d18] via-[#FFD400] to-[#f5d37a] shadow-[0_0_8px_rgba(255,212,0,.25)] transition-all duration-500"
                style={{
                  width: `${percent}%`,
                }}
              />

              <div className="pointer-events-none absolute inset-0 flex justify-between opacity-40">
                {Array.from({ length: 7 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-full w-px bg-[#111111]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom status */}
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2">
            <span className="font-mono text-[5px] uppercase tracking-[0.15em] text-white/15">
              {percent === 100 ? "COLLECTION COMPLETE" : "COLLECTION ACTIVE"}
            </span>

            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.12em] text-white/20 transition-colors group-hover:text-[#FFD400]/60">
              OPEN →
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#0b0b0b] text-white"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,212,0,.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,212,0,.018) 1px, transparent 1px),
          radial-gradient(circle at 50% 0%, rgba(212,175,55,.07), transparent 32%)
        `,
        backgroundSize: "42px 42px, 42px 42px, auto",
      }}
    >
      <div className="container flex-1 py-6 sm:py-8">
{/* ========================================================= */}
{/* HERO                                                      */}
{/* ========================================================= */}

<div className="mx-auto max-w-7xl">
  <div className="relative overflow-hidden border border-white/[0.08] bg-[#101212] shadow-[0_18px_50px_rgba(0,0,0,.35)]">

    {/* Subtle technical background */}
    <div
      className="pointer-events-none absolute inset-0 opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,212,0,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,212,0,.035) 1px, transparent 1px)
        `,
        backgroundSize: "34px 34px",
      }}
    />

    {/* Ambient gold glow */}
    <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[26rem] -translate-x-1/2 bg-[#FFD400]/[0.045] blur-[90px]" />

    {/* Technical corners */}
    <div className="pointer-events-none absolute left-0 top-0 z-20 h-7 w-7 border-l border-t border-[#FFD400]/65" />
    <div className="pointer-events-none absolute right-0 top-0 z-20 h-7 w-7 border-r border-t border-[#FFD400]/30" />
    <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-7 w-7 border-b border-l border-[#FFD400]/20" />
    <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-7 w-7 border-b border-r border-[#FFD400]/40" />

    {/* System bar */}
    <div className="relative flex items-center justify-between border-b border-white/[0.06] bg-[#0c0e0e] px-4 py-2 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.75)]" />

        <span className="font-mono text-[6px] font-bold uppercase tracking-[0.24em] text-white/25">
          MLPEKAYOU // COLLECTION SYSTEM
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-1 w-1 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.7)]" />

        <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-emerald-400/50">
          ONLINE
        </span>
      </div>
    </div>

    {/* Main hero */}
    <div className="relative px-4 py-5 sm:px-7 sm:py-6">

      {/* Title */}
      <div className="flex flex-col items-center">

        <div className="mb-2 flex items-center gap-3">
          <span className="h-px w-6 bg-[#FFD400]/30 sm:w-10" />

          <span className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-[#FFD400]/55">
            COLLECTION STATUS
          </span>

          <span className="h-px w-6 bg-[#FFD400]/30 sm:w-10" />
        </div>

        <h1 className="font-['Oxanium'] text-2xl font-black uppercase tracking-[0.1em] text-[#f5d37a] sm:text-4xl">
          CCG Progress
        </h1>

        <div className="mt-2 h-px w-12 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.65)]" />

        <p className="mt-2 font-mono text-[6px] uppercase tracking-[0.18em] text-white/20">
          Card acquisition status // Collection monitoring
        </p>
      </div>

      {/* Stats + progress */}
      <div className="mx-auto mt-5 flex max-w-4xl flex-col gap-3 sm:mt-6 sm:grid sm:grid-cols-[1fr_1.3fr]">

        {/* Stats */}
        <div className="grid grid-cols-3 border border-white/[0.07] bg-[#0c0e0e]">

          <div className="px-2 py-3 text-center">
            <div className="font-['Oxanium'] text-xl font-black leading-none text-[#FFD400] sm:text-2xl">
              {visibleSets.length}
            </div>

            <div className="mt-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-white/25">
              Active Sets
            </div>
          </div>

          <div className="border-x border-white/[0.06] px-2 py-3 text-center">
            <div className="font-['Oxanium'] text-xl font-black leading-none text-[#FFD400] sm:text-2xl">
              {masteredVisibleSets}
            </div>

            <div className="mt-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-white/25">
              Mastered
            </div>
          </div>

          <div className="px-2 py-3 text-center">
            <div className="font-['Oxanium'] text-xl font-black leading-none text-[#FFD400] sm:text-2xl">
              {overallVisiblePercent}%
            </div>

            <div className="mt-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-white/25">
              Overall
            </div>
          </div>

        </div>

        {/* Progress module */}
        <div className="border border-white/[0.07] bg-[#0c0e0e] px-4 py-3">

          <div className="flex items-center justify-between">
            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-white/20">
              TOTAL COLLECTION
            </span>

            <span className="font-mono text-[7px] font-bold tracking-[0.08em] text-[#FFD400]/70">
              {totalOwnedVisibleCards} / {totalVisibleCards}
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden bg-white/[0.07]">
            <div
              className="h-full bg-gradient-to-r from-[#806016] via-[#FFD400] to-[#f5d37a] shadow-[0_0_10px_rgba(255,212,0,.3)] transition-all duration-700"
              style={{
                width: `${overallVisiblePercent}%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[5px] uppercase tracking-[0.14em] text-white/15">
              ACQUIRED
            </span>

            <span className="font-mono text-[5px] uppercase tracking-[0.14em] text-white/15">
              {overallVisiblePercent}% COMPLETE
            </span>
          </div>

        </div>
      </div>
    </div>

    {/* Bottom system strip */}
    <div className="relative flex items-center gap-2 border-t border-white/[0.05] bg-[#0c0e0e] px-4 py-2">
      <span className="h-1 w-1 bg-[#FFD400] shadow-[0_0_6px_#FFD400]" />

      <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-white/15">
        COLLECTION DATABASE // ACTIVE
      </span>

      <span className="ml-auto font-mono text-[5px] uppercase tracking-[0.18em] text-white/10">
        MLPEKAYOU
      </span>
    </div>

  </div>
</div>

        {/* ========================================================= */}
        {/* ACTIVE COLLECTIONS                                       */}
        {/* ========================================================= */}

        {renderSectionHeader(
          "01 // ACTIVE COLLECTIONS",
          "Current Progress",
          activeSets.length
        )}

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {activeSets.map(renderSetCard)}
        </div>

        {/* ========================================================= */}
        {/* PROMOTIONAL COLLECTION                                   */}
        {/* ========================================================= */}

        {promoSets
          .filter(
            (set) =>
              releasedRoutes[set.id] &&
              !hiddenSets.includes(set.id) &&
              (progress[set.id] || 0) < set.total
          )
          .map(renderSetCard).length > 0 && (
          <>
            {renderSectionHeader(
              "02 // SPECIAL RELEASES",
              "Promotional Cards",
              promoSets.length
            )}

            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {promoSets
                .filter(
                  (set) =>
                    releasedRoutes[set.id] &&
                    !hiddenSets.includes(set.id) &&
                    (progress[set.id] || 0) < set.total
                )
                .map(renderSetCard)}
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* MASTERED COLLECTION                                     */}
        {/* ========================================================= */}

        <div className="mx-auto mt-14 max-w-7xl pb-24 sm:mt-20">
          <div className="relative overflow-hidden border border-[#FFD400]/15 bg-[#111111]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0d] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="h-5 w-1 bg-[#FFD400] shadow-[0_0_9px_rgba(255,212,0,.35)]" />

                <div>
                  <div className="font-mono text-[5px] font-bold uppercase tracking-[0.22em] text-[#FFD400]/50">
                    03 // COMPLETION ARCHIVE
                  </div>

                  <h2 className="mt-0.5 font-['Oxanium'] text-base font-bold uppercase tracking-[0.1em] text-white sm:text-lg">
                    Mastered Collection
                  </h2>
                </div>
              </div>

              <div className="border border-[#FFD400]/20 bg-[#181818] px-2.5 py-1">
                <span className="font-mono text-[7px] font-bold text-[#FFD400]">
                  {masteredSets.length}
                </span>
              </div>
            </div>

            {/* Completion banner */}
            {masteredSets.length > 0 && (
              <div className="relative border-b border-white/[0.05] bg-gradient-to-r from-[#151515] via-[#191919] to-[#151515] px-4 py-4 sm:px-5">
                <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-[#FFD400]/[0.025] blur-2xl" />

                <div className="relative flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#FFD400]/35 bg-[#FFD400]/[0.06]">
                    <span className="text-sm text-[#FFD400]">✓</span>
                  </div>

                  <div className="min-w-0">
                    <div className="font-['Oxanium'] text-xs font-bold uppercase tracking-[0.12em] text-[#FFD400]">
                      Collection milestone reached
                    </div>

                    <div className="mt-0.5 font-mono text-[5px] uppercase tracking-[0.14em] text-white/20">
                      {masteredSets.length} collection
                      {masteredSets.length === 1 ? "" : "s"} fully completed
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mastered cards */}
            <div className="grid grid-cols-2 gap-px bg-white/[0.04] md:grid-cols-3 xl:grid-cols-5">
              {masteredSets.map((set) => {
                const image =
                  set.id === "9"
                  ? "/thumbnails/promossetimage.webp"
                  : setImages[set.id];

                return (
                  <button
                    key={set.id}
                    onClick={() =>
                      releasedRoutes[set.id] &&
                      navigate(releasedRoutes[set.id])
                    }
                    className="
                      group
                      relative
                      overflow-hidden
                      bg-[#111111]
                      p-3
                      text-left
                      transition-all
                      duration-300
                      hover:bg-[#171717]
                    "
                  >
                    {/* Artwork */}
                    <div className="relative flex h-32 items-center justify-center overflow-hidden border border-white/[0.07] bg-[#181818] sm:h-40">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FFD400]/[0.04] via-transparent to-transparent" />

                      <img
                        src={image}
                        alt={set.name}
                        className="relative h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l border-t border-[#FFD400]/40" />
                      <div className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 border-r border-t border-[#FFD400]/20" />
                      <div className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b border-l border-[#FFD400]/15" />
                      <div className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r border-[#FFD400]/30" />

                      <div className="absolute right-1.5 top-1.5 border border-[#FFD400]/25 bg-[#111111]/85 px-1.5 py-1">
                        <span className="font-mono text-[5px] font-bold tracking-[0.12em] text-[#FFD400]">
                          100%
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="mt-3 flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[#FFD400] shadow-[0_0_7px_rgba(255,212,0,.7)]" />

                      <div className="min-w-0">
                        <h3 className="font-['Oxanium'] text-[10px] font-bold uppercase leading-tight tracking-[0.04em] text-white transition-colors group-hover:text-[#f5d37a] sm:text-xs">
                          {set.name}
                        </h3>

                        <div className="mt-1 font-mono text-[5px] uppercase tracking-[0.12em] text-white/15">
                          COMPLETE // {set.total} CARDS
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {masteredSets.length === 0 && (
                <div className="col-span-full px-6 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-white/[0.08] bg-[#181818]">
                    <span className="font-mono text-xs text-white/20">
                      —
                    </span>
                  </div>

                  <div className="font-['Oxanium'] text-xs font-bold uppercase tracking-[0.15em] text-white/30">
                    No Mastered Sets Yet
                  </div>

                  <div className="mt-1 font-mono text-[5px] uppercase tracking-[0.14em] text-white/15">
                    Complete a collection to archive it here
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgress;
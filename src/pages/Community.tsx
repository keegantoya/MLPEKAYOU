import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "./Everypony/profile-assets";
import elementOfMagic from "/website-assets/elementofmagic.webp";
import elementOfLoyalty from "/website-assets/elementofloyalty.webp";
import elementOfKindness from "/website-assets/elementofkindness.webp";
import elementOfGenerosity from "/website-assets/elementofgenerosity.webp";
import elementOfHonesty from "/website-assets/elementofhonesty.webp";

const sets = [
  { id: "1", name: "Eternal Moon First Edition", total: 186 },
  { id: "5", name: "Eternal Rainbow First Edition", total: 146 },
  { id: "7", name: "Fun Moments First Edition", total: 127 },
  { id: "2", name: "Eternal Moon Second Edition", total: 189 },
  { id: "8", name: "Fun Moments Second Edition", total: 136 },
  { id: "3", name: "Eternal Moon Third Edition", total: 290 },
  { id: "11", name: "Fun Moments Third Edition", total: 148 },
  { id: "4", name: "Star First Edition", total: 105 },
  { id: "6", name: "Eternal Rainbow Second Edition", total: 170 },

  {
    id: "friendshipsbegin",
    dbId: "SD",
    name: "Friendships Begin",
    total: 194,
  },

  {
    id: "fantasywonderland",
    dbId: "FW",
    name: "Fantasy Wonderland",
    total: 191,
    folder: "fantasywonderland",
    prefix: "BP01",
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
      PSPR: 11,
      PGR: 6,
      PCR: 12,
      PRR: 6,
    },
  },

  {
    id: "discord",
    dbId: "12",
    name: "Discord",
    total: 191,
  },
];

const manualFirstFinishers: Record<
  string,
  {
    id: string;
  }
> = {
  "1": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },

  "2": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },

  "3": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },

  "5": {
    id: "17e57e39-bc0c-44e7-b373-ac34c6690185",
  },

  "6": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },

  "7": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },

  "8": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },

  "11": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },

  friendshipsbegin: {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },

  fantasywonderland: {
    id: "948dcf0c-0ec3-4123-8b8e-f23ad334fb30",
  },
};

type Category =
  | "star"
  | "ccg"
  | "rainbow"
  | "funmoments"
  | "tcg";

const Community = () => {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] =
    useState<Category>("ccg");

  const [firstFinishers, setFirstFinishers] =
    useState<any>({});

  const [topCollector, setTopCollector] =
    useState<any>(null);

  useEffect(() => {
    async function loadProfiles() {
      const ids = [
        ...new Set([
          ...Object.values(manualFirstFinishers).map(
            (x) => x.id
          ),
          "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
        ]),
      ];

      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", ids);

      const profileMap = Object.fromEntries(
        (data ?? []).map((p) => [p.id, p])
      );

      const finishers: any = {};

      for (const [setId, value] of Object.entries(
        manualFirstFinishers
      )) {
        finishers[setId] = profileMap[value.id];
      }

      setFirstFinishers(finishers);

      setTopCollector(
        profileMap[
          "2692c7a3-bce3-45b7-8636-5e18bf39edc3"
        ]
      );
    }

    loadProfiles();
  }, []);

  const categoryConfig: Record<
    Category,
    {
      label: string;
      description: string;
      icon: string;
    }
  > = {
    star: {
      label: "STAR",
      description: "Star Edition",
      icon: elementOfMagic,
    },

    ccg: {
      label: "MOON",
      description: "Eternal Moon",
      icon: elementOfKindness,
    },

    rainbow: {
      label: "RAINBOW",
      description: "Eternal Rainbow",
      icon: elementOfLoyalty,
    },

    funmoments: {
      label: "FUN MOMENTS",
      description: "Fun Moments",
      icon: elementOfGenerosity,
    },

    tcg: {
      label: "TCG",
      description: "Trading Card Game",
      icon: elementOfHonesty,
    },
  };

  const activeConfig = categoryConfig[activeCategory];

  const visibleSets =
    activeCategory === "tcg"
      ? sets.filter((set) =>
          [
            "fantasywonderland",
            "discord",
            "friendshipsbegin",
          ].includes(set.id)
        )
      : sets.filter((set) => {
          if (activeCategory === "star") {
            return ["4"].includes(set.id);
          }

          if (activeCategory === "ccg") {
            return ["1", "2", "3"].includes(set.id);
          }

          if (activeCategory === "rainbow") {
            return ["5", "6"].includes(set.id);
          }

          if (activeCategory === "funmoments") {
            return ["7", "8", "11"].includes(set.id);
          }

          return false;
        });

  const CategoryButton = ({
    category,
  }: {
    category: Category;
  }) => {
    const config = categoryConfig[category];
    const active = activeCategory === category;

    return (
      <button
        onClick={() => setActiveCategory(category)}
        className={`
          group relative flex w-full items-center justify-between
          overflow-hidden border
          px-3.5 py-3
          text-left
          transition-all duration-200
          ${
            active
              ? "border-[#FFD43B]/80 bg-[#252525] text-[#FFD43B] shadow-[inset_3px_0_0_#FFD43B,0_0_20px_rgba(255,212,59,0.08)]"
              : "border-[#303030] bg-[#171717] text-[#777] hover:border-[#555] hover:bg-[#1d1d1d] hover:text-white"
          }
        `}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`
              flex h-8 w-8 shrink-0 items-center justify-center
              border
              ${
                active
                  ? "border-[#FFD43B]/50 bg-[#FFD43B]/10"
                  : "border-[#333] bg-[#202020]"
              }
            `}
          >
            <img
              src={config.icon}
              alt=""
              className={`
                h-5 w-5 object-contain
                transition-all duration-200
                ${
                  active
                    ? "brightness-110"
                    : "opacity-55 grayscale-[20%]"
                }
              `}
            />
          </span>

          <span className="min-w-0">
            <span
              className={`
                block font-['Oxanium'] text-[11px] font-bold
                uppercase tracking-[0.12em]
                ${
                  active
                    ? "text-[#FFD43B]"
                    : "text-white/75"
                }
              `}
            >
              {config.label}
            </span>

            <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.16em] text-white/55">
              {config.description}
            </span>
          </span>
        </span>

        <span
          className={`
            font-mono text-sm transition-all duration-200
            ${
              active
                ? "translate-x-0 text-[#FFD43B]"
                : "-translate-x-1 text-[#444] group-hover:text-[#888]"
            }
          `}
        >
          →
        </span>
      </button>
    );
  };

  const LeaderboardCard = ({
    set,
  }: {
    set: (typeof sets)[number];
  }) => {
    const winner = firstFinishers[String(set.id)];
    const setCode =
      "dbId" in set && set.dbId
        ? set.dbId
        : String(set.id).padStart(2, "0");

    return (
      <button
        key={set.id}
        onClick={() =>
          navigate(`/community/${set.id}`)
        }
        className="
          group relative min-h-[178px]
          overflow-hidden
          border border-[#303030]
          bg-gradient-to-br
          from-[#242424]
          via-[#191919]
          to-[#111111]
          px-5 py-5
          text-left
          transition-all duration-300
          hover:-translate-y-0.5
          hover:border-[#FFD43B]/60
          hover:shadow-[0_14px_40px_rgba(0,0,0,.45)]
        "
      >
        {/* Technical corner brackets */}
        <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t border-[#FFD43B]/45 transition-all duration-300 group-hover:h-7 group-hover:w-7 group-hover:border-[#FFD43B]/80" />

        <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r border-t border-[#FFD43B]/30 transition-all duration-300 group-hover:h-7 group-hover:w-7 group-hover:border-[#FFD43B]/60" />

        <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-[#FFD43B]/20" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-[#FFD43B]/20" />

        {/* Top technical strip */}
        <div className="absolute left-5 right-5 top-0 flex h-5 items-center justify-between">
        </div>

        {/* Soft gold light */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#FFD43B]/[0.035] blur-2xl transition-all duration-500 group-hover:bg-[#FFD43B]/[0.07]" />

        {/* Set title */}
        <div className="relative z-10 pr-24 pt-2">
          <h2 className="font-['Oxanium'] text-[17px] font-bold uppercase leading-tight tracking-[0.025em] text-white transition-colors duration-300 group-hover:text-[#FFD43B]">
            {set.name}
          </h2>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[#FFD43B]/55" />

            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#FFD43B]/90">
              {activeCategory === "tcg"
                ? "TOP COLLECTOR"
                : "SET LEADERBOARD"}
            </span>
          </div>
        </div>

        {/* Winner */}
        <div className="absolute right-4 top-8 flex w-[76px] flex-col items-center">
          {winner ? (
            <>
              <div className="relative">
                <div className="absolute -inset-1 border border-[#FFD43B]/20" />

                <img
                  src={getProfileAssets(winner).avatar}
                  alt={winner.username}
                  className="
                    relative h-14 w-14
                    object-cover
                    border-2 border-[#FFD43B]/80
                    shadow-[0_0_18px_rgba(255,212,59,.15)]
                  "
                />

                <div className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border border-[#111] bg-[#FFD43B] px-1 font-mono text-[7px] font-black text-[#111] shadow-[0_2px_8px_rgba(0,0,0,.5)]">
                  #1
                </div>
              </div>

              <span className="mt-2 max-w-[76px] truncate font-['Oxanium'] text-[8px] font-semibold uppercase tracking-[0.04em] text-white/75">
                {winner.username}
              </span>

              <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD43B]/80">
                FIRST FINISHER
              </span>
            </>
) : (
  <>
    {/* OPEN #1 SLOT */}
    <div className="relative flex h-14 w-14 items-center justify-center border border-[#FFD43B]/30 bg-[#151515] shadow-[0_0_18px_rgba(255,212,59,0.05)]">
      
      {/* Technical corner marks */}
      <div className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#FFD43B]/70" />
      <div className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-[#FFD43B]/40" />
      <div className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-[#FFD43B]/40" />
      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#FFD43B]/70" />

      {/* Target / claim indicator */}
      <div className="absolute inset-2 border border-[#FFD43B]/10" />

      <span className="font-['Oxanium'] text-[13px] font-black tracking-[0.08em] text-[#FFD43B]/80">
        #1
      </span>

      {/* Tiny scan line */}
      <div className="absolute left-2 right-2 top-1/2 h-px bg-[#FFD43B]/10" />
    </div>

    <span className="mt-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#FFD43B]/85">
      UNCLAIMED
    </span>

    <span className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.14em] text-white/55">
      BE FIRST
    </span>
  </>
)}
        </div>

        {/* Bottom readout */}
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between border-t border-[#292929] pt-3">
          <div>
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/55">
              CARD COUNT
            </div>

            <div className="mt-0.5 font-['Oxanium'] text-[10px] font-bold tracking-[0.08em] text-white/55">
              {set.total}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[6px] uppercase tracking-[0.18em] text-white/20">
              OPEN
            </span>

            <span className="font-mono text-xs text-[#FFD43B]/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#FFD43B]">
              →
            </span>
          </div>
        </div>

        {/* Hover edge */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-[#FFD43B] transition-all duration-300 group-hover:w-1/3" />
      </button>
    );
  };

  const ChampionPanel = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => (
    <div
      className={`
        relative overflow-hidden
        border border-[#353535]
        bg-gradient-to-b
        from-[#202020]
        via-[#161616]
        to-[#0f0f0f]
        shadow-[0_18px_45px_rgba(0,0,0,.4)]
        ${mobile ? "w-full" : "w-[270px]"}
      `}
    >
      {/* Gold top rail */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD43B] to-transparent" />

      {/* Background technical lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#FFD43B 1px, transparent 1px), linear-gradient(90deg, #FFD43B 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Header */}
      <div className="relative border-b border-[#2d2d2d] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#FFD43B]">
            CHAMPION
          </span>

          <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD43B] shadow-[0_0_7px_rgba(255,212,59,.7)]" />
            VERIFIED - TOP SUPPORTER
          </span>
        </div>

        <h2 className="mt-2 font-['Oxanium'] text-[18px] font-black uppercase tracking-[0.05em] text-white">
          TOP MASTERSETTER
        </h2>
      </div>

      {/* Champion */}
      <div className="relative px-5 py-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="relative h-20 w-20">
              <div className="absolute -inset-1 border border-[#FFD43B]/20" />

              <img
                src={getProfileAssets(topCollector).avatar}
                alt="Top Collector Avatar"
                className="
                  relative
                  h-20 w-20
                  object-cover
                  border-2 border-[#FFD43B]
                  shadow-[0_0_22px_rgba(255,212,59,.18)]
                "
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#FFD43B]/80">
              CURRENT CHAMPION
            </div>

            <div className="mt-1 flex min-w-0 items-center gap-1.5">
              <span className="truncate font-['Oxanium'] text-[15px] font-bold uppercase tracking-[0.02em] text-white">
                {topCollector?.username || "Loading..."}
              </span>

              {getProfileAssets(topCollector).verification && (
                <img
                  src={
                    getProfileAssets(topCollector)
                      .verification!.badge
                  }
                  alt={
                    getProfileAssets(topCollector)
                      .verification!.label
                  }
                  title={
                    getProfileAssets(topCollector)
                      .verification!.label
                  }
                  className="h-4 w-4 shrink-0"
                />
              )}
            </div>

            <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-white/60">
              MASTERSETTER CHAMPION
            </div>
          </div>
        </div>

        {/* Champion status */}
        <div className="mt-6 grid grid-cols-2 gap-2">
        </div>

        <div className="mt-4 border-t border-[#2d2d2d] pt-3">
          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#FFD43B]/80">
            MARI IS A TOP SUPPORTED OF MLPEKAYOU AND A PILLAR TO THE COMMUNITY.
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden font-['Oxanium'] text-white"
      style={{
        background: `
          radial-gradient(circle at 10% 0%, rgba(255,212,59,0.055), transparent 28%),
          radial-gradient(circle at 90% 30%, rgba(255,212,59,0.025), transparent 30%),
          linear-gradient(180deg, #181818 0%, #111111 45%, #0b0b0b 100%)
        `,
      }}
    >
      {/* Subtle technical background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#FFD43B 1px, transparent 1px), linear-gradient(90deg, #FFD43B 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* MOBILE CHAMPION */}
        <div className="mb-6 xl:hidden">
          <ChampionPanel mobile />
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)_270px]">
          {/* CATEGORY CONTROL */}
          <aside className="xl:sticky xl:top-5">
            <div className="border border-[#303030] bg-[#151515]">
              {/* Sidebar header */}
              <div className="border-b border-[#2c2c2c] px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#FFD43B]">
                    CATEGORIES OF SETS
                  </span>

                  <span className="font-mono text-[8px] text-white/55">
                    05
                  </span>
                </div>

                <p className="mt-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.1em] text-white/60">
                  Select a category to find leaderboards for those sets.
                </p>
              </div>

              {/* Category buttons */}
              <div className="space-y-1 p-2">
                <CategoryButton category="star" />
                <CategoryButton category="ccg" />
                <CategoryButton category="rainbow" />
                <CategoryButton category="funmoments" />
                <CategoryButton category="tcg" />
              </div>

              {/* Eligibility */}
              <div className="border-t border-[#2c2c2c] px-4 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-px w-4 bg-[#FFD43B]/45" />

                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#FFD43B]/85">
                    ACCESS REQUIREMENTS
                  </span>
                </div>

                <p className="font-mono text-[8px] uppercase leading-[1.7] tracking-[0.08em] text-white/60">
                  You must have a Discord username attached to your account to appear on any leaderboards, and you must
                  be present in the MLPEKAYOU Discord server to claim any first finisher positions. You will be required
                  to show proof that your entire collection is both completed and only English.
                </p>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="min-w-0">
            {/* SECTION HEADER */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-[#FFD43B]/40 to-transparent" />

                <div className="flex items-center gap-2 border border-[#3a3a3a] bg-[#181818] px-3 py-2">
                  <img
                    src={activeConfig.icon}
                    alt=""
                    className="h-4 w-4 object-contain"
                  />

                  <span className="font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD43B]">
                    {activeConfig.label}
                  </span>
                </div>

                <span className="h-px flex-1 bg-gradient-to-l from-[#FFD43B]/40 to-transparent" />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/55">
                    ACTIVE CHANNEL
                  </div>

                  <div className="mt-1 font-['Oxanium'] text-sm font-bold uppercase tracking-[0.05em] text-white/75">
                    {activeConfig.description}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/55">
                    SETS
                  </div>

                  <div className="mt-1 font-['Oxanium'] text-sm font-bold text-[#FFD43B]">
                    {visibleSets.length
                      .toString()
                      .padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>

            {/* SET GRID */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {visibleSets.map((set) => (
                <LeaderboardCard
                  key={set.id}
                  set={set}
                />
              ))}
            </div>

            {/* BOTTOM SYSTEM READOUT */}
            <div className="mt-6 flex items-center justify-between border-t border-[#292929] pt-3">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 bg-[#FFD43B]/60" />

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/55">
                  COMMUNITY DATABASE
                </span>
              </div>

              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
                MLPEKAYOU // {activeConfig.label}
              </span>
            </div>
          </main>

          {/* DESKTOP CHAMPION */}
          <aside className="hidden xl:block xl:sticky xl:top-5">
            <ChampionPanel />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Community;
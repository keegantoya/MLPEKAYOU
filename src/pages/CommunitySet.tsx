import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Trophy, Users, ChevronDown, ChevronUp } from "lucide-react";
import { getProfileAssets } from "./Everypony/profile-assets";

const sets: Record<string, { name: string; total: number }> = {
  "1": { name: "Eternal Moon First Edition", total: 186 },
  "2": { name: "Eternal Moon Second Edition", total: 189 },
  "3": { name: "Eternal Moon Third Edition", total: 290 },
  "4": { name: "Star First Edition", total: 105 },
  "5": { name: "Rainbow First Edition", total: 146 },
  "6": { name: "Rainbow Second Edition", total: 170 },
  "7": { name: "Fun Moments First Edition", total: 127 },
  "8": { name: "Fun Moments Second Edition", total: 136 },
  "11": { name: "Fun Moments Third Edition", total: 148 },
  friendshipsbegin: { name: "Friendships Begin", total: 194 },
  fantasywonderland: { name: "Fantasy Wonderland", total: 191 },
  discord: { name: "Discord", total: 191 },
};

const isoSets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
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
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
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
    id: "4",
    name: "Star: First Edition",
    folder: "star-one",
    prefix: "S1",
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
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
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
    id: "6",
    name: "Rainbow: Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: {
      BASE: 18,
      R: 30,
      SR: 14,
      FR: 18,
      TR: 12,
      TGR: 8,
      ST: 20,
      SSR: 15,
      UR: 19,
      USR: 8,
      XR: 8,
    },
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
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
    id: "8",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
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
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
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
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
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
    id: "friendshipsbegin",
    name: "Friendships Begin",
    folder: "friendshipsbegin",
    prefix: "SD01",
    rarities: {},
  },
  {
    id: "fantasywonderland",
    name: "Fantasy Wonderland",
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
    name: "Discord",
    folder: "discord",
    prefix: "BP02",
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
];

const forcedStillCollecting = [""];

const manualPlacements: Record<string, string[]> = {
  "2": ["Jacob", "Mari", "Silly Pony", "Keegan (Owner)"],
  "8": ["Mari", "Keegan", "Jacob"],
};

const CommunitySet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [showAllFinishers, setShowAllFinishers] = useState(false);

  const set = id ? sets[id] : undefined;

  useEffect(() => {
    if (!id || !set) return;

    const load = async () => {
      const { data: progress } = await supabase
        .from("collection_progress_raw")
        .select("user_id, progress, updated_at")
        .eq(
          "set_id",
          id === "friendshipsbegin"
            ? "SD"
            : id === "fantasywonderland"
              ? "FW"
              : id === "discord"
                ? "12"
                : id
        );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");

      const { data: tradingProfiles } = await supabase
        .from("trading_profiles")
        .select("user_id, discord_username");

      const eligibleUserIds = new Set(
        (tradingProfiles || [])
          .filter(
            (p: any) =>
              p.discord_username &&
              p.discord_username.trim() !== ""
          )
          .map((p: any) => p.user_id)
      );

      /*
       * Load the same centralized exclusion list used by
       * the leaderboard.
       */

      const { data: excludedUsers, error: exclusionsError } =
        await supabase
          .from("leaderboard_exclusions")
          .select("user_id");

      if (exclusionsError) {
        console.error(
          "Community exclusions error:",
          exclusionsError
        );
        return;
      }

      const excludedUserIds = new Set(
        (excludedUsers || []).map(
          (user: any) => user.user_id
        )
      );

      if (!progress || !profiles) return;

      const profileMap: Record<string, any> = {};

      profiles.forEach((p: any) => {
        profileMap[p.id] = p;
      });

      const active: any[] = [];
      const finished: any[] = [];

      progress.forEach((row: any) => {
        if (
          !eligibleUserIds.has(row.user_id) ||
          excludedUserIds.has(row.user_id)
        ) {
          return;
        }

        let owned = 0;

        if (id === "friendshipsbegin") {
          const BONUS_STRUCTURE = [
            { prefix: "SD01C", count: 9 },
            { prefix: "SD01U", count: 7 },
            { prefix: "SD01SR", count: 6 },
            { prefix: "SD01SPR", count: 10 },
            { prefix: "SD01GR", count: 6 },
            { prefix: "SD01CR", count: 6 },
            { prefix: "SD01ER", count: 6 },
            { prefix: "SD01PER", count: 12 },
            { prefix: "SD01PRR", count: 6 },
          ];

          const getDeckCards = (deckCode: string) => {
            const cards: string[] = [];

            const deckLetter = deckCode.slice(-1);
            const deckIndex =
              deckLetter.charCodeAt(0) - 64;

            const add = (
              rarity: string,
              count: number
            ) => {
              for (let i = 1; i <= count; i++) {
                cards.push(
                  `${deckCode}${rarity}${String(i).padStart(
                    2,
                    "0"
                  )}`
                );
              }
            };

            add("C", 9);
            add("U", 4);
            add("SR", 2);

            cards.push(
              `SD01ER${String(deckIndex).padStart(2, "0")}`
            );

            add("SPR", 4);

            cards.push(
              `SD01RR${String(deckIndex).padStart(2, "0")}`
            );

            return cards;
          };

          const starterDecks = [
            "SD01A",
            "SD01B",
            "SD01C",
            "SD01D",
            "SD01E",
            "SD01F",
          ];

          starterDecks.forEach((deck) => {
            const cards = getDeckCards(deck);

            cards.forEach((cardKey) => {
              const stateKey = `STARTER-${cardKey}`;

              if (row.progress?.[stateKey]) {
                owned++;
              }
            });
          });

          BONUS_STRUCTURE.forEach(
            ({ prefix, count }) => {
              for (let i = 1; i <= count; i++) {
                let actualIndex = i;

                if (prefix === "SD01PER") {
                  actualIndex = i + 6;
                }

                const key = `${prefix}${String(
                  actualIndex
                ).padStart(2, "0")}`;

                const stateKey = `BONUS-${key}`;

                if (row.progress?.[stateKey]) {
                  owned++;
                }
              }
            }
          );
        } else if (id === "discord") {
          owned = Object.values(
            row.progress || {}
          ).filter(
            (v: any) =>
              v === true || v?.owned === true
          ).length;
        } else {
          const isoSet = isoSets.find(
            (s) => s.id === id
          );

          if (!isoSet) return;

          owned = Object.values(
            row.progress || {}
          ).filter(
            (v: any) =>
              v === true || v?.owned === true
          ).length;
        }

const user = {
  id: row.user_id,
  username:
    profileMap[row.user_id]?.username ||
    "Anonymous",
  avatar_url:
    profileMap[row.user_id]?.avatar_url,
  owned,
  updated: row.updated_at,
};

        const actualTotal = set.total;

        if (owned === actualTotal) {
          finished.push(user);
        } else {
          active.push(user);
        }
      });

      active.sort((a, b) => {
        if (
          forcedStillCollecting.includes(a.username)
        )
          return -1;

        if (
          forcedStillCollecting.includes(b.username)
        )
          return 1;

        return b.owned - a.owned;
      });

      if (manualPlacements[id || ""]) {
        const manualOrder =
          manualPlacements[id || ""];

        finished.sort((a, b) => {
          const aIndex = manualOrder.indexOf(
            a.username
          );
          const bIndex = manualOrder.indexOf(
            b.username
          );

          if (
            aIndex !== -1 &&
            bIndex !== -1
          ) {
            return aIndex - bIndex;
          }

          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;

          return (
            new Date(a.updated).getTime() -
            new Date(b.updated).getTime()
          );
        });
      } else {
        finished.sort(
          (a, b) =>
            new Date(a.completed_at).getTime() -
            new Date(b.completed_at).getTime()
        );
      }

      setCollectors(active.slice(0, 10));
      setCompleted(finished.slice(0, 10));
    };

    load();
  }, [id, set]);

  if (!set) return null;

  const completionPercentage = (owned: number) =>
    Math.min(
      100,
      Math.round((owned / set.total) * 100)
    );

  const getRankColor = (index: number) => {
    if (index === 0) return "#FFD400";
    if (index === 1) return "#B9B9B9";
    if (index === 2) return "#A9784A";
    return "#555555";
  };

  const getRankLabel = (index: number) => {
    if (index === 0) return "FIRST";
    if (index === 1) return "SECOND";
    if (index === 2) return "THIRD";
    return `RANK ${index + 1}`;
  };

  return (
    <div
      className="
        min-h-screen
        overflow-hidden
        bg-[#111111]
        font-['Oxanium']
        text-white
      "
    >
      {/* Technical background */}
      <div
        className="
          pointer-events-none
          fixed inset-0
          opacity-[0.025]
        "
        style={{
          backgroundImage:
            "linear-gradient(#FFD400 1px, transparent 1px), linear-gradient(90deg, #FFD400 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* Ambient gold light */}
      <div className="pointer-events-none fixed left-[10%] top-0 h-[420px] w-[420px] rounded-full bg-[#FFD400]/[0.035] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 pb-16 sm:px-6 lg:px-8">
        {/* TOP NAV */}
        <div className="mb-7 flex items-center justify-between">
          <button
            onClick={() => navigate("/community")}
            className="
              group
              flex items-center gap-2
              border border-[#303030]
              bg-[#171717]
              px-3 py-2
              font-mono
              text-[8px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-white/45
              transition-all
              hover:border-[#FFD400]/45
              hover:bg-[#1c1c1c]
              hover:text-[#FFD400]
            "
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            COMMUNITY
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/55">
              COMMUNITY DATABASE
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.7)]" />

            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[#FFD400]/85">
              ONLINE
            </span>
          </div>
        </div>

        {/* SET HERO */}
        <section className="relative mb-7 overflow-hidden border border-[#303030] bg-[#171717]">
          {/* Top gold rail */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD400] to-transparent" />

          {/* Corner brackets */}
          <div className="absolute left-0 top-0 h-7 w-7 border-l border-t border-[#FFD400]/50" />
          <div className="absolute right-0 top-0 h-7 w-7 border-r border-t border-[#FFD400]/25" />
          <div className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#FFD400]/20" />
          <div className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#FFD400]/35" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px]">
            {/* Main title */}
            <div className="px-5 py-6 sm:px-7 sm:py-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.7)]" />

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-[#FFD400]/90">
                  COLLECTION INTELLIGENCE
                </span>

                <span className="h-px w-12 bg-[#FFD400]/30" />
              </div>

              <h1
                className="
                  max-w-4xl
                  font-['Oxanium']
                  text-3xl
                  font-black
                  uppercase
                  leading-[0.95]
                  tracking-[0.025em]
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {set.name}
              </h1>

              <p className="mt-4 max-w-2xl font-mono text-[8px] uppercase leading-[1.8] tracking-[0.1em] text-white/65 sm:text-[9px]">
                Track collectors approaching completion
                and review verified finishers in
                completion order.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.45fr)]">
          {/* COMPLETED */}
          <section className="relative overflow-hidden border border-[#303030] bg-[#151515]">
            <div className="absolute left-0 top-0 h-6 w-6 border-l border-t border-[#FFD400]/55" />

            <div className="border-b border-[#2c2c2c] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy
                      size={14}
                      className="text-[#FFD400]"
                    />

                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/90">
                      COMPLETION RECORD
                    </span>
                  </div>

                  <h2 className="mt-1 font-['Oxanium'] text-lg font-black uppercase tracking-[0.04em] text-white">
                    Finishers
                  </h2>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/55">
                    VERIFIED
                  </div>

                  <div className="mt-1 font-['Oxanium'] text-sm font-bold text-[#FFD400]">
                    {completed.length
                      .toString()
                      .padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3">
              {completed.length > 0 ? (
                <div className="space-y-1.5">
                  {(showAllFinishers
                    ? completed
                    : completed.slice(0, 3)
                  ).map((user, index) => {
                    const assets =
                      getProfileAssets(user);

                    return (
                      <div
                        key={user.id || index}
                        className="
                          group
                          relative
                          flex
                          items-center
                          gap-3
                          overflow-hidden
                          border
                          border-[#292929]
                          bg-[#191919]
                          px-3
                          py-3
                          transition-all
                          duration-200
                          hover:border-[#FFD400]/40
                          hover:bg-[#1d1d1d]
                        "
                      >
                        {/* Rank color rail */}
                        <div
                          className="absolute bottom-0 left-0 top-0 w-0.5"
                          style={{
                            backgroundColor:
                              getRankColor(index),
                          }}
                        />

                        {/* Rank */}
                        <div
                          className="flex h-8 w-9 shrink-0 flex-col items-center justify-center border border-[#303030] bg-[#121212]"
                          style={{
                            borderColor:
                              index < 3
                                ? `${getRankColor(index)}55`
                                : undefined,
                          }}
                        >
                          <span
                            className="font-['Oxanium'] text-[11px] font-black"
                            style={{
                              color:
                                getRankColor(index),
                            }}
                          >
                            #{index + 1}
                          </span>
                        </div>

                        {/* Avatar */}
                        <img
                          src={assets.avatar}
                          alt={user.username}
                          className="
                            h-10
                            w-10
                            shrink-0
                            border
                            border-[#444]
                            object-cover
                            transition-colors
                            group-hover:border-[#FFD400]/60
                          "
                        />

                        {/* User */}
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.02em] text-white/85">
                              {user.username}
                            </span>

                            {assets.verification && (
                              <img
                                src={
                                  assets.verification
                                    .badge
                                }
                                alt={
                                  assets.verification
                                    .label
                                }
                                title={
                                  assets.verification
                                    .label
                                }
                                className="h-3.5 w-3.5 shrink-0 object-contain"
                              />
                            )}
                          </div>

                          <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/55">
                            {getRankLabel(index)} FINISHER
                          </div>
                        </div>

                        {/* Completion */}
                        <div className="hidden shrink-0 text-right sm:block">
                          <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/55">
                            STATUS
                          </div>

                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD400]" />

                            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[#FFD400]/90">
                              COMPLETE
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[#333] bg-[#121212] px-5 py-10 text-center">
                  <Trophy
                    size={22}
                    className="mx-auto text-[#FFD400]/25"
                  />

                  <div className="mt-3 font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                    NO FINISHERS YET
                  </div>

                  <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/55">
                    THE #1 SLOT REMAINS OPEN
                  </div>
                </div>
              )}

              {completed.length > 3 && (
                <button
                  onClick={() =>
                    setShowAllFinishers(
                      !showAllFinishers
                    )
                  }
                  className="
                    mt-2
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    border
                    border-[#303030]
                    bg-[#121212]
                    py-2.5
                    font-mono
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-white/35
                    transition-all
                    hover:border-[#FFD400]/45
                    hover:text-[#FFD400]
                  "
                >
                  {showAllFinishers ? (
                    <>
                      COLLAPSE
                      <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      VIEW ALL {completed.length} FINISHERS
                      <ChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>
          </section>

          {/* STILL COLLECTING */}
          <section className="relative overflow-hidden border border-[#303030] bg-[#151515]">
            <div className="absolute right-0 top-0 h-6 w-6 border-r border-t border-[#FFD400]/40" />

            <div className="border-b border-[#2c2c2c] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Users
                      size={14}
                      className="text-[#FFD400]"
                    />

                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/90">
                      ACTIVE COLLECTORS
                    </span>
                  </div>

                  <h2 className="mt-1 font-['Oxanium'] text-lg font-black uppercase tracking-[0.04em] text-white">
                    Still Collecting
                  </h2>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/55">
                    TRACKED
                  </div>

                  <div className="mt-1 font-['Oxanium'] text-sm font-bold text-[#FFD400]">
                    {collectors.length
                      .toString()
                      .padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3">
              {collectors.length > 0 ? (
                <div className="space-y-1.5">
                  {collectors.map((user, index) => {
                    const assets =
                      getProfileAssets(user);

                    const percentage =
                      completionPercentage(
                        user.owned
                      );

                    return (
                      <div
                        key={user.id || index}
                        className="
                          group
                          relative
                          overflow-hidden
                          border
                          border-[#292929]
                          bg-[#191919]
                          px-3
                          py-3
                          transition-all
                          duration-200
                          hover:border-[#FFD400]/40
                          hover:bg-[#1d1d1d]
                        "
                      >
                        {/* Rank rail */}
                        <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-[#FFD400]/10 transition-colors group-hover:bg-[#FFD400]/55" />

                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <span className="w-5 shrink-0 font-['Oxanium'] text-[9px] font-bold tracking-[0.04em] text-white/20">
                            #{index + 1}
                          </span>

                          {/* Avatar */}
                          <img
                            src={assets.avatar}
                            alt={user.username}
                            className="
                              h-10
                              w-10
                              shrink-0
                              border
                              border-[#444]
                              object-cover
                              transition-colors
                              group-hover:border-[#FFD400]/60
                            "
                          />

                          {/* Identity */}
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.02em] text-white/85">
                                {user.username}
                              </span>

                              {assets.verification && (
                                <img
                                  src={
                                    assets.verification
                                      .badge
                                  }
                                  alt={
                                    assets.verification
                                      .label
                                  }
                                  title={
                                    assets.verification
                                      .label
                                  }
                                  className="h-3.5 w-3.5 shrink-0 object-contain"
                                />
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1 flex-1 overflow-hidden bg-[#292929]">
                                <div
                                  className="
                                    h-full
                                    bg-gradient-to-r
                                    from-[#9d7b16]
                                    via-[#FFD400]
                                    to-[#f5dc67]
                                    shadow-[0_0_7px_rgba(255,212,0,.2)]
                                    transition-all
                                    duration-500
                                  "
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>

                              <span className="font-mono text-[8px] font-bold tracking-[0.08em] text-white/65">
                                {percentage}%
                              </span>
                            </div>
                          </div>

                          {/* Count */}
                          <div className="shrink-0 text-right">
                            <div className="font-['Oxanium'] text-[11px] font-bold tracking-[0.04em] text-[#FFD400]/80">
                              {user.owned}
                              <span className="text-white/20">
                                /{set.total}
                              </span>
                            </div>

                            <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.14em] text-white/55">
                              CARDS
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[#333] bg-[#121212] px-5 py-10 text-center">
                  <Users
                    size={22}
                    className="mx-auto text-[#FFD400]/25"
                  />

                  <div className="mt-3 font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                    NO ACTIVE COLLECTORS
                  </div>

                  <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/55">
                    COLLECTION DATA NOT AVAILABLE
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* FOOTER READOUT */}
        <div className="mt-5 flex flex-col gap-2 border-t border-[#292929] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD400]/60" />

            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/55">
              COLLECTION DATABASE // LIVE READOUT
            </span>
          </div>

          <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
            {completed.length} COMPLETED
            {" // "}
            {collectors.length} ACTIVE
            {" // "}
            {set.total} TOTAL CARDS
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySet;
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
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light");
});
useEffect(() => {
  const syncTheme = () => {
    const root = document.documentElement;
    setIsLightMode(
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      !root.classList.contains("dark")
    );
  };
  syncTheme();
  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
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
  Math.min(100, (owned / set.total) * 100);
const finisherAward = { icon: "🏆", label: "Finisher" };
return (
  <div
    className={`min-h-screen pb-20 transition-colors ${
      isLightMode
        ? "bg-[#f6f4ef] text-zinc-900"
        : "bg-[#0d0f10] text-zinc-100"
    }`}
  >
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/community")}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
              : "border-white/[0.08] bg-[#17191a] text-zinc-300 hover:bg-white/[0.05]"
          }`}
        >
          <ArrowLeft size={16} />
          Community
        </button>
      </div>
      <section
        className={`mb-4 overflow-hidden rounded-[26px] border ${
          isLightMode
            ? "border-black/10 bg-white"
            : "border-white/[0.08] bg-[#151718]"
        }`}
      >
        <div className="h-1 bg-[#FFD54A]" />
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <div
              className={`text-sm font-medium ${
                isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
              }`}
            >
              Community Set
            </div>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              {set.name}
            </h1>
          </div>
          <div
            className={`w-fit rounded-full px-3 py-1.5 text-sm ${
              isLightMode
                ? "bg-zinc-100 text-zinc-600"
                : "bg-white/[0.05] text-zinc-300"
            }`}
          >
            {set.total} cards
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
        <section
          className={`overflow-hidden rounded-[26px] border ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div
            className={`flex items-center justify-between border-b px-5 py-4 ${
              isLightMode ? "border-black/10" : "border-white/[0.08]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  isLightMode ? "bg-[#fff3b8]" : "bg-[#FFD54A]/10"
                }`}
              >
                <Trophy size={19} className="text-[#c29a00]" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Finishers</h2>
                <div
                  className={`text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Verified completed collections
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              {completed.length}
            </span>
          </div>
          <div className="p-3">
            {completed.length > 0 ? (
              <div className="space-y-2">
                {(showAllFinishers ? completed : completed.slice(0, 3)).map(
                  (user, index) => {
                    const assets = getProfileAssets(user);
                    const award = finisherAward;
                    return (
                      <div
                        key={user.id || index}
                        className={`flex items-center gap-3 rounded-2xl border p-3 ${
                          isLightMode
                            ? "border-black/10 bg-[#fafafa]"
                            : "border-white/[0.07] bg-[#1a1c1d]"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                            isLightMode ? "bg-white" : "bg-white/[0.05]"
                          }`}
                          aria-label={award.label}
                          title={award.label}
                        >
                          {award.icon}
                        </span>
                        <img
                          src={assets.avatar}
                          alt={user.username}
                          className={`h-11 w-11 shrink-0 rounded-full border object-cover ${
                            isLightMode ? "border-black/10" : "border-white/15"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">
                              {user.username}
                            </span>
                            {assets.verification && (
                              <img
                                src={assets.verification.badge}
                                alt={assets.verification.label}
                                title={assets.verification.label}
                                className="h-4 w-4 shrink-0 object-contain"
                              />
                            )}
                          </div>
                          <div
                            className={`mt-0.5 text-sm ${
                              isLightMode ? "text-zinc-500" : "text-zinc-400"
                            }`}
                          >
                            {award.label}
                          </div>
                        </div>
                        <span
                          className={`hidden rounded-full px-3 py-1 text-sm sm:inline-flex ${
                            isLightMode
                              ? "bg-[#fff3b8] text-[#755b00]"
                              : "bg-[#FFD54A]/10 text-[#E8CA55]"
                          }`}
                        >
                          Complete
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div
                className={`rounded-2xl p-8 text-center ${
                  isLightMode ? "bg-zinc-50" : "bg-white/[0.03]"
                }`}
              >
                <Trophy
                  size={24}
                  className={`mx-auto ${
                    isLightMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
                />
                <div className="mt-3 text-sm font-semibold">No finishers yet</div>
              </div>
            )}
            {completed.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllFinishers(!showAllFinishers)}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-sm font-medium transition ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                    : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                {showAllFinishers ? (
                  <>
                    Show less
                    <ChevronUp size={15} />
                  </>
                ) : (
                  <>
                    View all {completed.length} finishers
                    <ChevronDown size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </section>
        <section
          className={`overflow-hidden rounded-[26px] border ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div
            className={`flex items-center justify-between border-b px-5 py-4 ${
              isLightMode ? "border-black/10" : "border-white/[0.08]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  isLightMode ? "bg-zinc-100" : "bg-white/[0.05]"
                }`}
              >
                <Users size={19} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Still Collecting</h2>
                <div
                  className={`text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Closest to completing this set
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              {collectors.length}
            </span>
          </div>
          <div className="p-3">
            {collectors.length > 0 ? (
              <div className="space-y-2">
                {collectors.map((user, index) => {
                  const assets = getProfileAssets(user);
                  const percentage = completionPercentage(user.owned);
                  return (
                    <div
                      key={user.id || index}
                      className={`w-full rounded-2xl border p-2.5 sm:p-3 ${
                        isLightMode
                          ? "border-black/10 bg-[#fafafa]"
                          : "border-white/[0.07] bg-[#1a1c1d]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={assets.avatar}
                          alt={user.username}
                          className={`h-11 w-11 shrink-0 rounded-full border object-cover ${
                            isLightMode ? "border-black/10" : "border-white/15"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">
                              {user.username}
                            </span>
                            {assets.verification && (
                              <img
                                src={assets.verification.badge}
                                alt={assets.verification.label}
                                title={assets.verification.label}
                                className="h-4 w-4 shrink-0 object-contain"
                              />
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className={`h-2 flex-1 overflow-hidden rounded-full ${
                                isLightMode ? "bg-zinc-200" : "bg-white/[0.08]"
                              }`}
                            >
                              <div
                                className="h-full rounded-full bg-[#D2AD28]"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span
                              className={`hidden shrink-0 text-sm font-medium sm:inline ${
                                isLightMode ? "text-zinc-600" : "text-zinc-300"
                              }`}
                            >
                              {percentage}%
                            </span>
                          </div>
                          <div
                            className={`mt-1 text-sm sm:hidden ${
                              isLightMode ? "text-zinc-500" : "text-zinc-400"
                            }`}
                          >
                            {user.owned}/{set.total} cards
                          </div>
                        </div>
                        <div className="hidden shrink-0 text-right sm:block">
                          <div
                            className={`text-sm font-semibold ${
                              isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
                            }`}
                          >
                            {user.owned}/{set.total}
                          </div>
                          <div
                            className={`text-sm ${
                              isLightMode ? "text-zinc-400" : "text-zinc-500"
                            }`}
                          >
                            cards
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`rounded-2xl p-8 text-center ${
                  isLightMode ? "bg-zinc-50" : "bg-white/[0.03]"
                }`}
              >
                <Users
                  size={24}
                  className={`mx-auto ${
                    isLightMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
                />
                <div className="mt-3 text-sm font-semibold">
                  No active collectors
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  </div>
);
};
export default CommunitySet;

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "./Everypony/profile-assets";
type LeaderboardUser = {
  id: string;
  username: string;
  avatar_url?: string | null;
  total: number;
};
const CCG_SET_IDS = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "11",
]);
const TCG_SET_IDS = new Set([
  "12",
  "SD",
  "FW",
  "tcgpromos",
]);
const LEADERBOARD_USER_ID =
  "94a1c998-d040-4dd2-b2fb-5f606287139d";
const Leaderboard = () => {
const [ccgLeaders, setCcgLeaders] = useState<LeaderboardUser[]>([]);
const [tcgLeaders, setTcgLeaders] = useState<LeaderboardUser[]>([]);
const [loading, setLoading] = useState(true);
const [showVerificationNotice, setShowVerificationNotice] = useState(true);
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
useEffect(() => {
const loadLeaderboards = async () => {
    setLoading(true);
    try {
const { data: ccgProfiles, error: ccgProfilesError } =
        await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url, iso_hidden_sets, collection_total, rank_worthy"
          )
          .gte("collection_total", 1200);
      if (ccgProfilesError) {
        console.error(
          "CCG leaderboard profiles error:",
          ccgProfilesError
        );
        return;
      }
const { data: tcgProfiles, error: tcgProfilesError } =
        await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url, iso_hidden_sets, collection_total, rank_worthy"
          )
          .gte("collection_total", 450);
      if (tcgProfilesError) {
        console.error(
          "TCG leaderboard profiles error:",
          tcgProfilesError
        );
        return;
      }
const { data: tradingProfiles, error: tradingError } =
        await supabase
          .from("trading_profiles")
          .select("user_id, discord_username");
      if (tradingError) {
        console.error(
          "Leaderboard trading profile error:",
          tradingError
        );
        return;
      }
const eligibleUserIds = new Set(
        (tradingProfiles || [])
          .filter(
            (profile: any) =>
              profile.discord_username &&
              profile.discord_username.trim() !== ""
          )
          .map((profile: any) => profile.user_id)
      );
const { data: excludedUsers, error: exclusionsError } =
        await supabase
          .from("leaderboard_exclusions")
          .select("user_id");
      if (exclusionsError) {
        console.error(
          "Leaderboard exclusions error:",
          exclusionsError
        );
        return;
      }
const excludedUserIds = new Set(
        (excludedUsers || []).map(
          (user: any) => user.user_id
        )
      );
const filterEligible = (profiles: any[]) =>
        profiles.filter(
          (profile: any) =>
            eligibleUserIds.has(profile.id) &&
            !excludedUserIds.has(profile.id)
        );
const eligibleCcgProfiles =
        filterEligible(ccgProfiles || []);
const eligibleTcgProfiles =
        filterEligible(tcgProfiles || []);
const allEligibleIds = Array.from(
        new Set([
          ...eligibleCcgProfiles.map(
            (profile: any) => profile.id
          ),
          ...eligibleTcgProfiles.map(
            (profile: any) => profile.id
          ),
        ])
      );
      if (allEligibleIds.length === 0) {
        setCcgLeaders([]);
        setTcgLeaders([]);
        return;
      }
const {
        data: rawProgress,
        error: progressError,
      } = await supabase
        .from("collection_progress_raw")
        .select("user_id, set_id, progress")
        .in("user_id", allEligibleIds);
      if (progressError) {
        console.error(
          "Leaderboard collection progress error:",
          progressError
        );
        return;
      }
const ccgTotals = new Map<string, number>();
const tcgTotals = new Map<string, number>();
      (rawProgress || []).forEach((row: any) => {
const setId = String(row.set_id);
const owned = Object.values(
          row.progress || {}
        ).filter(
          (value: any) =>
            value === true ||
            (typeof value === "object" &&
              value?.owned === true)
        ).length;
        if (CCG_SET_IDS.has(setId)) {
const current =
            ccgTotals.get(row.user_id) || 0;
          ccgTotals.set(
            row.user_id,
            current + owned
          );
        }
        if (TCG_SET_IDS.has(setId)) {
const current =
            tcgTotals.get(row.user_id) || 0;
          tcgTotals.set(
            row.user_id,
            current + owned
          );
        }
      });
const ccgLeaderboard = eligibleCcgProfiles
        .map((profile: any) => ({
          id: profile.id,
          username: profile.username || "Anonymous",
          avatar_url: profile.avatar_url,
          total:
            ccgTotals.get(profile.id) || 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 7);
const tcgLeaderboard = eligibleTcgProfiles
        .map((profile: any) => ({
          id: profile.id,
          username: profile.username || "Anonymous",
          avatar_url: profile.avatar_url,
          total:
            tcgTotals.get(profile.id) || 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 7);
      setCcgLeaders(ccgLeaderboard);
      setTcgLeaders(tcgLeaderboard);
    } catch (error) {
      console.error(
        "Leaderboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };
  loadLeaderboards();
}, []);
const renderAvatarEffects = (user: LeaderboardUser) => {
  if (user.id !== LEADERBOARD_USER_ID) {
    return null;
  }
  return (
    <>
      {[
        { left: "24%", delay: "0s" },
        { left: "50%", delay: ".45s" },
        { left: "76%", delay: ".9s" },
      ].map((line, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: line.left,
            top: "-16px",
            animation:
              "stinkFloat 2s ease-in-out infinite",
            animationDelay: line.delay,
          }}
        >
          <svg
            width="18"
            height="42"
            viewBox="0 0 18 42"
            fill="none"
          >
            <path
              d="M9 42C9 32 2 30 2 22C2 16 14 14 14 7C14 4 12 2 10 0"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </>
  );
};
const CornerBrackets = ({
  color = "#E7C84B",
}: {
  color?: string;
}) => (
  <>
    <div
      className="absolute left-0 top-0 h-4 w-4 border-l border-t"
      style={{ borderColor: color }}
    />
    <div
      className="absolute right-0 top-0 h-4 w-4 border-r border-t"
      style={{ borderColor: color }}
    />
    <div
      className="absolute bottom-0 left-0 h-4 w-4 border-b border-l"
      style={{ borderColor: color }}
    />
    <div
      className="absolute bottom-0 right-0 h-4 w-4 border-b border-r"
      style={{ borderColor: color }}
    />
  </>
);
const renderTopThree = (
  leaders: LeaderboardUser[],
  section: "ccg" | "tcg"
) => {
  const topThree = leaders.slice(0, 3);
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {topThree.map((user, index) => {
        const rank = index + 1;
        const { avatar, verification } = getProfileAssets(user);
        return (
          <div
            key={`${section}-${user.id}`}
            className={`relative overflow-hidden rounded-[22px] border p-4 ${
              rank === 1
                ? isLightMode
                  ? "border-[#c9a92f]/45 bg-[#fffdf5]"
                  : "border-[#FFD54A]/35 bg-[#181711]"
                : isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 ${
                rank === 1
                  ? "bg-[#FFD54A]"
                  : isLightMode
                  ? "bg-zinc-200"
                  : "bg-white/[0.06]"
              }`}
            />
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-1 text-sm font-semibold ${
                  rank === 1
                    ? isLightMode
                      ? "bg-[#f4e7a8] text-[#6d5500]"
                      : "bg-[#FFD54A]/15 text-[#FFE27A]"
                    : isLightMode
                    ? "bg-zinc-100 text-zinc-600"
                    : "bg-white/[0.05] text-zinc-300"
                }`}
              >
                #{rank}
              </span>
              <span className={`text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                {section.toUpperCase()}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt=""
                  className={`h-16 w-16 rounded-full border object-cover ${
                    rank === 1
                      ? "border-[#D6B73E]"
                      : isLightMode
                      ? "border-black/10"
                      : "border-white/10"
                  }`}
                />
                {renderAvatarEffects(user)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <div className="truncate text-base font-semibold">{user.username}</div>
                  {verification && (
                    <img
                      src={verification.badge}
                      alt={verification.label}
                      title={verification.label}
                      className="h-5 w-5 shrink-0 object-contain"
                    />
                  )}
                </div>
                <div className={`mt-1 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  {user.total.toLocaleString()} cards collected
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
const renderRemainingRanks = (
  leaders: LeaderboardUser[],
  section: "ccg" | "tcg"
) => {
  const remaining = leaders.slice(3, 11);
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {remaining.map((user, index) => {
        const rank = index + 4;
        const { avatar, verification } = getProfileAssets(user);
        return (
          <div
            key={`${section}-${user.id}`}
            className={`rounded-[20px] border p-3 transition ${
              isLightMode
                ? "border-black/10 bg-white hover:bg-zinc-50"
                : "border-white/[0.08] bg-[#151718] hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isLightMode
                    ? "bg-zinc-100 text-zinc-700"
                    : "bg-white/[0.06] text-zinc-300"
                }`}
              >
                {rank}
              </div>
              <img
                src={avatar}
                alt=""
                className={`h-11 w-11 shrink-0 rounded-full border object-cover ${
                  isLightMode ? "border-black/10" : "border-white/10"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <div className="truncate text-sm font-semibold">{user.username}</div>
                  {verification && (
                    <img
                      src={verification.badge}
                      alt={verification.label}
                      title={verification.label}
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                  )}
                </div>
                <div className={`mt-0.5 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  {user.total.toLocaleString()} cards
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
const renderLeaderboardSection = (
  title: string,
  subtitle: string,
  leaders: LeaderboardUser[],
  section: "ccg" | "tcg"
) => {
  return (
    <section className="mt-8 first:mt-0">
      <div
        className={`mb-3 flex items-center justify-between rounded-[20px] border px-4 py-3 ${
          isLightMode
            ? "border-black/10 bg-white"
            : "border-white/[0.08] bg-[#151718]"
        }`}
      >
        <div>
          <div className={`text-sm font-medium ${
            isLightMode ? "text-[#7b6200]" : "text-[#FFE27A]"
          }`}>
            {subtitle}
          </div>
          <h2 className="mt-0.5 text-2xl font-semibold">{title} Leaderboard</h2>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-sm ${
            isLightMode
              ? "bg-zinc-100 text-zinc-600"
              : "bg-white/[0.05] text-zinc-300"
          }`}
        >
          {leaders.length} ranked
        </div>
      </div>
      {leaders.length === 0 ? (
        <div
          className={`rounded-[22px] border px-6 py-10 text-center ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-500"
              : "border-white/[0.08] bg-[#151718] text-zinc-400"
          }`}
        >
          No eligible collectors are currently available.
        </div>
      ) : (
        <>
          {renderTopThree(leaders, section)}
          {renderRemainingRanks(leaders, section)}
        </>
      )}
    </section>
  );
};
return (
  <>
    {showVerificationNotice && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
        <div
          className={`w-full max-w-xl overflow-hidden rounded-[26px] border shadow-2xl ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-900"
              : "border-white/10 bg-[#17191a] text-white"
          }`}
        >
          <div
            className={`border-b px-5 py-4 sm:px-6 ${
              isLightMode ? "border-black/10" : "border-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFD54A]" />
              <div className={`text-sm font-medium ${
                isLightMode ? "text-[#7b6200]" : "text-[#FFE27A]"
              }`}>
                Leaderboard access
              </div>
            </div>
            <h2 className="mt-2 text-xl font-semibold">Verified Collectors Only</h2>
          </div>
          <div className="space-y-3 px-5 py-5 text-sm leading-relaxed sm:px-6">
            <div
              className={`rounded-2xl p-4 ${
                isLightMode ? "bg-zinc-50" : "bg-white/[0.04]"
              }`}
            >
              <p>The leaderboard is for verified North American collectors.</p>
              <p className="mt-2">
                You must have a Discord username attached to your profile and be in the MLPEKayou Discord server to qualify.
              </p>
              <p className="mt-2">
                Accounts that cannot be verified may be removed from the leaderboard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowVerificationNotice(false)}
              className="mt-2 w-full rounded-xl bg-[#FFD54A] px-5 py-3 text-sm font-semibold text-black"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )}
    <div
      className={`min-h-screen pb-24 transition-colors ${
        isLightMode
          ? "bg-[#f5f5f3] text-zinc-900"
          : "bg-[#0d0f10] text-white"
      }`}
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <section
          className={`relative overflow-hidden rounded-[26px] border p-4 sm:p-5 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[#FFD54A]" />
          <div
            className={`pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl ${
              isLightMode ? "bg-[#FFD54A]/15" : "bg-[#FFD54A]/10"
            }`}
          />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">Leaderboard</h1>
              <p className={`mt-1 max-w-xl text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Verified collector rankings across CCG and TCG collections.
              </p>
            </div>
            <div
              className={`rounded-2xl border px-3 py-2 text-sm ${
                isLightMode
                  ? "border-black/10 bg-zinc-50 text-zinc-600"
                  : "border-white/10 bg-white/[0.03] text-zinc-300"
              }`}
            >
              Discord verification required
            </div>
          </div>
        </section>
        {loading ? (
          <div
            className={`mt-4 rounded-[24px] border py-16 text-center ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div
              className={`mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
                isLightMode
                  ? "border-zinc-300"
                  : "border-zinc-600"
              }`}
            />
            <div className={`mt-4 text-sm ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}>
              Loading leaderboard…
            </div>
          </div>
        ) : (
          <>
            {renderLeaderboardSection("CCG", "Kayou", ccgLeaders, "ccg")}
            {renderLeaderboardSection("TCG", "Trading Card Game", tcgLeaders, "tcg")}
          </>
        )}
      </main>
    </div>
  </>
);
};
export default Leaderboard;

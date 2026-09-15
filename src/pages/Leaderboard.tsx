import CardImage from "@/components/CardImage";
import { useEffect, useState } from "react";
import {
  Crown,
  Medal,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "./Everypony/profile-assets";
type LeaderboardUser = {
  id: string;
  username: string;
  avatar_url?: string | null;
  total: number;
};
const LEADERBOARD_USER_ID = "94a1c998-d040-4dd2-b2fb-5f606287139d";
const Leaderboard = () => {
  const [ccgLeaders, setCcgLeaders] = useState<LeaderboardUser[]>([]);
  const [tcgLeaders, setTcgLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationNotice, setShowVerificationNotice] = useState(true);
  const [viewerStatus, setViewerStatus] = useState<
    "verified" | "unverified" | "ineligible"
  >("unverified");
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
          !root.classList.contains("dark"),
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
        const { data: ccgProfiles, error: ccgProfilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, iso_hidden_sets, collection_total")
          .gte("collection_total", 1200);
        if (ccgProfilesError) {
          console.error("CCG leaderboard profiles error:", ccgProfilesError);
          return;
        }
        const { data: tcgProfiles, error: tcgProfilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, iso_hidden_sets, collection_total")
          .gte("collection_total", 450);
        if (tcgProfilesError) {
          console.error("TCG leaderboard profiles error:", tcgProfilesError);
          return;
        }
        const { data: tradingProfiles, error: tradingError } = await supabase
          .from("trading_profiles")
          .select("user_id, discord_username, trade_access_revoked");
        if (tradingError) {
          console.error("Leaderboard trading profile error:", tradingError);
          return;
        }
        const eligibleUserIds = new Set(
          (tradingProfiles || [])
            .filter(
              (profile: any) =>
                profile.discord_username &&
                profile.discord_username.trim() !== "" &&
                !profile.trade_access_revoked,
            )
            .map((profile: any) => profile.user_id),
        );
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const viewerTradingProfile = (tradingProfiles || []).find(
          (profile: any) => profile.user_id === session?.user?.id,
        );
        const { data: excludedUsers, error: exclusionsError } = await supabase
          .from("leaderboard_exclusions")
          .select("user_id");
        if (exclusionsError) {
          console.error("Leaderboard exclusions error:", exclusionsError);
          return;
        }
        const excludedUserIds = new Set(
          (excludedUsers || []).map((user: any) => user.user_id),
        );
        const viewerIsExcluded = session?.user?.id
          ? excludedUserIds.has(session.user.id)
          : false;
        if (viewerTradingProfile?.trade_access_revoked || viewerIsExcluded) {
          setViewerStatus("ineligible");
        } else if (
          viewerTradingProfile?.discord_username &&
          viewerTradingProfile.discord_username.trim() !== ""
        ) {
          setViewerStatus("verified");
        } else {
          setViewerStatus("unverified");
        }
        const filterEligible = (profiles: any[]) =>
          profiles.filter(
            (profile: any) =>
              eligibleUserIds.has(profile.id) &&
              !excludedUserIds.has(profile.id),
          );
        const eligibleCcgProfiles = filterEligible(ccgProfiles || []);
        const eligibleTcgProfiles = filterEligible(tcgProfiles || []);
        const allEligibleIds = Array.from(
          new Set([
            ...eligibleCcgProfiles.map((profile: any) => profile.id),
            ...eligibleTcgProfiles.map((profile: any) => profile.id),
          ]),
        );
        if (allEligibleIds.length === 0) {
          setCcgLeaders([]);
          setTcgLeaders([]);
          return;
        }
        const { data: progressTotals, error: progressError } =
          await supabase.rpc("get_leaderboard_progress_totals", {
            p_user_ids: allEligibleIds,
          });
        if (progressError) {
          console.error(
            "Leaderboard collection progress error:",
            progressError,
          );
          return;
        }
        const ccgTotals = new Map<string, number>(
          (progressTotals || []).map((row: any) => [
            row.user_id,
            Number(row.ccg_total) || 0,
          ]),
        );
        const tcgTotals = new Map<string, number>(
          (progressTotals || []).map((row: any) => [
            row.user_id,
            Number(row.tcg_total) || 0,
          ]),
        );
        const ccgLeaderboard = eligibleCcgProfiles
          .map((profile: any) => ({
            id: profile.id,
            username: profile.username || "Anonymous",
            avatar_url: profile.avatar_url,
            total: ccgTotals.get(profile.id) || 0,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 7);
        const tcgLeaderboard = eligibleTcgProfiles
          .map((profile: any) => ({
            id: profile.id,
            username: profile.username || "Anonymous",
            avatar_url: profile.avatar_url,
            total: tcgTotals.get(profile.id) || 0,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 7);
        setCcgLeaders(ccgLeaderboard);
        setTcgLeaders(tcgLeaderboard);
      } catch (error) {
        console.error("Leaderboard loading error:", error);
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
              animation: "stinkFloat 2s ease-in-out infinite",
              animationDelay: line.delay,
            }}
          >
            <svg width="18" height="42" viewBox="0 0 18 42" fill="none">
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
  const CornerBrackets = ({ color = "#E7C84B" }: { color?: string }) => (
    <>
      <div
        className="absolute left-0 top-0 h-4 w-4 border-l border-t"
        style={{ borderColor: color }}
      />
      <div
        className="absolute bottom-0 left-0 h-4 w-4 border-b border-l"
        style={{ borderColor: color }}
      />
    </>
  );
  const renderTopThree = (
    leaders: LeaderboardUser[],
    section: "ccg" | "tcg",
  ) => {
    const podium = leaders.slice(0, 3).map((user, index) => ({
      user,
      rank: index + 1,
    }));
    return (
      <div className="grid items-end gap-3 pt-2 md:grid-cols-3 md:pt-8">
        {podium.map(({ user, rank }) => {
          const { avatar, verification } = getProfileAssets(user);
          const orderClass =
            rank === 1
              ? "order-1 md:order-2 md:-translate-y-5"
              : rank === 2
                ? "order-2 md:order-1"
                : "order-3 md:order-3";
          const rankLabel =
            rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "Third Place";
          return (
            <div
              key={`${section}-${user.id}`}
              className={`relative overflow-hidden rounded-[26px] border px-4 pb-5 pt-6 text-center shadow-[0_18px_45px_rgba(0,0,0,.12)] transition-transform ${orderClass} ${
                rank === 1
                  ? isLightMode
                    ? "border-[#d1a900]/50 bg-gradient-to-b from-[#fff9d9] via-white to-[#fffdf4]"
                    : "border-[#FFD54A]/45 bg-gradient-to-b from-[#302711] via-[#1c1a13] to-[#151718]"
                  : rank === 2
                    ? isLightMode
                      ? "border-slate-300 bg-gradient-to-b from-slate-100 via-white to-white"
                      : "border-slate-400/25 bg-gradient-to-b from-slate-400/10 to-[#151718]"
                    : isLightMode
                      ? "border-amber-700/20 bg-gradient-to-b from-amber-100/70 via-white to-white"
                      : "border-amber-500/20 bg-gradient-to-b from-amber-700/10 to-[#151718]"
              }`}
            >
              <div
                className={`pointer-events-none absolute left-1/2 top-0 h-28 w-40 -translate-x-1/2 rounded-full blur-3xl ${
                  rank === 1
                    ? "bg-[#FFD54A]/25"
                    : rank === 2
                      ? "bg-slate-300/15"
                      : "bg-amber-500/10"
                }`}
              />
              <div
                className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full border shadow-lg ${
                  rank === 1
                    ? "border-[#FFE27A]/60 bg-[#FFD54A] text-[#2b2100]"
                    : rank === 2
                      ? "border-slate-200 bg-slate-300 text-slate-700"
                      : "border-amber-300/60 bg-amber-600 text-amber-50"
                }`}
              >
                {rank === 1 ? <Crown size={20} /> : <Medal size={19} />}
              </div>
              <div className="relative mt-3">
                <div className="relative mx-auto w-fit">
                  <CardImage
                    src={avatar}
                    alt=""
                    className={`rounded-full border-4 object-cover shadow-xl ${
                      rank === 1
                        ? "h-24 w-24 border-[#FFD54A]"
                        : rank === 2
                          ? "h-20 w-20 border-slate-300"
                          : "h-20 w-20 border-amber-600"
                    }`}
                  />
                  {renderAvatarEffects(user)}
                </div>
              </div>
              <div className="relative mt-3 flex min-w-0 items-center justify-center gap-1.5">
                <div className="truncate text-lg font-bold">
                  {user.username}
                </div>
                {verification && (
                  <CardImage
                    src={verification.badge}
                    alt={verification.label}
                    title={verification.label}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                )}
              </div>
              <div
                className={`relative mt-1 text-xs font-bold uppercase tracking-[0.16em] ${
                  rank === 1
                    ? isLightMode
                      ? "text-[#806400]"
                      : "text-[#FFE27A]"
                    : isLightMode
                      ? "text-zinc-500"
                      : "text-zinc-400"
                }`}
              >
                {rankLabel}
              </div>
              <div className="relative mt-4">
                <div className="text-3xl font-bold tabular-nums">
                  {user.total.toLocaleString()}
                </div>
                <div
                  className={`text-xs ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  cards collected
                </div>
              </div>
              <div
                className={`absolute inset-x-0 bottom-0 h-1.5 ${
                  rank === 1
                    ? "bg-[#FFD54A]"
                    : rank === 2
                      ? "bg-slate-300"
                      : "bg-amber-600"
                }`}
              />
              <div
                className={`absolute left-4 top-4 text-4xl font-black opacity-[0.08] ${
                  isLightMode ? "text-black" : "text-white"
                }`}
              >
                {rank}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const renderRemainingRanks = (
    leaders: LeaderboardUser[],
    section: "ccg" | "tcg",
  ) => {
    const remaining = leaders.slice(3, 11);
    return (
      <div
        className={`mt-5 border-t pt-5 ${
          isLightMode ? "border-black/[0.08]" : "border-white/[0.08]"
        }`}
      >
        <div
          className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${
            isLightMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          The chase · Ranks 4–7
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {remaining.map((user, index) => {
            const rank = index + 4;
            const { avatar, verification } = getProfileAssets(user);
            return (
              <div
                key={`${section}-${user.id}`}
                className={`group relative overflow-hidden rounded-[20px] border p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  isLightMode
                    ? "border-black/10 bg-white hover:border-[#c9a92f]/35"
                    : "border-white/[0.08] bg-[#151718] hover:border-[#FFD54A]/25 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
                      isLightMode
                        ? "border-black/10 bg-zinc-100 text-zinc-700"
                        : "border-white/10 bg-white/[0.06] text-zinc-300"
                    }`}
                  >
                    #{rank}
                  </div>
                  <CardImage
                    src={avatar}
                    alt=""
                    className={`h-11 w-11 shrink-0 rounded-full border-2 object-cover ${
                      isLightMode ? "border-white" : "border-white/10"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <div className="truncate text-sm font-bold">
                        {user.username}
                      </div>
                      {verification && (
                        <CardImage
                          src={verification.badge}
                          alt={verification.label}
                          title={verification.label}
                          className="h-4 w-4 shrink-0 object-contain"
                        />
                      )}
                    </div>
                    <div
                      className={`mt-0.5 text-xs ${
                        isLightMode ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      <span className="font-bold tabular-nums">
                        {user.total.toLocaleString()}
                      </span>{" "}
                      cards
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#FFD54A] transition-transform group-hover:scale-x-100" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const renderLeaderboardSection = (
    title: string,
    subtitle: string,
    leaders: LeaderboardUser[],
    section: "ccg" | "tcg",
  ) => {
    return (
      <section
        className={`relative mt-8 overflow-hidden rounded-[30px] border p-4 first:mt-6 sm:p-6 ${
          isLightMode
            ? "border-black/10 bg-[#fffefa] shadow-[0_20px_55px_rgba(0,0,0,.06)]"
            : "border-white/[0.08] bg-[#111314] shadow-[0_24px_60px_rgba(0,0,0,.22)]"
        }`}
      >
        <CornerBrackets color={isLightMode ? "#C9A92F" : "#FFD54A"} />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                isLightMode
                  ? "border-[#c9a92f]/25 bg-[#FFD54A]/15 text-[#765b00]"
                  : "border-[#FFD54A]/20 bg-[#FFD54A]/10 text-[#FFE27A]"
              }`}
            >
              <Trophy size={23} />
            </div>
            <div className="min-w-0">
              <div
                className={`text-xs font-bold uppercase tracking-[0.18em] ${
                  isLightMode ? "text-[#7b6200]" : "text-[#FFE27A]"
                }`}
              >
                {subtitle}
              </div>
              <h2 className="mt-0.5 truncate text-2xl font-bold sm:text-3xl">
                {title} Champions
              </h2>
            </div>
          </div>
          <div
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-600"
                : "border-white/10 bg-white/[0.05] text-zinc-300"
            }`}
          >
            Top {leaders.length}
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
          <div className="relative">
            {renderTopThree(leaders, section)}
            {renderRemainingRanks(leaders, section)}
          </div>
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
                <div
                  className={`text-sm font-medium ${
                    isLightMode ? "text-[#7b6200]" : "text-[#FFE27A]"
                  }`}
                >
                  Leaderboard access
                </div>
              </div>
              <h2 className="mt-2 text-xl font-semibold">
                Verified Collectors Only
              </h2>
            </div>
            <div className="space-y-3 px-5 py-5 text-sm leading-relaxed sm:px-6">
              <div
                className={`rounded-2xl p-4 ${
                  isLightMode ? "bg-zinc-50" : "bg-white/[0.04]"
                }`}
              >
                <p>
                  The leaderboard is for verified North American collectors.
                </p>
                <p className="mt-2">
                  You must have a Discord username attached to your profile and
                  be in the MLPEKayou Discord server to qualify.
                </p>
                <p className="mt-2">
                  Accounts that cannot be verified may be removed from the
                  leaderboard.
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
        className={`min-h-screen overflow-x-hidden pb-24 transition-colors ${
          isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
        }`}
      >
        <main className="box-border min-w-0 w-full max-w-full px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <section
            className={`relative box-border w-full max-w-full overflow-hidden rounded-[30px] border px-5 py-7 sm:px-8 sm:py-9 ${
              isLightMode
                ? "border-[#c9a92f]/25 bg-gradient-to-br from-[#fffdf2] via-white to-[#fff8d6] shadow-[0_20px_60px_rgba(104,82,0,.10)]"
                : "border-[#FFD54A]/20 bg-gradient-to-br from-[#24200f] via-[#151718] to-[#101112] shadow-[0_24px_70px_rgba(0,0,0,.35)]"
            }`}
          >
            <CornerBrackets color={isLightMode ? "#B99716" : "#FFD54A"} />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] ${
                    isLightMode ? "text-[#765b00]" : "text-[#FFE27A]"
                  }`}
                >
                  <Sparkles size={14} />
                  MLPEKAYOU Hall of Collectors
                </div>
                <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  Collector
                  <span
                    className={`ml-2 ${
                      isLightMode ? "text-[#a57f00]" : "text-[#FFD54A]"
                    }`}
                  >
                    Leaderboard
                  </span>
                </h1>
                <p
                  className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  The leading verified collectors across Kayou CCG and Trading
                  Card Game collections.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <div
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
                      viewerStatus === "verified"
                        ? isLightMode
                          ? "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-700"
                          : "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-400"
                        : viewerStatus === "ineligible"
                          ? isLightMode
                            ? "border-red-700/15 bg-red-700/[0.05] text-red-700"
                            : "border-red-400/15 bg-red-400/[0.07] text-red-400"
                          : isLightMode
                            ? "border-[#9a7400]/20 bg-[#FFD54A]/10 text-[#765b00]"
                            : "border-[#FFD54A]/20 bg-[#FFD54A]/10 text-[#FFE27A]"
                    }`}
                  >
                    {viewerStatus === "verified" ? (
                      <ShieldCheck size={15} />
                    ) : (
                      <ShieldX size={15} />
                    )}
                    {viewerStatus === "verified"
                      ? "You are Discord verified."
                      : viewerStatus === "ineligible"
                        ? "You are not eligible for the leaderboards."
                        : "You are not Discord verified."}
                  </div>
                  <div
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${
                      isLightMode
                        ? "border-black/10 bg-white/80 text-zinc-600"
                        : "border-white/10 bg-white/[0.05] text-zinc-300"
                    }`}
                  >
                    Top 7 CCG · Top 7 TCG
                  </div>
                </div>
              </div>
              <div className="relative mx-auto shrink-0 lg:mx-8">
                <div className="absolute inset-0 scale-125 rounded-full bg-[#FFD54A]/20 blur-3xl" />
                <div
                  className={`relative flex h-32 w-32 items-center justify-center rounded-full border-4 shadow-[0_20px_50px_rgba(0,0,0,.25)] sm:h-40 sm:w-40 ${
                    isLightMode
                      ? "border-[#d5b63d] bg-gradient-to-br from-[#fff6bd] to-[#e3bd2b] text-[#604800]"
                      : "border-[#FFE27A] bg-gradient-to-br from-[#FFD54A] to-[#a87500] text-[#241a00]"
                  }`}
                >
                  <Trophy className="h-16 w-16 sm:h-20 sm:w-20" />
                  <div className="absolute inset-2 rounded-full border border-white/40" />
                </div>
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
                  isLightMode ? "border-zinc-300" : "border-zinc-600"
                }`}
              />
              <div
                className={`mt-4 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Loading leaderboard…
              </div>
            </div>
          ) : (
            <>
              {renderLeaderboardSection("CCG", "Kayou", ccgLeaders, "ccg")}
              {renderLeaderboardSection(
                "TCG",
                "Trading Card Game",
                tcgLeaders,
                "tcg",
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};
export default Leaderboard;

import ProfileAvatar from "@/components/ProfileAvatar";
import CardImage from "@/components/CardImage";
import { useEffect,useState } from "react";
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
type LeaderboardUser={
  id: string;
  username: string;
  avatar_url?: string|null;
  total: number;
};
const LEADERBOARD_USER_ID="94a1c998-d040-4dd2-b2fb-5f606287139d";
const Leaderboard=() => {
  const [ccgLeaders,setCcgLeaders]=useState<LeaderboardUser[]>([]);
  const [tcgLeaders,setTcgLeaders]=useState<LeaderboardUser[]>([]);
  const [loading,setLoading]=useState(true);
  const [showVerificationNotice,setShowVerificationNotice]=useState(true);
  const [viewerStatus,setViewerStatus]=useState<
    "verified"|"unverified"|"ineligible"
  >("unverified");
  const [isLightMode,setIsLightMode]=useState(() => {
    if(typeof document==="undefined") return false;
    const root=document.documentElement;
    return root.dataset.theme==="light"||root.classList.contains("light");
  });
  useEffect(() => {
    const syncTheme=() => {
      const root=document.documentElement;
      setIsLightMode(
        root.dataset.theme==="light"||
        root.classList.contains("light")||
        !root.classList.contains("dark"),
      );
    };
    syncTheme();
    const observer=new MutationObserver(syncTheme);
    observer.observe(document.documentElement,{
      attributes: true,
      attributeFilter: ["class","data-theme"],
    });
    window.addEventListener("themechange",syncTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("themechange",syncTheme);
    };
  },[]);
  useEffect(() => {
    const loadLeaderboards=async () => {
      setLoading(true);
      try {
        const { data: ccgProfiles,error: ccgProfilesError }=await supabase
          .from("profiles")
          .select("id, username, avatar_url, iso_hidden_sets, collection_total")
          .gte("collection_total",1200);
        if(ccgProfilesError) {
          console.error("CCG leaderboard profiles error:",ccgProfilesError);
          return;
        }
        const { data: tcgProfiles,error: tcgProfilesError }=await supabase
          .from("profiles")
          .select("id, username, avatar_url, iso_hidden_sets, collection_total")
          .gte("collection_total",450);
        if(tcgProfilesError) {
          console.error("TCG leaderboard profiles error:",tcgProfilesError);
          return;
        }
        const { data: tradingProfiles,error: tradingError }=await supabase
          .from("trading_profiles")
          .select("user_id, discord_username, trade_access_revoked");
        if(tradingError) {
          console.error("Leaderboard trading profile error:",tradingError);
          return;
        }
        const eligibleUserIds=new Set(
          (tradingProfiles||[])
            .filter(
              (profile: any) =>
                profile.discord_username&&
                profile.discord_username.trim()!==""&&
                !profile.trade_access_revoked,
            )
            .map((profile: any) => profile.user_id),
        );
        const {
          data: { session },
        }=await supabase.auth.getSession();
        const viewerTradingProfile=(tradingProfiles||[]).find(
          (profile: any) => profile.user_id===session?.user?.id,
        );
        const { data: excludedUsers,error: exclusionsError }=await supabase
          .from("leaderboard_exclusions")
          .select("user_id");
        if(exclusionsError) {
          console.error("Leaderboard exclusions error:",exclusionsError);
          return;
        }
        const excludedUserIds=new Set(
          (excludedUsers||[]).map((user: any) => user.user_id),
        );
        const viewerIsExcluded=session?.user?.id
          ? excludedUserIds.has(session.user.id)
          :false;
        if(viewerTradingProfile?.trade_access_revoked||viewerIsExcluded) {
          setViewerStatus("ineligible");
        } else if(
          viewerTradingProfile?.discord_username&&
          viewerTradingProfile.discord_username.trim()!==""
        ) {
          setViewerStatus("verified");
        } else {
          setViewerStatus("unverified");
        }
        const filterEligible=(profiles: any[]) =>
          profiles.filter(
            (profile: any) =>
              eligibleUserIds.has(profile.id)&&
              !excludedUserIds.has(profile.id),
          );
        const eligibleCcgProfiles=filterEligible(ccgProfiles||[]);
        const eligibleTcgProfiles=filterEligible(tcgProfiles||[]);
        const allEligibleIds=Array.from(
          new Set([
            ...eligibleCcgProfiles.map((profile: any) => profile.id),
            ...eligibleTcgProfiles.map((profile: any) => profile.id),
          ]),
        );
        if(allEligibleIds.length===0) {
          setCcgLeaders([]);
          setTcgLeaders([]);
          return;
        }
        const { data: progressTotals,error: progressError }=
          await supabase.rpc("get_leaderboard_progress_totals",{
            p_user_ids: allEligibleIds,
          });
        if(progressError) {
          console.error(
            "Leaderboard collection progress error:",
            progressError,
          );
          return;
        }
        const ccgTotals=new Map<string,number>(
          (progressTotals||[]).map((row: any) => [
            row.user_id,
            Number(row.ccg_total)||0,
          ]),
        );
        const tcgTotals=new Map<string,number>(
          (progressTotals||[]).map((row: any) => [
            row.user_id,
            Number(row.tcg_total)||0,
          ]),
        );
        const ccgLeaderboard=eligibleCcgProfiles
          .map((profile: any) => ({
            id: profile.id,
            username: profile.username||"Anonymous",
            avatar_url: profile.avatar_url,
            total: ccgTotals.get(profile.id)||0,
          }))
          .sort((a,b) => b.total-a.total)
          .slice(0,7);
        const tcgLeaderboard=eligibleTcgProfiles
          .map((profile: any) => ({
            id: profile.id,
            username: profile.username||"Anonymous",
            avatar_url: profile.avatar_url,
            total: tcgTotals.get(profile.id)||0,
          }))
          .sort((a,b) => b.total-a.total)
          .slice(0,7);
        setCcgLeaders(ccgLeaderboard);
        setTcgLeaders(tcgLeaderboard);
      } catch(error) {
        console.error("Leaderboard loading error:",error);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboards();
  },[]);
  const renderAvatarEffects=(user: LeaderboardUser) => {
    if(user.id!==LEADERBOARD_USER_ID) {
      return null;
    }
    return (
      <>
        {[
          { left: "24%",delay: "0s" },
          { left: "50%",delay: ".45s" },
          { left: "76%",delay: ".9s" },
        ].map((line,index) => (
          <div
            key={index}
            className="pointer-events-none absolute z-[2]"
            style={{
              left: `calc(${line.left} - 9px)`,
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
  const renderTopThree=(
    leaders: LeaderboardUser[],
    section: "ccg"|"tcg",
  ) => {
    const podium=leaders.slice(0,3).map((user,index) => ({
      user,
      rank: index+1,
    }));
    return (
      <div className="grid items-stretch gap-3 pt-4 sm:grid-cols-3">
        {podium.map(({ user,rank }) => {
          const { avatar,verification }=getProfileAssets(user);
          const orderClass=
            rank===1
              ? "order-1 sm:order-2"
              :rank===2
                ? "order-2 sm:order-1"
                :"order-3 sm:order-3";
          const rankLabel=
            rank===1? "Champion":rank===2? "Runner-up":"Third Place";
          return (
            <div
              key={`${section}-${user.id}`}
              className={`relative grid min-w-0 grid-cols-[8rem_minmax(0,1fr)] items-center gap-x-3 overflow-hidden rounded-2xl border p-3 text-left sm:flex sm:flex-col sm:gap-0 sm:p-4 sm:text-center ${orderClass} ${rank===1
                  ? isLightMode
                    ? "border-[#d1a900]/50 bg-gradient-to-b from-[#fff9d9] via-white to-[#fffdf4]"
                    :"border-[#FFD54A]/45 bg-gradient-to-b from-[#302711] via-[#1c1a13] to-[#151718]"
                  :rank===2
                    ? isLightMode
                      ? "border-slate-300 bg-gradient-to-b from-slate-100 via-white to-white"
                      :"border-slate-400/25 bg-gradient-to-b from-slate-400/10 to-[#151718]"
                    :isLightMode
                      ? "border-amber-700/20 bg-gradient-to-b from-amber-100/70 via-white to-white"
                      :"border-amber-500/20 bg-gradient-to-b from-amber-700/10 to-[#151718]"
                }`}
            >
              <div
                className={`pointer-events-none absolute left-1/2 top-0 h-28 w-40 -translate-x-1/2 rounded-full blur-3xl ${rank===1
                    ? "bg-[#FFD54A]/25"
                    :rank===2
                      ? "bg-slate-300/15"
                      :"bg-amber-500/10"
                  }`}
              />
              <div
                className={`absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border ${rank===1
                    ? "border-[#FFE27A]/60 bg-[#FFD54A] text-[#2b2100]"
                    :rank===2
                      ? "border-slate-200 bg-slate-300 text-slate-700"
                      :"border-amber-300/60 bg-amber-600 text-amber-50"
                  }`}
              >
                {rank===1? <Crown size={20} />:<Medal size={19} />}
              </div>
              <div className="relative row-span-3 flex h-36 w-32 items-center justify-center sm:mx-auto sm:h-auto sm:w-full sm:max-w-60 sm:aspect-square">
                <div className="relative h-20 w-20 shrink-0 sm:h-[60%] sm:w-[60%]">
                  <ProfileAvatar
                    profile={user}
                    src={avatar}
                    alt=""
                    className="h-full w-full rounded-[22%] object-cover"
                  />
                  {renderAvatarEffects(user)}
                </div>
              </div>
              <div className="relative flex w-full min-w-0 items-center gap-1.5 sm:justify-center">
                <div className="truncate text-lg font-bold">
                  {user.username}
                </div>
                {verification&&(
                  <CardImage
                    src={verification.badge}
                    alt={verification.label}
                    title={verification.label}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                )}
              </div>
              <div
                className={`relative mt-1 text-[10px] font-bold uppercase tracking-[0.12em] ${rank===1
                    ? isLightMode
                      ? "text-[#806400]"
                      :"text-[#FFE27A]"
                    :isLightMode
                      ? "text-zinc-500"
                      :"text-zinc-400"
                  }`}
              >
                {rankLabel}
              </div>
              <div className="relative mt-2">
                <div className="text-2xl font-bold tabular-nums">
                  {user.total.toLocaleString()}
                </div>
                <div
                  className={`text-xs ${isLightMode? "text-zinc-500":"text-zinc-400"
                    }`}
                >
                  cards collected
                </div>
              </div>
              <div
                className={`absolute inset-x-0 bottom-0 h-1.5 ${rank===1
                    ? "bg-[#FFD54A]"
                    :rank===2
                      ? "bg-slate-300"
                      :"bg-amber-600"
                  }`}
              />
              <div
                className={`absolute left-4 top-4 text-4xl font-black opacity-[0.08] ${isLightMode? "text-black":"text-white"
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
  const renderRemainingRanks=(
    leaders: LeaderboardUser[],
    section: "ccg"|"tcg",
  ) => {
    const remaining=leaders.slice(3);
    return (
      <div
        className={`mt-4 border-t pt-4 ${isLightMode? "border-black/[0.08]":"border-white/[0.08]"
          }`}
      >
        <div
          className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${isLightMode? "text-zinc-500":"text-zinc-400"
            }`}
        >
          The chase | Ranks 4-{leaders.length}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {remaining.map((user,index) => {
            const rank=index+4;
            const { avatar,verification }=getProfileAssets(user);
            return (
              <div
                key={`${section}-${user.id}`}
                className={`group relative min-w-0 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${isLightMode
                    ? "border-black/10 bg-white hover:border-[#c9a92f]/35"
                    :"border-white/[0.08] bg-[#151718] hover:border-[#FFD54A]/25 hover:bg-white/[0.04]"
                  }`}
              >
                <div className="flex min-w-0 flex-col items-center gap-2 text-center md:flex-row md:gap-4 md:text-left">
                  <div
                    className={`absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black ${isLightMode
                        ? "border-black/10 bg-zinc-100 text-zinc-700"
                        :"border-white/10 bg-white/[0.06] text-zinc-300"
                      }`}
                  >
                    #{rank}
                  </div>
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
                    <ProfileAvatar profile={user} src={avatar} alt="" className="h-16 w-16 rounded-[22%] object-cover sm:h-20 sm:w-20" />
                  </div>
                  <div className="w-full min-w-0 flex-1">
                    <div className="flex min-w-0 items-center justify-center gap-1.5 md:justify-start">
                      <div className="truncate text-sm font-bold">
                        {user.username}
                      </div>
                      {verification&&(
                        <CardImage
                          src={verification.badge}
                          alt={verification.label}
                          title={verification.label}
                          className="h-4 w-4 shrink-0 object-contain"
                        />
                      )}
                    </div>
                    <div
                      className={`mt-0.5 text-xs ${isLightMode? "text-zinc-500":"text-zinc-400"
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
  const renderLeaderboardSection=(
    title: string,
    subtitle: string,
    leaders: LeaderboardUser[],
    section: "ccg"|"tcg",
  ) => {
    return (
      <section
        className={`relative mt-4 overflow-hidden rounded-2xl border p-3 sm:p-4 ${isLightMode
            ? "border-black/10 bg-[#fffefa] shadow-[0_20px_55px_rgba(0,0,0,.06)]"
            :"border-white/[0.08] bg-[#111314] shadow-[0_24px_60px_rgba(0,0,0,.22)]"
          }`}
      >

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isLightMode
                  ? "border-[#c9a92f]/25 bg-[#FFD54A]/15 text-[#765b00]"
                  :"border-[#FFD54A]/20 bg-[#FFD54A]/10 text-[#FFE27A]"
                }`}
            >
              <Trophy size={23} />
            </div>
            <div className="min-w-0">
              <div
                className={`text-xs font-bold uppercase tracking-[0.18em] ${isLightMode? "text-[#7b6200]":"text-[#FFE27A]"
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
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${isLightMode
                ? "border-black/10 bg-white text-zinc-600"
                :"border-white/10 bg-white/[0.05] text-zinc-300"
              }`}
          >
            Top {leaders.length}
          </div>
        </div>
        {leaders.length===0? (
          <div
            className={`rounded-[22px] border px-6 py-10 text-center ${isLightMode
                ? "border-black/10 bg-white text-zinc-500"
                :"border-white/[0.08] bg-[#151718] text-zinc-400"
              }`}
          >
            No eligible collectors are currently available.
          </div>
        ):(
          <div className="relative">
            {renderTopThree(leaders,section)}
            {renderRemainingRanks(leaders,section)}
          </div>
        )}
      </section>
    );
  };
  return (
    <>
      {showVerificationNotice&&(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl overflow-hidden rounded-[26px] border shadow-2xl ${isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                :"border-white/10 bg-[#17191a] text-white"
              }`}
          >
            <div
              className={`border-b px-5 py-4 sm:px-6 ${isLightMode? "border-black/10":"border-white/10"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFD54A]" />
                <div
                  className={`text-sm font-medium ${isLightMode? "text-[#7b6200]":"text-[#FFE27A]"
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
                className={`rounded-2xl p-4 ${isLightMode? "bg-zinc-50":"bg-white/[0.04]"
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
        className={`min-h-screen overflow-x-hidden pb-8 transition-colors ${isLightMode? "bg-[#f5f5f3] text-zinc-900":"bg-[#0d0f10] text-white"
          }`}
      >
        <main className="box-border min-w-0 w-full max-w-full px-3 py-4 sm:px-5 lg:px-6">
          <section
            className={`relative box-border w-full max-w-full overflow-hidden rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${isLightMode
                ? "border-[#c9a92f]/25 bg-gradient-to-br from-[#fffdf2] via-white to-[#fff8d6] shadow-[0_20px_60px_rgba(104,82,0,.10)]"
                :"border-[#FFD54A]/20 bg-gradient-to-br from-[#24200f] via-[#151718] to-[#101112] shadow-[0_24px_70px_rgba(0,0,0,.35)]"
              }`}
          >

            <div className="relative flex items-center justify-between gap-4">
              <div className="max-w-3xl">
                <div
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] ${isLightMode? "text-[#765b00]":"text-[#FFE27A]"
                    }`}
                >
                  <Sparkles size={14} />
                  MLPEKAYOU Hall of Collectors
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                  Collector
                  <span
                    className={`ml-2 ${isLightMode? "text-[#a57f00]":"text-[#FFD54A]"
                      }`}
                  >
                    Leaderboard
                  </span>
                </h1>
                <p
                  className={`mt-2 max-w-2xl text-sm leading-5 ${isLightMode? "text-zinc-600":"text-zinc-400"
                    }`}
                >
                  The leading verified collectors across Kayou CCG and Trading
                  Card Game collections.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <div
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${viewerStatus==="verified"
                        ? isLightMode
                          ? "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-700"
                          :"border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-400"
                        :viewerStatus==="ineligible"
                          ? isLightMode
                            ? "border-red-700/15 bg-red-700/[0.05] text-red-700"
                            :"border-red-400/15 bg-red-400/[0.07] text-red-400"
                          :isLightMode
                            ? "border-[#9a7400]/20 bg-[#FFD54A]/10 text-[#765b00]"
                            :"border-[#FFD54A]/20 bg-[#FFD54A]/10 text-[#FFE27A]"
                      }`}
                  >
                    {viewerStatus==="verified"? (
                      <ShieldCheck size={15} />
                    ):(
                      <ShieldX size={15} />
                    )}
                    {viewerStatus==="verified"
                      ? "You are Discord verified."
                      :viewerStatus==="ineligible"
                        ? "You are not eligible for the leaderboards."
                        :"You are not Discord verified."}
                  </div>
                  <div
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${isLightMode
                        ? "border-black/10 bg-white/80 text-zinc-600"
                        :"border-white/10 bg-white/[0.05] text-zinc-300"
                      }`}
                  >
                    Top 7 CCG | Top 7 TCG
                  </div>
                </div>
              </div>

            </div>
          </section>
          {loading? (
            <div
              className={`mt-4 rounded-[24px] border py-16 text-center ${isLightMode
                  ? "border-black/10 bg-white"
                  :"border-white/[0.08] bg-[#151718]"
                }`}
            >
              <div
                className={`mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${isLightMode? "border-zinc-300":"border-zinc-600"
                  }`}
              />
              <div
                className={`mt-4 text-sm ${isLightMode? "text-zinc-500":"text-zinc-400"
                  }`}
              >
                Loading leaderboard
              </div>
            </div>
          ):(
            <>
              {renderLeaderboardSection("CCG","Kayou",ccgLeaders,"ccg")}
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
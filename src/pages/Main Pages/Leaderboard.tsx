import ProfileAvatar from "@/components/ProfileAvatar";
import CardImage from "@/components/CardImage";
import { useEffect,useState } from "react";
import {
  Crown,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
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
const [showHelp,setShowHelp]=useState(false);
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
const renderTopThree=(leaders: LeaderboardUser[],section: "ccg"|"tcg") => (
  <div className="grid grid-cols-3 items-end gap-2 pb-6 pt-8 sm:gap-5 sm:pt-10">
    {leaders.slice(0,3).map((user,index) => {
      const rank=index+1;
      const { avatar,verification }=getProfileAssets(user);
      const order=rank===1? "order-2":rank===2? "order-1":"order-3";
      return <div key={`${section}-${user.id}`} className={`flex min-w-0 flex-col items-center text-center ${order}`}>
        <div className={`mb-3 flex h-6 items-center gap-1.5 text-xs font-medium ${rank===1? "text-primary":rank===2? isLightMode? "text-slate-600":"text-slate-300":isLightMode? "text-amber-800":"text-amber-500"}`}>
          {rank===1 && <Crown size={17} aria-hidden="true" />}<span>{rank===1? "1st":rank===2? "2nd":"3rd"}</span>
        </div>
        <div className={`relative flex shrink-0 items-center justify-center ${rank===1? "h-28 w-28 sm:h-40 sm:w-40":"h-24 w-24 sm:h-32 sm:w-32"}`}>
          <div className={`relative ${rank===1? "h-[68px] w-[68px] sm:h-24 sm:w-24":"h-14 w-14 sm:h-20 sm:w-20"}`}><ProfileAvatar profile={user} src={avatar} alt="" className="h-full w-full rounded-[22%] object-cover" />{renderAvatarEffects(user)}</div>
        </div>
        <div className="mt-3 flex w-full min-w-0 items-center justify-center gap-1"><span title={user.username} className={`truncate text-xs font-semibold sm:text-base ${rank===1? "text-primary":""}`}>{user.username}</span>{verification && <CardImage src={verification.badge} alt={verification.label} title={verification.label} className="h-3.5 w-3.5 shrink-0 object-contain sm:h-4 sm:w-4" />}</div>
        <div className={`mt-2 font-semibold tabular-nums tracking-tight ${rank===1? "text-2xl sm:text-3xl":"text-xl sm:text-2xl"}`}>{user.total.toLocaleString()}</div>
        <span className={`mt-0.5 text-[10px] sm:text-xs ${isLightMode? "text-zinc-500":"text-zinc-400"}`}>cards collected</span>
      </div>;
    })}
  </div>
);
const renderRemainingRanks=(leaders: LeaderboardUser[],section: "ccg"|"tcg") => (
  <ol start={4} className={`border-t ${isLightMode? "border-black/10":"border-white/10"}`}>
    {leaders.slice(3).map((user,index) => {
      const { avatar,verification }=getProfileAssets(user);
      return <li key={`${section}-${user.id}`} className={`flex min-w-0 items-center gap-3 border-b py-3 sm:gap-4 ${isLightMode? "border-black/[0.07]":"border-white/[0.07]"}`}>
        <span className={`w-5 shrink-0 text-sm tabular-nums ${isLightMode? "text-zinc-500":"text-zinc-400"}`}>{index+4}</span>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center"><ProfileAvatar profile={user} src={avatar} alt="" className="h-10 w-10 rounded-[22%] object-cover" /></div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5"><span title={user.username} className="truncate text-sm font-medium">{user.username}</span>{verification && <CardImage src={verification.badge} alt={verification.label} title={verification.label} className="h-4 w-4 shrink-0 object-contain" />}</div>
        <div className="shrink-0 text-right"><span className="text-base font-semibold tabular-nums sm:text-lg">{user.total.toLocaleString()}</span><span className={`ml-1.5 hidden text-xs sm:inline ${isLightMode? "text-zinc-500":"text-zinc-400"}`}>cards</span></div>
      </li>;
    })}
  </ol>
);
const renderLeaderboardSection=(title: string,subtitle: string,leaders: LeaderboardUser[],section: "ccg"|"tcg") => (
  <section aria-labelledby={`leaderboard-${section}-title`} className="min-w-0">
    <header className={`flex items-baseline justify-between gap-4 border-b pb-3 ${isLightMode? "border-black/15":"border-white/15"}`}><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h2 id={`leaderboard-${section}-title`} className="text-xl font-semibold sm:text-2xl">{title}</h2><span className={`text-xs ${isLightMode? "text-zinc-500":"text-zinc-400"}`}>{subtitle}</span></div><span className={`shrink-0 text-xs ${isLightMode? "text-zinc-500":"text-zinc-400"}`}>Top {leaders.length}</span></header>
    {leaders.length===0? <p className={`py-12 text-sm ${isLightMode? "text-zinc-500":"text-zinc-400"}`}>No eligible collectors are currently available.</p>:<>{renderTopThree(leaders,section)}{renderRemainingRanks(leaders,section)}</>}
  </section>
);
return (
  <>
    <div className={`min-h-screen pb-24 transition-colors sm:pb-10 ${isLightMode? "bg-[#f5f5f3] text-zinc-900":"bg-[#0d0f10] text-white"}`}>
      <main className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className={`border-b pb-5 ${isLightMode? "border-black/10":"border-white/10"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">English Leaderboard</h1><p className={`mt-2 text-sm leading-6 ${isLightMode? "text-zinc-600":"text-zinc-400"}`}>The top seven verified English collectors in Kayou CCG and TCG. Promotional cards are not included.</p></div>
            <button type="button" aria-label="Leaderboard questions" aria-expanded={showHelp} aria-controls="leaderboard-help" onClick={() => setShowHelp(open => !open)} className={`flex h-10 w-10 shrink-0 items-center justify-center border-b-2 text-2xl font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${showHelp? "border-primary text-primary":isLightMode? "border-transparent text-zinc-500 hover:text-zinc-900":"border-transparent text-zinc-400 hover:text-white"}`}>?</button>
          </div>
          <div id="leaderboard-help" role="region" aria-label="Leaderboard questions and answers" aria-hidden={!showHelp} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${showHelp? "grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`}>
            <div className="min-h-0 overflow-hidden">
              <div className={`ml-auto mt-4 max-w-3xl border-t pt-5 ${isLightMode? "border-black/10":"border-white/10"}`}>
                <p className={`text-sm leading-6 ${isLightMode? "text-zinc-600":"text-zinc-400"}`}>This leaderboard is for verified North American collectors of English cards.</p>
                <dl className="mt-4 space-y-5">
                  <div><dt className="text-sm font-semibold sm:text-base">How do I get Discord verified?</dt><dd className={`mt-1 text-sm leading-6 ${isLightMode? "text-zinc-600":"text-zinc-400"}`}>Go to your profile, edit your names, and add your Discord username.</dd></div>
                  <div><dt className="text-sm font-semibold sm:text-base">Why was I removed from the leaderboard?</dt><dd className={`mt-1 text-sm leading-6 ${isLightMode? "text-zinc-600":"text-zinc-400"}`}>You either turned on regional association in your profile or you were removed for varying reasons. Your conduct within or outside of the website is less than appropriate, you are not present in the Discord server to verify your collection is English, or nobody knows who you are and your collection cannot be verified as existing. Open a ticket in the Discord server!</dd></div>
                </dl>
              </div>
            </div>
          </div>
          <div className={`mt-4 flex items-center gap-2 text-xs leading-5 ${viewerStatus==="verified"? isLightMode? "text-emerald-700":"text-emerald-400":viewerStatus==="ineligible"? isLightMode? "text-red-700":"text-red-400":"text-primary"}`}>
            {viewerStatus==="verified"? <ShieldCheck size={16} className="shrink-0" aria-hidden="true" />:<ShieldX size={16} className="shrink-0" aria-hidden="true" />}
            <span>{viewerStatus==="verified"? "You are Discord verified.":viewerStatus==="ineligible"? "You are not eligible for the leaderboards.":"You are not Discord verified."}</span>
          </div>
        </header>
        {loading? <div role="status" className={`flex items-center justify-center gap-3 py-20 text-sm ${isLightMode? "text-zinc-500":"text-zinc-400"}`}><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />Loading leaderboard...</div>:<div className="mt-7 grid items-start gap-10 xl:grid-cols-2 xl:gap-12">{renderLeaderboardSection("CCG","Collectible Card Game (IDK why it's called a game)",ccgLeaders,"ccg")}{renderLeaderboardSection("TCG","Trading Card Game",tcgLeaders,"tcg")}</div>}
      </main>
    </div>
  </>
);
};
export default Leaderboard;

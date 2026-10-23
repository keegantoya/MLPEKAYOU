import CardImage from "@/components/CardImage";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight, X, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ExploreProfile from "./explore-profile";
import { getProfileAssets } from "./profile-assets";
import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";
import ownerBadge from "/website-assets/OwnerBadge.webp";
const Explore = () => {
const searchRequest = useRef(0);
const profileRequest = useRef(0);
  useEffect(() => () => { searchRequest.current++; profileRequest.current++; }, []);
const [collectorCount, setCollectorCount] = useState(0);
const [userSearch, setUserSearch] = useState("");
const [searchResults, setSearchResults] = useState<any[]>([]);
const [searchingUsers, setSearchingUsers] = useState(false);
const [selectedUser, setSelectedUser] = useState<any>(null);
const [selectedUserTradingProfile, setSelectedUserTradingProfile] = useState<any>(null);
const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
    useEffect(() => {
const loadStats = async () => {
const { count: collectors } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });
            setCollectorCount(collectors ?? 0);
        };
        loadStats();
    }, []);
    useEffect(() => {
let mounted = true;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const syncFromDocument = () => {
            if (!mounted)
                return;
            setIsLightMode(document.documentElement.dataset.theme === "light");
        };
const observer = new MutationObserver(syncFromDocument);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });
const loadThemePreference = async () => {
const { data: { session }, } = await supabase.auth.getSession();
            if (!mounted)
                return;
            if (!session?.user) {
                syncFromDocument();
                return;
            }
const { data, error } = await supabase
                .from("user_light_mode_preferences")
                .select("user_id")
                .eq("user_id", session.user.id)
                .maybeSingle();
            if (!mounted)
                return;
            if (error) {
                console.error("Unable to load Explore theme preference:", error);
            }
            else {
                setIsLightMode(Boolean(data));
            }
            realtimeChannel = supabase
                .channel(`explore-theme-${session.user.id}`)
                .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "user_light_mode_preferences",
                filter: `user_id=eq.${session.user.id}`,
            }, (payload) => {
                if (!mounted)
                    return;
                setIsLightMode(payload.eventType !== "DELETE");
            })
                .subscribe();
        };
        syncFromDocument();
        loadThemePreference();
        return () => {
            mounted = false;
            observer.disconnect();
            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
            }
        };
    }, []);
    useEffect(() => {
const background = isLightMode ? "#f5f5f3" : "#0d0f10";
const previousHtmlBackground = document.documentElement.style.backgroundColor;
const previousBodyBackground = document.body.style.backgroundColor;
        document.documentElement.style.backgroundColor = background;
        document.body.style.backgroundColor = background;
        return () => {
            document.documentElement.style.backgroundColor = previousHtmlBackground;
            document.body.style.backgroundColor = previousBodyBackground;
        };
    }, [isLightMode]);
async function searchUsers(query: string) {
const request = ++searchRequest.current;
        setUserSearch(query);
const trimmedQuery = query.trim();
        if (!trimmedQuery) {
           setSearchingUsers(false);
            setSearchResults([]);
            return;
        }
        setSearchingUsers(true);
const { data: profileMatches, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, vacation_mode")
            .ilike("username", `${trimmedQuery}%`)
            .limit(100);
        if (request !== searchRequest.current) return;
       if (profileError) {
            console.error(profileError);
            setSearchResults([]);
            setSearchingUsers(false);
            return;
        }
const candidateProfiles = profileMatches || [];
        if (candidateProfiles.length === 0) {
            setSearchResults([]);
            setSearchingUsers(false);
            return;
        }
const candidateIds = candidateProfiles.map((profile) => profile.id);
const { data: tradingProfiles, error: tradingError } = await supabase
            .from("trading_profiles")
            .select("user_id, discord_username")
            .in("user_id", candidateIds);
        if (request !== searchRequest.current) return;
       if (tradingError) {
            console.error(tradingError);
            setSearchResults([]);
            setSearchingUsers(false);
            return;
        }
const searchableUserIds = new Set((tradingProfiles || [])
            .filter((profile) => profile.discord_username !== null &&
            String(profile.discord_username).trim().length > 0)
            .map((profile) => profile.user_id));
const sorted = candidateProfiles
            .filter((profile) => searchableUserIds.has(profile.id))
            .sort((a, b) => {
const aq = a.username.toLowerCase();
const bq = b.username.toLowerCase();
const q = trimmedQuery.toLowerCase();
            if (aq === q)
                return -1;
            if (bq === q)
                return 1;
            return aq.localeCompare(bq);
        });
        setSearchResults(sorted);
        setSearchingUsers(false);
    }
  return (
    <div className={`min-h-screen transition-colors duration-200 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <main className="w-full min-w-0 px-3 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-10">
        {selectedUser ? <header className={`mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Explore Equestria</h1><p className="mt-1 text-sm text-muted-foreground">{collectorCount.toLocaleString()} collectors on MLPEKAYOU</p></div></header> : <header className="grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)]">
          <div className="flex min-w-0 flex-col justify-center py-5 sm:py-7 lg:py-8 lg:pr-10">
            <p className="mb-3 text-xs font-semibold tracking-[.12em] text-primary">MLPEKAYOU COMMUNITY</p>
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl xl:text-5xl">Explore Equestria</h1>
            <p className={`mt-4 max-w-xl text-sm leading-6 sm:text-base sm:leading-7 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>Find another collector, browse their cards, and see what they have available for trade or sale.</p>
            <div className={`mt-6 flex items-baseline gap-3 border-t pt-4 sm:mt-8 ${isLightMode ? "border-black/10" : "border-white/10"}`}><strong className="text-3xl font-semibold tabular-nums tracking-tight text-primary">{collectorCount.toLocaleString()}</strong><span className="text-sm text-muted-foreground">collectors on MLPEKAYOU</span></div>
          </div>
          <div className="relative min-w-0 overflow-hidden"><img src="/website-assets/exploreequestria.webp" alt="" draggable={false} className="block h-44 w-full object-cover object-[center_45%] sm:h-56 lg:absolute lg:inset-0 lg:h-full lg:min-h-[300px]" /><div aria-hidden="true" className={`pointer-events-none absolute inset-0 transition-colors duration-200 ${isLightMode ? "bg-[#f5f5f3]/65" : "bg-[#0d0f10]/65"}`} /><div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent to-70% lg:bg-gradient-to-r ${isLightMode ? "from-[#f5f5f3]" : "from-[#0d0f10]"}`} /></div>
        </header>}
        <section aria-labelledby="explore-search-heading" className="mt-6 py-2 sm:mt-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 id="explore-search-heading" className="text-lg font-semibold sm:text-xl">Find a collector</h2><p className="mt-1 text-sm text-muted-foreground">Search by their MLPEKAYOU username.</p></div><details className="group shrink-0 lg:hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-end gap-1.5 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">Games<ChevronDown size={14} aria-hidden="true" className="transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><nav aria-label="Mini games" className="flex flex-col items-end gap-1 pb-1"><Link to="/match-pairs" className="flex min-h-10 items-center gap-2 whitespace-nowrap text-sm transition-colors hover:text-primary">Match Pairs<ArrowUpRight size={13} aria-hidden="true" /></Link><Link to="/go-fish" className="flex min-h-10 items-center gap-2 whitespace-nowrap text-sm transition-colors hover:text-primary">Go Fish<ArrowUpRight size={13} aria-hidden="true" /></Link></nav></details></div>
            <p className="text-xs leading-5 text-muted-foreground">To appear in search, add your Discord username to your profile. Profiles without one can still be shared directly.</p>
            <div className="min-w-0 w-full"><label htmlFor="explore-collector-search" className="sr-only">MLPEKAYOU username</label>
            <div className={`flex min-h-14 items-center gap-3 rounded-lg border px-4 transition-colors focus-within:border-primary ${isLightMode ? "border-black/15 bg-white" : "border-white/15 bg-black/20"}`}>
              <Search size={18} className="shrink-0 text-primary" aria-hidden="true" />
              <input id="explore-collector-search" type="search" value={userSearch} onChange={event => void searchUsers(event.target.value)} placeholder="MLPEKAYOU username" spellCheck={false} autoComplete="off" className={`h-14 min-w-0 flex-1 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:appearance-none ${isLightMode ? "text-zinc-900 placeholder:text-zinc-500" : "text-white placeholder:text-zinc-500"}`} />
              {userSearch && <button type="button" onClick={() => { searchRequest.current++; setSearchingUsers(false); setUserSearch(""); setSearchResults([]); }} aria-label="Clear search" className="flex h-10 w-10 shrink-0 items-center justify-center text-zinc-500 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><X size={17} /></button>}
            </div>
            </div>
          </div>
        {(userSearch.trim() || searchResults.length > 0) && <section aria-label="Collector search results" aria-live="polite" className={`mt-2 border-t pt-1 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
          {searchingUsers ? <p role="status" className="py-4 text-sm text-muted-foreground">Searching...</p> : searchResults.length ? <div className="max-h-[min(360px,50dvh)] overflow-y-auto overscroll-contain">{searchResults.map(user => <button key={user.id} type="button" onClick={async () => {
const request = ++profileRequest.current;
            searchRequest.current++;
            setSearchResults([]); setUserSearch(""); setSearchingUsers(false);
            setSelectedUser(user);
            setSelectedUserTradingProfile(null);
const { data: tradingProfile } = await supabase.from("trading_profiles").select("*").eq("user_id", user.id).single();
            if (request !== profileRequest.current) return;
            setSelectedUserTradingProfile(tradingProfile || null);
            setSearchResults([]);
            setUserSearch("");
          }} className={`group flex min-h-16 w-full min-w-0 items-center gap-3 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${isLightMode ? "border-black/10 hover:bg-black/[0.025]" : "border-white/10 hover:bg-white/[0.025]"}`}>
            <CardImage src={getProfileAssets(user).avatar} alt="" className={`h-10 w-10 shrink-0 rounded-md border object-cover ${isLightMode ? "border-black/10" : "border-white/10"}`} />
            <span className="flex min-w-0 flex-1 items-center gap-2"><span className="truncate text-sm font-semibold">{user.username}</span>{getProfileAssets(user).verification && <CardImage src={getProfileAssets(user).verification!.badge} alt={getProfileAssets(user).verification!.label} title={getProfileAssets(user).verification!.label} className="h-4 w-4 shrink-0 object-contain" />}</span>
            <span className="hidden text-xs text-muted-foreground transition-colors group-hover:text-primary sm:block">View profile</span><ChevronRight size={15} className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
          </button>)}</div> : <p className="py-4 text-sm text-muted-foreground">No collectors found.</p>}
        </section>}
        </section>
        {selectedUser && <section className="min-w-0 pt-5 sm:pt-6" aria-label={`${selectedUser.username}'s profile`}><ExploreProfile user={selectedUser} tradingProfile={selectedUserTradingProfile} lightMode={isLightMode} onClose={() => { profileRequest.current++; setSelectedUser(null); setSelectedUserTradingProfile(null); }} /></section>}
        <section aria-labelledby="explore-badges-heading" className={`mt-6 border-y py-5 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
          <h2 id="explore-badges-heading" className="mb-4 text-sm font-semibold">You miiiight see these badges around... here's what they mean!</h2>
          <dl className="grid gap-5 sm:grid-cols-3 sm:gap-6">
            {[{ badge: verifiedBadge, label: "Moderator", description: "Helps moderate the website and Discord server." }, { badge: elementOfLaughter, label: "Top Supporter", description: "Has spent $1000 or more at StonesTradingCo." }, { badge: ownerBadge, label: "MLPEKAYOU Owner", description: "Developer and owner of MLPEKAYOU and its Discord server." }].map(item => <div key={item.label} className="flex min-w-0 items-start gap-3"><CardImage src={item.badge} alt="" className="h-9 w-9 shrink-0 object-contain" /><div><dt className="text-sm font-semibold">{item.label}</dt><dd className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</dd></div></div>)}
          </dl>
        </section>
      </main>
    </div>
  );
};
export default Explore;

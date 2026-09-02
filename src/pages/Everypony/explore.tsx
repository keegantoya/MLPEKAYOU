import { useEffect, useState } from "react";
import { Search, Users, ArrowUpRight, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ExploreProfile from "./explore-profile";
import { getProfileAssets } from "./profile-assets";
import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";
import ownerBadge from "/website-assets/OwnerBadge.webp";
const Explore = () => {
const [collectorCount, setCollectorCount] = useState(0);
const [userSearch, setUserSearch] = useState("");
const [searchResults, setSearchResults] = useState<any[]>([]);
const [searchingUsers, setSearchingUsers] = useState(false);
const [selectedUser, setSelectedUser] = useState<any>(null);
const [selectedUserTradingProfile, setSelectedUserTradingProfile] = useState<any>(null);
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
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
    if (!mounted) return;
    setIsLightMode(document.documentElement.dataset.theme === "light");
  };
const observer = new MutationObserver(syncFromDocument);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
const loadThemePreference = async () => {
const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!mounted) return;
    if (!session?.user) {
      syncFromDocument();
      return;
    }
const { data, error } = await supabase
      .from("user_light_mode_preferences")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!mounted) return;
    if (error) {
      console.error("Unable to load Explore theme preference:", error);
    } else {
      setIsLightMode(Boolean(data));
    }
    realtimeChannel = supabase
      .channel(`explore-theme-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_light_mode_preferences",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (!mounted) return;
          setIsLightMode(payload.eventType !== "DELETE");
        }
      )
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
    setUserSearch(query);
const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }
    setSearchingUsers(true);
const { data: profileMatches, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `${trimmedQuery}%`)
      .limit(100);
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
    if (tradingError) {
      console.error(tradingError);
      setSearchResults([]);
      setSearchingUsers(false);
      return;
    }
const searchableUserIds = new Set(
      (tradingProfiles || [])
        .filter(
          (profile) =>
            profile.discord_username !== null &&
            String(profile.discord_username).trim().length > 0
        )
        .map((profile) => profile.user_id)
    );
const sorted = candidateProfiles
      .filter((profile) => searchableUserIds.has(profile.id))
      .sort((a, b) => {
const aq = a.username.toLowerCase();
const bq = b.username.toLowerCase();
const q = trimmedQuery.toLowerCase();
        if (aq === q) return -1;
        if (bq === q) return 1;
        return aq.localeCompare(bq);
      });
    setSearchResults(sorted);
    setSearchingUsers(false);
  }
  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
    }`}>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6">
          <section className={`relative overflow-hidden rounded-[32px] border ${
            isLightMode
              ? "border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,.06)]"
              : "border-white/[0.08] bg-[#151718] shadow-[0_18px_50px_rgba(0,0,0,.20)]"
          }`}>
            <div
              className={`absolute inset-0 bg-cover bg-center sm:bg-[center_42%] lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[48%] lg:bg-center ${
                isLightMode
                  ? "opacity-[0.14] sm:opacity-[0.16] lg:opacity-[0.20]"
                  : "opacity-[0.12] sm:opacity-[0.14] lg:opacity-[0.16]"
              }`}
              style={{ backgroundImage: "url('/website-assets/exploreequestria.webp')" }}
            />
            <div className={`absolute inset-0 ${
              isLightMode
                ? "bg-gradient-to-b from-white/90 via-white/82 to-white/92 lg:bg-gradient-to-r lg:from-white lg:via-white/95 lg:to-white/40"
                : "bg-gradient-to-b from-[#151718]/90 via-[#151718]/82 to-[#151718]/92 lg:bg-gradient-to-r lg:from-[#151718] lg:via-[#151718]/95 lg:to-[#151718]/35"
            }`} />
            <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
              <div className="max-w-3xl">
                <div className={`mb-3 text-sm font-semibold ${
                  isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                }`}>
                  MLPEKAYOU Community
                </div>
                <h1 className={`text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl ${
                  isLightMode ? "text-zinc-950" : "text-white"
                }`}>
                  Explore Equestria
                </h1>
                <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                  isLightMode ? "text-zinc-600" : "text-zinc-300"
                }`}>
                  To reduce the amount of inactive users
                  populated upon search, you must have your Discord username set in order to appear here.
                  If you don't want to set your Discord username, your profile is still fully shareable, you just won't
                  be found upon search.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Find collectors", "Discover trades", "View public profiles"].map((label) => (
                    <span
                      key={label}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                        isLightMode
                          ? "border-black/10 bg-black/[0.03] text-zinc-700"
                          : "border-white/10 bg-white/[0.05] text-zinc-300"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:min-w-[320px]">
                <div className={`rounded-2xl border p-5 backdrop-blur-sm ${
                  isLightMode ? "border-black/10 bg-white/85" : "border-white/10 bg-black/20"
                }`}>
                  <div className="flex items-center gap-2">
                    <Users size={18} className={isLightMode ? "text-[#725700]" : "text-[#FFE27A]"} />
                    <span className={`text-sm font-medium ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                      Superfans
                    </span>
                  </div>
                  <div className="mt-2 text-4xl font-semibold tracking-tight">
                    {collectorCount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className="mb-3">
              <h2 className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-zinc-950" : "text-white"}`}>
                Find a collector
              </h2>
              <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Search by MLPEKAYOU username.
              </p>
            </div>
            <div className={`mb-4 flex flex-wrap items-center gap-2 rounded-2xl border p-2.5 ${
              isLightMode
                ? "border-black/[0.08] bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}>
              <span className={`px-1 text-xs font-semibold uppercase tracking-wider ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Badge Key
              </span>
              {[
                {
                  badge: verifiedBadge,
                  label: "Moderator",
                  tooltip: "Has special permissions both in the Discord server and on the website to help moderate",
                },
                {
                  badge: elementOfLaughter,
                  label: "Top Supporter",
                  tooltip: "Has spent $1000 or more at StonesTradingCo",
                },
                {
                  badge: ownerBadge,
                  label: "MLPEKAYOU Owner",
                  tooltip: "Developer and owner of MLPEKAYOU and the Discord server",
                },
              ].map(({ badge, label, tooltip }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`${label}: ${tooltip}`}
                  className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                    isLightMode
                      ? "border-black/[0.07] bg-zinc-50 text-zinc-700"
                      : "border-white/[0.07] bg-white/[0.04] text-zinc-200"
                  }`}
                >
                  <img
                    src={badge}
                    alt={label}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                  <span className="text-xs font-medium">{label}</span>
                  <span
                    role="tooltip"
                    className={`pointer-events-none invisible absolute bottom-full left-1/2 z-[70] mb-2 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border px-3 py-2 text-left text-xs font-normal leading-5 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 ${
                      isLightMode
                        ? "border-black/10 bg-zinc-950 text-white"
                        : "border-white/10 bg-white text-zinc-900"
                    }`}
                  >
                    {tooltip}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative">
              <div className={`flex items-center gap-3 rounded-2xl border px-4 transition-colors ${
                isLightMode
                  ? "border-black/10 bg-white focus-within:border-[#8a6a00]/30"
                  : "border-white/[0.10] bg-[#151718] focus-within:border-[#FFD54A]/30"
              }`}>
                <Search size={19} className={isLightMode ? "text-zinc-500" : "text-zinc-400"} />
                <input
                  value={userSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search by username"
                  spellCheck={false}
                  autoComplete="off"
                  className={`h-16 w-full bg-transparent text-base outline-none ${
                    isLightMode
                      ? "text-zinc-900 placeholder:text-zinc-400"
                      : "text-white placeholder:text-zinc-500"
                  }`}
                />
                {userSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearch("");
                      setSearchResults([]);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isLightMode
                        ? "text-zinc-500 hover:bg-black/[0.05] hover:text-zinc-800"
                        : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                    }`}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {(userSearch.trim() || searchResults.length > 0) && (
                <div className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,.20)] ${
                  isLightMode ? "border-black/10 bg-white" : "border-white/[0.10] bg-[#151718]"
                }`}>
                  {searchingUsers ? (
                    <div className={`px-5 py-5 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[420px] overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={async () => {
                            setSelectedUser(user);
const { data: tradingProfile } = await supabase
                              .from("trading_profiles")
                              .select("*")
                              .eq("user_id", user.id)
                              .single();
                            setSelectedUserTradingProfile(tradingProfile || null);
                            setSearchResults([]);
                            setUserSearch("");
                          }}
                          className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 ${
                            isLightMode
                              ? "border-black/[0.06] hover:bg-zinc-50"
                              : "border-white/[0.06] hover:bg-white/[0.04]"
                          }`}
                        >
                          <img
                            src={getProfileAssets(user).avatar}
                            alt={user.username}
                            className={`h-12 w-12 rounded-2xl border object-cover ${
                              isLightMode ? "border-black/10" : "border-white/10"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">{user.username}</span>
                              {getProfileAssets(user).verification && (
                                <img
                                  src={getProfileAssets(user).verification!.badge}
                                  alt={getProfileAssets(user).verification!.label}
                                  title={getProfileAssets(user).verification!.label}
                                  className="h-4 w-4 shrink-0"
                                />
                              )}
                            </div>
                            <div className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                            </div>
                          </div>
                          <ArrowUpRight size={16} className={isLightMode ? "text-zinc-400" : "text-zinc-500"} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={`px-5 py-6 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                      No collectors found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          {selectedUser ? (
            <section className={`rounded-[28px] border p-3 sm:p-5 ${
              isLightMode
                ? "border-black/10 bg-white shadow-[0_12px_35px_rgba(0,0,0,.05)]"
                : "border-white/[0.08] bg-[#151718]"
            }`}>
              <ExploreProfile
                user={selectedUser}
                tradingProfile={selectedUserTradingProfile}
                onClose={() => {
                  setSelectedUser(null);
                  setSelectedUserTradingProfile(null);
                }}
              />
            </section>
          ) : (
            <section className={`rounded-[28px] border p-6 sm:p-8 ${
              isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
            }`}>
              <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isLightMode
                      ? "bg-[#c89d13]/10 text-[#725700]"
                      : "bg-[#FFD54A]/10 text-[#FFE27A]"
                  }`}>
                    <Search size={21} />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                    Our Community is Here!
                  </h2>
                  <p className={`mt-2 max-w-xl text-sm leading-6 sm:text-base ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}>
                    Search for another collector to see their public profile, Discord information when available, and the trading details they have chosen to share.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    ["Search", "Find someone by their MLPEKAYOU username."],
                    ["Explore", "Open their public collector profile."],
                    ["Connect", "Use shared trading information to reach out."],
                  ].map(([title, description]) => (
                    <div
                      key={title}
                      className={`rounded-2xl border p-4 ${
                        isLightMode
                          ? "border-black/[0.08] bg-zinc-50"
                          : "border-white/[0.07] bg-white/[0.03]"
                      }`}
                    >
                      <div className="text-sm font-semibold">{title}</div>
                      <div className={`mt-1 text-xs leading-5 ${
                        isLightMode ? "text-zinc-500" : "text-zinc-400"
                      }`}>
                        {description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
export default Explore;

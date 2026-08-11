import { useEffect, useState } from "react";
import { Search, Users, Repeat2, ArrowUpRight, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ExploreProfile from "./explore-profile";
import { getProfileAssets } from "./profile-assets";

const Explore = () => {
  const [collectorCount, setCollectorCount] = useState(0);
  const [activeTraders, setActiveTraders] = useState(0);

  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserTradingProfile, setSelectedUserTradingProfile] =
    useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      const { count: collectors } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setCollectorCount(collectors ?? 0);

      const { data: tradeData } = await supabase
        .from("for_trade")
        .select("user_id");

      const uniqueTraders = new Set(
        (tradeData ?? []).map((row) => row.user_id)
      );

      setActiveTraders(uniqueTraders.size);
    };

    loadStats();
  }, []);

  async function searchUsers(query: string) {
    setUserSearch(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `${query}%`)
      .limit(100);

    if (error) {
      console.error(error);
      setSearchResults([]);
    } else {
      const sorted = (data || []).sort((a, b) => {
        const aq = a.username.toLowerCase();
        const bq = b.username.toLowerCase();
        const q = query.toLowerCase();

        if (aq === q) return -1;
        if (bq === q) return 1;

        return aq.localeCompare(bq);
      });

      setSearchResults(sorted);
    }

    setSearchingUsers(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#151515] font-['Oxanium'] text-white">

      {/* =========================================================
          STARK INDUSTRIES BACKGROUND SYSTEM
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        {/* Graphite foundation */}
        <div className="absolute inset-0 bg-[#151515]" />

        {/* Soft steel lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#292929_0%,#1B1B1B_34%,#151515_72%)]" />

        {/* Very restrained yellow illumination */}
        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#FFD43B]/[0.045] blur-[180px]" />

        {/* Engineering grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,212,59,.45) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,212,59,.45) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Micro grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)
            `,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Structural lines */}
        <div className="absolute left-[12%] top-0 h-full w-px bg-white/[0.035]" />
        <div className="absolute left-[88%] top-0 h-full w-px bg-white/[0.035]" />

        <div className="absolute left-0 top-[34%] h-px w-full bg-white/[0.025]" />
        <div className="absolute left-0 top-[78%] h-px w-full bg-white/[0.025]" />
      </div>

      {/* =========================================================
          PAGE
      ========================================================= */}
      <main className="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

        {/* =======================================================
            TOP SYSTEM BAR
        ======================================================= */}
        <div className="mb-5 flex items-center justify-between border-y border-[#373737] bg-[#191919] px-4 py-2.5 sm:px-5">

          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-[#FFD43B] shadow-[0_0_12px_rgba(255,212,59,.45)]" />

            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#FFD43B] sm:text-[10px]">
              MLPEKAYOU / NETWORK
            </span>

            <span className="hidden text-[9px] uppercase tracking-[0.2em] text-[#888] sm:inline">
              /
            </span>

            <span className="hidden text-[9px] uppercase tracking-[0.2em] text-[#777] sm:inline">
              EXPLORATION MODULE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Activity size={12} className="text-green-400" />

            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-green-400 sm:text-[9px]">
              ONLINE
            </span>
          </div>
        </div>

        {/* =======================================================
            HERO / SYSTEM INTRO
        ======================================================= */}
        <section className="relative mb-5 overflow-hidden border border-[#3A3A3A] bg-[#1C1C1C]">

          {/* Left yellow system rail */}
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#FFD43B]" />

          {/* Technical corner */}
          <div className="absolute right-0 top-0 h-16 w-16 border-l border-b border-[#3A3A3A]" />
          <div className="absolute right-0 top-0 h-px w-10 bg-[#FFD43B]" />
          <div className="absolute right-0 top-0 h-10 w-px bg-[#FFD43B]" />

          {/* Image — now treated as secondary texture */}
          <div
            className="absolute inset-y-0 right-0 hidden w-[42%] opacity-[0.12] grayscale lg:block"
            style={{
              backgroundImage:
                "url('/website-assets/exploreequestria.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative grid min-w-0 lg:grid-cols-[58%_42%]">

            {/* Main title */}
            <div
              className="min-w-0 max-w-full overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 lg:pr-8"
              style={{ position: "relative", zIndex: 2 }}
            >

              <div className="mb-5 flex items-center gap-3">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-[#777]">
                  SYSTEM MODULE 04
                </span>

                <div className="h-px w-10 bg-[#FFD43B]/60" />

                <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#FFD43B]">
                  COMMUNITY
                </span>
              </div>

              <h1 className="max-w-full overflow-hidden text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:max-w-[700px] lg:text-7xl">
                Explore
                <span className="block text-[#FFD43B]">
                  Equestria
                </span>
              </h1>

              <p className="mt-6 w-full max-w-full text-sm leading-7 text-[#999] sm:text-base">
                Find other collectors! Explore is a way to find cards on your ISO, trade with others, and more!
                Collectors are typically present in the Discord server if their Discord username is set.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <div className="border border-[#373737] bg-[#171717] px-3 py-2">
                  <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#888]">
                    ACCESS
                  </span>
                  <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-green-400">
                    PUBLIC
                  </span>
                </div>

                <div className="border border-[#373737] bg-[#171717] px-3 py-2">
                  <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#888]">
                    NETWORK
                  </span>
                  <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-[#FFD43B]">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Network statistics */}
            <div className="grid grid-cols-2 border-t border-[#373737] lg:grid-cols-1 lg:border-l lg:border-t-0">

              {/* Collectors */}
              <div className="group relative border-r border-[#373737] p-5 sm:p-6 lg:border-r-0 lg:border-b">

                <div className="absolute left-0 top-0 h-px w-0 bg-[#FFD43B] transition-all duration-300 group-hover:w-full" />

                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={15} className="text-[#FFD43B]" />

                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#777]">
                      COLLECTORS
                    </span>
                  </div>

                  <span className="font-mono text-[8px] text-[#777]">
                    01
                  </span>
                </div>

                <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {collectorCount.toLocaleString()}
                </div>

                <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.25em] text-[#777]">
                  REGISTERED PROFILES
                </div>
              </div>

              {/* Traders */}
              <div className="group relative p-5 sm:p-6 lg:p-6">

                <div className="absolute left-0 top-0 h-px w-0 bg-[#FFD43B] transition-all duration-300 group-hover:w-full" />

                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Repeat2 size={15} className="text-[#FFD43B]" />

                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#777]">
                      TRADERS
                    </span>
                  </div>

                  <span className="font-mono text-[8px] text-[#777]">
                    02
                  </span>
                </div>

                <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {activeTraders.toLocaleString()}
                </div>

                <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.25em] text-[#777]">
                  ACTIVE TRADE NETWORK
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SEARCH MODULE
        ======================================================= */}
        <section className="relative mb-5 border border-[#3A3A3A] bg-[#1B1B1B]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#343434] bg-[#202020] px-4 py-3 sm:px-5">

            <div className="flex items-center gap-3">
              <Search size={14} className="text-[#FFD43B]" />

              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white">
                COLLECTOR DATABASE
              </span>
            </div>

            <span className="hidden font-mono text-[8px] uppercase tracking-[0.25em] text-[#777] sm:block">
              SEARCH / QUERY
            </span>
          </div>

{/* Search input */}
<div className="relative p-4 sm:p-5">
  <div className="relative">
    <Search
      size={18}
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        z-10
        -translate-y-1/2
        text-[#FFD43B]
      "
    />

    <input
      value={userSearch}
      onChange={(e) => searchUsers(e.target.value)}
      placeholder="SEARCH BY USERNAME..."
      spellCheck={false}
      autoComplete="off"
      className="
        h-14
        w-full
        border
        border-[#404040]
        bg-[#151515]
        pl-12
        pr-5
        font-mono
        text-base
        uppercase
        tracking-[0.08em]
        text-white
        outline-none
        placeholder:text-[#555]
        focus:border-[#FFD43B]
        focus:bg-[#181818]
        transition-all
        duration-200
        sm:text-sm
      "
    />
  </div>

  {/* Search status */}
  <div className="mt-3 flex items-center justify-between px-1">
    <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#777]">
      {userSearch.trim()
        ? "QUERY ACTIVE"
        : "ENTER COLLECTOR IDENTIFIER"}
    </span>

    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
      LIVE
    </span>
  </div>

  {/* RESULTS */}
  {(userSearch.trim() || searchResults.length > 0) && (
    <div className="absolute left-4 right-4 top-full z-50 mt-1 overflow-hidden border border-[#444] bg-[#181818] shadow-[0_25px_70px_rgba(0,0,0,.65)]">

      {searchingUsers ? (
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="h-2 w-2 animate-pulse bg-[#FFD43B]" />

          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#FFD43B]">
            SEARCHING DATABASE...
          </span>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="max-h-[420px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {searchResults.map((user, index) => (
            <button
              key={user.id}
              onClick={async () => {
                setSelectedUser(user);

                const { data: tradingProfile } = await supabase
                  .from("trading_profiles")
                  .select("*")
                  .eq("user_id", user.id)
                  .single();

                setSelectedUserTradingProfile(
                  tradingProfile || null
                );

                setSearchResults([]);
                setUserSearch("");
              }}
              className="
                group
                relative
                flex
                w-full
                items-center
                gap-4
                border-b
                border-[#2D2D2D]
                bg-[#181818]
                px-4
                py-4
                text-left
                transition-all
                duration-200
                hover:bg-[#222222]
              "
            >
              {/* Active rail */}
              <div className="absolute bottom-0 left-0 top-0 w-0 bg-[#FFD43B] transition-all duration-200 group-hover:w-1" />

              {/* Index */}
              <span className="hidden w-5 font-mono text-[8px] text-[#777] sm:block">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Avatar */}
              <img
                src={getProfileAssets(user).avatar}
                alt={user.username}
                className="
                  h-11
                  w-11
                  border
                  border-[#3B3B3B]
                  object-cover
                  transition-all
                  duration-200
                  group-hover:border-[#FFD43B]
                "
              />

              {/* Identity */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-white">
                    {user.username}
                  </span>

                  {getProfileAssets(user).verification && (
                    <img
                      src={getProfileAssets(user).verification!.badge}
                      alt={
                        getProfileAssets(user).verification!.label
                      }
                      title={
                        getProfileAssets(user).verification!.label
                      }
                      className="h-4 w-4 shrink-0"
                    />
                  )}
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.25em] text-[#777]">
                  COLLECTOR PROFILE
                </div>
              </div>

              {/* Status */}
              <div className="hidden items-center gap-3 sm:flex">
                <div className="h-1.5 w-1.5 bg-green-400" />

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#777] group-hover:text-[#888]">
                  ACCESS
                </span>

                <ArrowUpRight
                  size={14}
                  className="text-[#444] transition-colors group-hover:text-[#FFD43B]"
                />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-3 h-2 w-2 bg-[#555]" />

          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#888]">
            NO COLLECTORS FOUND
          </div>

          <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
            MODIFY SEARCH PARAMETERS
          </div>
        </div>
      )}
    </div>
  )}
</div>
        </section>

        {/* =======================================================
            PROFILE OUTPUT
        ======================================================= */}
        {selectedUser ? (
          <section className="relative border border-[#3A3A3A] bg-[#1B1B1B]">

            {/* Module header */}
            <div className="flex items-center justify-between border-b border-[#343434] bg-[#202020] px-4 py-3 sm:px-5">

              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-[#FFD43B]" />

                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white">
                  PROFILE OUTPUT
                </span>
              </div>

              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#777]">
                MODULE 04 / 02
              </span>
            </div>

            <div className="p-3 sm:p-5">
              <ExploreProfile
                user={selectedUser}
                tradingProfile={selectedUserTradingProfile}
                onClose={() => {
                  setSelectedUser(null);
                  setSelectedUserTradingProfile(null);
                }}
              />
            </div>
          </section>
        ) : (
          /* =====================================================
             EMPTY STATE
          ===================================================== */
          <section className="relative overflow-hidden border border-[#303030] bg-[#181818]">

            <div className="absolute left-0 top-0 h-px w-24 bg-[#FFD43B]" />

            <div className="grid min-h-[260px] place-items-center px-6 py-12 text-center">

              <div>

                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#3A3A3A] bg-[#202020]">
                  <Search size={21} className="text-[#FFD43B]" />
                </div>

                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[#777]">
                  AWAITING QUERY
                </div>

                <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-[#777]">
                  Search the collector database above to load a public
                  profile and view available trading information.
                </p>

                <div className="mx-auto mt-7 flex items-center justify-center gap-2">
                  <div className="h-px w-8 bg-[#333]" />
                  <div className="h-1 w-1 bg-[#FFD43B]" />
                  <div className="h-px w-8 bg-[#333]" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =======================================================
            FOOTER SYSTEM MARKER
        ======================================================= */}
        <div className="mt-5 flex items-center justify-between border-t border-[#292929] pt-3">

          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#666] sm:text-[8px]">
            MLPEKAYOU COMMUNITY NETWORK
          </span>

          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#666] sm:text-[8px]">
            EXPLORE / 04
          </span>
        </div>

      </main>
    </div>
  );
};

export default Explore;
import { useEffect, useState } from "react";
import { Search, Users, Repeat2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ExploreProfile from "./explore-profile";

import avatar001 from "@/assets/avatars/avatar001.webp";
import avatar002 from "@/assets/avatars/avatar002.webp";
import avatar003 from "@/assets/avatars/avatar003.webp";
import avatar004 from "@/assets/avatars/avatar004.webp";
import avatar005 from "@/assets/avatars/avatar005.webp";
import avatar006 from "@/assets/avatars/avatar006.webp";
import avatar007 from "@/assets/avatars/avatar007.webp";
import avatar008 from "@/assets/avatars/avatar008.webp";
import avatar009 from "@/assets/avatars/avatar009.webp";
import avatar010 from "@/assets/avatars/avatar010.webp";
import avatar011 from "@/assets/avatars/avatar011.webp";
import avatar012 from "@/assets/avatars/avatar012.webp";
import avatar013 from "@/assets/avatars/avatar013.webp";
import avatar014 from "@/assets/avatars/avatar014.webp";
import avatar015 from "@/assets/avatars/avatar015.webp";
import avatar016 from "@/assets/avatars/avatar016.webp";
import avatar017 from "@/assets/avatars/avatar017.webp";
import avatar018 from "@/assets/avatars/avatar018.webp";
import avatar019 from "@/assets/avatars/avatar019.webp";
import avatar020 from "@/assets/avatars/avatar020.webp";
import avatar021 from "@/assets/avatars/avatar021.webp";
import avatar022 from "@/assets/avatars/avatar022.webp";
import avatar023 from "@/assets/avatars/avatar023.webp";
import avatar024 from "@/assets/avatars/avatar024.webp";
import avatar025 from "@/assets/avatars/avatar025.webp";
import avatar026 from "@/assets/avatars/avatar026.webp";
import avatar027 from "@/assets/avatars/avatar027.webp";
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import KeeganAvatar2 from "@/assets/avatars/keeganpfpnmn.webp";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";

const avatarMap: Record<string, string> = {
  avatar001,
  avatar002,
  avatar003,
  avatar004,
  avatar005,
  avatar006,
  avatar007,
  avatar008,
  avatar009,
  avatar010,
  avatar011,
  avatar012,
  avatar013,
  avatar014,
  avatar015,
  avatar016,
  avatar017,
  avatar018,
  avatar019,
  avatar020,
  avatar021,
  avatar022,
  avatar023,
  avatar024,
  avatar025,
  avatar026,
  avatar027,
  heimantouavatar: heimantouAvatar,
  keeganpfpnmn: KeeganAvatar2,
  "keeganpfpnmn.webp": KeeganAvatar2,
  KeeganAvatar: KeeganAvatar,
  "keeganpfp": KeeganAvatar,
  maipfp: maipfp,
  "maipfp.webp": maipfp,
  TerriAvatar: TerriAvatar,
  "terrypfp": TerriAvatar,
};

const VERIFIED_USERS: Record<
  string,
  {
    badge: string;
    label: string;
  }
> = {
  // MLPEKAYOU STAFF (Gold)
  "17e57e39-bc0c-44e7-b373-ac34c6690185": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "94a1c998-d040-4dd2-b2fb-5f606287139d": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "408a516c-ee80-4ff8-a869-493e1fd5d961": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "6247b70d-3f55-493c-8eee-3badedf581db": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
    "2e62bcda-f311-42a1-bf32-cfe74a43d3ef": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  "325585dd-c617-4dd2-8314-d608273cd5f6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
  "22f7a392-b5b5-4aec-a3b3-6546071593fd": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
};

const Explore = () => {

     const [collectorCount, setCollectorCount] = useState(0);
     const [activeTraders, setActiveTraders] = useState(0);

  const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [selectedUser, setSelectedUser] =
  useState<any>(null);
  const [selectedUserTradingProfile, setSelectedUserTradingProfile] =
  useState<any>(null);

    useEffect(() => {
    const loadStats = async () => {
      //
      // Total collectors
      //
      const { count: collectors } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setCollectorCount(collectors ?? 0);
      //
      // Active traders
      //
      const { data: tradeData } = await supabase
        .from("for_trade")
        .select("user_id");

      const uniqueTraders = new Set(
        (tradeData ?? []).map((row) => row.user_id)
      );

      setActiveTraders(uniqueTraders.size);
      //
      // Average collection size
      //
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
<div className="relative min-h-screen overflow-hidden bg-[#090909] font-['Oxanium']">

  {/* Background */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">

    {/* Base Gradient */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1a1a_0%,#0d0d0d_45%,#050505_100%)]" />

    {/* Gold Glow */}
    <div className="absolute -top-64 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#E7C84B]/10 blur-[180px]" />

    {/* Bottom Glow */}
    <div className="absolute bottom-[-250px] right-[-150px] h-[550px] w-[550px] rounded-full bg-[#E7C84B]/5 blur-[170px]" />

    {/* Circuit Grid */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(231,200,75,.25) 1px, transparent 1px),
          linear-gradient(90deg, rgba(231,200,75,.25) 1px, transparent 1px)
        `,
        backgroundSize: "70px 70px",
      }}
    />

    {/* Fine Grid */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)
        `,
        backgroundSize: "14px 14px",
      }}
    />

    {/* Scan Lines */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        background:
          "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(255,255,255,.25) 4px)",
      }}
    />

    {/* Animated Vertical Lines */}
    <div className="absolute left-[18%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#E7C84B]/40 to-transparent animate-pulse" />
    <div className="absolute left-[42%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
    <div className="absolute left-[71%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#E7C84B]/30 to-transparent animate-pulse" />

    {/* Animated Horizontal Lines */}
    <div className="absolute top-[20%] left-0 h-px w-full bg-gradient-to-r from-transparent via-[#E7C84B]/20 to-transparent" />
    <div className="absolute top-[63%] left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    {/* Floating Orbs */}
    <div className="absolute top-24 left-24 h-2 w-2 rounded-full bg-[#E7C84B]/80 shadow-[0_0_25px_#E7C84B] animate-pulse" />
    <div className="absolute top-1/3 right-40 h-3 w-3 rounded-full bg-[#E7C84B]/70 shadow-[0_0_35px_#E7C84B] animate-pulse" />
    <div className="absolute bottom-36 left-1/3 h-2 w-2 rounded-full bg-white/60 shadow-[0_0_18px_white] animate-pulse" />

  </div>

    <div className="relative z-10 max-w-7xl mx-auto px-5 py-10 pb-24 md:pb-10">

{/* COMMAND CENTER HEADER */}
<div className="relative mb-10 overflow-hidden rounded-[32px] border border-[#E7C84B]/30 bg-[#111111] shadow-[0_0_80px_rgba(231,200,75,.15)]">

  {/* Background */}
  <div
    className="absolute inset-0 opacity-25"
    style={{
      backgroundImage:
        "url('/website-assets/exploreequestria.webp')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[#171717]/70 to-black/90" />

  {/* Animated Grid */}
  <div
    className="absolute inset-0 opacity-10"
    style={{
      backgroundImage: `
        linear-gradient(rgba(231,200,75,.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(231,200,75,.15) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px",
    }}
  />

  {/* Glow */}
  <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#E7C84B]/20 blur-[120px]" />

  {/* Scan Line */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute h-32 w-full bg-gradient-to-b from-transparent via-[#E7C84B]/10 to-transparent animate-[scan_8s_linear_infinite]" />
  </div>

  <div className="relative px-10 py-14">

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

      <div>

        <div className="flex items-center gap-3 mb-4">

          <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />

          <span className="uppercase tracking-[0.35em] text-xs text-[#E7C84B]">
            SEARCHING FOR FRIENDSHIP QUEST...
          </span>

        </div>

        <h1 className="text-6xl font-black tracking-tight text-white">

          Explore{" "}

          <span className="text-[#E7C84B]">
            Equestria
          </span>

        </h1>

        <p className="mt-5 max-w-2xl text-lg text-gray-300 leading-8">
          Search collectors, inspect public profiles, discover active traders,
          and connect with the global Kayou collecting community.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4 min-w-[320px]">

        <div className="rounded-2xl border border-[#E7C84B]/20 bg-black/40 backdrop-blur-xl p-5">

          <div className="text-xs uppercase tracking-widest text-gray-400">
            Collectors
          </div>

          <div className="mt-2 text-4xl font-bold text-[#E7C84B]">
            {collectorCount.toLocaleString()}
          </div>

        </div>

      </div>

    </div>

  </div>

</div>

        {/* Search */}
        <div className="relative mb-8 max-w-3xl">
<Search
  size={20}
  className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E7C84B] z-10 pointer-events-none transition-colors duration-300"
/>

<input
  value={userSearch}
  onChange={(e) => searchUsers(e.target.value)}
  placeholder="Search Collector Database..."
  spellCheck={false}
  autoComplete="off"
  className="
    w-full
    h-16
    bg-[#0B0B0B]
    border
    border-[#2F2F2F]
    focus:border-[#E7C84B]
    focus:ring-0
    pl-16
    pr-6
    text-white
    placeholder:text-[#666]
    tracking-wide
    shadow-[inset_0_0_20px_rgba(0,0,0,.45)]
    transition-all
    duration-300
    hover:border-[#555]
  "
/>

{(userSearch.trim() || searchResults.length > 0) && (
  <div className="
absolute
left-0
right-0
mt-3
z-50
overflow-hidden
border
border-[#2F2F2F]
bg-[#090909]
shadow-[0_20px_60px_rgba(0,0,0,.8)]
max-h-96
overflow-y-auto

[scrollbar-width:none]
[-ms-overflow-style:none]
[&::-webkit-scrollbar]:hidden
">

    {searchingUsers ? (
      <div className="px-6 py-5 border-b border-[#1F1F1F] text-[#E7C84B] uppercase tracking-[0.25em] font-mono">
        Searching Database...
      </div>
    ) : searchResults.length > 0 ? (
      searchResults.map((user) => (
        <button
          key={user.id}
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
          className="group relative flex w-full items-center gap-4 border-b border-[#1B1B1B] bg-[#090909] px-5 py-4 text-left transition-all duration-200 hover:bg-[#131313]"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-transparent transition-colors group-hover:bg-[#E7C84B]" />

          <img
            src={
              avatarMap[String(user.avatar_url || "").trim()] ||
              avatar001
            }
            alt={user.username}
            className="h-11 w-11 rounded-md border border-[#333] object-cover transition-colors group-hover:border-[#E7C84B]"
          />

          <div className="flex-1">

            <div className="flex items-center gap-2">

              <span className="font-semibold text-white">
                {user.username}
              </span>

              {VERIFIED_USERS[user.id] && (
                <img
                  src={VERIFIED_USERS[user.id].badge}
                  alt={VERIFIED_USERS[user.id].label}
                  title={VERIFIED_USERS[user.id].label}
                  className="h-5 w-5"
                />
              )}

            </div>

            <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#666]">
              Collector Profile
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="h-2 w-2 rounded-full bg-green-400 opacity-60 transition-opacity group-hover:opacity-100" />

            <span className="text-xl text-[#E7C84B] opacity-0 transition-opacity group-hover:opacity-100">
              →
            </span>

          </div>

        </button>
      ))
    ) : (
      <div className="px-6 py-6 text-center uppercase tracking-[0.25em] text-[#666]">
        No Collectors Found
      </div>
    )}

  </div>
)}

        </div>

            {selectedUser ? (
<ExploreProfile
  user={selectedUser}
  tradingProfile={selectedUserTradingProfile}
  onClose={() => {
    setSelectedUser(null);
    setSelectedUserTradingProfile(null);
  }}
/>
) : (
          <>
          </>
        )}

      </div>
    </div>
  );
};

export default Explore;
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
  .ilike("username", `%${query}%`)
  .order("username")
  .limit(10);

  if (error) {
    console.error(error);
    setSearchResults([]);
  } else {
    setSearchResults(data || []);
  }

  setSearchingUsers(false);
}
return (
  <div className="relative min-h-screen overflow-hidden bg-[#2e2e2e] font-['Oxanium']">

{/* KAYOU BACKGROUND */}
<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
  {Array.from({ length: 15 }).map((_, row) => (
    <div
      key={row}
      className="kayou-row"
      style={{
        top: `${row * 300 - 1500}px`,
        animationDelay: `-${row * 4}s`,
      }}
    >
      {Array.from({ length: 80 }).map((_, i) => (
        <span key={i}>KAYOU U.S.</span>
      ))}
    </div>
  ))}
</div>

    <div className="relative z-10 max-w-7xl mx-auto px-5 py-10 pb-24 md:pb-10">

{/* Header */}
<div
  className="relative overflow-hidden rounded-3xl shadow-lg border border-slate-400 mb-8"
  style={{
    backgroundImage: "url('/website-assets/exploreequestria.webp')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black/35" />

  <div className="relative p-12 text-center">
    <h1 className="text-5xl font-bold text-white drop-shadow-lg">
      Explore Equestria
    </h1>

    <p className="mt-3 text-lg text-white/95 drop-shadow">
      Search collectors, browse public profiles, and discover new trading partners.
    </p>
  </div>
</div>

        {/* Coming Soon */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-amber-700 mb-2">
            🚧 EXPLORE WILL BE REPLACING THE FORUM
          </h2>

          <p className="text-slate-700">
            This page was coded from scratch on 07/02/2026. If you notice any bugs or errors,
            please report them in the MLPEKAYOU Discord server. Keegan is not very good with the
            cosmetic side of things, so if you have any suggestions for design improvements, please
            speak up in server meetings! This page is still being optimized for mobile usage.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-3xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />

          <input
  value={userSearch}
  onChange={(e) => searchUsers(e.target.value)}
  placeholder="Search collectors..."
            className="w-full rounded-xl border border-slate-600 bg-[#202020] pl-12 pr-4 py-4 text-slate-400 placeholder:text-slate-400 shadow-sm"
          />

{(userSearch.trim() || searchResults.length > 0) && (
  <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl max-h-96 overflow-y-auto z-50">

    {searchingUsers ? (
      <div className="px-4 py-4 text-slate-500">
        Searching...
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
  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition text-left"
>
  <img
    src={
      avatarMap[String(user.avatar_url || "").trim()] ||
      avatar001
    }
    alt={user.username}
    className="w-10 h-10 rounded-full object-cover border border-slate-200"
  />

<div>
  <div className="flex items-center gap-2">

    <div className="font-semibold text-slate-900">
      {user.username}
    </div>

    {VERIFIED_USERS[user.id] && (
      <img
        src={VERIFIED_USERS[user.id].badge}
        alt={VERIFIED_USERS[user.id].label}
        title={VERIFIED_USERS[user.id].label}
        className="w-5 h-5"
      />
    )}

  </div>

  <div className="text-xs text-slate-500">
    View Profile
  </div>
</div>
</button>
      ))
    ) : (
      <div className="px-4 py-4 text-slate-500">
        No collectors found.
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
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

              <div className="rounded-2xl bg-[#535252] border-slate-100 shadow-sm p-6">
                <Users className="text-[#dad89a] mb-3" size={30} />
                <h3 className="text-4xl font-bold text-[#dad89a]">
                  {collectorCount.toLocaleString()}
                </h3>
                <p className="text-slate-200 mt-1">Collectors</p>
              </div>

              <div className="rounded-2xl bg-[#535252] border-slate-200 shadow-sm p-6">
                <Repeat2 className="text-[#dad89a]" size={30} />
                <h3 className="text-4xl font-bold text-[#dad89a]">
                  {activeTraders.toLocaleString()}
                </h3>
                <p className="text-slate-200 mt-1">Active Traders</p>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Explore;
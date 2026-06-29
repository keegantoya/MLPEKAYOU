import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
import maipfp from "@/assets/avatars/maipfp.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";

import twilightBroomstick from "/nightmarenight-assets/twilightsparkleonabroomstick.webp";
import candy1 from "/nightmarenight-assets/nmncandy1.webp";
import candy2 from "/nightmarenight-assets/nmncandy2.webp";
import candy3 from "/nightmarenight-assets/nmncandy3.webp";

import nightmareMoonEye from "/nightmarenight-assets/nightmaremooneye.webp";

import elementOfMagic from "/website-assets/elementofmagic.webp";
import elementOfGenerosity from "/website-assets/elementofgenerosity.webp";
import elementOfHonesty from "/website-assets/elementofhonesty.webp";

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";

const avatarMap: Record<string, string> = {
  "avatar001.webp": avatar001,
  "avatar002.webp": avatar002,
  "avatar003.webp": avatar003,
  "avatar004.webp": avatar004,
  "avatar005.webp": avatar005,
  "avatar006.webp": avatar006,
  "avatar007.webp": avatar007,
  "avatar008.webp": avatar008,
  "avatar009.webp": avatar009,
  "avatar010.webp": avatar010,
  "avatar011.webp": avatar011,
  "avatar012.webp": avatar012,
  "avatar013.webp": avatar013,
  "avatar014.webp": avatar014,
  "avatar015.webp": avatar015,
  "avatar016.webp": avatar016,
  "avatar017.webp": avatar017,
  "avatar018.webp": avatar018,
  "avatar019.webp": avatar019,
  "avatar020.webp": avatar020,
  "avatar021.webp": avatar021,
  "avatar022.webp": avatar022,
  "avatar023.webp": avatar023,
  "avatar024.webp": avatar024,
  "avatar025.webp": avatar025,
  "avatar026.webp": avatar026,
  "avatar027.webp": avatar027,
  "keeganpfp.webp": KeeganAvatar,
  "maipfp.webp": maipfp,
  "keeganpfpnmn.webp": KeeganAvatar2,
  "terrypfp.webp": TerriAvatar,
};

const VERIFIED_USERS = {
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

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
    const [rankWorthyCollectors, setRankWorthyCollectors] = useState(0);
    const [totalCardsSitewide, setTotalCardsSitewide] = useState(0);
    const [yourCurrentRank, setYourCurrentRank] = useState<number | null>(null);
const [fallingCandies, setFallingCandies] = useState<any[]>([]);

useEffect(() => {
  const candies = [candy1, candy2, candy3];

  const interval = setInterval(() => {
    const now = Date.now() % 40000;

    const twilight =
  document.getElementById(
    "twilight-flyby"
  );

if (!twilight) return;

const rect =
  twilight.getBoundingClientRect();

if (
  rect.right < 0 ||
  rect.left > window.innerWidth
) {
  return;
}

const x = rect.left;
const y = rect.top + rect.height * 0.7;

    const id =
  Date.now() +
  Math.random();

    setFallingCandies((prev) => [
      ...prev,
      {
        id,
        image:
          candies[
            Math.floor(
              Math.random() *
                candies.length
            )
          ],
        left: x + 65,
top: y,
        size: 22,
      },
    ]);

    setTimeout(() => {
      setFallingCandies((prev) =>
        prev.filter(
          (c) =>
            c.id !== id
        )
      );
    }, 12000);
  }, 250);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
const load = async () => {
        
const { data: profiles } = await supabase
  .from("profiles")
  .select("id, username, avatar_url, iso_hidden_sets, collection_total, rank_worthy");

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
      const profileMap: Record<string, any> = {};
profiles?.forEach((p: any) => {
  profileMap[p.id] = {
    ...p,
    hiddenSets: p.iso_hidden_sets || []
  };
});
const allUsersSorted = (profiles || [])
  .map((u: any) => ({
    id: u.id,
    username: u.username || "Anonymous",
    avatar: u.avatar_url,
    total: u.collection_total || 0,
  }))
  .sort((a: any, b: any) => b.total - a.total);

 const excludedMasteredSets = [
  "Promo Cards",
  "TCG Promos",
  "Andy Price Promo",
];

  console.log(
  allUsersSorted.slice(0, 20).map((u, index) => ({
    user_id: u.id,
    username: u.username,
    avatar_url: u.avatar,
    total: u.total,
    rank: index + 1,
  }))
);

// RANK-WORTHY COLLECTORS
// Users with 3+ completed sets, excluding promos and limited cards
const rankWorthy = (profiles || []).filter(
  (u: any) => u.rank_worthy === true
);

setRankWorthyCollectors(rankWorthy.length);

// TOTAL CARDS SITEWIDE
const totalCards = allUsersSorted.reduce(
  (sum, u) => sum + u.total,
  0
);

setTotalCardsSitewide(totalCards);

// YOUR CURRENT RANK
const {
  data: { session },
} = await supabase.auth.getSession();

const currentUserId = session?.user?.id;

if (currentUserId) {
  const rankIndex = allUsersSorted.findIndex(
    (u: any) => u.id === currentUserId
  );

  setYourCurrentRank(
    rankIndex >= 0 ? rankIndex + 1 : null
  );
} else {
  setYourCurrentRank(null);
}

// SHOW ONLY TOP 12 ON THE PAGE
setLeaders(
  allUsersSorted
    .filter(
      (u: any) =>
        eligibleUserIds.has(u.id) &&
        u.username !== "HeiManTou (Chinese Collector)"
    )
    .slice(0, 12)
);
    };

    load();
  }, []);

const getAvatar = (avatar?: string) => {
  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";

  return (
    avatarMap[file] ||
    avatarMap[`${file}.webp`] ||
    avatar001
  );
};

  const groupMissingBySet = (missing: string[]) => {
  const grouped: Record<string, string[]> = {};

  missing.forEach((entry) => {
    const [setName, rest] = entry.split(" • ");

    if (!grouped[setName]) {
      grouped[setName] = [];
    }

    grouped[setName].push(rest);
  });

  return grouped;
};

  return (
<div
  className="min-h-screen relative overflow-hidden"
style={{
  background: `
    radial-gradient(circle at 20% 15%, rgba(124,90,166,0.12), transparent 22%),
    radial-gradient(circle at 80% 25%, rgba(255,255,255,0.04), transparent 18%),
    radial-gradient(circle at 35% 70%, rgba(124,90,166,0.10), transparent 20%),
    linear-gradient(
      180deg,
      #1a1028 0%,
      #120b1d 45%,
      #090611 100%
    )
  `,
}}
>

<div className="absolute top-0 left-0 right-0 h-[3000px] pointer-events-none overflow-hidden select-none">
  {Array.from({ length: 70 }).map((_, index) => {
    const row = Math.floor(index / 10);
    const col = index % 10;

    return (
      <img
        key={index}
        src={nightmareMoonEye}
        alt=""
        className="absolute"
        style={{
          top: `${row * 220 + (col % 2 ? 60 : 0)}px`,
          left: `${col * 10}%`,
          width: `${40 + ((index * 7) % 20)}px`,
          height: "auto",
          opacity: 0.12,
          transform: `rotate(${(index * 17) % 360}deg)`,
          filter: "blur(0.3px)",
        }}
      />
    );
  })}
</div>

<div className="candy-rain-layer">
  {fallingCandies.map((candy) => (
    <img
      key={candy.id}
      src={candy.image}
      alt=""
      className="falling-candy"
      style={{
  left: `${candy.left}px`,
  top: `${candy.top}px`,
  width: `${candy.size}px`,
}}
    />
  ))}
</div>

<div className="container max-w-7xl mx-auto px-4 pt-10 pb-24 overflow-visible">

  {/* HERO TITLE */}
  <div className="text-center mb-10">
    <div className="relative inline-block">
  {/* Soft glow behind title */}
  <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-yellow-200/30 via-purple-200/20 to-pink-200/30 rounded-full scale-150" />

  {/* Subtitle */}
  <div className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.5em] text-purple-400 mb-2 relative">
    Hall of Fame
  </div>

  {/* Main Title */}
  <h1
    className="
      relative
      text-5xl sm:text-6xl md:text-7xl lg:text-8xl
      font-black
      tracking-[-0.03em]
      leading-none
      mb-2
    "
    style={{
      fontFamily: "Cinzel, serif",
      background: `
        linear-gradient(
          180deg,
          #fff7c2 0%,
          #f8e38c 22%,
          #e7bf45 55%,
          #c88a0a 100%
        )
      `,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 4px 12px rgba(212,160,23,0.18))",
    }}
  >
    Top Collectors
  </h1>

{/* Decorative underline */}
<div className="flex items-center justify-center gap-3 relative">
  <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-purple-300" />
  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-md" />
  <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-purple-300" />
</div>

{/* Leaderboard Disclaimer */}
<p
  className="
    mt-4
    mx-auto
    max-w-3xl
    text-center
    text-[10px]
    sm:text-[11px]
    md:text-xs
    font-medium
    leading-relaxed
    px-4
  "
  style={{
    color: "#e6cf84",
  }}
>
  You are only eligible for this leaderboard if you have your Discord
  username set in your profile and you have verified that you are a North
  American English collector.
</p>
</div>
  </div>

<div
  className="twilight-flyby"
  id="twilight-flyby"
>
  <img
    src={twilightBroomstick}
    alt=""
    className="w-full h-auto"
  />
</div>

{/* STATS BAR */}
<div className="mb-16">
  <div
    className="
  relative overflow-hidden
  backdrop-blur-md
  border border-[#7c5aa6]/35
  rounded-3xl md:rounded-[2rem]
  shadow-[0_20px_60px_rgba(0,0,0,0.55)]
  px-4 sm:px-6 md:px-8
  py-4 sm:py-5 md:py-6
"
style={{
  background: `
    linear-gradient(
      180deg,
      rgba(52,32,72,0.92) 0%,
      rgba(38,23,51,0.95) 50%,
      rgba(26,16,40,0.98) 100%
    )
  `,
}}
  >
    {/* Decorative Glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-12 left-1/4 w-24 h-24 md:w-32 md:h-32 bg-[#d4af37]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 right-1/4 w-28 h-28 md:w-40 md:h-40 bg-[#7c5aa6]/15 rounded-full blur-3xl" />
    </div>

    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">

      {/* Rank-Worthy Collectors */}
      <div className="relative text-center py-3 md:py-1">
        <div className="absolute inset-y-4 right-0 hidden md:block w-px bg-gradient-to-b from-transparent via-purple-200 to-transparent" />

        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-2xl bg-gradient-to-br from-[#342048] to-[#261733]
border border-[#7c5aa6]/40 shadow-sm">
          <span className="text-xl sm:text-2xl">🌟</span>
        </div>

        <div className="text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-purple-500 mb-2 leading-tight px-2">
          Rank-Worthy Collectors
        </div>

        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-purple-900 leading-none">
          {rankWorthyCollectors.toLocaleString()}
        </div>

        <div className="text-[11px] sm:text-xs text-purple-400 mt-2 px-2 leading-tight">
          Completed at least one full set
        </div>
      </div>

      {/* Total Cards */}
      <div className="relative text-center py-3 md:py-1 border-t md:border-t-0 border-purple-100">
        <div className="absolute inset-y-4 right-0 hidden md:block w-px bg-gradient-to-b from-transparent via-purple-200 to-transparent" />

        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-2xl bg-gradient-to-br from-[#342048] to-[#261733]
border border-[#7c5aa6]/40 shadow-sm">
          <span className="text-xl sm:text-2xl">❤️</span>
        </div>

        <div className="text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-purple-500 mb-2 leading-tight px-2">
          Cards Collected on MLPEKAYOU
        </div>

        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-purple-900 leading-none break-words">
          {totalCardsSitewide.toLocaleString()}
        </div>

        <div className="text-[11px] sm:text-xs text-purple-400 mt-2 px-2 leading-tight">
          Owned across all collectors
        </div>
      </div>

      {/* Your Current Rank */}
      <div className="relative text-center py-3 md:py-1 border-t md:border-t-0 border-purple-100">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-2xl bg-gradient-to-br from-[#342048] to-[#261733]
border border-[#7c5aa6]/40 shadow-sm">
          <span className="text-xl sm:text-2xl">👑</span>
        </div>

        <div className="text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-purple-500 mb-2 leading-tight px-2">
          Your Current Rank
        </div>

        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-purple-900 leading-none">
          {yourCurrentRank ? `#${yourCurrentRank.toLocaleString()}` : "—"}
        </div>

        <div className="text-[11px] sm:text-xs text-purple-400 mt-2 px-2 leading-tight">
          Your place on the Leaderboard
        </div>
      </div>

    </div>
  </div>
</div>

  {/* TOP 3 PODIUM */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-6 items-end mb-12 md:mb-12">

    {(window.innerWidth < 768 ? [0, 1, 2] : [1, 0, 2]).map((actualIndex) => {
      const user = leaders[actualIndex];
      if (!user) return null;

      const isFirst = actualIndex === 0;
      const isSecond = actualIndex === 1;
      const isThird = actualIndex === 2;

      return (
        <div
  key={user.id}
  className={`
    relative cursor-pointer rounded-3xl backdrop-blur-md
    transition-all duration-300
    px-6 text-center
    ${isFirst ? "md:scale-110 py-10" : "py-8"}
    ${
      isFirst
        ? "border border-[#f5e6a8]/70 shadow-[0_0_30px_rgba(245,230,168,0.12)]"
        : isSecond
        ? "border border-[#cbbcf0]/60 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        : "border border-[#b38b6d]/60 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
    }
  `}
  style={{
    background: `
      linear-gradient(
        180deg,
        rgba(52,32,72,0.92) 0%,
        rgba(38,23,51,0.95) 50%,
        rgba(26,16,40,0.98) 100%
      )
    `,
  }}
>
          {/* Medal */}
          <div
            className={`
              absolute -top-5 left-1/2 -translate-x-1/2
              w-12 h-12 rounded-full flex items-center justify-center
              text-xl font-bold shadow-lg
              ${isFirst ? "bg-yellow-400 text-black" : ""}
              ${isSecond ? "bg-gray-300 text-black" : ""}
              ${isThird ? "bg-amber-500 text-white" : ""}
            `}
          >
            {actualIndex + 1}
          </div>

          {/* Avatar */}
          <img
            src={getAvatar(user.avatar)}
            className={`
              mx-auto rounded-full border-4 mb-4 object-cover
              ${isFirst ? "w-28 h-28 border-yellow-300" : "w-20 h-20 border-white"}
            `}
          />

          {/* Username + Verified Badge */}
<div className="flex items-center justify-center gap-2 mb-2">
  <div className="text-2xl font-bold text-[#e8e2ff]">
    {user.username}
  </div>

  {VERIFIED_USERS[user.id] && (
    <img
      src={VERIFIED_USERS[user.id].badge}
      alt={VERIFIED_USERS[user.id].label}
      title={VERIFIED_USERS[user.id].label}
      className="w-7 h-7 object-contain shrink-0"
    />
  )}
</div>

          {/* Badge */}
          {isFirst && (
            <div className="inline-block mb-3 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
              Top Collector
            </div>
          )}

          {/* Card Count */}
          <div
            className={`
              font-bold text-[#f5e6a8]
              ${isFirst ? "text-5xl" : "text-4xl"}
            `}
          >
            {user.total.toLocaleString()}
          </div>

          <div className="text-sm text-[#cbbcf0] mt-1">
  cards collected
</div>

{/* HANGING ELEMENT OF HARMONY */}
<img
  src={
    isFirst
      ? elementOfMagic
      : isSecond
      ? elementOfGenerosity
      : elementOfHonesty
  }
  alt="Element of Harmony"
  className={`
  absolute left-1/2 -translate-x-1/2
  object-contain pointer-events-none z-10
  ${isFirst
  ? "w-20 h-20 md:w-28 md:h-28 -bottom-10 md:-bottom-20"
  : "w-16 h-16 md:w-20 md:h-20 -bottom-8 md:-bottom-14"}
`}
  style={{
    filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.18))",
  }}
/>
        </div>
      );
    })}
  </div>

  {/* RANKS 4–12 */}
  <div className="space-y-4 mt-32">
    {leaders.slice(3).map((user, index) => {
      const rank = index + 4;


      return (
        <div
          key={user.id}
          className="
  cursor-pointer
  rounded-2xl
  px-6 py-4
  backdrop-blur-md
  border border-[#7c5aa6]/35
  shadow-[0_10px_30px_rgba(0,0,0,0.45)]
  hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]
  transition-all duration-300
"
style={{
  background: `
    linear-gradient(
      180deg,
      rgba(52,32,72,0.92) 0%,
      rgba(38,23,51,0.95) 50%,
      rgba(26,16,40,0.98) 100%
    )
  `,
}}
        >
<div className="flex items-center gap-3 sm:gap-4">
  {/* Rank */}
  <div className="w-10 sm:w-12 md:w-16 text-lg sm:text-2xl md:text-3xl font-bold text-[#f5e6a8] shrink-0">
    #{rank}
  </div>

  {/* Avatar */}
  <img
    src={getAvatar(user.avatar)}
    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-white shadow-sm shrink-0"
  />

{/* Username + Verified Badge */}
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2 min-w-0">
    <div className="text-sm sm:text-lg md:text-2xl font-semibold text-[#e8e2ff] truncate">
      {user.username}
    </div>

    {VERIFIED_USERS[user.id] && (
      <img
        src={VERIFIED_USERS[user.id].badge}
        alt={VERIFIED_USERS[user.id].label}
        title={VERIFIED_USERS[user.id].label}
        className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 object-contain shrink-0"
      />
    )}
  </div>
</div>

  {/* Total */}
  <div className="text-right shrink-0">
    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-[#f5e6a8] leading-none">
      {user.total.toLocaleString()}
    </div>
    <div className="text-[10px] sm:text-xs md:text-sm text-[#cbbcf0]">
      cards
    </div>
  </div>
</div>
        </div>
      );
    })}
  </div>

</div>
    </div>
  );
};

export default Leaderboard;
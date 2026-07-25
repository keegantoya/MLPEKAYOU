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
    const [yourCurrentRank, setYourCurrentRank] = useState<number | null>(null);
const [fallingCandies, setFallingCandies] = useState<any[]>([]);
const [leaderboardMode, setLeaderboardMode] = useState<"ccg" | "tcg">("ccg");

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
        
const minimumCards =
  leaderboardMode === "ccg" ? 1300 : 450;

const { data: profiles } = await supabase
  .from("profiles")
  .select("id, username, avatar_url, iso_hidden_sets, collection_total, rank_worthy")
  .gte("collection_total", minimumCards);

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

const eligibleIds = (profiles || []).map((p: any) => p.id);

const { data: rawProgress } = await supabase
  .from("collection_progress_raw")
  .select("user_id, set_id, progress")
  .in("user_id", eligibleIds);

const totals = new Map<string, number>();

const ACTIVE_SET_IDS =
  leaderboardMode === "ccg"
    ? new Set([
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
      ])
    : new Set([
        "12",
        "SD",
        "FW",
        "tcgpromos",
      ]);

(rawProgress || []).forEach((row: any) => {
  // Ignore everything except CCG sets
  if (!ACTIVE_SET_IDS.has(String(row.set_id))) {
    return;
  }

  const current = totals.get(row.user_id) || 0;

  const owned = Object.values(row.progress || {}).filter(
    (value: any) =>
      value === true ||
      (typeof value === "object" && value?.owned === true)
  ).length;

  totals.set(row.user_id, current + owned);
});

const allUsersSorted = (profiles || [])
  .map((u: any) => ({
    id: u.id,
    username: u.username || "Anonymous",
    avatar: u.avatar_url,
    total: totals.get(u.id) || 0,
  }))
  .sort((a: any, b: any) => b.total - a.total);

const leaderboardUsers = allUsersSorted.filter(
  (u: any) =>
    eligibleUserIds.has(u.id) &&
    u.username !== "HeiManTou (Chinese Collector)" &&
    u.id !== "6151aa9f-0b2d-4f8f-ab3b-1a09b989e5af"
);

// RANK-WORTHY COLLECTORS
const rankWorthy = (profiles || []).filter(
  (u: any) => u.rank_worthy === true
);

setRankWorthyCollectors(rankWorthy.length);

// YOUR CURRENT RANK
const {
  data: { session },
} = await supabase.auth.getSession();

const currentUserId = session?.user?.id;

if (currentUserId) {
  const rankIndex = leaderboardUsers.findIndex(
    (u: any) => u.id === currentUserId
  );

  setYourCurrentRank(
    rankIndex >= 0 ? rankIndex + 1 : null
  );
} else {
  setYourCurrentRank(null);
}

// SHOW ONLY TOP 6 ON THE PAGE
setLeaders(leaderboardUsers.slice(0, 6));
setLeaders(
  allUsersSorted
    .filter(
      (u: any) =>
        eligibleUserIds.has(u.id) &&
        u.username !== "HeiManTou (Chinese Collector)" &&
        u.id !== "6151aa9f-0b2d-4f8f-ab3b-1a09b989e5af"
    )
    .slice(0, 6)
);
    };

    load();
  }, [leaderboardMode]);

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
  className="min-h-screen relative overflow-hidden font-['Oxanium']"
  style={{
    background: `
      radial-gradient(circle at 15% 15%, rgba(212,175,55,.08), transparent 28%),
      radial-gradient(circle at 85% 25%, rgba(255,215,90,.05), transparent 22%),
      radial-gradient(circle at 50% 100%, rgba(212,175,55,.04), transparent 45%),
      linear-gradient(
        180deg,
        #0b0b0b 0%,
        #141414 45%,
        #1a1a1a 100%
      )
    `,
  }}
>

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
  {/* Subtitle */}
  <div className="text-[10px] sm:text-xs md:text-sm font-['Oxanium'] uppercase tracking-[0.5em] text-[#8d8d8d] mb-2 relative">
    Hall of Fame
  </div>

  {/* Main Title */}
<h1
  className="
    relative
    text-5xl sm:text-6xl md:text-7xl lg:text-8xl
    font-['Oxanium']
    tracking-[-0.03em]
    leading-none
    mb-2
  "
  style={{
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
  }}
>
  Top Collectors
</h1>

<div className="flex justify-center mt-8 mb-10">
  <div
    className="inline-flex overflow-hidden rounded-2xl border"
    style={{
      borderColor: "#3d3d3d",
      background: "#171717",
      boxShadow: "0 10px 30px rgba(0,0,0,.45)",
    }}
  >
    <button
      onClick={() => setLeaderboardMode("ccg")}
      className={`px-6 py-2 font-bold transition ${
        leaderboardMode === "ccg"
          ? "bg-yellow-500 text-black"
          : "bg-[#1f1f1f] text-[#d7d7d7] hover:bg-[#2a2a2a]"
      }`}
    >
      CCG
    </button>

    <button
      onClick={() => setLeaderboardMode("tcg")}
      className={`px-6 py-2 font-bold transition ${
        leaderboardMode === "tcg"
          ? "bg-yellow-500 text-black"
          : "bg-[#1f1f1f] text-[#d7d7d7] hover:bg-[#2a2a2a]"
      }`}
    >
      TCG
    </button>
  </div>
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
    font-['Oxanium']
    leading-relaxed
    px-4
  "
  style={{
    color: "#e6cf84",
  }}
>
  The leaderboard is currently under construction in order to offload much of the website's 
  workload. The functions of the leaderboard will return when a solution is found. Only
  North American collectors are eligible for the leaderboard, and only those with a verified
  Discord profile that are present in the MLPEKayou Discord server.
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
        ? "border border-[#9a9a9a]/60 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        : "border border-[#b38b6d]/60 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
    }
  `}
  style={{
background: `
  linear-gradient(
    180deg,
    rgba(34,34,34,.96) 0%,
    rgba(24,24,24,.98) 55%,
    rgba(15,15,15,1) 100%
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
<div className="relative mx-auto w-fit mb-4">
  <img
    src={getAvatar(user.avatar)}
    className={`
      mx-auto rounded-full border-4 object-cover
      ${isFirst ? "w-28 h-28 border-yellow-300" : "w-20 h-20 border-white"}
    `}
  />

  {user.id === "94a1c998-d040-4dd2-b2fb-5f606287139d" && (
    <>
      {[
        { left: "24%", delay: "0s" },
        { left: "50%", delay: ".45s" },
        { left: "76%", delay: ".9s" },
      ].map((line, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: line.left,
            top: "-16px",
            animation: "stinkFloat 2s ease-in-out infinite",
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
  )}
</div>

          {/* Username + Verified Badge */}
<div className="flex items-center justify-center gap-2 mb-2">
  <div className="text-2xl font-bold text-[#f5f5f5]">
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

          <div className="text-sm text-[#9d9d9d] mt-1">
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
  border border-[#3b3b3b]
  shadow-[0_10px_30px_rgba(0,0,0,0.45)]
  hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]
  transition-all duration-300
"
style={{
background: `
  linear-gradient(
    180deg,
    rgba(34,34,34,.96) 0%,
    rgba(24,24,24,.98) 55%,
    rgba(15,15,15,1) 100%
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
<div className="relative shrink-0">
  <img
    src={getAvatar(user.avatar)}
    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-white shadow-sm"
  />

  {user.id === "94a1c998-d040-4dd2-b2fb-5f606287139d" && (
    <>
      {[
        { left: "24%", delay: "0s" },
        { left: "50%", delay: ".45s" },
        { left: "76%", delay: ".9s" },
      ].map((line, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: line.left,
            top: "-16px",
            animation: "stinkFloat 2s ease-in-out infinite",
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
  )}
</div>

{/* Username + Verified Badge */}
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2 min-w-0">
    <div className="text-sm sm:text-lg md:text-2xl font-semibold text-[#f5f5f5] truncate">
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
    <div className="text-[10px] sm:text-xs md:text-sm text-[#9d9d9d]">
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
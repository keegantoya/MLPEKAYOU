import { useNavigate } from "react-router-dom";
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
import TerriAvatar from "@/assets/avatars/terrypfp.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import celestiasCrown from "/website-assets/celestiascrown.webp";

import berryShineGhost from "/nightmarenight-assets/berryshineghost.webp";

import elementOfMagic from "/website-assets/elementofmagic.webp";
import elementOfLoyalty from "/website-assets/elementofloyalty.webp";
import elementOfKindness from "/website-assets/elementofkindness.webp";
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
  "KeeganAvatar.webp": KeeganAvatar,
  "keeganpfpnmn.webp": KeeganAvatar2,
  "maipfp.webp": maipfp,
  "terrypfp.webp": TerriAvatar,
};

const sets = [
  { id: "1", name: "Eternal Moon First Edition", total: 186 },
  { id: "5", name: "Eternal Rainbow First Edition", total: 146 },
  { id: "7", name: "Fun Moments First Edition", total: 127 },
  { id: "2", name: "Eternal Moon Second Edition", total: 189 },
  { id: "8", name: "Fun Moments Second Edition", total: 136 },
  { id: "3", name: "Eternal Moon Third Edition", total: 290 },
  { id: "11", name: "Fun Moments Third Edition", total: 148 },
  { id: "4", name: "Star First Edition", total: 105 },
  { id: "6", name: "Eternal Rainbow Second Edition", total: 170 },
{ 
  id: "friendshipsbegin",
  dbId: "SD",
  name: "Friendships Begin",
  total: 194
},
{
  id: "fantasywonderland",
  dbId: "FW",
  name: "Fantasy Wonderland",
  total: 191,
  folder: "fantasywonderland",
  prefix: "BP01",
  rarities: {
    C: 48,
    U: 18,
    ER: 6,
    SR: 14,
    SPR: 28,
    GR: 12,
    CR: 12,
    RR: 6,
    PER: 12,
    PSPR: 11,
    PGR: 6,
    PCR: 12,
    PRR: 6,
  }
},
{
  id: "discord",
  dbId: "12",
  name: "Discord",
  total: 191,
},
];

const manualFirstFinishers: Record<string, { username: string; avatar_url?: string }> = {
  "1": {
    username: "Jacob",
    avatar_url: "avatar010.webp"
  },
  "2": {
    username: "Jacob",
    avatar_url: "avatar010.webp"
  },
  "5": {
    username: "Keegan",
    avatar_url: "keeganpfpnmn.webp"
  },
  "6": {
  username: "Mari",
  avatar_url: "avatar021.webp"
  },
  "8": {
  username: "Mari",
  avatar_url: "avatar021.webp"
  },
  "7": {
  username: "Jacob",
  avatar_url: "avatar010.webp"
},
  "fantasywonderland": {
  username: "derpypony",
  avatar_url: "avatar015.webp"
},
  "friendshipsbegin": {
  username: "Mari",
  avatar_url: "avatar021.webp"
  },
    "3": {
  username: "Mari",
  avatar_url: "avatar021.webp"
  },
};

const VERIFIED_USERS: Record<
  string,
  {
    badge: string;
    label: string;
  }
> = {
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

const Community = () => {

  const navigate = useNavigate();

const [activeCategory, setActiveCategory] = useState<
  "star" | "ccg" | "rainbow" | "funmoments" | "tcg"
>("ccg");

  const [firstFinishers, setFirstFinishers] = useState<any>({});
  const [topCollector, setTopCollector] = useState<any>(null);
  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

const getAvatar = (avatar?: string) => {
  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";

  return (
    avatarMap[file] ||
    avatarMap[`${file}.webp`] ||
    avatar001
  );
};

useEffect(() => {
const loadTopCollector = async () => {
  setFirstFinishers(manualFirstFinishers);

  // Get all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url");

  if (!profiles || profiles.length === 0) return;

  // Get all collection progress rows
  const { data: allProgress } = await supabase
    .from("collection_progress_raw")
    .select("user_id, set_id, progress");

  if (!allProgress) return;

  const progressMap = new Map();

for (const row of allProgress) {
  progressMap.set(
    `${row.user_id}-${String(row.set_id)}`,
    row
  );
}

  let bestUser = null;
  let bestCompleted = 0;

    for (const profile of profiles) {
    // Disqualify HeiManTou from Top Collector calculations
    if (profile.id === "cd439365-992b-486c-8f03-928fb7bb6683") {
      continue;
    }
    // Count how many sets this user has fully completed
 const completedSets = sets.filter((set) => {
  const dbId = set.dbId ?? set.id;

const row = progressMap.get(
  `${profile.id}-${String(dbId)}`
);

  if (!row?.progress) return false;

  let ownedCount = 0;

if (dbId === "FW" || dbId === "12") {
const STRUCTURE =
  dbId === "FW"
    ? [
        { prefix: "BP01C", count: 48 },
        { prefix: "BP01U", count: 18 },
        { prefix: "BP01ER", count: 6 },
        { prefix: "BP01SR", count: 14 },
        { prefix: "BP01SPR", count: 28 },
        { prefix: "BP01GR", count: 12 },
        { prefix: "BP01CR", count: 12 },
        { prefix: "BP01RR", count: 6 },
        { prefix: "BP01PER", count: 12 },
        { prefix: "BP01PSPR", count: 11 },
        { prefix: "BP01PGR", count: 6 },
        { prefix: "BP01PCR", count: 12 },
        { prefix: "BP01PRR", count: 6 },
      ]
    : [
        { prefix: "BP02-C", count: 48 },
        { prefix: "BP02-U", count: 18 },
        { prefix: "BP02-ER", count: 6 },
        { prefix: "BP02-SR", count: 14 },
        { prefix: "BP02-SPR", count: 28 },
        { prefix: "BP02-GR", count: 12 },
        { prefix: "BP02-CR", count: 12 },
        { prefix: "BP02-RR", count: 6 },
        { prefix: "BP02-PER", count: 12 },
        { prefix: "BP02-PSPR", count: 11 },
        { prefix: "BP02-PGR", count: 6 },
        { prefix: "BP02-PCR", count: 12 },
        { prefix: "BP02-PRR", count: 6 },
      ];

    const validKeys = new Set(
      STRUCTURE.flatMap(({ prefix, count }) => {
        if (prefix === "BP01ER") {
          return Array.from({ length: 6 }, (_, i) =>
            `BP01ER${String(i + 7).padStart(2, "0")}`
          );
        }

        if (prefix === "BP01PSPR") {
          return [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map(
            (n) => `BP01PSPR${String(n).padStart(2, "0")}`
          );
        }

        return Array.from({ length: count }, (_, i) =>
          `${prefix}${String(i + 1).padStart(2, "0")}`
        );
      })
    );

    ownedCount = Object.entries(row.progress).filter(
      ([key, value]) => value && validKeys.has(key)
    ).length;
  } else {
    ownedCount = Object.values(row.progress).filter(Boolean).length;
  }

  return ownedCount >= set.total;
}).length;

    // Track the highest total
    if (completedSets > bestCompleted) {
      bestCompleted = completedSets;
const totalCardsOwned = allProgress
  .filter(
    (p) =>
      p.user_id === profile.id &&
      String(p.set_id) !== "OTHERMERCH"
  )
  .reduce((total, row) => {
    const count = Object.values(row.progress || {}).filter(
      (value: any) =>
        value === true ||
        (typeof value === "object" && value?.owned === true)
    ).length;

    return total + count;
  }, 0);

bestUser = {
  ...profile,
  completed_sets: completedSets,
  total_cards_owned: totalCardsOwned,
};
    }
  }

  if (bestUser) {
    setTopCollector(bestUser);
  }
};
  loadTopCollector();
}, []);

  return (
 <div
  className="min-h-screen relative overflow-hidden font-['Oxanium']"
style={{
  background: `
    radial-gradient(circle at 15% 10%, rgba(255,215,0,0.05), transparent 30%),
    radial-gradient(circle at 85% 80%, rgba(255,215,0,0.04), transparent 35%),
    linear-gradient(
      180deg,
      #1b1b1b 0%,
      #141414 40%,
      #0d0d0d 100%
    )
  `
}}
>

      <div className="container py-10 max-w-[1600px]">
  <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_260px] gap-8 items-start">

 {/* MOBILE TOP COLLECTOR */}
<div className="xl:hidden mb-8 mt-4">
  <div
    className="
      relative
      overflow-hidden
      rounded-[30px]
      border
      border-[#b98a2b]
      bg-gradient-to-b
      from-[#2f2f2f]
      via-[#1a1a1a]
      to-[#101010]
      shadow-[0_18px_45px_rgba(0,0,0,.45)]
    "
  >
    {/* Metallic shine */}
    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

    {/* Header */}
    <div className="border-b border-[#b98a2b]/40 px-6 py-5 text-center">
      <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#caa24b]">
        Champion
      </div>

      <h2 className="mt-1 text-2xl font-black tracking-wide text-[#f5e4b5]">
        TOP MASTERSETTER
      </h2>
    </div>

    <div className="px-6 py-7">

      {/* Avatar */}
      <div className="relative flex justify-center mb-6">
        <img
          src={celestiasCrown}
          alt="Champion Crown"
          className="absolute -top-8 w-20 z-20 pointer-events-none"
        />

        <img
          src={getAvatar(topCollector?.avatar_url)}
          alt="Top Collector Avatar"
          className="
            w-28
            h-28
            rounded-full
            object-cover
            border-[5px]
            border-[#d7b04c]
            shadow-[0_0_30px_rgba(255,215,0,.18)]
          "
        />
      </div>

      {/* Username */}
      <div className="flex justify-center items-center gap-2 mb-6">
        <span className="text-lg font-bold text-[#f6ead0]">
          {topCollector?.username || "Loading..."}
        </span>

        {topCollector?.id &&
          VERIFIED_USERS[topCollector.id] && (
            <img
              src={VERIFIED_USERS[topCollector.id].badge}
              alt={VERIFIED_USERS[topCollector.id].label}
              title={VERIFIED_USERS[topCollector.id].label}
              className="w-5 h-5"
            />
          )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">

        <div className="rounded-2xl bg-[#151515] border border-[#3a3a3a] p-4 text-center">
          <div className="text-3xl font-black text-[#f4d47c]">
            {(topCollector?.total_cards_owned ?? 0).toLocaleString()}
          </div>

          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8f8f8f]">
            Cards
          </div>
        </div>

        <div className="rounded-2xl bg-[#151515] border border-[#3a3a3a] p-4 text-center">
          <div className="text-3xl font-black text-[#f4d47c]">
            {topCollector?.completed_sets ?? 0}
          </div>

          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8f8f8f]">
            Sets
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-[#b98a2b]/30 pt-4 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-[#caa24b]">
          Most Completed Sets
        </div>
      </div>

    </div>
  </div>
</div>

   {/* LEFT SIDEBAR */}
<aside className="xl:sticky xl:top-6">
  <div
    className="
      rounded-3xl
      bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#111111]
      border border-[#c79b32]
      shadow-[0_15px_35px_rgba(255,193,7,0.12)]
      p-6
    "
  >
    <h2 className="text-xl font-bold text-[#f6d98b] tracking-wide mb-2">
      Categories
    </h2>

    <p className="text-[10px] sm:text-[11px] text-[#b8a878] leading-relaxed mb-6">
      To appear on these leaderboards, you must verify your Discord username in
      your profile and be reachable. These leaderboards are only for North
      American English collectors. You must verify with Keegan to be the
      first finisher.
    </p>

    <div className="space-y-3">

      {/* Star */}
      <button
        onClick={() => setActiveCategory("star" as any)}
        className={`
          w-full flex items-center justify-between
          rounded-2xl px-4 py-3
          border transition-all duration-200
          ${
            activeCategory === ("star" as any)
              ? "bg-gradient-to-r from-[#f4d47c] to-[#d7a62e] border-[#f8e19d] text-black shadow-[0_0_18px_rgba(255,215,0,0.35)]"
              : "bg-[#242424] border-[#4d4d4d] text-[#f2efe6] hover:border-[#c79b32] hover:bg-[#303030]"
          }
        `}
      >
        <span className="flex items-center gap-3">
          <img
            src={elementOfMagic}
            alt="Star"
            className="w-5 h-5 object-contain"
          />
          <span className="font-semibold">Star</span>
        </span>

        <span className="text-lg">›</span>
      </button>

      {/* Moon */}
      <button
        onClick={() => setActiveCategory("ccg")}
        className={`
          w-full flex items-center justify-between
          rounded-2xl px-4 py-3
          border transition-all duration-200
          ${
            activeCategory === "ccg"
              ? "bg-gradient-to-r from-[#f4d47c] to-[#d7a62e] border-[#f8e19d] text-black shadow-[0_0_18px_rgba(255,215,0,0.35)]"
              : "bg-[#242424] border-[#4d4d4d] text-[#f2efe6] hover:border-[#c79b32] hover:bg-[#303030]"
          }
        `}
      >
        <span className="flex items-center gap-3">
          <img
            src={elementOfKindness}
            alt="Moon"
            className="w-5 h-5 object-contain"
          />
          <span className="font-semibold">Moon</span>
        </span>

        <span className="text-lg">›</span>
      </button>

      {/* Rainbow */}
      <button
        onClick={() => setActiveCategory("rainbow" as any)}
        className={`
          w-full flex items-center justify-between
          rounded-2xl px-4 py-3
          border transition-all duration-200
          ${
            activeCategory === ("rainbow" as any)
              ? "bg-gradient-to-r from-[#f4d47c] to-[#d7a62e] border-[#f8e19d] text-black shadow-[0_0_18px_rgba(255,215,0,0.35)]"
              : "bg-[#242424] border-[#4d4d4d] text-[#f2efe6] hover:border-[#c79b32] hover:bg-[#303030]"
          }
        `}
      >
        <span className="flex items-center gap-3">
          <img
            src={elementOfLoyalty}
            alt="Rainbow"
            className="w-5 h-5 object-contain"
          />
          <span className="font-semibold">Rainbow</span>
        </span>

        <span className="text-lg">›</span>
      </button>

      {/* Fun Moments */}
      <button
        onClick={() => setActiveCategory("funmoments" as any)}
        className={`
          w-full flex items-center justify-between
          rounded-2xl px-4 py-3
          border transition-all duration-200
          ${
            activeCategory === ("funmoments" as any)
              ? "bg-gradient-to-r from-[#f4d47c] to-[#d7a62e] border-[#f8e19d] text-black shadow-[0_0_18px_rgba(255,215,0,0.35)]"
              : "bg-[#242424] border-[#4d4d4d] text-[#f2efe6] hover:border-[#c79b32] hover:bg-[#303030]"
          }
        `}
      >
        <span className="flex items-center gap-3">
          <img
            src={elementOfGenerosity}
            alt="Fun Moments"
            className="w-5 h-5 object-contain"
          />
          <span className="font-semibold">Fun Moments</span>
        </span>

        <span className="text-lg">›</span>
      </button>

      {/* TCG */}
      <button
        onClick={() => setActiveCategory("tcg")}
        className={`
          w-full flex items-center justify-between
          rounded-2xl px-4 py-3
          border transition-all duration-200
          ${
            activeCategory === "tcg"
              ? "bg-gradient-to-r from-[#f4d47c] to-[#d7a62e] border-[#f8e19d] text-black shadow-[0_0_18px_rgba(255,215,0,0.35)]"
              : "bg-[#242424] border-[#4d4d4d] text-[#f2efe6] hover:border-[#c79b32] hover:bg-[#303030]"
          }
        `}
      >
        <span className="flex items-center gap-3">
          <img
            src={elementOfHonesty}
            alt="TCG"
            className="w-5 h-5 object-contain"
          />
          <span className="font-semibold">TCG</span>
        </span>

        <span className="text-lg">›</span>
      </button>

    </div>
  </div>
</aside>

{/* MAIN CONTENT */}
<main className="-mt-6 pb-20 xl:pb-0">

  {["star", "ccg", "rainbow", "funmoments"].includes(activeCategory) && (
    <>

<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c79b32]/60 to-transparent" />

  <div
    className="
      px-6 py-2
      rounded-full
      bg-gradient-to-r
      from-[#2b2b2b]
      to-[#181818]
      border border-[#c79b32]
      shadow-[0_0_18px_rgba(255,215,0,0.15)]
      text-sm font-black uppercase tracking-[0.25em]
      text-[#f4d47c]
    "
  >
    CCG
  </div>

  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c79b32]/60 to-transparent" />
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 mb-10">
  {sets
    .filter((set) => {
  if (activeCategory === "star") {
  return ["4"].includes(set.id);
}

  if (activeCategory === "ccg") {
    // Moon
    return ["1", "2", "3"].includes(set.id);
  }

  if (activeCategory === "rainbow") {
  return ["5", "6"].includes(set.id);
}

  if (activeCategory === "funmoments") {
    // Fun Moments First + Second Edition
    return ["7", "8", "11"].includes(set.id);
  }

  return false;
})
    .map((set) => (

<button
  key={set.id}
  onClick={() => navigate(`/community/${set.id}`)}
className="
group
relative
overflow-hidden
rounded-3xl
px-6
py-5
text-left

bg-gradient-to-br
from-[#2d2d2d]
via-[#1c1c1c]
to-[#111111]

border
border-[#c79b32]

shadow-[0_15px_35px_rgba(255,193,7,0.08)]

hover:border-[#f4d47c]
hover:shadow-[0_20px_45px_rgba(255,215,0,0.20)]
hover:-translate-y-1

transition-all
duration-300

min-h-[180px]
"
>

  {/* Set Title */}
  <h2 className="relative text-xl font-bold text-[#f6ead0] pr-28 leading-tight mb-2 min-h-[3rem]">
  {set.name}
</h2>

  {/* Subtitle */}
  <div className="relative text-[11px] font-bold uppercase tracking-wide text-[#d4b15c] mb-3">
    Set Leaderboards
  </div>

  {/* View Link */}
  <div className="relative text-sm font-bold text-[#fff2c6] group-hover:text-[#f6ead0] transition-colors">
    View Leaderboard →
  </div>

{/* Winner / Ghost */}
<div className="absolute top-4 right-4 flex flex-col items-center">
  {firstFinishers[String(set.id)] ? (
    <>
      <div className="relative w-14 h-14">
        <img
          src={getAvatar(firstFinishers[String(set.id)].avatar_url)}
          className="w-14 h-14 rounded-full border-4 border-[#f4d47c]
shadow-xl
ring-2 ring-[#c79b32]"
        />

        <div className="absolute -top-2 -right-2 bg-gradient-to-r
from-[#f4d47c]
to-[#d7a62e]
text-[#111] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          #1
        </div>
      </div>

      <div className="font-semibold text-xs mt-1 text-center max-w-[70px] leading-tight text-[#f6ead0]">
        {firstFinishers[String(set.id)]?.username}
      </div>
    </>
  ) : (
    <img
  src={berryShineGhost}
  alt="No Winner Yet"
  className="w-20 h-20 object-contain opacity-90 animate-[ghostWalk_2.5s_ease-in-out_infinite]"
/>
  )}
</div>
</button>
  ))}
</div>
    </>
  )}

    {activeCategory === "tcg" && (
    <>
<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c79b32]/60 to-transparent" />

  <div
    className="
      px-6 py-2
      rounded-full
      bg-gradient-to-r
      from-[#2b2b2b]
      to-[#181818]
      border border-[#c79b32]
      shadow-[0_0_18px_rgba(255,215,0,0.15)]
      text-sm font-black uppercase tracking-[0.25em]
      text-[#f4d47c]
    "
  >
    TCG
  </div>

  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c79b32]/60 to-transparent" />
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 mb-10">
  {sets
    .filter((set) =>
  [
    "fantasywonderland",
    "discord",
    "friendshipsbegin"
  ].includes(set.id)
)
    .map((set) => (

      <button
  key={set.id}
  onClick={() => navigate(`/community/${set.id}`)}
className="
group
relative
overflow-hidden
rounded-3xl
px-6
py-5
text-left

bg-gradient-to-br
from-[#2d2d2d]
via-[#1c1c1c]
to-[#111111]

border
border-[#c79b32]

shadow-[0_15px_35px_rgba(255,193,7,0.08)]

hover:border-[#f4d47c]
hover:shadow-[0_20px_45px_rgba(255,215,0,0.20)]
hover:-translate-y-1

transition-all
duration-300

min-h-[180px]
"
>
  {/* Soft highlight overlay */}
<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-[#c79b32]/5 pointer-events-none" />

  {/* Set Title */}
 <h2 className="relative text-xl font-bold text-[#f6ead0] pr-28 leading-tight mb-2 min-h-[3rem]">
  {set.name}
</h2>

  {/* Subtitle */}
  <div className="relative text-[11px] font-bold uppercase tracking-wide text-[#d4b15c] mb-3">
    Top Collector
  </div>

  {/* View Link */}
  <div className="relative text-sm font-semibold text-[#f4d47c] group-hover:text-[#f6ead0] transition-colors">
    View Leaderboard →
  </div>

{/* Winner / Ghost */}
<div className="absolute top-4 right-4 flex flex-col items-center">
  {firstFinishers[String(set.id)] ? (
    <>
      <div className="relative w-14 h-14">
        <img
          src={getAvatar(firstFinishers[String(set.id)].avatar_url)}
          className="w-14 h-14 rounded-full border-4 border-[#f4d47c]
shadow-xl
ring-2 ring-[#c79b32]"
        />

        <div className="absolute -top-2 -right-2 bg-gradient-to-r
from-[#f4d47c]
to-[#d7a62e]
text-[#111] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          #1
        </div>
      </div>

      <div className="font-semibold text-xs mt-1 text-center max-w-[70px] leading-tight text-[#f6ead0]">
        {firstFinishers[String(set.id)]?.username}
      </div>
    </>
  ) : (
    <img
  src={berryShineGhost}
  alt="No Winner Yet"
  className="w-20 h-20 object-contain opacity-90 animate-[ghostWalk_2.5s_ease-in-out_infinite]"
/>
  )}
</div>
</button>
  ))}
</div>
    </>
  )}

    </main>

<div
className="
  hidden xl:block
  relative
  -ml-4
  w-[290px]
    overflow-hidden
    rounded-[30px]
    border border-[#b98a2b]
    bg-gradient-to-b from-[#2f2f2f] via-[#1a1a1a] to-[#101010]
    shadow-[0_18px_45px_rgba(0,0,0,.45)]
  "
>
  {/* Metallic shine */}
  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

  {/* Header */}
  <div className="border-b border-[#b98a2b]/40 px-6 py-5 text-center">
    <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#caa24b]">
      Champion
    </div>

    <h2 className="mt-1 text-1xl font-black tracking-wide text-[#f5e4b5]">
      TOP MASTERSETTER
    </h2>
  </div>

  <div className="px-6 py-7">

    {/* Avatar */}
    <div className="relative flex justify-center mb-6">
      <img
        src={celestiasCrown}
        alt="Champion Crown"
        className="absolute -top-8 w-20 z-20 pointer-events-none"
      />

      <img
        src={getAvatar(topCollector?.avatar_url)}
        alt="Top Collector Avatar"
        className="
          w-28
          h-28
          rounded-full
          object-cover
          border-[5px]
          border-[#d7b04c]
          shadow-[0_0_30px_rgba(255,215,0,.18)]
        "
      />
    </div>

    {/* Username */}
    <div className="flex justify-center items-center gap-2 mb-6">
      <span className="text-lg font-bold text-[#f6ead0]">
        {topCollector?.username || "Loading..."}
      </span>

      {topCollector?.id &&
        VERIFIED_USERS[topCollector.id] && (
          <img
            src={VERIFIED_USERS[topCollector.id].badge}
            alt={VERIFIED_USERS[topCollector.id].label}
            title={VERIFIED_USERS[topCollector.id].label}
            className="w-5 h-5"
          />
        )}
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3 mb-6">

      <div className="rounded-2xl bg-[#151515] border border-[#3a3a3a] p-4 text-center">
        <div className="text-3xl font-black text-[#f4d47c]">
          {(topCollector?.total_cards_owned ?? 0).toLocaleString()}
        </div>

        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8f8f8f]">
          Cards
        </div>
      </div>

      <div className="rounded-2xl bg-[#151515] border border-[#3a3a3a] p-4 text-center">
        <div className="text-3xl font-black text-[#f4d47c]">
          {topCollector?.completed_sets ?? 0}
        </div>

        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8f8f8f]">
          Sets
        </div>
      </div>

    </div>

    {/* Footer */}
    <div className="border-t border-[#b98a2b]/30 pt-4 text-center">
      <div className="text-xs uppercase tracking-[0.3em] text-[#caa24b]">
        Most Completed Sets
      </div>
    </div>

  </div>
</div>

  </div>
</div>
</div>
);
};

export default Community;
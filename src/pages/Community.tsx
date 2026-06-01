import KayouHeader from "@/components/KayouHeader";
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
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import celestiasCrown from "/website-assets/celestiascrown.webp";

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
  "KeeganAvatar.webp": KeeganAvatar,
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
}
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
    avatar_url: "KeeganAvatar"
  },
  "8": {
  username: "Mari",
  avatar_url: "avatar003.webp"
  },
  "7": {
  username: "Jacob",
  avatar_url: "avatar010.webp"
},
};

const isoSets = [
   {
    id: "4",
    name: "Star: First Edition",
    folder: "star-one",
    prefix: "S1",
    rarities: {
      SSR: 20,
      SCR: 18,
      UR: 18,
      USR: 15,
      AR: 9,
      OR: 7,
      BP: 9,
      SAR: 9
    }
  },
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7
    }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7
    }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 30,
      UR: 16,
      LSR: 16,
      SGR: 8,
      ZR: 7,
      SC: 7,
      "SHINING ZR": 1
    }
  },
    {
    id: "3",
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      LSR: 32,
      UR: 18,
      SGR: 16,
      ZR: 14,
      SC: 7,
      "SZR": 3
    }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12
    }
  },
  {
    id: "8",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12
    }
  },
    {
    id: "6",
    name: "Rainbow: Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: {
      BASE: 18,
      R: 30,
      SR: 14,
      FR: 18,
      TR: 12,
      TGR: 8,
      ST: 20,
      SSR: 15,
      UR: 19,
      USR: 8,
      XR: 8
    }
  },
  {
    id: "friendshipsbegin",
    name: "Friendships Begin",
    folder: "friendshipsbegin",
    prefix: "SD01",
    rarities: {
  
    }
  }
];

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
  const [setTopThree, setSetTopThree] = useState<Record<string, any[]>>({});
  const [topCollector, setTopCollector] = useState<any>(null);
  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getTradeImage = (setId: string, cardKey: string) => {
  const [rarity, number] = cardKey.split("-");
  const set = isoSets.find((s) => s.id === setId);

  // PROMOS
  if (rarity === "PR") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }

  if (!set) return null;

  return `/cards/${set.folder}/${set.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.webp`;
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

  let bestUser = null;
  let bestCompleted = 0;

    for (const profile of profiles) {
    // Disqualify HeiManTou from Top Collector calculations
    if (profile.id === "cd439365-992b-486c-8f03-928fb7bb6683") {
      continue;
    }
    // Count how many sets this user has fully completed
    const completedSets = sets.filter((set) => {
      const row = allProgress.find(
        (p) =>
          p.user_id === profile.id &&
          String(p.set_id) === String(set.id)
      );

      if (!row?.progress) return false;

      const ownedCount = Object.values(row.progress).filter(Boolean).length;

      return ownedCount >= set.total;
    }).length;

    // Track the highest total
    if (completedSets > bestCompleted) {
      bestCompleted = completedSets;
      const totalCardsOwned = allProgress
  .filter((p) => p.user_id === profile.id)
  .reduce((total, row) => {
    const count = Object.values(row.progress || {}).filter(Boolean).length;
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

useEffect(() => {
const loadSetTopThree = async () => {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url");

  const { data: allProgress } = await supabase
    .from("collection_progress_raw")
    .select("user_id, set_id, progress, updated_at");

  if (!profiles || !allProgress) return;

  const profileMap: Record<string, any> = {};
  profiles.forEach((profile) => {
    profileMap[profile.id] = profile;
  });

  // Same manual placements used in CommunitySet.tsx
  const manualPlacements: Record<string, string[]> = {
    "5": ["Keegan", "Jacob", "Mari"],
    "2": ["Jacob", "Mari", "SillyPony"],
    "8": ["Mari", "Keegan", "Jacob"],
  };

  const results: Record<string, any[]> = {};

for (const set of sets) {

  const actualSetId =
    set.id === "friendshipsbegin"
      ? "SD"
      : set.id === "fantasywonderland"
      ? "FW"
      : String(set.id);

  const rows = allProgress.filter(
    (row) => String(row.set_id) === actualSetId
  );

    let leaderboard = rows
      .map((row) => {
        let owned = 0;

if (set.id === "friendshipsbegin") {

  const BONUS_STRUCTURE = [
    { prefix: "SD01C", count: 9 },
    { prefix: "SD01U", count: 7 },
    { prefix: "SD01SR", count: 6 },
    { prefix: "SD01SPR", count: 10 },
    { prefix: "SD01GR", count: 6 },
    { prefix: "SD01CR", count: 6 },
    { prefix: "SD01ER", count: 6 },
    { prefix: "SD01PER", count: 12 },
    { prefix: "SD01PRR", count: 6 },
  ];

  const getDeckCards = (deckCode: string) => {
    const cards: string[] = [];

    const deckLetter = deckCode.slice(-1);
    const deckIndex = deckLetter.charCodeAt(0) - 64;

    const add = (rarity: string, count: number) => {
      for (let i = 1; i <= count; i++) {
        cards.push(
          `${deckCode}${rarity}${String(i).padStart(2, "0")}`
        );
      }
    };

    add("C", 9);
    add("U", 4);
    add("SR", 2);

    cards.push(`SD01ER${String(deckIndex).padStart(2, "0")}`);

    add("SPR", 4);

    cards.push(`SD01RR${String(deckIndex).padStart(2, "0")}`);

    return cards;
  };

  const starterDecks = [
    "SD01A",
    "SD01B",
    "SD01C",
    "SD01D",
    "SD01E",
    "SD01F",
  ];

  starterDecks.forEach((deck) => {
    const cards = getDeckCards(deck);

    cards.forEach((cardKey) => {
      const stateKey = `STARTER-${cardKey}`;

      if (row.progress?.[stateKey]) {
        owned++;
      }
    });
  });

  BONUS_STRUCTURE.forEach(({ prefix, count }) => {
    for (let i = 1; i <= count; i++) {

      let actualIndex = i;

      if (prefix === "SD01PER") {
        actualIndex = i + 6;
      }

      const key =
        `${prefix}${String(actualIndex).padStart(2, "0")}`;

      const stateKey = `BONUS-${key}`;

      if (row.progress?.[stateKey]) {
        owned++;
      }
    }
  });

} else {

  owned = Object.values(row.progress || {}).filter(
    (value: any) =>
      value === true || value?.owned === true
  ).length;

}
        const profile = profileMap[row.user_id];

        if (!profile) return null;

        const username =
          profile.username === "Collector-f093b8"
            ? ""
            : profile.username;

        return {
          id: profile.id,
          username,
          avatar_url: profile.avatar_url,
          owned,
          updated_at: row.updated_at,
        };
      })
            .filter(
        (player: any) =>
          player &&
          player.username !== "HeiManTou (Chinese Collector)" &&
          player.id !== "cd439365-992b-486c-8f03-928fb7bb6683"
      );

    // Apply manual placements for sets with predetermined order
    if (
  manualPlacements[String(set.id)] &&
  leaderboard.length > 0
) {
      const manualOrder = manualPlacements[String(set.id)];

      leaderboard.sort((a: any, b: any) => {
        const aIndex = manualOrder.indexOf(a.username);
        const bIndex = manualOrder.indexOf(b.username);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        return b.owned - a.owned;
      });
    } else {
      leaderboard.sort((a: any, b: any) => b.owned - a.owned);
    }

    results[String(set.id)] = leaderboard.slice(0, 3);
  }

  setSetTopThree(results);
};

  loadSetTopThree();
}, []);

  return (
 <div
  className="min-h-screen relative overflow-hidden"
  style={{
    background: `
      radial-gradient(circle at 15% 20%, rgba(255,255,255,0.45), transparent 30%),
      radial-gradient(circle at 85% 10%, rgba(255,215,0,0.08), transparent 25%),
      radial-gradient(circle at 50% 80%, rgba(168,85,247,0.08), transparent 35%),
      linear-gradient(180deg, #f8f4ff 0%, #f1e9ff 50%, #ede3ff 100%)
    `,
  }}
>

      <KayouHeader />

      <div className="container py-10 max-w-[1600px]">
  <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_260px] gap-8 items-start">

  {/* MOBILE TOP COLLECTOR */}
  <div className="xl:hidden mb-8 mt-4">
    <div
      className="
        rounded-3xl
        bg-white/70 backdrop-blur-xl
        border border-white/60
        shadow-[0_10px_30px_rgba(76,29,149,0.08)]
        px-6 py-5
        text-center
      "
    >
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-purple-700 mb-4">
        Top Collector
        <span className="text-purple-400 font-semibold"> (All Sets)</span>
      </h2>

      <div className="text-xs font-semibold uppercase tracking-wide text-purple-500 mb-4">
        {(topCollector?.total_cards_owned ?? 0).toLocaleString()} Cards Owned
      </div>

      <div className="relative w-24 h-24 mx-auto mb-4">
        <img
          src={celestiasCrown}
          alt="Top Collector Crown"
          className="
            absolute -top-8 -right-3 w-20 h-auto z-20
            pointer-events-none drop-shadow-lg rotate-[24deg]
          "
        />

        <img
          src={getAvatar(topCollector?.avatar_url)}
          alt="Top Collector Avatar"
          className="
            relative z-10 w-24 h-24 rounded-full
            border-4 border-white shadow-xl
            ring-2 ring-yellow-300/70
          "
        />
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="font-bold text-purple-950 text-base">
          {topCollector?.username || "Loading..."}
        </span>

        {topCollector?.id &&
          VERIFIED_USERS[topCollector.id] && (
            <img
              src={VERIFIED_USERS[topCollector.id].badge}
              alt={VERIFIED_USERS[topCollector.id].label}
              title={VERIFIED_USERS[topCollector.id].label}
              className="w-5 h-5 object-contain flex-shrink-0"
            />
          )}
      </div>

      <div className="text-4xl font-extrabold text-purple-700 leading-none">
        {topCollector?.completed_sets ?? 0}
      </div>

      <div className="text-sm text-neutral-500 mt-1">
        Completed Sets
      </div>
    </div>
  </div>

    {/* LEFT SIDEBAR */}
<aside className="xl:sticky xl:top-6">
      <div
        className="
          rounded-3xl
          bg-white/70 backdrop-blur-xl
          border border-white/60
          shadow-[0_10px_30px_rgba(76,29,149,0.08)]
          p-6
        "
      >
        <h2 className="text-xl font-bold text-purple-950 mb-2">
          Categories
        </h2>

        <p className="text-sm text-purple-700/80 leading-relaxed mb-6">
          Explore leaderboards for each card game and set collection.
        </p>
<div className="space-y-3">
  {/* Star (empty for now) */}
  <button
    onClick={() => setActiveCategory("star" as any)}
    className={`
      w-full flex items-center justify-between
      px-4 py-3 rounded-2xl font-semibold transition-all duration-200
      ${
        activeCategory === ("star" as any)
          ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-700/20"
          : "text-purple-900 hover:bg-purple-50"
      }
    `}
  >
    <span className="flex items-center gap-3">
      <img
        src={elementOfMagic}
        alt="Star"
        className="w-5 h-5 object-contain"
      />
      <span>Star</span>
    </span>
    <span>→</span>
  </button>

  {/* Moon (shows Eternal Moon 1 + 2) */}
  <button
    onClick={() => setActiveCategory("ccg")}
    className={`
      w-full flex items-center justify-between
      px-4 py-3 rounded-2xl font-semibold transition-all duration-200
      ${
        activeCategory === "ccg"
          ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-700/20"
          : "text-purple-900 hover:bg-purple-50"
      }
    `}
  >
    <span className="flex items-center gap-3">
      <img
        src={elementOfKindness}
        alt="Moon"
        className="w-5 h-5 object-contain"
      />
      <span>Moon</span>
    </span>
    <span>→</span>
  </button>

  {/* Rainbow (shows Rainbow First Edition) */}
  <button
    onClick={() => setActiveCategory("rainbow" as any)}
    className={`
      w-full flex items-center justify-between
      px-4 py-3 rounded-2xl font-semibold transition-all duration-200
      ${
        activeCategory === ("rainbow" as any)
          ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-700/20"
          : "text-purple-900 hover:bg-purple-50"
      }
    `}
  >
    <span className="flex items-center gap-3">
      <img
        src={elementOfLoyalty}
        alt="Rainbow"
        className="w-5 h-5 object-contain"
      />
      <span>Rainbow</span>
    </span>
    <span>→</span>
  </button>

  {/* Fun Moments (shows Fun Moments 1 + 2) */}
  <button
    onClick={() => setActiveCategory("funmoments" as any)}
    className={`
      w-full flex items-center justify-between
      px-4 py-3 rounded-2xl font-semibold transition-all duration-200
      ${
        activeCategory === ("funmoments" as any)
          ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-700/20"
          : "text-purple-900 hover:bg-purple-50"
      }
    `}
  >
    <span className="flex items-center gap-3">
      <img
        src={elementOfGenerosity}
        alt="Fun Moments"
        className="w-5 h-5 object-contain"
      />
      <span>Fun Moments</span>
    </span>
    <span>→</span>
  </button>

  {/* TCG (shows Friendships Begin + Fantasy Wonderland) */}
  <button
    onClick={() => setActiveCategory("tcg")}
    className={`
      w-full flex items-center justify-between
      px-4 py-3 rounded-2xl font-semibold transition-all duration-200
      ${
        activeCategory === "tcg"
          ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-700/20"
          : "text-purple-900 hover:bg-purple-50"
      }
    `}
  >
    <span className="flex items-center gap-3">
      <img
        src={elementOfHonesty}
        alt="TCG"
        className="w-5 h-5 object-contain"
      />
      <span>TCG</span>
    </span>
    <span>→</span>
  </button>
</div>
      </div>
    </aside>

{/* MAIN CONTENT */}
<main className="-mt-6">

  {["star", "ccg", "rainbow", "funmoments"].includes(activeCategory) && (
    <>

<div className="flex items-center gap-4 my-4">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

  <div
    className="
      px-5 py-1.5
      rounded-full
      bg-white/80 backdrop-blur-sm
      border border-purple-200/60
      shadow-sm
      text-sm font-extrabold uppercase tracking-[0.2em]
      text-purple-700
    "
  >
    CCG
  </div>

  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
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
    group relative overflow-hidden
    rounded-3xl
    px-6 py-5
    text-left
    bg-white/75 backdrop-blur-xl
    border border-white/60
    shadow-[0_10px_30px_rgba(76,29,149,0.08)]
    hover:shadow-[0_20px_45px_rgba(76,29,149,0.15)]
    hover:-translate-y-1
    hover:border-yellow-300/60
    transition-all duration-300
    min-h-[170px]
  "
>
  {/* Soft highlight overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-purple-100/20 pointer-events-none" />

  {/* Set Title */}
  <h2 className="relative text-xl font-bold text-purple-950 pr-28 leading-tight mb-2">
    {set.name}
  </h2>

  {/* Subtitle */}
  <div className="relative text-[11px] font-bold uppercase tracking-wide text-purple-500 mb-3">
    Top Collector
  </div>

  {/* Placeholder leaderboard rows for visual depth */}
<div className="relative space-y-1.5 mb-4">
  {(setTopThree[String(set.id)] || []).map((player, index) => (
    <div
      key={player.id}
      className={`flex items-center justify-between text-xs ${
        index === 0
          ? "font-semibold text-purple-950"
          : "text-purple-700/80"
      }`}
    >
      <span className="truncate">
        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {player.username}
      </span>

      <span className="font-bold text-purple-700">
  {(player.owned ?? 0).toLocaleString()} / {(set.total ?? 0).toLocaleString()}
</span>
    </div>
  ))}
</div>

  {/* View Link */}
  <div className="relative text-sm font-semibold text-purple-700 group-hover:text-purple-900 transition-colors">
    View Leaderboard →
  </div>

  {/* #1 Avatar */}
  {firstFinishers[String(set.id)] && (
    <div className="absolute top-4 right-4 flex flex-col items-center">
      <div className="relative w-14 h-14">
        <img
          src={getAvatar(firstFinishers[String(set.id)].avatar_url)}
          className="w-14 h-14 rounded-full border-4 border-white shadow-xl ring-2 ring-yellow-300/60"
        />

        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          #1
        </div>
      </div>

      <div className="font-semibold text-xs mt-1 text-center max-w-[70px] leading-tight">
        {firstFinishers[String(set.id)]?.username}
      </div>
    </div>
  )}
</button>
  ))}
</div>
    </>
  )}

    {activeCategory === "tcg" && (
    <>
<div className="flex items-center gap-4 my-4">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

  <div
    className="
      px-5 py-1.5
      rounded-full
      bg-white/80 backdrop-blur-sm
      border border-purple-200/60
      shadow-sm
      text-sm font-extrabold uppercase tracking-[0.2em]
      text-purple-700
    "
  >
    TCG
  </div>

  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 mb-10">
  {sets
    .filter((set) => ["fantasywonderland", "friendshipsbegin"].includes(set.id))
    .map((set) => (

      <button
  key={set.id}
  onClick={() => navigate(`/community/${set.id}`)}
  className="
    group relative overflow-hidden
    rounded-3xl
    px-6 py-5
    text-left
    bg-white/75 backdrop-blur-xl
    border border-white/60
    shadow-[0_10px_30px_rgba(76,29,149,0.08)]
    hover:shadow-[0_20px_45px_rgba(76,29,149,0.15)]
    hover:-translate-y-1
    hover:border-yellow-300/60
    transition-all duration-300
    min-h-[170px]
  "
>
  {/* Soft highlight overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-purple-100/20 pointer-events-none" />

  {/* Set Title */}
  <h2 className="relative text-xl font-bold text-purple-950 pr-28 leading-tight mb-2">
    {set.name}
  </h2>

  {/* Subtitle */}
  <div className="relative text-[11px] font-bold uppercase tracking-wide text-purple-500 mb-3">
    Top Collector
  </div>

  {/* Placeholder leaderboard rows for visual depth */}
<div className="relative space-y-1.5 mb-4">
  {(setTopThree[String(set.id)] || []).map((player, index) => (
    <div
      key={player.id}
      className={`flex items-center justify-between text-xs ${
        index === 0
          ? "font-semibold text-purple-950"
          : "text-purple-700/80"
      }`}
    >
      <span className="truncate">
        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {player.username}
      </span>

      <span className="font-bold text-purple-700">
  {(player.owned ?? 0).toLocaleString()} / {(set.total ?? 0).toLocaleString()}
</span>
    </div>
  ))}
</div>

  {/* View Link */}
  <div className="relative text-sm font-semibold text-purple-700 group-hover:text-purple-900 transition-colors">
    View Leaderboard →
  </div>

  {/* #1 Avatar */}
  {firstFinishers[String(set.id)] && (
    <div className="absolute top-4 right-4 flex flex-col items-center">
      <div className="relative w-14 h-14">
        <img
          src={getAvatar(firstFinishers[String(set.id)].avatar_url)}
          className="w-14 h-14 rounded-full border-4 border-white shadow-xl ring-2 ring-yellow-300/60"
        />

        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          #1
        </div>
      </div>

      <div className="font-semibold text-xs mt-1 text-center max-w-[70px] leading-tight">
        {firstFinishers[String(set.id)]?.username}
      </div>
    </div>
  )}
</button>
  ))}
</div>
    </>
  )}

    </main>

<div
  className="
    hidden xl:block
    w-[260px]
    rounded-3xl
    bg-white/70 backdrop-blur-xl
    border border-white/60
    shadow-[0_10px_30px_rgba(76,29,149,0.08)]
    px-6 py-5
    text-center
  "
>
  <h2 className="text-sm font-extrabold uppercase tracking-wide text-purple-700 mb-4">
    Top Collector
    <span className="text-purple-400 font-semibold"> (All Sets)</span>
  </h2>

  {/* Total Cards Owned */}
  <div className="text-xs font-semibold uppercase tracking-wide text-purple-500 mb-4">
    {(topCollector?.total_cards_owned ?? 0).toLocaleString()} Cards Owned
  </div>

{/* Avatar with Crown */}
<div className="relative w-24 h-24 mx-auto mb-4">
  {/* Crown */}
<img
  src={celestiasCrown}
  alt="Top Collector Crown"
  className="
    absolute
    -top-8
    -right-3
    w-20
    h-auto
    z-20
    pointer-events-none
    drop-shadow-lg
    rotate-[24deg]
  "
/>

  {/* Avatar */}
  <img
    src={getAvatar(topCollector?.avatar_url)}
    alt="Top Collector Avatar"
    className="
      relative z-10
      w-24 h-24
      rounded-full
      border-4 border-white
      shadow-xl
      ring-2 ring-yellow-300/70
    "
  />
</div>

  {/* Name + Verification Badge */}
  <div className="flex items-center justify-center gap-2 mb-3">
    <span className="font-bold text-purple-950 text-base">
      {topCollector?.username || "Loading..."}
    </span>

    {topCollector?.id &&
      VERIFIED_USERS[topCollector.id] && (
        <img
          src={VERIFIED_USERS[topCollector.id].badge}
          alt={VERIFIED_USERS[topCollector.id].label}
          title={VERIFIED_USERS[topCollector.id].label}
          className="w-5 h-5 object-contain flex-shrink-0"
        />
      )}
  </div>

  {/* Completed Sets Count */}
  <div className="text-4xl font-extrabold text-purple-700 leading-none">
    {topCollector?.completed_sets ?? 0}
  </div>

  <div className="text-sm text-neutral-500 mt-1">
    Completed Sets
  </div>
</div>

  </div>
</div>
</div>
);
};

export default Community;
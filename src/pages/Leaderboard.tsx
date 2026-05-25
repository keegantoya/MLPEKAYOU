import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import leaderboardBadge from "@/assets/avatars/leaderboardbadge.png";
import { calculateCollectionTotal } from "@/lib/CalculateCollectionTotal";


import avatar001 from "@/assets/avatars/avatar001.jpg";
import avatar002 from "@/assets/avatars/avatar002.jpg";
import avatar003 from "@/assets/avatars/avatar003.jpg";
import avatar004 from "@/assets/avatars/avatar004.jpg";
import avatar005 from "@/assets/avatars/avatar005.jpg";
import avatar006 from "@/assets/avatars/avatar006.jpg";
import avatar007 from "@/assets/avatars/avatar007.jpg";
import avatar008 from "@/assets/avatars/avatar008.jpg";
import avatar009 from "@/assets/avatars/avatar009.jpg";
import avatar010 from "@/assets/avatars/avatar010.jpg";
import avatar011 from "@/assets/avatars/avatar011.jpg";
import avatar012 from "@/assets/avatars/avatar012.jpg";
import avatar013 from "@/assets/avatars/avatar013.jpg";
import avatar014 from "@/assets/avatars/avatar014.jpg";
import avatar015 from "@/assets/avatars/avatar015.jpg";
import KeeganAvatar from "@/assets/avatars/keeganpfp.jpg";
import maipfp from "@/assets/avatars/maipfp.jpg";

import fluttershyCutieMark from "/website-assets/fluttershycutiemark.png";
import applejackCutieMark from "/website-assets/applejackcutiemark.png";
import pinkiePieCutieMark from "/website-assets/pinkiecutiemark.png";
import rainbowDashCutieMark from "/website-assets/rainbowdashcutiemark.png";
import rarityCutieMark from "/website-assets/raritycutiemark.png";
import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.png";

import elementOfMagic from "/website-assets/elementofmagic.png";
import elementOfGenerosity from "/website-assets/elementofgenerosity.png";
import elementOfHonesty from "/website-assets/elementofhonesty.png";

import verifiedBadge from "/website-assets/goldenverifiedbadge.png";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.png";
import elementOfLaughter from "/website-assets/elementoflaughter.png";

const avatarMap: Record<string, string> = {
  "avatar001.jpg": avatar001,
  "avatar002.jpg": avatar002,
  "avatar003.jpg": avatar003,
  "avatar004.jpg": avatar004,
  "avatar005.jpg": avatar005,
  "avatar006.jpg": avatar006,
  "avatar007.jpg": avatar007,
  "avatar008.jpg": avatar008,
  "avatar009.jpg": avatar009,
  "avatar010.jpg": avatar010,
  "avatar011.jpg": avatar011,
  "avatar012.jpg": avatar012,
  "avatar013.jpg": avatar013,
  "avatar014.jpg": avatar014,
  "avatar015.jpg": avatar015,
  "keeganpfp.jpg": KeeganAvatar,
  "maipfp.jpg": maipfp,
};

const VERIFIED_USERS = {
  // Gold Badge = MLPEKAYOU STAFF
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

  // Blue Badge = KAYOU STAFF
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
};

const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  {
  id: "8",
  name: "Fun Moments Second Edition",
  total: 136,
  rarities: { N: 20, SN: 20, R:35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
  },
  {
  id: "SD",
  name: "Friendships Begin",
  rarities: { BONUS: 68 }
  },
  {
  id: "FW",
  name: "Fantasy Wonderland",
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
    PRR: 6
  }
},
  {
    id: "9",
    name: "Promo Cards",
    rarities: { PR: 5 }
  },
  {
    id: "10",
    name: "Andy Price Promo",
    rarities: { LC: 1 }
  },
  {
  id: "tcgpromos",
  name: "TCG Promos",
  rarities: { RR: 6 }
}
];

const rarityDisplayMap: Record<string, string> = {
  "SHINING ZR": "⬦ZR",
  "SZR": "⬦ZR",
  "SN": "⬦N",
};

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
    const [rankWorthyCollectors, setRankWorthyCollectors] = useState(0);
    const [totalCardsSitewide, setTotalCardsSitewide] = useState(0);
    const [yourCurrentRank, setYourCurrentRank] = useState<number | null>(null);
const [openProfile, setOpenProfile] = useState<string | null>(null);
const [openSet, setOpenSet] = useState<Record<string, string | null>>({});
useEffect(() => {
  if (openProfile) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [openProfile]);

  useEffect(() => {
    const load = async () => {
      const { data: progress } = await supabase
  .from("collection_progress_raw")
  .select("*");
const mergedProgress: Record<string, any> = {};

progress?.forEach((row: any) => {
  mergedProgress[`${row.user_id}-${row.set_id}`] = row;
});
        
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*");
        const { data: tradingData } = await supabase
  .from("trading_profiles")
  .select("*");

      const profileMap: Record<string, any> = {};
profiles?.forEach((p: any) => {
  profileMap[p.id] = {
    ...p,
    hiddenSets: p.iso_hidden_sets || []
  };
});
const tradingMap: Record<string, string> = {};

(tradingData || []).forEach((p: any) => {
  tradingMap[p.user_id] = p.discord_username;
});
      const totals: Record<string, any> = {};

      Object.keys(profileMap).forEach((userId) => {
  const profile = profileMap[userId];

  if (!totals[userId]) {
    totals[userId] = {
  id: userId,
  username: profile?.username || "Anonymous",
  avatar: profile?.avatar_url,
  discord_username: tradingMap[userId] || null,
  total: 0,
  missing: [] as string[],
  hiddenSets: profile?.hiddenSets || [],
  mastered: [],
  notStarted: []
};
  }

  sets.forEach((set) => {

let row = { progress: {} as Record<string, boolean> };

if (set.id === "SD") {
  const base = mergedProgress[`${userId}-SD`] || { progress: {} };
  const bonus = mergedProgress[`${userId}-SD_BONUS`] || { progress: {} };
  const starters = mergedProgress[`${userId}-SD_STARTERS`] || { progress: {} };

  row.progress = {
    ...base.progress,
    ...bonus.progress,
    ...starters.progress
  };
} else {
  row = mergedProgress[`${userId}-${set.id}`] || { progress: {} };
}

    const ownedMap: Record<string, boolean> = {};
    if (row?.progress) {
      Object.entries(row.progress).forEach(([k, v]) => {
        if (v) ownedMap[k] = true;
      });
    }

    const isHidden = profile?.hiddenSets?.includes(set.id);

  const hideStarters = profile?.hiddenSets?.includes("SD_STARTERS");
  const hideBonus = profile?.hiddenSets?.includes("SD_BONUS");

    let owned = 0;
    let totalCardsInSet = 0;
    let hasAny = false;
    let missingCards: string[] = [];

    if (set.id === "SD") {
      let hasStarter = false;
      let hasBonus = false;
Object.entries(ownedMap).forEach(([cardKey, value]) => {
  if (value !== true) return;

const rawKey = cardKey.replace("STARTER-", "").replace("BONUS-", "");

if (rawKey.startsWith("SD01")) {

    if (
  rawKey.startsWith("SD01A") ||
  rawKey.startsWith("SD01B") ||
  rawKey.startsWith("SD01C") ||
  rawKey.startsWith("SD01D") ||
  rawKey.startsWith("SD01E") ||
  rawKey.startsWith("SD01F")
) {
      hasStarter = true;
    } else {
      hasBonus = true;
    }

    if (hideBonus && !cardKey.includes("SD01A") &&
        !cardKey.includes("SD01B") &&
        !cardKey.includes("SD01C") &&
        !cardKey.includes("SD01D") &&
        !cardKey.includes("SD01E") &&
        !cardKey.includes("SD01F")) {
      return;
    }

    owned++;
    hasAny = true;
  }
});
  totalCardsInSet = 194;
if (!hasStarter && !hasBonus) {
  totals[userId].notStarted.push("Friendships Begin");
} else {

const STARTER_DECKS = [
  { code: "SD01A", name: "Twilight Sparkle Starter Deck" },
  { code: "SD01B", name: "Fluttershy Starter Deck" },
  { code: "SD01C", name: "Pinkie Pie Starter Deck" },
  { code: "SD01D", name: "Applejack Starter Deck" },
  { code: "SD01E", name: "Rainbow Dash Starter Deck" },
  { code: "SD01F", name: "Rarity Starter Deck" },
];

let anyStarterOwned = false;
let starterCount = 0;

STARTER_DECKS.forEach((deck) => {
  const hasDeck = Object.keys(ownedMap).some((cardKey) => {
    const rawKey = cardKey.replace("STARTER-", "").replace("BONUS-", "");
    return rawKey.startsWith(deck.code);
  });

  if (hasDeck) {
    anyStarterOwned = true;
    hasStarter = true;
    starterCount++;
  } else if (!hideStarters && !isHidden) {
    totals[userId].missing.push(
      `${deck.name} • Friendships Begin`
    );
  }
});

if (starterCount === 6 && !hideStarters) {
  totals[userId].mastered.push("Friendships Begin Character Decks");
}

if (starterCount === 0 && !hideStarters) {
  totals[userId].notStarted.push("Friendships Begin — Character Starter Decks");
}

if (!anyStarterOwned && !hideStarters) {
  totals[userId].notStarted.push("Friendships Begin — Character Starter Decks");
}

if (!hideBonus) {

  if (!hasBonus) {
    totals[userId].notStarted.push("Friendships Begin — Bonus Packs");
  } else {

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
  BONUS_STRUCTURE.forEach(({ prefix, count }) => {

  for (let i = 1; i <= count; i++) {

    let actualIndex = i;

if (prefix === "SD01PER") {
  actualIndex = i + 6;
}
    const num = String(actualIndex).padStart(2, "0");
    const key = `${prefix}${num}`;

const isOwned = Object.keys(ownedMap).some(k =>
  k.endsWith(key)
);
if (isOwned) {
  continue;
}

    if (!isHidden && hasBonus) {

      let rarity = prefix.replace("SD01", "");
      let displayRarity = rarity;
      let special = false;

      if (rarity.startsWith("P")) {
  special = true;
  displayRarity = rarity.slice(1);
}

if (rarity === "PER") {
  displayRarity = "ER";
  special = true;
}

      let formattedRarity = displayRarity;

if (rarityDisplayMap[formattedRarity]) {
  formattedRarity = rarityDisplayMap[formattedRarity];
}
const prefixMark = special ? "※" : "";

let formatted = `${prefixMark}${formattedRarity}-${num}`;

if (rarity === "PER") {
  const displayNum = Math.ceil(i / 2) + 6;
  const variant = i % 2 === 1 ? "(Day)" : "(Night)";

  formatted =
    `${prefixMark}${formattedRarity}-${String(displayNum).padStart(2, "0")} ${variant}`;
}

      missingCards.push(`${set.name} • ${formatted}`);
    }
  }

});
  }
}
}
  
} else if (set.id === "FW") {


  const STRUCTURE = [
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
];

const FW_CARDS = STRUCTURE.flatMap(({ prefix, count }) => {

  // ER cards are numbered 07–12
  if (prefix === "BP01ER") {
    return Array.from({ length: 6 }, (_, i) =>
      `BP01ER${String(i + 7).padStart(2, "0")}`
    );
  }

  // PSPR uses a custom numbering sequence
  if (prefix === "BP01PSPR") {
    return [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map((n) =>
      `BP01PSPR${String(n).padStart(2, "0")}`
    );
  }

  // All other Fantasy Wonderland cards, including PER,
  // use standard numbering starting at 01.
  return Array.from({ length: count }, (_, i) =>
    `${prefix}${String(i + 1).padStart(2, "0")}`
  );
});

totalCardsInSet = FW_CARDS.length;

const validSet = new Set(FW_CARDS);

const progressData = row?.progress || {};

const validKeys = new Set(FW_CARDS);

Object.entries(progressData).forEach(([key, val]) => {
  if (val && validKeys.has(key)) {
    owned++;
    hasAny = true;
  }
  if (val && !validKeys.has(key)) {
    console.log("Unrecognized Fantasy Wonderland card:", key);
  }
});

FW_CARDS.forEach((key) => {
  if (!isHidden && hasAny && !progressData[key]) {

let rarity = key.replace("BP01", "").replace(/[0-9]/g, "");
let displayRarity = rarity;
let special = false;

if (rarity.startsWith("P")) {
  special = true;
  displayRarity = rarity.slice(1); // REMOVE the P
}

if (rarity === "PER") {
  displayRarity = "ER";
  special = true;
}
let formattedRarity = displayRarity;

if (rarityDisplayMap[formattedRarity]) {
  formattedRarity = rarityDisplayMap[formattedRarity];
}

const prefixMark = special ? "※" : "";

const num = key.slice(-2);

const rawNum = parseInt(num);

let displayNum = rawNum;
let variant = "";

if (rarity === "PER") {
  displayNum = Math.ceil(rawNum / 2);
  variant = rawNum % 2 === 1 ? "(Day)" : "(Night)";
}

const formatted = `${prefixMark}${formattedRarity}-${String(displayNum).padStart(2,"0")} ${variant}`;

    missingCards.push(`${set.name} • ${formatted}`);
  }
});

} else if (set.id === "tcgpromos") {

  totalCardsInSet = 6;

  for (let i = 1; i <= 6; i++) {
    const key = `RR${String(i).padStart(2, "0")}`;

    const isOwned =
  ownedMap[key] ||
  ownedMap[`BONUS-${key}`];

if (isOwned) {
  owned++;
  hasAny = true;
} else if (!isHidden && hasAny && owned < totalCardsInSet) {
      missingCards.push(`${set.name} • ${key}`);
    }
  }

} else {

  Object.entries(set.rarities).forEach(([rarity, count]) => {
    totalCardsInSet += count as number;

    for (let i = 1; i <= count; i++) {
      const cardKey = `${rarity}-${i}`;

      if (ownedMap[cardKey]) {
        owned++;
        hasAny = true;
      } else if (!isHidden && hasAny && owned < totalCardsInSet) {
        let displayRarity = rarity === "LC" ? "PR" : rarity;

        if (rarityDisplayMap[displayRarity]) {
          displayRarity = rarityDisplayMap[displayRarity];
        }

        const padded = String(i).padStart(3, "0");
missingCards.push(`${set.name} • ${displayRarity}-${padded}`);
      }
    }
  });

}
if (set.id === sets[sets.length - 1].id) {
  totals[userId].total = calculateCollectionTotal(
    userId,
    Object.values(mergedProgress)
  );
}
    totals[userId].missing.push(...missingCards);

    if (owned === totalCardsInSet && totalCardsInSet > 0) {
      totals[userId].mastered.push(set.name);
    }

if (
  set.id !== "SD" &&
  !hasAny &&
  !isHidden
) {
  totals[userId].notStarted.push(set.name);
}
  });
});

 const excludedMasteredSets = [
  "Promo Cards",
  "TCG Promos",
  "Andy Price Promo",
];

const allUsersSorted = Object.values(totals)
  .filter(
    (u: any) => u.username !== "HeiManTou (Chinese Collector)"
  )
  .sort((a: any, b: any) => b.total - a.total);

// RANK-WORTHY COLLECTORS
// Users with 3+ completed sets, excluding promos and limited cards
const rankWorthy = allUsersSorted.filter((u: any) => {
  const qualifyingCompletedSets = (u.mastered || []).filter(
    (setName: string) =>
      !excludedMasteredSets.includes(setName)
  );

  return qualifyingCompletedSets.length >= 1;
});

setRankWorthyCollectors(rankWorthy.length);

// TOTAL CARDS SITEWIDE
const totalCards = allUsersSorted.reduce(
  (sum: number, u: any) => sum + (u.total || 0),
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
setLeaders(allUsersSorted.slice(0, 12));
    };

    load();
  }, []);

  const getAvatar = (avatar?: string) => {
    if (!avatar) return avatar001;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || avatar001;
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
    radial-gradient(circle at 10% 15%, rgba(255,255,255,0.75), transparent 28%),
    radial-gradient(circle at 90% 10%, rgba(255,223,128,0.18), transparent 24%),
    radial-gradient(circle at 75% 30%, rgba(251,207,232,0.16), transparent 26%),
    radial-gradient(circle at 20% 65%, rgba(196,181,253,0.18), transparent 32%),
    radial-gradient(circle at 80% 85%, rgba(147,197,253,0.14), transparent 30%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35), transparent 45%),
    linear-gradient(
      180deg,
      #fcf8ff 0%,
      #f8f1ff 22%,
      #f4ecff 48%,
      #efe6ff 72%,
      #e8ddff 100%
    )
  `,
}}
>
      <KayouHeader />

      {/* FLOATING CUTIE MARK BACKGROUND */}
<div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
  {Array.from({ length: 96 }).map((_, index) => {
    const marks = [
      twilightSparkleCutieMark,
      fluttershyCutieMark,
      rarityCutieMark,
      applejackCutieMark,
      pinkiePieCutieMark,
      rainbowDashCutieMark,
    ];

    const mark = marks[index % marks.length];

    // Spread symbols in a dense 12-column pattern with slight offsets
    const row = Math.floor(index / 12);
    const col = index % 12;

    const top = row * 12 + (col % 2 === 0 ? 2 : 6);
    const left = col * 8 + ((row % 2) * 2);

    const rotations = [-30, -20, -12, -6, 6, 12, 18, 24, 30, -24, 15, -15];
    const sizes = [48, 56, 64, 72, 52, 60];

    return (
      <img
        key={index}
        src={mark}
        alt=""
        className="absolute"
        style={{
          top: `${Math.min(top, 96)}%`,
          left: `${Math.min(left, 96)}%`,
          width: `${sizes[index % sizes.length]}px`,
          height: "auto",
          transform: `rotate(${rotations[index % rotations.length]}deg)`,
          opacity: 0.06,
          filter: "blur(0.15px)",
        }}
      />
    );
  })}
</div>

<div className="container max-w-7xl mx-auto px-4 py-10 overflow-visible">

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
</div>
  </div>
{/* STATS BAR */}
<div className="mb-16">
  <div
    className="
      relative overflow-hidden
      bg-white/90 backdrop-blur-xl
      border border-white/80
      rounded-3xl md:rounded-[2rem]
      shadow-[0_20px_60px_rgba(107,70,193,0.12),0_8px_20px_rgba(0,0,0,0.06)]
      px-4 sm:px-6 md:px-8
      py-4 sm:py-5 md:py-6
    "
  >
    {/* Decorative Glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-12 left-1/4 w-24 h-24 md:w-32 md:h-32 bg-yellow-200/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 right-1/4 w-28 h-28 md:w-40 md:h-40 bg-purple-300/20 rounded-full blur-3xl" />
    </div>

    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">

      {/* Rank-Worthy Collectors */}
      <div className="relative text-center py-3 md:py-1">
        <div className="absolute inset-y-4 right-0 hidden md:block w-px bg-gradient-to-b from-transparent via-purple-200 to-transparent" />

        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 shadow-sm">
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

        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-50 border border-yellow-200 shadow-sm">
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
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-50 border border-pink-200 shadow-sm">
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
            relative cursor-pointer rounded-3xl border bg-white/95 backdrop-blur-sm
            shadow-xl hover:shadow-2xl transition-all duration-300
            ${isFirst ? "md:scale-110 border-yellow-300 py-10" : "py-8"}
            ${isSecond ? "border-gray-300" : ""}
            ${isThird ? "border-amber-300" : ""}
            px-6 text-center
          `}
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
  <div className="text-2xl font-bold text-purple-950">
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
              font-bold text-purple-700
              ${isFirst ? "text-5xl" : "text-4xl"}
            `}
          >
            {user.total.toLocaleString()}
          </div>

          <div className="text-sm text-purple-500 mt-1">
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
            cursor-pointer bg-white/95 backdrop-blur-sm
            border border-white/70 rounded-2xl
            px-6 py-4 shadow-md hover:shadow-xl
            transition-all duration-300
          "
        >
<div className="flex items-center gap-3 sm:gap-4">
  {/* Rank */}
  <div className="w-10 sm:w-12 md:w-16 text-lg sm:text-2xl md:text-3xl font-bold text-purple-800 shrink-0">
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
    <div className="text-sm sm:text-lg md:text-2xl font-semibold text-purple-950 truncate">
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
    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-700 leading-none">
      {user.total.toLocaleString()}
    </div>
    <div className="text-[10px] sm:text-xs md:text-sm text-purple-500">
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
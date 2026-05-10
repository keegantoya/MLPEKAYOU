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

      const sorted = Object.values(totals)
  .filter((user: any) => user.username !== "HeiManTou (Chinese Collector)") // THIS REMOVES HEIMANTOU SMH
  .sort((a: any, b: any) => b.total - a.total)
  .slice(0, 12); 

      setLeaders(sorted);
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
      radial-gradient(circle at 15% 20%, rgba(255,255,255,0.45), transparent 30%),
      radial-gradient(circle at 85% 10%, rgba(255,215,0,0.08), transparent 25%),
      radial-gradient(circle at 50% 80%, rgba(168,85,247,0.08), transparent 35%),
      linear-gradient(180deg, #f8f4ff 0%, #f1e9ff 50%, #ede3ff 100%)
    `,
  }}
>
      <KayouHeader />

<div className="container py-8 overflow-visible">

  <div className="text-center mb-6">
  <img
  src={leaderboardBadge}
  alt="KayouUS Top Collectors"
  className="mx-auto h-16 sm:h-20 md:h-24 object-contain"
/>
</div>

<div className="mb-30">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((user, index) => {
            const isOpen = openProfile === user.id;

            return (
              <div
  key={index}
  className={`relative bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer transition
  ${isOpen ? "z-50 shadow-2xl" : "z-0 shadow-md hover:shadow-xl"}
`}
  onClick={() =>
    setOpenProfile(isOpen ? null : user.id)
  }
>
                <div
  className={`flex items-center gap-3 ${
    index < 3 ? "justify-center text-center" : ""
  }`}
>
                  {index >= 3 && (
<div className="font-bold text-lg text-purple-900">
  #{index + 1}
</div>
)}

                  <div className="relative">
  <img
    src={getAvatar(user.avatar)}
    className="w-10 h-10 rounded-full"
  />

  {/* SPARKLES ATTACHED TO AVATAR */}
  <>
    {/* 🥇 #1 */}
    {index === 0 && (
      <>
        {/* MOBILE: above avatar only */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 md:hidden pointer-events-none">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
        </div>

        {/* DESKTOP: original positions */}
        <div className="hidden md:block absolute -top-3 left-4 pointer-events-none">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
        </div>

        <div className="hidden md:block absolute top-6 -left-2 pointer-events-none">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
        </div>
      </>
    )}

    {/* 🥈 #2 */}
    {index === 1 && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="sparkle sparkle-1"></div>
        <div className="sparkle sparkle-2"></div>
        <div className="sparkle sparkle-3"></div>
      </div>
    )}

   {/* 🥉 #3 */}
{index === 2 && (
  <>
    {/* MOBILE: above avatar */}
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 md:hidden pointer-events-none">
      <div className="sparkle sparkle-1"></div>
      <div className="sparkle sparkle-2"></div>
      <div className="sparkle sparkle-3"></div>
    </div>

    {/* DESKTOP: above avatar (same as #2 style) */}
    <div className="hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="sparkle sparkle-1"></div>
      <div className="sparkle sparkle-2"></div>
      <div className="sparkle sparkle-3"></div>
    </div>
  </>
)}
  </>

  {/* RIBBON */}
  {index < 3 && (
  <div className="absolute -top-1 -right-2 flex flex-col items-center">
    
    {/* Top tag */}
    <div
      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md rotate-6
        ${index === 0 ? "bg-yellow-400 text-black" : ""}
        ${index === 1 ? "bg-gray-300 text-black" : ""}
        ${index === 2 ? "bg-amber-600 text-white" : ""}
      `}
    >
      {index === 0 && "1st"}
      {index === 1 && "2nd"}
      {index === 2 && "3rd"}
    </div>

    {/* Ribbon tail */}
    <div
      className={`w-2 h-2 rotate-45 -mt-1
        ${index === 0 ? "bg-yellow-400" : ""}
        ${index === 1 ? "bg-gray-300" : ""}
        ${index === 2 ? "bg-amber-600" : ""}
      `}
    />
  </div>
)}
</div>

                  <div>
                    <div className="font-semibold text-purple-950">
                      {user.username}
                    </div>

                    <div className="text-sm text-purple-600">
                      {user.total} cards
                    </div>
                  </div>
                </div>

                {isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    
    {/* BACKDROP CLICK CLOSE */}
    <div
      className="absolute inset-0"
      onClick={() => setOpenProfile(null)}
    />

    {/* MODAL BOX */}
    <div className="relative w-[90%] max-w-lg max-h-[85vh] overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 shadow-2xl">

      {/* CLOSE BUTTON */}
      <button
        className="absolute top-2 right-3 text-sm font-bold"
        onClick={() => setOpenProfile(null)}
      >
        ✕
      </button>

      <div className="text-sm">
        <div className="flex items-center gap-3 mb-1">

  <img
    src={getAvatar(user.avatar)}
    className="w-10 h-10 rounded-full"
  />

  <div className="leading-tight">
    <div className="font-semibold text-sm">
      {user.username}
    </div>

    {user.discord_username && (
      <div className="text-xs text-muted-foreground">
        My Discord is {user.discord_username}! Reach out to me if you have my ISOs!
      </div>
    )}
  </div>

</div>

        {/* COMPLETED */}
        {user.mastered?.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-[#5a3e84]/40" />
              <div className="text-[10px] font-semibold text-[#5a3e84] uppercase tracking-wide whitespace-nowrap">
                {user.username}'s completed sets.
              </div>
              <div className="flex-1 h-px bg-[#5a3e84]/40" />
            </div>

            <div className="text-xs text-emerald-600 font-medium mb-2 space-y-1">
              {user.mastered.map((setName: string, i: number) => {
                if (setName === "Serialized & Limited Cards") {
                  return <div key={i}>Has Andy Price promo</div>;
                }
                return <div key={i}>Completed {setName}</div>;
              })}
            </div>
          </>
        )}

        {/* NOT COLLECTING */}
        {user.hiddenSets.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-[#5a3e84]/40" />
              <div className="text-[10px] font-semibold text-[#5a3e84] uppercase tracking-wide whitespace-nowrap">
                NOT COLLECTING
              </div>
              <div className="flex-1 h-px bg-[#5a3e84]/40" />
            </div>

            <div className="text-xs text-red-500 mb-2">
              {user.hiddenSets.map((setId: string, i: number) => {
                let name = sets.find(s => s.id === setId)?.name;

                if (setId === "SD_STARTERS") {
                  name = "Friendships Begin — Starter Decks";
                }
                if (setId === "SD_BONUS") {
                  name = "Friendships Begin — Bonus Packs";
                }

                return <div key={i}>{name}</div>;
              })}
            </div>
          </>
        )}

        {/* NOT STARTED */}
        {user.notStarted?.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-[#5a3e84]/40" />
              <div className="text-[10px] font-semibold text-[#5a3e84] uppercase tracking-wide whitespace-nowrap">
                NOT STARTED
              </div>
              <div className="flex-1 h-px bg-[#5a3e84]/40" />
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              {user.notStarted.map((setName: string, i: number) => (
                <div key={i}>{setName}</div>
              ))}
            </div>
          </>
        )}

        {/* MISSING HEADER */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-[#5a3e84]/40" />
          <div className="text-[10px] font-semibold text-[#5a3e84] uppercase tracking-wide whitespace-nowrap">
            {user.username}'s missing cards
          </div>
          <div className="flex-1 h-px bg-[#5a3e84]/40" />
        </div>

        {/* MISSING CARDS */}
        {(() => {
          const grouped = groupMissingBySet(user.missing);

          return user.missing.length === 0 ? (
            <div className="text-green-500 font-semibold">
              ✅ 100% Complete
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(grouped).map(([setName, cards]) => {
                const isOpenSet = openSet[user.id] === setName;

                return (
                  <div key={setName}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSet((prev) => ({
                          ...prev,
                          [user.id]: isOpenSet ? null : setName
                        }));
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-xs font-semibold border border-[#b9a3e3]/60 shadow-sm"
                      style={{
                        background: "linear-gradient(90deg, #f5f0ff 0%, #e6dbff 40%, #d6c8ff 60%, #f5f0ff 100%)",
                        color: "#2f1f4a"
                      }}
                    >
                      {setName}
                    </button>

                    {isOpenSet && (
                      <div className="mt-1 ml-2 space-y-1 text-xs text-muted-foreground max-h-40 overflow-y-auto">
                        {cards.map((card, i) => (
                          <div key={i}>{card}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>
    </div>
  </div>
)}

              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
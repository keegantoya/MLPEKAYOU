import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import leaderboardBadge from "@/assets/avatars/leaderboardbadge.png";

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
    PER: 6,
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
    name: "Serialized & Limited Cards",
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
  "SN": "⬦N",
};

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [openProfile, setOpenProfile] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: progress } = await supabase
        .from("collection_progress_raw")
        .select("*");

        const mergedProgress: Record<string, any> = {};

progress?.forEach((row: any) => {
  const key = `${row.user_id}-${row.set_id}`;

  if (!mergedProgress[key]) {
    mergedProgress[key] = {
      user_id: row.user_id,
      set_id: row.set_id,
      progress: {}
    };
  }

  Object.entries(row.progress || {}).forEach(([card, value]) => {
    if (value) {
      mergedProgress[key].progress[card] = true;
    }
  });
});
        
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*");

      const profileMap: Record<string, any> = {};
profiles?.forEach((p: any) => {
  profileMap[p.id] = {
    ...p,
    hiddenSets: p.iso_hidden_sets || []
  };
});
      const totals: Record<string, any> = {};

      Object.keys(profileMap).forEach((userId) => {
  const profile = profileMap[userId];

  if (!totals[userId]) {
    totals[userId] = {
      id: userId,
      username: profile?.username || "Anonymous",
      avatar: profile?.avatar_url,
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
  // COUNT ALL SD CARDS
Object.entries(ownedMap).forEach(([cardKey, value]) => {
  if (value !== true) return;

const rawKey = cardKey.replace("STARTER-", "").replace("BONUS-", "");

if (rawKey.startsWith("SD01")) {

    // detect starter decks
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

  // BONUS PACK ISO (CORRECT KEYS)
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

    // match your real PER offset
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

      if (rarity === "PER") {
        displayRarity = "ER";
        special = true;
      }

      const formatted = `${special ? "※" : ""}SD01-${displayRarity}${num}`;

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

  if (prefix === "BP01ER") {
    return Array.from({ length: 6 }, (_, i) =>
      `BP01ER${String(i + 7).padStart(2, "0")}`
    );
  }

  if (prefix === "BP01PSPR") {
    return [1,2,3,5,7,8,9,12,13,18,21].map(n =>
      `BP01PSPR${String(n).padStart(2, "0")}`
    );
  }

  return Array.from({ length: count }, (_, i) =>
    `${prefix}${String(i + 1).padStart(2, "0")}`
  );
});

totalCardsInSet = FW_CARDS.length;

const validSet = new Set(FW_CARDS);

FW_CARDS.forEach((key) => {

if (ownedMap[key] && validSet.has(key)) {
  owned++;
  hasAny = true;
}

  if (!isHidden && hasAny) {

    let rarity = key.replace("BP01", "").replace(/[0-9]/g, "");
    let displayRarity = rarity;
    let special = false;

    if (rarity === "PER") {
      displayRarity = "ER";
      special = true;
    }
    if (rarity === "PSPR") {
      displayRarity = "SPR";
      special = true;
    }
    if (rarity === "PGR") {
      displayRarity = "GR";
      special = true;
    }
    if (rarity === "PCR") {
      displayRarity = "CR";
      special = true;
    }
    if (rarity === "PRR") {
      displayRarity = "RR";
      special = true;
    }

    const num = key.slice(-2);
    const formatted = `${special ? "※" : ""}BP01-${displayRarity}${num}`;

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

        missingCards.push(`${set.name} • ${displayRarity}-${i}`);
      }
    }
  });

}
    totals[userId].total += owned;
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

  return (
    <div
  className="min-h-screen"
  style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
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

<div className="mb-20">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((user, index) => {
            const isOpen = openProfile === user.id;

            return (
              <div
  key={index}
  className={`relative bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer transition
  ${isOpen ? "z-50 shadow-2xl" : "z-0 shadow-md hover:shadow-xl hover:-translate-y-0.5"}
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
  <div className="font-bold">
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
                    <div className="font-semibold">
                      {user.username}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {user.total} cards
                    </div>
                  </div>
                </div>

                {/* ✅ POPUP */}
                {isOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[95%] bg-white border border-gray-200 rounded-xl p-4 shadow-2xl z-20">
                    <div className="text-sm">

                      <div className="text-xs text-muted-foreground leading-snug mb-2">
  These are the cards this user is missing from all released sets.
</div>

{user.mastered?.length > 0 && (
  <div className="text-xs text-emerald-600 font-medium mb-2 space-y-1">
    {user.mastered.map((setName: string, i: number) => {

      if (setName === "Serialized & Limited Cards") {
        return (
          <div key={i}>
            {user.username} has the Andy Price promo.
          </div>
        );
      }

      return (
        <div key={i}>
          {user.username} has completed {setName}.
        </div>
      );
    })}
  </div>
)}

{user.hiddenSets.length > 0 && (
  <div className="text-xs text-red-500 mb-2">
    {user.hiddenSets.map((setId: string, i: number) => {
      let name = sets.find(s => s.id === setId)?.name;

if (setId === "SD_STARTERS") {
  name = "Friendships Begin — Starter Decks";
}

if (setId === "SD_BONUS") {
  name = "Friendships Begin — Bonus Packs";
}

return (
  <div key={i}>
    {user.username} is not collecting {name}.
  </div>
);
    })}
  </div>
)}
{user.notStarted?.length > 0 && (
  <div className="text-xs text-muted-foreground italic mb-2">
    {user.notStarted.map((setName: string, i: number) => {

  if (setName === "Serialized & Limited Cards") {
    return (
      <div key={i}>
        {user.username} does not yet have the Andy Price promo.
      </div>
    );
  }

  return (
    <div key={i}>
      {user.username} has not yet started collecting {setName}.
    </div>
  );
})}
  </div>
)}

                      <div className="font-semibold mb-1">
                        {user.username}
                      </div>

                      <div className="max-h-40 overflow-y-auto text-xs space-y-1">
  {user.missing.length === 0 ? (
    <div className="text-green-500 font-semibold">
      ✅ 100% Complete
    </div>
  ) : (
    user.missing.map((card: string, i: number) => {
  const [setName, rest] = card.split(" • ");

  return (
    <div key={i} className="text-muted-foreground">
      <span className="font-semibold">{setName}</span>
      {" • "}
      {rest}
    </div>
  );
})
  )}
</div>

                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
        </div>
<footer className="py-4 sm:py-5 text-center text-[10px] sm:text-xs text-black">
        <div className="max-w-lg mx-auto">
          <p>This website is not run or owned by Kayou.</p>

          <p className="text-[7px] sm:text-[8px] italic">
            All rights to respective owners. All rights to Kayou.
          </p>

          <p>
            This is a fan-made collector tool that generates zero profit and will not run ads or promote a subscription.
          </p>

          <img
            src="/logos/collab-logo.png"
            alt="MLPEKAYOU x KAYOU"
            className="mx-auto h-10 sm:h-14 opacity-90"
          />
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Leaderboard;
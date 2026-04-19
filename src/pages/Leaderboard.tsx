import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import avatar001 from "@/assets/avatars/avatar001.jpg";
import avatar002 from "@/assets/avatars/avatar002.jpg";
import avatar003 from "@/assets/avatars/avatar003.jpg";
import avatar004 from "@/assets/avatars/avatar004.jpg";
import avatar005 from "@/assets/avatars/avatar005.jpg";
import avatar006 from "@/assets/avatars/avatar006.jpg";
import avatar007 from "@/assets/avatars/avatar007.jpg";
import avatar008 from "@/assets/avatars/avatar008.jpg";

const avatarMap: Record<string, string> = {
  "avatar001.jpg": avatar001,
  "avatar002.jpg": avatar002,
  "avatar003.jpg": avatar003,
  "avatar004.jpg": avatar004,
  "avatar005.jpg": avatar005,
  "avatar006.jpg": avatar006,
  "avatar007.jpg": avatar007,
  "avatar008.jpg": avatar008,
};

const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
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
    id: "9",
    name: "Promo Cards",
    rarities: { PR: 5 }
  },
  {
    id: "10",
    name: "Serialized & Limited Cards",
    rarities: { LC: 1 }
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
        .from("collection_progress")
        .select("*");

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
      const seen: Record<string, boolean> = {};

      progress?.forEach((row: any) => {
        const key = `${row.user_id}-${row.set_id}`;
        if (seen[key]) return;
        seen[key] = true;

        const set = sets.find(s => s.id === String(row.set_id));
if (!set) return;

const id = row.user_id;

// ✅ Always create user FIRST
if (!totals[id]) {
  totals[id] = {
    id,
    username: profileMap[id]?.username || "Anonymous",
    avatar: profileMap[id]?.avatar_url,
    total: 0,
    missing: [] as string[],
    hiddenSets: profileMap[id]?.hiddenSets || []
  };
}

// ✅ Check if this set is hidden
const isHidden = profileMap[id]?.hiddenSets?.includes(String(row.set_id));

        let owned = 0;
let missingCards: string[] = [];

let totalCardsInSet = 0;

Object.entries(set.rarities).forEach(([rarity, count]) => {
  totalCardsInSet += count as number;
  for (let i = 1; i <= count; i++) {
    const cardKey = `${rarity}-${i}`;

    const value = row.progress?.[cardKey];
    const isOwned = value !== false && value != null;

    if (isOwned) {
      owned++;
    } else if (!isHidden) {
      let displayRarity = rarity === "LC" ? "PR" : rarity;

      // ✅ Apply visual overrides
      if (rarityDisplayMap[displayRarity]) {
        displayRarity = rarityDisplayMap[displayRarity];
      }

      const displayKey = `${displayRarity}-${i}`;

      missingCards.push(`${set.name} • ${displayKey}`);
    }
  }
});


        totals[id].total += owned;
        totals[id].missing.push(...missingCards);
        if (!totals[id].mastered) {
  totals[id].mastered = [];
}

if (owned === totalCardsInSet && totalCardsInSet > 0) {
  totals[id].mastered.push(set.name);
}
      });

      const sorted = Object.values(totals)
  .filter((user: any) => user.username !== "HeiManTou") // 🚫 REMOVE THIS USER
  .sort((a: any, b: any) => b.total - a.total)
  .slice(0, 12); // ✅ TOP 12

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
    backgroundColor: "#f5f5f5",
    backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
    backgroundSize: "16px 16px",
  }}
>
      <KayouHeader />

<div className="container py-8 overflow-visible">

  <div className="text-center mb-6">
    <h1 className="text-2xl font-bold">
      Top KayouUS Collectors
    </h1>
    <p className="text-sm text-muted-foreground mt-1">
      The top 12 collectors on this website who have collected ALL card releases will appear here. Their ISOs show only the cards they are missing from ALL current releases.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((user, index) => {
            const isOpen = openProfile === user.id;

            return (
              <div
  key={index}
  className="relative bg-card border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition"
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

  {/* ✨ SPARKLES ATTACHED TO AVATAR */}
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

  {/* 🎀 RIBBON */}
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
                  <div className="absolute left-0 top-full mt-2 w-full bg-background border rounded-lg p-4 shadow-lg z-10">
                    <div className="text-sm">

                      <div className="text-xs text-muted-foreground leading-snug mb-2">
  These are the only cards this user is missing that keeps them from 100% completion of all released sets.
</div>

{user.mastered?.length > 0 && (
  <div className="text-xs text-emerald-600 font-medium mb-2 space-y-1">
    {user.mastered.map((setName: string, i: number) => (
      <div key={i}>
        {user.username} has completed {setName}.
      </div>
    ))}
  </div>
)}

{user.hiddenSets.length > 0 && (
  <div className="text-xs text-muted-foreground italic mb-2">
    {user.hiddenSets.map((setId: string, i: number) => {
      const set = sets.find(s => s.id === setId);
      return (
        <div key={i}>
          {user.username} is not collecting {set?.name}.
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
    user.missing.map((card: string, i: number) => (
      <div key={i} className="text-muted-foreground">
        {card}
      </div>
    ))
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
    </div>
  );
};

export default Leaderboard;
import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
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
import avatar009 from "@/assets/avatars/avatar009.jpg";
import avatar010 from "@/assets/avatars/avatar010.jpg";
import avatar011 from "@/assets/avatars/avatar011.jpg";
import avatar012 from "@/assets/avatars/avatar012.jpg";
import avatar013 from "@/assets/avatars/avatar013.jpg";
import avatar014 from "@/assets/avatars/avatar014.jpg";
import avatar015 from "@/assets/avatars/avatar015.jpg";
import setLeaderboardsBadge from "@/assets/avatars/setleaderboardsbadge.png";

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
  { id: "1", name: "Eternal Moon First Edition", total: 186 },
  { id: "5", name: "Rainbow First Edition", total: 146 },
  { id: "7", name: "Fun Moments First Edition", total: 127 },
  { id: "2", name: "Eternal Moon Second Edition", total: 189 },
  { id: "8", name: "Fun Moments Second Edition", total: 136 },
 //  { id: "3", name: "Eternal Moon Third Edition", total: 290 }, //
  { id: "friendshipsbegin", name: "Friendships Begin", total: 194 },
  {
  id: "fantasywonderland",
  name: "Fantasy Wonderland",
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
    PER: 6,
    PSPR: 11,
    PGR: 6,
    PCR: 12,
    PRR: 6
  }
}
];

const manualFirstFinishers: Record<string, { username: string; avatar_url?: string }> = {
  "1": {
    username: "Jacob",
    avatar_url: "avatar010.jpg"
  },
  "2": {
    username: "Jacob",
    avatar_url: "avatar010.jpg"
  },
  "5": {
    username: "Keegan (Owner)",
    avatar_url: "avatar006.jpg"
  },
  "8": {
  username: "Keegan (Owner)",
  avatar_url: "avatar006.jpg"
}
};

const isoSets = [
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
    id: "friendshipsbegin",
    name: "Friendships Begin",
    folder: "friendshipsbegin",
    prefix: "SD01",
    rarities: {
  
    }
  }
];

const Community = () => {

  const navigate = useNavigate();

  const [firstFinishers, setFirstFinishers] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [loadingHidden, setLoadingHidden] = useState(false);
  const [tradeCards, setTradeCards] = useState<any[]>([]);
  const [view, setView] = useState<"choice" | "iso" | "trade">("choice");
  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getTradeImage = (setId: string, cardKey: string) => {
  const [rarity, number] = cardKey.split("-");
  const set = isoSets.find((s) => s.id === setId);

  // PROMOS
  if (rarity === "PR") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (!set) return null;

  return `/cards/${set.folder}/${set.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
};

  const getAvatar = (avatar?: string) => {
    if (!avatar) return avatar001;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || avatar001;
  };

useEffect(() => {
  setFirstFinishers(manualFirstFinishers);
}, []);

  const loadISO = async (user: any) => {
    

    setSelectedUser(user);
    setView("choice");
    setLoadingHidden(true);

   const { data: progress } = await supabase
  .from("collection_progress_raw")
  .select("*")
  .eq("user_id", user.id);

    const allOwned: Record<string, boolean> = {};

    progress?.forEach((set: any) => {
      Object.entries(set.progress || {}).forEach(([key, value]) => {
        if (value) {
          allOwned[`${set.set_id}-${key}`] = true;
        }
      });
    });

    setOwned(allOwned);

    const { data: profile } = await supabase
      .from("profiles")
      .select("iso_hidden_sets")
      .eq("id", user.id)
      .single();

    setHiddenSets(profile?.iso_hidden_sets || []);
    setLoadingHidden(false);

    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("user_id", user.id);

    setTradeCards(trades || []);
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

      <div className="container py-10 max-w-7xl">

        <div className="text-center mb-10 max-w-3xl mx-auto">
          <img
  src={setLeaderboardsBadge}
  alt="Set Leaderboards"
  className="mx-auto h-12 sm:h-14 md:h-16 object-contain mb-2"
/>
        </div>

<div className="flex items-center gap-6 my-4">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

  <img
    src="/website-assets/CCGBANNER.png"
    alt="CCG"
    className="h-16 sm:h-18 md:h-20 object-contain"
  />

  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
  {sets
    .filter((set) => ["4", "1", "2", "3", "5", "6", "7", "8"].includes(set.id))
    .map((set) => (

      <button
        key={set.id}
        onClick={() => navigate(`/community/${set.id}`)}
        className="
  group relative overflow-hidden
  rounded-3xl p-6 text-left
  bg-white/70 backdrop-blur-xl
  border border-white/60
  shadow-[0_10px_30px_rgba(76,29,149,0.08)]
  hover:shadow-[0_20px_45px_rgba(76,29,149,0.15)]
  hover:-translate-y-1.5
  hover:border-yellow-300/60
  transition-all duration-300
"
      >
        <h2 className="text-lg font-bold text-purple-950 mb-2 pr-24">
          {set.name}
        </h2>

        <div className="text-sm font-medium text-purple-700 group-hover:text-purple-900 transition-colors">
  View Leaderboard →
</div>

        {firstFinishers[String(set.id)] && (
          <div className="absolute top-3 right-3 flex flex-col items-center">
            <div className="relative w-14 h-14">
              <img
                src={getAvatar(firstFinishers[String(set.id)].avatar_url)}
                className="w-14 h-14 rounded-full border-4 border-white shadow-xl ring-2 ring-yellow-300/60"
              />

              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                #1
              </div>
            </div>

            <div className="font-semibold text-xs mt-1 text-center">
              {firstFinishers[String(set.id)]?.username}
            </div>
          </div>
        )}
      </button>
  ))}
</div>

<div className="flex items-center gap-6 my-4">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

  <img
    src="/website-assets/TCGBANNER.png"
    alt="TCG"
    className="h-16 sm:h-18 md:h-20 object-contain"
  />

  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
  {sets
    .filter((set) => ["fantasywonderland", "friendshipsbegin"].includes(set.id))
    .map((set) => (

      <button
        key={set.id}
        onClick={() => navigate(`/community/${set.id}`)}
        className="
  group relative overflow-hidden
  rounded-3xl p-6 text-left
  bg-white/70 backdrop-blur-xl
  border border-white/60
  shadow-[0_10px_30px_rgba(76,29,149,0.08)]
  hover:shadow-[0_20px_45px_rgba(76,29,149,0.15)]
  hover:-translate-y-1.5
  hover:border-yellow-300/60
  transition-all duration-300
"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-purple-100/30 pointer-events-none" />
        <h2 className="text-lg font-bold text-purple-950 mb-2 pr-24">
          {set.name}
        </h2>

        <div className="text-sm font-medium text-purple-700 group-hover:text-purple-900 transition-colors">
  View Leaderboard →
</div>

        {firstFinishers[String(set.id)] && (
          <div className="absolute top-3 right-3 flex flex-col items-center">
            <div className="relative w-14 h-14">
              <img
                src={getAvatar(firstFinishers[String(set.id)].avatar_url)}
                className="w-14 h-14 rounded-full border-4 border-white shadow-xl ring-2 ring-yellow-300/60"
              />

              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                #1
              </div>
            </div>

            <div className="font-semibold text-xs mt-1 text-center">
              {firstFinishers[String(set.id)]?.username}
            </div>
          </div>
        )}
      </button>
  ))}
</div>
<footer className="mt-16 px-4 py-8 sm:py-10 text-center text-xs sm:text-sm text-neutral-600">
  <div className="max-w-xl mx-auto space-y-2">
    <p className="leading-relaxed">
      This website is not run or owned by Kayou.
    </p>

    <p className="text-[9px] sm:text-[10px] italic text-neutral-500 leading-relaxed">
      All rights to their respective owners. All rights to Kayou.
    </p>

    <p className="leading-relaxed max-w-md mx-auto">
     This is a fanmade collector tool and generates no profit.
    </p>

    <img
      src="/logos/collab-logo.png"
      alt="MLPEKAYOU x KAYOU"
      className="mx-auto mt-4 h-12 sm:h-16 w-auto opacity-90"
    />
  </div>
</footer>
      </div>
    </div>
  );
};

export default Community;
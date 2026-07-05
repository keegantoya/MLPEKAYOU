import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

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
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";

import spider from "/website-assets/spider.webp";

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
  "heimantouavatar": heimantouAvatar,
  "heimantouavatar.webp": heimantouAvatar,
  "keeganpfp.webp": KeeganAvatar,
  "keeganpfpnmn.webp": KeeganAvatar2,
  "maipfp.webp": maipfp,
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

const sets: Record<string, { name: string; total: number }> = {
  "1": { name: "Eternal Moon First Edition", total: 186 },
  "2": { name: "Eternal Moon Second Edition", total: 189 },
  "3": { name: "Eternal Moon Third Edition", total: 290 },
  "4": { name: "Star First Edition", total: 105 },
  "5": { name: "Rainbow First Edition", total: 146 },
  "6": { name: "Rainbow Second Edition", total: 170 },
  "7": { name: "Fun Moments First Edition", total: 127 },
  "8": { name: "Fun Moments Second Edition", total: 136 },
  "11": { name: "Fun Moments Third Edition", total: 148 },
  "friendshipsbegin": { name: "Friendships Begin", total: 194 },
  "fantasywonderland": { name: "Fantasy Wonderland", total: 191 },
};

const isoSets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
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
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
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
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  {
    id: "8",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR:9, CR: 12 }
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
    SZR: 3
  }
},
 {
    id: "11",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR:9, CR: 12, SCR: 12 }
  },
  {
    id: "friendshipsbegin",
    name: "Friendships Begin",
    folder: "friendshipsbegin",
    prefix: "SD01",
    rarities: {}
  },
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
    PER: 12,
    PSPR: 11,
    PGR: 6,
    PCR: 12,
    PRR: 6
  }
}
];

const medals = ["🥇", "🥇", "🥇"];
const forcedStillCollecting = [""];

const manualPlacements: Record<string, string[]> = {
  "2": ["Jacob", "Mari", "Silly Pony", "Keegan (Owner)"],
  "8": ["Mari", "Keegan", "Jacob"],
};

const CommunitySet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [showAllFinishers, setShowAllFinishers] = useState(false);

  const set = id ? sets[id] : undefined;

  useEffect(() => {
    if (!id || !set) return;

    const load = async () => {

      const { data: progress } = await supabase
  .from("collection_progress_raw")
  .select("user_id, progress, updated_at")
        .eq(
  "set_id",
  id === "friendshipsbegin"
    ? "SD"
    : id === "fantasywonderland"
    ? "FW"
    : id
);

      const { data: profiles } = await supabase
  .from("profiles")
  .select("id, username, avatar_url");

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

      if (!progress || !profiles) return;

      const profileMap: Record<string, any> = {};
      profiles.forEach((p: any) => {
        profileMap[p.id] = p;
      });

     const active: any[] = [];
const finished: any[] = [];

progress.forEach((row: any) => {

  if (!eligibleUserIds.has(row.user_id)) {
    return;
  }

 let owned = 0;

if (id === "friendshipsbegin") {

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
      cards.push(`${deckCode}${rarity}${String(i).padStart(2, "0")}`);
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

const starterDecks = ["SD01A","SD01B","SD01C","SD01D","SD01E","SD01F"];

starterDecks.forEach((deck) => {
  const cards = getDeckCards(deck);

  cards.forEach((cardKey) => {
    const stateKey = `STARTER-${cardKey}`;

    if (row.progress?.[stateKey]) {
      owned++;
    }
  });
});

  // BONUS PACKS (68 cards)
BONUS_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 1; i <= count; i++) {

    let actualIndex = i;

    if (prefix === "SD01PER") {
      actualIndex = i + 6; 
    }

    const key = `${prefix}${String(actualIndex).padStart(2, "0")}`;
    const stateKey = `BONUS-${key}`;

    if (row.progress?.[stateKey]) {
      owned++;
    }
  }
});

} else {

  const isoSet = isoSets.find(s => s.id === id);
  if (!isoSet) return;

owned = Object.values(row.progress || {}).filter((v: any) =>
  v === true || v?.owned === true
).length;

}

  const user = {
    id: row.user_id,
    username: profileMap[row.user_id]?.username || "Anonymous",
    avatar: profileMap[row.user_id]?.avatar_url,
    owned,
    updated: row.updated_at
  };

  if (
  user.username === "HeiManTou (Chinese Collector)" ||
  user.username === "HeiManTou"
) {
  return;
}

  const actualTotal = set.total;

 if (
  id === "7" && 
  user.username === "HeiManTou (Chinese Collector)"
) {
  active.push(user);
} else if (owned === actualTotal) {
  finished.push(user);
} else {
  active.push(user);
}

});

active.sort((a, b) => {
  if (forcedStillCollecting.includes(a.username)) return -1;
  if (forcedStillCollecting.includes(b.username)) return 1;
  return b.owned - a.owned;
});

if (manualPlacements[id || "HeiManTou (Chinese Collector)"]) {

  const manualOrder = manualPlacements[id || ""];

  finished.sort((a, b) => {

    const aIndex = manualOrder.indexOf(a.username);
    const bIndex = manualOrder.indexOf(b.username);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return new Date(a.updated).getTime() - new Date(b.updated).getTime();
  });

} else {

finished.sort(
  (a, b) =>
    new Date(a.completed_at).getTime() -
    new Date(b.completed_at).getTime()
);

}

setCollectors(active.slice(0, 10));
setCompleted(finished.slice(0, 10));

    };

    load();
  }, [id, set]);

const getAvatar = (avatar?: string, username?: string) => {
  if (username === "HeiManTou (Chinese Collector)") {
    return heimantouAvatar;
  }

  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";

  return (
    avatarMap[file] ||
    avatarMap[`${file}.webp`] ||
    avatar001
  );
};

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  if (!set) return null;

return (
<div
  className="min-h-screen font-['Oxanium']"
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
    `,
  }}
>
      <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
  {/* Back Button */}
  {/* Back Button */}
<button
  onClick={() => navigate("/community")}
  className="
    inline-flex items-center gap-2
    text-sm font-semibold
    text-[#d7b04c]
    hover:text-[#f4d47c]
    transition-colors
    mb-6
  "
>
  <ArrowLeft className="h-4 w-4" />
  Back to Community
</button>

<div className="mb-10">
  <h1 className="text-4xl font-black tracking-wide text-[#f5e4b5]">
    {set.name}
  </h1>

  <p className="mt-3 max-w-3xl text-[#b9b9b9] leading-relaxed">
    View the collectors closest to completing this set along with everyone who has
    already completed it in completion order.
  </p>
</div>

  {/* Layout */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
  {/* Completed Sets - FIRST */}
  <div
    className="
  xl:col-span-1
rounded-3xl
bg-gradient-to-b
from-[#2d2d2d]
via-[#1b1b1b]
to-[#111111]
border
border-[#c79b32]
shadow-[0_18px_40px_rgba(0,0,0,.45)]
      p-5 sm:p-6
    "
  >
    <h2 className="text-xl font-black tracking-wide text-[#f4d47c] mb-5">
      Completed
    </h2>

    <div className="space-y-3">
      {(showAllFinishers ? completed : completed.slice(0, 3)).map(
        (user, index) => (
<div
  key={index}
  className="
    flex items-center gap-3
    rounded-2xl
    bg-[#181818]
    border border-[#3d3d3d]
    hover:border-[#c79b32]
    transition-colors
    px-3 py-3 sm:px-4
    shadow-sm
  "
>
            <span className="text-2xl shrink-0">
              {medals[index] || "🏅"}
            </span>

            <img
              src={getAvatar(user.avatar, user.username)}
              className="
                w-10 h-10 sm:w-11 sm:h-11
                rounded-full
                border-[3px] border-[#d7b04c]
                shadow
                shrink-0
              "
            />

           <div className="flex items-center gap-2 min-w-0">
  <span
    className="
      font-semibold
      text-sm sm:text-base
      text-orange-200
      truncate
    "
  >
    {user.username}
  </span>

{VERIFIED_USERS[user.id] && (
  <img
    src={VERIFIED_USERS[user.id].badge}
    alt={VERIFIED_USERS[user.id].label}
    title={VERIFIED_USERS[user.id].label}
    className="w-4 h-4 object-contain flex-shrink-0"
  />
)}
</div>
          </div>
        )
      )}

      {completed.length > 3 && (
        <button
          onClick={() => setShowAllFinishers(!showAllFinishers)}
          className="
            w-full mt-2 py-3
            rounded-2xl
            bg-purple-950/70 hover:bg-purple-900
text-orange-200
            transition-colors
          "
        >
          {showAllFinishers
            ? "Show Less"
            : `View All ${completed.length} Finishers`}
        </button>
      )}

      {completed.length === 0 && (
  <div className="flex flex-col items-center py-6">
    <div className="mt-3 text-sm text-[#f4d47c] italic text-center">
      Nopony has completed this set yet...
    </div>
  </div>
)}
    </div>
  </div>

  {/* Still Collecting */}
  <div
    className="
  xl:col-span-2
rounded-3xl
bg-gradient-to-b
from-[#2d2d2d]
via-[#1b1b1b]
to-[#111111]
border
border-[#c79b32]
shadow-[0_18px_40px_rgba(0,0,0,.45)]
      p-5 sm:p-6
    "
  >
    <h2 className="text-xl font-black tracking-wide text-[#f4d47c] mb-5">
      Still Collecting
    </h2>

    <div className="space-y-3">
      {collectors.map((user, index) => (
        <div
          key={index}
          className="
flex items-center
rounded-2xl
bg-[#181818]
border border-[#3d3d3d]
hover:border-[#c79b32]
transition-colors
            px-3 py-3 sm:px-4
            shadow-sm
          "
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className="
                shrink-0
                w-8 text-sm font-bold
                text-orange-300
              "
            >
              #{index + 1}
            </span>

            <img
              src={getAvatar(user.avatar, user.username)}
              className="
                w-10 h-10 sm:w-11 sm:h-11
                rounded-full
                border-[3px] border-[#d7b04c]
                shadow
                shrink-0
              "
            />

            <div className="flex items-center gap-2 min-w-0">
  <span
    className="
      font-semibold
      text-sm sm:text-base
      text-orange-200
      truncate
    "
  >
    {user.username}
  </span>

{VERIFIED_USERS[user.id] && (
  <img
    src={VERIFIED_USERS[user.id].badge}
    alt={VERIFIED_USERS[user.id].label}
    title={VERIFIED_USERS[user.id].label}
    className="w-4 h-4 object-contain flex-shrink-0"
  />
)}
</div>
          </div>

          <div
            className="
              shrink-0
              text-sm sm:text-base
              font-bold
              text-orange-300
            "
          >
            {user.owned} / {set.total}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
</div>
    </div>
  );
};

export default CommunitySet;
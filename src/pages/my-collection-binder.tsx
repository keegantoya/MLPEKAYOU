import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import KeeganAvatar2 from "@/assets/avatars/keeganpfpnmn.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";

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
  "avatar027.webp": avatar027,
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
  "heimantouavatar": heimantouAvatar,
  "heimantouavatar.webp": heimantouAvatar,
  "keeganpfp.webp": KeeganAvatar,
  "keeganpfpnmn.webp": KeeganAvatar2,
  "maipfp.webp": maipfp,
  "terrypfp.webp": TerriAvatar,
};

const getAvatar = (avatar?: string) => {
  if (!avatar) return avatar001;

  const file = avatar.split("/").pop() || "";

  return (
    avatarMap[file] ||
    avatarMap[`${file}.webp`] ||
    avatar001
  );
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

const sets = [
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
    rarities: { BASE: 18, R: 30, SR: 14, ST: 20, TR: 12, TGR: 8, SSR: 15, FR: 18, UR: 19, USR: 8, XR: 8 }
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
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
  },
  {
    id: "11",
    name: "Fun Moments: Third Edition",
    folder: "fun-moments-three",
    prefix: "FM3",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 }
  },
  {
    id: "3",
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: { R: 60, SR: 40, SSR: 40, HR: 60, UR: 18, LSR: 32, SGR: 16, ZR: 14, SC: 7, "SZR": 3 }
  },
  {
    id: "4",
    name: "Star: First Edition",
    folder: "star-one",
    prefix: "S1",
    rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }
  },
  {
    id: "9",
    name: "Promotional Cards",
    folder: "promos",
    prefix: "PR",
    rarities: { PR: 6 }
  },
  {
  id: "FW",
  name: "Fantasy Wonderland",
  folder: "fantasy-wonderland",
  prefix: "FW",
  rarities: {}
},
{
  id: "friendshipsbegin",
  name: "Friendships Begin",
  folder: "friendshipsbegin",
  prefix: "SD01",
  rarities: {}
},
{
  id: "tcgpromos",
  name: "TCG Promos",
  folder: "tcgpromos",
  prefix: "RR",
  rarities: { PR: 6 }
},
];

const binders = ["Star", "Moon", "Rainbow", "Fun Moments", "TCG", "Promos"];

const binderSets = {
  Moon: [
    { id: "1", label: "Eternal Moon One" },
    { id: "2", label: "Eternal Moon Two" },
    { id: "3", label: "Eternal Moon Three" },
  ],

  Rainbow: [
    { id: "5", label: "Rainbow One" },
    { id: "6", label: "Rainbow Two" },
  ],

  Star: [
    { id: "4", label: "Star One" },
  ],

  "Fun Moments": [
    { id: "7", label: "Fun Moments One" },
    { id: "8", label: "Fun Moments Two" },
    { id: "11", label: "Fun Moments Three" },
  ],

  TCG: [
    { id: "FW", label: "Fantasy Wonderland" },
    { id: "friendshipsbegin", label: "Friendships Begin" },
  ],

  Promos: [
    { id: "tcgpromos", label: "TCG Promos" },
    { id: "9", label: "CCG Promos" },
  ],
};

export default function MyCollectionBinder() {
  const [selectedBinder, setSelectedBinder] = useState("Moon");
  const [selectedSetId, setSelectedSetId] = useState("1");
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [viewingUsername, setViewingUsername] = useState("My Collection");

const [userSearch, setUserSearch] = useState("");
const [searchResults, setSearchResults] = useState<any[]>([]);
const searchRef = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState(1);
  const [layout, setLayout] = useState<"3x3" | "4x3" | "2x2">("3x3");
  const [organization, setOrganization] = useState<"standard" | "full">("standard");

    const touchStartX = useRef(0);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setSearchResults([]);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  useEffect(() => {

  const load = async () => {

const {
  data: { user },
} = await supabase.auth.getUser();

if (!viewingUserId && user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile) {
    setViewingProfile(profile);
    setViewingUsername(profile.username);
  }
}

const targetUserId = viewingUserId ?? user?.id;

if (!targetUserId) return;

console.log("USER ID:", user?.id);

if (!user) return;

    if (!user) return;

const { data: progress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", targetUserId);

const { data: rawProgress } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", targetUserId);

const map: Record<string, any> = {};

[...(progress || []), ...(rawProgress || [])].forEach((row: any) => {
  map[row.set_id] = {
    ...(map[row.set_id] || {}),
    ...(row.progress || {}),
  };
});

setProgressMap(map);
console.log(map);

    console.log(map);

  };

  load();

}, [viewingUserId]);

const selectedSet = useMemo(() => {

  return sets.find(s => s.id === selectedSetId);

}, [selectedSetId]);

if (!selectedSet) {
  return null;
}

const slugMap: Record<string, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "11": "11",
  "9": "9",
  "FW": "FW",
  "friendshipsbegin": "SD",
  "tcgpromos": "tcgpromos",
};

const resolvedSetId = slugMap[selectedSetId] || selectedSetId;

const progress = progressMap[resolvedSetId] || {};

let cards: any[] = [];

if (selectedSet.id === "FW") {

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
cards = STRUCTURE.flatMap(({ prefix, count }) => {
  if (prefix === "BP01ER") {
    return Array.from({ length: 6 }, (_, i) => {
      const num = String(i + 7).padStart(2, "0");

      return {
        rarity: "ER",
        key: `BP01ER${num}`,
        image: `/fantasy-wonderland/SD01ER${num}.webp`,
      };
    });
  }

  if (prefix === "BP01PER") {
    return Array.from({ length: 12 }, (_, i) => {
      const num = String(i + 1).padStart(2, "0");

      return {
        rarity: "PER",
        key: `BP01PER${num}`,
        image: `/fantasy-wonderland/SD01PER${num}.webp`,
      };
    });
  }

  if (prefix === "BP01PSPR") {
    const numbers = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];

    return numbers.map((n) => ({
      rarity: "PSPR",
      key: `BP01PSPR${String(n).padStart(2, "0")}`,
      image: `/fantasy-wonderland/BP01PSPR${String(n).padStart(2, "0")}.webp`,
    }));
  }

  return Array.from({ length: count }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");

    return {
      rarity: prefix.replace("BP01", ""),
      key: `${prefix}${num}`,
      image: `/fantasy-wonderland/${prefix}${num}.webp`,
    };
  });
});

} else if (selectedSet.id === "friendshipsbegin") {

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

  cards = BONUS_STRUCTURE.flatMap(({ prefix, count }) =>
    Array.from({ length: count }, (_, i) => {
      let actualIndex = i + 1;

      // PER cards are numbered 07–18
      if (prefix === "SD01PER") {
        actualIndex += 6;
      }

      const num = String(actualIndex).padStart(2, "0");
      const key = `${prefix}${num}`;

      return {
        rarity: prefix.replace("SD01", ""),
        key: `BONUS-${key}`,
        image: `/friendships-begin/${key}.webp`,
      };
    })
  );

} else if (selectedSet.id === "tcgpromos") {

  cards = Array.from({ length: 6 }, (_, i) => ({
    rarity: "PR",
    number: i + 1,
    key: `RR${String(i + 1).padStart(2, "0")}`,
    image: `/tcgpromos/RR${String(i + 1).padStart(2, "0")}.webp`,
  }));

} else {

cards =
  selectedSet.id === "9"
    ? [1, 2, 3, 4, 5, 6, 7].map((number) => ({
        rarity: "PR",
        number,
        key: `PR-${number}`,
        image:
          number === 6
            ? "" // No PR006 image exists
            : `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`,
      }))
    : Object.entries(selectedSet.rarities).flatMap(
        ([rarity, count]) =>
          Array.from({ length: count as number }, (_, i) => {
            const fileRarity =
              rarity === "SHINING ZR"
                ? "SZR"
                : rarity;

            return {
              rarity,
              number: i + 1,
              key: `${rarity}-${i + 1}`,
              image:
                selectedSet.id === "3" &&
                rarity === "SZR" &&
                i === 0
                  ? "/card-backs/third-moon-edition-backs/M3SZRBINDERVER.webp"
                  : `/cards/${selectedSet.folder}/${selectedSet.prefix}${fileRarity}${String(
                      i + 1
                    ).padStart(3, "0")}.webp`,
            };
          })
      );

}

const ownedCards = cards;

useEffect(() => {
  cards.forEach((card) => {
    const img = new Image();
    img.src = card.image;
    img.decode?.().catch(() => {});
  });
}, [selectedSetId, layout]);

const layoutMap = {
  "2x2": { cols: 2, rows: 2, width: 240 },
  "3x3": { cols: 3, rows: 3, width: 360 },
  "4x3": { cols: 4, rows: 3, width: 480 },
};

const { cols, rows, width } = layoutMap[layout];

const slotsPerPage = cols * rows;

const totalPages = Math.ceil(cards.length / slotsPerPage);
const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));

const renderPage = (page: number, isRightPage = false) => {
  return Array.from({ length: slotsPerPage }).map((_, slot) => {

    let cardIndex: number;
if (organization === "standard") {

  const start =
    page * slotsPerPage +
    (isRightPage ? slotsPerPage : 0);

  cardIndex = start + slot;

} else {

  // Treat the two pages as one continuous 6-column page.
  const spreadStart = (spread - 1) * (slotsPerPage * 2);

  const row = Math.floor(slot / cols);
  const col = slot % cols;

  cardIndex =
    spreadStart +
    row * (cols * 2) +
    (isRightPage ? cols : 0) +
    col;

}

    if (cardIndex >= cards.length) {
      return (
        <div
          key={slot}
          className="aspect-[2.5/3.5] rounded-lg border-2 border-gray-400 bg-gray-300"
        />
      );
    }

const card = cards[cardIndex];

if (selectedSet.id === "9" && card.number === 6) {
  return (
    <div
      key={cardIndex}
      className="aspect-[2.5/3.5] rounded-lg border-2 border-gray-400 bg-gray-300 shadow-sm flex items-center justify-center p-2"
    >
      <span
        className="text-center font-bold text-gray-600"
        style={{
          fontSize: "14px",
          lineHeight: "1.2",
        }}
      >
        NOT YET
        <br />
        RELEASED
      </span>
    </div>
  );
}

const owned =
  progress[card.key] ||
  progress[`BONUS-${card.key}`];

if (!owned) {
  return (
    <div
      key={cardIndex}
      className="aspect-[2.5/3.5] rounded-lg border-2 border-gray-300 bg-white shadow-sm"
    />
  );
}

return (
  <img
    key={cardIndex}
    src={card.image}
    loading="lazy"
    draggable={false}
style={{
  width: "100%",
  height: "100%",
  objectFit: "cover",
  userSelect: "none",
  backfaceVisibility: "hidden",
  willChange: "transform",
}}
    className="aspect-[2.5/3.5] rounded-lg shadow-sm"
  />
);
  });
};

return (
  <div
    className="min-h-screen bg-white flex flex-col items-center py-12"
    style={{
      touchAction: "pan-x",
      overscrollBehavior: "none",
    }}
  >

<div className="mb-6 flex items-center justify-center gap-4 w-full">

<div
  ref={searchRef}
  className="relative w-[220px] md:w-full md:max-w-md"
>

<input
    value={userSearch}
    onChange={async (e) => {
      const value = e.target.value;

      setUserSearch(value);

      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

const { data: profiles } = await supabase
  .from("profiles")
  .select(`
    id,
    username,
    avatar_url
  `)
  .ilike("username", `%${value}%`)
  .limit(20);

const ids = (profiles || []).map(p => p.id);

const { data: trading } = await supabase
  .from("trading_profiles")
  .select("user_id")
  .in("user_id", ids);

const validIds = new Set((trading || []).map(t => t.user_id));

setSearchResults(
  (profiles || []).filter(p => validIds.has(p.id))
);
    }}
    placeholder="Search collectors..."
    className="block w-[220px] md:w-full md:max-w-none mx-auto md:mx-0 rounded-lg border px-4 py-2"
  />

  {searchResults.length > 0 && (

    <div className="absolute left-0 right-0 mt-1 rounded-lg border bg-white shadow-lg z-50">

{searchResults.map((u) => (

  <button
    key={u.id}
    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-100"
    onClick={() => {
      setViewingUserId(u.id);
      setViewingUsername(u.username);
      setViewingProfile(u);

      setSearchResults([]);
      setUserSearch("");
    }}
  >
    <img
      src={getAvatar(u.avatar_url)}
      alt={u.username}
      className="h-10 w-10 rounded-full object-cover border border-gray-300"
    />

    <span>{u.username}</span>
  </button>

))}

    </div>

  )}
 </div>
 {viewingUserId && (
  <button
    onClick={() => {
  setViewingUserId(null);
}}
    className="rounded-lg bg-purple-600 px-5 py-2 font-semibold text-white hover:bg-purple-700 whitespace-nowrap"
  >
    <span className="md:hidden">Back</span>
<span className="hidden md:inline">Back to My Collection</span>
  </button>
)}
</div>

      {/* Binder Selection */}
      <div
  className="mb-8 flex justify-center gap-1 md:gap-3 flex-nowrap overflow-x-auto md:overflow-visible px-2 md:px-0"
>
        {binders.map((binder) => (
          <button
            key={binder}
            onClick={() => {

  setSelectedBinder(binder);

  setSelectedSetId(
    binderSets[binder as keyof typeof binderSets][0].id
  );

  setSpread(1);

}}
            className={`flex-shrink-0 rounded-lg px-2 py-1 text-[11px] md:px-5 md:py-2 md:text-base font-semibold transition ${
              selectedBinder === binder
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {binder}
          </button>
        ))}
      </div>

{/* Sidebar + Binder */}
<div className="relative w-full">

<div
  className="hidden md:flex flex-col gap-4"
  style={{
    position: "absolute",
    top: "-150px",
    left: "32px",
    width: "224px",
    zIndex: 50,
  }}
>
    <div className="rounded-xl border border-purple-300 bg-gradient-to-r from-purple-50 to-white p-4 shadow">

  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
    Viewing Binders
  </div>

 <div className="mt-2 flex items-center gap-3">
{viewingProfile?.avatar_url ? (
 <img
  src={getAvatar(viewingProfile?.avatar_url)}
  alt={viewingUsername}
  className="h-11 w-11 rounded-full object-cover border-2 border-purple-400"
/>
) : (
  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 text-white">
    👤
  </div>
)}

<div className="min-w-0 flex-1 flex items-center gap-2">

  <span
    className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-xl text-purple-700"
    title={viewingUsername}
  >
    {viewingUsername}
  </span>

  {viewingUserId && VERIFIED_USERS[viewingUserId] && (
    <img
      src={VERIFIED_USERS[viewingUserId].badge}
      title={VERIFIED_USERS[viewingUserId].label}
      className="h-5 w-5 flex-shrink-0"
    />
  )}

</div>
</div>

</div>
<>
  <button
    onClick={() => {
      const layouts = ["3x3", "4x3", "2x2"] as const;
      const next =
        layouts[(layouts.indexOf(layout) + 1) % layouts.length];

      setLayout(next);
      setSpread(1);
    }}
    className="w-full rounded-xl border bg-white py-3 font-semibold shadow transition hover:bg-gray-100"
  >
    Change Binder Size
  </button>

  <button
    onClick={() =>
      setOrganization((o) =>
        o === "standard" ? "full" : "standard"
      )
    }
    className="w-full rounded-xl border bg-white py-3 font-semibold shadow transition hover:bg-gray-100"
  >
    {organization === "standard"
      ? "Standard Organization"
      : "Full Length Organization"}
  </button>
</>

  <div className="rounded-xl border bg-gray-100 p-5 shadow">
    <h2 className="mb-4 text-xl font-bold">{selectedBinder}</h2>

    <div className="space-y-2">

      {binderSets[selectedBinder as keyof typeof binderSets].map((set) => (

        <button
          key={set.id}
          onClick={() => {
  setSelectedSetId(set.id);
  setSpread(1);
  setOrganization("standard");
}}
          className={`block w-full rounded-lg px-3 py-2 text-left transition ${
            selectedSetId === set.id
              ? "bg-purple-600 text-white"
              : "hover:bg-gray-200"
          }`}
        >
          {set.label}
        </button>

      ))}

    </div>
  </div>

</div>

<div className="md:hidden mb-4 flex flex-col gap-3 px-4">

<div className="flex gap-2">
  <button
    onClick={() => {
      const layouts = ["3x3", "4x3", "2x2"] as const;
      const next = layouts[(layouts.indexOf(layout) + 1) % layouts.length];
      setLayout(next);
      setSpread(1);
    }}
    className="flex-1 rounded-lg border bg-white py-2 text-sm font-semibold shadow"
  >
    Binder Size
  </button>

  <button
    onClick={() =>
      setOrganization(o =>
        o === "standard" ? "full" : "standard"
      )
    }
    className="flex-1 rounded-lg border bg-white py-2 text-sm font-semibold shadow"
  >
    {organization === "standard"
      ? "Standard"
      : "Full Length"}
  </button>
</div>

  {/* Categories */}
  <div className="rounded-xl border bg-gray-100 p-5 shadow">
    <div className="space-y-2">
      {binderSets[selectedBinder as keyof typeof binderSets].map((set) => (
        <button
          key={set.id}
          onClick={() => {
            setSelectedSetId(set.id);
            setSpread(1);
            setOrganization("standard");
          }}
          className={`block w-full rounded-lg px-3 py-2 text-left transition ${
            selectedSetId === set.id
              ? "bg-purple-600 text-white"
              : "hover:bg-gray-200"
          }`}
        >
          {set.label}
        </button>
      ))}
    </div>
  </div>

  <p className="text-center text-xs text-gray-500">
  Swipe left or right on the binder to change pages.
</p>

</div>


{/* Main Content Area */}
<div
  className="flex justify-center md:ml-[280px]"
>
{/* Binder */}
<div
  style={{
    width:
      layout === "2x2"
        ? "560px"
        : layout === "4x3"
        ? "900px"
        : "980px",
    display: "flex",
    justifyContent: "center",
    transform:
  typeof window !== "undefined" && window.innerWidth < 768
    ? layout === "2x2"
      ? "scale(.48)"
      : layout === "3x3"
      ? "scale(.36)"
      : "scale(.27)"
    : layout === "4x3"
    ? "translateX(-8px) scale(.68)"
    : "scale(.76)",
    transformOrigin: "top center",
  }}
>
<div
  className="relative flex items-center gap-0"
  onTouchStart={(e) => {
    touchStartX.current = e.touches[0].clientX;
  }}
  onTouchEnd={(e) => {
    if (window.innerWidth >= 768) return;

    const delta =
      e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(delta) < 50) return;

    if (delta < 0) {
      setSpread((s) => Math.min(totalSpreads, s + 1));
    } else {
      setSpread((s) => Math.max(1, s - 1));
    }
  }}
  style={{
    padding: "34px",
    borderRadius: "30px",
      background:
        "linear-gradient(145deg,#31115d 0%,#50208d 20%,#2b0f55 55%,#18052f 100%)",
      boxShadow:
        `
        0 40px 70px rgba(0,0,0,.45),
        inset 0 3px 2px rgba(255,255,255,.15),
        inset 0 -8px 18px rgba(0,0,0,.45)
        `,
    }}
  >
    {/* Leather Border */}
<div
  style={{
    position: "absolute",
    inset: "10px",
    borderRadius: "22px",
    border: "2px solid rgba(255,255,255,.05)",
    boxShadow:
      "inset 0 0 0 2px rgba(0,0,0,.35), inset 0 1px 1px rgba(255,255,255,.08)",
    pointerEvents: "none",
  }}
/>

{/* Outer Stitching */}
<div
  style={{
    position: "absolute",
    inset: "18px",
    borderRadius: "16px",
    border: "2px dashed rgba(230,215,175,.9)",
    boxSizing: "border-box",
    pointerEvents: "none",
    opacity: 1,
  }}
/>

{/* Leather Spine */}
<div
  style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    top: "12px",
    bottom: "12px",
    width: "96px",
    borderRadius: "18px",
    background:
      "linear-gradient(90deg,#19062d,#2c0d4f,#47227c,#2c0d4f,#19062d)",
    boxShadow:
      "inset 8px 0 12px rgba(0,0,0,.45), inset -8px 0 12px rgba(0,0,0,.45)",
    pointerEvents: "none",
    zIndex: 0,
  }}
/>
{/* Left Edge Arrow */}
<button
  onClick={() => setSpread((s) => Math.max(1, s - 1))}
  className="absolute z-50 hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
  style={{
    left: "-28px",
    top: "50%",
    transform: "translateY(-50%)",
  }}
>
  <ChevronLeft size={24} />
</button>

{/* Right Edge Arrow */}
<button
  onClick={() => setSpread((s) => Math.min(totalSpreads, s + 1))}
  className="absolute z-50 hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
  style={{
    right: "-28px",
    top: "50%",
    transform: "translateY(-50%)",
  }}
>
  <ChevronRight size={24} />
</button>
{/* Left Page */}
<div
 key={`left-${selectedSetId}-${layout}-${spread}-${organization}`}
 className="relative rounded-xl px-3 py-3 shadow-inner overflow-visible"
style={{
  background: "rgba(250,250,250,0.72)",
  backdropFilter: "blur(1.5px)",
  WebkitBackdropFilter: "blur(1.5px)",
  border: "1px solid rgba(255,255,255,.55)",
  boxShadow:
    "inset 0 1px 2px rgba(255,255,255,.7), inset 0 -2px 8px rgba(0,0,0,.08)",
}}
>
<div
  className="grid mx-auto"
  style={{
    gridTemplateColumns: `repeat(${cols}, 152px)`,
    gap: "10px",
    justifyContent: "center",
    alignContent: "center",
    minHeight: layout === "2x2" ? "420px" : undefined,
  }}
>
        {renderPage((spread - 1) * 2, false)}
      </div>
    </div>

{/* Binder Mechanism */}
<div
  className="relative flex items-center justify-center h-[540px] w-20"
  style={{
    marginLeft: "-28px",
    marginRight: "-28px",
    zIndex: 20,
    pointerEvents: "none",
  }}
>

  {/* Chrome Spine */}
  <div
    className="absolute h-full w-8 rounded-xl border border-gray-500"
    style={{
      background:
        "linear-gradient(90deg,#555 0%,#8f8f8f 12%,#fdfdfd 28%,#d9d9d9 40%,#ffffff 50%,#d9d9d9 60%,#8f8f8f 82%,#4b4b4b 100%)",
      boxShadow:
        "inset 0 2px 3px rgba(255,255,255,.9), inset 0 -3px 5px rgba(0,0,0,.35), 0 5px 12px rgba(0,0,0,.35)",
    }}
  />

  {Array.from({ length: 7 }).map((_, i) => (
    <div
      key={i}
      className="absolute"
      style={{
        top: `${38 + i * 72}px`,
      }}
    >
      {/* Ring */}
      <div
        style={{
          width: 46,
          height: 34,
          borderTop: "4px solid #f5f5f5",
          borderLeft: "4px solid #d5d5d5",
          borderBottom: "4px solid #4b5563",
          borderRight: "4px solid #6b7280",
          borderRadius: "0 18px 18px 0",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,.9), 0 2px 5px rgba(0,0,0,.25)",
          position: "relative",
          marginLeft: "15px",
        }}
      >
        {/* Ring split */}
        <div
          style={{
            position: "absolute",
            right: -2,
            top: "50%",
            transform: "translateY(-50%)",
            width: 2,
            height: 8,
            background: "#2e1065",
          }}
        />

        {/* Chrome highlight */}
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 2,
            width: 2,
            height: 20,
            borderRadius: 2,
            background: "rgba(255,255,255,.9)",
          }}
        />
      </div>
    </div>
  ))}
</div>

{/* Right Page */}
<div
  key={`right-${selectedSetId}-${layout}-${spread}-${organization}`}
  className="relative rounded-xl px-3 py-3 shadow-inner overflow-visible"
style={{
  background: "rgba(250,250,250,0.72)",
  backdropFilter: "blur(1.5px)",
  WebkitBackdropFilter: "blur(1.5px)",
  border: "1px solid rgba(255,255,255,.55)",
  boxShadow:
    "inset 0 1px 2px rgba(255,255,255,.7), inset 0 -2px 8px rgba(0,0,0,.08)",
}}
>
<div
  className="grid mx-auto"
  style={{
    gridTemplateColumns: `repeat(${cols}, 152px)`,
    gap: "10px",
    justifyContent: "center",
    alignContent: "center",
    minHeight: layout === "2x2" ? "420px" : undefined,
  }}
>
        {renderPage((spread - 1) * 2, true)}
      </div>
    </div>

  </div>
</div>
</div>
          </div>
        </div>

  );
}
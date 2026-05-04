import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import allIsosBadge from "@/assets/avatars/allisosbadge.png";

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

const sets = [
  { id: "1", name: "Eternal Moon First Edition", released: true, type: "ccg" },
{ id: "2", name: "Eternal Moon Second Edition", released: true, type: "ccg" },
{ id: "5", name: "Rainbow First Edition", released: true, type: "ccg" },
{ id: "7", name: "Fun Moments First Edition", released: true, type: "ccg" },
{ id: "8", name: "Fun Moments Second Edition", released: true, type: "ccg" },

{ id: "9", name: "CCG Promos", released: true, type: "ccg_promo" },
{ id: "10", name: "Limited Promos", released: true, type: "limited" },
{ id: "TCG_PROMOS", name: "TCG Promos", released: true, type: "tcg_promo" },


{ id: "FW", name: "Fantasy Wonderland", released: true, type: "tcg" },
{ id: "friendshipsbegin", name: "Friendships Begin", released: true, type: "tcg" },
];

const rarityDisplayMap: Record<string, string> = {
  "SN": "⬦N",
  "SHINING ZR": "⬦ZR",
  "LC": "PR",
  "PER": "※ER",
  "PSPR": "※SPR",
  "PGR": "※GR",
  "PCR": "※CR",
  "PRR": "※RR",
};

const avatarMap: Record<string, string> = {
  avatar001,
  avatar002,
  avatar003,
  avatar004,
  avatar005,
  avatar006,
  avatar007,
  avatar008,
  avatar009,
  avatar010,
  avatar011,
  avatar012,
  avatar013,
  avatar014,
  avatar015,
};

const setConfigs: Record<string, any> = {
  "1": { rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 } },
  "2": { rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 } },
  "5": { rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 } },
  "7": { rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 } },
  "8": { rarities: { N: 20, SN: 20, R:35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 } },
  "9": { rarities: { PR: 5 } },
  "10": { rarities: { LC: 1 } }
};

const getCardImage = (card: any) => {
  const { set_id, rarity, number } = card;

  // PROMOS
  if (set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  // SERIALIZED / LIMITED
  if (set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }

  // ✅ FANTASY WONDERLAND
if (set_id === "FW") {
  return `/cards/fantasywonderland/BP01${rarity}${String(number).padStart(2, "0")}.jpg`;
}

// ✅ FRIENDSHIPS BEGIN
if (set_id === "SD" || set_id === "friendshipsbegin") {
  return `/cards/friendshipsbegin/SD01${rarity}${String(number).padStart(2, "0")}.jpg`;
}

  // DEFAULT SETS
  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
  };

  const c = config[set_id];
  if (!c) return "";

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
};

export default function PublicISO() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [userISO, setUserISO] = useState<Record<string, Record<string, any[]>>>({});
      const [selectedSet, setSelectedSet] = useState<string | null>(null);
      const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
        const searchRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = async (value: string) => {
  setSearch(value);

  if (value.length < 2) {
    setResults([]);
    return;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .ilike("username", `%${value}%`)
    .limit(10);

  setResults(data || []);
};

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(e.target as Node)
    ) {
      setResults([]);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const loadUserISO = async (user: any) => {
  setSelectedUser(user);

  const { data: progress } = await supabase
    .from("collection_progress_raw")
    .select("*")
    .eq("user_id", user.id);

  const isoCards: any[] = [];

  progress?.forEach((row: any) => {
const config = setConfigs[row.set_id];
const progressData = row.progress || {};

let allCards: any[] = [];

// ✅ FANTASY WONDERLAND
if (row.set_id === "FW") {
  const FW_STRUCTURE = [
    { prefix: "BP01C", count: 48 },
    { prefix: "BP01U", count: 18 },
    { prefix: "BP01ER", count: 6 },
    { prefix: "BP01SR", count: 14 },
    { prefix: "BP01SPR", count: 28 },
    { prefix: "BP01GR", count: 12 },
    { prefix: "BP01CR", count: 12 },
    { prefix: "BP01RR", count: 6 },
    { prefix: "BP01PER", count: 6 },
    { prefix: "BP01PSPR", count: 11 },
    { prefix: "BP01PGR", count: 6 },
    { prefix: "BP01PCR", count: 12 },
    { prefix: "BP01PRR", count: 6 },
  ];

  FW_STRUCTURE.forEach(({ prefix, count }) => {
    for (let i = 1; i <= count; i++) {
      allCards.push({
        rarity: prefix.replace("BP01", ""),
        number: i,
        set_id: row.set_id
      });
    }
  });
}

// ✅ FRIENDSHIPS BEGIN (SD)
else if (row.set_id === "friendshipsbegin" || row.set_id === "SD") {
  const SD_STRUCTURE = [
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

  SD_STRUCTURE.forEach(({ prefix, count }) => {
    for (let i = 1; i <= count; i++) {
      allCards.push({
        rarity: prefix.replace("SD01", ""),
        number: i,
        set_id: row.set_id
      });
    }
  });
}

// ✅ NORMAL CCG
else {
  if (!config) return;

  allCards = Object.entries(config.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1,
      set_id: row.set_id
    }))
  );
}
    allCards.forEach((card) => {
      const key = `${card.rarity}-${card.number}`;
      const value = progressData[key];

      const isOwned =
        value === true ||
        value?.owned === true;

      if (!isOwned) {
        isoCards.push(card);
      }
    });
  });

  const grouped: Record<string, Record<string, any[]>> = {};

isoCards.forEach(card => {
  if (!grouped[card.set_id]) grouped[card.set_id] = {};
  if (!grouped[card.set_id][card.rarity]) {
    grouped[card.set_id][card.rarity] = [];
  }

  grouped[card.set_id][card.rarity].push(card);
});

setUserISO(grouped);
setSelectedSet(null);
setSelectedRarity(null);
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

      <div className="container py-8">

       <img
  src={allIsosBadge}
  alt="All ISOs"
  className="mx-auto h-10 sm:h-14 md:h-16 object-contain mb-2"
/>
<div
  ref={searchRef}
  className="max-w-md mx-auto mb-4 relative"
>

  <input
    type="text"
    placeholder="Search for a user..."
    value={search}
    onChange={(e) => handleSearch(e.target.value)}
    className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
  />

  {results.length > 0 && (
    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-[999] overflow-hidden">

      {results.map((user, index) => (
       <div
  key={user.id}
  onClick={() => {
    loadUserISO(user);
    setResults([]);
    setSearch("");
  }}
  className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition
    ${index !== results.length - 1 ? "border-b border-gray-100" : ""}`}
>

  <img
    src={avatarMap[user.avatar_url] || avatar001}
    className="w-8 h-8 rounded-full object-cover border"
  />

  <span>{user.username}</span>

</div>
      ))}

    </div>
  )}

</div>

<p className="text-sm text-muted-foreground mt-1 max-w-xl mx-auto text-center mb-6">
  Users will appear in order of least need to greatest inside sets. Users can be found by their MLPEKAYOU username.
</p>

{/* DIVIDER */}
<div className="my-10 border-t border-gray-300 text-center relative">
  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
    Collectible Card Game
  </span>
</div>


        {/* CCG */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {sets
  .filter(set => set.released && set.type === "ccg")
  .map((set) => (
    <button
      key={set.id}
      onClick={() => {
        if (set.released) {
          navigate(`/public-iso/${set.id}`);
        }
      }}
      className="relative rounded-xl border p-4 cursor-pointer transition bg-white shadow-sm hover:bg-gray-100"
    >
      <div className="font-semibold mb-2">
        {set.name}
      </div>

      <div className="text-sm text-muted-foreground">
        View ISOs
      </div>
    </button>
))}
</div>

{/* DIVIDER */}
<div className="my-10 border-t border-gray-300 text-center relative">
  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
    Trading Card Game
  </span>
</div>

{/* TCG */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {sets
  .filter(set => set.released && set.type === "tcg")
  .map((set) => (
    <button
      key={set.id}
      onClick={() => {
        if (set.released) {
          navigate(`/public-iso/${set.id}`);
        }
      }}
      className="relative rounded-xl border p-4 cursor-pointer transition bg-white shadow-sm hover:bg-gray-100"
    >
      <div className="font-semibold mb-2">
        {set.name}
      </div>

      <div className="text-sm text-muted-foreground">
        View ISOs
      </div>
    </button>
))}
</div>

{/* DIVIDER */}
<div className="my-10 border-t border-gray-300 text-center relative">
  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
    Promotional Cards
  </span>
</div>

{/* PROMOTIONAL CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

  {/* 🔹 LIMITED */}
  {sets
    .filter(set => set.released && set.type === "limited")
    .map((set) => (
      <button
        key={set.id}
        onClick={() => navigate(`/public-iso/${set.id}`)}
        className="relative rounded-xl border p-4 cursor-pointer transition bg-white shadow-sm hover:bg-gray-100"
      >
        <div className="font-semibold mb-2">{set.name}</div>
        <div className="text-sm text-muted-foreground">View ISOs</div>
      </button>
    ))}

  {/* 🔹 TCG PROMOS */}
  {sets
    .filter(set => set.released && set.type === "tcg_promo")
    .map((set) => (
      <button
        key={set.id}
        onClick={() => navigate(`/public-iso/${set.id}`)}
        className="relative rounded-xl border p-4 cursor-pointer transition bg-white shadow-sm hover:bg-gray-100"
      >
        <div className="font-semibold mb-2">{set.name}</div>
        <div className="text-sm text-muted-foreground">View ISOs</div>
      </button>
    ))}

  {/* 🔹 CCG PROMOS */}
  {sets
    .filter(set => set.released && set.type === "ccg_promo")
    .map((set) => (
      <button
        key={set.id}
        onClick={() => navigate(`/public-iso/${set.id}`)}
        className="relative rounded-xl border p-4 cursor-pointer transition bg-white shadow-sm hover:bg-gray-100"
      >
        <div className="font-semibold mb-2">{set.name}</div>
        <div className="text-sm text-muted-foreground">View ISOs</div>
      </button>
    ))}

</div>

      </div>

{selectedUser && (
  <div className="fixed inset-0 z-50">

    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setSelectedUser(null)}
    />

    {/* MODAL WRAPPER */}
    <div className="relative flex items-center justify-center min-h-screen p-4">

      {/* MODAL CONTENT */}
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto
        bg-white/90 backdrop-blur-md
        border border-gray-200
        rounded-2xl shadow-2xl
        p-6 animate-in fade-in zoom-in-95">

<div className="flex justify-between items-center mb-6 border-b pb-3">

  <div className="flex items-center gap-3">

    <img
      src={avatarMap[selectedUser.avatar_url] || avatar001}
      className="w-10 h-10 rounded-full object-cover border"
    />

    <h2 className="text-lg font-semibold">
      {selectedUser.username}'s ISO
    </h2>

  </div>

  <button
    onClick={() => setSelectedUser(null)}
    className="text-sm px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100 transition"
  >
    Close
  </button>

</div>

        {/* LEVEL 1 — SETS */}
        {!selectedSet && (
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(userISO).map((setId) => {
              const setInfo = sets.find(s => s.id === setId);

              return (
                <div
                  key={setId}
                  onClick={() => setSelectedSet(setId)}
                  className="border rounded-xl p-3 cursor-pointer bg-white shadow-sm hover:shadow-md hover:bg-gray-100 transition text-sm"
                >
                  {setInfo?.name || (setId === "SD" ? "Friendships Begin" : `Set ${setId}`)}
                </div>
              );
            })}
          </div>
        )}

        {/* LEVEL 2 — RARITIES */}
        {selectedSet && !selectedRarity && (
          <div>
            <button
              onClick={() => setSelectedSet(null)}
              className="text-xs mb-3 text-muted-foreground"
            >
              ← Back to Sets
            </button>

            <div className="flex flex-wrap gap-2">
              {Object.keys(userISO[selectedSet]).map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className="px-3 py-1 text-xs border rounded-full hover:bg-gray-100 transition"
                >
                  {rarityDisplayMap[rarity] || rarity}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LEVEL 3 — CARDS */}
        {selectedSet && selectedRarity && (
          <div>
            <button
              onClick={() => setSelectedRarity(null)}
              className="text-xs mb-3 text-muted-foreground"
            >
              ← Back to Rarities
            </button>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(userISO[selectedSet]?.[selectedRarity] || []).map((card, i) => (
                <img
                  key={i}
                  src={getCardImage(card)}
                  className="w-full rounded-md hover:scale-105 transition"
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
)}
    </div>
  );
}
import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import tradingPostBadge from "@/assets/avatars/tradingpostbadge.png";

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

const rarityDisplayMap: Record<string, string> = {
  SZR: "⬦ZR",
  PER: "※ER",
  PSPR: "※SPR",
  PGR: "※GR",
  PCR: "※CR",
  PRR: "※RR",
};

const sets = [
  { id: "1", name: "Eternal Moon First Edition", released: true },
  { id: "5", name: "Rainbow First Edition", released: true },
  { id: "7", name: "Fun Moments First Edition", released: true },
  { id: "2", name: "Eternal Moon Second Edition", released: true },
  { id: "8", name: "Fun Moments Second Edition", released: true },
  { id: "3", name: "Eternal Moon Third Edition", released: true },
  { id: "4", name: "Star First Edition", released: false },
  { id: "6", name: "Rainbow Second Edition", released: false },
  { id: "9", name: "CCG Promos", released: true },
  { id: "10", name: "Serialized & Limited Cards", released: true },
  { id: "FW", name: "Fantasy Wonderland", released: true },
  { id: "friendshipsbegin", name: "Friendships Begin", released: true },
  {
  id: "tcgpromos",
  name: "TCG Promos",
  released: true
},
];

const getCardImage = (card: any) => {
  const { set_id, rarity, number } = card;

  if (set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }
  if (set_id === "tcgpromos") {
  return `/tcgpromos/RR${String(number).padStart(2, "0")}.png`;
}
  if (set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }
if (set_id === "FW") {
  const key = `BP01${rarity}${String(number).padStart(2, "0")}`;

  if (key.startsWith("BP01ER")) {
    return `/fantasy-wonderland/SD01ER${key.slice(-2)}.png`;
  }

  if (key.startsWith("BP01PER")) {
    return `/fantasy-wonderland/SD01PER${key.slice(-2)}.png`;
  }

  return `/fantasy-wonderland/${key}.png`;
}
  if (set_id === "friendshipsbegin" || set_id === "SD") {
  return `/friendships-begin/SD01${rarity}${String(number).padStart(2, "0")}.png`;
}

  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
    "3": { folder: "third-edition-moon", prefix: "M3" },
  };

  const c = config[set_id];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`;
};

const TradingPost = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
const [results, setResults] = useState<any[]>([]);
const [selectedUser, setSelectedUser] = useState<any | null>(null);

const [userTrades, setUserTrades] = useState<Record<string, Record<string, any[]>>>({});
const [selectedSet, setSelectedSet] = useState<string | null>(null);
const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  const [discord, setDiscord] = useState("");
  const [savedDiscord, setSavedDiscord] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadDiscord = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", user.id)
        .single();

      if (!error && data?.discord_username) {
        setSavedDiscord(data.discord_username);
      }
    };

    loadDiscord();
  }, []);

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

const loadUserTrades = async (user: any) => {
  setSelectedUser(user);

  const { data: trades } = await supabase
    .from("for_trade")
    .select("*")
    .eq("user_id", user.id);

  const grouped: Record<string, Record<string, any[]>> = {};

(trades || []).forEach((card: any) => {
  let rarity = "";
  let number = 0;

  const key = card.card_key;

  // DASH FORMAT (SR-012)
  if (key.includes("-")) {
    const parts = key.split("-");
    rarity = parts[0];
    number = parseInt(parts[1]);
  }

  else {
    const cleaned = key.replace("SD01", "").replace("BP01", "");

    rarity = cleaned.replace(/\d+/g, "");
    number = parseInt(cleaned.replace(/[A-Z]+/g, ""));
  }

  if (!grouped[card.set_id]) grouped[card.set_id] = {};
  if (!grouped[card.set_id][rarity]) {
    grouped[card.set_id][rarity] = [];
  }

  grouped[card.set_id][rarity].push({
    set_id: card.set_id,
    rarity,
    number
  });
});

  setUserTrades(grouped);
  setSelectedSet(null);
  setSelectedRarity(null);
};

const handleSaveDiscord = async () => {
  if (!discord.trim()) return;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be logged in");
    return;
  }

  setSaving(true);

  const { error } = await supabase
    .from("trading_profiles")
    .upsert({
      user_id: user.id,
      discord_username: discord.trim()
    });

  if (error) {
    console.error(error);
    alert("Failed to save Discord");
  } else {
    setSavedDiscord(discord.trim());
  }

  setSaving(false);
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

        <div className="text-center mb-6">
          <img
  src={tradingPostBadge}
  alt="Trading Post"
  className="mx-auto h-10 sm:h-14 md:h-16 object-contain mb-2"
/>
  <div className="mt-3 flex justify-center">
  <div
    className="text-black text-[10px] px-4 py-[4px] rounded-full
               border border-yellow-600 shadow-sm max-w-xs text-center leading-tight"
    style={{
      background: "linear-gradient(90deg, #d4af37 0%, #f5e6a8 50%, #d4af37 100%)"
    }}
  >
    <div>Terry Davis is the only reason the Trading Post still exists.</div>
    <div className="text-[9px] opacity-80">
      It kept breaking and I almost scrapped it. Everypony thank Terry Davis.
    </div>
  </div>
</div>
<p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
           Only people with their Discord usernames saved to their profile will appear if they have cards for trade. When searching for a trader, you must search their MLPEKAYOU username, not their Discord username.
          </p>
        </div>

        <div
  className="max-w-md mx-auto mb-4 relative"
>
  <input
    type="text"
    placeholder="Search for a user..."
    value={search}
    onChange={(e) => handleSearch(e.target.value)}
    className="w-full rounded-full border border-gray-300 px-4 py-2 text-base sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
  />

  {results.length > 0 && (
    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-[999] overflow-hidden">
      {results.map((user, index) => (
  <div
    key={user.id}
    onClick={() => {
      loadUserTrades(user);
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

        {/* SET GRID */}
        {(() => {
  const ccg = sets.filter(s =>
    s.released && ["1", "2", "5", "7", "8", "3"].includes(s.id)
  );

const tcg = sets.filter(s =>
  s.released && (
    s.id === "FW" ||
    s.id === "friendshipsbegin"
  )
);

  const promos = sets.filter(s =>
  s.released && (
    s.id === "9" ||
    s.id === "tcgpromos"
  )
);

  const renderSet = (set: any) => (
    <button
      key={set.id}
      onClick={() => navigate(`/trading-post/${set.id}`)}
      className="relative rounded-xl border p-4 cursor-pointer transition bg-white shadow-sm hover:bg-gray-100"
    >
      <div className="font-semibold mb-2">
  {set.name}
</div>

<div className="text-sm text-muted-foreground">
  View trades
</div>
    </button>
  );

  return (
    <div className="space-y-12">

      {ccg.length > 0 && (
  <div className="my-10 border-t border-gray-300 text-center relative">
    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
      Collectible Card Game
    </span>
  </div>
)}

      {/* CCG */}
      {ccg.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ccg.map(renderSet)}
          </div>
        </>
      )}

      {tcg.length > 0 && (
  <div className="my-10 border-t border-gray-300 text-center relative">
    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
      Trading Card Game
    </span>
  </div>
)}

      {/* TCG */}
      {tcg.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tcg.map(renderSet)}
          </div>
        </>
      )}

{promos.length > 0 && (
  <div className="my-10 border-t border-gray-300 text-center relative">
    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
      Promotional Cards
    </span>
  </div>
)}

      {/* PROMOS */}
      {promos.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map(renderSet)}
          </div>
        </>
      )}

    </div>
);
})()}

    {/* RARITIES */}
    {selectedUser && selectedSet && !selectedRarity && (
      <div>
        <button
          onClick={() => setSelectedSet(null)}
          className="text-xs mb-3 text-muted-foreground"
        >
          ← Back to Sets
        </button>

        <div className="flex flex-wrap gap-2">
          {Object.keys(userTrades[selectedSet] || {}).map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className="px-3 py-1 text-xs border rounded"
            >
             {rarityDisplayMap[rarity] || rarity}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* CARDS */}
    {selectedUser && selectedSet && selectedRarity && (
      <div>
        <button
          onClick={() => setSelectedRarity(null)}
          className="text-xs mb-3 text-muted-foreground"
        >
          ← Back to Rarities
        </button>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
  {(userTrades[selectedSet]?.[selectedRarity] || []).map((card, i) => (
    <img
      key={i}
      src={getCardImage(card)}
      className="w-full rounded-md"
    />
  ))}
</div>
      </div>
    )}

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
        p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">

          <div className="flex items-center gap-3">
            <img
              src={avatarMap[selectedUser.avatar_url] || avatar001}
              className="w-10 h-10 rounded-full object-cover border"
            />

            <h2 className="text-lg font-semibold">
              {selectedUser.username}'s Trades
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
            {Object.keys(userTrades).map((setId) => {
              const setInfo = sets.find(s => s.id === setId);

              return (
                <div
                  key={setId}
                  onClick={() => setSelectedSet(setId)}
                  className="border rounded-xl p-3 cursor-pointer bg-white shadow-sm hover:bg-gray-100 transition text-sm"
                >
                  {setInfo?.name || setId}
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
              {Object.keys(userTrades[selectedSet] || {}).map((rarity) => (
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

<div className="grid grid-cols-3 sm:grid-cols-5 gap-2 [grid-auto-flow:dense]">
  {(userTrades[selectedSet]?.[selectedRarity] || []).map((card, i) => {

    const isDoubleCard =
      selectedSet === "3" &&
      card.rarity === "SZR" &&
      card.number === 1;

    return (
      <div
        key={i}
        className={`relative ${
          isDoubleCard
            ? "col-span-2 aspect-[10/7]"
            : "aspect-[5/7]"
        }`}
      >
        <img
          src={getCardImage(card)}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
    );
  })}
</div>
          </div>
        )}

      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default TradingPost;
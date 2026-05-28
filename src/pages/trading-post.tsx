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

const tradePostCards = "/website-assets/tradepostcards.png";

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
  SN:  "⬦N",
  PER: "※ER",
  PSPR: "※SPR",
  PGR: "※GR",
  PCR: "※CR",
  PRR: "※RR",
  LC:  "PR",
};

const sets = [
  { id: "1", name: "Eternal Moon First Edition", released: true },
  { id: "5", name: "Rainbow First Edition", released: true },
  { id: "7", name: "Fun Moments First Edition", released: true },
  { id: "2", name: "Eternal Moon Second Edition", released: true },
  { id: "8", name: "Fun Moments Second Edition", released: true },
  { id: "3", name: "Eternal Moon Third Edition", released: true },
  { id: "11", name: "Fun Moments Third Edition", released: true },
  { id: "4", name: "Star First Edition", released: true },
  { id: "6", name: "Rainbow Second Edition", released: true },
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
  "3": { folder: "third-edition-moon", prefix: "M3" },
  "4": { folder: "star-one", prefix: "S1" },
  "5": { folder: "rainbow-one", prefix: "R1" },
  "6": { folder: "rainbow-two", prefix: "R2" },
  "7": { folder: "fun-moments-one", prefix: "FM1" },
  "8": { folder: "fun-moments-two", prefix: "FM2" },
  "11": { folder: "fun-moments-three", prefix: "FM3"},
};

  const c = config[set_id];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(3, "0")}${
  set_id === "6" &&
  ["ST", "TR", "TGR"].includes(rarity)
    ? ".png"
    : ".jpg"
}`;
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

  const [allProgress, setAllProgress] = useState<any[]>([]);
const [currentUserId, setCurrentUserId] = useState<string>("");
const [hiddenSets, setHiddenSets] = useState<string[]>([]);

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

  useEffect(() => {
  const loadCollectionProgress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setCurrentUserId(user.id);

    const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets")
  .eq("id", user.id)
  .single();

setHiddenSets(profile?.iso_hidden_sets || []);

    const { data, error } = await supabase
      .from("collection_progress")
      .select("user_id, set_id, progress")
      .eq("user_id", user.id);

    if (!error) {
      setAllProgress(data || []);
    }
  };

  loadCollectionProgress();
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
  number,
  actively_trading: card.actively_trading
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

const COUNTED_SET_IDS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "11",
  "friendshipsbegin",
  "FW",
  "9",
  "10",
  "tcgpromos",
];

const CARD_TOTALS: Record<string, number> = {
  "1": 186,
  "2": 189,
  "3": 290,
  "4": 105,
  "5": 146,
  "6": 170,
  "7": 127,
  "8": 136,
  "11": 148,
  "friendshipsbegin": 191,
  "FW": 191,
  "9": 6,
  "10": 1,
  "tcgpromos": 6,
};

// These sets are EXCLUDED from the set counters only.
const EXCLUDED_FROM_SET_COUNTS = ["9", "10", "tcgpromos"];

const normalizeSetId = (setId: string) => {
  if (setId === "SD") return "friendshipsbegin";
  return setId;
};

const releasedSets = sets.filter(
  (set) =>
    COUNTED_SET_IDS.includes(set.id) &&
    !hiddenSets.includes(set.id)
);

const visibleCountedSetIds = COUNTED_SET_IDS.filter(
  (setId) => !hiddenSets.includes(setId)
);

const countedSets = visibleCountedSetIds.filter(
  (setId) => !EXCLUDED_FROM_SET_COUNTS.includes(setId)
);

const totalSets = countedSets.length;

const totalCardsAvailable = visibleCountedSetIds.reduce(
  (sum, setId) => sum + CARD_TOTALS[setId],
  0
);

const totalCardsCollected = visibleCountedSetIds.reduce((sum, setId) => {
  const row = allProgress.find(
    (r: any) =>
      r.user_id === currentUserId &&
      normalizeSetId(r.set_id) === setId
  );

  if (!row?.progress) return sum;

  const ownedCount = Object.values(row.progress).filter(
    (value: any) =>
      value === true ||
      (typeof value === "object" && value?.owned === true)
  ).length;

  return sum + Math.min(ownedCount, CARD_TOTALS[setId]);
}, 0);

const completedSets = countedSets.filter((setId) => {
  const row = allProgress.find(
    (r: any) =>
      r.user_id === currentUserId &&
      normalizeSetId(r.set_id) === setId
  );

  if (!row?.progress) return false;

  const ownedCount = Object.values(row.progress).filter(
    (value: any) =>
      value === true ||
      (typeof value === "object" && value?.owned === true)
  ).length;

  return ownedCount >= CARD_TOTALS[setId];
}).length;

const missingCards = Math.max(0, totalCardsAvailable - totalCardsCollected);
const incompleteSets = Math.max(0, totalSets - completedSets);

const completionPercentage =
  totalCardsAvailable > 0
    ? Math.max(
        0,
        Math.round(
          ((totalCardsAvailable - totalCardsCollected) /
            totalCardsAvailable) *
            100
        )
      )
    : 0;

  return (
   <div
  className="min-h-screen relative overflow-hidden"
    style={{
  backgroundColor: "#F8F3FF",
  backgroundImage: `
    radial-gradient(circle at 15% 20%, rgba(244, 200, 74, 0.12) 0%, transparent 35%),
    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 25% 75%, rgba(168, 85, 247, 0.10) 0%, transparent 35%),
    radial-gradient(circle at 75% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
    linear-gradient(
      180deg,
      #FCF9FF 0%,
      #F8F1FF 35%,
      #F5EEFF 65%,
      #FAF6FF 100%
    )
  `,
}}
  >
    
      <KayouHeader />

      <div className="container max-w-6xl xl:max-w-[1600px] py-8 sm:py-8 pt-6 sm:pt-8 px-4 sm:px-6 xl:px-10">

{/* HERO HEADER */}
<div className="mb-10">
  <div
    className="relative overflow-hidden rounded-[2.5rem] border border-white/40 shadow-[0_12px_30px_rgba(91,33,182,0.12)]"
    style={{
      background: `
        radial-gradient(circle at 15% 20%, rgba(255,255,255,0.08) 0%, transparent 35%),
        radial-gradient(circle at 80% 25%, rgba(244,200,74,0.10) 0%, transparent 30%),
        radial-gradient(circle at 70% 80%, rgba(236,72,153,0.06) 0%, transparent 30%),
        linear-gradient(135deg, #7C4BB5 0%, #6D44A8 45%, #5B3695 100%)
      `,
      minHeight: "260px",
    }}
  >
    {/* Decorative sparkles */}
    <div className="absolute top-6 left-10 text-white/15 text-2xl">✦</div>
    <div className="absolute top-8 right-10 text-yellow-200/20 text-xl">✦</div>

{/* Card Artwork - fixed position in the CENTER column */}
<div
  className="hidden xl:block absolute z-20 pointer-events-none"
  style={{
    left: "50%",

    top: "-150px",

    transform: "translateX(-52%)",

    width: "600px",
  }}
>
  <img
    src={tradePostCards}
    alt="Trading Post Cards"
    className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
  />
</div>

    {/* Banner Content */}
<div className="grid lg:grid-cols-3 items-center gap-6 px-5 py-6 sm:px-8 lg:px-14 lg:py-6">

  {/* LEFT SIDE */}
  <div className="text-center lg:text-left">
    <h1
      className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[0.9]"
      style={{
        fontFamily: "Cinzel, serif",
        color: "#F8E7A3",
        textShadow: "0 3px 12px rgba(0,0,0,0.18)",
      }}
    >
      TRADING
      <br />
      POST
    </h1>

    <p className="mt-3 text-white/95 text-sm sm:text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
      All users who appear on the trading post must have their Discord
      username set on their profile so others can find you off-app.
    </p>
  </div>

  {/* CENTER COLUMN - reserved for artwork */}
  <div className="hidden lg:block" />

  {/* RIGHT SIDE */}
  <div className="relative z-30 mt-0 lg:mt-0 lg:pt-8 lg:pl-20 xl:pl-28">
    {/* Stats */}
    <div className="grid grid-cols-3 gap-2 text-center">
      <div>
        <div className="text-sm sm:text-base xl:text-lg font-bold leading-tight text-[#F8E7A3]">
          {missingCards.toLocaleString()}
        </div>
        <div className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/65 leading-tight">
          Cards Missing
        </div>
      </div>

      <div>
        <div className="text-sm sm:text-base xl:text-lg font-bold leading-tight text-[#F8E7A3]">
          {incompleteSets} / {totalSets}
        </div>
        <div className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/65 leading-tight">
          Sets Incomplete
        </div>
      </div>

      <div>
        <div className="text-sm sm:text-base xl:text-lg font-bold leading-tight text-[#F8E7A3]">
          {completionPercentage}%
        </div>
        <div className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/65 leading-tight">
          From Completion
        </div>
      </div>
    </div>

    {/* CTA Button */}
    <div className="mt-4 flex justify-center">
      <button
        onClick={() => navigate("/UserMenu")}
        className="w-full max-w-[320px] px-5 py-2 rounded-full font-semibold tracking-[0.14em] text-[11px] uppercase transition hover:scale-[1.02]"
        style={{
          background:
            "linear-gradient(90deg, #E5B93D 0%, #F8E7A3 50%, #D4AF37 100%)",
          color: "#5B3695",
          boxShadow: "0 8px 20px rgba(212, 175, 55, 0.25)",
        }}
      >
        View My Collection →
      </button>
    </div>
  </div>
</div>
  </div>
</div>

{/* FILTER BAR */}
<div className="-mt-6 mb-10 relative z-10">
  <div
    className="rounded-[1.75rem] border border-white/70 bg-white/85 backdrop-blur-md shadow-[0_10px_35px_rgba(91,33,182,0.08)] px-4 py-3"
  >
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

{/* Search Box */}
<div className="flex-1 relative">
  <button
    type="button"
    onClick={() => navigate("/forum")}
    className="
      w-full h-12 rounded-full
      border border-[#E7DDF7]
      bg-white
      flex items-center px-4
      text-left
      hover:border-[#D8C2F5]
      hover:bg-[#FCFAFF]
      transition
    "
  >
    <span className="text-[#8B5FBF] text-lg mr-3">⌕</span>

    <span className="text-sm text-gray-400">
      FIND USERS IN THE FORUM SEARCH.
    </span>
  </button>
</div>

      {/* Desktop Controls */}
      <div className="hidden lg:flex items-center gap-3">



{/* Create Trade Button */}
<button
  onClick={() => navigate("/inventory")}
  className="h-12 px-6 rounded-full font-semibold text-sm uppercase tracking-[0.15em] text-white flex items-center gap-3 shadow-[0_8px_20px_rgba(124,75,181,0.18)]"
  style={{
    background:
      "linear-gradient(135deg, #9B6AD8 0%, #7C4BB5 50%, #6D44A8 100%)",
  }}
>
  Create Trade
  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-base leading-none">
    +
  </span>
</button>
      </div>

      {/* Mobile Create Trade Button */}
<div className="lg:hidden">
  <button
    onClick={() => navigate("/inventory ")}
    className="
      w-full h-12 rounded-full
      font-semibold text-sm uppercase tracking-[0.15em]
      text-white
      flex items-center justify-center gap-3
      shadow-[0_8px_20px_rgba(124,75,181,0.18)]
      transition hover:scale-[1.02]
      relative overflow-hidden

      border border-[#D8B45A]

      before:content-['']
      before:absolute
      before:inset-[3px]
      before:rounded-full
      before:border
      before:border-[#F8E38C]
      before:shadow-[inset_0_0_0_1px_rgba(255,245,180,0.35)]
      before:pointer-events-none
    "
    style={{
      background:
        "linear-gradient(135deg, #9B6AD8 0%, #7C4BB5 50%, #6D44A8 100%)",
    }}
  >
    Create Trade
  </button>
</div>
    </div>
  </div>
</div>

        {/* SET GRID */}
        {(() => {
  const ccg = sets.filter(s =>
  s.released &&
  ["1", "2", "3", "4", "5", "6", "7", "8", "11"].includes(s.id)
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

const renderSet = (set: any) => {
  const setImages: Record<string, string> = {
    "4": "/thumbnails/s1-thumbnail.jpg",
    "1": "/thumbnails/moon-fe.jpg",
    "2": "/thumbnails/moon-se.jpg",
    "3": "/thumbnails/moon-te.jpg",
    "5": "/thumbnails/rainbow1thumbnail.jpg",
    "6": "/thumbnails/rainbow2thumbnail.jpg",
    "7": "/thumbnails/fme01TN.jpg",
    "8": "/thumbnails/fme02TN.jpg",
    "11": "/thumbnails/fme03TN.jpg",
    "FW": "/thumbnails/fantasy-wonderland-thumbnail.jpg",
    "friendshipsbegin": "/thumbnails/friendship-begins-thumbnail.jpg",
    "9": "/thumbnails/promos-thumbnail.jpg",
    "10": "/thumbnails/limited-promos-thumbnail.jpg",
    "tcgpromos": "/thumbnails/tcgpromosthumbnail.jpg",
  };
  

  const setImage = setImages[set.id];
  
const setDescriptions: Record<string, string> = {
  "1": "MLPME01",
  "2": "MLPME02 • INT03-HR",
  "3": "MLPME03",
  "4": "MLPSE01",
  "5": "RBE01 • INT01-R • INT01-SR • INT01-SSR",
  "6": "RBE02 • MLPME02-R • MLPME03-R • MLPEM03-SR • MLPME03-SSR",
  "7": "FME01 • INT01-R • INT02-R • INT02-UR",
  "8": "FME02 • INT02-R • INT03-R • INT03-UR",
  "11": "FME03",
  "FW": "BP01",
  "friendshipsbegin": "SD01",
  "9": "MLPE-PR",
  "10": "PR",
  "tcgpromos": "PR",
};

const setDescription = setDescriptions[set.id] || "Add codes here";

  return (
    <button
      key={set.id}
      onClick={() => navigate(`/trading-post/${set.id}`)}
      className="w-full text-left transition-all duration-300 group"
    >

<div
  className="
    sm:hidden
    flex items-center gap-4
    relative overflow-hidden
    rounded-[1.75rem]
    border border-[#E9DDF8]
    bg-white/90 backdrop-blur-sm
    px-5 py-4
    shadow-[0_8px_25px_rgba(91,33,182,0.06)]
    hover:shadow-[0_14px_35px_rgba(91,33,182,0.12)]
    hover:border-[#DCC8F7]
    transition-all duration-300
  "
>
  {/* Subtle magical glow */}
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        "radial-gradient(circle at top right, rgba(244,200,74,0.06), transparent 45%)",
    }}
  />

  {/* Circular Set Thumbnail */}
  <div
    className="
      relative z-10
      w-14 h-14
      rounded-full
      overflow-hidden
      border border-[#E9DDF8]
      bg-gradient-to-br from-[#FBF8FF] to-[#F3EBFF]
      shadow-inner
      flex-shrink-0
    "
  >
    {setImage ? (
      <img
        src={setImage}
        alt={set.name}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-[#8B5FBF] text-xl">
        ✦
      </div>
    )}
  </div>

  {/* Text Content */}
  <div className="relative z-10 flex-1 min-w-0">
    <div className="font-semibold text-[17px] text-[#2D1B4E] leading-tight">
      {set.name}
    </div>

    <div className="mt-1 text-xs text-gray-500 leading-relaxed">
      {setDescription}
    </div>

    <div className="mt-2 text-sm font-medium text-[#7C4BB5]">
      View trades →
    </div>
  </div>
</div>

      {/* DESKTOP REDESIGN WITH SET THUMBNAILS */}
      <div
        className="
          hidden sm:flex
          items-center gap-5
          relative overflow-hidden
          rounded-[1.75rem]
          border border-[#E9DDF8]
          bg-white/90 backdrop-blur-sm
          px-6 py-5
          shadow-[0_8px_25px_rgba(91,33,182,0.06)]
          hover:shadow-[0_14px_35px_rgba(91,33,182,0.12)]
          hover:border-[#DCC8F7]
          hover:-translate-y-1
        "
      >
        {/* Subtle magical glow */}
        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100
            transition-opacity duration-300 pointer-events-none
          "
          style={{
            background:
              "radial-gradient(circle at top right, rgba(244,200,74,0.08), transparent 45%)",
          }}
        />

        {/* Circular Set Thumbnail */}
        <div
          className="
            relative z-10
            w-14 h-14
            rounded-full
            overflow-hidden
            border border-[#E9DDF8]
            bg-gradient-to-br from-[#FBF8FF] to-[#F3EBFF]
            shadow-inner
            flex-shrink-0
          "
        >
          {setImage ? (
            <img
              src={setImage}
              alt={set.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8B5FBF] text-xl">
              ✦
            </div>
          )}
        </div>

{/* Text Content */}
<div className="relative z-10 flex-1 min-w-0">
  {/* Set Name */}
  <div className="font-semibold text-[17px] text-[#2D1B4E] leading-tight">
    {set.name}
  </div>

  <div className="mt-1 text-xs text-gray-500 leading-relaxed">
  {setDescription}
</div>

  {/* View Trades Link */}
  <div
    className="
      mt-2
      text-sm font-medium
      text-[#7C4BB5]
      group-hover:translate-x-1
      transition-transform duration-300
    "
  >
    View trades →
  </div>
</div>
      </div>
    </button>
  );
};

  return (
    <div className="space-y-12">

      {ccg.length > 0 && (
<div className="my-3 flex items-center justify-center">
  {/* Left decorative line */}
  <div
    className="flex-1 max-w-[220px] h-px"
    style={{
      background:
        "linear-gradient(to right, transparent 0%, #D9C7F5 45%, #E9DDBF 100%)",
    }}
  />

  {/* Center badge */}
  <div className="mx-6 relative">
    {/* Soft glow */}
    <div className="absolute inset-0 rounded-full blur-xl bg-[#F4C84A]/20 scale-150" />

    {/* Label pill */}
    <div
      className="
        relative
        px-6 py-2
        rounded-full
        border border-white/70
        bg-white/85 backdrop-blur-md
        shadow-[0_8px_25px_rgba(91,33,182,0.08)]
        flex items-center gap-2
      "
    >
      <span className="text-[#E5B93D] text-xs">✦</span>

      <span
        className="
          text-[11px]
          sm:text-xs
          font-semibold
          uppercase
          tracking-[0.22em]
          text-[#7C4BB5]
          whitespace-nowrap
        "
      >
        Collectible Card Game
      </span>

      <span className="text-[#E5B93D] text-xs">✦</span>
    </div>
  </div>

  {/* Right decorative line */}
  <div
    className="flex-1 max-w-[220px] h-px"
    style={{
      background:
        "linear-gradient(to left, transparent 0%, #D9C7F5 45%, #E9DDBF 100%)",
    }}
  />
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
<div className="my-3 flex items-center justify-center">
  {/* Left decorative line */}
  <div
    className="flex-1 max-w-[220px] h-px"
    style={{
      background:
        "linear-gradient(to right, transparent 0%, #D9C7F5 45%, #E9DDBF 100%)",
    }}
  />

  {/* Center badge */}
  <div className="mx-6 relative">
    {/* Soft glow */}
    <div className="absolute inset-0 rounded-full blur-xl bg-[#F4C84A]/20 scale-150" />

    {/* Label pill */}
    <div
      className="
        relative
        px-6 py-2
        rounded-full
        border border-white/70
        bg-white/85 backdrop-blur-md
        shadow-[0_8px_25px_rgba(91,33,182,0.08)]
        flex items-center gap-2
      "
    >
      <span className="text-[#E5B93D] text-xs">✦</span>

      <span
        className="
          text-[11px]
          sm:text-xs
          font-semibold
          uppercase
          tracking-[0.22em]
          text-[#7C4BB5]
          whitespace-nowrap
        "
      >
        Trading Card Game
      </span>

      <span className="text-[#E5B93D] text-xs">✦</span>
    </div>
  </div>

  {/* Right decorative line */}
  <div
    className="flex-1 max-w-[220px] h-px"
    style={{
      background:
        "linear-gradient(to left, transparent 0%, #D9C7F5 45%, #E9DDBF 100%)",
    }}
  />
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
<div className="my-3 flex items-center justify-center">
  {/* Left decorative line */}
  <div
    className="flex-1 max-w-[220px] h-px"
    style={{
      background:
        "linear-gradient(to right, transparent 0%, #D9C7F5 45%, #E9DDBF 100%)",
    }}
  />

  {/* Center badge */}
  <div className="mx-6 relative">
    {/* Soft glow */}
    <div className="absolute inset-0 rounded-full blur-xl bg-[#F4C84A]/20 scale-150" />

    {/* Label pill */}
    <div
      className="
        relative
        px-6 py-2
        rounded-full
        border border-white/70
        bg-white/85 backdrop-blur-md
        shadow-[0_8px_25px_rgba(91,33,182,0.08)]
        flex items-center gap-2
      "
    >
      <span className="text-[#E5B93D] text-xs">✦</span>

      <span
        className="
          text-[11px]
          sm:text-xs
          font-semibold
          uppercase
          tracking-[0.22em]
          text-[#7C4BB5]
          whitespace-nowrap
        "
      >
        Promotional Cards
      </span>

      <span className="text-[#E5B93D] text-xs">✦</span>
    </div>
  </div>

  {/* Right decorative line */}
  <div
    className="flex-1 max-w-[220px] h-px"
    style={{
      background:
        "linear-gradient(to left, transparent 0%, #D9C7F5 45%, #E9DDBF 100%)",
    }}
  />
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

{card.actively_trading && (
  <div className="absolute inset-0 rounded-md bg-purple-900/80 flex items-center justify-center">
    <span className="text-white text-[9px] sm:text-xs md:text-sm font-bold text-center px-1 leading-tight">
      ACTIVELY<br />TRADING
    </span>
  </div>
)}
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
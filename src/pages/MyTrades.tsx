import CollectionCard from "@/components/CollectionCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyTrades() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("set");

  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [ownedSets, setOwnedSets] = useState<string[]>([]);
const [tradeSets, setTradeSets] = useState<string[]>([]);

  useEffect(() => {
  const loadData = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }

    if (!user) {
      setHiddenSets([]);
      setTradeSets([]);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("iso_hidden_sets")
      .eq("id", user.id)
      .single();

    setHiddenSets(profile?.iso_hidden_sets || []);

const { data: progress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);

const owned =
  (progress || [])
    .filter((row) => {
      const cards = row.progress || {};
      return Object.values(cards).some(Boolean);
    })
    .map((row) => String(row.set_id).trim());

setOwnedSets([...new Set(owned)]);

const { data: trades } = await supabase
  .from("for_trade")
  .select("set_id")
  .eq("user_id", user.id);

const activeTrades = [
  ...new Set((trades || []).map((t) => String(t.set_id).trim()))
];

setTradeSets(activeTrades);
  };

  loadData();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    loadData(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

  const collections = [
    {
      id: "1",
      title: "Eternal Moon",
      setName: "One",
      imageUrl: "/thumbnails/moon-fe.webp",
      totalCards: 186,
      category: "eternal-moon",
    },
    {
      id: "5",
      title: "Rainbow",
      setName: "One",
      imageUrl: "/thumbnails/rainbow1thumbnail.webp",
      totalCards: 146,
      category: "rainbow",
    },
    {
      id: "7",
      title: "Fun Moments",
      setName: "One",
      imageUrl: "/thumbnails/fme01TN.webp",
      totalCards: 127,
      category: "fun-moments",
    },
    {
      id: "2",
      title: "Eternal Moon",
      setName: "Two",
      imageUrl: "/thumbnails/moon-se.webp",
      totalCards: 189,
      category: "eternal-moon",
    },
    {
      id: "3",
      title: "Eternal Moon",
      setName: "Three",
      imageUrl: "/thumbnails/moon-te.webp",
      totalCards: 290,
      category: "eternal-moon",
    },
    {
      id: "8",
      title: "Fun Moments",
      setName: "Two",
      imageUrl: "/thumbnails/fme02TN.webp",
      totalCards: 136,
      category: "fun-moments",
    },
    {
      id: "11",
      title: "Fun Moments",
      setName: "Three",
      imageUrl: "/thumbnails/fme03TN.webp",
      totalCards: 148,
      category: "fun-moments",
    },
      {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/s1-thumbnail.webp",
    totalCards: 105,
    category: "star",
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbow2thumbnail.webp",
    totalCards: 170,
    category: "rainbow",
  },
    {
  id: "FW",
  title: "Fantasy",
  setName: "Wonderland",
  imageUrl: "/thumbnails/fantasy-wonderland-thumbnail.webp",
  totalCards:  191,
  category: "fantasy-wonderland",
},
{
  id: "SD",
  title: "Friendships",
  setName: "Begin",
  imageUrl: "/thumbnails/friendship-begins-thumbnail.webp",
  totalCards: 194,
  category: "friendships-begin",
},
{
  id: "9",
  title: "Promotional",
  setName: "Cards",
  imageUrl: "/thumbnails/promos-thumbnail.webp",
  totalCards: 6,
  category: "promo-cards",
},
{
  id: "tcgpromos",
  title: "TCG",
  setName: "Promos",
  imageUrl: "/thumbnails/tcgpromosthumbnail.webp",
  totalCards: 6,
  category: "tcgpromos",
},
  ];

return (
  <>

<div
  className="min-h-screen"
  style={{
    backgroundColor: "#090909",
    backgroundImage: `
      radial-gradient(circle at top, rgba(212,175,55,.06) 0%, transparent 42%),
      radial-gradient(circle at 15% 30%, rgba(255,255,255,.025) 0%, transparent 26%),
      radial-gradient(circle at 85% 18%, rgba(255,255,255,.02) 0%, transparent 22%),
      linear-gradient(
        180deg,
        #090909 0%,
        #111111 38%,
        #151515 68%,
        #0b0b0b 100%
      )
    `,
  }}
>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-6">

        {/* PAGE HEADER */}
        <div className="text-center mb-6">
<h1
  className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none"
  style={{
    fontFamily: "Oxanium",
    background:
      "linear-gradient(180deg,#fff7c2 0%,#f8e38c 22%,#e7bf45 58%,#c88a0a 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 4px 18px rgba(0,0,0,.35)",
  }}
>
  My Inventory
</h1>
        </div>

        {/* INVENTORY PANEL */}
<div
  className="
    rounded-[2rem]
    border border-[#2d2d2d]
    bg-[#181818]
    shadow-[0_18px_50px_rgba(0,0,0,.55)]
    p-4 sm:p-6
  "
>

{/* FILTER TABS */}
<div
  className="
    flex flex-col lg:flex-row lg:items-center lg:justify-between
    gap-4
    mb-5
    pb-5
    border-b border-[#2d2d2d]
  "
>
  <div className="flex flex-wrap items-center gap-2">
    {[
      { id: "all", label: "All Cards" },
      { id: "moon", label: "Moon Edition" },
      { id: "star", label: "Star Edition" },
      { id: "fun", label: "Fun Moments Edition" },
      { id: "rainbow", label: "Rainbow Edition" },
      { id: "promos", label: "Promotional" },
      { id: "tcg", label: "TCG Sets" },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveFilter(tab.id)}
        className={`
          px-5 py-2.5
          rounded-full
          text-sm font-semibold
          border
          transition-all duration-200
          ${
            activeFilter === tab.id
              ? "border-[#d4af37] text-[#1b1b1b] shadow-lg"
              : "border-[#3a3a3a] bg-[#232323] text-[#f5e6a8] hover:bg-[#2d2d2d] hover:border-[#d4af37]"
          }
        `}
        style={
          activeFilter === tab.id
            ? {
                background:
                  "linear-gradient(180deg,#f8e38c 0%,#e7bf45 55%,#c88a0a 100%)",
              }
            : {}
        }
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
          {/* COLLECTIONS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
            {collections
  .filter((col) => {
// Hide any sets the user has chosen to hide
if (hiddenSets.includes(col.id)) return false;

// Only show sets that have cards in them
if (!ownedSets.includes(String(col.id).trim())) return false;
// Apply filter tabs
if (activeFilter === "moon") {
  return col.id === "1" || col.id === "2" || col.id === "3";
}

// Star Edition
if (activeFilter === "star") {
  return col.id === "4";
}

// Fun Moments Edition
if (activeFilter === "fun") {
  return col.id === "7" || col.id === "8" || col.id === "11";
}

// Rainbow Edition
if (activeFilter === "rainbow") {
  return col.id === "5" || col.id === "6";
}

// Promotional
// Promotional
if (activeFilter === "promos") {
  return (
    col.id === "9" ||              // Promotional Cards
    col.id === "tcgpromos"         // TCG Promos
  );
}

// TCG Sets
if (activeFilter === "tcg") {
  return (
    col.id === "SD" ||
    col.id === "FW"
  );
}

// All Cards
return true;
  })
  .map((col) => (
                <div
                  key={col.id}
onClick={() => {
  const slugMap: Record<string, string> = {
    "1": "moon-one",
    "2": "moon-two",
    "3": "moon-three",
    "4": "star-one",
    "5": "rainbow-one",
    "6": "rainbow-two",
    "7": "fun-moments-one",
    "8": "fun-moments-two",
    "11": "fun-moments-three",
    "9": "promotional-cards",
    "FW": "fantasy-wonderland",
    "SD": "friendships-begin",
    "tcgpromos": "tcg-promos",
  };

  navigate(`/inventory/${slugMap[col.id]}`);
}}
                  className="cursor-pointer w-full max-w-[150px] transition hover:scale-[1.02]"
                >
                  <CollectionCard {...col} showProgress={false} />
                </div>
              ))}
          </div>
        </div>

{/* MY TRADES */}
<div className="mt-10">
  <div className="flex items-center justify-center gap-5 mb-6">
    <div className="flex-1 max-w-[220px] h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

    <h2
      className="text-3xl sm:text-4xl font-black text-[#f5e6a8]"
      style={{
        fontFamily: "Oxanium",
        textShadow: "0 3px 14px rgba(0,0,0,.35)",
      }}
    >
      My Trades
    </h2>

    <div className="flex-1 max-w-[220px] h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
  </div>

<div
  className="
    rounded-[2rem]
    border border-[#2d2d2d]
    bg-[#181818]
    shadow-[0_18px_50px_rgba(0,0,0,.55)]
    p-4 sm:p-6
  "
>
            {tradeSets.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {collections
                    .filter((col) =>
                      tradeSets.includes(String(col.id).trim())
)
.map((col) => (
<button
  key={col.id}
  onClick={() => navigate(`/my-trades/view/${col.id}`)}
  className="
    flex items-center gap-4
    w-full
    rounded-2xl
    border border-[#333333]
    bg-[#202020]
    px-5 py-4
    text-left
    transition-all duration-200
    hover:border-[#d4af37]
    hover:bg-[#282828]
    hover:-translate-y-1
    hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
  "
>
  <img
    src={col.imageUrl}
    alt={col.title}
    className="
      w-11 h-11
      rounded-full
      object-cover
      border-2 border-[#d4af37]
      flex-shrink-0
    "
  />

<div className="flex-1 min-w-0">
  <div className="text-sm font-bold leading-tight text-[#f5e6a8]">
    {col.setName
      ? ["friendshipsbegin", "FW", "9"].includes(col.id)
        ? `${col.title} ${col.setName}`
        : `${col.title} (${col.setName})`
      : col.title}
  </div>

  <div className="mt-1 text-xs font-medium text-[#d4af37]">
    View trades →
  </div>
</div>
</button>
))}
                </div>
              </>
            ) : (
              <p className="text-center text-[#bfaee3] text-sm py-4">
                You haven’t marked any cards for trade yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
);
}
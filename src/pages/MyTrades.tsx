import KayouHeader from "@/components/KayouHeader";
import CollectionCard from "@/components/CollectionCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import inventoryBadge from "@/assets/avatars/inventorybadge.png";
import myTradesBadge from "@/assets/avatars/mytradesbadge.png";


export default function MyTrades() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("set");

  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
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

    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("user_id", user.id);

    const uniqueSets = [
      ...new Set((trades || []).map((t) => String(t.set_id).trim()))
    ];

    setTradeSets(uniqueSets);
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
      imageUrl: "/thumbnails/moon-fe.jpg",
      totalCards: 186,
      category: "eternal-moon",
    },
    {
      id: "5",
      title: "Rainbow",
      setName: "One",
      imageUrl: "/thumbnails/rainbow1thumbnail.jpg",
      totalCards: 146,
      category: "rainbow",
    },
    {
      id: "7",
      title: "Fun Moments",
      setName: "One",
      imageUrl: "/thumbnails/fme01TN.jpg",
      totalCards: 127,
      category: "fun-moments",
    },
    {
      id: "2",
      title: "Eternal Moon",
      setName: "Two",
      imageUrl: "/thumbnails/moon-se.jpg",
      totalCards: 189,
      category: "eternal-moon",
    },
    {
      id: "3",
      title: "Eternal Moon",
      setName: "Three",
      imageUrl: "/thumbnails/moon-te.jpg",
      totalCards: 290,
      category: "eternal-moon",
    },
    {
      id: "8",
      title: "Fun Moments",
      setName: "Two",
      imageUrl: "/thumbnails/fme02TN.jpg",
      totalCards: 136,
      category: "fun-moments",
    },
    {
      id: "11",
      title: "Fun Moments",
      setName: "Three",
      imageUrl: "/thumbnails/fme03TN.jpg",
      totalCards: 148,
      category: "fun-moments",
    },
      {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/s1-thumbnail.jpg",
    totalCards: 105,
    category: "star",
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbow2thumbnail.jpg",
    totalCards: 170,
    category: "rainbow",
  },
    {
  id: "FW",
  title: "Fantasy",
  setName: "Wonderland",
  imageUrl: "/thumbnails/fantasy-wonderland-thumbnail.jpg",
  totalCards:  191,
  category: "fantasy-wonderland",
},
{
  id: "friendshipsbegin",
  title: "Friendships",
  setName: "Begin",
  imageUrl: "/thumbnails/friendship-begins-thumbnail.jpg",
  totalCards: 194,
  category: "friendships-begin",
},
{
  id: "9",
  title: "Promotional",
  setName: "Cards",
  imageUrl: "/thumbnails/promos-thumbnail.jpg",
  totalCards: 6,
  category: "promo-cards",
},
{
  id: "tcgpromos",
  title: "TCG",
  setName: "Promos",
  imageUrl: "/thumbnails/tcgpromosthumbnail.jpg",
  totalCards: 6,
  category: "tcgpromos",
},
  ];

return (
  <>
    <KayouHeader />

    <div
      className="min-h-screen"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* PAGE HEADER */}
        <div className="text-center mb-6">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-none"
            style={{
              fontFamily: "Cinzel, serif",
              color: "#5B3695",
              textShadow:
                "0 2px 0 #E5B93D, 0 6px 18px rgba(91,54,149,0.12)",
            }}
          >
            My Inventory
          </h1>
        </div>

        {/* INVENTORY PANEL */}
        <div
          className="
            rounded-[2rem]
            border border-[#DDD3F2]
            bg-white/80
            backdrop-blur-md
            shadow-[0_10px_30px_rgba(91,54,149,0.05)]
            p-4 sm:p-6
          "
        >

          {/* FILTER / SORT BAR */}
<div
  className="
    flex flex-col lg:flex-row lg:items-center lg:justify-between
    gap-4
    mb-5
    pb-4
    border-b border-[#E6DAF7]
  "
>
  {/* Filter Tabs */}
{/* Filter Tabs */}
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
        px-4 py-2
        rounded-full
        text-sm font-semibold
        transition-all duration-200
        ${
          activeFilter === tab.id
            ? "text-white shadow-md"
            : "text-[#6D44A8] bg-white border border-[#E6DAF7] hover:bg-[#FAF7FF]"
        }
      `}
      style={
        activeFilter === tab.id
          ? {
              background:
                "linear-gradient(135deg, #8E5CD0 0%, #6D44A8 100%)",
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

// Apply filter tabs
if (activeFilter === "moon") {
  return col.id === "1" || col.id === "2";
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
if (activeFilter === "promos") {
  return (
    col.id === "9" ||              // Promotional Cards
    col.id === "tcgpromos" ||      // TCG Promos
    col.id === "limitedpromos"     // Limited Promos
  );
}

// TCG Sets
if (activeFilter === "tcg") {
  return (
    col.id === "friendshipsbegin" ||
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
  const fullName =
    ["friendshipsbegin", "FW", "9", "tcgpromos"].includes(col.id)
      ? `${col.title} ${col.setName}`
      : `${col.title}: ${col.setName}`;

  const slug = fullName
    .toLowerCase()
    .replace(/:/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  navigate(`/inventory/${slug}`, { replace: true });
}}
                  className="cursor-pointer w-full max-w-[150px] transition hover:scale-[1.02]"
                >
                  <CollectionCard {...col} showProgress={false} />
                </div>
              ))}
          </div>
        </div>

        {/* MY TRADES */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex-1 max-w-[200px] h-px bg-[#D9C7F5]" />
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{
                fontFamily: "Cinzel, serif",
                color: "#5B3695",
                textShadow:
                  "0 1px 0 #E5B93D, 0 4px 12px rgba(91,54,149,0.08)",
              }}
            >
              My Trades
            </h2>
            <div className="flex-1 max-w-[200px] h-px bg-[#D9C7F5]" />
          </div>

          <div
            className="
              rounded-[2rem]
              border border-[#DDD3F2]
              bg-white/80
              backdrop-blur-md
              shadow-[0_10px_30px_rgba(91,54,149,0.05)]
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
      px-4 py-3
      rounded-full
      text-left
      text-white
      shadow-[0_6px_18px_rgba(91,54,149,0.15)]
      flex items-center gap-3
    "
    style={{
      background:
        "linear-gradient(135deg, #8E5CD0 0%, #6D44A8 100%)",
    }}
  >
    {/* Circular Thumbnail */}
    <img
      src={col.imageUrl}
      alt={col.title}
      className="
        w-10 h-10
        rounded-full
        object-cover
        border-2 border-white/40
        flex-shrink-0
      "
    />

    {/* Text */}
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm leading-tight">
        {col.setName
          ? ["friendshipsbegin", "FW", "9"].includes(col.id)
            ? `${col.title} ${col.setName}`
            : `${col.title} (${col.setName})`
          : col.title}
      </div>

      <div className="text-xs text-white/80 mt-1">
        View trades →
      </div>
    </div>
  </button>
))}
                </div>
              </>
            ) : (
              <p className="text-center text-[#6B5B85] text-sm py-4">
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
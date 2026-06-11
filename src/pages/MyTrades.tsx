import CollectionCard from "@/components/CollectionCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  .select("set_id")
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
  id: "friendshipsbegin",
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
       backgroundColor: "#0b0613",
backgroundImage: `
  radial-gradient(circle at 20% 20%, rgba(120, 70, 180, 0.12) 0%, transparent 35%),
  radial-gradient(circle at 80% 15%, rgba(80, 40, 140, 0.12) 0%, transparent 30%),
  radial-gradient(circle at 25% 75%, rgba(100, 60, 160, 0.10) 0%, transparent 35%),
  linear-gradient(
    180deg,
    #09050f 0%,
    #12071d 35%,
    #1a0d2b 65%,
    #0d0717 100%
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
              color: "#d8c7ff",
              textShadow:
              "0 0 12px rgba(150,100,255,0.5)",
            }}
          >
            My Inventory
          </h1>
        </div>

        {/* INVENTORY PANEL */}
        <div
          className="
            rounded-[2rem]
            border border-[#3b2457]
bg-[#140a22]/90
shadow-[0_10px_40px_rgba(0,0,0,0.45)]
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
    border-b border-[#35204d]
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
            : "text-[#d8c7ff] bg-[#1a1028] border border-[#3b2457] hover:bg-[#241437]"
        }
      `}
      style={
        activeFilter === tab.id
          ? {
              background:
  "linear-gradient(135deg, #5f2d91 0%, #3c1b61 100%)",
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
            <div className="flex-1 max-w-[200px] h-px bg-[#3b2457]" />
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{
                fontFamily: "Cinzel, serif",
                color: "#d8c7ff",
textShadow:
  "0 0 10px rgba(150,100,255,0.45)",
              }}
            >
              My Trades
            </h2>
            <div className="flex-1 max-w-[200px] h-px bg-[#3b2457]" />
          </div>

          <div
            className="
              rounded-[2rem]
              border border-[#3b2457]
bg-[#140a22]/90
shadow-[0_10px_40px_rgba(0,0,0,0.45)]
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
  "linear-gradient(135deg, #5f2d91 0%, #3c1b61 100%)",
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
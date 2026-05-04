import KayouHeader from "@/components/KayouHeader";
import CollectionCard from "@/components/CollectionCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import inventoryBadge from "@/assets/avatars/inventorybadge.png";
import myTradesBadge from "@/assets/avatars/mytradesbadge.png";


export default function MyTrades() {
  const navigate = useNavigate();

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

    // Load hidden sets
    const { data: profile } = await supabase
      .from("profiles")
      .select("iso_hidden_sets")
      .eq("id", user.id)
      .single();

    setHiddenSets(profile?.iso_hidden_sets || []);

    // Load trades
    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("user_id", user.id);

    const uniqueSets = [
      ...new Set((trades || []).map((t) => String(t.set_id).trim()))
    ];

    setTradeSets(uniqueSets);
  };

  // initial load
  loadData();

  // 🔥 THIS IS THE FIX (same as your other pages)
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
      id: "8",
      title: "Fun Moments",
      setName: "Two",
      imageUrl: "/thumbnails/fme02TN.jpg",
      totalCards: 136,
      category: "fun-moments",
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
  totalCards: 5,
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
  className="min-h-screen p-4 sm:p-6"
  style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
>
        <div className="max-w-4xl mx-auto text-center">

          <div className="mb-6">

  <img
    src={inventoryBadge}
    alt="My Inventory"
    className="mx-auto h-14 sm:h-16 md:h-20 object-contain mb-2"
  />

  <p className="text-[#5c4022] text-sm sm:text-base mt-2 max-w-xl mx-auto">
    All cards you own will appear here. You can mark them for trade and update your personal inventory of duplicates. Duplicates will not be public information.
  </p>

</div>


          {/* COLLECTIONS */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] justify-items-center gap-4 mt-6">
            {collections
              .filter((col) => !hiddenSets.includes(col.id))
              .map((col) => (
                <div
                  key={col.id}
                  onClick={() => navigate(`/my-trades/${col.id}`, { replace: true })}
                  className="cursor-pointer"
                >
                  <CollectionCard {...col} showProgress={false} />
                </div>
              ))}
          </div>

          {/* DIVIDER */}
          <div className="my-10 border-t border-gray-300" />

          {/* TRADE SETS */}
          <img
  src={myTradesBadge}
  alt="My Trades"
  className="mx-auto h-10 sm:h-14 md:h-16 object-contain"
/>

          {tradeSets.length > 0 ? (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
    {collections
      .filter((col) =>
        tradeSets.includes(String(col.id).trim())
      )
      .map((col) => (
        <button
          key={col.id}
          onClick={() => navigate(`/my-trades/view/${col.id}`)}
          className="px-4 py-2 bg-[#5a3e84] text-[#f5e6a8] border border-[#d4af37] rounded-lg hover:brightness-110 transition shadow"
        >
          {col.setName
  ? (["friendshipsbegin", "FW", "9"].includes(col.id)
      ? `${col.title} ${col.setName}`
      : `${col.title} (${col.setName})`)
  : col.title}
        </button>
      ))}
  </div>
) : (
  <p className="text-gray-500 mt-4">
    You haven’t marked any cards for trade yet.
  </p>
)}

        </div>
      </div>
    </>
  );
}
import KayouHeader from "@/components/KayouHeader";
import CollectionCard from "@/components/CollectionCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

    // 🔴 handle logged-out state properly
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
      setName: "First Edition",
      imageUrl: "/thumbnails/moon-fe.jpg",
      totalCards: 186,
      category: "eternal-moon",
    },
    {
      id: "2",
      title: "Eternal Moon",
      setName: "Second Edition",
      imageUrl: "/thumbnails/moon-se.jpg",
      totalCards: 189,
      category: "eternal-moon",
    },
    {
      id: "5",
      title: "Rainbow",
      setName: "First Edition",
      imageUrl: "/thumbnails/rainbow1thumbnail.jpg",
      totalCards: 146,
      category: "rainbow",
    },
    {
      id: "7",
      title: "Fun Moments",
      setName: "First Edition",
      imageUrl: "/thumbnails/fme01TN.jpg",
      totalCards: 127,
      category: "fun-moments",
    },
  ];

  return (
    <>
      <KayouHeader />

      <div className="min-h-screen bg-neutral-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            My Trades
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mb-6">
            Any cards you have flipped and marked as "owned" will appear here. You may now click on a set to view and mark cards for trade.
          </p>

          {/* COLLECTIONS */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
            {collections
              .filter((col) => !hiddenSets.includes(col.id))
              .map((col) => (
                <div
                  key={col.id}
                  onClick={() => navigate(`/my-trades/${col.id}`, { replace: true })}
                  className="cursor-pointer"
                >
                  <CollectionCard {...col} />
                </div>
              ))}
          </div>

          {/* DIVIDER */}
          <div className="my-10 border-t border-gray-300" />

          {/* TRADE SETS */}
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Here are all of the cards you have marked for trade.
          </h2>

          {tradeSets.length > 0 ? (
  <div className="flex flex-wrap justify-center gap-4">
    {collections
      .filter((col) =>
        tradeSets.includes(String(col.id).trim())
      )
      .map((col) => (
        <button
          key={col.id}
          onClick={() => navigate(`/my-trades/view/${col.id}`)}
          className="px-4 py-2 bg-pink-200 text-pink-800 rounded-lg hover:bg-pink-300 transition"
        >
          {col.title} ({col.setName})
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
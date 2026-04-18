import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  }
];

export default function MyTradesSets() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [tradeCards, setTradeCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
  const load = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }

    // 🔴 handle logged-out case
    if (!user) {
      setProgressMap({});
      setTradeCards({});
      return;
    }

    // 🔹 LOAD PROGRESS
    const { data: progress } = await supabase
      .from("collection_progress")
      .select("*")
      .eq("user_id", user.id);

    const map: Record<string, any> = {};
    progress?.forEach((row: any) => {
      map[row.set_id] = row.progress || {};
    });

    setProgressMap(map);

    // 🔹 LOAD TRADE
    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("set_id", setId)
      .eq("user_id", user.id);

    const tradeMap: Record<string, boolean> = {};
    trades?.forEach((card: any) => {
      tradeMap[card.card_key] = true;
    });

    setTradeCards(tradeMap);
  };

  // initial load
  load();

  // 🔥 THE FIX
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    load(session?.user);
  });

  return () => subscription.unsubscribe();
}, [setId]);

  const toggleTrade = async (cardKey: string) => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const isTrade = tradeCards[cardKey];

    if (isTrade) {
      await supabase
        .from("for_trade")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", setId)
        .eq("card_key", cardKey);

      setTradeCards((prev) => {
        const updated = { ...prev };
        delete updated[cardKey];
        return updated;
      });
    } else {
      await supabase.from("for_trade").insert({
        user_id: user.id,
        set_id: setId,
        card_key: cardKey
      });

      setTradeCards((prev) => ({
        ...prev,
        [cardKey]: true
      }));
    }
  };

  const set = sets.find(s => s.id === setId);

if (!set) {
  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />
      <div className="container py-8 text-center text-gray-500">
        Invalid set
      </div>
    </div>
  );
}

  const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1
    }))
  );

  const progress = progressMap[set.id] || {};

  const ownedCards = cards.filter(card => {
    const key = `${card.rarity}-${card.number}`;
    return progress[key];
  });

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/my-trades")}
          className="text-sm text-gray-500 hover:text-black mb-4"
        >
          ← Back to My Trades
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{set.name}</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Any cards you do not have collected will not appear here, and will not be available to be marked for trade.
          </p>
        </div>

        {ownedCards.length === 0 ? (
          <div className="text-center text-gray-500">
            You don’t own any cards in this set.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {ownedCards.map((card) => {
              const key = `${card.rarity}-${card.number}`;
              const isTrade = tradeCards[key];

              return (
                <div
                  key={key}
                  onClick={() => toggleTrade(key)}
                  className={`relative rounded-xl p-[2px] cursor-pointer ${
                    isTrade
                      ? "border-2 border-green-500"
                      : "border border-gray-300"
                  }`}
                >
                  <img
                    src={`/cards/${set.folder}/${set.prefix}${card.rarity}${String(card.number).padStart(3,"0")}.jpg`}
                    className="rounded-lg w-full"
                  />

                  {isTrade && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
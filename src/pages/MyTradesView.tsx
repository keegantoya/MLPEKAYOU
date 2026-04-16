import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KayouHeader from "@/components/KayouHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MyTradesSets from "@/pages/MyTradesSets";

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
};

export default function MyTradesView() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState<TradeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!setId) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      // ✅ ONLY pull cards already marked for trade
      const { data: trades } = await supabase
        .from("for_trade")
        .select("*")
        .eq("user_id", user.id)
        .eq("set_id", setId);

      setCards(trades || []);
      setLoading(false);
    };

    load();
  }, [setId]);

  const getCardImage = (card: TradeCard) => {
    const [rarity, number] = card.card_key.split("-");

    const config: any = {
      "1": { folder: "first-edition-moon", prefix: "M1" },
      "2": { folder: "second-edition-moon", prefix: "M2" },
      "5": { folder: "rainbow-one", prefix: "R1" },
      "7": { folder: "fun-moments-one", prefix: "FM1" },
    };

    const c = config[card.set_id];
    if (!c) return "";

    return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`;
  };

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/my-trades")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Trades
        </button>

        <h1 className="text-2xl font-bold text-center mb-6">
          Your Cards Marked for Trade
        </h1>

        {loading && <div className="text-center">Loading...</div>}

        {!loading && cards.length === 0 && (
          <div className="text-center text-muted-foreground">
            You have no cards marked for trade in this set.
          </div>
        )}

        {!loading && cards.length > 0 && (
  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
    {cards
      .sort((a, b) => {
        const [rarityA, numA] = a.card_key.split("-");
        const [rarityB, numB] = b.card_key.split("-");

        // sort by rarity first
        if (rarityA !== rarityB) {
          return rarityA.localeCompare(rarityB);
        }

        // then by number
        return parseInt(numA) - parseInt(numB);
      })
      .map((card) => (
        <img
          key={card.id}
          src={getCardImage(card)}
          className="w-full rounded-md"
        />
      ))}
  </div>
)}

      </div>
    </div>
  );
}
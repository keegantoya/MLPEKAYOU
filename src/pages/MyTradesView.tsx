import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KayouHeader from "@/components/KayouHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MyTradesSets from "@/pages/MyTradesSets";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

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

  const { data: trades } = await supabase
  .from("for_trade")
  .select("*")
  .eq("user_id", user.id);

      const filtered = (trades || []).filter((card) => {
  // Friendships Begin (bonus + starters all live under same set_id)
  if (setId === "SD_BONUS" || setId === "SD_STARTERS") {
    return card.set_id === "friendshipsbegin";
  }

  return String(card.set_id) === String(setId);
});

setCards(filtered);
      setLoading(false);
    };

    load();
  }, [setId]);

const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

  const getCardImage = (card: TradeCard) => {

 if (card.set_id === "friendshipsbegin") {
  return `/friendships-begin/${card.card_key}.png`;
}

if (card.set_id === "FW") {

  const num = card.card_key.slice(-2);

  if (card.card_key.startsWith("BP01ER")) {
    return `/fantasy-wonderland/SD01ER${num}.png`;
  }

  if (card.card_key.startsWith("BP01PER")) {
    return `/fantasy-wonderland/SD01PER${num}.png`;
  }

  return `/fantasy-wonderland/${card.card_key}.png`;
}

  if (card.set_id === "9") {
    const number = card.card_key.split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (card.set_id === "tcgpromos") {
  return `/tcgpromos/${card.card_key}.png`;
}

  const [rarityRaw, number] = card.card_key.split("-");
  const rarity = getRarityCode(rarityRaw);

  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
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
        if (rarityA !== rarityB) {
          return rarityA.localeCompare(rarityB);
        }
        return parseInt(numA) - parseInt(numB);
      })
      .map((card) => (
  <div key={card.id} className="relative">
    
    <img
      src={getCardImage(card)}
      className="w-full rounded-md"
    />

 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
  {[...Array(5)].map((_, i) => (
    <img
      key={i}
      src={watermark}
      className="absolute opacity-10 rotate-[-25deg] w-[140%] left-1/2 -translate-x-1/2"
      style={{ top: `${i * 25 - 20}%` }}
    />
  ))}
</div>
</div>
  </div>
))}
  </div>
)}

      </div>
    </div>
  );
}
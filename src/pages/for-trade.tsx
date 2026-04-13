import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForTrade() {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const loadTrades = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      const { data: trades } = await supabase
        .from("for_trade")
        .select("*")
        .eq("user_id", user.id);

      if (trades) {
        setCards(trades);
      }
    };

    loadTrades();
  }, []);

  const removeFromTrade = async (card: any) => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    await supabase
      .from("for_trade")
      .delete()
      .eq("user_id", user.id)
      .eq("set_id", card.set_id)
      .eq("card_key", card.card_key);

    setCards((prev) =>
      prev.filter((c) => c.id !== card.id)
    );
  };

  const getCardImage = (setId: string, cardKey: string) => {
    const [rarity, number] = cardKey.split("-");

    // Moon 1
    if (setId === "1") {
      return `/cards/first-edition-moon/M1${rarity}${String(number).padStart(3, "0")}.jpg`;
    }

    // Moon 2
    if (setId === "2") {
      return `/cards/second-edition-moon/M2${rarity}${String(number).padStart(3, "0")}.jpg`;
    }

    // Rainbow 1
    if (setId === "5") {
      return `/cards/rainbow-one/R1${rarity}${String(number).padStart(3, "0")}.jpg`;
    }

    // Fun Moments 1
    if (setId === "7") {
      return `/cards/fun-moments-one/FM1${rarity}${String(number).padStart(3, "0")}.jpg`;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="max-w-7xl mx-auto p-4">

        {/* TITLE + DESCRIPTION (UNCHANGED AS REQUESTED) */}
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">
            My Trading List
          </h1>

          <p className="text-muted-foreground text-sm mt-1 max-w-md">
            These are cards you marked as available for trade, which will appear on your public profile. 
            Once a trade has been completed, press the check mark to remove the card from this list.
            Removing the card from "My Trading List" does not mark a card as missing from your set and 
            does not affect progress bars toward set completion.
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-card">
            <div className="text-lg font-semibold mb-2">
              No cards listed for trade
            </div>

            <div className="text-muted-foreground text-sm">
              Add cards from your collection to start trading.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cards.map((card) => {
              const image = getCardImage(card.set_id, card.card_key);

              if (!image) return null;

              return (
                <div
                  key={card.id}
                  className="relative aspect-[5/7] rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    className="w-full h-full object-cover"
                  />

                  {/* Remove From Trade Button */}
                  <button
                    onClick={() => removeFromTrade(card)}
                    className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md hover:bg-green-600"
                  >
                    ✓
                  </button>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
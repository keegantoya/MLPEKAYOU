import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const LimitedCards = () => {

  const setId = "10";

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [forTrade, setForTrade] = useState<Record<string, boolean>>({});

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTrade = async (key: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    const isTrading = forTrade[key];

    if (isTrading) {
      await supabase
        .from("for_trade")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", setId)
        .eq("card_key", key);
    } else {
      await supabase
        .from("for_trade")
        .insert({
          user_id: user.id,
          set_id: setId,
          card_key: key
        });
    }

    setForTrade((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // LOAD PROGRESS
  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user) {
        const { data: saved } = await supabase
          .from("collection_progress")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", setId)
          .single();

        if (saved?.progress) {
          setFlipped(saved.progress);
        }
      }

      setLoaded(true);
    };

    loadProgress();
  }, []);

  // LOAD TRADE
  useEffect(() => {
    const loadTrade = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      const { data: trades } = await supabase
        .from("for_trade")
        .select("card_key")
        .eq("user_id", user.id)
        .eq("set_id", setId);

      if (trades) {
        const tradeMap: Record<string, boolean> = {};

        trades.forEach((card) => {
          tradeMap[card.card_key] = true;
        });

        setForTrade(tradeMap);
      }
    };

    loadTrade();
  }, []);

  // SAVE PROGRESS
  useEffect(() => {
    if (!loaded) return;

    const saveProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      await supabase
        .from("collection_progress_raw")
        .upsert(
          {
            user_id: user.id,
            set_id: setId,
            progress: flipped
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

  const cards = [
    {
      key: "LC-1",
      image: "/serialized-limited-cards/andypricepromo.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <div className="relative flex items-center mb-4">

  <button
    onClick={() => window.history.back()}
    className="text-sm text-muted-foreground hover:text-foreground"
  >
    ← Back
  </button>

  <h1 className="text-lg font-semibold w-full text-right md:text-center">
    Serialized & Limited Cards
  </h1>

</div>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">

          {cards.map((card) => {

            const isFlipped = flipped[card.key];

            return (
              <div
                key={card.key}
                className="aspect-[5/7] cursor-pointer perspective relative"
                onClick={() => toggleFlip(card.key)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >

                  <img
                    src={card.image}
                    className="absolute w-full h-full object-cover rounded-lg backface-hidden"
                  />

                  <img
                    src="/card-backs/M1R-SR-SGR-SCBACK.jpeg"
                    className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
                  />
                

                </div>
              </div>
            );

          })}

        </div>

        )}

      </div>
    </div>
  );
};

export default LimitedCards;
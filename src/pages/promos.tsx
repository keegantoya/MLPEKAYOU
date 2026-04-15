import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Promos = () => {

  const setId = "9";

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
      [key]: !isTrading
    }));
  };

  // LOAD PROGRESS
  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user) {
        const { data: saved } = await supabase
          .from("collection_progress_raw")
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

  const cards = Array.from({ length: 5 }, (_, i) => ({
    number: i + 1
  }));

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="relative flex items-center mb-4">

          <button
            onClick={() => window.history.back()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>

          <h1 className="text-lg font-semibold w-full text-right md:text-center">
            Promo Cards
          </h1>

        </div>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">

            {cards.map((card) => {

              const key = `PR-${card.number}`;
              const isFlipped = flipped[key];

              return (
                <div
                  key={key}
                  className="aspect-[5/7] cursor-pointer perspective relative"
                  onClick={() => toggleFlip(key)}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >

                    <img
                      src={`/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`}
                      className="absolute w-full h-full object-cover rounded-lg backface-hidden"
                    />

                    <img
                      src="/card-backs/M1R-SR-SGR-SCBACK.jpeg"
                      className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
                    />

                    {/* TRADE BUTTON (ONLY WHEN FLIPPED) */}
                    {isFlipped && (
                      <button
                        onClick={(e) => toggleTrade(key, e)}
                        className={`absolute top-1 right-1 z-10 rounded-full p-1 shadow-md ${
                          forTrade[key]
                            ? "bg-yellow-400 text-black"
                            : "bg-black/60 text-white"
                        }`}
                      >
                        ⇄
                      </button>
                    )}

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

export default Promos;
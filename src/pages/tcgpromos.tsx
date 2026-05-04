import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

const TCGPromos = () => {

  const setId = "tcgpromos";

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

  useEffect(() => {
    const loadAll = async (userOverride?: any) => {
      let user = userOverride;

      if (!user) {
        const { data } = await supabase.auth.getSession();
        user = data.session?.user;
      }

      if (user) {
        const { data: saved } = await supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", setId)
          .maybeSingle();

        if (saved?.progress) {
          setFlipped(saved.progress);
        } else {
          setFlipped({});
        }

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
        } else {
          setForTrade({});
        }

      } else {
        setFlipped({});
        setForTrade({});
      }

      setLoaded(true);
    };

    loadAll();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadAll(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const cards = Array.from({ length: 6 }, (_, i) => ({
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
            TCG Promo Cards
          </h1>

        </div>

        <p className="text-center text-sm md:text-base text-gray-500 max-w-sm md:max-w-2xl mx-auto mt-2 px-3">
  At the moment, these promotional cards are available only at in-person Kayou events. The promotional pack states that they belong to Friendships Begin.
</p>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">

            {cards.map((card) => {

              const key = `RR${String(card.number).padStart(2, "0")}`;
              const isFlipped = flipped[key];

              return (
                <div key={key} className="flex flex-col items-center">

                  <div
                    className="aspect-[5/7] cursor-pointer perspective relative w-full"
                    onClick={() => toggleFlip(key)}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >

                      <img
                        src={`/tcgpromos/${key}.png`}
                        className="absolute w-full h-full object-cover rounded-lg backface-hidden"
                      />

                      {/* BACK */}
<img
  src="/card-backs/tcgdefaultback.png"
  className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
/>

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

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default TCGPromos;
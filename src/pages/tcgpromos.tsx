import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
<div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-0 mb-8 mt-6 sm:mt-0">

  {/* Back Button */}
  <button
    onClick={() => window.history.back()}
    className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
  >
    <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
      ← Back
    </span>
  </button>

  {/* Center Content */}
  <div className="flex-1 text-center">

    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5a3e84] leading-tight">
      TCG Promo Cards
    </h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 my-5">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        Event Exclusives
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
These cards come from Kayou US in-person events, and are connected to the Friendships Begin TCG set.
    </p>

  </div>

  <div className="hidden sm:block w-[72px]" />
</div>

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

                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}

<div className="mt-10 max-w-3xl mx-4 sm:mx-auto rounded-2xl border border-[#d4af37]/50 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md shadow-lg p-4 sm:p-5">

  <h3 className="text-base md:text-lg font-semibold text-[#5a3e84] mb-3 tracking-wide text-center">
    Boxes Without Promotional Cards
  </h3>

  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">

    <li className="flex items-start gap-2">
      <span className="text-[#d4af37] mt-[2px]">✦</span>
      Friendships Begin Character Boxe Sets
    </li>

    <li className="flex items-start gap-2">
      <span className="text-[#d4af37] mt-[2px]">✦</span>
      Fantasy Wonderland Boxe Sets
    </li>
  </ul>

</div>

      </div>
    </div>
  );
};

export default TCGPromos;
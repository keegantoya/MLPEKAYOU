import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const LimitedCards = () => {

  const setId = "10";

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [forTrade, setForTrade] = useState<Record<string, boolean>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);

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
        .eq("set_id", Number(setId))
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

useEffect(() => {
  const loadAll = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }

    if (user) {
      // LOAD PROGRESS
      const { data: saved } = await supabase
        .from("collection_progress_raw")
        .select("progress")
        .eq("user_id", user.id)
        .eq("set_id", Number(setId))
        .single();

      if (saved?.progress) {
        setFlipped(saved.progress);
      } else {
        setFlipped({});
      }

      // LOAD TRADE
      const { data: trades } = await supabase
        .from("for_trade")
        .select("card_key")
        .eq("user_id", user.id)
        .eq("set_id", Number(setId))

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
        .eq("set_id", Number(setId));

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

  useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setShowLoginModal(true);
    }
  };

  

  checkAuth();
}, []);

  const cards = [
    {
      key: "LC-1",
      image: "/serialized-limited-cards/andypricepromo.webp"
    }
  ];

  if (showLoginModal) {
  return (
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-[#d4af37]/30">

        <h2 className="text-3xl font-bold text-[#5a3e84] mb-3">
          Login Required
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          You must be logged in to access card sets and track your collection progress.
        </p>

        <button
          onClick={() => window.location.href = "/collections"}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] font-semibold border border-[#d4af37]/60 hover:brightness-110 transition"
        >
          Return to Collections
        </button>

      </div>
    </div>
  );
}

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
      Serialized Cards
    </h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 my-5">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        LIMITED
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      Serialized cards, convention exclusives, artist promos, and other
      extremely limited English Kayou releases.
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

            const isFlipped = flipped[card.key];

            return (
              <div className="flex flex-col items-center">

  <div
    key={card.key}
    className="aspect-[5/7] cursor-pointer perspective relative w-full"
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
        src="/card-backs/M1R-SR-SGR-SCBACK.webp"
        className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
      />

    </div>
  </div>

  <div className="text-[10px] text-gray-500 text-center mt-1 px-1">
    Andy Price signed PR card 1/20
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
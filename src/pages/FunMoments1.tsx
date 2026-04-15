import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const FunMoments1 = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
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
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", "7")
          .single();

        if (saved?.progress) {
          setFlipped(saved.progress);
        }
      }

      setLoaded(true);
    };

    loadProgress();
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
            set_id: "7",
            progress: flipped
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

  const set = {
    name: "Fun Moments: First Volume",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12
    }
  };

  const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1
    }))
  );

  const getCardBack = (rarity: string, number: number) => {
    if (rarity === "N" || rarity === "SN") {
      return `/fun-moments-one-backs/FM1BACKN${String(number).padStart(3, "0")}.jpg`;
    }

    if (rarity === "R") {
      return `/fun-moments-one-backs/FM1RB${String(number).padStart(3, "0")}.jpg`;
    }

    if (rarity === "SR") {
      return `/fun-moments-one-backs/FM1SRB${String(number).padStart(3, "0")}.jpg`;
    }

    if (rarity === "UR") {
      return "/card-backs/M1URBACK.jpeg";
    }

    if (rarity === "CR") {
      if (number <= 9) {
        return "/fun-moments-one-backs/FM1CRBACK001.jpg";
      }
      return "/fun-moments-one-backs/FM1CRBACK002.jpg";
    }

    return "/card-backs/M1R-SR-SGR-SCBACK.jpeg";
  };

  return (
    <div className="min-h-screen bg-white">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="mb-6">

  {/* Back Button */}
  <div className="mb-3">
    <button
      onClick={() => window.history.back()}
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      ← Back
    </button>
  </div>

  {/* Title + Description */}
  <div className="text-center px-2">
    <h1 className="text-lg font-semibold">
      {set.name}
    </h1>
    <p className="text-xs text-gray-400 mt-1">
      The trading function has moved! Open your menu and find "My Trades."
    </p>
  </div>

</div>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {cards.map((card) => {
              const key = `${card.rarity}-${card.number}`;
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
                      src={`/cards/${set.folder}/${set.prefix}${card.rarity}${String(card.number).padStart(3, "0")}.jpg`}
                      className="absolute w-full h-full object-cover rounded-lg backface-hidden"
                    />

                    <img
                      src={getCardBack(card.rarity, card.number)}
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

export default FunMoments1;
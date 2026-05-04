import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

const FunMoments2 = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

   const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

 const set = {
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2", 
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12
    }
  };

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // LOAD PROGRESS
  useEffect(() => {
    const loadProgress = async (userOverride?: any) => {
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
  .eq("set_id", "8")
  .single();

        if (saved?.progress) {
          setFlipped(saved.progress);
        } else {
          setFlipped({});
        }
      } else {
        setFlipped({});
      }

      setLoaded(true);
    };

    loadProgress();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProgress(session?.user);
    });

    return () => subscription.unsubscribe();
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
            set_id: "8", // ✅ CHANGED
            progress: flipped
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

// PREVENT SPAM
const [celebrated, setCelebrated] = useState(false);

const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1
    }))
  );

// TRIGGER CONFETTI
useEffect(() => {
  if (!loaded || celebrated) return;

  const total = cards.length;
  const owned = Object.values(flipped).filter(Boolean).length;

  if (total > 0 && owned === total) {
    fireConfetti();
    setCelebrated(true);
  }
}, [flipped, loaded, celebrated, cards.length]);

 const getCardBack = (rarity: string, number: number) => {
  // CR backs
  if (rarity === "CR") {
    if (number <= 9) {
      return "/fun-moments-one-backs/FM1CRBACK001.jpg";
    }
    return "/fun-moments-one-backs/FM1CRBACK002.jpg";
  }
  // UGR backs
  if (rarity === "UGR") {
    return "/fun-moments-two-backs/FM2UGRBACKS.jpg";
  }
// N + SN backs (shared)
if (rarity === "N" || rarity === "SN") {
  return `/fun-moments-two-backs/FM2NBACK${String(number).padStart(3, "0")}.jpg`;
}
// R backs
if (rarity === "R") {
  return `/fun-moments-two-backs/FM2RBACK${String(number).padStart(3, "0")}.jpg`;
}
// SR backs
if (rarity === "SR") {
  return `/fun-moments-two-backs/FM2SRBACK${String(number).padStart(3, "0")}.jpg`;
}
  // UR backs
if (rarity === "UR") {
  return "/card-backs/M1URBACK.jpeg";
}

  // Default back
  return "/card-backs/M1R-SR-SGR-SCBACK.jpeg";
};

  return (
    <div className="min-h-screen bg-white">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="mb-6 flex items-center px-2">

  {/* Back Button */}
  <button
    onClick={() => window.history.back()}
    className="text-sm text-amber-900 hover:text-amber-700 mr-3 whitespace-nowrap"
  >
    ← Back
  </button>

  {/* Title */}
  <h1 className="text-lg font-semibold text-center flex-1">
    {set.name}
  </h1>

</div>
      <p className="text-center text-sm md:text-base text-gray-500 max-w-sm md:max-w-2xl mx-auto mt-2 px-3">
  The second volume of Fun Moments proved to be elusive to a portion of the Kayou collecting community. It was not availble for sale online, but rather exclusively at brick-and-mortar stores, where it was unannounced in arrival and departure. This was the first box to come without a promo card due to it not being availble anywhere but on store shelves.
</p>

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
 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
  {[...Array(5)].map((_, i) => (
    <img
      key={i}
      src={watermark}
      className="absolute opacity-30 rotate-[-25deg] w-[140%] left-1/2 -translate-x-1/2"
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

export default FunMoments2;
import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

const FantasyWonderland = () => {

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // CARD STRUCTURE
 const STRUCTURE = [
  { prefix: "BP01C", count: 48 },
  { prefix: "BP01U", count: 18 },
  { prefix: "BP01ER", count: 6 },
  { prefix: "BP01SR", count: 14 },
  { prefix: "BP01SPR", count: 28 },
  { prefix: "BP01GR", count: 12 },
  { prefix: "BP01CR", count: 12 },
  { prefix: "BP01RR", count: 6 },
  { prefix: "BP01PSPR", count: 11 },
  { prefix: "BP01PGR", count: 6 },
  { prefix: "BP01PCR", count: 12 },
  { prefix: "BP01PRR", count: 6 },
];

 const cards = STRUCTURE.flatMap(({ prefix, count }) => {

  if (prefix === "BP01ER") {
    return Array.from({ length: 6 }, (_, i) => {
      const num = String(i + 7).padStart(2, "0");

      return {
        key: `BP01ER${num}`,
        rarity: "ER"
      };
    });
  }

  if (prefix === "BP01PSPR") {
    const PSPR_NUMBERS = [
      1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21
    ];

    return PSPR_NUMBERS.map(n => ({
      key: `BP01PSPR${String(n).padStart(2, "0")}`,
      rarity: "PSPR"
    }));
  }

  // everything else stays the same
  return Array.from({ length: count }, (_, i) => ({
    key: `${prefix}${String(i + 1).padStart(2, "0")}`,
    rarity: prefix.replace("BP01", "")
  }));
});

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
          .eq("set_id", "FW")
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
            set_id: "FW",
            progress: flipped
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

  return (
    <div className="min-h-screen bg-white">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="mb-6 flex items-center px-2">

          <button
            onClick={() => window.history.back()}
            className="text-sm text-amber-900 hover:text-amber-700 mr-3 whitespace-nowrap"
          >
            ← Back
          </button>

          <h1 className="text-lg font-semibold text-center flex-1">
            Fantasy Wonderland
          </h1>

        </div>

        <p className="text-center text-sm md:text-base text-gray-500 max-w-sm md:max-w-2xl mx-auto mt-2 px-3">
          Fantasy Wonderland was the first TCG booster pack set to show up in America.
        </p>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-6">
            {cards
  .filter(card => {
    if (card.key.startsWith("BP01PSPR")) {
      const valid = [1,2,3,5,7,8,9,12,13,18,21];
      const num = parseInt(card.key.slice(-2));
      return valid.includes(num);
    }

    return true;
  })
  .map((card) => {
              const key = card.key;
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

                    {/* FRONT */}
                    <img
  src={
    key.startsWith("BP01ER")
      ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.png`

      : key.startsWith("BP01PER")
        ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.png`

        : `/fantasy-wonderland/${key}.png`
  }
  className="absolute w-full h-full object-cover rounded-lg backface-hidden"
/>

{/* BACK */}
<img
  src={
    key.startsWith("BP01PRR")
      ? `/tcg-card-backs/PRR${key.slice(-2)}BACK.png`

      : key.startsWith("BP01RR")
        ? `/tcg-card-backs/SDRR${key.slice(-2)}BACK.png` // ✅ TEMP RR BACKS

      : key.startsWith("BP01ER") || key.startsWith("BP01PER")
        ? `/tcg-card-backs/SCENECARDBACK.png`

      : "/card-backs/tcgdefaultback.png"
  }
  className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
/>

                    {/* WATERMARK */}
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
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default FantasyWonderland;
import { useParams } from "react-router-dom";
import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Collection = () => {
  const { id = "" } = useParams();

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const toggleFlip = async (key: string) => {

  // 1. Create updated state
  const newFlipped = {
    ...flipped,
    [key]: !flipped[key]
  };

  // 2. Update UI immediately
  setFlipped(newFlipped);

  // 3. Get current user
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) return;

  // 4. Save to database
  await supabase
    .from("collection_progress_raw")
    .upsert(
      {
        user_id: user.id,
        set_id: id,
        progress: newFlipped,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,set_id" }
    );
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
          .eq("set_id", id)
          .single();

        if (saved?.progress) {
          setFlipped(saved.progress);
        }
      }

      setLoaded(true);
    };

    loadProgress();
  }, [id]);

  // SAVE PROGRESS ( RELOAD AFTER LOGIN )
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
        .eq("set_id", id)
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
}, [id]);

  const sets = {
    "1": {
      name: "Eternal Moon: First Edition",
      folder: "first-edition-moon",
      prefix: "M1",
      rarities: {
        R: 30,
        SR: 20,
        SSR: 54,
        HR: 36,
        UR: 16,
        LSR: 15,
        SGR: 8,
        SC: 7
      }
    },

    "2": {
      name: "Eternal Moon: Second Edition",
      folder: "second-edition-moon",
      prefix: "M2",
      rarities: {
        R: 30,
        SR: 20,
        SSR: 54,
        HR: 30,
        UR: 16,
        LSR: 16,
        SGR: 8,
        ZR: 7,
        SC: 7,
        "SHINING ZR": 1
      }
    },

    "5": {
      name: "Rainbow: First Volume",
      folder: "rainbow-one",
      prefix: "R1",
      rarities: {
        R: 30,
        SR: 15,
        FR: 18,
        TR: 12,
        TGR: 8,
        MTR: 18,
        SSR: 15,
        UR: 15,
        USR: 8,
        XR: 7
      }
    },

    "7": {
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
    }
  };

  const set = sets[id as keyof typeof sets];

  if (!set) {
    return (
      <div className="min-h-screen bg-gray-50">
        <KayouHeader />
        <div className="container py-8">
          <h1 className="text-2xl font-bold">Set not found</h1>
        </div>
      </div>
    );
  }

  const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1
    }))
  );

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getCardBack = (rarity: string, number: number) => {

  const padded = String(number).padStart(3, "0");

// Force default for LSR
if (rarity === "LSR") {
  return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
}

  // ---------- MOON 1 ----------
  if (set.prefix === "M1") {

    // R (individual backs)
    if (rarity === "R") {
      return `/moon-1-other-backs/M1RBK${padded}.jpg`;
    }

    // SR (individual backs)
    if (rarity === "SR") {
      return `/moon-1-other-backs/M1SRB${padded}.jpg`;
    }

    // HR
    if (rarity === "HR") {
      const sideways = [8,9,10,18,19,21,23,27,32,34,36];
      if (sideways.includes(number)) {
        return `/card-backs/M1HRSIDEWAYSBACK.jpg`;
      }
      return `/card-backs/M1HRBACK.jpeg`;
    }

    // SSR
    if (rarity === "SSR") {
      return `/card-backs/M1SSRBACK.jpeg`;
    }

    // UR
    if (rarity === "UR") {
      if (number === 16) {
        return `/card-backs/M1URSIDEWAYSBACK.jpg`;
      }
      return `/card-backs/M1URBACK.jpeg`;
    }

    // SGR
    if (rarity === "SGR") {
      return `/card-backs/M1SGRBACK.jpeg`;
    }

    // SC
    if (rarity === "SC") {
      if (number === 7) {
        return `/card-backs/M1SCBACK.jpeg`;
      }
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }

    // LSR default
    if (rarity === "LSR") {
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }
  }

  // ---------- MOON 2 ----------
  if (set.prefix === "M2") {

    if (rarity === "R") {
      return `/moon-2-other-backs/M2RB${padded}.jpg`;
    }

    if (rarity === "SR") {
      return `/moon-2-other-backs/M2SRB${padded}.jpg`;
    }

    if (rarity === "HR") {
      if (number <= 22) {
        return `/card-backs/M1SCBACK.jpeg`;
      }
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }

    if (rarity === "SSR") {
      return `/card-backs/M2SSRBACK.jpg`;
    }

    if (rarity === "UR") {
      return `/card-backs/M1URBACK.jpeg`;
    }

    if (rarity === "SGR") {
      return `/card-backs/M2SGRBACK.jpg`;
    }

    if (rarity === "ZR") {
  return `/card-backs/M2ZRBACK.jpeg`;
}

    if (rarity === "SC") {
      if (number === 7) {
        return `/card-backs/M2SC007BACK.jpg`;
      }
      return `/card-backs/M2SCBACK.jpeg`;
    }

    if (rarity === "SHINING ZR") {
      return `/card-backs/M2SZRBACK.jpg`;
    }

    if (rarity === "LSR") {
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }
  }

  // ---------- RAINBOW 1 ----------
  if (set.prefix === "R1") {

    if (rarity === "R") {
      return `/rainbow-1-backs/R1RB${padded}.jpg`;
    }

    if (rarity === "SR") {
      return `/rainbow-1-backs/R1SRB${padded}.jpg`;
    }

    if (rarity === "FR") {
      return `/card-backs/R1FRBACK.jpg`;
    }

    if (rarity === "UR") {
      return `/card-backs/M1URBACK.jpeg`;
    }

    // default group
if (["TGR","TR","MTR","SSR","USR","XR"].includes(rarity)) {
  return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
}

}

return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
};
  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">
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
                      src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.jpg`}
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

export default Collection;

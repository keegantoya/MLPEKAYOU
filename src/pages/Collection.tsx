import { useParams } from "react-router-dom";
import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Collection = () => {
  const { id = "" } = useParams();

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [forTrade, setForTrade] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

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
        .eq("set_id", id)
        .eq("card_key", key);
    } else {
      await supabase
        .from("for_trade")
        .insert({
          user_id: user.id,
          set_id: id,
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
        .eq("set_id", id);

      if (trades) {
        const map: Record<string, boolean> = {};

        trades.forEach((t) => {
          map[t.card_key] = true;
        });

        setForTrade(map);
      }
    };

    loadTrade();
  }, [id]);

  // SAVE PROGRESS
  useEffect(() => {
    if (!loaded) return;

    const saveProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      await supabase
        .from("collection_progress")
        .upsert(
          {
            user_id: user.id,
            set_id: id,
            progress: flipped
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, id, loaded]);

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
      <div className="min-h-screen bg-background">
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
        <h1 className="text-2xl font-bold mb-6">
          {set.name}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
      </div>
    </div>
  );
};

export default Collection;
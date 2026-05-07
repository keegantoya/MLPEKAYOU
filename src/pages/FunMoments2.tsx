import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

const FunMoments2 = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

   const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

 const set = {
    name: "Fun Moments",
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
    },
    rarityNames: {
  N: "EPISODE CARDS",
  SN: "SHINING EPISODE CARDS",
  R: "RARE CARDS",
  SR: "SUPER RARE CARDS",
  SSR: "SUPER SPARK RARE CARDS",
  UR: "ULTRA RARE CARDS",
  UGR: "ULTRA GOLDEN RARE CARDS",
  CR: "CREATIVE RARE CARDS"
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

const toggleCollapse = (rarity: string) => {
  setCollapsed((prev) => ({
    ...prev,
    [rarity]: !prev[rarity]
  }));
};

const formatRarity = (rarity: string) => {
  if (rarity === "SN") return "◇N";
  return rarity;
};

const isRarityComplete = (rarity: string, count: number) => {
  for (let i = 1; i <= count; i++) {
    const key = `${rarity}-${i}`;
    if (!flipped[key]) return false;
  }
  return true;
};

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
<div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-0 mb-8 mt-6 sm:mt-0">

  {/* Back Button */}
  <button
    onClick={() => navigate("/collections")}
    className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
  >
    <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
      ← Back
    </span>
  </button>

  {/* Center Content */}
  <div className="flex-1 text-center">

    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5a3e84] leading-tight">
      {set.name}
    </h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 my-5">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        Second Edition
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      The second volume of Fun Moments proved to be elusive to a portion of
      the Kayou collecting community. It was not available for sale online,
      but rather exclusively at brick-and-mortar stores, where it was
      unannounced in arrival and departure. This was the first box to come
      without a promo card due to it not being available anywhere but on
      store shelves.
    </p>

  </div>

  <div className="hidden sm:block w-[72px]" />
</div>

<div className="flex flex-wrap justify-center gap-2 mt-6 mb-12">
  {Object.entries(set.rarities).map(([rarity, count]) => {
    const complete = (() => {
      for (let i = 1; i <= (count as number); i++) {
        if (!flipped[`${rarity}-${i}`]) return false;
      }
      return true;
    })();

    return (
      <button
        key={rarity}
        onClick={() => {
          const el = document.getElementById(`rarity-${rarity}`);
          if (!el) return;

          const yOffset = -80;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }}
        className={`px-3 py-1 text-xs md:text-sm rounded-full border transition-all
  ${
    complete
      ? "bg-[#5a3e84] text-white border-[#5a3e84]"
      : "border-[#d4af37] text-[#5a3e84] hover:bg-[#f5e6ff]"
  }
`}
      >
        {formatRarity(rarity)}
      </button>
    );
  })}
</div>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (
  <>
    {Object.entries(set.rarities).map(([rarity, count]) => (
 <div key={rarity} id={`rarity-${rarity}`} className="mb-10">

  

  <div className="relative bg-white border border-gray-200 rounded-xl p-3 md:p-4 pt-8 overflow-visible">

    <button
  onClick={() => toggleCollapse(rarity)}
  className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 shadow-sm"
>
  {collapsed[rarity] ? "+" : "−"}
</button>

<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 md:px-4 text-[11px] md:text-lg font-semibold text-gray-700 text-center leading-tight max-w-[85%] md:max-w-none whitespace-normal md:whitespace-nowrap">
  {set.rarityNames?.[rarity] || rarity}
</div>

    {!collapsed[rarity] && (
  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {Array.from({ length: count as number }, (_, i) => {
        const number = i + 1;
        const key = `${rarity}-${number}`;
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
                src={`/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`}
                className="absolute w-full h-full object-cover rounded-lg backface-hidden"
              />

              <img
                src={getCardBack(rarity, number)}
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
    ))}
  </>
)}

      </div>
    </div>
  );
};

export default FunMoments2;
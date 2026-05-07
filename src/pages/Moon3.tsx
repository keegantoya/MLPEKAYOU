import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";


const Moon3 = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key],
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
          .eq("set_id", "3")
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

      await supabase.from("collection_progress_raw").upsert(
        {
          user_id: user.id,
          set_id: "3",
          progress: flipped,
        },
        { onConflict: "user_id,set_id" }
      );
    };

    saveProgress();
  }, [flipped, loaded]);

  const set = {
    name: "Eternal Moon",
    folder: "eternal-moon",
    prefix: "M3",
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      LSR: 32,
      UR: 18,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
  };
const rarityButtonNames: Record<string, string> = {
  R: "R",
  SR: "SR",
  SSR: "SSR",
  HR: "HR",
  UR: "UR",
  LSR: "LSR",
  SGR: "SGR",
  ZR: "ZR",
  SC: "SC",
  SZR: "◇ZR",
};

const rarityContainerNames: Record<string, string> = {
  R: "RARE CARDS",
  SR: "SUPER RARE CARDS",
  SSR: "SUPER SPARK RARE CARDS",
  HR: "HOLOGRAPHIC RARE CARDS",
  UR: "ULTRA RARE CARDS",
  LSR: "LIMITED SUPER RARE CARDS",
  SGR: "SUPER GOLD RARE CARDS",
  ZR: "ZENITH RARE CARDS",
  SC: "SECRET CARDS",
  SZR: "SHINING ZENITH RARE CARDS",
};
  // BUILD CARD LIST (ORDER STARTS AT R)
  const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1,
    }))
  );

  // CARD BACK LOGIC
const getCardBack = (rarity: string, number: number) => {
    if (rarity === "SZR" && number === 1) {
    return `/card-backs/third-moon-edition-backs/M3SZR001BACK.jpg`;
  }
    if (rarity === "SZR" && number >= 2 && number <= 3) {
    return `/card-backs/third-moon-edition-backs/moon3zrback2.jpg`;
  }
    if (rarity === "SC") {
    return `/card-backs/third-moon-edition-backs/m3scback.jpg`;
  }
    if (rarity === "ZR" && number === 14) {
    return `/card-backs/third-moon-edition-backs/moon3sdzrback2.jpg`;
  }
  if (rarity === "ZR" && number >= 8 && number <= 13) {
    return `/card-backs/third-moon-edition-backs/moon3zrback2.jpg`;
  }
  if (rarity === "ZR" && number >= 1 && number <= 7) {
    return `/card-backs/third-moon-edition-backs/m3zrback1.jpg`;
  }
  if (rarity === "UR" && number >= 15 && number <= 18) {
    return `/card-backs/third-moon-edition-backs/moon3sdurback.jpg`;
  }
  if (rarity === "UR" && number >= 1 && number <= 14) {
    return `/card-backs/third-moon-edition-backs/moon3urback.jpg`;
  }
    if (rarity === "SGR" && number >= 1 && number <= 8) {
    return `/card-backs/third-moon-edition-backs/moon3sgrback1.jpg`;
  }
  if (rarity === "SGR" && number >= 9 && number <= 16) {
    return `/card-backs/third-moon-edition-backs/moon3sgrback2.jpg`;
  }
    if (
    rarity === "HR" &&
    ((number >= 1 && number <= 22) ||
     (number >= 31 && number <= 52))
  ) {
    return `/card-backs/third-moon-edition-backs/moon3sdhrback.jpg`;
  }
    if (rarity === "SR") {
    return `/card-backs/third-moon-edition-backs/moon3srback.jpg`;
  }
      if (rarity === "SSR") {
    return `/card-backs/third-moon-edition-backs/moon3ssrback.jpg`;
  }
  return `/card-backs/third-moon-edition-backs/moon3defaultback.jpg`;
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
        Third Edition
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      Only the first shipment of Moon 3 will come with the first edition mark in the top left corner. All other shipments will continue as normal.
    </p>

  </div>

  <div className="hidden sm:block w-[72px]" />
</div>

{!loaded ? (
  <div className="text-center py-16 text-muted-foreground">
    Loading collection...
  </div>
) : (
  <>
    {Object.entries(
      cards.reduce((acc: any, card) => {
        if (!acc[card.rarity]) acc[card.rarity] = [];
        acc[card.rarity].push(card);
        return acc;
      }, {})
    ).map(([rarity, group]: any, index) => {
      return (
        <div key={rarity} id={`rarity-${rarity}`} className="mt-6 mb-10">

          {/* BUTTON ROW */}
          {index === 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {Object.keys(set.rarities).map((r) => {
                const rarityGroup = cards.filter(c => c.rarity === r);
const done = rarityGroup.every(c =>
  flipped[`${c.rarity}-${c.number}`]
);
                return (
                  <button
                    key={r}
                    onClick={() => {
                      const el = document.getElementById(`rarity-${r}`);
                      if (!el) return;
                      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }}
                    className={`px-3 py-1 text-xs md:text-sm rounded-full border
                      ${done
                        ? "bg-[#5a3e84] text-white border-[#5a3e84]"
                        : "border-[#d4af37] text-[#5a3e84] hover:bg-[#f5e6ff]"}
                    `}
                  >
                    {rarityButtonNames[r] || r}
                  </button>
                );
              })}
            </div>
          )}

          {/* CONTAINER */}
          <div className="relative bg-white border border-gray-200 rounded-xl p-3 md:p-4 pt-8 overflow-visible">

            <button
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [rarity]: !prev[rarity]
                }))
              }
              className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded border border-gray-300 bg-white shadow-sm"
            >
              {collapsed?.[rarity] ? "+" : "−"}
            </button>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm md:text-lg font-semibold text-gray-700">
              {rarityContainerNames[rarity] || rarity}
            </div>

            {!collapsed?.[rarity] && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {group.map((card: any) => {
                  const key = `${card.rarity}-${card.number}`;
                  const isFlipped = flipped[key];
                  const isDoubleCard =
                    card.rarity === "SZR" && card.number === 1;

                  return (
                    <div
                      key={key}
                      className={`cursor-pointer perspective relative ${
                        isDoubleCard
                          ? "col-span-2 aspect-[10/7]"
                          : "aspect-[5/7]"
                      }`}
                      onClick={() => toggleFlip(key)}
                    >
                      <div
                        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                          isFlipped ? "rotate-y-180" : ""
                        }`}
                      >
                        <img
                          src={`/cards/third-edition-moon/${set.prefix}${card.rarity}${String(card.number).padStart(3, "0")}.jpg`}
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
    })}
  </>
)}
      </div>
    </div>
  );
};

export default Moon3;
import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const FantasyWonderland = () => {
  const navigate = useNavigate();

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
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
  { prefix: "BP01PER", count: 12 },
  { prefix: "BP01PSPR", count: 11 },
  { prefix: "BP01PGR", count: 6 },
  { prefix: "BP01PCR", count: 12 },
  { prefix: "BP01PRR", count: 6 },
];
const rarityButtonNames: Record<string, string> = {
  C: "C",
  U: "U",
  ER: "ER",
  SR: "SR",
  SPR: "SPR",
  GR: "GR",
  CR: "CR",
  RR: "RR",
  PER: "※ER",
  PSPR: "※SPR",
  PGR: "※GR",
  PCR: "※CR",
  PRR: "※RR"
};
const rarityContainerNames: Record<string, string> = {
  C: "COMMON CARDS",
  U: "UNCOMMON CARDS",
  ER: "EMERALD RARE CARDS",
  SR: "SILVER RARE CARDS",
  SPR: "SAPPHIRE RARE CARDS",
  GR: "GOLD RARE CARDS",
  CR: "COLORFUL RARE CARDS",
  RR: "RUBY RARE CARDS",
  PER: "※EMERALD RARE CARDS",
  PSPR: "※SAPPHIRE RARE CARDS",
  PGR: "※GOLD RARE CARDS",
  PCR: "※COLORFUL RARE CARDS",
  PRR: "※RUBY RARE CARDS"
};

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
      Fantasy Wonderland
    </h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 my-5">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        BP01
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      Fantasy Wonderland was the first TCG booster pack set to show up in America.
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

{/* RARITY BUTTONS */}
<div className="flex flex-wrap justify-center gap-2 mt-6 mb-12">
  {Object.entries(
    cards.reduce((acc: any, card) => {
      if (!acc[card.rarity]) acc[card.rarity] = [];
      acc[card.rarity].push(card);
      return acc;
    }, {})
  ).map(([rarity, group]: any) => {

    const complete = group.every((card: any) => flipped[card.key]);

    return (
      <button
        key={rarity}
        onClick={() => {
          const el = document.getElementById(`rarity-${rarity}`);
          if (!el) return;

          const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }}
        className={`px-3 py-1 text-xs md:text-sm rounded-full border transition-all
          ${
            complete
              ? "bg-[#5a3e84] text-white border-[#5a3e84]"
              : "border-[#d4af37] text-[#5a3e84] hover:bg-[#f5e6ff]"
          }`}
      >
        {rarityButtonNames[rarity] || rarity}
      </button>
    );
  })}
</div>

  {/* GROUP CARDS BY RARITY */}
  {Object.entries(
    cards.reduce((acc: any, card) => {
      if (!acc[card.rarity]) acc[card.rarity] = [];
      acc[card.rarity].push(card);
      return acc;
    }, {})
  ).map(([rarity, group]: any) => (

    <div key={rarity} id={`rarity-${rarity}`} className="mt-6 mb-10">

      <div className="relative bg-white border border-gray-200 rounded-xl p-3 md:p-4 pt-8 overflow-visible">
<button
  onClick={() =>
    setCollapsed((prev) => ({
      ...prev,
      [rarity]: !prev[rarity]
    }))
  }
  className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 shadow-sm"
>
  {collapsed[rarity] ? "+" : "−"}
</button>

        {/* LABEL */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 md:px-4 text-[11px] md:text-lg font-semibold text-gray-700 text-center">
          {rarityContainerNames[rarity] || rarity}
        </div>

        {/* GRID */}
        {!collapsed[rarity] && (
  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {group.map((card: any) => {
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
                        ? `/tcg-card-backs/SDRR${key.slice(-2)}BACK.png`
                        : key.startsWith("BP01ER") || key.startsWith("BP01PER")
                        ? `/tcg-card-backs/SCENECARDBACK.png`
                        : "/card-backs/tcgdefaultback.png"
                    }
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

export default FantasyWonderland;
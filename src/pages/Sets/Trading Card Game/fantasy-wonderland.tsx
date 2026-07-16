import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";

const FantasyWonderland = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState("");

const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("C");
const [hoverEffects, setHoverEffects] = useState(true);

  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
  const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);

const set = {
  folder: "fantasy-wonderland",
  setId: "FW",

  rarities: {
    C: 48,
    U: 18,
    ER: 6,
    SR: 14,
    SPR: 28,
    GR: 12,
    CR: 12,
    RR: 6,
    PER: 12,
    PSPR: 11,
    PGR: 6,
    PCR: 12,
    PRR: 6,
  },
};

const rarityNames: Record<string, string> = {
  C: "COMMON",
  U: "UNCOMMON",
  ER: "EMERALD RARE",
  SR: "SILVER RARE",
  SPR: "SAPPHIRE RARE",
  GR: "GOLD RARE",
  CR: "COLORFUL RARE",
  RR: "RUBY RARE",
  PER: "SHINING EMERALD RARE",
  PSPR: "SHINING SAPPHIRE RARE",
  PGR: "SHINING GOLD RARE",
  PCR: "SHINING COLORFUL RARE",
  PRR: "SHINING RUBY RARE",
};

const cards = Object.entries(set.rarities).flatMap(([rarity, count]) => {
  if (rarity === "ER") {
    return Array.from({ length: 6 }, (_, i) => ({
      rarity,
      key: `BP01ER${String(i + 7).padStart(2, "0")}`,
    }));
  }

  if (rarity === "PSPR") {
    const numbers = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];

    return numbers.map((n) => ({
      rarity,
      key: `BP01PSPR${String(n).padStart(2, "0")}`,
    }));
  }

  return Array.from({ length: count }, (_, i) => ({
    rarity,
    key: `BP01${rarity}${String(i + 1).padStart(2, "0")}`,
  }));
});

const isRarityComplete = (rarity: string) => {
  const total = set.rarities[rarity as keyof typeof set.rarities];

  const owned = cards.filter(
    (card) => card.rarity === rarity && flipped[card.key]
  ).length;

  return owned === total;
};

const getRarityCode = (rarity: string) => {
  return rarity;
};

const getCardBack = (key: string) => {
  if (key.startsWith("BP01PRR")) {
    return `/tcg-card-backs/PRR${key.slice(-2)}BACK.webp`;
  }

  if (key.startsWith("BP01RR")) {
    return `/tcg-card-backs/SDRR${key.slice(-2)}BACK.webp`;
  }

  if (key.startsWith("BP01ER") || key.startsWith("BP01PER")) {
    return `/tcg-card-backs/SCENECARDBACK.webp`;
  }

  return `/card-backs/tcgdefaultback.webp`;
};

const getCardFront = (key: string) => {
  if (key.startsWith("BP01ER")) {
    return `/fantasy-wonderland/SD01ER${key.slice(-2)}.webp`;
  }

  if (key.startsWith("BP01PER")) {
    return `/fantasy-wonderland/SD01PER${key.slice(-2)}.webp`;
  }

  return `/fantasy-wonderland/${key}.webp`;
};

const toggleFlip = (key: string) => {
  if (viewMode) {
    setZoomedCard(getCardFront(key));
    setZoomedCardBack(getCardBack(key));
    setZoomedCardFlipped(false);
    return;
  }

  setFlipped((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

useEffect(() => {
  const loadProgress = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) {
      setLoaded(true);
      return;
    }

    const { data: saved } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
      .eq("set_id", set.setId)
      .single();

    if (saved?.progress) {
      setFlipped(saved.progress);
      setLastSavedProgress(JSON.stringify(saved.progress));
    }

    setLoaded(true);
  };

  loadProgress();
}, []);

useEffect(() => {
  if (!loaded) return;

  const current = JSON.stringify(flipped);

  if (current === lastSavedProgress) return;

  const saveProgress = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    await supabase
      .from("collection_progress_raw")
      .upsert(
        {
          user_id: user.id,
          set_id: set.setId,
          progress: flipped,
        },
        {
          onConflict: "user_id,set_id",
        }
      );

    setLastSavedProgress(current);
  };

  saveProgress();
}, [flipped, loaded, lastSavedProgress]);

  return (
    <div className="min-h-screen bg-[#e3e3e3]">
      <div className="mx-auto max-w-[1800px] px-6 py-8">

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">

          {/* LEFT SIDEBAR */}
          <aside
  className="sidebar-scroll xl:sticky xl:top-[84px] self-start max-h-[calc(100vh-100px)] overflow-y-auto pr-2"
>

            <div className="bg-zinc-800 border border-zinc-600 rounded-xl shadow-lg overflow-hidden text-zinc-100">

             {/* Set Header */}
<div className="p-6 border-b border-zinc-700">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Trading Card Game
                </p>

                <button
  onClick={() => navigate("/collections")}
  className="mt-6 mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
>
  ← Back to Collections
</button>

                <h1 className="mt-2 text-4xl font-black uppercase leading-none">
                  Fantasy Wonderland
                </h1>

                <p className="mt-2 text-lg text-zinc-400">
  Series 1
</p>

<p className="mt-4 text-xs leading-relaxed text-gray-400">
  Click on a card to flip it over. This means you own that card.
  Your ISO list will automatically update to reflect the cards you
  still need.
</p>

              </div>

              {/* Rarities */}
              <div className="p-6">

                <div className="flex justify-between mb-4 text-zinc-400 text-sm font-semibold uppercase">
                  <span>13 Rarity Tiers</span>
                  <span>191 Cards</span>
                </div>

                <div className="grid grid-cols-2 gap-2">

  {Object.keys(set.rarities).map((rarity) => (
    <button
      key={rarity}
      onClick={() => {
  if (window.innerWidth < 768) {
    setSelectedRarity(rarity);

    requestAnimationFrame(() => {
      document
        .getElementById(`rarity-${rarity}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  } else {
    document
      .getElementById(`rarity-${rarity}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }
}}
      className={`rounded-lg border p-2 text-sm font-bold transition-all

      ${
  isRarityComplete(rarity)
    ? "text-[#4a3200] border-[#d4af37] bg-gradient-to-br from-[#fff7c2] via-[#f6d365] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.45)]"
    : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
    }`}
    >
      {rarity === "PER"
  ? "※ER"
  : rarity === "PSPR"
  ? "※SPR"
  : rarity === "PGR"
  ? "※GR"
  : rarity === "PCR"
  ? "※CR"
  : rarity === "PRR"
  ? "※RR"
  : rarity}
    </button>
  ))}

</div>

              </div>

              {/* View Mode */}
<div className="border-t border-zinc-700 p-6">
  <button
    onClick={() => setViewMode(!viewMode)}
className={`w-full rounded-lg py-3 text-sm font-bold transition-colors ${
  viewMode
    ? "bg-yellow-500 text-white hover:bg-yellow-600"
    : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
}`}
  >
    {viewMode ? "View Mode: ON" : "View Mode: OFF"}
  </button>

  <p className="mt-2 text-xs text-zinc-400">
    {viewMode
      ? "Click a card to view the front and back without marking it as owned."
      : "Click cards to mark them as owned."}
  </p>
</div>

<div className="hidden md:block border-t border-zinc-700 p-6">
  <button
    onClick={() => setHoverEffects(!hoverEffects)}
    className={`w-full rounded-lg py-3 text-sm font-bold transition-colors ${
      hoverEffects
        ? "bg-yellow-500 text-white hover:bg-yellow-600"
        : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
    }`}
  >
    {hoverEffects ? "Hover Effects: ON" : "Hover Effects: OFF"}
  </button>

  <p className="mt-2 text-xs text-zinc-400">
    Enable or disable the hover animation on collection cards.
  </p>
</div>

              {/* Product Info */}
              <div className="border-t border-zinc-700 p-6">

                <h2 className="text-lg font-bold uppercase mb-5">
                  Product Information
                </h2>

                <div className="space-y-5">

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">
                      Product Name
                    </p>

                    <p className="font-semibold">
                      Fantasy Wonderland
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">
                      Release Date
                    </p>

                    <p className="font-semibold">
                      March 2026
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">
                      Pull Rates
                    </p>

                    <p className="font-semibold">
                      —
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </aside>

          {/* RIGHT SIDE */}
          <main
  className="card-scroll space-y-20 overflow-y-auto pr-3
             xl:h-[calc(100vh-100px)]"
>

            {/* Section */}
            {Object.entries(set.rarities)
  .filter(([rarity]) =>
    window.innerWidth >= 768 || rarity === selectedRarity
  )
  .map(([rarity, count], index) => (
  <section
  key={rarity}
  id={`rarity-${rarity}`}
>

    <div className="flex items-end justify-between mb-5">

      <div>

        <h2 className="text-5xl font-black leading-none">
{rarity === "PER"
  ? "※ER"
  : rarity === "PSPR"
  ? "※SPR"
  : rarity === "PGR"
  ? "※GR"
  : rarity === "PCR"
  ? "※CR"
  : rarity === "PRR"
  ? "※RR"
  : rarity}
  <span className="ml-3 text-3xl font-light text-zinc-400">
    {rarityNames[rarity]}
  </span>
</h2>

<p className="uppercase tracking-widest text-gray-400 mt-2">
  {count} Cards
</p>

      </div>

      <div className="text-6xl font-black text-yellow-500">
        {String(index + 1).padStart(2, "0")}
      </div>

    </div>

    <div className="h-px bg-yellow-400 mb-8" />
<div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">

      {cards
        .filter(card => card.rarity === rarity)
        .map((card) => {
  const key = card.key;
  const owned = flipped[key];

  return (
    <div
  key={key}
  className="group aspect-[5/7] cursor-pointer perspective relative"
  onClick={() => toggleFlip(key)}
>
      <div
className={`relative w-full h-full transform-style-preserve-3d transition-all duration-200
    ${
      hoverEffects
        ? "md:hover:-translate-y-2 md:hover:scale-[1.04] md:hover:rotate-1 md:hover:shadow-2xl md:hover:z-20"
        : ""
    }
    ${owned && !viewMode ? "rotate-y-180" : ""}`}
>
        {/* FRONT */}
        <img
          src={getCardFront(key)}
          className="absolute w-full h-full object-cover rounded-lg backface-hidden"
        />

        {/* BACK */}
        <img
          src={getCardBack(key)}
          className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
        />
      </div>
    </div>
  );
})}

    </div>

  </section>
))}

            {/* Duplicate sections here */}

          </main>

        </div>

      </div>

{zoomedCard && (
  <div
    className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setZoomedCard(null)}
  >
    <TiltCard>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setZoomedCardFlipped(!zoomedCardFlipped);
        }}
      >
        <div
          className={`relative transition-transform duration-500 transform-style-preserve-3d ${
            zoomedCardFlipped ? "rotate-y-180" : ""
          }`}
        >
          <img
            src={zoomedCard}
            className="absolute inset-0 max-h-[88vh] max-w-[90vw] md:max-h-[65vh] md:max-w-[50vw] rounded-2xl shadow-2xl backface-hidden"
          />

          <img
            src={zoomedCardBack || ""}
            className="max-h-[88vh] max-w-[90vw] md:max-h-[65vh] md:max-w-[50vw] rounded-2xl shadow-2xl backface-hidden"
            style={{ transform: "rotateY(180deg)" }}
          />
        </div>
      </div>
    </TiltCard>
  </div>
)}

    </div>
  );
};

export default FantasyWonderland;
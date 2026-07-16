import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import TiltCard from "@/components/TiltCards";

const PromotionalCards = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState("");

const [viewMode, setViewMode] = useState(false);
const [selectedRarity, setSelectedRarity] = useState("PR");
const [hoverEffects, setHoverEffects] = useState(true);

  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
  const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);

const set = {
  folder: "promo-cards",
  prefix: "MLPEPR",
  setId: "9",
};

const ccgCards = [1, 2, 3, 4, 5, 7];

const tcgCards = Array.from({ length: 18 }, (_, i) => i + 1);

const getCardBack = () => "/card-backs/M1R-SR-SGR-SCBACK.webp";

const toggleFlip = (key: string) => {
  if (viewMode) {
if (key.startsWith("PR-")) {
  const number = Number(key.split("-")[1]);

  setZoomedCard(
    `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`
  );

  setZoomedCardBack(getCardBack());
} else {
  setZoomedCard(`/tcgpromos/${key}.webp`);
  setZoomedCardBack("/card-backs/tcgdefaultback.webp");
}

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

  const [{ data: ccg }, { data: tcg }] = await Promise.all([
    supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
      .eq("set_id", "9")
      .maybeSingle(),

    supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
      .eq("set_id", "tcgpromos")
      .maybeSingle(),
  ]);

  const merged = {
    ...(ccg?.progress || {}),
    ...(tcg?.progress || {}),
  };

  setFlipped(merged);
  setLastSavedProgress(JSON.stringify(merged));
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

  const ccgProgress: Record<string, boolean> = {};
  const tcgProgress: Record<string, boolean> = {};

  Object.entries(flipped).forEach(([key, value]) => {
    if (key.startsWith("PR-")) {
      ccgProgress[key] = value;
    } else if (key.startsWith("RR")) {
      tcgProgress[key] = value;
    }
  });

  await Promise.all([
    supabase.from("collection_progress_raw").upsert(
      {
        user_id: user.id,
        set_id: "9",
        progress: ccgProgress,
      },
      {
        onConflict: "user_id,set_id",
      }
    ),

    supabase.from("collection_progress_raw").upsert(
      {
        user_id: user.id,
        set_id: "tcgpromos",
        progress: tcgProgress,
      },
      {
        onConflict: "user_id,set_id",
      }
    ),
  ]);

  setLastSavedProgress(JSON.stringify(flipped));
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
                  Eternal Friendship
                </p>

                <button
  onClick={() => navigate("/collections")}
  className="mt-6 mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
>
  ← Back to Collections
</button>

                <h1 className="mt-2 text-5xl font-black uppercase leading-none">
                  Promos
                </h1>

                <p className="mt-2 text-lg text-zinc-400">
  CCG & TCG
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
                  <span>2 Types</span>
                  <span>24 Cards</span>
                </div>

                <div className="grid grid-cols-2 gap-2">

<button
  className="rounded-lg border p-2 text-sm font-bold bg-white border-gray-300 text-gray-700"
  onClick={() =>
    document
      .getElementById("ccg-promos")
      ?.scrollIntoView({ behavior: "smooth" })
  }
>
  CCG
</button>

<button
  className="rounded-lg border p-2 text-sm font-bold bg-white border-gray-300 text-gray-700"
  onClick={() =>
    document
      .getElementById("tcg-promos")
      ?.scrollIntoView({ behavior: "smooth" })
  }
>
  TCG
</button>

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
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">
                      Release Date
                    </p>

                    <p className="font-semibold">
                      Varies
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">
                      Pull Rates
                    </p>

                    <p className="font-semibold">
                      Singles
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
<section id="ccg-promos">

  <div className="flex items-end justify-between mb-5">

    <div>

      <h2 className="text-5xl font-black leading-none">
        CCG Promotional Cards
      </h2>

      <p className="uppercase tracking-widest text-gray-400 mt-2">
        {ccgCards.length} Cards
      </p>

    </div>

  </div>

  <div className="h-px bg-yellow-400 mb-8" />

<div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">

    {ccgCards.map((number) => {

      const key = `PR-${number}`;
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

            <img
              src={`/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`}
              className="absolute w-full h-full object-cover rounded-lg backface-hidden"
            />

            <img
              src={getCardBack()}
              className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
            />

          </div>

        </div>

      );

    })}

  </div>

</section>

<section id="tcg-promos">

  <div className="flex items-end justify-between mb-5">

    <div>

      <h2 className="text-5xl font-black leading-none">
        TCG Promotional Cards
      </h2>

      <p className="uppercase tracking-widest text-gray-400 mt-2">
        {tcgCards.length} Cards
      </p>

    </div>

  </div>

  <div className="h-px bg-yellow-400 mb-8" />

<div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">

    {tcgCards.map((number) => {

      const key = `RR${String(number).padStart(2, "0")}`;
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

            <img
              src={`/tcgpromos/${key}.webp`}
              className="absolute w-full h-full object-cover rounded-lg backface-hidden"
            />

            <img
              src="/card-backs/tcgdefaultback.webp"
              className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
            />

          </div>

        </div>

      );

    })}

  </div>

</section>

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

export default PromotionalCards;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ChevronUp } from "lucide-react";

import fantasyWonderlandBox from "/set-pictures/fantasywonderlandbox.webp";
import fantasyWonderlandPack from "/set-pictures/fantasywonderlandpack.webp";

const FantasyWonderland = () => {
  const navigate = useNavigate();

const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);

const [showProductInfo, setShowProductInfo] = useState(false);

const [viewMode, setViewMode] = useState(false);
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const [isClosingZoom, setIsClosingZoom] = useState(false);
const [showScrollTop, setShowScrollTop] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleFlip = (key: string) => {
  if (viewMode) {
    let backSrc = "/card-backs/tcgdefaultback.webp";

    if (key.startsWith("BP01PRR")) {
      backSrc = `/tcg-card-backs/PRR${key.slice(-2)}BACK.webp`;
    } else if (key.startsWith("BP01RR")) {
      backSrc = `/tcg-card-backs/SDRR${key.slice(-2)}BACK.webp`;
    } else if (key.startsWith("BP01ER") || key.startsWith("BP01PER")) {
      backSrc = "/tcg-card-backs/SCENECARDBACK.webp";
    }

    const frontSrc =
      key.startsWith("BP01ER")
        ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.webp`
        : key.startsWith("BP01PER")
        ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.webp`
        : `/fantasy-wonderland/${key}.webp`;

    setZoomedCardFlipped(false);
    setZoomedCardBack(backSrc);
    setZoomedCard(frontSrc);
    return;
  }

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
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 400);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

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

        const progress = saved?.progress || {};

setFlipped(progress);

const collapseState: Record<string, boolean> = {};

Object.entries(
  cards.reduce((acc: any, card) => {
    if (!acc[card.rarity]) acc[card.rarity] = [];
    acc[card.rarity].push(card);
    return acc;
  }, {})
).forEach(([rarity, group]: any) => {
  collapseState[rarity] = group.every(
    (card: any) => progress[card.key]
  );
});

setCollapsed(collapseState);
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

useEffect(() => {
  const html = document.documentElement;
  const body = document.body;

  if (zoomedCard) {
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
  } else {
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.touchAction = "";
  }

  return () => {
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.touchAction = "";
  };
}, [zoomedCard]);

useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setShowLoginModal(true);
    }
  };

  checkAuth();
}, []);

    const isZoomedLandscape =
  zoomedCard &&
  /BP01C(2[5-9]|3[0-9]|4[0-8])/.test(zoomedCard);

  if (showLoginModal) {
  return (
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-[#d4af37]/30">

        <h2 className="text-3xl font-bold text-[#5a3e84] mb-3">
          Login Required
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          You must be logged in to access card sets and track your collection progress.
        </p>

        <button
          onClick={() => navigate("/collections")}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] font-semibold border border-[#d4af37]/60 hover:brightness-110 transition"
        >
          Return to Collections
        </button>

      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-white">

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
  <button
    onClick={() => setShowProductInfo(true)}
    className="inline-flex items-center gap-2 hover:text-[#7c5aa6] transition-colors duration-200 cursor-pointer group"
  >
    <span>Fantasy Wonderland</span>

    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[#d4af37]/60 text-xs font-bold text-[#8b6a2b] bg-[#fffaf0] group-hover:bg-[#f8f0ff] group-hover:border-[#7c5aa6]/40 group-hover:text-[#5a3e84] transition">
      i
    </span>
  </button>
</h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 my-5">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        BP01
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      Fantasy Wonderland was the first TCG booster pack set to show up in America. I am still waiting on the appropriate card backs for a few of these, so please excuse the discrepencies.
    </p>

  </div>

  <button
  onClick={() => setViewMode(!viewMode)}
  className="self-center sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
>
  <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
    {viewMode ? "Exit View" : "View Set"}
  </span>
</button>
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
            const isFlipped = !viewMode && flipped[key];

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
                        ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.webp`
                        : key.startsWith("BP01PER")
                        ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.webp`
                        : `/fantasy-wonderland/${key}.webp`
                    }
                    className="absolute w-full h-full object-cover rounded-lg backface-hidden"
                  />

                  {/* BACK */}
                  <img
                    src={
                      key.startsWith("BP01PRR")
                        ? `/tcg-card-backs/PRR${key.slice(-2)}BACK.webp`
                        : key.startsWith("BP01RR")
                        ? `/tcg-card-backs/SDRR${key.slice(-2)}BACK.webp`
                        : key.startsWith("BP01ER") || key.startsWith("BP01PER")
                        ? `/tcg-card-backs/SCENECARDBACK.webp`
                        : "/card-backs/tcgdefaultback.webp"
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

      {zoomedCard && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedCard(null)}
        >
          <div
            style={{ perspective: "1200px" }}
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
              {/* FRONT */}
              <img
                src={zoomedCard}
                className={`absolute inset-0 ${
                  isZoomedLandscape
                    ? "rotate-90 max-h-[45vh] max-w-[95vw] sm:max-h-[75vh] sm:max-w-[90vw]"
                    : "max-h-[60vh] max-w-[60vw] sm:max-h-[65vh] sm:max-w-[50vw]"
                } rounded-2xl shadow-2xl backface-hidden`}
              />

              {/* BACK */}
              <img
                src={zoomedCardBack || "/card-backs/tcgdefaultback.webp"}
                className={`${
                  isZoomedLandscape
                    ? "max-h-[45vh] max-w-[95vw] sm:max-h-[75vh] sm:max-w-[90vw]"
                    : "max-h-[60vh] max-w-[60vw] sm:max-h-[65vh] sm:max-w-[50vw]"
                } rounded-2xl shadow-2xl backface-hidden`}
                style={{
                  transform: isZoomedLandscape
                    ? "rotateY(180deg) rotate(-90deg)"
                    : "rotateY(180deg)",
                }}
              />
              {(isZoomedLandscape || zoomedCard?.includes("BP01RR")) &&
  zoomedCardFlipped && (
  <div
    className="absolute inset-0 flex items-center justify-center px-6 text-center pointer-events-none"
    style={{ transform: "rotateY(180deg)" }}
  >
    <div className="bg-black/70 text-white text-sm sm:text-base px-4 py-3 rounded-xl shadow-lg max-w-xs">
      Still waiting on the correct card backs from Kayou.
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      )}

      {showProductInfo && (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowProductInfo(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
              <button
                onClick={() => setShowProductInfo(false)}
                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                ×
              </button>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#5a3e84] text-center mb-8">
                Fantasy Wonderland — BP01
              </h2>

              {/* Booster Box */}
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
                <img
                  src={fantasyWonderlandBox}
                  alt="Fantasy Wonderland Booster Box"
                  className="w-full max-w-[220px] mx-auto rounded-xl"
                />

                <div className="text-left">
                  <p className="text-gray-500 leading-relaxed">
                    Fantasy Wonderland kicked off with live Kayou US events on May 01, 2026.
                    The box contains 20 booster packs. Though some stores allowed you to buy entire
                    boxes, the intention was for them to sell only packs.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
                  <div className="text-sm uppercase tracking-wider text-gray-400">
                    MSRP
                  </div>
                  <div className="text-2xl font-bold text-[#5a3e84]">
                    $59.80
                  </div>
                </div>
              </div>

              <div className="my-8 border-t border-gray-200" />

              {/* Booster Pack */}
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
                <img
                  src={fantasyWonderlandPack}
                  alt="Fantasy Wonderland Booster Pack"
                  className="w-full max-w-[220px] mx-auto rounded-xl"
                />

                <div className="text-left">
                  <p className="text-gray-500 leading-relaxed">
                    Individual booster packs became available for sale in-person at places
                    like Gamestop, Walmart, Target, Barnes and Noble, and other local game
                    stores.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
                  <div className="text-sm uppercase tracking-wider text-gray-400">
                    MSRP
                  </div>
                  <div className="text-2xl font-bold text-[#5a3e84]">
                    $2.99
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
{showScrollTop && (
  <button
    onClick={() =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
    className="
      fixed
      bottom-32 sm:bottom-6
      right-4 sm:right-6
      z-[99999]
      w-11 h-11
      rounded-full
      bg-gradient-to-r
      from-[#7c5aa6]
      to-[#5a3e84]
      text-[#f5e6a8]
      border border-[#d4af37]/60
      shadow-2xl
      active:scale-95
      transition
      flex items-center justify-center
      hover:brightness-110
    "
    aria-label="Back to top"
  >
    <ChevronUp className="w-5 h-5" />
  </button>
)}
    </div>
  );
};

export default FantasyWonderland;
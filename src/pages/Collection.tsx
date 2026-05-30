import { useParams } from "react-router-dom";
import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { ChevronUp } from "lucide-react";

import moonOneBox from "/set-pictures/moononebox.webp";
import moonOnePack from "/set-pictures/moononepack.webp";

import moonTwoBox from "/set-pictures/moontwobox.webp";
import moonTwoPack from "/set-pictures/moontwopack.webp";
import moonTwoBoxTwo from "/set-pictures/moontwoboxtwo.webp";
import moonTwoCollectorsBox from "/set-pictures/moontwocollectorsbox.webp";

import rainbowOneBox from "/set-pictures/rainbowonebox.webp";
import rainbowOnePack from "/set-pictures/rainbowonepack.webp";

const slugToId: Record<string, string> = {
  "eternal-moon-one": "1",
  "eternal-moon-two": "2",
  "rainbow-one": "5",
};

const Collection = () => {
  const navigate = useNavigate();
  const params = useParams();

const rawId =
  params.id ||
  window.location.pathname.replace("/", "");
const id = slugToId[rawId] || rawId;

const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);
const [celebrated, setCelebrated] = useState(false);
const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

const [viewMode, setViewMode] = useState(false);
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const [isClosingZoom, setIsClosingZoom] = useState(false);
const [showProductInfo, setShowProductInfo] = useState(false);
const [showBackToTop, setShowBackToTop] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);

  const fireConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
  });
};

const toggleFlip = async (key: string) => {
  if (viewMode) {
    const [rarity, numberStr] = key.split("-");
    const number = Number(numberStr);

    const frontSrc = `/cards/${set.folder}/${set.prefix}${getRarityCode(
      rarity
    )}${String(number).padStart(3, "0")}.webp`;

    const backSrc = getCardBack(rarity, number);

    setZoomedCardFlipped(false);
    setZoomedCardBack(backSrc);
    setZoomedCard(frontSrc);
    return;
  }
  const newFlipped = {
    ...flipped,
    [key]: !flipped[key]
  };

  setFlipped(newFlipped);

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) return;

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

  const collapseState: Record<string, boolean> = {};

  Object.entries(set.rarities).forEach(([rarity, count]) => {
    const complete = Array.from(
      { length: count as number },
      (_, i) => saved.progress[`${rarity}-${i + 1}`]
    ).every(Boolean);

    collapseState[rarity] = complete;
  });

  setCollapsed(collapseState);

} else {
  setFlipped({});
  setCollapsed({});
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
      name: "Eternal Moon",
      description: "The first set of Kayou cards to surface in the U.S., found on Target shelves, and the beginning of Kayou's journey to the United States. These cards are now out of print, with less than 200 boxes left in Kayou's stock at this time.",
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
      name: "Eternal Moon",
      description: "The second Eternal Moon set to populate in the United States, bringing success to Kayou's ventures. This 12-pack box turned into many variants to hit shelves in places likes Target, Walmart, Gamestop, and Best Buy. This series introduced the first 'Collector's Box,' and the first ⬦ZR in the United States.",
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
      name: "Rainbow",
      description: "Kayou's first rainbow set to come to the United States, sold exclusively online, with significantly improved hit rates when compared to Chinese boxes. When pulling an XR from his box, you will never pull only one. It is always zero or two. This box was only available online.",
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
  };

  const set = sets[id as keyof typeof sets];

  const dividerTextMap: Record<string, string> = {
  "1": "First Edition",
  "2": "Second Edition",
  "5": "First Edition",
};

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

  useEffect(() => {
  if (!loaded) return;

  const total = cards.length;
  const owned = Object.values(flipped).filter(Boolean).length;

  if (total > 0 && owned === total) {
    fireConfetti();
    setCelebrated(true);
  }
}, [flipped, loaded, celebrated]);

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
  const handleScroll = () => {
    setShowBackToTop(window.scrollY > 600);
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getCardBack = (rarity: string, number: number) => {

  const padded = String(number).padStart(3, "0");

if (rarity === "LSR") {
  return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
}

  // ---------- MOON 1 ----------
  if (set.prefix === "M1") {

    if (rarity === "R") {
      return `/moon-1-other-backs/M1RBK${padded}.webp`;
    }
    if (rarity === "SR") {
      return `/moon-1-other-backs/M1SRB${padded}.webp`;
    }
    if (rarity === "HR") {
      const sideways = [8,9,10,18,19,21,23,27,32,34,36];
      if (sideways.includes(number)) {
        return `/card-backs/M1HRSIDEWAYSBACK.webp`;
      }
      return `/card-backs/M1HRBACK.webp`;
    }
    if (rarity === "SSR") {
      return `/card-backs/M1SSRBACK.webp`;
    }
    if (rarity === "UR") {
      if (number === 16) {
        return `/card-backs/M1URSIDEWAYSBACK.webp`;
      }
      return `/card-backs/M1URBACK.webp`;
    }
    if (rarity === "SGR") {
      return `/card-backs/M1SGRBACK.webp`;
    }
    if (rarity === "SC") {
      if (number === 7) {
        return `/card-backs/M1SCBACK.webp`;
      }
      return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
    }
    if (rarity === "LSR") {
      return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
    }
  }
  // ---------- MOON 2 ----------
  if (set.prefix === "M2") {

    if (rarity === "R") {
      return `/moon-2-other-backs/M2RB${padded}.webp`;
    }

    if (rarity === "SR") {
      return `/moon-2-other-backs/M2SRB${padded}.webp`;
    }

    if (rarity === "HR") {
      if (number <= 22) {
        return `/card-backs/M1SCBACK.webp`;
      }
      return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
    }

    if (rarity === "SSR") {
      return `/card-backs/M2SSRBACK.webp`;
    }

    if (rarity === "UR") {
      return `/card-backs/M1URBACK.webp`;
    }

    if (rarity === "SGR") {
      return `/card-backs/M2SGRBACK.webp`;
    }

    if (rarity === "ZR") {
  return `/card-backs/M2ZRBACK.webp`;
}

    if (rarity === "SC") {
      if (number === 7) {
        return `/card-backs/M2SC007BACK.webp`;
      }
      return `/card-backs/M2SCBACK.webp`;
    }

    if (rarity === "SHINING ZR") {
      return `/card-backs/M2SZRBACK.webp`;
    }

    if (rarity === "LSR") {
      return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
    }
  }
  // ---------- RAINBOW 1 ----------
  if (set.prefix === "R1") {

    if (rarity === "R") {
      return `/rainbow-1-backs/R1RB${padded}.webp`;
    }

    if (rarity === "SR") {
      return `/rainbow-1-backs/R1SRB${padded}.webp`;
    }

    if (rarity === "FR") {
      return `/card-backs/R1FRBACK.webp`;
    }

    if (rarity === "UR") {
      return `/card-backs/M1URBACK.webp`;
    }
if (["TGR","TR","MTR","SSR","USR","XR"].includes(rarity)) {
  return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
}

}

return `/card-backs/M1R-SR-SGR-SCBACK.webp`;
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
  "SHINING ZR": "◇ZR",
  FR: "FR",
  TR: "TR",
  TGR: "TGR",
  MTR: "MTR",
  USR: "USR",
  XR: "XR"
};

const rarityContainerNames: Record<string, string> = {
  R: "RARE CARDS",
  SR: "SUPER RARE CARDS",
  SSR: "SUPER SPARK RARE CARDS",
  HR: "HOLOGRAPHIC RARE CARDS",
  UR: "ULTRA RARE CARDS",
  LSR: "LIMITED SUPER RARE CARDS",
  SGR: "SECRET GOLD RARE CARDS",
  ZR: "ZENITH RARE CARDS",
  SC: "SECRET CARDS",
  "SHINING ZR": "SHINING ZENITH RARE CARD",
  FR: "FUN RARE CARDS",
  TR: "TRANSPARENT RARE CARDS",
  TGR: "TRANSPARENT GOLDEN RARE CARDS",
  MTR: "MIRACLE TRANSPARENT RARE CARDS",
  USR: "ULTRA SPECIAL RARE CARDS",
  XR: "EXTREME RARE CARDS"
};

const isZoomedLandscape = (() => {
  if (!zoomedCard) return false;

  // Eternal Moon 1
  if (set.prefix === "M1") {
    if (
      zoomedCard.includes("M1HR008") ||
      zoomedCard.includes("M1HR009") ||
      zoomedCard.includes("M1HR010") ||
      zoomedCard.includes("M1HR018") ||
      zoomedCard.includes("M1HR019") ||
      zoomedCard.includes("M1HR021") ||
      zoomedCard.includes("M1HR023") ||
      zoomedCard.includes("M1HR027") ||
      zoomedCard.includes("M1HR032") ||
      zoomedCard.includes("M1HR034") ||
      zoomedCard.includes("M1HR036") ||
      zoomedCard.includes("M1UR016") ||
      zoomedCard.includes("M1SC007")
    ) {
      return true;
    }
  }

  // Eternal Moon 2
  if (set.prefix === "M2") {
    if (zoomedCard.includes("M2HR")) {
      const match = zoomedCard.match(/M2HR(\d{3})/);
      if (match && Number(match[1]) <= 22) {
        return true;
      }
    }

    if (
      zoomedCard.includes("M2SC007") ||
      zoomedCard.includes("M2SZR001")
    ) {
      return true;
    }
  }
  // Rainbow 1
  if (set.prefix === "R1") {
    return false;
  }

  return false;
})();

useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setShowLoginModal(true);
    }
  };

  checkAuth();
}, []);

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
          onClick={() => window.history.back()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] font-semibold border border-[#d4af37]/60 hover:brightness-110 transition"
        >
          Return
        </button>

      </div>
    </div>
  );
}

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
  {id === "1" || id === "2" || id === "5" ? (
    <button
      onClick={() => setShowProductInfo(true)}
      className="inline-flex items-center gap-2 hover:text-[#7c5aa6] transition-colors duration-200 cursor-pointer group"
    >
      <span>{set.name}</span>

      {/* Info Icon */}
      <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[#d4af37]/60 text-xs font-bold text-[#8b6a2b] bg-[#fffaf0] group-hover:bg-[#f8f0ff] group-hover:border-[#7c5aa6]/40 group-hover:text-[#5a3e84] transition">
        i
      </span>
    </button>
  ) : (
    set.name
  )}
</h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 my-5">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        {dividerTextMap[id] || "Collection Archive"}
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      {set.description}
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
                const group = cards.filter(c => c.rarity === r);
                const done = group.every(c =>
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
                        <img
                          src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.webp`}
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
                src={zoomedCardBack || "/card-backs/M1R-SR-SGR-SCBACK.webp"}
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
            </div>
          </div>
        </div>
      )}
{showProductInfo && (id === "1" || id === "2" || id === "5") && (
  <div
    className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setShowProductInfo(false)}
  >
<div
  className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full relative overflow-hidden"
  onClick={(e) => e.stopPropagation()}
>
  <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
      {/* Close Button */}
      <button
        onClick={() => setShowProductInfo(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        ×
      </button>

      {/* ========================= MOON 1 ========================= */}
      {id === "1" && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#5a3e84] text-center mb-8">
            Eternal Moon — First Edition Products
          </h2>

          {/* Booster Box */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
            <img
              src={moonOneBox}
              alt="Eternal Moon First Edition Booster Box"
              className="w-full max-w-[220px] mx-auto rounded-xl"
            />

            <div className="text-left">
              <p className="text-gray-500 leading-relaxed">
                The only box released of Moon One was a 24-pack box that came
                with the Amplified Emotions promotional card. It first became
                available in the U.S. in late October of 2025.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
              <div className="text-sm uppercase tracking-wider text-gray-400">
                MSRP
              </div>
              <div className="text-2xl font-bold text-[#5a3e84]">
                $95.76
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          {/* Booster Pack */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
            <img
              src={moonOnePack}
              alt="Eternal Moon First Edition Booster Pack"
              className="w-full max-w-[220px] mx-auto rounded-xl"
            />

            <div className="text-left">
              <p className="text-gray-500 leading-relaxed">
                Individual retail packs could be found on shelves from October
                of 2025 to March of 2026. After that, they became scarce unless
                special-ordered online from Kayou US or CrossingTCG.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
              <div className="text-sm uppercase tracking-wider text-gray-400">
                MSRP
              </div>
              <div className="text-2xl font-bold text-[#5a3e84]">
                $3.99
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================= MOON 2 ========================= */}
      {id === "2" && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#5a3e84] text-center mb-8">
            Eternal Moon — Second Edition Products
          </h2>

          {/* 12-Pack Booster Box */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
            <img
              src={moonTwoBox}
              alt="Eternal Moon Second Edition 12-Pack Booster Box"
              className="w-full max-w-[220px] mx-auto rounded-xl"
            />

            <div className="text-left">
              <p className="text-gray-500 leading-relaxed">
                The original 12-pack box of Moon Two that launched in the U.S. not long
                after Moon One, introducing ZR and ◇ZR into the American market.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
              <div className="text-sm uppercase tracking-wider text-gray-400">
                MSRP
              </div>
              <div className="text-2xl font-bold text-[#5a3e84]">
                $47.88
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          {/* Booster Pack */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
            <img
              src={moonTwoPack}
              alt="Eternal Moon Second Edition Booster Pack"
              className="w-full max-w-[220px] mx-auto rounded-xl"
            />

            <div className="text-left">
              <p className="text-gray-500 leading-relaxed">
                These single packs showed up at Gamestop, Target, Walmart, and many
                other in-person markets as Kayou began to plant their feet in the
                U.S. market.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
              <div className="text-sm uppercase tracking-wider text-gray-400">
                MSRP
              </div>
              <div className="text-2xl font-bold text-[#5a3e84]">
                $3.99
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          {/* Alternate Booster Box */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
            <img
              src={moonTwoBoxTwo}
              alt="Eternal Moon Second Edition Alternate Booster Box"
              className="w-full max-w-[220px] mx-auto rounded-xl"
            />

            <div className="text-left">
              <p className="text-gray-500 leading-relaxed">
                A secondary box of Moon Two appeared that had a chance of
                pulling the Andy Price promo, which only 20 of exist. It is the
                Twilight Sparkle promo (MLPE-PR-005) with Andy Price's signature
                in the top left corner.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
              <div className="text-sm uppercase tracking-wider text-gray-400">
                MSRP
              </div>
              <div className="text-2xl font-bold text-[#5a3e84]">
                $47.88
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          {/* Collector's Box */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
            <img
              src={moonTwoCollectorsBox}
              alt="Eternal Moon Second Edition Collector's Box"
              className="w-full max-w-[220px] mx-auto rounded-xl"
            />

            <div className="text-left">
              <p className="text-gray-500 leading-relaxed">
                The first collectors' box, appeared only online at Target and
                in Best Buys. Features five packs of Moon Two. There are no recorded
                special hit rates for this box that are outstanding from the other
                boxes.
                </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
              <div className="text-sm uppercase tracking-wider text-gray-400">
                MSRP
              </div>
              <div className="text-2xl font-bold text-[#5a3e84]">
                $24.99
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================= RAINBOW 1 ========================= */}
{id === "5" && (
  <>
    <h2 className="text-2xl sm:text-3xl font-bold text-[#5a3e84] text-center mb-8">
      Rainbow — First Edition Products
    </h2>

    {/* Booster Box */}
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
      <img
        src={rainbowOneBox}
        alt="Rainbow First Edition Booster Box"
        className="w-full max-w-[220px] mx-auto rounded-xl"
      />

      <div className="text-left">
        <p className="text-gray-500 leading-relaxed">
          The first Rainbow box released as an online-order exclusive from Kayou US
          or CrossingTCG. This box was never released in-person at any stores, and carried
          the Power Ponies promotional card.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
        <div className="text-sm uppercase tracking-wider text-gray-400">
          MSRP
        </div>
        <div className="text-2xl font-bold text-[#5a3e84]">
          $39.80
        </div>
      </div>
    </div>

    <div className="my-8 border-t border-gray-200" />

    {/* Booster Pack */}
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
      <img
        src={rainbowOnePack}
        alt="Rainbow First Edition Booster Pack"
        className="w-full max-w-[220px] mx-auto rounded-xl"
      />

      <div className="text-left">
        <p className="text-gray-500 leading-relaxed">
          Individual packs were not available for sale.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
        <div className="text-sm uppercase tracking-wider text-gray-400">
          MSRP
        </div>
        <div className="text-2xl font-bold text-[#5a3e84]">
          NONE
        </div>
      </div>
    </div>
  </>
)}

    </div>
  </div>
        </div>
)}
{showBackToTop && (
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

export default Collection;
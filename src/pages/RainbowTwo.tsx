import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { ChevronUp } from "lucide-react";

import rainbowTwoBox from "/set-pictures/rainbowtwobox.webp";
import rainbowTwoPack from "/set-pictures/rainbowtwopack.webp";

const RainbowTwo = () => {
  const navigate = useNavigate();

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
  BASE: true,
  R: true,
  SR: true,
  ST: true,
  SSR: true,
  FR: true,
  TR: true,
  TGR: true,
  UR: true,
  USR: true,
  XR: true,
});
const [loaded, setLoaded] = useState(false);
const [lastSavedProgress, setLastSavedProgress] = useState("");

  const [viewMode, setViewMode] = useState(false);

  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
  const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

const [showProductInfo, setShowProductInfo] = useState(false);

  const set = {
    name: "Rainbow",
    folder: "rainbow-two",
    prefix: "R2",

    rarities: {
  BASE: 18,
  R: 30,
  SR: 14,
  ST: 20,
  SSR: 15,
  FR: 18,
  TR: 12,
  TGR: 8,
  UR: 19,
  USR: 8,
  XR: 8,
},

    rarityNames: {
      R: "RARE CARDS",
      SR: "SUPER RARE CARDS",
      ST: "STICKER CARDS",
      SSR: "SUPER SPARK RARE CARDS",
      FR: "FUN RARE CARDS",
      TR: "TRANSPARENT RARE CARDS",
      TGR: "TRANSPARENT GOLD RARE CARDS",
      UR: "ULTRA RARE CARDS",
      USR: "ULTRA SPECIAL RARE CARDS",
      XR: "EXTREME RARE CARDS",
    },
  };

  const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1,
    }))
  );

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  const toggleFlip = (key: string) => {
    if (viewMode) {
      const [rarity, numberStr] = key.split("-");
      const number = Number(numberStr);

      const frontSrc = `/cards/${set.folder}/${set.prefix}${rarity}${String(
  number
).padStart(3, "0")}${
  rarity === "ST" ||
  rarity === "TR" ||
  rarity === "TGR"
    ? ".webp"
    : ".webp"
}`;

      const backSrc = getCardBack(rarity, number);

      setZoomedCardFlipped(false);
      setZoomedCard(frontSrc);
      setZoomedCardBack(backSrc);

      return;
    }

    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleCollapse = (rarity: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [rarity]: !prev[rarity],
    }));
  };

const getCardBack = (rarity: string, number?: number) => {

  // BASE
  if (rarity === "BASE") {
    return "/card-backs/rainbow-two/R2BASEBACKS.webp";
  }

  // R (individual backs)
  if (rarity === "R" && number) {
    return `/card-backs/rainbow-two/R2BACKR${String(number).padStart(3, "0")}.webp`;
  }

  // SR
  if (rarity === "SR") {
    return "/card-backs/rainbow-two/R2SRBACK.webp";
  }

  // SSR
  if (rarity === "SSR") {
    return "/card-backs/rainbow-two/R2SSRBACK.webp";
  }

  // UR
  if (rarity === "UR") {
    return "/card-backs/rainbow-two/R2URBACK.webp";
  }

// FR
if (rarity === "FR") {
  return "/card-backs/rainbow-two/R2FRBACK.webp";
}

// USR / ST / TR / TGR
if (
  rarity === "USR" ||
  rarity === "ST" ||
  rarity === "TR" ||
  rarity === "TGR"
) {
  return "/card-backs/rainbow-two/R2USRBACK.webp";
}

  // XR special split
  if (rarity === "XR") {

    if ((number || 0) <= 6) {
      return "/card-backs/rainbow-two/R2XRBACK1.webp";
    }

    return "/card-backs/rainbow-two/R2XRBACK2.webp";
  }

  // fallback
  return "/card-backs/rainbow-two/R2SRBACK.webp";
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
          .eq("set_id", "6")
          .single();

if (saved?.progress) {
  setFlipped(saved.progress);
  setLastSavedProgress(JSON.stringify(saved.progress));

  const newCollapsed: Record<string, boolean> = {};

  Object.entries(set.rarities).forEach(([rarity, count]) => {
    let complete = true;

    for (let i = 1; i <= (count as number); i++) {
      if (!saved.progress[`${rarity}-${i}`]) {
        complete = false;
        break;
      }
    }

    newCollapsed[rarity] = complete;
  });

  setCollapsed(newCollapsed);

} else {
  setFlipped({});
  setLastSavedProgress("{}");

  setCollapsed({
    BASE: false,
    R: false,
    SR: false,
    ST: false,
    SSR: false,
    FR: false,
    TR: false,
    TGR: false,
    UR: false,
    USR: false,
    XR: false,
  });
}
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

  const current = JSON.stringify(flipped);

  if (current === lastSavedProgress) return;

  const saveProgress = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    const { error } = await supabase
      .from("collection_progress_raw")
      .upsert(
        {
          user_id: user.id,
          set_id: "6",
          progress: flipped,
        },
        { onConflict: "user_id,set_id" }
      );

    if (error) {
      console.error("SAVE ERROR:", error);
    }

    setLastSavedProgress(current);
  };

  saveProgress();
}, [flipped, loaded, lastSavedProgress]);

  // SCROLL BUTTON
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // LOCK SCROLL WHEN ZOOMED
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (zoomedCard) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      html.style.overflow = "";
      body.style.overflow = "";
    }

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, [zoomedCard]);

  // CONFETTI
  useEffect(() => {
    const owned = Object.values(flipped).filter(Boolean).length;

    if (owned === cards.length && cards.length > 0) {
      fireConfetti();
    }
  }, [flipped]);

useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setShowLoginModal(true);
    }
  };

  checkAuth();
}, []);

  const isZoomedLandscape = (() => {
  if (!zoomedCard) return false;

  // XR007 is horizontal
  if (zoomedCard.includes("R2XR007")) {
    return true;
  }

  return false;
})();

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

  {/* Center */}
  <div className="flex-1 text-center">

   <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5a3e84] leading-tight">
  <button
    onClick={() => setShowProductInfo(true)}
    className="inline-flex items-center gap-2 hover:text-[#7c5aa6] transition-colors duration-200 cursor-pointer group"
  >
    <span>{set.name}</span>

    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[#d4af37]/60 text-xs font-bold text-[#8b6a2b] bg-[#fffaf0] group-hover:bg-[#f8f0ff] group-hover:border-[#7c5aa6]/40 group-hover:text-[#5a3e84] transition">
      i
    </span>
  </button>
</h1>

    <div className="flex items-center justify-center gap-2 sm:gap-4 my-5">
      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

      <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase text-center">
        Second Edition
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      Rainbow Two released in the U.S. in May of 2026, becoming the first U.S. set to contain BASE and ST cards.
    </p>

  </div>

  {/* View Button */}
  <button
    onClick={() => setViewMode(!viewMode)}
    className="self-center sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
  >
    <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
      {viewMode ? "Exit View" : "View Set"}
    </span>
  </button>

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

          const y =
            el.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({
            top: y,
            behavior: "smooth",
          });
        }}
        className={`px-3 py-1 text-xs md:text-sm rounded-full border transition-all ${
          complete
            ? "bg-[#5a3e84] text-white border-[#5a3e84]"
            : "border-[#d4af37] text-[#5a3e84] hover:bg-[#f5e6ff]"
        }`}
      >
        {rarity}
      </button>
    );
  })}
</div>

        {/* RARITIES */}
        {Object.entries(set.rarities).map(([rarity, count]) => (
          <div
  key={rarity}
  id={`rarity-${rarity}`}
  className="mb-10"
>

            <div className="relative bg-white border border-gray-200 rounded-xl p-3 md:p-4 pt-8 overflow-visible">

              <button
                onClick={() => toggleCollapse(rarity)}
                className="absolute top-2 right-2"
              >
                {collapsed[rarity] ? "+" : "−"}
              </button>

              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 md:px-4 text-[11px] md:text-lg font-semibold text-gray-700 text-center leading-tight max-w-[85%] md:max-w-none whitespace-normal md:whitespace-nowrap">
  {set.rarityNames?.[rarity] || rarity}
</div>

              {!collapsed[rarity] && (
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">

                  {Array.from({ length: count as number }, (_, i) => {
                    const number = i + 1;

                    const key = `${rarity}-${number}`;

                    const isFlipped =
                      !viewMode && flipped[key];

                    return (
                      <div
                        key={key}
                        className="aspect-[5/7] cursor-pointer relative"
                        onClick={() => toggleFlip(key)}
                      >

                       <div
  className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
    isFlipped ? "rotate-y-180" : ""
  }`}
>

  {/* FRONT */}
  <img
    src={`/cards/${set.folder}/${set.prefix}${rarity}${String(
  number
).padStart(3, "0")}${
  rarity === "ST" ||
  rarity === "TR" ||
  rarity === "TGR"
    ? ".webp"
    : ".webp"
}`}
    className="absolute w-full h-full object-cover rounded-lg backface-hidden"
  />

  {/* BACK */}
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

      </div>

      {/* ZOOM MODAL */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setZoomedCard(null)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              setZoomedCardFlipped(!zoomedCardFlipped);
            }}
          >

            <div
  style={{ perspective: "1200px" }}
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
      src={zoomedCardBack || ""}
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
          Rainbow — Second Edition Products
        </h2>

        {/* Booster Box */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
          <img
            src={rainbowTwoBox}
            alt="Rainbow Second Edition Booster Box"
            className="w-full max-w-[220px] mx-auto rounded-xl"
          />

          <div className="text-left">
            <p className="text-gray-500 leading-relaxed">
              Rainbow Second Edition booster boxes contain 24 packs and introduced BASE and ST cards for the first time in the U.S.
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
            src={rainbowTwoPack}
            alt="Rainbow Second Edition Booster Pack"
            className="w-full max-w-[220px] mx-auto rounded-xl"
          />

          <div className="text-left">
            <p className="text-gray-500 leading-relaxed">
              Individual Rainbow Second Edition packs contain 5 cards per pack.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
            <div className="text-sm uppercase tracking-wider text-gray-400">
              MSRP
            </div>
            <div className="text-2xl font-bold text-[#5a3e84]">
              $1.99
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* SCROLL TO TOP */}
      {showScrollTop && (
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="fixed bottom-6 right-6 z-[99999] w-11 h-11 rounded-full bg-[#5a3e84] text-white flex items-center justify-center"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

    </div>
  );
};

export default RainbowTwo;
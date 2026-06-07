import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ChevronUp } from "lucide-react";

import moonThreeBox from "/set-pictures/mooonthreebox.webp";
import moonThreePack from "/set-pictures/moonthreepack.webp";

const Moon3 = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);
const [lastSavedProgress, setLastSavedProgress] = useState("");
const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
const [showProductInfo, setShowProductInfo] = useState(false);
const [showScrollTop, setShowScrollTop] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);

const [viewMode, setViewMode] = useState(false);
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);

const toggleFlip = (key: string) => {
  // In View Set mode, open zoom modal instead of marking ownership
  if (viewMode) {
    const [rarity, numberStr] = key.split("-");
    const number = Number(numberStr);

    const frontSrc =
      `/cards/third-edition-moon/${set.prefix}${rarity}${String(number).padStart(3, "0")}.webp`;

    const backSrc = getCardBack(rarity, number);

    setZoomedCardFlipped(false);
    setZoomedCardBack(backSrc);
    setZoomedCard(frontSrc);
    return;
  }

  // Normal mode: mark owned/unowned
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
    N: false,
    SN: false,
    R: false,
    SR: false,
    SSR: false,
    UR: false,
    UGR: false,
    CR: false,
  });
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
          set_id: "3",
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

useEffect(() => {
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 400);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

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
    return `/card-backs/third-moon-edition-backs/M3SZR001BACK.webp`;
  }
    if (rarity === "SZR" && number >= 2 && number <= 3) {
    return `/card-backs/third-moon-edition-backs/moon3zrback2.webp`;
  }
    if (rarity === "SC") {
    return `/card-backs/third-moon-edition-backs/m3scback.webp`;
  }
    if (rarity === "ZR" && number === 14) {
    return `/card-backs/third-moon-edition-backs/moon3sdzrback2.webp`;
  }
  if (rarity === "ZR" && number >= 8 && number <= 13) {
    return `/card-backs/third-moon-edition-backs/moon3zrback2.webp`;
  }
  if (rarity === "ZR" && number >= 1 && number <= 7) {
    return `/card-backs/third-moon-edition-backs/m3zrback1.webp`;
  }
  if (rarity === "UR" && number >= 15 && number <= 18) {
    return `/card-backs/third-moon-edition-backs/moon3sdurback.webp`;
  }
  if (rarity === "UR" && number >= 1 && number <= 14) {
    return `/card-backs/third-moon-edition-backs/moon3urback.webp`;
  }
    if (rarity === "SGR" && number >= 1 && number <= 8) {
    return `/card-backs/third-moon-edition-backs/moon3sgrback1.webp`;
  }
  if (rarity === "SGR" && number >= 9 && number <= 16) {
    return `/card-backs/third-moon-edition-backs/moon3sgrback2.webp`;
  }
    if (
    rarity === "HR" &&
    ((number >= 1 && number <= 22) ||
     (number >= 31 && number <= 52))
  ) {
    return `/card-backs/third-moon-edition-backs/moon3sdhrback.webp`;
  }
    if (rarity === "SR") {
    return `/card-backs/third-moon-edition-backs/moon3srback.webp`;
  }
      if (rarity === "SSR") {
    return `/card-backs/third-moon-edition-backs/moon3ssrback.webp`;
  }
  return `/card-backs/third-moon-edition-backs/moon3defaultback.webp`;
};

const isZoomedLandscape =
  zoomedCard &&
  (
    // HR001-HR022
    /M3HR0(0[1-9]|1[0-9]|2[0-2])\.webp$/.test(zoomedCard) ||

    // HR031-HR052
    /M3HR0(3[1-9]|4[0-9]|5[0-2])\.webp$/.test(zoomedCard) ||

    // UR015-UR018
    /M3UR0(1[5-8])\.webp$/.test(zoomedCard) ||

    // ZR014
    /M3ZR014\.webp$/.test(zoomedCard)
  );

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
    <span>{set.name}</span>

    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[#d4af37]/60 text-xs font-bold text-[#8b6a2b] bg-[#fffaf0] group-hover:bg-[#f8f0ff] group-hover:border-[#7c5aa6]/40 group-hover:text-[#5a3e84] transition">
      i
    </span>
  </button>
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
                  const isFlipped = !viewMode && flipped[key];
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
                          src={`/cards/third-edition-moon/${set.prefix}${card.rarity}${String(card.number).padStart(3, "0")}.webp`}
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
    className="fixed inset-0 z-[9999] transform-none bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
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
          src={
            zoomedCardBack ||
            "/card-backs/third-moon-edition-backs/moon3defaultback.webp"
          }
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
          Eternal Moon — Third Edition Products
        </h2>

        {/* Booster Box */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
          <img
            src={moonThreeBox}
            alt="Eternal Moon Third Edition Booster Box"
            className="w-full max-w-[220px] mx-auto rounded-xl"
          />

          <div className="text-left">
            <p className="text-gray-500 leading-relaxed">
              Eternal Moon Third Edition booster boxes contain 12 packs and
              introduced the First Edition stamp on the earliest print run only.
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
            src={moonThreePack}
            alt="Eternal Moon Third Edition Booster Pack"
            className="w-full max-w-[220px] mx-auto rounded-xl"
          />

          <div className="text-left">
            <p className="text-gray-500 leading-relaxed">
              Individual booster packs contain 8 cards and were not sold separately.
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

export default Moon3;
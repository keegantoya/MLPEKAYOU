import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ChevronUp } from "lucide-react";
import { calculateCollectionTotal } from "@/lib/CalculateCollectionTotal";

import funMomentsOneBox from "/set-pictures/funmomentsonebox.webp";
import funMomentsOnePack from "/set-pictures/funmomentsonepack.webp";

const FunMoments1 = () => {
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
    const [rarity, numberStr] = key.split("-");
    const number = Number(numberStr);

    const frontSrc =
      `/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3, "0")}.webp`;

    const backSrc = getCardBack(rarity, number);

    setZoomedCardFlipped(false);
    setZoomedCardBack(backSrc);
    setZoomedCard(frontSrc);
    return;
  }

  // Normal Mode: toggle ownership
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

    console.log("ACTUAL USER ID:", user?.id);

    if (user) {
      const { data: saved } = await supabase
        .from("collection_progress_raw")
        .select("progress")
        .eq("user_id", user.id)
        .eq("set_id", "7")
        .single();

      console.log("LOADED PROGRESS:", saved);

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

  // initial load
  loadProgress();

  // 🔥 listen for login/logout
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

    const { error } = await supabase
      .from("collection_progress_raw")
      .upsert(
        {
          user_id: user.id,
          set_id: "7",
          progress: flipped
        },
        { onConflict: "user_id,set_id" }
      );
      const { data: allProgress } = await supabase
  .from("collection_progress_raw")
  .select("user_id, progress")
  .eq("user_id", user.id);

if (allProgress) {
  const total = calculateCollectionTotal(
    user.id,
    allProgress
  );

  await supabase
    .from("profiles")
    .update({
      collection_total: total
    })
    .eq("id", user.id);
}

    console.log("SAVE ERROR:", error);

    const { data: check } = await supabase
      .from("collection_progress_raw")
      .select("*")
      .eq("user_id", user.id)
      .eq("set_id", "7");

    console.log("AFTER SAVE:", check);
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

  const set = {
    name: "Fun Moments",
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
    },
    rarityNames: {
  N: "EPISODE CARDS",
  SN: "SHINING EPISODE CARDS",
  R: "RARE CARDS",
  SR: "SUPER RARE CARDS",
  SSR: "SUPER SPARK RARE CARDS",
  UR: "ULTRA RARE CARDS",
  CR: "CREATIVE RARE CARDS"
}
  };

  useEffect(() => {
  if (!loaded) return;

  const newCollapsed: Record<string, boolean> = {};

  Object.entries(set.rarities).forEach(([rarity, count]) => {
    let complete = true;

    for (let i = 1; i <= (count as number); i++) {
      if (!flipped[`${rarity}-${i}`]) {
        complete = false;
        break;
      }
    }

    newCollapsed[rarity] = complete;
  });

  setCollapsed(newCollapsed);
}, [flipped, loaded]);

  const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1
    }))
  );

  const getCardBack = (rarity: string, number: number) => {
    if (rarity === "N" || rarity === "SN") {
      return `/fun-moments-one-backs/FM1BACKN${String(number).padStart(3, "0")}.webp`;
    }

    if (rarity === "R") {
      return `/fun-moments-one-backs/FM1RB${String(number).padStart(3, "0")}.webp`;
    }

    if (rarity === "SR") {
      return `/fun-moments-one-backs/FM1SRB${String(number).padStart(3, "0")}.webp`;
    }

    if (rarity === "UR") {
      return "/card-backs/M1URBACK.webp";
    }

    if (rarity === "CR") {
      if (number <= 9) {
        return "/fun-moments-one-backs/FM1CRBACK001.webp";
      }
      return "/fun-moments-one-backs/FM1CRBACK002.webp";
    }

    return "/card-backs/M1R-SR-SGR-SCBACK.webp";
  };

const isZoomedLandscape =
  zoomedCard &&
  (
    zoomedCard.includes("FM1N") ||
    zoomedCard.includes("FM1SN") ||
    zoomedCard.includes("FM1CR010") ||
    zoomedCard.includes("FM1CR011") ||
    zoomedCard.includes("FM1CR012")
  );

  useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setShowLoginModal(true);
    }
  };

  checkAuth();
}, []);

  useEffect(() => {
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 400);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
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
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
<div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-0 mb-8 mt-6 sm:mt-0">

  {/* Back Button */}
  <button
    onClick={() => window.location.href = "/collections"}
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
        First Edition
      </span>

      <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
    </div>

    <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
      This series of Fun Moments was the first to hit North America. It is only
      available online, and differs from the Chinese boxes due to its hit rate
      of 1 CR guaranteed per box.
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
    {/* BUTTONS */}
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
            {rarity === "SN" ? "◇N" : rarity}
          </button>
        );
      })}
    </div>

    {/* RARITY SECTIONS */}
    {Object.entries(set.rarities).map(([rarity, count]) => (
      <div key={rarity} id={`rarity-${rarity}`} className="mb-10">

        <div className="relative bg-white border border-gray-200 rounded-xl p-3 md:p-4 pt-8 overflow-visible">

          {/* collapse button */}
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

          {/* label */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 md:px-4 text-[11px] md:text-lg font-semibold text-gray-700 text-center leading-tight max-w-[85%] md:max-w-none whitespace-normal md:whitespace-nowrap">
            {set.rarityNames?.[rarity] || rarity}
          </div>

          {/* grid */}
          {!collapsed[rarity] && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Array.from({ length: count as number }, (_, i) => {
                const number = i + 1;
                const key = `${rarity}-${number}`;
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
                        src={`/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3, "0")}.webp`}
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
    ? "rotateY(180deg) rotate(90deg)"
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
                Fun Moments — First Edition Products
              </h2>

              {/* Booster Box */}
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
                <img
                  src={funMomentsOneBox}
                  alt="Fun Moments First Edition Booster Box"
                  className="w-full max-w-[220px] mx-auto rounded-xl"
                />

                <div className="text-left">
                  <p className="text-gray-500 leading-relaxed">
                    The first Fun Moments box appeared as an online-exclusive,
                    featuring 12-pack boxes. Each box had
                    a guaranteed CR card.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
                  <div className="text-sm uppercase tracking-wider text-gray-400">
                    MSRP
                  </div>
                  <div className="text-2xl font-bold text-[#5a3e84]">
                    $23.88
                  </div>
                </div>
              </div>

              <div className="my-8 border-t border-gray-200" />

              {/* Booster Pack */}
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
                <img
                  src={funMomentsOnePack}
                  alt="Fun Moments First Edition Booster Pack"
                  className="w-full max-w-[220px] mx-auto rounded-xl"
                />

                <div className="text-left">
                  <p className="text-gray-500 leading-relaxed">
                    Individual booster packs were not available for sale.
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

export default FunMoments1;
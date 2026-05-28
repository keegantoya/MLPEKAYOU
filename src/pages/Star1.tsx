import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { ChevronUp } from "lucide-react";

import starOneBox from "/set-pictures/staronebox.jpg";
import starOnePacks from "/set-pictures/staronepacks.jpg";

const Star1 = () => {
  const navigate = useNavigate();

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const [viewMode, setViewMode] = useState(false);

  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
  const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  const [showProductInfo, setShowProductInfo] = useState(false);

  const set = {
    name: "Eternal Star",
    folder: "star-one",
    prefix: "S1",

rarities: {
  SSR: 20,
  SCR: 18,
  UR: 18,
  USR: 15,
  AR: 9,
  OR: 7,
  BP: 9,
  SAR: 9,
},

    rarityNames: {
      SAR: "SHINING ART RARE CARDS",
      OR: "ORIGIN RARE CARDS",
      BP: "BRILLIANT PRINT CARDS",
      AR: "ART RARE CARDS",
      USR: "ULTRA SPECIAL RARE CARDS",
      UR: "ULTRA RARE CARDS",
      SCR: "SKETCH RARE CARDS",
      SSR: "SUPER SPARK RARE CARDS",
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

const getCardBack = (rarity: string, number?: number) => {

  // SAR
  if (rarity === "SAR") {
    return "/card-backs/star-one/S1SARBACK.jpg";
  }

  // OR
  if (rarity === "OR") {
    return "/card-backs/star-one/S1ORBACK.jpg";
  }

  // BP (individual backs)
  if (rarity === "BP" && number) {
    return `/card-backs/star-one/S1BPBACK${String(number).padStart(3, "0")}.jpg`;
  }

  // AR
  if (rarity === "AR") {
    return "/card-backs/star-one/S1ARBACK.jpg";
  }

  // USR special split
  if (rarity === "USR") {

    const specialBack2 = [1, 3, 6, 13, 14];

    if (number && specialBack2.includes(number)) {
      return "/card-backs/star-one/S1USRBACK2.jpg";
    }

    return "/card-backs/star-one/S1USRBACK1.jpg";
  }

  // UR
  if (rarity === "UR") {
    return "/card-backs/star-one/S1URBACK.jpg";
  }

  // SCR
  if (rarity === "SCR") {
    return "/card-backs/star-one/S1SCRBACK.jpg";
  }

  // SSR
  if (rarity === "SSR") {
    return "/card-backs/star-one/S1SSRBACK.jpg";
  }

  // fallback
  return "/card-backs/star-one/S1SSRBACK.jpg";
};

  const toggleFlip = (key: string) => {
    if (viewMode) {
      const [rarity, numberStr] = key.split("-");
      const number = Number(numberStr);

      const frontSrc = `/cards/${set.folder}/${set.prefix}${rarity}${String(
        number
      ).padStart(3, "0")}.jpg`;

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
          .eq("set_id", "4")
          .single();

        if (saved?.progress) {
          setFlipped(saved.progress);
        } else {
          setFlipped({});
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

    const saveProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      await supabase
        .from("collection_progress_raw")
        .upsert(
          {
            user_id: user.id,
            set_id: "4",
            progress: flipped,
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

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

  const isZoomedLandscape = (() => {
  if (!zoomedCard) return false;

  // Special landscape USRs
  if (
    zoomedCard.includes("S1USR001") ||
    zoomedCard.includes("S1USR003") ||
    zoomedCard.includes("S1USR006") ||
    zoomedCard.includes("S1USR013") ||
    zoomedCard.includes("S1USR014")
  ) {
    return true;
  }

  return false;
})();

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
                First Volume
              </span>

              <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
            </div>

            <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed px-2">
              Eternal Star debuted in the U.S. in 2026 with 105 cards across 8 rarity tiers.
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

        {/* NAV BUTTONS */}
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
                {rarity === "SAR" ? "◇AR" : rarity}
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
                            ).padStart(3, "0")}.jpg`}
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
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedCard(null)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              setZoomedCardFlipped(!zoomedCardFlipped);
            }}
          >

            <div style={{ perspective: "1200px" }}>
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
          Eternal Star — First Volume Products
        </h2>

        {/* Booster Box */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
          <img
            src={starOneBox}
            alt="Eternal Star First Volume Booster Box"
            className="w-full max-w-[220px] mx-auto rounded-xl"
          />

          <div className="text-left">
            <p className="text-gray-500 leading-relaxed">
              The Eternal Star One box contains 16 packs in the box, each pack contains 3 cards. This is the first U.S. Edition of Kayou's "premium" sets.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
            <div className="text-sm uppercase tracking-wider text-gray-400">
              MSRP
            </div>
            <div className="text-2xl font-bold text-[#5a3e84]">
              $127.84
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200" />

        {/* Booster Pack */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 sm:gap-6 items-center text-center md:text-left">
          <img
            src={starOnePacks}
            alt="Eternal Star First Volume Booster Packs"
            className="w-full max-w-[220px] mx-auto rounded-xl"
          />

          <div className="text-left">
            <p className="text-gray-500 leading-relaxed">
              Individual Eternal Star packs contain 3 cards per pack (1 pack per small box) and were sold individually at brick-and-mortar stores in the U.S.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[#faf7ff] border border-[#e9def7] rounded-2xl px-6 py-4 min-w-[140px] mx-auto md:mx-0">
            <div className="text-sm uppercase tracking-wider text-gray-400">
              MSRP
            </div>
            <div className="text-2xl font-bold text-[#5a3e84]">
              $7.99
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

export default Star1;
import { useParams } from "react-router-dom";
import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

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

  const fireConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
  });
};

const toggleFlip = async (key: string) => {
  // View Mode: open the zoomed card instead of marking ownership
  if (viewMode) {
    const [rarity, numberStr] = key.split("-");
    const number = Number(numberStr);

    const frontSrc = `/cards/${set.folder}/${set.prefix}${getRarityCode(
      rarity
    )}${String(number).padStart(3, "0")}.jpg`;

    const backSrc = getCardBack(rarity, number);

    setZoomedCardFlipped(false);
    setZoomedCardBack(backSrc);
    setZoomedCard(frontSrc);
    return;
  }

  // Normal Mode: toggle ownership and save to Supabase
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

  // LOAD PROGRESS
  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user) {
        const { data: saved } = await supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", id)
          .single();

        if (saved?.progress) {
          setFlipped(saved.progress);
        }
      }

      setLoaded(true);
    };

    loadProgress();
  }, [id]);

  // SAVE PROGRESS ( RELOAD AFTER LOGIN )
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

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getCardBack = (rarity: string, number: number) => {

  const padded = String(number).padStart(3, "0");

// Force default for LSR
if (rarity === "LSR") {
  return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
}

  // ---------- MOON 1 ----------
  if (set.prefix === "M1") {

    // R (individual backs)
    if (rarity === "R") {
      return `/moon-1-other-backs/M1RBK${padded}.jpg`;
    }

    // SR (individual backs)
    if (rarity === "SR") {
      return `/moon-1-other-backs/M1SRB${padded}.jpg`;
    }

    // HR
    if (rarity === "HR") {
      const sideways = [8,9,10,18,19,21,23,27,32,34,36];
      if (sideways.includes(number)) {
        return `/card-backs/M1HRSIDEWAYSBACK.jpg`;
      }
      return `/card-backs/M1HRBACK.jpeg`;
    }

    // SSR
    if (rarity === "SSR") {
      return `/card-backs/M1SSRBACK.jpeg`;
    }

    // UR
    if (rarity === "UR") {
      if (number === 16) {
        return `/card-backs/M1URSIDEWAYSBACK.jpg`;
      }
      return `/card-backs/M1URBACK.jpeg`;
    }

    // SGR
    if (rarity === "SGR") {
      return `/card-backs/M1SGRBACK.jpeg`;
    }

    // SC
    if (rarity === "SC") {
      if (number === 7) {
        return `/card-backs/M1SCBACK.jpeg`;
      }
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }

    // LSR default
    if (rarity === "LSR") {
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }
  }

  // ---------- MOON 2 ----------
  if (set.prefix === "M2") {

    if (rarity === "R") {
      return `/moon-2-other-backs/M2RB${padded}.jpg`;
    }

    if (rarity === "SR") {
      return `/moon-2-other-backs/M2SRB${padded}.jpg`;
    }

    if (rarity === "HR") {
      if (number <= 22) {
        return `/card-backs/M1SCBACK.jpeg`;
      }
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }

    if (rarity === "SSR") {
      return `/card-backs/M2SSRBACK.jpg`;
    }

    if (rarity === "UR") {
      return `/card-backs/M1URBACK.jpeg`;
    }

    if (rarity === "SGR") {
      return `/card-backs/M2SGRBACK.jpg`;
    }

    if (rarity === "ZR") {
  return `/card-backs/M2ZRBACK.jpeg`;
}

    if (rarity === "SC") {
      if (number === 7) {
        return `/card-backs/M2SC007BACK.jpg`;
      }
      return `/card-backs/M2SCBACK.jpeg`;
    }

    if (rarity === "SHINING ZR") {
      return `/card-backs/M2SZRBACK.jpg`;
    }

    if (rarity === "LSR") {
      return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
    }
  }

  // ---------- RAINBOW 1 ----------
  if (set.prefix === "R1") {

    if (rarity === "R") {
      return `/rainbow-1-backs/R1RB${padded}.jpg`;
    }

    if (rarity === "SR") {
      return `/rainbow-1-backs/R1SRB${padded}.jpg`;
    }

    if (rarity === "FR") {
      return `/card-backs/R1FRBACK.jpg`;
    }

    if (rarity === "UR") {
      return `/card-backs/M1URBACK.jpeg`;
    }

    // default group
if (["TGR","TR","MTR","SSR","USR","XR"].includes(rarity)) {
  return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
}

}

return `/card-backs/M1R-SR-SGR-SCBACK.jpeg`;
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
    // HR001–HR022 (all HR except the last 8)
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
                          src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.jpg`}
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
                src={zoomedCardBack || "/card-backs/M1R-SR-SGR-SCBACK.jpeg"}
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
    </div>
  );
};

export default Collection;
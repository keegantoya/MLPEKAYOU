import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const FunMoments1 = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);

const [viewMode, setViewMode] = useState(false);
const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardBack, setZoomedCardBack] = useState<string | null>(null);
const [zoomedCardFlipped, setZoomedCardFlipped] = useState(false);
const [isClosingZoom, setIsClosingZoom] = useState(false);

const toggleFlip = (key: string) => {
  if (viewMode) {
    const [rarity, numberStr] = key.split("-");
    const number = Number(numberStr);

    const frontSrc =
      `/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`;

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

  const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1
    }))
  );

  const getCardBack = (rarity: string, number: number) => {
    if (rarity === "N" || rarity === "SN") {
      return `/fun-moments-one-backs/FM1BACKN${String(number).padStart(3, "0")}.jpg`;
    }

    if (rarity === "R") {
      return `/fun-moments-one-backs/FM1RB${String(number).padStart(3, "0")}.jpg`;
    }

    if (rarity === "SR") {
      return `/fun-moments-one-backs/FM1SRB${String(number).padStart(3, "0")}.jpg`;
    }

    if (rarity === "UR") {
      return "/card-backs/M1URBACK.jpeg";
    }

    if (rarity === "CR") {
      if (number <= 9) {
        return "/fun-moments-one-backs/FM1CRBACK001.jpg";
      }
      return "/fun-moments-one-backs/FM1CRBACK002.jpg";
    }

    return "/card-backs/M1R-SR-SGR-SCBACK.jpeg";
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
                        src={`/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`}
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
                src={zoomedCardBack || "/card-backs/M1R-SR-SGR-SCBACK.jpeg"}
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
    </div>
  );
};

export default FunMoments1;
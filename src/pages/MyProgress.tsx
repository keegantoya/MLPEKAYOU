import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import myProgressBadge from "@/assets/avatars/myprogressbadge.png";

import fluttershyCutieMark from "/website-assets/fluttershycutiemark.png";
import applejackCutieMark from "/website-assets/applejackcutiemark.png";
import pinkiePieCutieMark from "/website-assets/pinkiecutiemark.png";
import rainbowDashCutieMark from "/website-assets/rainbowdashcutiemark.png";
import rarityCutieMark from "/website-assets/raritycutiemark.png";
import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.png";

import funMomentsOnePack from "/set-pictures/funmomentsonepack.jpg";
import funMomentsTwoPack from "/set-pictures/funmomentstwopack.jpg";
import funMomentsThreePack from "/set-pictures/funmomentsthreepack.png";

import moonOnePack from "/set-pictures/moononepackstandalone.jpg";
import moonTwoPack from "/set-pictures/moontwopack.png";
import moonThreePack from "/set-pictures/moonthreepack.jpg";

import rainbowOnePack from "/set-pictures/rainbowonepack.jpg";

const cutieMarks = [
  fluttershyCutieMark,
  applejackCutieMark,
  pinkiePieCutieMark,
  rainbowDashCutieMark,
  rarityCutieMark,
  twilightSparkleCutieMark,
];

const setImages: Record<string, string> = {
  "1": "/thumbnails/moon-fe.jpg",
  "5": "/thumbnails/rainbow1thumbnail.jpg",
  "7": "/thumbnails/fme01TN.jpg",
  "2": "/thumbnails/moon-se.jpg",
  "8": "/thumbnails/fme02TN.jpg",
  "3": "/thumbnails/moon-te.jpg",
  "11": "/thumbnails/fme03TN.jpg",
  "9": "/thumbnails/promos-thumbnail.jpg",
  "10": "/thumbnails/limited-promos-thumbnail.jpg",
};

const setBadgeImages: Record<string, string> = {
  "1": moonOnePack,          // Eternal Moon First Edition
  "2": moonTwoPack,          // Eternal Moon Second Edition
  "3": moonThreePack,          // Eternal Moon Third Edition (uses same pack art)
  "5": rainbowOnePack,       // Rainbow First Edition
  "7": funMomentsOnePack,    // Fun Moments First Edition
  "8": funMomentsTwoPack,    // Fun Moments Second Edition
  "11": funMomentsThreePack, // Fun Moments Three
};

const sets = [
  {
  id: "9",
  name: "Promotional Cards",
  total: 5,
  rarities: { PR: 5}
  },
  {
    id: "1",
    name: "Eternal Moon First Edition",
    total: 186,
    rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 }
  },
  {
    id: "5",
    name: "Rainbow First Edition",
    total: 146,
    rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 }
  },
  {
    id: "7",
    name: "Fun Moments First Edition",
    total: 127,
    rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 }
  },
  {
    id: "2",
    name: "Eternal Moon Second Edition",
    total: 189,
    rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 }
  },
  {
  id: "8",
  name: "Fun Moments Second Edition",
  total: 136,
  rarities: { N: 20, SN: 20, R:35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
  },
  {
    id: "3",
    name: "Eternal Moon Third Edition",
    total: 290,
    rarities: { R: 60, SR: 40, SSR: 40, HR:60, LSR: 32, UR: 18, SGR: 16, ZR: 14, SC: 7, SZR: 3 }
  },
  {
    id: "11",
    name: "Fun Moments Three",
    total: 148,
    rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR: 9, CR:12, SCR: 12 }
  },
  {
    id: "4",
    name: "Star First Edition",
    total: 105,
    rarities: {}
  },
  {
    id: "6",
    name: "Rainbow Second Edition",
    total: 170,
    rarities: {}
  },
  {
  id: "10",
  name: "Serialized & Limited Cards",
  total: 1,
  rarities: { LC: 1 }
  },
  ];

const releasedRoutes: Record<string, string> = {
  "1": "/eternal-moon-one",
  "2": "/eternal-moon-two",
  "5": "/rainbow-one",
  "3": "/eternal-moon-three",
  "7": "/fun-moments-one",
  "11": "/fun-moments-three",
  "9": "/promos",
  "10": "/limited-cards",
  "8": "/fun-moments-two",
};

const MyProgress = () => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
  const loadProgress = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      setProgress({});
      return;
    }

    const { data: collectionData } = await supabase
      .from("collection_progress")
      .select("*")
      .eq("user_id", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("iso_hidden_sets")
      .eq("id", user.id)
      .single();

    setHiddenSets(profile?.iso_hidden_sets || []);

    const progressMap = new Map(
      collectionData?.map((row) => [String(row.set_id), row]) || []
    );

    const newProgress: Record<string, number> = {};

    sets.forEach((set) => {
const found = progressMap.get(set.id);
      if (!found?.progress || !set.rarities) {
        newProgress[set.id] = 0;
        return;
      }

      let owned = 0;

      Object.entries(set.rarities).forEach(([rarity, count]) => {
        for (let i = 1; i <= count; i++) {
          const key = `${rarity}-${i}`;
          if (found.progress[key]) owned++;
        }
      });

      newProgress[set.id] = owned;
    });

    setProgress(newProgress);
  };

  loadProgress();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    loadProgress(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

const mainSets = sets.filter((s) =>
  ["1", "5", "7", "2", "3", "8", "11"].includes(s.id)
);

const promoSets = sets.filter((s) =>
  ["9", "10"].includes(s.id)
);

const visibleSets = sets.filter(
  (set) =>
    !hiddenSets.includes(set.id) &&
    !["9", "10"].includes(set.id) &&
    !!releasedRoutes[set.id]
);

const totalVisibleCards = visibleSets.reduce(
  (sum, set) => sum + set.total,
  0
);

const totalOwnedVisibleCards = visibleSets.reduce(
  (sum, set) => sum + (progress[set.id] || 0),
  0
);

const masteredVisibleSets = visibleSets.filter(
  (set) =>
    set.total > 0 &&
    (progress[set.id] || 0) === set.total
).length;

const overallVisiblePercent =
  totalVisibleCards > 0
    ? Math.round((totalOwnedVisibleCards / totalVisibleCards) * 100)
    : 0;

return (
  <div
    className="min-h-screen flex flex-col"
    style={{
      background: `
        radial-gradient(circle at 10% 15%, rgba(255,255,255,0.75), transparent 28%),
        radial-gradient(circle at 90% 10%, rgba(255,223,128,0.18), transparent 24%),
        radial-gradient(circle at 75% 30%, rgba(251,207,232,0.16), transparent 26%),
        radial-gradient(circle at 20% 65%, rgba(196,181,253,0.18), transparent 32%),
        radial-gradient(circle at 80% 85%, rgba(147,197,253,0.14), transparent 30%),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35), transparent 45%),
        linear-gradient(
          180deg,
          #fcf8ff 0%,
          #f8f1ff 22%,
          #f4ecff 48%,
          #efe6ff 72%,
          #e8ddff 100%
        )
      `,
    }}
  >
    <KayouHeader />

    <div className="container py-8 flex-1">
      {/* HERO */}
      <div className="max-w-6xl mx-auto mb-6">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-[#f3d98b]/50 shadow-[0_10px_30px_rgba(168,85,247,0.08)]"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(255,255,255,0.85), transparent 25%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.75), transparent 22%),
              radial-gradient(circle at 50% 10%, rgba(255,255,255,0.65), transparent 18%),
              linear-gradient(
                180deg,
                #d8c8ff 0%,
                #eadfff 18%,
                #f8f3ff 42%,
                #fff9ff 72%,
                #f7eeff 100%
              )
            `,
          }}
        >
          {/* Background Artwork */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Castle */}
            <div
              className="absolute left-0 bottom-0 w-[30%] h-full opacity-20"
              style={{
                background:
                  "url('/website-assets/twilightcastle.png') left bottom / contain no-repeat",
              }}
            />

            {/* Rainbow */}
            <div
              className="absolute right-0 bottom-8 w-[35%] h-[45%] opacity-20"
              style={{
                background:
                  "url('/website-assets/rainbow.png') right center / contain no-repeat",
              }}
            />

            {/* Clouds */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />

            {/* Cutie Marks */}
            {Array.from({ length: 80 }).map((_, i) => (
              <img
                key={i}
                src={cutieMarks[i % cutieMarks.length]}
                alt=""
                className="absolute select-none"
                style={{
                  left: `${(i * 13) % 100}%`,
                  top: `${(i * 19) % 100}%`,
                  width: `${14 + (i % 6) * 6}px`,
                  opacity: 0.08,
                  transform: `rotate(${(i * 37) % 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 md:px-6 py-2 md:py-3 text-center">
            {/* Title */}
<h1
  className="text-3xl md:text-4xl font-black leading-none mb-1"
  style={{
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#7c3aed",
    textShadow: `
      0 0 0 #d4af37,
      0 4px 0 #d4af37,
      0 8px 20px rgba(124,58,237,0.25)
    `,
    letterSpacing: "0.03em",
  }}
>
  CCG Progress
</h1>

<div className="text-sm mb-2 text-[#f5c542] drop-shadow-sm">✦</div>

            {/* Stats Strip */}
            <div className="max-w-2xl mx-auto mb-2 rounded-xl bg-white/85 backdrop-blur-sm border border-[#f3d98b]/40 shadow-sm px-3 py-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-black text-[#7c3aed]">
  {visibleSets.length}
</div>
                  <div className="text-sm uppercase tracking-[0.15em] text-[#7c5aa6] mt-1">
                    Total Sets
                  </div>
                </div>

                <div>
                  <div className="text-2xl md:text-3xl font-black text-[#d4af37]">
                    {
                      sets.filter(
                        (set) =>
                          !["9", "10"].includes(set.id) &&
                          set.total > 0 &&
                          (progress[set.id] || 0) === set.total
                      ).length
                    }
                  </div>
                  <div className="text-sm uppercase tracking-[0.15em] text-[#7c5aa6] mt-1">
                    Mastered
                  </div>
                </div>

                <div>
                  <div className="text-2xl md:text-3xl font-black text-[#ec4899]">
                    {Math.round(
                      (
                        sets
                          .filter((set) => !["9", "10"].includes(set.id))
                          .reduce(
                            (sum, set) => sum + (progress[set.id] || 0),
                            0
                          ) /
                        sets
                          .filter((set) => !["9", "10"].includes(set.id))
                          .reduce((sum, set) => sum + set.total, 0)
                      ) * 100
                    ) || 0}
                    %
                  </div>
                  <div className="text-sm uppercase tracking-[0.15em] text-[#7c5aa6] mt-1">
                    Overall Progress
                  </div>
                </div>
              </div>
            </div>

            {/* Mastered Set Plates */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-5xl mx-auto">
              {sets
                .filter((set) => {
                  const owned = progress[set.id] || 0;
                  return set.total > 0 && owned === set.total;
                })
                .map((set) => (
                  <div
                    key={`mastered-${set.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/92 border border-[#d4af37]/40 shadow-md"
                  >
                    <span className="text-xs md:text-sm font-semibold text-[#2f2150]">
                      {set.name}
                    </span>

                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-[#f5e6a8] via-[#d4af37] to-[#b8962e] text-white text-[10px] font-bold shadow-sm">
                      ✓
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

  {/* REUSABLE SECTION HEADER */}
  {(() => {
    const renderSectionHeader = (title: string) => (
      <div className="max-w-6xl mx-auto my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/35 to-[#d4af37]/15" />
        <h2
          className="text-xl md:text-3xl font-semibold tracking-[0.08em] uppercase text-[#44306a]"
          style={{
            fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
          }}
        >
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4af37]/35 to-[#d4af37]/15" />
      </div>
    );

   const renderSetCard = (set: any) => {
  const owned = progress[set.id] || 0;
  const percent =
    set.total > 0 ? Math.round((owned / set.total) * 100) : 0;
  const isMastered = percent === 100;
  const isHidden = hiddenSets.includes(set.id);
  const route = releasedRoutes[set.id];
  const image = setImages[set.id];
  const badgeImage = setBadgeImages[set.id];
const showBadgeImage = !!badgeImage;

  return (
    <button
      key={set.id}
      onClick={() => route && navigate(route)}
      className="group relative overflow-hidden rounded-[2rem]
  border-2 border-white/80 bg-white/95 backdrop-blur-sm
  shadow-[0_18px_45px_rgba(168,85,247,0.14),0_6px_18px_rgba(212,175,55,0.10)]
  hover:-translate-y-2
  hover:shadow-[0_30px_70px_rgba(168,85,247,0.22),0_10px_25px_rgba(212,175,55,0.16)]
  transition-all duration-500 text-left
  w-full
  scale-100 sm:scale-[0.8] origin-top"
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden rounded-t-[2rem]">
        <img
          src={image}
          alt={set.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Glow Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.28), transparent 30%),
              radial-gradient(circle at 80% 15%, rgba(255,255,255,0.18), transparent 22%),
              linear-gradient(to top, rgba(47,33,80,0.18), rgba(47,33,80,0.02))
            `,
          }}
        />
        {/* Top-right collectible badge */}
{showBadgeImage && (
  <div
    className="absolute top-2 right-2 z-20 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl p-0.5 sm:p-1"
    style={{
  backgroundColor: "#ffffff",
  border: "2px solid #8b5cf6",
  boxShadow: `
    inset 0 0 0 1px rgba(255,255,255,1),
    0 0 12px rgba(139,92,246,0.35),
    0 8px 20px rgba(0,0,0,0.18)
  `,
}}
  >
    <img
      src={badgeImage}
      alt=""
      className="w-full h-full object-contain"
    />
  </div>
)}

        {/* New Ribbon */}
                {["3", "11"].includes(set.id) && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#ff6fb3] to-[#f9a8d4] text-white text-[10px] font-bold tracking-[0.12em] shadow-lg uppercase">
            New
          </div>
        )}

        {/* Mastered Ribbon */}
        {isMastered && !isHidden && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#f5e6a8] via-[#d4af37] to-[#b8962e] text-white text-[10px] font-bold tracking-[0.12em] shadow-lg uppercase">
            Mastered
          </div>
        )}

        {/* Hidden Ribbon */}
        {isHidden && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#6b4a97]/90 text-[#f5e6a8] text-[10px] font-bold tracking-[0.12em] shadow-lg uppercase">
            Hidden
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="relative overflow-visible px-5 pb-5 pt-0 h-[210px] flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.98) 100%)",
        }}
      >
        {/* Cutie Mark Background Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <img
              key={i}
              src={cutieMarks[i % cutieMarks.length]}
              alt=""
              className="absolute select-none"
              style={{
                left: `${(i * 23) % 100}%`,
                top: `${(i * 37) % 100}%`,
                width: `${14 + (i % 4) * 4}px`,
                opacity: 0.08,
                transform: `rotate(${(i * 41) % 360}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Floating Percent Circle */}
          <div className="relative -mt-6 mb-4 flex justify-center z-30">
            <div
              className="w-20 h-20 rounded-full border-4 border-white shadow-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,238,255,0.98) 100%)",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f9a8d4 100%)",
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                {percent}%
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[#2f2150] text-base md:text-lg leading-snug text-center mb-2">
            {set.name}
          </h3>

          {/* Progress Area */}
          <div className="mt-auto">
            <div className="h-2 rounded-full bg-[#ede7f7] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percent}%`,
                  background:
                    "linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #d4af37 100%)",
                }}
              />
            </div>

            <div className="pt-3 flex justify-between items-center text-sm">
              <span className="font-semibold text-[#2f2150]">
                {owned} / {set.total}
              </span>

              <span className="text-[#7c5aa6] font-medium">
                {set.total} cards
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

const visibleSets = sets.filter(
  (set) =>
    !hiddenSets.includes(set.id) &&
    !["9", "10"].includes(set.id) &&
    !!releasedRoutes[set.id]
);

const totalVisibleCards = visibleSets.reduce(
  (sum, set) => sum + set.total,
  0
);

const totalOwnedVisibleCards = visibleSets.reduce(
  (sum, set) => sum + (progress[set.id] || 0),
  0
);

const masteredVisibleSets = visibleSets.filter(
  (set) =>
    set.total > 0 &&
    (progress[set.id] || 0) === set.total
).length;

const overallVisiblePercent =
  totalVisibleCards > 0
    ? Math.round((totalOwnedVisibleCards / totalVisibleCards) * 100)
    : 0;

        return (
          <>

           <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {[
                ...sets.filter(
                  (set) =>
                    [
                      "1",
                      "5",
                      "7",
                      "2",
                      "8",
                      "3",
                      "11",
                    ].includes(set.id) &&
                    releasedRoutes[set.id] &&
                    !hiddenSets.includes(set.id)
                ),
                ...sets.filter(
                  (set) =>
                    ["9", "10"].includes(set.id) &&
                    releasedRoutes[set.id] &&
                    !hiddenSets.includes(set.id)
                ),
              ]
                .filter((set) => (progress[set.id] || 0) < set.total)
                .map(renderSetCard)}
            </div>
          </>
        );
      })()}
    </div>
  </div>
);
};

export default MyProgress;
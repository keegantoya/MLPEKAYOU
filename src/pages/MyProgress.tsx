import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

import fluttershyCutieMark from "/website-assets/fluttershycutiemark.webp";
import applejackCutieMark from "/website-assets/applejackcutiemark.webp";
import pinkiePieCutieMark from "/website-assets/pinkiecutiemark.webp";
import rainbowDashCutieMark from "/website-assets/rainbowdashcutiemark.webp";
import rarityCutieMark from "/website-assets/raritycutiemark.webp";
import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.webp";

import starOnePack from "/set-pictures/staronepacks.webp";

import funMomentsOnePack from "/set-pictures/funmomentsonepack.webp";
import funMomentsTwoPack from "/set-pictures/funmomentstwopack.webp";
import funMomentsThreePack from "/set-pictures/funmomentsthreepack.webp";

import moonOnePack from "/set-pictures/moononepackstandalone.webp";
import moonTwoPack from "/set-pictures/moontwopack.webp";
import moonThreePack from "/set-pictures/moonthreepack.webp";

import rainbowOnePack from "/set-pictures/rainbowonepack.webp";
import rainbowTwoPack from "/set-pictures/rainbowtwopack.webp";

const cutieMarks = [
  fluttershyCutieMark,
  applejackCutieMark,
  pinkiePieCutieMark,
  rainbowDashCutieMark,
  rarityCutieMark,
  twilightSparkleCutieMark,
];

const setImages: Record<string, string> = {
  "1": "/thumbnails/moon-fe.webp",
  "5": "/thumbnails/rainbow1thumbnail.webp",
  "7": "/thumbnails/fme01TN.webp",
  "2": "/thumbnails/moon-se.webp",
  "8": "/thumbnails/fme02TN.webp",
  "3": "/thumbnails/moon-te.webp",
  "11": "/thumbnails/fme03TN.webp",
  "4": "/thumbnails/s1-thumbnail.webp",
  "6": "/thumbnails/rainbow2thumbnail.webp",
  "9": "/thumbnails/promos-thumbnail.webp",
};

const setBadgeImages: Record<string, string> = {
  "1": moonOnePack,
  "2": moonTwoPack,
  "3": moonThreePack,
  "4": starOnePack,
  "5": rainbowOnePack,
  "6": rainbowTwoPack,
  "7": funMomentsOnePack,
  "8": funMomentsTwoPack,
  "11": funMomentsThreePack,
};

const sets = [
  {
  id: "9",
  name: "Promotional Cards",
  total: 6,
  rarities: { PR: 12 }
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
    rarities: {
  SSR: 20,
  SCR: 18,
  UR: 18,
  USR: 15,
  AR: 9,
  OR: 7,
  BP: 9,
  SAR: 9
}
  },
  {
    id: "6",
    name: "Rainbow Second Edition",
    total: 170,
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
  XR: 8
}
  },
  ];

const releasedRoutes: Record<string, string> = {
  "1": "/moon-one",
  "2": "/moon-two",
  "5": "/rainbow-one",
  "3": "/moon-three",
  "7": "/fun-moments-one",
  "11": "/fun-moments-three",
  "9": "/promotional-cards",
  "8": "/fun-moments-two",
  "4": "/star-one",
  "6": "/rainbow-two",
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
  .select("set_id, progress")
  .eq("user_id", user.id);

const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets, iso_hidden_sets")
  .eq("id", user.id)
  .single();

const legacyHidden = profile?.iso_hidden_sets || [];

const hiddenCCG =
  profile?.iso_hidden_sets?.length
    ? profile.iso_hidden_sets
    : legacyHidden;

setHiddenSets(hiddenCCG);

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

      Object.entries(found.progress).forEach(([key, value]) => {
  if (value) owned++;
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
  ["9"].includes(s.id)
);

const visibleSets = sets.filter(
  (set) =>
    !hiddenSets.includes(set.id) &&
    !["9"].includes(set.id) &&
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
      radial-gradient(circle at 15% 15%, rgba(212,175,55,.08), transparent 28%),
      radial-gradient(circle at 85% 10%, rgba(212,175,55,.06), transparent 26%),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,.03), transparent 40%),
      linear-gradient(
        180deg,
        #202020 0%,
        #181818 28%,
        #111111 65%,
        #0b0b0b 100%
      )
    `,
  }}
>

    <div className="container py-8 flex-1">
      {/* HERO */}
      <div className="max-w-6xl mx-auto mb-6">
        <div
          className="
relative
overflow-hidden
rounded-[2rem]
border
border-[#caa43a]
bg-gradient-to-b
from-[#2a2a2a]
via-[#1d1d1d]
to-[#121212]
shadow-[0_25px_60px_rgba(0,0,0,.45)]
"
          style={{
            background: `
linear-gradient(
180deg,
#313131 0%,
#252525 22%,
#191919 60%,
#111111 100%
)
`,
          }}
        >

          {/* Content */}
          <div className="relative z-10 px-4 md:px-6 py-2 md:py-3 text-center">
            {/* Title */}
<h1
className="text-4xl md:text-5xl font-black mb-2 tracking-[.12em]"
style={{
fontFamily:"Oxanium",
color:"#f5d37a",
textShadow:"0 0 25px rgba(212,175,55,.25)"
}}
>
  CCG Progress
</h1>

            {/* Stats Strip */}
            <div className="
max-w-3xl
mx-auto
rounded-2xl
bg-[#151515]/95
border
border-[#caa43a]
backdrop-blur-xl
shadow-[0_12px_30px_rgba(0,0,0,.45)]
px-6
py-5
">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div
  className="text-2xl md:text-3xl font-black text-[#f5d37a]"
  style={{ fontFamily: "Oxanium, sans-serif" }}
>
  {visibleSets.length}
</div>
                  <div
  className="text-sm uppercase tracking-[0.15em] text-[#a6a6a6] mt-1"
  style={{ fontFamily: "Oxanium, sans-serif" }}
>
                    Total Sets
                  </div>
                </div>

                <div>
                  <div
  className="text-2xl md:text-3xl font-black text-[#f5d37a]"
  style={{ fontFamily: "Oxanium, sans-serif" }}
>
                    {
                      sets.filter(
                        (set) =>
                          !["9"].includes(set.id) &&
                          set.total > 0 &&
                          (progress[set.id] || 0) === set.total
                      ).length
                    }
                  </div>
                  <div
  className="text-sm uppercase tracking-[0.15em] text-[#a6a6a6] mt-1"
  style={{ fontFamily: "Oxanium, sans-serif" }}
>
                    Mastered
                  </div>
                </div>

                <div>
                  <div
  className="text-2xl md:text-3xl font-black text-[#f5d37a]"
  style={{ fontFamily: "Oxanium, sans-serif" }}
>
                    {Math.round(
                      (
                        sets
                          .filter((set) => !["9"].includes(set.id))
                          .reduce(
                            (sum, set) => sum + (progress[set.id] || 0),
                            0
                          ) /
                        sets
                          .filter((set) => !["9"].includes(set.id))
                          .reduce((sum, set) => sum + set.total, 0)
                      ) * 100
                    ) || 0}
                    %
                  </div>
                  <div
  className="text-sm uppercase tracking-[0.15em] text-[#a6a6a6] mt-1"
  style={{ fontFamily: "Oxanium, sans-serif" }}
>
                    Overall Progress
                  </div>
                </div>
              </div>
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
  fontFamily: "Oxanium, sans-serif",
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

  return (
    <button
      key={set.id}
      onClick={() => route && navigate(route)}
      className="
        group
        relative
        overflow-hidden
        rounded-[2rem]
        border
        border-[#caa43a]
        bg-gradient-to-b
        from-[#2b2b2b]
        via-[#1d1d1d]
        to-[#121212]
        shadow-[0_18px_45px_rgba(0,0,0,.35)]
        hover:border-[#f5d37a]
        hover:-translate-y-1
        transition-all
        duration-300

        aspect-square
        sm:aspect-auto
        sm:scale-[0.8]
        origin-top
      "
    >
      {/* IMAGE */}
      <div className="relative h-[55%] sm:h-36 overflow-hidden">

        <img
          src={image}
          alt={set.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

{badgeImage && (
  <div
    className="
      hidden
      sm:flex
      absolute
      top-2
      right-2
      w-14
      h-14
      rounded-xl
      bg-white
      border-2
      border-[#8b5cf6]
      p-1
      items-center
      justify-center
    "
  >
    <img
      src={badgeImage}
      alt=""
      className="w-full h-full object-contain"
    />
  </div>
)}

        {[""].includes(set.id) && (
          <div className="absolute left-2 top-2 px-3 py-1 rounded-full bg-[#ffe470] text-[#222] text-[10px] font-bold uppercase">
            NEW
          </div>
        )}

        {isMastered && (
          <div className="absolute left-2 top-2 px-3 py-1 rounded-full bg-[#d4af37] text-[#111] text-[10px] font-bold uppercase">
            MASTERED
          </div>
        )}

        {isHidden && (
          <div className="absolute left-2 top-2 px-3 py-1 rounded-full bg-[#555] text-white text-[10px] font-bold uppercase">
            HIDDEN
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 p-3 sm:p-5">

        <div className="flex justify-center -mt-10 sm:-mt-12 mb-3 z-10">

          <div
  className="
    px-5
    py-2
    rounded-full
    border
    border-[#d4af37]
    bg-gradient-to-b
    from-[#2d2d2d]
    to-[#171717]
    shadow-[0_8px_18px_rgba(0,0,0,.45)]
    flex
    items-center
    justify-center
    mx-auto
  "
>
  <span
    className="
      text-xl
      sm:text-2xl
      font-black
      tracking-wide
      text-[#f5d37a]
    "
    style={{
      fontFamily: "Oxanium, sans-serif",
      textShadow: "0 0 10px rgba(212,175,55,.35)",
    }}
  >
    {percent}%
  </span>
</div>

        </div>

        <h3
          className="
            text-center
            text-sm
            sm:text-lg
            font-semibold
            text-[#f4ead0]
            leading-tight
            line-clamp-2
            min-h-[2.8rem]
            sm:min-h-[3.5rem]
          "
          style={{ fontFamily: "Oxanium, sans-serif" }}
        >
          {set.name}
        </h3>

        <div className="hidden sm:block mt-auto">

          <div className="h-2 rounded-full bg-[#333] overflow-hidden">

            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                background:
                  "linear-gradient(90deg,#b48b24,#d4af37,#f7e28f)",
              }}
            />

          </div>

          <div className="flex justify-between mt-3 text-sm">

            <span className="text-[#f4ead0] font-semibold">
              {owned} / {set.total}
            </span>

            <span className="text-[#9f9f9f]">
              {set.total} cards
            </span>

          </div>

        </div>

      </div>

    </button>
  );
};

const visibleSets = sets.filter(
  (set) =>
    !hiddenSets.includes(set.id) &&
    !["9",].includes(set.id) &&
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
          <div className="pb-0">

           <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {[
                ...sets.filter(
                  (set) =>
                    [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "11",
].includes(set.id) &&
                    releasedRoutes[set.id] &&
                    !hiddenSets.includes(set.id)
                ),
                ...sets.filter(
                  (set) =>
                    ["9"].includes(set.id) &&
                    releasedRoutes[set.id] &&
                    !hiddenSets.includes(set.id)
                ),
              ]
                .filter((set) => (progress[set.id] || 0) < set.total)
                .map(renderSetCard)}
            </div>
{/* MASTERED COLLECTION */}
<div className="max-w-7xl mx-auto mt-16 pb-32">

  <div className="flex items-center gap-5 mb-8">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#caa43a]/40 to-transparent" />

    <h2
      className="text-2xl md:text-3xl font-bold tracking-[0.25em] text-[#f5d37a]"
      style={{ fontFamily: "Oxanium, sans-serif" }}
    >
      MASTERED COLLECTION
    </h2>

    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#caa43a]/40 to-transparent" />
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">

    {sets
      .filter((set) => {
        const owned = progress[set.id] || 0;
        return set.total > 0 && owned === set.total;
      })
      .map((set) => {

        const image =
          set.id === "9"
            ? "/promo-cards/mlpepr002.webp"
            : setBadgeImages[set.id];

return (
  <button
    key={set.id}
    onClick={() => releasedRoutes[set.id] && navigate(releasedRoutes[set.id])}
    className="
      relative
      overflow-hidden
      rounded-3xl
      border
      border-[#caa43a]
      bg-gradient-to-b
      from-[#262626]
      via-[#1a1a1a]
      to-[#101010]
      hover:border-[#f5d37a]
      hover:-translate-y-1
      transition-all
      duration-300
      shadow-[0_12px_30px_rgba(0,0,0,.45)]
      p-5
      text-left
    "
  >

    {/* White Artwork Display */}
    <div
      className="
        rounded-2xl
        bg-white
        border
        border-[#e5e5e5]
        h-36
        flex
        items-center
        justify-center
        p-4
        shadow-inner
      "
    >
      <img
        src={image}
        alt={set.name}
        className="max-h-full max-w-full object-contain"
      />
    </div>

    <h3
      className="mt-5 text-center text-sm font-semibold text-[#f4ead0] min-h-[42px]"
      style={{ fontFamily: "Oxanium, sans-serif" }}
    >
      {set.name}
    </h3>

    <div className="mt-4 flex justify-center">
      <div
        className="
          px-4
          py-1.5
          rounded-full
          bg-gradient-to-r
          from-[#b88a24]
          via-[#d4af37]
          to-[#f5d37a]
          text-[#151515]
          text-xs
          font-bold
          tracking-[0.18em]
        "
      >
        MASTERED
      </div>
    </div>

  </button>
);
      })}

  </div>

</div>
          </div>
        );
      })()}
    </div>
  </div>
);
};

export default MyProgress;
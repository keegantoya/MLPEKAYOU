import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import myProgressBadge from "@/assets/avatars/myprogressbadge.png";

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
    rarities: {}
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
  "1": "/collection/1",
  "2": "/collection/2",
  "5": "/collection/5",
  "7": "/fun-moments-1",
  "9": "/promos",
  "10": "/limited-cards",
  "8": "/fun-moments-2",
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

  // initial load
  loadProgress();

  // 🔥 THIS FIXES YOUR LOGIN ISSUE
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    loadProgress(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

const mainSets = sets.filter((s) =>
  ["1", "5", "7", "2", "8"].includes(s.id)
);

const promoSets = sets.filter((s) =>
  ["9", "10"].includes(s.id)
);

  return (
    <div
  className="min-h-screen flex flex-col"
   style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
>
      <KayouHeader />

      <div className="container py-8 flex-1">
        <img
  src={myProgressBadge}
  alt="My Progress"
  className="mx-auto h-14 sm:h-16 md:h-20 object-contain mb-2"
/>

<p className="text-[#5c4022] text-sm sm:text-base mb-6 max-w-xl mx-auto text-center">
 All progress updates based on the cards you own. Progress is saved to your account and accessible on any device.
</p>

       {/* ---- SETS ---- */}
<div className="my-10 border-t border-gray-300 text-center relative">
  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
    Sets
  </span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sets
    .filter((set) =>
      ["1", "5", "7", "2", "8"].includes(set.id) &&
      releasedRoutes[set.id]
    )
    .map((set) => {
      const owned = progress[set.id] || 0;

      const percent =
        set.total > 0
          ? Math.round((owned / set.total) * 100)
          : 0;
      const isMastered = percent === 100;

      const route = releasedRoutes[set.id];
      const isReleased = !!route;
      const isHidden = hiddenSets.includes(set.id);

      return (
        <div key={set.id} className="relative">

  {isHidden && (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/60 text-[10px] sm:text-xs px-2 py-1 rounded-md">
        SET HIDDEN
      </div>
    </div>
  )}

  <button
  
    onClick={() => route && navigate(route)}
    className={`
      w-full bg-gradient-to-b from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/40 rounded-xl p-4 shadow-sm text-left transition
      ${isReleased
        ? "hover:shadow-md hover:scale-[1.01] cursor-pointer"
        : "opacity-60 cursor-not-allowed"
      }
      ${isHidden ? "opacity-40" : ""}
    `}
  >
    {isMastered && (
  <div className="absolute inset-0 bg-[#3b2a6a]/70 rounded-xl pointer-events-none" />
)}
    {isMastered && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div
      className="text-[11px] sm:text-[10px] md:text-[10px] font-semibold px-7 py-3 sm:px-3 sm:py-1.5 rounded-md shadow tracking-wide text-center flex items-center justify-center border border-[#5a3e84]/50"
      style={{
        background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)",
        color: "#3b2a1a"
      }}
    >
      <span className="block text-center w-full">MASTERED</span>
    </div>
  </div>
)}
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-[#f5e6a8]">
                      {set.name}
                    </span>

                    <span className="text-xs text-[#f5e6a8]">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#3b2a1a]/40 rounded-full overflow-hidden">
  <div
    className="h-full transition-all"
    style={{
      width: `${percent}%`,
      background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)"
    }}
  />
</div>

                  <div className="text-xs text-[#f5e6a8] mt-2">
                    {owned} / {set.total}
                  </div>
                </button>
              </div>
      );
    })}
</div>

{/* ---- PROMOS ---- */}
<div className="my-10 border-t border-gray-300 text-center relative">
  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#e9e2f3] px-3 text-sm text-gray-600">
    Promotional Cards
  </span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sets
    .filter((set) =>
      ["9", "10"].includes(set.id) &&
      releasedRoutes[set.id]
    )
    .map((set) => {
      const owned = progress[set.id] || 0;

      const percent =
        set.total > 0
          ? Math.round((owned / set.total) * 100)
          : 0;
      const isMastered = percent === 100;

      const route = releasedRoutes[set.id];
      const isReleased = !!route;
      const isHidden = hiddenSets.includes(set.id);

      return (
        <div key={set.id} className="relative">

  {isHidden && (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/60 text-[10px] sm:text-xs px-2 py-1 rounded-md">
        SET HIDDEN
      </div>
    </div>
  )}

  <button
  
    onClick={() => route && navigate(route)}
    className={`
      w-full bg-gradient-to-b from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/40 rounded-xl p-4 shadow-sm text-left transition
      ${isReleased
        ? "hover:shadow-md hover:scale-[1.01] cursor-pointer"
        : "opacity-60 cursor-not-allowed"
      }
      ${isHidden ? "opacity-40" : ""}
    `}
  >
    {isMastered && (
  <div className="absolute inset-0 bg-[#3b2a6a]/70 rounded-xl pointer-events-none" />
)}
    {isMastered && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div
      className="text-[11px] sm:text-[10px] md:text-[10px] font-semibold px-7 py-3 sm:px-3 sm:py-1.5 rounded-md shadow tracking-wide text-center flex items-center justify-center border border-[#5a3e84]/50"
      style={{
        background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)",
        color: "#3b2a1a"
      }}
    >
      <span className="block text-center w-full">MASTERED</span>
    </div>
  </div>
)}
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-[#f5e6a8]">
                      {set.name}
                    </span>

                    <span className="text-xs text-[#f5e6a8]">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#3b2a1a]/40 rounded-full overflow-hidden">
  <div
    className="h-full transition-all"
    style={{
      width: `${percent}%`,
      background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)"
    }}
  />
</div>

                  <div className="text-xs text-[#f5e6a8] mt-2">
                    {owned} / {set.total}
                  </div>
                </button>
              </div>
      );
    })}
</div>
       <footer className="py-4 sm:py-5 text-center text-[10px] sm:text-xs text-black">
        <div className="max-w-lg mx-auto">
          <p>This website is not run or owned by Kayou.</p>

          <p className="text-[7px] sm:text-[8px] italic">
            All rights to respective owners. All rights to Kayou.
          </p>

          <p>
            This is a fan-made collector tool that generates zero profit and will not run ads or promote a subscription.
          </p>

          <img
            src="/logos/collab-logo.png"
            alt="MLPEKAYOU x KAYOU"
            className="mx-auto h-10 sm:h-14 opacity-90"
          />
        </div>
      </footer>
      </div>
    </div>
  );
};

export default MyProgress;
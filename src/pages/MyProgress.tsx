import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
const setImages: Record<string, string> = {
  "1": "/thumbnails/moononesetimage.webp",
  "5": "/thumbnails/rainbowonesetimage.webp",
  "7": "/thumbnails/funonesetimage.webp",
  "2": "/thumbnails/moontwosetimage.webp",
  "8": "/thumbnails/funtwosetimage.webp",
  "3": "/thumbnails/moonthreesetimage.webp",
  "11": "/thumbnails/funthreesetimage.webp",
  "4": "/thumbnails/staronesetimage.webp",
  "6": "/thumbnails/rainbowtwosetimage.webp",
  "9": "/thumbnails/promossetimage.webp",
};
const sets = [
  {
    id: "9",
    name: "Promotional Cards",
    total: 12,
    rarities: { PR: 12 },
  },
  {
    id: "1",
    name: "Moon First Edition",
    total: 186,
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7,
    },
  },
  {
    id: "5",
    name: "Rainbow First Edition",
    total: 146,
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
      XR: 7,
    },
  },
  {
    id: "7",
    name: "Fun Moments First Edition",
    total: 127,
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12,
    },
  },
  {
    id: "2",
    name: "Moon Second Edition",
    total: 189,
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
      "SHINING ZR": 1,
    },
  },
  {
    id: "8",
    name: "Fun Moments Second Edition",
    total: 136,
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
    },
  },
  {
    id: "3",
    name: "Moon Third Edition",
    total: 290,
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
  },
  {
    id: "11",
    name: "Fun Moments Three",
    total: 148,
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
      SCR: 12,
    },
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
      SAR: 9,
    },
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
      XR: 8,
    },
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
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light");
});
useEffect(() => {
  const syncTheme = () => {
    const root = document.documentElement;
    setIsLightMode(
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      !root.classList.contains("dark")
    );
  };
  syncTheme();
  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  return () => observer.disconnect();
}, []);
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
        .select("iso_hidden_sets")
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
const promoSets = sets.filter((s) => ["9"].includes(s.id));
const visibleSets = sets.filter(
    (set) =>
      !hiddenSets.includes(set.id) &&
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
const activeSets = sets.filter(
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
        "9",
      ].includes(set.id) &&
      releasedRoutes[set.id] &&
      !hiddenSets.includes(set.id) &&
      (progress[set.id] || 0) < set.total
  );
const masteredSets = sets.filter((set) => {
const owned = progress[set.id] || 0;
    return (
      set.total > 0 &&
      owned === set.total &&
      !hiddenSets.includes(set.id)
    );
  });
const renderSectionHeader = (title: string, count?: number) => (
  <div className="mb-3 mt-8 flex items-center justify-between">
    <h2 className={`text-lg font-semibold sm:text-xl ${
      isLightMode ? "text-zinc-900" : "text-white"
    }`}>
      {title}
    </h2>
    {typeof count === "number" && (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        isLightMode
          ? "bg-zinc-100 text-zinc-600"
          : "bg-white/[0.06] text-zinc-300"
      }`}>
        {count}
      </span>
    )}
  </div>
);
const renderSetCard = (set: any) => {
  const owned = progress[set.id] || 0;
  const percent =
    set.total > 0
      ? Math.min(100, Math.round((owned / set.total) * 100))
      : 0;
  const isMastered = percent === 100;
  const route = releasedRoutes[set.id];
  const image = setImages[set.id];
  return (
    <button
      key={set.id}
      type="button"
      onClick={() => route && navigate(route)}
      disabled={!route}
      className={`group overflow-hidden rounded-[22px] border text-left transition-transform hover:-translate-y-0.5 ${
        isLightMode
          ? "border-black/10 bg-white"
          : "border-white/[0.08] bg-[#151718]"
      }`}
    >
      <div className={`relative aspect-[16/10] overflow-hidden ${
        isLightMode ? "bg-zinc-100" : "bg-[#0d0f10]"
      }`}>
        {image ? (
          <img
            src={image}
            alt={set.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className={`flex h-full items-center justify-center text-sm ${
            isLightMode ? "text-zinc-400" : "text-zinc-500"
          }`}>
            Image unavailable
          </div>
        )}
        {isMastered && (
          <div className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isLightMode
              ? "bg-white/90 text-[#725700]"
              : "bg-black/65 text-[#FFE27A]"
          }`}>
            Mastered
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`min-w-0 text-sm font-semibold leading-snug sm:text-base ${
            isLightMode ? "text-zinc-900" : "text-white"
          }`}>
            {set.name}
          </h3>
          <span className={`shrink-0 text-lg font-semibold ${
            isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
          }`}>
            {percent}%
          </span>
        </div>
        <div className={`mt-2 flex items-center justify-between text-xs ${
          isLightMode ? "text-zinc-500" : "text-zinc-400"
        }`}>
          <span>{owned} / {set.total} cards</span>
          <span>{set.total - owned} remaining</span>
        </div>
        <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${
          isLightMode ? "bg-zinc-200" : "bg-white/[0.08]"
        }`}>
          <div
            className="h-full rounded-full bg-[#FFD54A] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </button>
  );
};
return (
  <div
    className={`min-h-screen pb-24 transition-colors ${
      isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
    }`}
  >
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <section
        className={`rounded-[26px] border p-4 sm:p-5 ${
          isLightMode
            ? "border-black/10 bg-white"
            : "border-white/[0.08] bg-[#151718]"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">CCG Progress</h1>
            <div className={`mt-1 text-sm ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}>
              {totalOwnedVisibleCards} of {totalVisibleCards} cards collected
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
            <div className={`rounded-2xl border px-3 py-3 text-center ${
              isLightMode
                ? "border-black/10 bg-zinc-50"
                : "border-white/10 bg-white/[0.03]"
            }`}>
              <div className="text-xl font-semibold">{visibleSets.length}</div>
              <div className={`mt-0.5 text-xs ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Active Sets
              </div>
            </div>
            <div className={`rounded-2xl border px-3 py-3 text-center ${
              isLightMode
                ? "border-black/10 bg-zinc-50"
                : "border-white/10 bg-white/[0.03]"
            }`}>
              <div className="text-xl font-semibold">{masteredVisibleSets}</div>
              <div className={`mt-0.5 text-xs ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Mastered
              </div>
            </div>
            <div className={`rounded-2xl border px-3 py-3 text-center ${
              isLightMode
                ? "border-black/10 bg-zinc-50"
                : "border-white/10 bg-white/[0.03]"
            }`}>
              <div className={`text-xl font-semibold ${
                isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
              }`}>
                {overallVisiblePercent}%
              </div>
              <div className={`mt-0.5 text-xs ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Overall
              </div>
            </div>
          </div>
        </div>
        <div className={`mt-4 h-2 overflow-hidden rounded-full ${
          isLightMode ? "bg-zinc-200" : "bg-white/[0.08]"
        }`}>
          <div
            className="h-full rounded-full bg-[#FFD54A]"
            style={{ width: `${overallVisiblePercent}%` }}
          />
        </div>
      </section>
      {renderSectionHeader("Current Progress", activeSets.length)}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {activeSets.map(renderSetCard)}
      </div>
      {promoSets.filter(
        (set) =>
          releasedRoutes[set.id] &&
          !hiddenSets.includes(set.id) &&
          (progress[set.id] || 0) < set.total
      ).length > 0 && (
        <>
          {renderSectionHeader(
            "Promotional Cards",
            promoSets.filter(
              (set) =>
                releasedRoutes[set.id] &&
                !hiddenSets.includes(set.id) &&
                (progress[set.id] || 0) < set.total
            ).length
          )}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {promoSets
              .filter(
                (set) =>
                  releasedRoutes[set.id] &&
                  !hiddenSets.includes(set.id) &&
                  (progress[set.id] || 0) < set.total
              )
              .map(renderSetCard)}
          </div>
        </>
      )}
      {renderSectionHeader("Mastered Collection", masteredSets.length)}
      {masteredSets.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {masteredSets.map(renderSetCard)}
        </div>
      ) : (
        <div
          className={`rounded-[22px] border p-8 text-center text-sm ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-500"
              : "border-white/[0.08] bg-[#151718] text-zinc-400"
          }`}
        >
          No mastered sets yet.
        </div>
      )}
    </main>
  </div>
);
};
export default MyProgress;
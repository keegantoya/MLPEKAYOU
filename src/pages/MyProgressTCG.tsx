import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
const setImages: Record<string, string> = {
  friendshipsbegin_bonus: "/thumbnails/friendshipsbeginsetimage.webp",
  friendshipsbegin_decks: "/thumbnails/friendshipsbeginsetimage.webp",
  FW: "/thumbnails/fantasysetimage.webp",
  discord: "/thumbnails/discordsetimage.webp",
  tcgpromos: "/thumbnails/tcgpromossetimage.webp",
};
const sets = [
  {
    id: "friendshipsbegin_bonus",
    name: "Friendships Begin — Bonus Deck",
    total: 68,
    rarities: {},
    isNew: false,
  },
  {
    id: "friendshipsbegin_decks",
    name: "Friendships Begin — Starter Decks",
    total: 6,
    rarities: null,
    isNew: false,
  },
  {
    id: "FW",
    name: "Fantasy Wonderland",
    total: 191,
    rarities: {},
    isNew: false,
  },
  {
  id: "discord",
  name: "Discord",
  total: 191,
  rarities: {},
  isNew: false,
},
  {
  id: "tcgpromos",
  name: "TCG Promos",
  total: 18,
  rarities: null,
  isNew: false,
},
];
const releasedRoutes: Record<string, string> = {
  "friendshipsbegin_bonus": "/friendships-begin",
  "friendshipsbegin_decks": "/friendships-begin",
  "FW": "/fantasy-wonderland",
  "discord": "/discord",
  "tcgpromos": "/promotional-cards",
};
const MyProgressTCG = () => {
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
const loadProgress = async () => {
const { data } = await supabase.auth.getUser();
const user = data.user;
      if (!user) return;
const { data: collectionData } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);
const { data: rawCollectionData } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", user.id);
const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets")
  .eq("id", user.id)
  .single();
const rawHidden = profile?.iso_hidden_sets || [];
const mappedHidden: string[] = [];
rawHidden.forEach((id: string) => {
  switch (id) {
    case "SD":
      mappedHidden.push(
        "friendshipsbegin_bonus",
        "friendshipsbegin_decks"
      );
      break;
    case "SD_BONUS":
      mappedHidden.push("friendshipsbegin_bonus");
      break;
    case "SD_STARTERS":
      mappedHidden.push("friendshipsbegin_decks");
      break;
    case "FW":
      mappedHidden.push("FW");
      break;
    case "12":
      mappedHidden.push("discord");
      break;
    case "TCG_PROMOS":
      mappedHidden.push("tcgpromos");
      break;
    default:
      mappedHidden.push(id);
      break;
  }
});
setHiddenSets([...new Set(mappedHidden)]);
const progressMap = new Map(
  [
    ...(collectionData || []),
    ...(rawCollectionData || []),
  ].map((row) => [String(row.set_id), row])
);
const tcgPromosProgress =
  rawCollectionData?.find((row) => row.set_id === "tcgpromos")?.progress || {};
const newProgress: Record<string, number> = {};
      sets.forEach((set) => {
const found =
  set.id === "friendshipsbegin_bonus" ||
  set.id === "friendshipsbegin_decks"
    ? progressMap.get("SD")
    : progressMap.get(set.id);
// BONUS
        if (set.id === "friendshipsbegin_bonus") {
const progressData = found?.progress || {};
const BONUS_STRUCTURE = [
    { prefix: "SD01C", count: 9 },
    { prefix: "SD01U", count: 7 },
    { prefix: "SD01SR", count: 6 },
    { prefix: "SD01SPR", count: 10 },
    { prefix: "SD01GR", count: 6 },
    { prefix: "SD01CR", count: 6 },
    { prefix: "SD01ER", count: 6 },
    { prefix: "SD01PER", count: 12 },
    { prefix: "SD01PRR", count: 6 },
  ];
let owned = 0;
BONUS_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 1; i <= count; i++) {
let actualIndex = i;
    if (prefix === "SD01PER") {
      actualIndex = i + 6; // match your real PER numbering (07–16)
    }
const key = `${prefix}${String(actualIndex).padStart(2, "0")}`;
const stateKey = `BONUS-${key}`;
    if (progressData[stateKey]) owned++;
  }
});
  newProgress[set.id] = owned;
  return;
}
// STARTER DECKS
        if (set.id === "friendshipsbegin_decks") {
const progressData = found?.progress || {};
const decks = [
            { code: "SD01A", count: 21 },
            { code: "SD01B", count: 21 },
            { code: "SD01C", count: 21 },
            { code: "SD01D", count: 21 },
            { code: "SD01E", count: 21 },
            { code: "SD01F", count: 21 },
          ];
let completed = 0;
const getDeckCards = (deckCode: string) => {
const cards: string[] = [];
const deckLetter = deckCode.slice(-1);
const deckIndex = deckLetter.charCodeAt(0) - 64;
const add = (rarity: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      cards.push(`${deckCode}${rarity}${String(i).padStart(2, "0")}`);
    }
  };
  add("C", 9);
  add("U", 4);
  add("SR", 2);
  cards.push(`SD01ER${String(deckIndex).padStart(2, "0")}`);
  add("SPR", 4);
  cards.push(`SD01RR${String(deckIndex).padStart(2, "0")}`);
  return cards;
};
decks.forEach((deck) => {
const cards = getDeckCards(deck.code);
const complete = cards.every(
    (key) => progressData[`STARTER-${key}`]
  );
  if (complete) completed++;
});
          newProgress[set.id] = completed;
          return;
        }
// TCG PROMOS
if (set.id === "tcgpromos") {
const owned = Object.values(tcgPromosProgress).filter(Boolean).length;
  newProgress[set.id] = owned;
  return;
}
// DISCORD
if (set.id === "discord") {
const progressData = progressMap.get("12")?.progress || {};
const owned = Object.values(progressData).filter(
    (value) =>
      value === true ||
      (typeof value === "object" &&
        value !== null &&
        (value as any).owned === true)
  ).length;
  newProgress[set.id] = owned;
  return;
}
// FANTASY WONDERLAND
const STRUCTURE = [
  { prefix: "BP01C", count: 48 },
  { prefix: "BP01U", count: 18 },
  { prefix: "BP01ER", count: 6 },
  { prefix: "BP01SR", count: 14 },
  { prefix: "BP01SPR", count: 28 },
  { prefix: "BP01GR", count: 12 },
  { prefix: "BP01CR", count: 12 },
  { prefix: "BP01RR", count: 6 },
  { prefix: "BP01PER", count: 12 },
  { prefix: "BP01PSPR", count: 11 },
  { prefix: "BP01PGR", count: 6 },
  { prefix: "BP01PCR", count: 12 },
  { prefix: "BP01PRR", count: 6 },
];
const validKeys = new Set(
  STRUCTURE.flatMap(({ prefix, count }) => {
    if (prefix === "BP01ER") {
      return Array.from({ length: 6 }, (_, i) =>
        `BP01ER${String(i + 7).padStart(2, "0")}`
      );
    }
    if (prefix === "BP01PSPR") {
      return [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map(n =>
        `BP01PSPR${String(n).padStart(2, "0")}`
      );
    }
    return Array.from({ length: count }, (_, i) =>
      `${prefix}${String(i + 1).padStart(2, "0")}`
    );
  })
);
const progressData = found?.progress || {};
const owned = Object.entries(progressData).filter(
  ([key, val]) => val && validKeys.has(key)
).length;
newProgress[set.id] = owned;
      });
      setProgress(newProgress);
    };
    loadProgress();
  }, []);
// =========================================================
// TCG UI DATA
// Same presentation structure as CCG Progress.
// All TCG progress logic above remains unchanged.
// =========================================================
const mainSets = sets.filter((set) =>
    [
      "friendshipsbegin_bonus",
      "friendshipsbegin_decks",
      "FW",
      "discord",
    ].includes(set.id)
  );
const promoSets = sets.filter((set) => set.id === "tcgpromos");
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
const activeSets = mainSets.filter(
    (set) =>
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
  const unit = set.id === "friendshipsbegin_decks" ? "decks" : "cards";
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
          <span>{owned} / {set.total} {unit}</span>
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
            <h1 className="text-2xl font-semibold sm:text-3xl">TCG Progress</h1>
            <div className={`mt-1 text-sm ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}>
              {totalOwnedVisibleCards} of {totalVisibleCards} cards and decks collected
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
            "TCG Promos",
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
export default MyProgressTCG;
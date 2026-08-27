import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
const sets = [
  {
    id: "1",
    name: "Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  {
    id: "6",
    name: "Rainbow: Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: { BASE: 18, R: 30, SR: 14, ST: 20, TR: 12, TGR: 8, SSR: 15, FR: 18, UR: 19, USR: 8, XR: 8 }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  {
    id: "8",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
  },
  {
    id: "11",
    name: "Fun Moments: Third Edition",
    folder: "fun-moments-three",
    prefix: "FM3",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 }
  },
  {
    id: "3",
    name: "Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: { R: 60, SR: 40, SSR: 40, HR: 60, LSR: 32, UR: 18, SGR: 16, ZR: 14, SC: 7, "SZR": 3 }
  },
  {
    id: "4",
    name: "Star: First Edition",
    folder: "star-one",
    prefix: "S1",
    rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }
  },
  {
    id: "9",
    name: "Promotional Cards",
    folder: "promos",
    prefix: "PR",
    rarities: { PR: 12 }
  },
  {
  id: "FW",
  name: "Fantasy Wonderland",
  folder: "fantasy-wonderland",
  prefix: "FW",
  rarities: {}
},
{
  id: "friendshipsbegin",
  name: "Friendships Begin",
  folder: "friendshipsbegin",
  prefix: "SD01",
  rarities: {}
},
{
  id: "discord",
  name: "Discord",
  folder: "discord",
  prefix: "BP02",
  rarities: {}
},
{
  id: "tcgpromos",
  name: "TCG Promos",
  folder: "tcgpromos",
  prefix: "RR",
  rarities: { PR: 18 }
},
];
const binders = [
  "CCG",
  "Moon",
  "Star",
  "Rainbow",
  "Fun Moments",
  "TCG",
  "Promos",
];
const binderSets = {
CCG: [
  { id: "1", label: "Moon One" },
  { id: "5", label: "Rainbow One" },
  { id: "7", label: "Fun Moments One" },
  { id: "2", label: "Moon Two" },
  { id: "8", label: "Fun Moments Two" },
  { id: "3", label: "Moon Three" },
  { id: "11", label: "Fun Moments Three" },
  { id: "4", label: "Star One" },
  { id: "6", label: "Rainbow Two" },
],
  Moon: [
    { id: "1", label: "Moon One" },
    { id: "2", label: "Moon Two" },
    { id: "3", label: "Moon Three" },
  ],
  Rainbow: [
    { id: "5", label: "Rainbow One" },
    { id: "6", label: "Rainbow Two" },
  ],
  Star: [
    { id: "4", label: "Star One" },
  ],
  "Fun Moments": [
    { id: "7", label: "Fun Moments One" },
    { id: "8", label: "Fun Moments Two" },
    { id: "11", label: "Fun Moments Three" },
  ],
TCG: [
  { id: "FW", label: "Fantasy Wonderland" },
  { id: "discord", label: "Discord" },
  { id: "friendshipsbegin", label: "Friendships Begin" },
],
  Promos: [
    { id: "tcgpromos", label: "TCG Promos" },
    { id: "9", label: "CCG Promos" },
  ],
};
export default function MyCollectionBinder() {
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
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
const [selectedBinder, setSelectedBinder] = useState("Moon");
const [selectedSetId, setSelectedSetId] = useState("1");
const [progressMap, setProgressMap] = useState<Record<string, any>>({});
const [viewingUserId, setViewingUserId] = useState<string | null>(null);
const [viewingProfile, setViewingProfile] = useState<any>(null);
const [viewingUsername, setViewingUsername] = useState("My Collection");
const [userSearch, setUserSearch] = useState("");
const [searchResults, setSearchResults] = useState<any[]>([]);
const searchRef = useRef<HTMLDivElement>(null);
const [spread, setSpread] = useState(1);
const [layout, setLayout] = useState<"3x3" | "4x3" | "4x4" | "2x2" | "6x6">("3x3");
const [organization] = useState<"standard">("standard");
const [showCustomization, setShowCustomization] = useState(false);
const [previewLayout, setPreviewLayout] = useState<"3x3" | "4x3" | "4x4" | "2x2" | "6x6">("3x3");
const [startSlot, setStartSlot] = useState(0);
const touchStartX = useRef(0);
const isMobile = useMemo(
  () => window.matchMedia("(max-width: 767px)").matches,
  []
);
useEffect(() => {
const handleClickOutside = (event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setSearchResults([]);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  useEffect(() => {
const load = async () => {
const {
  data: { user },
} = await supabase.auth.getUser();
if (!viewingUserId && user) {
const { data: profile } = await supabase
  .from("profiles")
  .select(`
    id,
    username,
    avatar_url,
    iso_hidden_sets
  `)
  .eq("id", user.id)
  .single();
if (profile) {
  setViewingProfile(profile);
  setViewingUsername(profile.username);
const mappedHidden = [
  ...(profile.iso_hidden_sets || []),
].flatMap((id: string) => {
  switch (id) {
    case "SD":
      return ["friendshipsbegin"];
    case "12":
      return ["discord"];
    default:
      return [id];
  }
});
setHiddenCCGSets(mappedHidden);
}
}
const targetUserId = viewingUserId ?? user?.id;
if (!targetUserId) return;
if (!user) return;
    if (!user) return;
const { data: progress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", targetUserId);
const { data: rawProgress } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", targetUserId);
const map: Record<string, any> = {};
[...(progress || []), ...(rawProgress || [])].forEach((row: any) => {
  map[row.set_id] = {
    ...(map[row.set_id] || {}),
    ...(row.progress || {}),
  };
});
setProgressMap(map);
  };
  load();
}, [viewingUserId]);
const defaultCCGOrder = [
  "1",
  "5",
  "7",
  "2",
  "8",
  "3",
  "11",
  "4",
  "6",
];
const [hiddenCCGSets, setHiddenCCGSets] = useState<string[]>([]);
const visibleCCGOrder = defaultCCGOrder.filter(
  id => !hiddenCCGSets.includes(id)
);
const activeSetIds =
  selectedBinder === "CCG"
    ? visibleCCGOrder
    : [selectedSetId];
const slugMap: Record<string, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "11": "11",
  "9": "9",
  "FW": "FW",
  "discord": "12",
  "friendshipsbegin": "SD",
  "tcgpromos": "tcgpromos",
};
const selectedSet =
  sets.find(
    s =>
      s.id ===
      activeSetIds[0]
  );
if (!selectedSet) {
  return null;
}
const progress =
  selectedBinder === "CCG"
    ? progressMap
    : progressMap[
        slugMap[selectedSetId] ||
          selectedSetId
      ] || {};
let cards: any[] = [];
if (selectedSet.id === "FW") {
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
  cards = STRUCTURE.flatMap(({ prefix, count }) => {
if (prefix === "BP01ER") {
  return Array.from({ length: 6 }, (_, i) => {
const num = String(i + 7).padStart(2, "0");
    return {
      rarity: "ER",
      key: `BP01ER${num}`,
      image: `/fantasy-wonderland/SD01ER${num}.webp`,
    };
  });
}
if (prefix === "BP01PER") {
  return Array.from({ length: 12 }, (_, i) => {
const num = String(i + 1).padStart(2, "0");
    return {
      rarity: "PER",
      key: `BP01PER${num}`,
      image: `/fantasy-wonderland/SD01PER${num}.webp`,
    };
  });
}
    if (prefix === "BP01PSPR") {
const numbers = [1,2,3,5,7,8,9,12,13,18,21];
      return numbers.map((n) => ({
        rarity: "PSPR",
        key: `BP01PSPR${String(n).padStart(2, "0")}`,
        image: `/fantasy-wonderland/BP01PSPR${String(n).padStart(2, "0")}.webp`,
      }));
    }
    return Array.from({ length: count }, (_, i) => {
const num = String(i + 1).padStart(2, "0");
      return {
        rarity: prefix.replace("BP01", ""),
        key: `${prefix}${num}`,
        image: `/fantasy-wonderland/${prefix}${num}.webp`,
      };
    });
  });
} else if (selectedSet.id === "discord") {
const STRUCTURE = [
    { prefix: "BP02C", count: 48 },
    { prefix: "BP02U", count: 18 },
    { prefix: "BP02ER", count: 6 },
    { prefix: "BP02SR", count: 14 },
    { prefix: "BP02SPR", count: 28 },
    { prefix: "BP02GR", count: 12 },
    { prefix: "BP02CR", count: 12 },
    { prefix: "BP02RR", count: 6 },
    { prefix: "BP02PER", count: 12 },
    { prefix: "BP02PSPR", count: 11 },
    { prefix: "BP02PGR", count: 6 },
    { prefix: "BP02PCR", count: 12 },
    { prefix: "BP02PRR", count: 6 },
  ];
cards = STRUCTURE.flatMap(({ prefix, count }) => {
  if (prefix === "BP02PER") {
    return Array.from({ length: 6 }, (_, i) => [
      {
        rarity: "PER",
        key: `BP02-PER${String(i + 1).padStart(2, "0")}-A2`,
        image: `/cards/discord/BP02-PER${String(i + 1).padStart(2, "0")}-A2.webp`,
      },
      {
        rarity: "PER",
        key: `BP02-PER${String(i + 1).padStart(2, "0")}-B2`,
        image: `/cards/discord/BP02-PER${String(i + 1).padStart(2, "0")}-B2.webp`,
      },
    ]).flat();
  }
const rarity = prefix.replace("BP02", "");
  return Array.from({ length: count }, (_, i) => {
const num = String(i + 1).padStart(2, "0");
    return {
      rarity,
      key: `BP02-${rarity}${num}`,
      image: `/cards/discord/BP02-${rarity}${num}.webp`,
    };
  });
});
} else if (selectedSet.id === "friendshipsbegin") {
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
  cards = BONUS_STRUCTURE.flatMap(({ prefix, count }) =>
    Array.from({ length: count }, (_, i) => {
let actualIndex = i + 1;
// PER cards are numbered 07–18
      if (prefix === "SD01PER") {
        actualIndex += 6;
      }
const num = String(actualIndex).padStart(2, "0");
const key = `${prefix}${num}`;
      return {
        rarity: prefix.replace("SD01", ""),
        key: `BONUS-${key}`,
        image: `/friendships-begin/${key}.webp`,
      };
    })
  );
} else if (selectedSet.id === "tcgpromos") {
  cards = Array.from({ length: 18 }, (_, i) => ({
    rarity: "PR",
    number: i + 1,
    key: `RR${String(i + 1).padStart(2, "0")}`,
    image: `/tcgpromos/RR${String(i + 1).padStart(2, "0")}.webp`,
  }));
} else {
cards =
  selectedSet.id === "9"
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((number) => ({
        rarity: "PR",
        number,
        key: `PR-${number}`,
        image:
          number === 6
            ? "" // No PR006 image exists
            : `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`,
      }))
    : Object.entries(selectedSet.rarities).flatMap(
        ([rarity, count]) =>
          Array.from({ length: count as number }, (_, i) => {
const fileRarity =
              rarity === "SHINING ZR"
                ? "SZR"
                : rarity;
            return {
              rarity,
              number: i + 1,
              key: `${rarity}-${i + 1}`,
              image:
                selectedSet.id === "3" &&
                rarity === "SZR" &&
                i === 0
                  ? "/card-backs/third-moon-edition-backs/M3SZRBINDERVER.webp"
                  : `/cards/${selectedSet.folder}/${selectedSet.prefix}${fileRarity}${String(
                      i + 1
                    ).padStart(3, "0")}.webp`,
            };
          })
      );
}
// Build one continuous CCG binder
if (selectedBinder === "CCG") {
const combinedCards: any[] = [];
visibleCCGOrder.forEach((setId) => {
const set = sets.find((s) => s.id === setId);
    if (!set) return;
const setCards = Object.entries(set.rarities).flatMap(
      ([rarity, count]) =>
        Array.from({ length: count as number }, (_, i) => {
const fileRarity =
            rarity === "SHINING ZR"
              ? "SZR"
              : rarity;
          return {
            rarity,
            number: i + 1,
            key: `${set.id}-${rarity}-${i + 1}`,
            progressKey: `${rarity}-${i + 1}`,
            setId: set.id,
            image:
              set.id === "3" &&
              rarity === "SZR" &&
              i === 0
                ? "/card-backs/third-moon-edition-backs/M3SZRBINDERVER.webp"
                : `/cards/${set.folder}/${set.prefix}${fileRarity}${String(
                    i + 1
                  ).padStart(3, "0")}.webp`,
          };
        })
    );
    combinedCards.push(...setCards);
  });
  cards = combinedCards;
}
const ownedCards = cards;
const layoutMap = {
  "2x2": { cols: 2, rows: 2, width: 240 },
  "3x3": { cols: 3, rows: 3, width: 360 },
  "4x3": { cols: 4, rows: 3, width: 480 },
  "4x4": { cols: 4, rows: 4, width: 480 },
// PC-only high-density binder view.
  "6x6": { cols: 6, rows: 6, width: 960 },
};
const { cols, rows, width } = layoutMap[layout];
const slotsPerPage = cols * rows;
// Count the empty sleeves before the first card so the binder// always ends on a complete spread.
const totalSleeves = startSlot + cards.length;
const totalPages = Math.ceil(totalSleeves / slotsPerPage);
// Always render complete left/right spreads.
const totalSpreads = Math.max(
  1,
  Math.ceil(totalPages / 2)
);
const getCCGSpreadForSet = (setId: string) => {
let cardsBefore = 0;
  for (const id of visibleCCGOrder) {
    if (id === setId) break;
const set = sets.find(s => s.id === id);
    if (!set) continue;
    cardsBefore += Object.values(set.rarities).reduce(
      (a, b) => a + (b as number),
      0
    );
  }
const slotsPerSpread = slotsPerPage * 2;
  return Math.floor(cardsBefore / slotsPerSpread) + 1;
};
const getCurrentCCGSet = () => {
  if (selectedBinder !== "CCG") {
    return selectedSetId;
  }
const currentCard = (spread - 1) * (slotsPerPage * 2);
let cardsSeen = 0;
  for (const id of visibleCCGOrder) {
const set = sets.find((s) => s.id === id);
    if (!set) continue;
const count = Object.values(set.rarities).reduce(
      (a, b) => a + (b as number),
      0
    );
    if (currentCard >= cardsSeen && currentCard < cardsSeen + count) {
      return id;
    }
    cardsSeen += count;
  }
  return visibleCCGOrder[0] ?? selectedSetId;
};
const currentSidebarSet = getCurrentCCGSet();
const hidden =
  selectedBinder !== "CCG" &&
  hiddenCCGSets.includes(selectedSetId);
const showClosedBinder = hidden;
const renderPage = (physicalPageStart: number) => {
  return Array.from({ length: slotsPerPage }).map((_, slot) => {
// physicalPageStart is the global slot represented by the first sleeve on this page.
// Physical reading order: right page, left page, then the next spread.
// startSlot is also a global slot.
const globalSlot = physicalPageStart + slot;
const cardIndex = globalSlot - startSlot;
    if (cardIndex < 0 || cardIndex >= cards.length) {
      return (
        <div
          key={slot}
          className={`aspect-[2.5/3.5] rounded-lg border-2 ${isLightMode ? "border-zinc-300 bg-white" : "border-zinc-600 bg-zinc-800"}`}
        />
      );
    }
const card = cards[cardIndex];
    if (selectedSet.id === "9" && card.number === 6) {
      return (
        <div
          key={cardIndex}
          className={`aspect-[2.5/3.5] rounded-lg border-2 flex items-center justify-center p-2 ${isLightMode ? "border-zinc-300 bg-white" : "border-zinc-600 bg-zinc-800"}`}
        >
          <span
            className={`text-center font-bold ${isLightMode ? "text-zinc-500" : "text-zinc-300"}`}
            style={{
              fontSize: "14px",
              lineHeight: "1.2",
            }}
          >
            NOT YET
            <br />
            RELEASED
          </span>
        </div>
      );
    }
const owned =
      selectedBinder === "CCG"
        ? progressMap[card.setId]?.[card.progressKey]
        : progress[card.key] ||
          progress[`BONUS-${card.key}`];
    if (!owned) {
      return (
        <div
          key={cardIndex}
          className={`aspect-[2.5/3.5] rounded-lg border-2 ${isLightMode ? "border-zinc-300 bg-white" : "border-zinc-600 bg-zinc-800"}`}
        />
      );
    }
const shouldZoomCard =
      !["12", "FW", "discord", "friendshipsbegin", "SD", "FB"].includes(
        String(selectedSet.id)
      );
    return (
      <div
        key={cardIndex}
        className="aspect-[2.5/3.5] overflow-hidden rounded-lg"
      >
        <img
          src={card.image}
          loading="lazy"
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            backfaceVisibility: "hidden",
            willChange: "transform",
            transform: shouldZoomCard ? "scale(1.06)" : "scale(1)",
          }}
          className="block h-full w-full"
        />
      </div>
    );
  });
};
const binderWidth =
  layout === "2x2"
    ? 560
    : layout === "4x3" || layout === "4x4"
    ? 900
    : layout === "6x6"
    ? 1200
    : 980;
const mobileScale =
  layout === "2x2"
    ? 0.48
    : layout === "3x3"
    ? 0.45
    : layout === "4x3"
    ? 0.45
    : layout === "4x4"
    ? 0.35
    : layout === "6x6"
    ? 0.38
    : 0.32;
const androidScale =
  /Android/i.test(navigator.userAgent)
    ? mobileScale * 0.96
    : mobileScale;
const mobileBinderHeight =
  layout === "2x2"
    ? 275
    : layout === "3x3"
    ? 500
    : layout === "4x3"
    ? 635
    : layout === "4x4"
    ? 515
    : layout === "6x6"
    ? 500
    : 520;
const rotateMobileBinder = isMobile && layout !== "2x2";
return (
  <div
    className={`min-h-screen flex flex-col ${
      isLightMode ? "bg-[#f6f6f3] text-zinc-950" : "bg-[#090a0a] text-white"
    }`}
  >
<main className="mx-auto w-full max-w-[1500px] flex-1 px-3 pb-20 pt-4 sm:px-5 sm:pt-6">
      <section className={`rounded-[24px] border p-3 sm:p-4 ${
        isLightMode ? "border-black/10 bg-white" : "border-black/10 dark:border-white/[0.08] bg-[#151718]"
      }`}>
        <div className="grid gap-3 lg:grid-cols-[1fr_1.35fr_auto]">
          <div className={`flex items-center gap-3 rounded-2xl border p-3 ${
            isLightMode ? "border-black/10 bg-zinc-50" : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03]"
          }`}>
            <img
              src={getProfileAssets(viewingProfile).avatar}
              alt={viewingUsername}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <div className="truncate text-sm font-semibold">{viewingUsername}</div>
                {getProfileAssets(viewingProfile).verification && (
                  <img
                    src={getProfileAssets(viewingProfile).verification!.badge}
                    alt={getProfileAssets(viewingProfile).verification!.label}
                    title={getProfileAssets(viewingProfile).verification!.label}
                    className="h-4 w-4 shrink-0"
                  />
                )}
              </div>
              <div className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                {viewingUserId ? "Viewing collection" : "Your collection"}
              </div>
            </div>
            {viewingUserId && (
              <button
                type="button"
                onClick={() => setViewingUserId(null)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  isLightMode
                    ? "border-black/10 bg-white text-zinc-700"
                    : "border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.04] text-zinc-300"
                }`}
              >
                Back
              </button>
            )}
          </div>
          <div ref={searchRef} className="relative">
            <input
              value={userSearch}
              onChange={async (e) => {
                const value = e.target.value;
                setUserSearch(value);
                if (!value.trim()) {
                  setSearchResults([]);
                  return;
                }
                const { data: profiles } = await supabase
                  .from("profiles")
                  .select(`id, username, avatar_url`)
                  .ilike("username", `%${value}%`)
                  .limit(20);
                const ids = (profiles || []).map((p) => p.id);
                const { data: trading } = await supabase
                  .from("trading_profiles")
                  .select("user_id")
                  .in("user_id", ids);
                const validIds = new Set((trading || []).map((t) => t.user_id));
                setSearchResults((profiles || []).filter((p) => validIds.has(p.id)));
              }}
              placeholder="Search collectors"
              className={`h-full min-h-[66px] w-full rounded-2xl border px-4 text-sm outline-none ${
                isLightMode
                  ? "border-black/10 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400"
                  : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-white placeholder:text-zinc-500"
              }`}
            />
            {searchResults.length > 0 && (
              <div className={`absolute left-0 right-0 top-full z-[120] mt-2 overflow-hidden rounded-2xl border shadow-xl ${
                isLightMode ? "border-black/10 bg-white" : "border-black/10 dark:border-white/10 bg-[#151718]"
              }`}>
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`rounded-xl flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 ${
                      isLightMode
                        ? "border-black/[0.06] hover:bg-zinc-50"
                        : "border-black/[0.08] dark:border-white/[0.06] hover:bg-zinc-100 dark:bg-white/[0.04]"
                    }`}
                    onClick={() => {
                      setViewingUserId(u.id);
                      setViewingUsername(u.username);
                      setViewingProfile(u);
                      setSearchResults([]);
                      setUserSearch("");
                    }}
                  >
                    <img src={getProfileAssets(u).avatar} alt={u.username} className="h-8 w-8 rounded-full object-cover" />
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">{u.username}</span>
                      {getProfileAssets(u).verification && (
                        <img
                          src={getProfileAssets(u).verification!.badge}
                          alt={getProfileAssets(u).verification!.label}
                          title={getProfileAssets(u).verification!.label}
                          className="h-4 w-4 shrink-0"
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 lg:min-w-[220px]">
            <button
              type="button"
              onClick={() => {
                const layouts = ["2x2", "3x3", "4x3", "4x4", "6x6"] as const;
                const current = (layouts as readonly string[]).includes(layout) ? layout : "3x3";
                const next = layouts[(layouts.indexOf(current as never) + 1) % layouts.length];
                setLayout(next);
                setPreviewLayout(next);
                setSpread(1);
              }}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                isLightMode
                  ? "border-black/10 bg-zinc-50 text-zinc-700"
                  : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-300"
              }`}
            >
              View {layout}
            </button>
            <button
              type="button"
              onClick={() => setShowCustomization(true)}
              className="rounded-xl bg-[#FFD54A] px-3 py-2 text-sm font-semibold text-black"
            >
              Customize
            </button>
          </div>
        </div>
      </section>
      <section className={`mt-4 rounded-[24px] border p-3 ${
        isLightMode ? "border-black/10 bg-white" : "border-black/10 dark:border-white/[0.08] bg-[#151718]"
      }`}>
        <div className="flex flex-wrap gap-2">
          {binders.map((binder) => (
            <button
              key={binder}
              type="button"
              onClick={() => {
                setSelectedBinder(binder);
                if (binder === "CCG") {
                  setSelectedSetId(visibleCCGOrder[0] ?? "1");
                } else {
                  setSelectedSetId(
                    binderSets[binder as keyof typeof binderSets][0].id
                  );
                }
                setSpread(1);
              }}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                selectedBinder === binder
                  ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                  : isLightMode
                  ? "border-black/10 bg-zinc-50 text-zinc-600"
                  : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-400"
              }`}
            >
              {binder}
            </button>
          ))}
        </div>
      </section>
      <section className={`mt-4 rounded-[24px] border p-3 xl:hidden ${isLightMode ? "border-black/10 bg-white" : "border-black/10 dark:border-white/[0.08] bg-[#151718]"}`}>
        <div className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sets</div>
        <div className="flex flex-wrap gap-2">
          {binderSets[selectedBinder as keyof typeof binderSets].map((set) => { const isHidden = selectedBinder === "CCG" && hiddenCCGSets.includes(set.id); const active = currentSidebarSet === set.id; return <button
              key={set.id}
              type="button"
              disabled={isHidden}
              onClick={() => {
                if (selectedBinder === "CCG") {
                  setSpread(getCCGSpreadForSet(set.id));
                } else {
                  setSelectedSetId(set.id);
                  setSpread(1);
                }
              }}
              className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                active
                  ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                  : isLightMode
                  ? "border-black/10 bg-zinc-50 text-zinc-600"
                  : "border-white/10 bg-white/[0.03] text-zinc-400"
              } ${isHidden ? "opacity-30 line-through" : ""}`}
            >
              {set.label}
            </button>; })}
        </div>
      </section>
      <section className={`mt-4 overflow-hidden rounded-[28px] border ${
        isLightMode ? "border-black/10 bg-white" : "border-black/10 dark:border-white/[0.08] bg-[#151718]"
      }`}>
        <div className={`rounded-xl flex items-center justify-between border-b px-4 py-3 ${
          isLightMode ? "border-black/[0.08]" : "border-black/[0.08] dark:border-white/[0.07]"
        }`}>
          <div>
            <div className="text-base font-semibold">{selectedSet.name}</div>
            <div className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              Spread {spread} of {totalSpreads}
            </div>
          </div>
        </div>
        <div className="grid gap-2 p-2 sm:gap-3 sm:p-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-xl hidden xl:block border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0d0d] p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className={`text-sm font-semibold ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>Sets</span>
              <span className={`text-xs ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`}>{binderSets[selectedBinder as keyof typeof binderSets].length}</span>
            </div>
            <div className="space-y-1">
              {binderSets[selectedBinder as keyof typeof binderSets].map((set) => {
const isHidden = selectedBinder === "CCG" && hiddenCCGSets.includes(set.id);
const active = currentSidebarSet === set.id;
                return <button
                  key={set.id}
                  type="button"
                  disabled={isHidden}
                  onClick={() => {
                    if (selectedBinder === "CCG") {
                      setSpread(getCCGSpreadForSet(set.id));
                    } else {
                      setSelectedSetId(set.id);
                      setSpread(1);
                    }
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? isLightMode
                        ? "bg-[#c89d13]/12 text-[#725700]"
                        : "bg-[#FFD54A]/10 text-[#FFE27A]"
                      : isLightMode
                      ? "text-zinc-600 hover:bg-white hover:text-zinc-900"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  } ${isHidden ? "opacity-30 line-through" : ""}`}
                >
                  {set.label}
                </button>;
              })}
            </div>
          </aside>
          {showClosedBinder ? (
            <div className="rounded-xl flex min-h-[420px] items-center justify-center border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0d0d] p-8">
              <div className="max-w-md text-center"><div className="rounded-xl mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-[#FFD400]/20 bg-[#FFD400]/[0.04] font-mono text-lg text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/55">//</div><div className="font-['Oxanium'] text-sm font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-700 dark:text-white/55">SET LOCKED</div><div className="mt-2 text-sm text-zinc-400 dark:text-zinc-500 dark:text-white/55">This collection was marked in ISO as a set you are not wanting to collect.</div></div>
            </div>
          ) : (
            <div className="rounded-xl relative min-w-0 overflow-hidden border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-100 p-1.5 dark:bg-[#080909] sm:p-2">
              <div
                className="relative flex justify-center overflow-hidden"
                style={{
                  height: isMobile ? `${mobileBinderHeight}px` : "auto",
                  minHeight: isMobile ? `${mobileBinderHeight}px` : undefined,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: isMobile
                      ? layout === "2x2"
                        ? "560px"
                        : layout === "4x3" || layout === "4x4"
                        ? "900px"
                        : "980px"
                      : "none",
                    display: "flex",
                    justifyContent: "center",
                    position: isMobile ? "absolute" : "relative",
                    left: isMobile ? "50%" : undefined,
                    top: isMobile ? "50%" : undefined,
                    transform: isMobile
                      ? rotateMobileBinder
                        ? `translate(-50%, -50%) rotate(90deg) scale(${androidScale})`
                        : `translate(-50%, -50%) scale(${androidScale})`
                      : layout === "6x6"
                      ? "scale(.86)"
                      : layout === "4x3"
                      ? "scale(.72)"
                      : layout === "4x4"
                      ? "scale(.72)"
                      : layout === "3x3"
                      ? "scale(.94)"
                      : "scale(.9)",
                    transformOrigin: isMobile ? "center center" : "top center",
                  }}
                >
                  <div
                    className="relative flex items-center gap-0"
                    onTouchStart={(e) => {
                      if (rotateMobileBinder) return;
                      touchStartX.current = e.touches[0].clientX;
                    }}
                    onTouchEnd={(e) => {
                      if (!isMobile || rotateMobileBinder) return;
                      const delta = e.changedTouches[0].clientX - touchStartX.current;
                      if (Math.abs(delta) < 50) return;
                      if (delta < 0) {
                        setSpread((s) => Math.min(totalSpreads, s + 1));
                      } else {
                        setSpread((s) => Math.max(1, s - 1));
                      }
                    }}
                    style={{
                      touchAction: rotateMobileBinder ? "manipulation" : "pan-x",
                      padding: isMobile ? "34px" : "24px",
                      borderRadius: "24px",
                      background: isLightMode
                        ? "linear-gradient(145deg,#f9d9e7 0%,#f4c7da 48%,#edb7cf 100%)"
                        : "linear-gradient(145deg,#242727 0%,#1a1d1d 48%,#111313 100%)",
                      boxShadow: isLightMode
                        ? "0 24px 55px rgba(126,55,86,.18), inset 0 2px 2px rgba(255,255,255,.55), inset 0 -10px 20px rgba(153,72,108,.12)"
                        : "0 35px 70px rgba(0,0,0,.55), inset 0 2px 2px rgba(255,255,255,.08), inset 0 -10px 20px rgba(0,0,0,.35)",
                    }}
                  >
                    <div className="pointer-events-none absolute inset-[10px] rounded-[18px] border border-black/10 dark:border-black/10 dark:border-white/10" />
                    <div className={`pointer-events-none absolute inset-[18px] rounded-[14px] border border-dashed ${isLightMode ? "border-[#b85c82]" : "border-[#FFD400]/45"}`} />
                    <button onClick={() => setSpread((s) => Math.max(1, s - 1))} className="rounded-xl absolute left-[-22px] top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#FFD400]/25 bg-white dark:bg-[#111414] text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/75 transition hover:border-[#FFD400]/60 hover:bg-zinc-100 dark:bg-[#171a1a] hover:text-[#725700] dark:text-[#FFD400] md:flex"><ChevronLeft size={19} /></button>
                    <button onClick={() => setSpread((s) => Math.min(totalSpreads, s + 1))} className="rounded-xl absolute right-[-22px] top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#FFD400]/25 bg-white dark:bg-[#111414] text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/75 transition hover:border-[#FFD400]/60 hover:bg-zinc-100 dark:bg-[#171a1a] hover:text-[#725700] dark:text-[#FFD400] md:flex"><ChevronRight size={19} /></button>
                    <div
                      key={`left-${selectedSetId}-${layout}-${spread}`}
                      role={rotateMobileBinder ? "button" : undefined}
                      tabIndex={rotateMobileBinder ? 0 : undefined}
                      onClick={() => {
                        if (rotateMobileBinder) setSpread((s) => Math.max(1, s - 1));
                      }}
                      className={`relative overflow-visible rounded-xl border border-black/10 dark:border-white/10 bg-[#e8e8e3] dark:bg-[#d8d8d4]/80 px-3 py-3 ${
                        rotateMobileBinder ? "cursor-pointer" : ""
                      }`}
                      style={{ backdropFilter: "blur(1.5px)" }}
                    >
                      <div className="grid mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, ${layout === "6x6" ? 82 : 152}px)`, gap: layout === "6x6" ? "5px" : "10px", justifyContent: "center", alignContent: "center", minHeight: layout === "2x2" ? "420px" : undefined }}>{renderPage((spread - 1) * (slotsPerPage * 2))}</div>
                    </div>
                    <div className="w-2 shrink-0" aria-hidden="true" />
                    <div
                      key={`right-${selectedSetId}-${layout}-${spread}`}
                      role={rotateMobileBinder ? "button" : undefined}
                      tabIndex={rotateMobileBinder ? 0 : undefined}
                      onClick={() => {
                        if (rotateMobileBinder) setSpread((s) => Math.min(totalSpreads, s + 1));
                      }}
                      className={`relative overflow-visible rounded-xl border border-black/10 dark:border-white/10 bg-[#e8e8e3] dark:bg-[#d8d8d4]/80 px-3 py-3 ${
                        rotateMobileBinder ? "cursor-pointer" : ""
                      }`}
                      style={{ backdropFilter: "blur(1.5px)" }}
                    >
                      <div className="grid mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, ${layout === "6x6" ? 82 : 152}px)`, gap: layout === "6x6" ? "5px" : "10px", justifyContent: "center", alignContent: "center", minHeight: layout === "2x2" ? "420px" : undefined }}>{renderPage((spread - 1) * (slotsPerPage * 2) + slotsPerPage)}</div>
                    </div>
                  </div>
                </div>
              </div>
              {isMobile && (
                <div className={`mt-2 px-2 text-center text-[11px] ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  {layout === "2x2"
                    ? "Swipe left or right to turn the pages."
                    : "Click anywhere on each page to flip that page."}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
    {showCustomization && (
      <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-3 sm:p-6">
        <div
          className={`absolute inset-0 backdrop-blur-sm ${isLightMode ? "bg-white/60" : "bg-black/75"}`}
          onClick={() => setShowCustomization(false)}
        />
        <div className={`relative z-10 flex w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] border ${
          isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#101212]"
        }`}>
          <div className={`flex shrink-0 items-center justify-between rounded-[24px] border-b px-4 py-3 sm:px-5 ${
            isLightMode ? "border-black/10 bg-zinc-50" : "border-white/10 bg-[#0c0e0e]"
          }`}>
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                CUSTOMIZE
              </div>
              <h2 className={`mt-1 font-['Oxanium'] text-base font-bold uppercase tracking-[0.1em] sm:text-lg ${
                isLightMode ? "text-zinc-900" : "text-white"
              }`}>
                Customize Binder
              </h2>
            </div>
            <button
              onClick={() => setShowCustomization(false)}
              className="rounded-xl flex h-8 w-8 items-center justify-center border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-[#151717] font-mono text-xs text-zinc-600 dark:text-white/50 transition hover:border-[#FFD400]/50 hover:text-[#725700] dark:text-[#FFD400]"
            >
              ✕
            </button>
          </div>
          <div>
            <div className="p-4 sm:p-5">
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-600 dark:text-white/50">
                Choose a layout and starting slot.
              </p>
              <div className="mb-5 flex flex-wrap justify-center gap-2">
                {(["3x3", "4x3", "4x4", "2x2", "6x6"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setLayout(value);
                      setPreviewLayout(value);
                      setStartSlot(0);
                      setSpread(1);
                    }}
                    className={`rounded-xl min-w-[58px] border px-3 py-2 text-sm font-semibold transition ${
                      layout === value
                        ? "border-[#FFD400]/70 bg-[#FFD400] text-[#0b0b0b]"
                        : "border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-[#151717] text-zinc-700 dark:text-white/55 hover:border-[#FFD400]/35 hover:text-[#725700] dark:text-[#FFD400]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div
                className={`relative flex justify-center overflow-hidden rounded-[18px] border p-2 sm:p-6 ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/10 bg-[#080909]"
                }`}
                style={{
                  height: isMobile
                    ? previewLayout === "6x6"
                      ? "390px"
                      : previewLayout === "4x4"
                      ? "300px"
                      : previewLayout === "4x3"
                      ? "235px"
                      : previewLayout === "3x3"
                      ? "250px"
                      : "220px"
                    : "auto",
                }}
              >
                <div
                  className="flex justify-center"
                  style={{
                    position: isMobile ? "absolute" : "relative",
                    left: isMobile ? "50%" : undefined,
                    top: isMobile ? "50%" : undefined,
                    transform: isMobile
                      ? previewLayout === "6x6"
                        ? "translate(-50%, -50%) scale(.56)"
                        : previewLayout === "4x4"
                        ? "translate(-50%, -50%) scale(.68)"
                        : previewLayout === "4x3"
                        ? "translate(-50%, -50%) scale(.68)"
                        : previewLayout === "3x3"
                        ? "translate(-50%, -50%) scale(1)"
                        : "translate(-50%, -50%) scale(1)"
                      : "none",
                    transformOrigin: "center center",
                  }}
                >
                  <div
                    className={`flex items-center gap-2 rounded-[14px] border p-3 sm:gap-3 sm:p-3.5 ${
                      isLightMode
                        ? "border-[#c98aa5] bg-gradient-to-br from-[#f8dbe7] to-[#efbfd2]"
                        : "border-white/10 bg-gradient-to-br from-[#242727] to-[#111313]"
                    }`}
                  >
                    {(["left", "right"] as const).map((side) => {
const pageSize =
                        previewLayout === "2x2"
                          ? 4
                          : previewLayout === "3x3"
                          ? 9
                          : previewLayout === "4x3"
                          ? 12
                          : previewLayout === "4x4"
                          ? 16
                          : 36;
// Exact same GLOBAL SLOT mapping used by the binder:// LEFT = first block of slots// RIGHT = second block of slots// Slot 1 = global slot 0.
const offset = side === "right" ? pageSize : 0;
const previewCols =
                        previewLayout === "2x2"
                          ? 2
                          : previewLayout === "3x3"
                          ? 3
                          : previewLayout === "4x3"
                          ? 4
                          : previewLayout === "4x4"
                          ? 4
                          : 6;
const slotSize =
                        previewLayout === "6x6"
                          ? "38px"
                          : "42px";
                      return (
                        <div
                          key={side}
                          className={`grid shrink-0 rounded-lg border p-2 ${
                            isLightMode
                              ? "border-[#c98aa5]/50 bg-[#f3d2df]/80"
                              : "border-white/10 bg-[#d8d8d4]/70"
                          }`}
                          style={{
                            gridTemplateColumns: `repeat(${previewCols}, ${slotSize})`,
                            gap: previewLayout === "6x6" ? "4px" : "6px",
                          }}
                        >
                          {Array.from({ length: pageSize }).map((_, i) => {
const index = i + offset;
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  setSpread(1);
                                  setStartSlot(index);
                                }}
                                aria-label={`Start slot ${index + 1}`}
                                className={`relative flex aspect-[2.5/3.5] items-center justify-center rounded border-2 transition ${
                                  startSlot === index
                                    ? isLightMode
                                      ? "border-zinc-400 bg-zinc-300/80"
                                      : "border-[#FFD400] bg-[#FFD400]/30"
                                    : isLightMode
                                    ? "border-[#b87b94]/35 bg-white/80 hover:border-[#b87b94]/60"
                                    : "border-white/15 bg-white/70 hover:border-[#FFD400]/50"
                                }`}
                              >
                                {side === "right" && i === 0 && (
                                  <span
                                    className="pointer-events-none text-[15px] leading-none text-[#9A7200]"
                                    aria-hidden="true"
                                  >
                                    ★
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-start justify-center gap-2 px-2 text-center text-xs leading-relaxed">
                <span className="shrink-0 text-[#9A7200]" aria-hidden="true">★</span>
                <span className={isLightMode ? "text-zinc-600" : "text-zinc-400"}>
                  If you're starting on the first page of a fresh binder, this is the slot you want to choose for easiest organizing!
                </span>
              </div>
            </div>
          </div>
          <div className={`flex shrink-0 items-center justify-between rounded-[24px] border-t px-4 py-2.5 ${
            isLightMode ? "border-black/10 bg-zinc-50" : "border-white/10 bg-[#0c0e0e]"
          }`}>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Layout: {layout}
            </span>
            <button
              onClick={() => setShowCustomization(false)}
              className="rounded-xl border border-[#FFD400]/25 bg-zinc-100 dark:bg-[#151717] px-3 py-1.5 font-mono text-[6px] font-bold uppercase tracking-[0.12em] text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/75 hover:border-[#FFD400]/55 hover:text-[#725700] dark:text-[#FFD400]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
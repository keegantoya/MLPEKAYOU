import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";


const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
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
    name: "Eternal Moon: Third Edition",
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
    { id: "1", label: "Eternal Moon One" },
    { id: "2", label: "Eternal Moon Two" },
    { id: "3", label: "Eternal Moon Three" },
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

// Count the empty sleeves before the first card so the binder
// always ends on a complete spread.
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
    // physicalPageStart is the GLOBAL SLOT represented by the first
    // physical sleeve on this page.
    //
    // The binder's physical reading order is:
    //   RIGHT page -> LEFT page -> next RIGHT page -> next LEFT page
    //
    // startSlot is also a GLOBAL SLOT. We never "flatten" the two
    // physical pages together after the starting slot.
    const globalSlot = physicalPageStart + slot;
    const cardIndex = globalSlot - startSlot;

    if (cardIndex < 0 || cardIndex >= cards.length) {
      return (
        <div
          key={slot}
          className="aspect-[2.5/3.5] rounded-lg border-2 border-gray-400 bg-gray-300"
        />
      );
    }

    const card = cards[cardIndex];

    if (selectedSet.id === "9" && card.number === 6) {
      return (
        <div
          key={cardIndex}
          className="aspect-[2.5/3.5] rounded-lg border-2 border-gray-400 bg-gray-300 shadow-sm flex items-center justify-center p-2"
        >
          <span
            className="text-center font-bold text-gray-600"
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
          className="aspect-[2.5/3.5] rounded-lg border-2 border-gray-300 bg-white shadow-sm"
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
    ? 0.36
    : layout === "4x3"
    ? 0.27
    : layout === "4x4"
    ? 0.23
    : 0.18;

const androidScale =
  /Android/i.test(navigator.userAgent)
    ? mobileScale * 0.92
    : mobileScale;

useEffect(() => {
  if (isMobile && layout === "6x6") {
    setLayout("4x4");
    setPreviewLayout("4x4");
    setSpread(1);
  }
}, [isMobile, layout]);

return (
  <div
    className="min-h-screen flex flex-col bg-[#090a0a] text-white"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255,212,0,.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,212,0,.018) 1px, transparent 1px),
        radial-gradient(circle at 50% 0%, rgba(255,212,0,.075), transparent 34%)
      `,
      backgroundSize: "42px 42px, 42px 42px, auto",
    }}
  >
    {/* ============================================================ */}
    {/* TONY STARK HEADER                                           */}
    {/* ============================================================ */}
    <div className="sticky top-0 z-[100] border-b border-white/[0.06] bg-[#090a0a]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1500px] items-center gap-3 px-3 sm:h-14 sm:px-5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-2 w-2 bg-[#FFD400] shadow-[0_0_12px_rgba(255,212,0,.85)]" />
          <div className="hidden sm:block">
            <div className="font-mono text-[6px] font-bold uppercase tracking-[0.28em] text-[#FFD400]/55">MLPEKAYOU</div>
            <div className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/20">COLLECTION SYSTEM</div>
          </div>
        </div>

        <div className="h-5 w-px bg-white/[0.08]" />

        <div className="min-w-0 flex-1">
          <div className="font-mono text-[5px] uppercase tracking-[0.22em] text-white/20">ACTIVE MODULE</div>
          <div className="truncate font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">Digital Binder</div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.75)]" />
          <span className="font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-emerald-400/60">ONLINE</span>
        </div>
      </div>
    </div>

    <main className="mx-auto w-full max-w-[1500px] flex-1 px-3 pb-20 pt-4 sm:px-5 sm:pt-6">
      {/* HERO */}
      <section className="relative overflow-hidden border border-white/[0.08] bg-[#101212] shadow-[0_24px_70px_rgba(0,0,0,.4)]">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,212,0,.035) 1px, transparent 1px),linear-gradient(90deg,rgba(255,212,0,.035) 1px,transparent 1px)", backgroundSize: "34px 34px" }} />
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[30rem] -translate-x-1/2 bg-[#FFD400]/[0.045] blur-[100px]" />
        <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l border-t border-[#FFD400]/65" />
        <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-[#FFD400]/30" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 border-b border-l border-[#FFD400]/20" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b border-r border-[#FFD400]/40" />

        <div className="relative flex items-center justify-between border-b border-white/[0.06] bg-[#0c0e0e] px-3 py-2 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 bg-[#FFD400] shadow-[0_0_7px_#FFD400]" />
            <span className="font-mono text-[5px] font-bold uppercase tracking-[0.24em] text-white/25">VISUAL COLLECTION // BINDER INTERFACE</span>
          </div>
          <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/15">SYS.BINDER.01</span>
        </div>

        <div className="relative px-4 py-5 sm:px-7 sm:py-7">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-7 bg-[#FFD400]/30 sm:w-12" />
              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-[#FFD400]/55">COLLECTION VISUALIZER</span>
              <span className="h-px w-7 bg-[#FFD400]/30 sm:w-12" />
            </div>
            <h1 className="font-['Oxanium'] text-2xl font-black uppercase tracking-[0.1em] text-[#f5d37a] sm:text-4xl">My Digital Binder</h1>
            <div className="mt-2 h-px w-14 bg-[#FFD400] shadow-[0_0_10px_rgba(255,212,0,.65)]" />
            <p className="mt-2 max-w-xl font-mono text-[6px] uppercase tracking-[0.18em] text-white/20">Physical binder simulation // organized card archive // live collection data</p>
          </div>

          <div className="mx-auto mt-5 grid max-w-4xl grid-cols-3 border border-white/[0.07] bg-[#0c0e0e] sm:mt-6">
            <div className="px-2 py-3 text-center">
              <div className="font-['Oxanium'] text-xl font-black leading-none text-[#FFD400] sm:text-2xl">{selectedBinder}</div>
              <div className="mt-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-white/25">ACTIVE BINDER</div>
            </div>
            <div className="border-x border-white/[0.06] px-2 py-3 text-center">
              <div className="font-['Oxanium'] text-xl font-black leading-none text-[#FFD400] sm:text-2xl">{cards.length}</div>
              <div className="mt-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-white/25">CARDS LOADED</div>
            </div>
            <div className="px-2 py-3 text-center">
              <div className="font-['Oxanium'] text-xl font-black leading-none text-[#FFD400] sm:text-2xl">{spread} / {totalSpreads}</div>
              <div className="mt-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-white/25">SPREAD</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL DECK */}
      <section className="mt-4 border border-white/[0.07] bg-[#101212] shadow-[0_16px_45px_rgba(0,0,0,.28)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0e0e] px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.8)]" />
            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.22em] text-white/30">CONTROL DECK</span>
          </div>
          <span className="font-mono text-[5px] uppercase tracking-[0.16em] text-white/15">INPUT READY</span>
        </div>

        <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[1.15fr_1.5fr_1fr]">
          {/* Viewer */}
          <div className="relative border border-white/[0.07] bg-[#0b0d0d] p-3">
            <div className="mb-2 font-mono text-[5px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/45">VIEWING USER</div>
            <div className="flex items-center gap-3">
              <img src={getProfileAssets(viewingProfile).avatar} alt={viewingUsername} className="h-10 w-10 shrink-0 rounded-full border border-[#FFD400]/40 object-cover shadow-[0_0_18px_rgba(255,212,0,.08)]" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-['Oxanium'] text-sm font-bold uppercase tracking-[0.05em] text-white">{viewingUsername}</div>
                <div className="mt-0.5 font-mono text-[5px] uppercase tracking-[0.15em] text-white/20">COLLECTION ACCESS // {viewingUserId ? "REMOTE" : "LOCAL"}</div>
              </div>
              {viewingUserId && <button onClick={() => setViewingUserId(null)} className="shrink-0 border border-[#FFD400]/25 bg-[#151717] px-2 py-1 font-mono text-[5px] font-bold uppercase tracking-[0.12em] text-[#FFD400]/70 transition hover:border-[#FFD400]/60 hover:text-[#FFD400]">BACK</button>}
            </div>
          </div>

          {/* Search */}
          <div ref={searchRef} className="relative border border-white/[0.07] bg-[#0b0d0d] p-3">
            <div className="mb-2 font-mono text-[5px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/45">COLLECTOR SEARCH</div>
            <input
              value={userSearch}
              onChange={async (e) => {
                const value = e.target.value;
                setUserSearch(value);
                if (!value.trim()) { setSearchResults([]); return; }
                const { data: profiles } = await supabase.from("profiles").select(`id, username, avatar_url`).ilike("username", `%${value}%`).limit(20);
                const ids = (profiles || []).map(p => p.id);
                const { data: trading } = await supabase.from("trading_profiles").select("user_id").in("user_id", ids);
                const validIds = new Set((trading || []).map(t => t.user_id));
                setSearchResults((profiles || []).filter(p => validIds.has(p.id)));
              }}
              placeholder="SEARCH COLLECTORS..."
              className="w-full border border-white/[0.08] bg-[#111414] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/15 focus:border-[#FFD400]/50"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-3 right-3 top-[68px] z-[120] overflow-hidden border border-white/[0.1] bg-[#111414] shadow-[0_20px_45px_rgba(0,0,0,.55)]">
                {searchResults.map((u) => (
                  <button key={u.id} className="flex w-full items-center gap-3 border-b border-white/[0.05] px-3 py-2.5 text-left transition hover:bg-[#181b1b]" onClick={() => { setViewingUserId(u.id); setViewingUsername(u.username); setViewingProfile(u); setSearchResults([]); setUserSearch(""); }}>
                    <img src={getProfileAssets(u).avatar} alt={u.username} className="h-7 w-7 rounded-full border border-white/10 object-cover" />
                    <span className="font-['Oxanium'] text-xs font-bold uppercase text-white">{u.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View tools */}
          <div className="grid grid-cols-2 gap-2 border border-white/[0.07] bg-[#0b0d0d] p-3">
            <button onClick={() => { const layouts = isMobile ? (["3x3", "4x3", "4x4", "2x2"] as const) : (["3x3", "4x3", "4x4", "2x2", "6x6"] as const); const current = (layouts as readonly string[]).includes(layout) ? layout : "3x3"; const next = layouts[(layouts.indexOf(current as never) + 1) % layouts.length]; setLayout(next); setPreviewLayout(next); setSpread(1); }} className="border border-white/[0.08] bg-[#111414] px-2 py-2.5 text-center font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-[#FFD400]/75 transition hover:border-[#FFD400]/50 hover:bg-[#171a1a] hover:text-[#FFD400]">VIEW {layout}</button>
            <button onClick={() => setShowCustomization(true)} className="border border-[#FFD400]/20 bg-[#171a1a] px-2 py-2.5 text-center font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-[#FFD400]/75 transition hover:border-[#FFD400]/55 hover:text-[#FFD400]">CUSTOMIZE</button>
          </div>
        </div>
      </section>

      {/* BINDER SELECTOR */}
      <section className="mt-4 border border-white/[0.07] bg-[#101212] shadow-[0_16px_45px_rgba(0,0,0,.28)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0e0e] px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2"><span className="h-1 w-4 bg-[#FFD400]/60" /><span className="font-mono text-[6px] font-bold uppercase tracking-[0.22em] text-white/30">BINDER MATRIX</span></div>
          <span className="font-mono text-[5px] uppercase tracking-[0.16em] text-white/15">SELECT MODULE</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 p-2 sm:grid-cols-7 sm:gap-2 sm:p-3">
          {binders.map((binder) => (
            <button key={binder} onClick={() => { setSelectedBinder(binder); if (binder === "CCG") setSelectedSetId(visibleCCGOrder[0] ?? "1"); else setSelectedSetId(binderSets[binder as keyof typeof binderSets][0].id); setSpread(1); }} className={`relative overflow-hidden border px-2 py-2.5 font-['Oxanium'] text-[8px] font-bold uppercase tracking-[0.08em] transition sm:py-3 ${selectedBinder === binder ? "border-[#FFD400]/70 bg-[#FFD400] text-[#0b0b0b] shadow-[0_0_20px_rgba(255,212,0,.12)]" : "border-white/[0.07] bg-[#111414] text-white/45 hover:border-[#FFD400]/35 hover:bg-[#171a1a] hover:text-[#FFD400]"}`}>
              {selectedBinder === binder && <span className="absolute left-0 top-0 h-full w-0.5 bg-[#0b0b0b]/30" />}
              {binder}
            </button>
          ))}
        </div>
      </section>

      {/* WORKSPACE */}
      <section className="mt-4 border border-white/[0.07] bg-[#0e1010] shadow-[0_25px_80px_rgba(0,0,0,.4)]">
        <div className="flex flex-col gap-2 border-b border-white/[0.06] bg-[#0c0e0e] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex items-center gap-2"><span className="h-5 w-1 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.4)]" /><div><div className="font-mono text-[5px] uppercase tracking-[0.2em] text-[#FFD400]/45">ACTIVE WORKSPACE</div><div className="font-['Oxanium'] text-xs font-bold uppercase tracking-[0.1em] text-white">{selectedSet.name}</div></div></div>
          <div className="flex items-center gap-2"><span className="font-mono text-[5px] uppercase tracking-[0.14em] text-white/15">SPREAD</span><span className="border border-[#FFD400]/20 bg-[#151717] px-2 py-1 font-mono text-[7px] font-bold text-[#FFD400]">{String(spread).padStart(2,"0")} / {String(totalSpreads).padStart(2,"0")}</span></div>
        </div>

        <div className="grid gap-3 p-2.5 sm:p-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden xl:block border border-white/[0.07] bg-[#0b0d0d] p-3">
            <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[5px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/45">SET DIRECTORY</span><span className="font-mono text-[5px] text-white/15">{binderSets[selectedBinder as keyof typeof binderSets].length}</span></div>
            <div className="space-y-1">
              {binderSets[selectedBinder as keyof typeof binderSets].map((set) => {
                const isHidden = selectedBinder === "CCG" && hiddenCCGSets.includes(set.id);
                const active = currentSidebarSet === set.id;
                return <button key={set.id} disabled={isHidden} onClick={() => { if (selectedBinder === "CCG") setSpread(getCCGSpreadForSet(set.id)); else { setSelectedSetId(set.id); setSpread(1); } }} className={`w-full border px-2.5 py-2 text-left font-mono text-[7px] font-bold uppercase tracking-[0.06em] transition ${active ? "border-[#FFD400]/55 bg-[#FFD400]/10 text-[#FFD400]" : "border-transparent text-white/35 hover:border-white/[0.08] hover:bg-white/[0.03] hover:text-white/70"} ${isHidden ? "opacity-30 line-through" : ""}`}>
                  <span className="mr-2 text-[#FFD400]/40">//</span>{set.label}
                </button>;
              })}
            </div>
          </aside>

          {/* Binder */}
          {showClosedBinder ? (
            <div className="flex min-h-[420px] items-center justify-center border border-white/[0.06] bg-[#0b0d0d] p-8">
              <div className="max-w-md text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-[#FFD400]/20 bg-[#FFD400]/[0.04] font-mono text-lg text-[#FFD400]/50">//</div><div className="font-['Oxanium'] text-sm font-bold uppercase tracking-[0.12em] text-white/35">SET LOCKED</div><div className="mt-2 font-mono text-[6px] uppercase tracking-[0.14em] leading-relaxed text-white/15">This collection was marked in ISO as a set you are not wanting to collect.</div></div>
            </div>
          ) : (
            <div className="relative min-w-0 overflow-hidden border border-white/[0.06] bg-[#080909] p-2 sm:p-4">
              <div className="mb-2 flex items-center justify-between px-1 sm:mb-3"><span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/15">BINDER DISPLAY // LIVE</span><span className="font-mono text-[5px] uppercase tracking-[0.14em] text-[#FFD400]/35">SWIPE ENABLED</span></div>
              <div className="flex justify-center overflow-hidden">
                <div style={{ width: "100%", maxWidth: layout === "2x2" ? "560px" : layout === "4x3" || layout === "4x4" ? "900px" : layout === "6x6" ? "980px" : "980px", display: "flex", justifyContent: "center", transform: isMobile ? `scale(${androidScale})` : layout === "6x6" ? "scale(.68)" : layout === "4x3" ? "translateX(-8px) scale(.68)" : layout === "4x4" ? "translateX(-8px) scale(.58)" : "scale(.76)", transformOrigin: "top center" }}>
                  <div className="relative flex items-center gap-0" onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (!isMobile) return; const delta = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(delta) < 50) return; if (delta < 0) setSpread((s) => Math.min(totalSpreads, s + 1)); else setSpread((s) => Math.max(1, s - 1)); }} style={{ touchAction: "pan-x", padding: "34px", borderRadius: "24px", background: "linear-gradient(145deg,#242727 0%,#1a1d1d 48%,#111313 100%)", boxShadow: "0 35px 70px rgba(0,0,0,.55), inset 0 2px 2px rgba(255,255,255,.08), inset 0 -10px 20px rgba(0,0,0,.35)" }}>
                    <div className="pointer-events-none absolute inset-[10px] rounded-[18px] border border-white/[0.08]" />
                    <div className="pointer-events-none absolute inset-[18px] rounded-[14px] border border-dashed border-[#FFD400]/45" />

                    <button onClick={() => setSpread((s) => Math.max(1, s - 1))} className="absolute left-[-22px] top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#FFD400]/25 bg-[#111414] text-[#FFD400]/70 shadow-[0_8px_25px_rgba(0,0,0,.4)] transition hover:border-[#FFD400]/60 hover:bg-[#171a1a] hover:text-[#FFD400] md:flex"><ChevronLeft size={19} /></button>
                    <button onClick={() => setSpread((s) => Math.min(totalSpreads, s + 1))} className="absolute right-[-22px] top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#FFD400]/25 bg-[#111414] text-[#FFD400]/70 shadow-[0_8px_25px_rgba(0,0,0,.4)] transition hover:border-[#FFD400]/60 hover:bg-[#171a1a] hover:text-[#FFD400] md:flex"><ChevronRight size={19} /></button>

                    <div key={`left-${selectedSetId}-${layout}-${spread}`} className="relative overflow-visible rounded-xl border border-white/[0.12] bg-[#d8d8d4]/80 px-3 py-3 shadow-inner" style={{ backdropFilter: "blur(1.5px)" }}>
                      <div className="grid mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, ${layout === "6x6" ? 82 : 152}px)`, gap: layout === "6x6" ? "5px" : "10px", justifyContent: "center", alignContent: "center", minHeight: layout === "2x2" ? "420px" : undefined }}>{renderPage((spread - 1) * (slotsPerPage * 2))}</div>
                    </div>


                    <div className="w-2 shrink-0" aria-hidden="true" />

                    <div key={`right-${selectedSetId}-${layout}-${spread}`} className="relative overflow-visible rounded-xl border border-white/[0.12] bg-[#d8d8d4]/80 px-3 py-3 shadow-inner" style={{ backdropFilter: "blur(1.5px)" }}>
                      <div className="grid mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, ${layout === "6x6" ? 82 : 152}px)`, gap: layout === "6x6" ? "5px" : "10px", justifyContent: "center", alignContent: "center", minHeight: layout === "2x2" ? "420px" : undefined }}>{renderPage((spread - 1) * (slotsPerPage * 2) + slotsPerPage)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center font-mono text-[5px] uppercase tracking-[0.16em] text-white/15">SWIPE LEFT / RIGHT TO CHANGE SPREAD</div>
            </div>
          )}
        </div>
      </section>

      {/* MOBILE SET DIRECTORY */}
      <section className="mt-4 border border-white/[0.07] bg-[#101212] p-3 xl:hidden">
        <div className="mb-2 flex items-center gap-2"><span className="h-1 w-4 bg-[#FFD400]/55" /><span className="font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-white/25">SET DIRECTORY</span></div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {binderSets[selectedBinder as keyof typeof binderSets].map((set) => { const isHidden = selectedBinder === "CCG" && hiddenCCGSets.includes(set.id); const active = currentSidebarSet === set.id; return <button key={set.id} disabled={isHidden} onClick={() => { if (selectedBinder === "CCG") setSpread(getCCGSpreadForSet(set.id)); else { setSelectedSetId(set.id); setSpread(1); } }} className={`border px-2 py-2 text-left font-mono text-[6px] font-bold uppercase tracking-[0.05em] transition ${active ? "border-[#FFD400]/55 bg-[#FFD400]/10 text-[#FFD400]" : "border-white/[0.07] bg-[#0b0d0d] text-white/35 hover:text-white/70"} ${isHidden ? "opacity-30 line-through" : ""}`}>{set.label}</button>; })}
        </div>
      </section>
    </main>

    {/* CUSTOMIZATION MODAL */}
    {showCustomization && (
      <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-3 sm:p-6">
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={() => setShowCustomization(false)}
        />

        <div className="relative z-10 flex w-full max-w-[760px] flex-col overflow-hidden border border-white/[0.1] bg-[#101212] shadow-[0_30px_100px_rgba(0,0,0,.7)]">
          {/* MODAL HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0c0e0e] px-4 py-3 sm:px-5">
            <div>
              <div className="font-mono text-[5px] font-bold uppercase tracking-[0.24em] text-[#FFD400]/50">
                SYSTEM CONFIGURATION
              </div>
              <h2 className="mt-1 font-['Oxanium'] text-base font-bold uppercase tracking-[0.1em] text-white sm:text-lg">
                Viewing Customization
              </h2>
            </div>

            <button
              onClick={() => setShowCustomization(false)}
              className="flex h-8 w-8 items-center justify-center border border-white/[0.08] bg-[#151717] font-mono text-xs text-white/40 transition hover:border-[#FFD400]/50 hover:text-[#FFD400]"
            >
              ✕
            </button>
          </div>

          {/* MODAL CONTENT */}
          <div>
            <div className="p-4 sm:p-5">
              <p className="mb-4 font-mono text-[6px] uppercase tracking-[0.14em] leading-relaxed text-white/20">
                Select the slot below where your set starts to shift the organization.
              </p>

              {/* LAYOUT SELECTOR */}
              <div className="mb-5 flex flex-wrap justify-center gap-2">
                {(["3x3", "4x3", "4x4", "2x2"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setLayout(value);
                      setPreviewLayout(value);
                      setStartSlot(0);
                      setSpread(1);
                    }}
                    className={`min-w-[58px] border px-3 py-2 font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition ${
                      layout === value
                        ? "border-[#FFD400]/70 bg-[#FFD400] text-[#0b0b0b]"
                        : "border-white/[0.08] bg-[#151717] text-white/45 hover:border-[#FFD400]/35 hover:text-[#FFD400]"
                    }`}
                  >
                    {value}
                  </button>
                ))}

                {!isMobile && (
                  <button
                    onClick={() => {
                      setLayout("6x6");
                      setPreviewLayout("6x6");
                      setStartSlot(0);
                      setSpread(1);
                    }}
                    className={`min-w-[58px] border px-3 py-2 font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition ${
                      layout === "6x6"
                        ? "border-[#FFD400]/70 bg-[#FFD400] text-[#0b0b0b]"
                        : "border-white/[0.08] bg-[#151717] text-white/45 hover:border-[#FFD400]/35 hover:text-[#FFD400]"
                    }`}
                  >
                    6x6
                  </button>
                )}
              </div>

              {/* SLOT PREVIEW */}
              <div className="flex justify-center border border-white/[0.06] bg-[#080909] p-4 sm:p-6">
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 rounded-[14px] border border-white/[0.08] bg-gradient-to-br from-[#242727] to-[#111313] p-3 shadow-[0_18px_40px_rgba(0,0,0,.45)] sm:gap-3 sm:p-3.5">
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

                      // Exact same GLOBAL SLOT mapping used by the binder:
                      // LEFT = first block of slots
                      // RIGHT = second block of slots
                      // Slot 1 = global slot 0.
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
                          className="grid shrink-0 rounded-lg border border-white/[0.1] bg-[#d8d8d4]/70 p-2"
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
                                className={`aspect-[2.5/3.5] rounded border-2 transition ${
                                  startSlot === index
                                    ? "border-[#FFD400] bg-[#FFD400]/30 shadow-[0_0_10px_rgba(255,212,0,.25)]"
                                    : "border-black/10 bg-white/70 hover:border-[#FFD400]/50"
                                }`}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[5px] uppercase tracking-[0.14em] text-white/15">
                <span className="h-1 w-1 bg-[#FFD400]/60" />
                SELECT A SLOT TO SET THE COLLECTION START POSITION
              </div>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#0c0e0e] px-4 py-2.5">
            <span className="font-mono text-[5px] uppercase tracking-[0.14em] text-white/15">
              LAYOUT // {layout}
            </span>

            <button
              onClick={() => setShowCustomization(false)}
              className="border border-[#FFD400]/25 bg-[#151717] px-3 py-1.5 font-mono text-[6px] font-bold uppercase tracking-[0.12em] text-[#FFD400]/70 hover:border-[#FFD400]/55 hover:text-[#FFD400]"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
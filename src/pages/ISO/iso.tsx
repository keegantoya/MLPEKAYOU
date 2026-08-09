import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ISOMOON from "./iso-moon";
import ISOFUN from "./iso-fun";
import ISORAINBOW from "./iso-rainbow";
import ISOSTAR from "./iso-star";
import ISOTCG from "./iso-tcg";
import ISOCONTROLS from "./iso-controls";
import ISOPROMOS from "./iso-promos";
import Wishlist from "./wishlist";
import { useWishlist } from "./wishlist-in-iso";
import InProgress from "./in-progress";

type Section =
  | "wishlist"
  | "progress"
  | "moon"
  | "fun"
  | "rainbow"
  | "star"
  | "tcg"
  | "promos";

const sections = [
  { id: "wishlist", label: "Wishlist", setIds: [] },
  { id: "progress", label: "In Progress", setIds: [] },

  {
    id: "moon",
    label: "Eternal Moon",
    setIds: ["1", "2", "3"],
  },

  {
    id: "fun",
    label: "Fun Moments",
    setIds: ["7", "8", "11"],
  },

  {
    id: "rainbow",
    label: "Rainbow",
    setIds: ["5", "6"],
  },

  {
    id: "star",
    label: "Star",
    setIds: ["4"],
  },

  {
    id: "tcg",
    label: "TCG",
    setIds: ["FW", "SD", "12", "tcgpromos"],
  },

  {
    id: "promos",
    label: "Promos",
    setIds: ["9"],
  },
] as const;

export default function ISO() {
  const [selectedSection, setSelectedSection] =
    useState<Section>("moon");

  const [showControls, setShowControls] = useState(false);

const [cardCodeSearch, setCardCodeSearch] = useState("");
const [characterSearch, setCharacterSearch] = useState("");
const [searchAllCards, setSearchAllCards] = useState(false);
const [wishlistMode, setWishlistMode] = useState(false);
const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [completedSets, setCompletedSets] = useState<string[]>([]);
const [hasInProgress, setHasInProgress] = useState(false);
const [userId, setUserId] = useState<string | null>(null);
const [hideISO, setHideISO] = useState(false);
const { wishlist, toggleWishlist } = useWishlist();

useEffect(() => {
  const load = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    setUserId(user.id);

const [
  { data: profile },
  { data: progress },
  { data: isoStatus },
] = await Promise.all([
  supabase
    .from("profiles")
    .select("iso_hidden_sets, hide_iso")
    .eq("id", user.id)
    .single(),

  supabase
    .from("collection_progress_raw")
    .select("set_id, progress")
    .eq("user_id", user.id),

  supabase
    .from("iso_status")
    .select("card_key, status")
    .eq("user_id", user.id),
]);

    const p = profile as any;

    const hidden = (p?.iso_hidden_sets || []).map(String);

    const completed: string[] = [];

    (progress || []).forEach((row: any) => {
      const setId = String(row.set_id);
      const owned = Object.values(row.progress || {}).filter(
        (value) => value === true
      ).length;
const totalCards: Record<string, number> = {
  "9": 12,
  tcgpromos: 18,
};

const total = totalCards[setId];

if (total && owned >= total) {
  completed.push(setId);
}
    });

const inProgressExists = (isoStatus || []).some(
  (row: any) =>
    row.status === "purchase_in_progress" ||
    row.status === "trade_in_progress"
);

setHasInProgress(inProgressExists);

setHiddenSets(hidden);
setCompletedSets(completed);
setHideISO(p?.hide_iso ?? false);
  };

  load();
}, []);

const toggleSet = async (setId: string) => {
  if (!userId) return;

  const updated = hiddenSets.includes(setId)
    ? hiddenSets.filter((id) => id !== setId)
    : [...hiddenSets, setId];

  setHiddenSets(updated);

  await supabase
    .from("profiles")
    .update({
      iso_hidden_sets: updated,
    })
    .eq("id", userId);
};

const toggleHideISO = async () => {
  if (!userId) return;

  const next = !hideISO;
  setHideISO(next);

  await supabase
    .from("profiles")
    .update({
      hide_iso: next,
    })
    .eq("id", userId);
};

const isSearching =
  cardCodeSearch.trim() !== "" || characterSearch.trim() !== "";

const visibleSections = sections.filter((section) => {
  // Wishlist is always available.
  if (section.id === "wishlist") {
    return true;
  }

  // In Progress only appears when there is
  // at least one purchase/trade in progress.
  if (section.id === "progress") {
    return hasInProgress;
  }

  // A category remains visible if at least ONE
  // underlying set is still active.
  return section.setIds.some(
    (setId) =>
      !hiddenSets.includes(setId) &&
      !completedSets.includes(setId)
  );
});

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#090b0d] text-[#e8edf0] kayou-scrollbar">

{/* Mobile Navigation */}
<div className="md:hidden border-b border-[#2b3034] pt-8">

  <div className="relative px-5 pb-4">

    <div className="absolute left-0 top-0 h-5 w-5 border-l border-t border-yellow-400/70" />
    <div className="absolute right-0 top-0 h-5 w-5 border-r border-t border-yellow-400/70" />

    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_10px_#facc15]" />

      <span className="font-oxanium text-[8px] font-bold uppercase tracking-[0.45em] text-yellow-400">
        SYSTEM MODULE 04
      </span>
    </div>

    <div className="mt-3 flex items-center justify-between gap-4">

      <div>
        <h1 className="font-oxanium text-2xl font-black uppercase tracking-[0.12em] text-white">
          Missing Cards
        </h1>

        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
          ISO DATABASE // ONLINE
        </p>
      </div>

      <button
        onClick={() => setShowControls(true)}
        className="border border-yellow-400/60 bg-yellow-400/10 px-3 py-2 font-oxanium text-[9px] font-bold uppercase tracking-[0.15em] text-yellow-400 transition-all duration-200 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.25)]"
      >
        ◈ CONTROLS
      </button>

    </div>

  </div>

  <div className="flex overflow-x-auto border-t border-[#202528]">
{visibleSections
  .filter((item) => wishlistMode || item.id !== "wishlist")
  .map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setCardCodeSearch("");
            setCharacterSearch("");
            setSelectedSection(item.id as Section);
          }}
          className={`relative mx-1 whitespace-nowrap px-4 py-3 font-oxanium text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
            selectedSection === item.id
              ? "border-b-2 border-yellow-400 text-yellow-400"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          {item.label}
        </button>
      ))}
  </div>

</div>

      <div className="flex">

{/* Desktop Sidebar */}
<aside className="hidden md:block sticky top-0 h-screen w-56 shrink-0 overflow-y-auto border-r border-[#2b3034] bg-[#0b0e10] kayou-scrollbar">

  {/* Header */}
  <div className="relative border-b border-[#2b3034] px-4 py-4">

    <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-yellow-400/70" />
    <div className="absolute right-0 top-0 h-4 w-4 border-r border-t border-yellow-400/70" />

    <div className="flex items-center gap-2">
      <div className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_10px_#facc15]" />

      <span className="font-oxanium text-[7px] font-bold uppercase tracking-[0.35em] text-yellow-400">
        SYSTEM MODULE 04
      </span>
    </div>

    <h1 className="mt-3 font-oxanium text-2xl font-black uppercase tracking-[0.08em] text-white">
      Missing Cards
    </h1>

    <p className="mt-3 font-mono text-[8px] uppercase leading-4 tracking-[0.08em] text-zinc-500">
      Search your ISO, find any card's origin, or set your Wishlist.
    </p>

  </div>

  {/* Navigation */}
  <nav className="px-2 py-3">

    <div className="mb-2 px-2 font-mono text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-600">
      COLLECTION DATABASE
    </div>

{visibleSections
  .filter((item) => wishlistMode || item.id !== "wishlist")
  .map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setCardCodeSearch("");
            setCharacterSearch("");
            setSelectedSection(item.id as Section);
          }}
          className={`group relative mb-1 flex w-full items-center overflow-hidden border px-3 py-2.5 text-left font-oxanium text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-200 ${
            selectedSection === item.id
              ? "border-yellow-400/70 bg-yellow-400/10 text-yellow-300 shadow-[inset_2px_0_0_#facc15,0_0_15px_rgba(250,204,21,0.08)]"
              : "border-transparent text-zinc-500 hover:border-[#30363a] hover:bg-[#14181b] hover:text-white"
          }`}
        >

          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

          <span
            className={`relative mr-2 h-1.5 w-1.5 shrink-0 ${
              selectedSection === item.id
                ? "bg-yellow-400 shadow-[0_0_8px_#facc15]"
                : "bg-zinc-700 group-hover:bg-yellow-400"
            }`}
          />

          <span className="relative flex-1 truncate">
            {item.label}
          </span>

          <span className="relative ml-2 font-mono text-[7px] text-zinc-700 group-hover:text-yellow-400/70">
            {String(sections.findIndex((x) => x.id === item.id) + 1).padStart(2, "0")}
          </span>

        </button>
      ))}

  </nav>

  {/* ISO Controls */}
  <div className="border-t border-[#2b3034] p-3">

    <div className="mb-2 flex items-center gap-2">
      <span className="h-1 w-1 bg-yellow-400 shadow-[0_0_6px_#facc15]" />

      <span className="font-mono text-[7px] uppercase tracking-[0.25em] text-zinc-600">
        CONTROL TERMINAL
      </span>
    </div>

    <button
      onClick={() => setShowControls(true)}
      className="group relative w-full overflow-hidden border border-yellow-400/50 bg-[#111518] px-3 py-2.5 font-oxanium text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-400 transition-all duration-200 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.25)]"
    >

      <span className="absolute left-0 top-0 h-px w-6 bg-yellow-400" />
      <span className="absolute bottom-0 right-0 h-px w-6 bg-yellow-400" />

      <span className="mr-1.5">◈</span>
      ISO CONTROLS

    </button>

  </div>

</aside>
{/* Content */}
<main
  className={`relative flex-1 overflow-x-hidden bg-[#0b0e10] px-4 pb-6 md:px-8 md:pb-12 ${
    cardCodeSearch || characterSearch.trim()
      ? "pt-6 md:pt-0"
      : "pt-0"
  }`}
>

{wishlistMode ? (
  <>
    <div className="mb-6">
<ISOCONTROLS
  cardCodeSearch={cardCodeSearch}
  onCardCodeSearchChange={setCardCodeSearch}
  characterSearch={characterSearch}
  onCharacterSearchChange={setCharacterSearch}
  searchAllCards={searchAllCards}
  onSearchAllCardsChange={setSearchAllCards}
  wishlistMode={wishlistMode}
  onWishlistModeChange={setWishlistMode}
  availableSets={[]}
  hiddenSetIds={[]}
  onHideSet={() => {}}
  wishlistCharacterOnly
  hideISO={hideISO}
  onToggleHideISO={toggleHideISO}
  onClose={() => setShowControls(false)}
/>
    </div>

    {selectedSection === "wishlist" && (
  <Wishlist />
)}

{selectedSection === "progress" && (
  <InProgress />
)}

    {selectedSection === "moon" && (
<ISOMOON
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
    )}

    {selectedSection === "fun" && (
      <ISOFUN
        cardCodeSearch={cardCodeSearch}
        characterSearch={characterSearch}
        searchAllCards
        hiddenSets={hiddenSets}
        wishlistMode={wishlistMode}
      />
    )}

    {selectedSection === "rainbow" && (
<ISORAINBOW
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
    )}

    {selectedSection === "star" && (
      <ISOSTAR
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
      />
    )}

    {selectedSection === "tcg" && (
      <ISOTCG
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
      />
    )}

    {selectedSection === "promos" && (
      <ISOPROMOS
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
      />
    )}
  </>
) : isSearching ? (
    <>

{selectedSection === "progress" && (
  <InProgress />
)}

<ISOMOON
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOFUN
  cardCodeSearch={cardCodeSearch}
      characterSearch={characterSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
    wishlistMode={wishlistMode}
/>

<ISORAINBOW
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOSTAR
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOTCG
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOPROMOS
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

    </>
) : (
    <>

      {selectedSection === "progress" && (
        <InProgress />
      )}

      {selectedSection === "moon" && (
<ISOMOON
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "fun" && (
<ISOFUN
  cardCodeSearch={cardCodeSearch}
    characterSearch={characterSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
    wishlistMode={wishlistMode}
/>
      )}

      {selectedSection === "rainbow" && (
<ISORAINBOW
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "star" && (
<ISOSTAR
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "tcg" && (
<ISOTCG
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "promos" && (
<ISOPROMOS
  cardCodeSearch={cardCodeSearch}
  characterSearch={characterSearch}
  wishlistMode={wishlistMode}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
)}

    </>
  )}

</main>

      </div>

      {showControls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative">
            <button
              onClick={() => setShowControls(false)}
              className="absolute right-3 top-3 rounded bg-red-600 px-3 py-1 text-white"
            >
              ✕
            </button>

<ISOCONTROLS
  cardCodeSearch={cardCodeSearch}
  onCardCodeSearchChange={setCardCodeSearch}
  characterSearch={characterSearch}
  onCharacterSearchChange={setCharacterSearch}
  searchAllCards={searchAllCards}
  onSearchAllCardsChange={setSearchAllCards}
  wishlistMode={wishlistMode}
  onWishlistModeChange={setWishlistMode}
  availableSets={[
    {
      id: "moon",
      name: "Eternal Moon",
      children: [
        { id: "1", name: "First Edition" },
        { id: "2", name: "Second Edition" },
        { id: "3", name: "Third Edition" },
      ],
    },
    {
      id: "fun",
      name: "Fun Moments",
      children: [
        { id: "7", name: "First Edition" },
        { id: "8", name: "Second Edition" },
        { id: "11", name: "Third Edition" },
      ],
    },
    {
      id: "rainbow",
      name: "Rainbow",
      children: [
        { id: "5", name: "First Edition" },
        { id: "6", name: "Second Edition" },
      ],
    },
    {
      id: "star",
      name: "Star",
      children: [
        { id: "4", name: "First Edition" },
      ],
    },
    {
      id: "tcg",
      name: "TCG",
      children: [
        { id: "FW", name: "Fantasy Wonderland" },
        { id: "SD", name: "Friendships Begin" },
        { id: "12", name: "Discord" },
        { id: "tcgpromos", name: "TCG Promos" },
      ],
    },
    {
      id: "promos",
      name: "Promos",
      children: [
        { id: "9", name: "Promotional Cards" },
      ],
    },
  ]}
hiddenSetIds={hiddenSets}
onHideSet={toggleSet}
hideISO={hideISO}
onToggleHideISO={toggleHideISO}
onClose={() => setShowControls(false)}
/>
          </div>
        </div>
      )}

    </div>
  );
}
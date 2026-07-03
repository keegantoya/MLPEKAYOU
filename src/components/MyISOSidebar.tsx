import { useState } from "react";
import {
  LayoutDashboard,
  Grid3X3,
  Layers3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SetItem {
  id: string;
  name: string;
}

interface MyISOSidebarProps {
  mode: "CCG" | "TCG";
  availableSets: SetItem[];
  onSelectSet: (setId: string | null) => void;
  selectedSetId: string | null;
  availableRarities: string[];
selectedRarity: string | null;
onSelectRarity: (rarity: string | null) => void;
setMode: (mode: "CCG" | "TCG") => void;
onClearSelection: () => void;
viewAllCardCodes: boolean;
onToggleViewAllCardCodes: () => void;
isoStatuses: Record<string, string>;
allSets: SetItem[];
hiddenSets: string[];
onToggleHiddenSet: (setId: string) => void;
cardCodeSearch: string;
onCardCodeSearchChange: (value: string) => void;
}

const CCG_RARITIES = [
  "R",
  "SR",
  "SSR",
  "HR",
  "UR",
  "LSR",
  "SGR",
  "SC",
  "FR",
  "TR",
  "TGR",
  "MTR",
  "USR",
  "XR",
  "N",
  "SN",
  "UGR",
  "CR",
  "PR",
  "LC",
];

const TCG_RARITIES = [
  "Common",
  "Uncommon",
  "Silver Rare",
  "Special Rare",
  "Gold Rare",
  "Colorful Rare",
  "Emerald Rare",
  "Ruby Rare",
  "※Emerald Rare",
  "※Special Rare",
  "※Gold Rare",
  "※Colorful Rare",
  "※Ruby Rare",
];

const NAV_ITEMS = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    active: false,
  },
];

const MyISOSidebar = ({
  mode,
  availableSets,
  onSelectSet,
  selectedSetId,
  availableRarities,
selectedRarity,
onSelectRarity,
setMode,
onClearSelection,
viewAllCardCodes,
onToggleViewAllCardCodes,
cardCodeSearch,
onCardCodeSearchChange,
isoStatuses,
allSets,
hiddenSets,
onToggleHiddenSet,
}: MyISOSidebarProps) => {
const rarities =
  selectedSetId === null
    ? []
    : availableRarities;

const [showSetsSection, setShowSetsSection] = useState(false);
const [showSetPopup, setShowSetPopup] = useState(false);
const [showHideSets, setShowHideSets] = useState(false);
const [showCardsInProgress, setShowCardsInProgress] = useState(false);

const purchaseCards = Object.entries(isoStatuses)
  .filter(([, status]) => status === "purchase_in_progress")
  .map(([cardKey]) => cardKey);

const tradeCards = Object.entries(isoStatuses)
  .filter(([, status]) => status === "trade_in_progress")
  .map(([cardKey]) => cardKey);

const visibleHideSets = allSets.filter((set) => {
const isAllowed =
  mode === "CCG"
    ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "11"].includes(set.id)
    : ["SD_STARTERS", "SD_BONUS", "FW", "TCG_PROMOS"].includes(set.id);

  if (!isAllowed) {
    return false;
  }

  // Always show hidden sets so they can be unchecked.
  if (hiddenSets.includes(set.id)) {
    return true;
  }

  // Show sets that are still incomplete and available in the sidebar.
  return availableSets.some(
    (availableSet) => availableSet.id === set.id
  );
});
    

  return (
   <aside className="relative z-10 w-[340px] overflow-visible rounded-[2.5rem] border border-[#d4c08a] bg-gradient-to-b from-[#8b6ab5] to-[#7a5aa6] text-white shadow-[0_20px_60px_rgba(75,46,131,0.18)] backdrop-blur-sm pb-4">
      {/* COLLECTION HEADER */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-white">
          Collection
        </h2>
      </div>

      {/* NAVIGATION */}
      <nav className="px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <button
  key={item.label}
  type="button"
  onClick={() => {
    if (item.label === "Overview") {
      onSelectSet(null);
      onSelectRarity(null);
      setShowSetPopup(false);
    }
  }}
  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
    item.active
      ? "bg-gradient-to-r from-[#7c5aa6] to-[#8b63b6] text-white shadow-lg"
      : "text-white/85 hover:bg-white/5 hover:text-white"
  }`}
>
  <Icon size={16} strokeWidth={2.2} />
  <span>{item.label}</span>
</button>
          );
        })}

        <button
          type="button"
          onClick={onToggleViewAllCardCodes}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            viewAllCardCodes
              ? "bg-gradient-to-r from-[#7c5aa6] to-[#8b63b6] text-white shadow-lg"
              : "text-white/85 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Grid3X3 size={16} strokeWidth={2.2} />
          <span>{viewAllCardCodes ? "Go back to ISO mode" : "View ALL card codes"}</span>
        </button>

        {viewAllCardCodes && (
  <div className="px-3 mt-3">
    <input
      type="text"
      value={cardCodeSearch}
onChange={(e) =>
  onCardCodeSearchChange(
    e.target.value
      .toUpperCase()
      .replace(/#/g, "※")
.replace(/<>/g, "◇")
.replace(/<ZR/g, "◇ZR")
.replace(/<AR/g, "◇AR")
.replace(/<CR/g, "◇CR")
.replace(/<N/g, "◇N")
  )
}
      placeholder="Type # for ※ <> for ◇"
      className="
        w-full
        px-4 py-2.5
        rounded-xl
        bg-white/10
        border border-white/10
        text-white
        placeholder:text-white/50
        text-base
        outline-none
      "
    />
  </div>
)}

        {(purchaseCards.length > 0 || tradeCards.length > 0) && (
  <button
    type="button"
    onClick={() => {
      onSelectSet("CARDS_IN_PROGRESS");
      onSelectRarity(null);
    }}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      selectedSetId === "CARDS_IN_PROGRESS"
        ? "bg-gradient-to-r from-[#7c5aa6] to-[#8b63b6] text-white shadow-lg"
        : "text-white/85 hover:bg-white/5 hover:text-white"
    }`}
  >
    <Layers3 size={16} strokeWidth={2.2} />
    <span>Cards In Progress</span>
  </button>
)}

      </nav>

      <div className="px-3 mt-3 mb-1">
  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => {
  setMode("CCG");
  onCardCodeSearchChange("");
  onClearSelection();
}}
      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
        mode === "CCG"
          ? "bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border-[#d4af37] shadow-lg"
          : "bg-white/10 text-white border-white/10 hover:bg-white/15"
      }`}
    >
      CCG
    </button>

    <button
      type="button"
      onClick={() => {
  setMode("TCG");
  onCardCodeSearchChange("");
  onClearSelection();
}}
      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
        mode === "TCG"
          ? "bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border-[#d4af37] shadow-lg"
          : "bg-white/10 text-white border-white/10 hover:bg-white/15"
      }`}
    >
      TCG
    </button>
  </div>
</div>

      {/* DIVIDER */}
      <div className="mx-6 my-5 h-px bg-white/10" />

      {/* FILTERS HEADER */}
      <div className="px-6 pb-4">
        <h3 className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/60">
          Filters
        </h3>
      </div>

{/* HIDE SETS */}
<div className="px-3 pb-6">
  <button
    type="button"
    onClick={() => setShowHideSets(!showHideSets)}
    className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-white"
  >
    <span>Hide Sets</span>
    <ChevronDown
      size={16}
      className={`text-white/60 transition-transform ${
        showHideSets ? "rotate-180" : ""
      }`}
    />
  </button>

 {showHideSets && (
    <div className="mt-2 space-y-2">
      {visibleHideSets.map((set) => (
        <label
          key={set.id}
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-white/85 hover:bg-white/10"
        >
          <input
            type="checkbox"
            checked={hiddenSets.includes(set.id)}
            onChange={() => onToggleHiddenSet(set.id)}
          />
          <span>{set.name}</span>
        </label>
      ))}
    </div>
  )}
</div>

{/* SETS FILTER */}
<div className="px-3 relative">
<button
  type="button"
onClick={() => {
  setShowSetsSection(!showSetsSection);
  setShowSetPopup(false);
}}
  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-white"
>
  <span>Sets</span>
  <ChevronDown
    size={16}
    className={`text-white/60 transition-transform ${
      showSetPopup ? "rotate-180" : ""
    }`}
  />
</button>

{/* SEARCH BOX */}
{showSetsSection && (
  <div className="mt-2 mb-5 relative">
    <button
      type="button"
      onClick={() => setShowSetPopup(!showSetPopup)}
      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium
                 bg-white/10 border border-white/10 text-white/70
                 hover:bg-white/15 transition-all flex items-center justify-between"
    >
      <span>
        {availableSets.filter((set) => set.id === selectedSetId)[0]?.name ||
          "All Sets"}
      </span>
      <ChevronDown
        size={16}
        className="text-white/60 rotate-180 transition-transform"
      />
    </button>

{showSetPopup && (
  <div
  className="absolute top-full left-0 mt-2 w-full
             rounded-3xl border border-[#d4c08a]
             bg-gradient-to-b from-[#8b6ab5] to-[#7a5aa6]
             shadow-[0_25px_80px_rgba(75,46,131,0.35)]
             p-3 z-[99999]"
>
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          onSelectSet(null);
          onSelectRarity(null);
          setShowSetPopup(false);
        }}
        className="w-full text-left px-4 py-2.5 rounded-xl
                   text-sm font-medium text-[#f5e6a8]
                   bg-white/10 hover:bg-white/15
                   transition-all border border-white/10"
      >
        All Sets
      </button>

      {availableSets.map((set) => (
        <button
          key={set.id}
          type="button"
          onClick={() => {
            onSelectSet(set.id);
            onSelectRarity(null);
            setShowSetPopup(false);
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl
                     text-sm font-medium text-white/85
                     hover:bg-white/10 hover:text-white
                     transition-all"
        >
          {set.name}
        </button>
      ))}
    </div>
  </div>
)}
  </div>
)}
</div>

{/* RARITIES FILTER */}
{selectedSetId && rarities.length > 0 && (
  <div className="px-3">
    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-white">
      <span>Rarities</span>
      <ChevronUp size={16} className="text-white/60" />
    </button>

    <div className="mt-2 space-y-2 pb-6">
{rarities.map((rarity) => (
  <button
    key={rarity}
    type="button"
    onClick={() =>
      onSelectRarity(
        selectedRarity === rarity ? null : rarity
      )
    }
    className={`w-full text-left px-4 py-2 rounded-xl
                text-sm font-medium transition-all ${
      selectedRarity === rarity
        ? "bg-gradient-to-r from-[#7c5aa6] to-[#8b63b6] text-white shadow-lg"
        : "text-white/85 hover:bg-white/10 hover:text-white"
    }`}
  >
    {rarity === "SN"
  ? "◇N"
  : rarity === "SHINING ZR"
  ? "◇ZR"
  : rarity === "SZR"
  ? "◇ZR"
  : rarity === "SCR" && selectedSetId !== "4"
? "◇CR"
: rarity === "SAR"
? "◇AR"
: rarity}
  </button>
))}
    </div>
  </div>
)}
    </aside>
  );
};

export default MyISOSidebar;
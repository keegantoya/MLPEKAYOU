import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";

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
mobileViewMode: 2 | 3 | 4 | 5;
onMobileViewModeChange: (value: 2 | 3 | 4 | 5) => void;
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
mobileViewMode,
onMobileViewModeChange,
}: MyISOSidebarProps) => {
const rarities =
  selectedSetId === null
    ? []
    : availableRarities;

const [showSetsSection, setShowSetsSection] = useState(false);
const [showSetPopup, setShowSetPopup] = useState(false);
const [showViewingModePopup, setShowViewingModePopup] = useState(false);
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
<aside
  className="
    relative
    z-10
    w-[340px]
    overflow-visible
    rounded-[2.5rem]
    border
    border-[#4f4f4f]
    bg-[#232323]
    text-white
    shadow-[0_20px_60px_rgba(0,0,0,.45)]
    backdrop-blur-sm
    pb-4
    font-['Oxanium']
  "
>

  {/* COLLECTION HEADER */}
<div className="px-6 pt-7 pb-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#8a8a8a]">
        My ISO
      </p>

      <h2 className="mt-1 text-3xl font-bold text-[#e6c35a] leading-none">
        Missing Cards
      </h2>
    </div>

    <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#4b4b4b] to-transparent" />
  </div>
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
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                item.active
                  ? "bg-[#d4af37] border-[#d4af37] text-[#1b1b1b] shadow-lg"
                  : "bg-[#232323] border-[#4d4d4d] text-[#d8d8d8] hover:bg-[#2f2f2f] hover:border-[#d4af37] hover:text-[#e6c35a]"
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
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            viewAllCardCodes
              ? "bg-[#d4af37] border-[#d4af37] text-[#1b1b1b] shadow-lg"
              : "bg-[#232323] border-[#4d4d4d] text-[#d8d8d8] hover:bg-[#2f2f2f] hover:border-[#d4af37] hover:text-[#e6c35a]"
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
                rounded-xl
                border
                border-[#5a5a5a]
                bg-[#232323]
                px-4
                py-2.5
                text-base
                text-white
                placeholder:text-[#8d8d8d]
                caret-[#d4af37]
                outline-none
                transition
                focus:border-[#d4af37]
                focus:ring-2
                focus:ring-[#d4af37]/30
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
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              selectedSetId === "CARDS_IN_PROGRESS"
                ? "bg-[#d4af37] border-[#d4af37] text-[#1b1b1b] shadow-lg"
                : "bg-[#232323] border-[#4d4d4d] text-[#d8d8d8] hover:bg-[#2f2f2f] hover:border-[#d4af37] hover:text-[#e6c35a]"
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
                ? "bg-[#d4af37] text-[#1b1b1b] border-[#d4af37] shadow-lg"
                : "bg-[#232323] text-[#d8d8d8] border-[#4d4d4d] hover:bg-[#2f2f2f] hover:border-[#d4af37] hover:text-[#e6c35a]"
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
                ? "bg-[#d4af37] text-[#1b1b1b] border-[#d4af37] shadow-lg"
                : "bg-[#232323] text-[#d8d8d8] border-[#4d4d4d] hover:bg-[#2f2f2f] hover:border-[#d4af37] hover:text-[#e6c35a]"
            }`}
          >
            TCG
          </button>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="mx-6 my-5 h-px bg-[#3b3b3b]" />

      {/* FILTERS HEADER */}
      <div className="px-6 pb-4">
        <h3 className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#9c9c9c]">
          Filters
        </h3>
      </div>
<div className="px-3 pb-4 relative lg:hidden">
  <button
    type="button"
    onClick={() => setShowViewingModePopup(!showViewingModePopup)}
    className="
      w-full
      flex
      items-center
      justify-between
      rounded-xl
      border
      border-[#4d4d4d]
      bg-[#232323]
      px-4
      py-2.5
      text-sm
      font-medium
      text-[#e6c35a]
      transition
      hover:border-[#d4af37]
      hover:bg-[#2f2f2f]
      hover:text-[#e6c35a]
    "
  >
    <span>
      {`Rows of ${mobileViewMode}`}
      {mobileViewMode === 2 ? " (Default)" : ""}
    </span>

    <ChevronDown
      size={16}
      className={`text-[#b5b5b5] transition-transform ${
        showViewingModePopup ? "rotate-180" : ""
      }`}
    />
  </button>

  {showViewingModePopup && (
    <div
      className="
        absolute
        top-full
        left-0
        z-[99999]
        mt-2
        w-full
        rounded-3xl
        border
        border-[#4d4d4d]
        bg-[#232323]
        p-3
        shadow-[0_25px_80px_rgba(0,0,0,.55)]
      "
    >
      {[2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            onMobileViewModeChange(value as 2 | 3 | 4 | 5);
            setShowViewingModePopup(false);
          }}
          className={`
            w-full
            rounded-xl
            px-4
            py-2.5
            text-left
            text-sm
            font-medium
            transition
            ${
              mobileViewMode === value
                ? "border border-[#d4af37] bg-[#2d2d2d] text-[#e6c35a]"
                : "text-[#e6c35a] hover:bg-[#2f2f2f] hover:text-[#e6c35a]"
            }
          `}
        >
          Rows of {value}
          {value === 2 && " (Default)"}
        </button>
      ))}
    </div>
  )}
</div>

{/* HIDE SETS */}
<div className="px-3 pb-6">
  <button
    type="button"
    onClick={() => setShowHideSets(!showHideSets)}
    className="w-full flex items-center justify-between rounded-xl border border-[#4d4d4d] bg-[#232323] px-3 py-2 text-sm font-semibold text-[#e6c35a] transition hover:border-[#d4af37] hover:bg-[#2f2f2f]"
  >
    <span>Hide Sets</span>
    <ChevronDown
      size={16}
      className={`text-[#b5b5b5] transition-transform ${
        showHideSets ? "rotate-180" : ""
      }`}
    />
  </button>

  {showHideSets && (
    <div className="mt-2 space-y-2">
      {visibleHideSets.map((set) => (
        <label
          key={set.id}
          className="flex items-center gap-3 rounded-xl border border-[#4d4d4d] bg-[#232323] px-4 py-2 text-sm text-[#d8d8d8] transition hover:border-[#d4af37] hover:bg-[#2f2f2f]"
        >
          <input
            type="checkbox"
            checked={hiddenSets.includes(set.id)}
            onChange={() => onToggleHiddenSet(set.id)}
            className="accent-[#d4af37]"
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
    className="w-full flex items-center justify-between rounded-xl border border-[#4d4d4d] bg-[#232323] px-3 py-2 text-sm font-semibold text-[#e6c35a] transition hover:border-[#d4af37] hover:bg-[#2f2f2f]"
  >
    <span>Sets</span>
    <ChevronDown
      size={16}
      className={`text-[#b5b5b5] transition-transform ${
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
        className="
          w-full
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-[#4d4d4d]
          bg-[#232323]
          px-4
          py-2.5
          text-sm
          font-medium
          text-[#d8d8d8]
          transition
          hover:border-[#d4af37]
          hover:bg-[#2f2f2f]
          hover:text-[#e6c35a]
        "
      >
        <span>
          {availableSets.filter((set) => set.id === selectedSetId)[0]?.name ||
            "All Sets"}
        </span>

        <ChevronDown
          size={16}
          className="text-[#b5b5b5] rotate-180 transition-transform"
        />
      </button>

      {showSetPopup && (
        <div
          className="
            absolute
            top-full
            left-0
            z-[99999]
            mt-2
            w-full
            rounded-3xl
            border
            border-[#4d4d4d]
            bg-[#232323]
            p-3
            shadow-[0_25px_80px_rgba(0,0,0,.55)]
          "
        >
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectSet(null);
                onSelectRarity(null);
                setShowSetPopup(false);
              }}
              className="
                w-full
                rounded-xl
                border
                border-[#d4af37]
                bg-[#2d2d2d]
                px-4
                py-2.5
                text-left
                text-sm
                font-medium
                text-[#e6c35a]
                transition
                hover:bg-[#383838]
              "
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
                className="
                  w-full
                  rounded-xl
                  px-4
                  py-2.5
                  text-left
                  text-sm
                  font-medium
                  text-[#d8d8d8]
                  transition
                  hover:bg-[#2f2f2f]
                  hover:text-[#e6c35a]
                "
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
  ? "bg-[#d4af37] text-[#1b1b1b] shadow-lg border border-[#d4af37]"
  : "text-white/85 hover:bg-[#2f2f2f] hover:text-[#e6c35a]"
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
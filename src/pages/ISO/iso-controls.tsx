import { useState } from "react";

interface ISOControlsProps {
  cardCodeSearch: string;
  onCardCodeSearchChange: (value: string) => void;

  characterSearch: string;
  onCharacterSearchChange: (value: string) => void;

  searchAllCards: boolean;
  onSearchAllCardsChange: (value: boolean) => void;

  wishlistMode: boolean;
wishlistCharacterOnly?: boolean;
onWishlistModeChange: (value: boolean) => void;

  availableSets: {
    id: string;
    name: string;
    children: {
      id: string;
      name: string;
    }[];
  }[];

  hiddenSetIds: string[];

  onHideSet: (setId: string) => void;

hideISO: boolean;
onToggleHideISO: () => void;

onClose: () => void;
}

export default function ISOCONTROLS({
  cardCodeSearch,
  onCardCodeSearchChange,
  characterSearch,
  onCharacterSearchChange,
  searchAllCards,
  onSearchAllCardsChange,
  wishlistMode,
  wishlistCharacterOnly = false,
  onWishlistModeChange,
  availableSets,
  hiddenSetIds,
  onHideSet,
hideISO,
onToggleHideISO,
onClose,
}: ISOControlsProps) {
  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value.toUpperCase();

    value = value.replace(/<>/g, "◇");
    value = value.replace(/#/g, "※");

    value = value.replace(/<ZR/g, "◇ZR");
    value = value.replace(/<AR/g, "◇AR");
    value = value.replace(/<CR/g, "◇CR");
    value = value.replace(/<N/g, "◇N");

    onCardCodeSearchChange(value);
  };

  const handleCharacterSearchChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  onCharacterSearchChange(e.target.value);
};

const [showHideSets, setShowHideSets] = useState(false);
const [expanded, setExpanded] = useState<string | null>(null);

if (wishlistCharacterOnly) {
  return (
<div className="relative mb-6 overflow-hidden border border-[#30363a] bg-[#0a0d0f] p-4 text-white">

  {/* HUD corners */}
  <span className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-yellow-400/80" />
  <span className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-yellow-400/50" />
  <span className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-yellow-400/50" />
  <span className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-yellow-400/70" />

  {/* Header */}
  <div className="mb-3 flex items-center justify-between border-b border-[#292f33] pb-2.5">
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_8px_#facc15]" />

      <span className="font-oxanium text-[9px] font-bold uppercase tracking-[0.22em] text-yellow-400">
        Character Search
      </span>
    </div>

    <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-700">
      QUERY
    </span>
  </div>

  {/* Search */}
  <div className="relative overflow-hidden border border-[#343a3e] bg-[#111518] transition-all duration-200 focus-within:border-yellow-400/70 focus-within:shadow-[0_0_18px_rgba(250,204,21,0.08)]">

    <input
      type="text"
      value={characterSearch}
      onChange={handleCharacterSearchChange}
      placeholder="SEARCH CHARACTER..."
      autoComplete="off"
      spellCheck={false}
      className="
        w-full
        border-0
        bg-transparent
        px-3
        py-3
        pr-16
        font-mono
        text-[11px]
        uppercase
        tracking-[0.08em]
        text-white
        placeholder:text-zinc-700
        caret-yellow-400
        outline-none
      "
    />

    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-zinc-600">
      SEARCH
    </span>

    <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-yellow-400/60 via-yellow-400/20 to-transparent" />
  </div>

</div>
  );
}

  return (
<aside className="relative w-[300px] shrink-0 overflow-visible border border-[#30363a] bg-[#0a0d0f] p-4 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]">

  {/* HUD corner brackets */}
  <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400/80" />
  <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400/80" />
  <div className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-yellow-400/50" />
  <div className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-yellow-400/50" />

  {/* Header */}
<div className="relative mb-4 border-b border-[#292f33] pb-3">

  <div className="mb-2 flex items-center gap-2">
    <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_10px_#facc15]" />

    <span className="font-mono text-[7px] font-bold uppercase tracking-[0.45em] text-yellow-400">
      SYSTEMS ONLINE... ISO
    </span>

    <span className="ml-auto font-mono text-[7px] text-zinc-700">
      04
    </span>
  </div>

  <div className="flex items-center justify-between gap-3">

    <h1 className="font-oxanium text-xl font-black uppercase tracking-[0.12em] text-white">
      ISO Controls
    </h1>

    <button
      type="button"
      onClick={onClose}
      className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#343a3e] bg-[#111518] font-mono text-xs text-zinc-500 transition-colors hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
      aria-label="Close ISO Controls"
    >
      ✕
    </button>

  </div>

  <div className="mt-1 flex items-center justify-between">
    <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-600">
      CONTROL INTERFACE
    </span>
  </div>

  <div className="absolute bottom-0 left-0 h-px w-16 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />

</div>

<div className="space-y-1.5">
 
 <label
  className={`group mt-3 flex min-h-0 items-center justify-between border px-3 py-2.5 transition-all duration-200 ${
    wishlistMode
      ? "cursor-not-allowed border-zinc-800 bg-[#111315] opacity-40"
      : searchAllCards
      ? "cursor-pointer border-yellow-400/70 bg-yellow-400/[0.06] shadow-[inset_2px_0_0_#facc15]"
      : "cursor-pointer border-[#343a3e] bg-[#111518] hover:border-yellow-400/50 hover:bg-[#151a1d]"
  }`}
>
  <div className="min-w-0 pr-3">
    <div className="flex items-center gap-2 font-oxanium text-[10px] font-bold uppercase tracking-[0.16em] text-white">
      <span
        className={`h-1 w-1 ${
          searchAllCards
            ? "bg-yellow-400 shadow-[0_0_7px_#facc15]"
            : "bg-zinc-700"
        }`}
      />
      Show All Cards
    </div>

    <div className="mt-0.5 pl-3 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-600">
      Display all cards in database.
    </div>
  </div>

  <input
    type="checkbox"
    checked={searchAllCards}
    disabled={wishlistMode}
    onChange={(e) => onSearchAllCardsChange(e.target.checked)}
    className="h-4 w-4 shrink-0 accent-yellow-400 disabled:cursor-not-allowed"
  />
</label>

 
  <label className="font-oxanium text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-400">
    Card Code Search
  </label>

  <div className="relative">
    <input
      type="text"
      value={cardCodeSearch}
      onChange={handleSearchChange}
      placeholder="TYPE # FOR ※  •  <> FOR ◇"
      autoComplete="off"
      spellCheck={false}
className="
  w-full
  border
  border-[#343a3e]
  bg-[#111518]
  px-3
  py-2
  pr-8
  font-mono
  text-xs
  uppercase
  tracking-wider
  text-white
  placeholder:text-zinc-600
  caret-yellow-400
  outline-none
  transition-colors
  focus:border-yellow-400/70
  focus:bg-[#151a1d]
"
    />

<span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[7px] font-bold tracking-widest text-yellow-400/40">
  CARD CODE
</span>
  </div>
</div>

<div className="mt-4">
  <div className="relative overflow-hidden border border-[#343a3e] bg-[#0d1113] transition-all duration-200 focus-within:border-yellow-400/70 focus-within:shadow-[0_0_18px_rgba(250,204,21,0.08)]">

    {/* HUD corners */}
    <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-yellow-400/80" />
    <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-yellow-400/40" />
    <span className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-yellow-400/40" />
    <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-yellow-400/60" />

    {/* Header */}
    <div className="flex items-center justify-between border-b border-[#242a2e] bg-[#111518] px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_7px_#facc15]" />

        <span className="font-oxanium text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-400">
          Character Search
        </span>
      </div>

      <span className="font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-700">
        CHAR // 02
      </span>
    </div>

    {/* Search field */}
    <div className="relative">
      <input
        type="text"
        value={characterSearch}
        onChange={handleCharacterSearchChange}
        placeholder="SEARCH CHARACTER..."
        autoComplete="off"
        spellCheck={false}
        className="
          w-full
          border-0
          bg-transparent
          px-3
          py-3
          pr-16
          font-mono
          text-[11px]
          uppercase
          tracking-[0.08em]
          text-white
          placeholder:text-zinc-700
          caret-yellow-400
          outline-none
        "
      />

      {/* Search status */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-zinc-600">
        QUERY
      </span>
    </div>

    {/* Scan line */}
    <div className="absolute bottom-0 left-0 h-px w-0 bg-yellow-400 shadow-[0_0_8px_#facc15] transition-all duration-300 focus-within:w-full" />

  </div>
</div>

<div className="mt-6 space-y-4">

<label
  className={`group mt-2 flex min-h-0 items-center justify-between border px-3 py-2.5 transition-all duration-200 ${
    searchAllCards
      ? "cursor-not-allowed border-zinc-800 bg-[#111315] opacity-40"
      : wishlistMode
      ? "cursor-pointer border-yellow-400/70 bg-yellow-400/[0.06] shadow-[inset_2px_0_0_#facc15]"
      : "cursor-pointer border-[#343a3e] bg-[#111518] hover:border-yellow-400/50 hover:bg-[#151a1d]"
  }`}
>
  <div className="min-w-0 pr-3">
    <div className="flex items-center gap-2 font-oxanium text-[10px] font-bold uppercase tracking-[0.16em] text-white">
      <span
        className={`h-1 w-1 ${
          wishlistMode
            ? "bg-yellow-400 shadow-[0_0_7px_#facc15]"
            : "bg-zinc-700"
        }`}
      />
      Wishlist Mode
    </div>

    <div className="mt-0.5 pl-3 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-600">
      Curate your wishlist.
    </div>
  </div>

  <input
    type="checkbox"
    checked={wishlistMode}
    disabled={searchAllCards}
    onChange={(e) => onWishlistModeChange(e.target.checked)}
    className="h-4 w-4 shrink-0 accent-yellow-400 disabled:cursor-not-allowed"
  />
</label>

</div>

<div className="mt-4">
  <div className="relative group flex items-center gap-2">

    <button
      type="button"
      onClick={onToggleHideISO}
      className={`group relative flex-1 overflow-hidden border px-3 py-3 text-left transition-all duration-200 ${
        hideISO
          ? "border-yellow-400 bg-yellow-400/[0.08]"
          : "border-[#343a3e] bg-[#0f1316] hover:border-yellow-400/70 hover:bg-[#14191c]"
      }`}
    >
      {/* ACTIVE EDGE */}
      <div
        className={`absolute inset-y-0 left-0 w-px transition-all duration-200 ${
          hideISO
            ? "w-0.5 bg-yellow-400 shadow-[0_0_8px_#facc15]"
            : "bg-yellow-400/50 group-hover:w-0.5 group-hover:bg-yellow-400"
        }`}
      />

      <div className="flex items-center gap-2.5">

        {/* STATUS ICON */}
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[8px] font-bold transition-all ${
            hideISO
              ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_0_8px_rgba(250,204,21,0.35)]"
              : "border-yellow-400/40 bg-yellow-400/[0.05] text-yellow-400 group-hover:border-yellow-400 group-hover:bg-yellow-400/[0.1]"
          }`}
        >
          {hideISO ? "✓" : "//"}
        </span>

        <div className="min-w-0">

          <div
            className={`font-oxanium text-[9px] font-bold uppercase tracking-[0.18em] ${
              hideISO ? "text-yellow-300" : "text-white"
            }`}
          >
            {hideISO ? "ISO PRIVATE" : "MAKE MY ISO PRIVATE"}
          </div>

          <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.11em] text-zinc-600">
            {hideISO
              ? "Public visibility disabled"
              : "Remove ISO from public view"}
          </div>

        </div>

        <span
          className={`ml-auto shrink-0 font-mono text-[7px] font-bold uppercase tracking-[0.12em] ${
            hideISO ? "text-yellow-400" : "text-zinc-700 group-hover:text-yellow-400"
          }`}
        >
          {hideISO ? "PRIVATE" : "PUBLIC"}
        </span>

      </div>

      {/* BOTTOM SCAN LINE */}
      <div
        className={`absolute bottom-0 left-0 h-px bg-yellow-400 shadow-[0_0_8px_#facc15] transition-all duration-300 ${
          hideISO ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />

    </button>

    {/* HELP */}
    <div className="group/help relative flex h-5 w-5 shrink-0 cursor-help items-center justify-center border border-[#343a3e] bg-[#111518] font-mono text-[8px] font-bold text-yellow-400 transition-all hover:border-yellow-400 hover:bg-yellow-400 hover:text-black">
      ?

      <div className="pointer-events-none absolute right-0 top-full z-[100] mt-2 w-64 border border-[#343a3e] bg-[#0b0f11] p-3 font-mono text-[8px] uppercase leading-4 tracking-[0.08em] text-zinc-400 opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.7)] transition-opacity duration-200 group-hover/help:opacity-100">
        Removes your ISO from public view without affecting your personal collection.
      </div>
    </div>

  </div>
</div>

<div className="relative group mt-6 flex items-center gap-2">
  <button
    type="button"
    onClick={() => setShowHideSets(true)}
    className="group relative flex-1 overflow-hidden border border-[#343a3e] bg-[#0f1316] px-3 py-3 text-left transition-all duration-200 hover:border-yellow-400/70 hover:bg-[#14191c]"
  >
    <div className="absolute inset-y-0 left-0 w-px bg-yellow-400/60 transition-all duration-200 group-hover:w-0.5 group-hover:bg-yellow-400" />

    <div className="flex items-center gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-yellow-400/40 bg-yellow-400/[0.06] font-mono text-[9px] text-yellow-400 transition-all group-hover:border-yellow-400 group-hover:bg-yellow-400 group-hover:text-black">
        //
      </span>

      <div className="min-w-0">
        <div className="font-oxanium text-[9px] font-bold uppercase tracking-[0.18em] text-white">
          SET VISIBILITY
        </div>

        <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.12em] text-zinc-600 group-hover:text-zinc-500">
          Configure hidden collection sets
        </div>
      </div>

      <span className="ml-auto font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-yellow-400/50 transition-colors group-hover:text-yellow-400">
        CONFIG →
      </span>
    </div>

    <div className="absolute bottom-0 left-0 h-px w-0 bg-yellow-400 shadow-[0_0_8px_#facc15] transition-all duration-300 group-hover:w-full" />
  </button>

  <div className="group/help relative flex h-5 w-5 shrink-0 cursor-help items-center justify-center border border-[#343a3e] bg-[#111518] font-mono text-[8px] font-bold text-yellow-400 transition-all hover:border-yellow-400 hover:bg-yellow-400 hover:text-black">
    ?

    <div className="pointer-events-none absolute right-0 top-full z-[100] mt-2 w-64 border border-[#343a3e] bg-[#0b0f11] p-3 font-mono text-[8px] uppercase leading-4 tracking-[0.08em] text-zinc-400 opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.7)] transition-opacity duration-200 group-hover/help:opacity-100">
      Hide specific sets from your personal and public collection views.
    </div>
  </div>
</div>

{showHideSets && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">

    <div className="relative flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden border border-[#30363a] bg-[#0a0d0f] text-white shadow-[0_25px_80px_rgba(0,0,0,0.75)]">

      {/* HUD CORNERS */}
      <div className="pointer-events-none absolute left-0 top-0 z-20 h-7 w-7 border-l-2 border-t-2 border-yellow-400" />
      <div className="pointer-events-none absolute right-0 top-0 z-20 h-7 w-7 border-r-2 border-t-2 border-yellow-400/70" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-7 w-7 border-b-2 border-l-2 border-yellow-400/50" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-7 w-7 border-b-2 border-r-2 border-yellow-400/50" />

      {/* HEADER */}
      <div className="relative shrink-0 border-b border-[#292f33] bg-[#0d1113] px-4 py-4 sm:px-5">

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_10px_rgba(250,204,21,0.5)]" />

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_8px_#facc15]" />

              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.35em] text-yellow-400">
                SET VISIBILITY // CONTROL
              </span>
            </div>

            <h2 className="font-oxanium text-lg font-black uppercase tracking-[0.12em] text-white sm:text-xl">
              Hide Sets
            </h2>

            <div className="mt-1 font-mono text-[7px] uppercase tracking-[0.12em] text-zinc-600">
              Configure collection visibility parameters
            </div>

          </div>

          <button
            type="button"
            onClick={() => setShowHideSets(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#343a3e] bg-[#111518] font-mono text-xs text-zinc-500 transition-all hover:border-red-400 hover:bg-red-500/10 hover:text-red-300"
            aria-label="Close Hide Sets"
          >
            ✕
          </button>

        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#202528] pt-3">

          <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-zinc-600">
            HIDDEN SETS
          </span>

          <span className="border border-yellow-400/30 bg-yellow-400/[0.05] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-yellow-400">
            {hiddenSetIds.length} ACTIVE
          </span>

        </div>

      </div>

      {/* SET LIST */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">

        <div className="space-y-2">

          {availableSets.map((category) => (
            <details
              key={category.id}
              className="group/category overflow-hidden border border-[#292f33] bg-[#101417]"
            >

              <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 transition-all hover:bg-[#151a1d] [&::-webkit-details-marker]:hidden">

                <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-yellow-400/30 bg-yellow-400/[0.04] font-mono text-[8px] text-yellow-400 transition-all group-open/category:border-yellow-400/70 group-open/category:bg-yellow-400/[0.08]">
                  +
                </span>

                <div className="min-w-0 flex-1">

                  <div className="font-oxanium text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                    {category.name}
                  </div>

                  <div className="mt-0.5 font-mono text-[6px] uppercase tracking-[0.1em] text-zinc-700">
                    {category.children.length} SET
                    {category.children.length === 1 ? "" : "S"} AVAILABLE
                  </div>

                </div>

                <span className="font-mono text-[8px] text-zinc-600 transition-colors group-open/category:text-yellow-400">
                  ▼
                </span>

              </summary>

              <div className="border-t border-[#292f33] bg-[#0c1012] p-2">

                <div className="space-y-1">

                  {category.children.map((set) => {
                    const isHidden = hiddenSetIds.includes(set.id);

                    return (
                      <label
                        key={set.id}
                        className={`group/set relative flex cursor-pointer items-center gap-3 overflow-hidden border px-3 py-2.5 transition-all duration-150 ${
                          isHidden
                            ? "border-yellow-400/50 bg-yellow-400/[0.07]"
                            : "border-[#242a2e] bg-[#111518] hover:border-[#3b4449] hover:bg-[#151a1d]"
                        }`}
                      >

                        {isHidden && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-yellow-400 shadow-[0_0_8px_#facc15]" />
                        )}

                        <input
                          type="checkbox"
                          checked={isHidden}
                          onChange={() => onHideSet(set.id)}
                          className="peer sr-only"
                        />

                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center border font-mono text-[8px] font-bold transition-all ${
                            isHidden
                              ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_0_8px_rgba(250,204,21,0.35)]"
                              : "border-[#41494e] bg-[#0b0f11] text-transparent group-hover/set:border-yellow-400/60"
                          }`}
                        >
                          ✓
                        </span>

                        <span
                          className={`min-w-0 flex-1 font-oxanium text-[8px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                            isHidden
                              ? "text-yellow-300"
                              : "text-zinc-400 group-hover/set:text-white"
                          }`}
                        >
                          {set.name}
                        </span>

                        <span
                          className={`font-mono text-[6px] font-bold uppercase tracking-[0.1em] ${
                            isHidden
                              ? "text-yellow-400/70"
                              : "text-zinc-700"
                          }`}
                        >
                          {isHidden ? "HIDDEN" : "VISIBLE"}
                        </span>

                      </label>
                    );
                  })}

                </div>

              </div>

            </details>
          ))}

        </div>

      </div>

      {/* FOOTER */}
      <div className="shrink-0 border-t border-[#292f33] bg-[#0d1113] px-4 py-3 sm:px-5">

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">
            <span className="h-1 w-1 bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />

            <span className="font-mono text-[6px] uppercase tracking-[0.14em] text-zinc-600">
              VISIBILITY CONTROL ONLINE
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowHideSets(false)}
            className="border border-yellow-400/60 bg-yellow-400/[0.06] px-4 py-2 font-oxanium text-[8px] font-bold uppercase tracking-[0.14em] text-yellow-400 transition-all hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            DONE
          </button>

        </div>

      </div>

    </div>
  </div>
)}

</aside>
  );
}
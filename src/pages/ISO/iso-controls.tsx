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
    <div className="mb-6 rounded-3xl bg-[#1b1b1b] p-6 text-white">
      <label className="mb-2 block text-sm font-semibold text-[#e6c35a]">
        Character Search
      </label>

      <input
        type="text"
        value={characterSearch}
        onChange={handleCharacterSearchChange}
        placeholder="Twilight Sparkle..."
        autoComplete="off"
        spellCheck={false}
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
  );
}

  return (
    <aside className="w-[330px] rounded-3xl bg-[#1b1b1b] p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">
        ISO Controls
      </h1>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#e6c35a]">
          Card Code Search
        </label>

        <input
          type="text"
          value={cardCodeSearch}
          onChange={handleSearchChange}
          placeholder="Type # for ※   <> for ◇"
          autoComplete="off"
          spellCheck={false}
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

      <div className="mt-5 space-y-2">
        <label className="text-sm font-semibold text-[#e6c35a]">
          Character Search
        </label>

        <input
          type="text"
          value={characterSearch}
          onChange={handleCharacterSearchChange}
          placeholder="Twilight Sparkle..."
          autoComplete="off"
          spellCheck={false}
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

<div className="mt-6 space-y-4">

<label
  className={`flex min-h-[84px] items-start justify-between rounded-xl border px-4 py-3 transition ${
    wishlistMode
      ? "cursor-not-allowed border-zinc-800 bg-[#1a1a1a] opacity-50"
      : searchAllCards
      ? "cursor-pointer border-yellow-500 bg-yellow-500/10"
      : "cursor-pointer border-zinc-700 bg-[#232323] hover:border-yellow-500/50"
  }`}
>
  <div>
    <div className="font-semibold text-white">
      Search All Cards
    </div>

    <div className="mt-1 text-xs text-zinc-400">
      Show every card instead of only cards you're missing.
    </div>
  </div>

  <input
    type="checkbox"
    checked={searchAllCards}
    disabled={wishlistMode}
    onChange={(e) => onSearchAllCardsChange(e.target.checked)}
    className="mt-1 h-5 w-5 shrink-0 accent-yellow-500 disabled:cursor-not-allowed"
  />
</label>

<label
  className={`flex min-h-[84px] items-start justify-between rounded-xl border px-4 py-3 transition ${
    searchAllCards
      ? "cursor-not-allowed border-zinc-800 bg-[#1a1a1a] opacity-50"
      : wishlistMode
      ? "cursor-pointer border-pink-500 bg-pink-500/10"
      : "cursor-pointer border-zinc-700 bg-[#232323] hover:border-pink-500/50"
  }`}
>
  <div>
    <div className="font-semibold text-white">
      Wishlist Mode
    </div>

    <div className="mt-1 text-xs text-zinc-400">
      Add or remove cards from your wishlist.
      <br />
      Manage the cards you want to collect.
    </div>
  </div>

  <input
    type="checkbox"
    checked={wishlistMode}
    disabled={searchAllCards}
    onChange={(e) => onWishlistModeChange(e.target.checked)}
    className="mt-1 h-5 w-5 shrink-0 accent-pink-500 disabled:cursor-not-allowed"
  />
</label>

</div>

<div className="mt-4">
  <div className="relative group flex items-center gap-2">
    <button
      type="button"
      onClick={onToggleHideISO}
      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        hideISO
          ? "border-yellow-400 bg-yellow-500 text-black"
          : "border-zinc-700 bg-[#232323] text-yellow-400 hover:border-yellow-500"
      }`}
    >
      {hideISO ? "✓ " : ""}
      MAKE MY ISO PRIVATE
    </button>

    <div className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-zinc-600 bg-[#444444] text-[11px] font-bold text-yellow-400 transition group-hover:bg-[#555555] group-hover:border-yellow-400">
      ?
    </div>

    <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-700 bg-[#2f2f2f] p-3 text-xs leading-relaxed text-zinc-300 opacity-0 shadow-2xl transition-all duration-200 group-hover:opacity-100">
      Removes your ISO from public view but does not affect your personal collection or ISO page.
    </div>
  </div>
</div>

<div className="relative group mt-6 flex items-center gap-2">
  <button
    type="button"
    onClick={() => setShowHideSets(true)}
    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        hideISO
          ? "border-yellow-400 bg-yellow-500 text-black"
          : "border-zinc-700 bg-[#232323] text-yellow-400 hover:border-yellow-500"
      }`}
  >
    Click here to hide specific sets
  </button>

  <div className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-zinc-600 bg-[#444444] text-[11px] font-bold text-yellow-400 transition group-hover:bg-[#555555] group-hover:border-yellow-400">
    ?
  </div>

  <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-700 bg-[#2f2f2f] p-3 text-xs leading-relaxed text-zinc-300 opacity-0 shadow-2xl transition-all duration-200 group-hover:opacity-100">
    Hide only specific sets you don't want to collect from personal and public views.
  </div>
</div>

{showHideSets && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
    <div className="w-[420px] rounded-2xl bg-[#1b1b1b] border border-zinc-700 p-5">

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Hide Sets
        </h2>

        <button
          onClick={() => setShowHideSets(false)}
          className="rounded bg-red-600 px-3 py-1 text-white"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[400px] space-y-2 overflow-y-auto">

       {availableSets.map((category) => (
  <details
    key={category.id}
    className="rounded-lg bg-[#232323]"
  >
    <summary className="cursor-pointer px-4 py-3 font-semibold text-white">
      {category.name}
    </summary>

    <div className="border-t border-zinc-700">
{category.children.map((set) => (
  <label
    key={set.id}
    className="flex cursor-pointer items-center gap-3 px-6 py-3 hover:bg-[#303030]"
  >
    <input
      type="checkbox"
      checked={hiddenSetIds.includes(set.id)}
      onChange={() => onHideSet(set.id)}
      className="h-5 w-5 accent-yellow-500"
    />

    <span className="text-zinc-300">
      {set.name}
    </span>
  </label>
))}
    </div>
  </details>
))}

      </div>

    </div>
  </div>
)}

</aside>
  );
}
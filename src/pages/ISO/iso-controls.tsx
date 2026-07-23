import { useState } from "react";

interface ISOControlsProps {
  cardCodeSearch: string;
  onCardCodeSearchChange: (value: string) => void;

  characterSearch: string;
  onCharacterSearchChange: (value: string) => void;

  searchAllCards: boolean;
  onSearchAllCardsChange: (value: boolean) => void;

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
}

export default function ISOCONTROLS({
  cardCodeSearch,
  onCardCodeSearchChange,
  characterSearch,
  onCharacterSearchChange,
  searchAllCards,
  onSearchAllCardsChange,
  availableSets,
  hiddenSetIds,
  onHideSet,
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

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={searchAllCards}
          onChange={(e) =>
            onSearchAllCardsChange(e.target.checked)
          }
          className="mt-1 h-5 w-5 accent-yellow-500"
        />

        <span className="text-sm leading-5 text-zinc-300">
          Check this box if you want to search all existing cards,
          not just cards you are missing.
        </span>
      </label>
     <button
  type="button"
  onClick={() => setShowHideSets(true)}
  className="
    mt-6
    w-full
    rounded-xl
    border
    border-[#d4af37]/40
    bg-[#232323]
    px-4
    py-3
    text-sm
    font-semibold
    text-[#f5e6a8]
    transition
    hover:border-[#d4af37]
    hover:bg-[#2c2c2c]
  "
>
  Click here to hide sets
</button>

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
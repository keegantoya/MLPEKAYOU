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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onCharacterSearchChange(e.target.value);
  };
  const [showHideSets, setShowHideSets] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const switchClass = (active: boolean, disabled = false) =>
    `relative h-6 w-10 shrink-0 rounded-full transition sm:h-7 sm:w-12 ${
      disabled
        ? "cursor-not-allowed bg-zinc-200 opacity-50 dark:bg-white/10"
        : active
          ? "bg-[#FFD54A]"
          : "bg-zinc-200 dark:bg-white/10"
    }`;
  if (wishlistCharacterOnly) {
    return (
      <div className="mb-4 rounded-[24px] border border-black/10 bg-white p-4 text-zinc-900 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] dark:text-white">
        <label className="mb-2 block text-sm font-semibold">
          Character search
        </label>
        <div className="relative">
          <input
            type="text"
            value={characterSearch}
            onChange={handleCharacterSearchChange}
            placeholder="Search a character"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-black/10 bg-zinc-100 px-4 py-2.5 pr-10 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#FFD54A] focus:ring-4 focus:ring-[#FFD54A]/15 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-zinc-500"
          />
          {characterSearch && (
            <button
              type="button"
              onClick={() => onCharacterSearchChange("")}
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-200 text-sm text-zinc-500 transition hover:bg-zinc-300 dark:bg-white/10 dark:text-zinc-400 dark:hover:bg-white/15"
              aria-label="Clear character search"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <>
      <aside className="mx-auto flex max-h-[72dvh] w-full flex-col overflow-y-auto rounded-[22px] border border-black/10 bg-[#f5f5f7] text-zinc-900 shadow-xl sm:max-h-none sm:overflow-hidden sm:rounded-[28px] dark:border-white/10 dark:bg-[#1c1c1e] dark:text-white">
        <div className="shrink-0 px-3 pb-1 pt-2 sm:px-6 sm:pb-2 sm:pt-3">
          <div className="mb-1 flex items-center justify-between sm:mb-3">
            <button
              type="button"
              onClick={onClose}
              className="group flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition hover:brightness-95 sm:h-5 sm:w-5"
              aria-label="Close ISO Controls"
              title="Close"
            >
              <span className="text-[11px] font-bold leading-none text-[#7a1f1b] opacity-0 transition-opacity group-hover:opacity-100">
                ×
              </span>
            </button>
          </div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            ISO Controls
          </h1>
          <p className="mt-0.5 hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
            Search cards and choose what appears in your ISO.
          </p>
        </div>
        <div className="px-2 pb-2 sm:px-4 sm:pb-3">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-1 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
            <section className="order-1 min-w-0 rounded-2xl bg-white p-1.5 shadow-sm sm:order-none sm:rounded-[22px] sm:p-2.5 dark:bg-white/[0.06]">
              <label
                className={`flex items-center justify-between gap-1.5 rounded-xl p-1.5 sm:gap-4 sm:rounded-2xl sm:p-2 ${
                  wishlistMode
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold sm:text-[15px]">
                    Show all cards
                  </div>
                  <div className="mt-0.5 hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
                    Include cards you already own.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={searchAllCards}
                  disabled={wishlistMode}
                  onChange={(e) => onSearchAllCardsChange(e.target.checked)}
                  className="sr-only"
                />
                <span className={switchClass(searchAllCards, wishlistMode)}>
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition sm:h-5 sm:w-5 ${
                      searchAllCards ? "left-5 sm:left-6" : "left-1"
                    }`}
                  />
                </span>
              </label>
            </section>
            <section className="order-3 min-w-0 rounded-2xl bg-white p-2 shadow-sm sm:order-none sm:rounded-[22px] sm:p-3.5 dark:bg-white/[0.06]">
              <label className="mb-1 block text-sm font-semibold sm:mb-2">
                Card code
              </label>
              <input
                type="text"
                value={cardCodeSearch}
                onChange={handleSearchChange}
                placeholder="Search card code"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-black/10 bg-zinc-100 px-3 py-1.5 text-sm uppercase text-zinc-900 outline-none transition placeholder:normal-case placeholder:text-zinc-400 focus:border-[#FFD54A] focus:ring-4 focus:ring-[#FFD54A]/15 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-[15px] dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-zinc-500"
              />
              <p className="mt-2 hidden text-xs leading-5 text-zinc-400 sm:block dark:text-zinc-500">
                Tip: use # for ※ and &lt;&gt; for ◇.
              </p>
            </section>
            <section className="order-4 min-w-0 rounded-2xl bg-white p-2 shadow-sm sm:order-none sm:rounded-[22px] sm:p-3.5 dark:bg-white/[0.06]">
              <label className="mb-1 block text-sm font-semibold sm:mb-2">
                Character
              </label>
              <input
                type="text"
                value={characterSearch}
                onChange={handleCharacterSearchChange}
                placeholder="Search character"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-black/10 bg-zinc-100 px-3 py-1.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#FFD54A] focus:ring-4 focus:ring-[#FFD54A]/15 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-[15px] dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-zinc-500"
              />
            </section>
            <section className="order-2 min-w-0 rounded-2xl bg-white p-1.5 shadow-sm sm:order-none sm:rounded-[22px] sm:p-2.5 dark:bg-white/[0.06]">
              <label
                className={`flex items-center justify-between gap-1.5 rounded-xl p-1.5 sm:gap-4 sm:rounded-2xl sm:p-2 ${
                  searchAllCards
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold sm:text-[15px]">
                    Wishlist mode
                  </div>
                  <div className="mt-0.5 hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
                    Add or remove cards from your wishlist. In this mode, you can see all cards, even cards you own, and search by character.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={wishlistMode}
                  disabled={searchAllCards}
                  onChange={(e) => onWishlistModeChange(e.target.checked)}
                  className="sr-only"
                />
                <span className={switchClass(wishlistMode, searchAllCards)}>
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition sm:h-5 sm:w-5 ${
                      wishlistMode ? "left-5 sm:left-6" : "left-1"
                    }`}
                  />
                </span>
              </label>
            </section>
            <section className="order-5 col-span-2 overflow-hidden rounded-2xl bg-white shadow-sm sm:order-none sm:col-span-1 sm:rounded-[22px] dark:bg-white/[0.06] md:col-span-2 xl:col-span-1">
              <button
                type="button"
                onClick={onToggleHideISO}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-black/[0.025] sm:gap-4 sm:px-4 sm:py-3 dark:hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold">Private ISO</div>
                  <div className="mt-0.5 hidden text-sm leading-5 text-zinc-500 sm:block dark:text-zinc-400">
                    Hide your ISO from your public profile.
                  </div>
                </div>
                <span className={switchClass(hideISO)}>
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition sm:h-5 sm:w-5 ${
                      hideISO ? "left-5 sm:left-6" : "left-1"
                    }`}
                  />
                </span>
              </button>
              <div className="mx-4 h-px bg-black/[0.06] dark:bg-white/[0.07]" />
              <button
                type="button"
                onClick={() => setShowHideSets(true)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-black/[0.025] sm:px-4 sm:py-3 dark:hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold">
                    Set visibility
                  </div>
                  <div className="mt-0.5 hidden text-sm leading-5 text-zinc-500 sm:block dark:text-zinc-400">
                    Choose which collection sets appear.
                  </div>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-lg text-zinc-500 sm:h-8 sm:w-8 sm:text-xl dark:bg-white/[0.08] dark:text-zinc-300">
                  ›
                </span>
              </button>
            </section>
          </div>
        </div>
      </aside>
      {showHideSets && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="flex max-h-[82vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[30px] border border-black/10 bg-[#f5f5f7] text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#1c1c1e] dark:text-white">
            <div className="shrink-0 px-5 pb-4 pt-4">
              <div className="mb-4 flex items-center justify-end">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-500 shadow-sm dark:bg-white/[0.07] dark:text-zinc-400">
                  {hiddenSetIds.length} hidden
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Set Visibility
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Hidden sets will not appear in your collection views.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              <div className="space-y-2">
                {availableSets.map((category) => {
                  const isExpanded = expanded === category.id;
                  const hiddenInCategory = category.children.filter((set) =>
                    hiddenSetIds.includes(set.id),
                  ).length;
                  return (
                    <div
                      key={category.id}
                      className="overflow-hidden rounded-[22px] bg-white shadow-sm dark:bg-white/[0.06]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(isExpanded ? null : category.id)
                        }
                        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[15px] font-semibold">
                            {category.name}
                          </div>
                          <div className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                            {category.children.length}{" "}
                            {category.children.length === 1 ? "set" : "sets"}
                            {hiddenInCategory > 0
                              ? ` · ${hiddenInCategory} hidden`
                              : ""}
                          </div>
                        </div>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-lg text-zinc-500 transition-transform dark:bg-white/[0.08] dark:text-zinc-300 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        >
                          ›
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-black/[0.06] px-2 py-2 dark:border-white/[0.07]">
                          {category.children.map((set) => {
                            const isHidden = hiddenSetIds.includes(set.id);
                            return (
                              <label
                                key={set.id}
                                className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-3 transition hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                              >
                                <span className="min-w-0 flex-1 text-sm font-medium">
                                  {set.name}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isHidden}
                                  onChange={() => onHideSet(set.id)}
                                  className="sr-only"
                                />
                                <span className={switchClass(isHidden)}>
                                  <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition sm:h-5 sm:w-5 ${
                                      isHidden ? "left-5 sm:left-6" : "left-1"
                                    }`}
                                  />
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="shrink-0 border-t border-black/[0.06] bg-white/70 p-4 backdrop-blur dark:border-white/[0.07] dark:bg-black/10">
              <button
                type="button"
                onClick={() => setShowHideSets(false)}
                className="w-full rounded-2xl bg-[#FFD54A] px-4 py-2.5 text-[15px] font-semibold text-zinc-900 transition hover:brightness-95 active:scale-[0.99]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

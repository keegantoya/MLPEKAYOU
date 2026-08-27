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
    label: "Moon",
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
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark");
});
const { wishlist, toggleWishlist } = useWishlist();
useEffect(() => {
const syncTheme = () => {
const root = document.documentElement;
    setIsLightMode(root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark"));
  };
  syncTheme();
const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
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
// In Progress only appears when there is// at least one purchase/trade in progress.
  if (section.id === "progress") {
    return hasInProgress;
  }
// A category remains visible if at least one// underlying set is still active.
  return section.setIds.some(
    (setId) =>
      !hiddenSets.includes(setId) &&
      !completedSets.includes(setId)
  );
});
const selectSection = (section: Section) => {
    setCardCodeSearch("");
    setCharacterSearch("");
    setSelectedSection(section);
  };
const sectionContent = (
    <>
      {selectedSection === "wishlist" && <Wishlist />}
      {selectedSection === "progress" && <InProgress />}
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
  );
const allSearchContent = (
    <>
      {selectedSection === "progress" && <InProgress />}
      <ISOMOON cardCodeSearch={cardCodeSearch} characterSearch={characterSearch} wishlistMode={wishlistMode} searchAllCards={searchAllCards} hiddenSets={hiddenSets} />
      <ISOFUN cardCodeSearch={cardCodeSearch} characterSearch={characterSearch} searchAllCards={searchAllCards} hiddenSets={hiddenSets} wishlistMode={wishlistMode} />
      <ISORAINBOW cardCodeSearch={cardCodeSearch} characterSearch={characterSearch} wishlistMode={wishlistMode} searchAllCards={searchAllCards} hiddenSets={hiddenSets} />
      <ISOSTAR cardCodeSearch={cardCodeSearch} characterSearch={characterSearch} wishlistMode={wishlistMode} searchAllCards={searchAllCards} hiddenSets={hiddenSets} />
      <ISOTCG cardCodeSearch={cardCodeSearch} characterSearch={characterSearch} wishlistMode={wishlistMode} searchAllCards={searchAllCards} hiddenSets={hiddenSets} />
      <ISOPROMOS cardCodeSearch={cardCodeSearch} characterSearch={characterSearch} wishlistMode={wishlistMode} searchAllCards={searchAllCards} hiddenSets={hiddenSets} />
    </>
  );
  return (
    <div className={`min-h-screen transition-colors ${isLightMode ? "bg-[#f6f4ef] text-zinc-900" : "bg-[#0f1112] text-zinc-100"}`}>
      <div className="mx-auto flex max-w-[1600px]">
        <aside className={`hidden min-h-screen w-56 shrink-0 border-r p-3 md:block ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
          <div className="sticky top-0 py-2">
            <div className="px-2 pb-4">
              <h1 className="text-xl font-semibold">Missing Cards</h1>
              <p className={`mt-1 text-sm leading-5 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                ISO, wishlist, and card search.
              </p>
            </div>
            <nav className="space-y-1.5">
              {visibleSections.filter((item) => wishlistMode || item.id !== "wishlist").map((item) => {
const active = selectedSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectSection(item.id as Section)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-[#FFD54A] text-zinc-900"
                        : isLightMode
                        ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-zinc-900" : isLightMode ? "bg-zinc-300" : "bg-zinc-600"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => setShowControls(true)}
              className={`mt-4 w-full rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                isLightMode
                  ? "border-black/10 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                  : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              ISO Controls
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className={`border-b px-4 py-4 md:hidden ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold">Missing Cards</h1>
                <p className={`mt-0.5 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>ISO & wishlist</p>
              </div>
              <button
                type="button"
                onClick={() => setShowControls(true)}
                className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                  isLightMode ? "border-black/10 bg-zinc-50 text-zinc-700" : "border-white/[0.08] bg-white/[0.05] text-zinc-300"
                }`}
              >
                Controls
              </button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {visibleSections.filter((item) => wishlistMode || item.id !== "wishlist").map((item) => {
const active = selectedSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectSection(item.id as Section)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ${
                      active
                        ? "bg-[#FFD54A] text-zinc-900"
                        : isLightMode
                        ? "bg-zinc-100 text-zinc-600"
                        : "bg-white/[0.06] text-zinc-300"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>
          <main className="px-3 py-4 sm:px-5 md:px-6 md:py-5">
            {wishlistMode && (
              <div className="mb-4">
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
            )}
            {wishlistMode ? sectionContent : isSearching ? allSearchContent : sectionContent}
          </main>
        </div>
      </div>
      {showControls && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 ${isLightMode ? "bg-zinc-900/35" : "bg-black/70"}`}>
          <div className={`relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[26px] border shadow-2xl ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.1] bg-[#17191a]"}`}>
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
                { id: "moon", name: "Moon", children: [{ id: "1", name: "First Edition" }, { id: "2", name: "Second Edition" }, { id: "3", name: "Third Edition" }] },
                { id: "fun", name: "Fun Moments", children: [{ id: "7", name: "First Edition" }, { id: "8", name: "Second Edition" }, { id: "11", name: "Third Edition" }] },
                { id: "rainbow", name: "Rainbow", children: [{ id: "5", name: "First Edition" }, { id: "6", name: "Second Edition" }] },
                { id: "star", name: "Star", children: [{ id: "4", name: "First Edition" }] },
                { id: "tcg", name: "TCG", children: [{ id: "FW", name: "Fantasy Wonderland" }, { id: "SD", name: "Friendships Begin" }, { id: "12", name: "Discord" }, { id: "tcgpromos", name: "TCG Promos" }] },
                { id: "promos", name: "Promos", children: [{ id: "9", name: "Promotional Cards" }] },
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

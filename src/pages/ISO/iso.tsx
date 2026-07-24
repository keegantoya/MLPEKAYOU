import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ISOMOON from "./iso-moon";
import ISOFUN from "./iso-fun";
import ISORAINBOW from "./iso-rainbow";
import ISOSTAR from "./iso-star";
import ISOTCG from "./iso-tcg";
import ISOCONTROLS from "./iso-controls";
import ISOPROMOS from "./iso-promos";
import { useWishlist } from "./wishlist-in-iso";

type Section =
  | "moon"
  | "fun"
  | "rainbow"
  | "star"
  | "tcg"
  | "promos"
  | "progress";

const sections = [
  { id: "moon", label: "Eternal Moon" },
  { id: "fun", label: "Fun Moments" },
  { id: "rainbow", label: "Rainbow" },
  { id: "star", label: "Star" },
  { id: "tcg", label: "TCG" },
  { id: "promos", label: "Promos" },
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
const [userId, setUserId] = useState<string | null>(null);
const [hideISO, setHideISO] = useState(false);
const { wishlist, toggleWishlist } = useWishlist();

useEffect(() => {
  const load = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select(
  "iso_hidden_sets, hide_iso"
)
      .eq("id", user.id)
      .single();

    const p = profile as any;

setHiddenSets(p?.iso_hidden_sets || []);
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

  return (
    <div className="min-h-screen bg-[#171717] text-white kayou-scrollbar">

      {/* Mobile Navigation */}
      <div className="md:hidden border-b border-zinc-800 bg-[#1b1b1b] pt-8">
<div className="flex items-center justify-between px-4 pb-3">
  <h1 className="text-2xl font-bold tracking-tight">
    Missing Cards
  </h1>

  <button
    onClick={() => setShowControls(true)}
    className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-black"
  >
    ISO Controls
  </button>
</div>

        <div className="flex overflow-x-auto">
          {sections.map((item) => (
            <button
              key={item.id}
              onClick={() => {
setCardCodeSearch("");
setCharacterSearch("");
setSelectedSection(item.id as Section);
}}
              className={`mx-1 whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-semibold transition-all ${
                selectedSection === item.id
                  ? "border-b-2 border-yellow-500 text-yellow-400"
                  : "text-zinc-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block sticky top-0 h-screen w-64 shrink-0 border-r border-zinc-800 bg-[#1b1b1b] overflow-y-auto kayou-scrollbar">
          <div className="border-b border-zinc-800 px-4 py-5">
            <h1 className="text-3xl font-bold tracking-tight">
  Missing Cards
</h1>

<p className="mt-1 text-sm text-zinc-400">
  Search your ISO or find any card's origin.
</p>
          </div>

          <nav className="py-2">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => {
setCardCodeSearch("");
setCharacterSearch("");
setSelectedSection(item.id as Section);
}}
                className={`mx-2 my-1 block w-[calc(100%-1rem)] rounded-lg px-4 py-3 text-left transition-all duration-200 ${
  selectedSection === item.id
    ? "bg-yellow-500 text-black font-semibold shadow-lg shadow-yellow-500/20"
    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
}`}
              >
                {item.label}
              </button>
            ))}
</nav>

<div className="border-t border-zinc-800 p-4">
  <button
    onClick={() => setShowControls(true)}
    className="w-full rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:scale-[1.02] hover:bg-yellow-400"
  >
    ISO Controls
  </button>
</div>

</aside>
{/* Content */}
<main
  className={`flex-1 h-screen overflow-y-scroll bg-[#171717] kayou-scrollbar px-8 pb-8 md:px-8 md:pb-12 ${
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
/>
    </div>
    {selectedSection === "moon" && (
      <ISOMOON
        cardCodeSearch={cardCodeSearch}
        characterSearch={characterSearch}
        wishlistMode={wishlistMode}
        searchAllCards
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
/>
          </div>
        </div>
      )}

    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ISOMOON from "./iso-moon";
import ISOFUN from "./iso-fun";
import ISORAINBOW from "./iso-rainbow";
import ISOSTAR from "./iso-star";
import ISOTCG from "./iso-tcg";
import ISOCONTROLS from "./iso-controls";
import ISOPROMOS from "./iso-promos";

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
const [searchAllCards, setSearchAllCards] = useState(false);
const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const load = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "iso_hidden_sets, iso_hidden_sets"
      )
      .eq("id", user.id)
      .single();

    const p = profile as any;

setHiddenSets(p?.iso_hidden_sets || []);
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

  return (
    <div className="min-h-screen bg-[#171717] text-white">

      {/* Mobile Navigation */}
      <div className="md:hidden border-b border-zinc-800 bg-[#1b1b1b] pt-8">
<div className="flex items-center justify-between px-4 pb-3">
  <h1 className="text-2xl font-bold">
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
  setSelectedSection(item.id as Section);
}}
              className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${
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
        <aside className="hidden md:block w-64 shrink-0 border-r border-zinc-800 bg-[#1b1b1b]">
          <div className="border-b border-zinc-800 px-4 py-5">
            <h1 className="text-3xl font-bold">
              ISO (BETA)
            </h1>
          </div>

          <nav className="py-2">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => {
  setCardCodeSearch("");
  setSelectedSection(item.id as Section);
}}
                className={`block w-full px-4 py-3 text-left transition-colors ${
                  selectedSection === item.id
                    ? "bg-yellow-500 text-black font-semibold"
                    : "text-white hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </button>
            ))}
</nav>

<div className="border-t border-zinc-800 p-4">
  <button
    onClick={() => setShowControls(true)}
    className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-black"
  >
    ISO Controls
  </button>
</div>

</aside>
{/* Content */}
<main className="flex-1 px-8 pb-8 pt-0 md:px-8 md:pb-8 md:pt-0">

  {cardCodeSearch !== "" ? (
    <>
<ISOMOON
  cardCodeSearch={cardCodeSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOFUN
  cardCodeSearch={cardCodeSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISORAINBOW
  cardCodeSearch={cardCodeSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOSTAR
  cardCodeSearch={cardCodeSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOTCG
  cardCodeSearch={cardCodeSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

<ISOPROMOS
  cardCodeSearch={cardCodeSearch}
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>

    </>
  ) : (
    <>
      {selectedSection === "moon" && (
<ISOMOON
  cardCodeSearch=""
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "fun" && (
<ISOFUN
  cardCodeSearch=""
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "rainbow" && (
<ISORAINBOW
  cardCodeSearch=""
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "star" && (
<ISOSTAR
  cardCodeSearch=""
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "tcg" && (
<ISOTCG
  cardCodeSearch=""
  searchAllCards={searchAllCards}
  hiddenSets={hiddenSets}
/>
      )}

      {selectedSection === "promos" && (
<ISOPROMOS
  cardCodeSearch=""
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
  searchAllCards={searchAllCards}
  onSearchAllCardsChange={setSearchAllCards}
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
/>
          </div>
        </div>
      )}

    </div>
  );
}
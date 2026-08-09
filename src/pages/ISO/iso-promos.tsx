import { useEffect, useState } from "react";
import ISOChecking from "./iso-checking";
import { useWishlist } from "./wishlist-in-iso";
import { supabase } from "@/lib/supabase";
import { promoCharacterMap } from "./Card Characters/card-characters-promos";

const ccgCards = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13];

const tcgCards = Array.from({ length: 18 }, (_, i) => i + 1);

const getDisplayCardCode = (
  setId: string,
  number: number
) => {
  if (setId === "9") {
    // Standard CCG Promos
    if (number <= 7) {
      return `MLPE-PR-${String(number).padStart(3, "0")}`;
    }

    // SDCC Promos
    return `SDCC-${String(number - 7).padStart(3, "0")}`;
  }

  if (setId === "tcgpromos") {
    // RR-01 through RR-06
    if (number <= 6) {
      return `RR-${String(number).padStart(2, "0")}`;
    }

    // BP01 CR-07 through CR-12
    if (number <= 12) {
      return `BP01-CR-${String(number).padStart(2, "0")}`;
    }

    // BP02 CR-01 through CR-06
    return `BP02-CR-${String(number - 12).padStart(2, "0")}`;
  }

  return `RR-${String(number).padStart(2, "0")}`;
};

const getCardKey = (
  setId: string,
  number: number
) => {
  if (setId === "9") {
    return `PR-${number}`;
  }

  return `RR${String(number).padStart(2, "0")}`;
};

const getImage = (
  setId: string,
  number: number
) => {
  if (setId === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }

  return `/tcgpromos/RR${String(number).padStart(2, "0")}.webp`;
};

const sets = [
  {
    id: "9",
    name: "CCG Promotional Cards",
    cards: ccgCards,
  },
  {
    id: "tcgpromos",
    name: "TCG Promotional Cards",
    cards: tcgCards,
  },
]; 
interface ISOPROMOSProps {
  cardCodeSearch: string;
  characterSearch: string;
  searchAllCards: boolean;
  hiddenSets: string[];
  wishlistMode: boolean;
}
export default function ISOPROMOS({
  cardCodeSearch,
  characterSearch,
  searchAllCards,
  hiddenSets,
  wishlistMode,
}: ISOPROMOSProps) {
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
const [userId, setUserId] = useState("");
const { wishlist, toggleWishlist } = useWishlist();

const [selectedSet, setSelectedSet] = useState<string | null>(
  window.innerWidth >= 768 ? "9" : null
);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
  setUserId(user.id);
}

      if (!user) {
        setLoading(false);
        return;
      }

      const allOwned: Record<string, boolean> = {};

for (const set of sets.filter((s) => !hiddenSets.includes(s.id))) {
       const { data: progress } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", set.id)
  .maybeSingle();

Object.entries(progress?.progress || {}).forEach(([key, value]) => {
  if (value) {
    allOwned[key] = true;
  }
});
      }

      setOwned(allOwned);
      setLoading(false);
    };

    load();
}, [hiddenSets]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

return (
  <div className="space-y-6">

    {/* MOBILE SET NAVIGATION */}
    {!(cardCodeSearch || characterSearch.trim()) && (
  <div className="md:hidden sticky top-0 z-20 py-2">
      <div className="flex justify-center gap-2 overflow-x-auto">
        {[
  { id: "9", label: "CCG Promos" },
  { id: "tcgpromos", label: "TCG Promos" },
]
.filter((item) => {
  if (item.id === "decks") {
    return !hiddenSets.includes("SD_BONUS");
  }

  return !hiddenSets.includes(item.id);
})
.map((item) => (
<button
  key={item.id}
onClick={() => {
  setSelectedSet(item.id);
}}
className={`group flex h-9 shrink-0 items-center gap-2 whitespace-nowrap border px-3 font-oxanium text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
  selectedSet === item.id
    ? "border-yellow-400 bg-[#15191c] text-yellow-400 shadow-[inset_2px_0_0_#facc15]"
    : "border-[#30363a] bg-[#101417] text-zinc-500 hover:border-yellow-400/50 hover:bg-[#151a1d] hover:text-yellow-400"
}`}
          >
  <span
    className={`h-1 w-1 shrink-0 transition-all ${
      selectedSet === item.id
        ? "bg-yellow-400 shadow-[0_0_6px_#facc15]"
        : "bg-zinc-700 group-hover:bg-yellow-400"
    }`}
  />

  <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
)}
{sets
  .filter((set) => !hiddenSets.includes(set.id))
.filter((set) => {
  if (cardCodeSearch || characterSearch.trim()) {
    return true;
  }

  return (
    window.innerWidth >= 768 ||
    selectedSet === set.id
  );
})
  .map((set) => {
const cards = set.cards.map((number) => ({
  number,
  characters:
    promoCharacterMap[
      `${set.id}-${getCardKey(set.id, number)}`
    ] ?? [],
}));

const missing = cards.filter((card) => {
  const displayCode = getDisplayCardCode(
    set.id,
    card.number
  ).toUpperCase();

  const codeSearch = cardCodeSearch
    .trim()
    .toUpperCase();

  if (
    codeSearch !== "" &&
    !displayCode.startsWith(codeSearch)
  ) {
    return false;
  }

  const character = characterSearch
    .trim()
    .toLowerCase();

  if (
    character !== "" &&
    !card.characters.some((name) =>
      name.toLowerCase().includes(character)
    )
  ) {
    return false;
  }

const key = getCardKey(set.id, card.number);

if (searchAllCards || wishlistMode) {
  return true;
}

return !owned[key];
});

        if (missing.length === 0) return null;

return (
  <section
    id={`set-${set.id}`}
    key={set.id}
    className={`
      p-0
      ${cardCodeSearch || characterSearch.trim() ? "mt-8" : ""}
      md:mt-0
      md:border
      md:border-[#2b3135]
      md:bg-[#0f1316]
      md:p-5
      md:relative
      md:overflow-hidden
    `}
  >
    <div className="hidden md:block absolute left-0 top-0 h-5 w-5 border-l border-t border-yellow-400/50" />
    <div className="hidden md:block absolute right-0 top-0 h-5 w-5 border-r border-t border-yellow-400/50" />
    <div className="hidden md:block absolute bottom-0 left-0 h-5 w-5 border-b border-l border-yellow-400/30" />
    <div className="hidden md:block absolute bottom-0 right-0 h-5 w-5 border-b border-r border-yellow-400/30" />

    <div className="hidden md:flex mb-5 items-center gap-3 border-b border-[#252b2f] pb-3">
      <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_8px_#facc15]" />

      <h2
        className="font-oxanium text-sm font-bold uppercase tracking-[0.18em]"
      >
        {set.name}
      </h2>

      <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/20 to-transparent" />
    </div>

    <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
              {missing.map((card) => {

                const fullKey = `${set.id}:${getCardKey(set.id, card.number)}`;
const isWishlisted = wishlist.has(fullKey);

const cardContent = (
  <div className={searchAllCards ? "" : "cursor-pointer"}>
<div className="mb-2 flex items-center justify-center">
  <div className="group relative flex items-center gap-2 border border-yellow-400/25 bg-[#0d1113] px-2.5 py-1 shadow-[0_0_12px_rgba(250,204,21,0.06)] transition-all duration-200 hover:border-yellow-400/60 hover:shadow-[0_0_16px_rgba(250,204,21,0.12)]">

<span className="whitespace-nowrap font-mono text-[7px] font-bold uppercase tracking-[0.02em] text-yellow-300 md:text-[9px] md:tracking-[0.12em]">
  {getDisplayCardCode(
    set.id,
    card.number
  )}
</span>

    <span className="absolute -left-px -top-px h-1.5 w-1.5 border-l border-t border-yellow-400" />
    <span className="absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r border-yellow-400/70" />

  </div>
</div>

<div
  className={`relative overflow-hidden rounded-lg aspect-[5/7] ${
    isWishlisted
      ? "ring-4 ring-pink-400 ring-offset-2"
      : ""
  }`}
>
  {set.id === "9" ? (
    <img
      src={getImage(set.id, card.number)}
      className="absolute"
      style={{
        width: "100%",
        height: "calc(100% + 12px)",
        left: 0,
        top: "-6px",
        objectFit: "cover",
      }}
    />
  ) : (
    <img
      src={getImage(set.id, card.number)}
      className={`h-full w-full object-cover ${
        card.number >= 9 && card.number <= 12
          ? "scale-[1.02] object-center"
          : ""
      }`}
    />
  )}
</div>
  </div>
);

return searchAllCards && !wishlistMode ? (
  <div key={getCardKey(set.id, card.number)}>
    {cardContent}
  </div>
) : (
  <ISOChecking
    key={getCardKey(set.id, card.number)}
    userId={userId}
    setId={set.id}
    cardKey={getCardKey(set.id, card.number)}
    wishlistMode={wishlistMode}
    isWishlisted={isWishlisted}
    toggleWishlist={toggleWishlist}
onComplete={() =>
  setOwned((prev) => ({
    ...prev,
    [getCardKey(set.id, card.number)]: true,
  }))
}
  >
    {cardContent}
  </ISOChecking>
);
})}
            </div>
          </section>
        );
      })}
    </div>
  );
}
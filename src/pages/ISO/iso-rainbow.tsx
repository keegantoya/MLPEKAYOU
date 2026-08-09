import { useEffect, useState } from "react";
import ISOChecking from "./iso-checking";
import { useWishlist } from "./wishlist-in-iso";
import { supabase } from "@/lib/supabase";
import { rainbowCharacterMap } from "./Card Characters/card-characters-rainbow";

const getRarityCode = (rarity: string) => {
  return rarity;
};

const getDisplayCardCode = (
  setId: string,
  rarity: string,
  number: number
) => {
  const rarityCode = getRarityCode(rarity);
  const cardNumber = String(number).padStart(3, "0");

  //
  // RAINBOW 1 R
  //
  if (setId === "5" && rarity === "R") {
    if (number <= 20) {
      return `INT01-R-${cardNumber}`;
    }

    return `RBE01-R-${String(number - 20).padStart(3, "0")}`;
  }

  //
  // RAINBOW 1 SR
  //
  if (setId === "5" && rarity === "SR") {
    const actualNumber =
      number <= 7
        ? number
        : [13, 14, 15, 16, 17, 18, 19, 20][number - 8];

    return `INT01-SR-${String(actualNumber).padStart(3, "0")}`;
  }

  //
  // RAINBOW 1 SSR
  //
  if (setId === "5" && rarity === "SSR") {
    if (number <= 6) {
      return `INT01-SSR-${String(number + 6).padStart(3, "0")}`;
    }

    if (number <= 9) {
      const specialNumbers = [16, 17, 20];

      return `INT01-SSR-${String(
        specialNumbers[number - 7]
      ).padStart(3, "0")}`;
    }

    return `RBE01-SSR-${String(number - 9).padStart(3, "0")}`;
  }

  //
  // RAINBOW 2 R
  //
  if (setId === "6" && rarity === "R") {
    if (number <= 15) {
      return `MLPME02-R-${String(number).padStart(3, "0")}`;
    }

    return `MLPME03-R-${String(number - 15).padStart(3, "0")}`;
  }

  //
  // RAINBOW 2 SR
  //
  if (setId === "6" && rarity === "SR") {
    const actualNumbers = [
      1, 3, 5, 7, 9, 11, 13,
      14, 15, 16, 17, 18, 19, 20,
    ];

    return `MLPME03-SR-${String(
      actualNumbers[number - 1]
    ).padStart(3, "0")}`;
  }

  //
  // RAINBOW 2 SSR
  //
  if (setId === "6" && rarity === "SSR") {
    if (number <= 6) {
      return `MLPME03-SSR-${cardNumber}`;
    }

    if (number <= 14) {
      return `MLPME03-SSR-${String(number + 6).padStart(3, "0")}`;
    }

    return `RBE02-SSR-001`;
  }

  const setCodeMap: Record<string, string> = {
    "5": "RBE01",
    "6": "RBE02",
  };

  const baseCode = setCodeMap[setId] || "";

  return `${baseCode}-${rarityCode}-${cardNumber}`;
};

const sets = [
  {
    id: "5",
    name: "RAINBOW // FIRST EDITION",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7,
    },
  },
  {
    id: "6",
    name: "RAINBOW // SECOND EDITION",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: {
      BASE: 18,
      R: 30,
      SR: 14,
      ST: 20,
      SSR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      UR: 19,
      USR: 8,
      XR: 8,
    },
  },
];
interface ISORAINBOWProps {
  cardCodeSearch: string;
  characterSearch: string;
  searchAllCards: boolean;
  hiddenSets: string[];
  wishlistMode: boolean;
}

export default function ISORAINBOW({
  cardCodeSearch,
  characterSearch,
  searchAllCards,
  hiddenSets,
  wishlistMode,
}: ISORAINBOWProps) {
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
const [userId, setUserId] = useState("");
const { wishlist, toggleWishlist } = useWishlist();

  const [selectedSet, setSelectedSet] = useState<string | null>(
  window.innerWidth >= 768 ? "5" : null
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
          .single();

        Object.entries(progress?.progress || {}).forEach(([key, value]) => {
          if (value) {
            allOwned[`${set.id}-${key}`] = true;
          }
        });
      }

      setOwned(allOwned);
      setLoading(false);
    };

    load();
  }, []);

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
  { id: "5", label: "Rainbow 1" },
  { id: "6", label: "Rainbow 2" },
].map((item) => (
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
const cards = Object.entries(set.rarities).flatMap(
  ([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1,

      characters:
        rainbowCharacterMap[`${set.id}-${rarity}-${i + 1}`] ?? [],
    }))
);
const visibleCards = cards.filter((card) => {
  const displayCode = getDisplayCardCode(
    set.id,
    card.rarity,
    card.number
  ).toUpperCase();

  const codeSearch = cardCodeSearch.trim().toUpperCase();

  if (codeSearch !== "" && !displayCode.startsWith(codeSearch)) {
    return false;
  }

const character = characterSearch.trim().toLowerCase();

if (
  character !== "" &&
  !card.characters.some((name) =>
    name.toLowerCase().includes(character)
  )
) {
  return false;
}

if (wishlistMode || searchAllCards) {
  return true;
}

return !owned[`${set.id}-${card.rarity}-${card.number}`];
});

        if (visibleCards.length === 0) return null;

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

      <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-700">
        {set.prefix} // ACTIVE
      </span>

      <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/20 to-transparent" />
    </div>

    <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
              {visibleCards.map((card) => {
                


const fullKey = `${set.id}:${card.rarity}-${card.number}`;
const isWishlisted = wishlist.has(fullKey);

const cardContent = (
  <div className={searchAllCards ? "" : "cursor-pointer"}>
    <div className="mb-2 flex items-center justify-center">
      <div className="group relative flex items-center gap-2 border border-yellow-400/25 bg-[#0d1113] px-2.5 py-1 shadow-[0_0_12px_rgba(250,204,21,0.06)] transition-all duration-200 hover:border-yellow-400/60 hover:shadow-[0_0_16px_rgba(250,204,21,0.12)]">

<span className="whitespace-nowrap font-mono text-[7px] font-bold uppercase tracking-[0.02em] text-yellow-300 md:text-[9px] md:tracking-[0.12em]">
  {getDisplayCardCode(
    set.id,
    card.rarity,
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
      <img
        src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.webp`}
        className="absolute"
        style={{
          width: "100%",
          height: "calc(100% + 12px)",
          left: 0,
          top: "-6px",
          objectFit: "cover",
        }}
      />
    </div>
  </div>
);
return searchAllCards && !wishlistMode ? (
  <div key={`${card.rarity}-${card.number}`}>
    {cardContent}
  </div>
) : (
  <ISOChecking
    key={`${card.rarity}-${card.number}`}
    userId={userId}
    setId={set.id}
    cardKey={`${card.rarity}-${card.number}`}
    wishlistMode={wishlistMode}
    isWishlisted={isWishlisted}
    toggleWishlist={toggleWishlist}
    onComplete={() =>
      setOwned((prev) => ({
        ...prev,
        [`${set.id}-${card.rarity}-${card.number}`]: true,
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
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
  if (setId === "5" && rarity === "R") {
    if (number <= 20) {
      return `INT01-R-${cardNumber}`;
    }
    return `RBE01-R-${String(number - 20).padStart(3, "0")}`;
  }
  if (setId === "5" && rarity === "SR") {
const actualNumber =
      number <= 7
        ? number
        : [13, 14, 15, 16, 17, 18, 19, 20][number - 8];
    return `INT01-SR-${String(actualNumber).padStart(3, "0")}`;
  }
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
  if (setId === "6" && rarity === "R") {
    if (number <= 15) {
      return `MLPME02-R-${String(number).padStart(3, "0")}`;
    }
    return `MLPME03-R-${String(number - 15).padStart(3, "0")}`;
  }
  if (setId === "6" && rarity === "SR") {
const actualNumbers = [
      1, 3, 5, 7, 9, 11, 13,
      14, 15, 16, 17, 18, 19, 20,
    ];
    return `MLPME03-SR-${String(
      actualNumbers[number - 1]
    ).padStart(3, "0")}`;
  }
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
    name: "Rainbow First Edition",
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
    name: "Rainbow Second Edition",
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
const [selectedSet, setSelectedSet] = useState<string | null>(null);
const [selectedRarities, setSelectedRarities] = useState<Record<string, string>>({});
const getMissingCount = (set: (typeof sets)[number]) => Object.entries(set.rarities).reduce((total, [rarity, count]) => total + Array.from({ length: count as number }, (_, i) => `${set.id}-${rarity}-${i + 1}`).filter((key) => !owned[key]).length, 0);
const selectableSets = sets.filter((set) => !hiddenSets.includes(set.id) && (searchAllCards || getMissingCount(set) > 0));
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
  useEffect(() => {
if (loading || selectedSet === null) return;
if (!selectableSets.some((set) => set.id === selectedSet)) setSelectedSet(null);
}, [loading, owned, hiddenSets, selectedSet]);
if (loading) {
    return <div className="py-8 text-center text-sm text-zinc-500">Loading...</div>;
  }
return (
<div className="space-y-4">
{!(cardCodeSearch || characterSearch.trim()) && selectableSets.length > 0 && (
<div className="sticky top-0 z-20">
<div className="flex gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#17191a]/95 md:flex-wrap md:overflow-visible">
{selectableSets.map((set) => (
<button key={set.id} type="button" onClick={() => setSelectedSet(set.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${selectedSet === set.id ? "bg-[#FFD54A] text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300"}`}>
{set.id === "5" ? "Rainbow 1" : "Rainbow 2"}
</button>
))}
</div>
</div>
)}
{sets.filter((set) => !hiddenSets.includes(set.id)).filter((set) => {
if (cardCodeSearch || characterSearch.trim()) return true;
if (!searchAllCards && getMissingCount(set) === 0) return false;
if (selectedSet === null) return true;
return set.id === selectedSet;
}).map((set) => {
const cards = Object.entries(set.rarities).flatMap(([rarity, count]) => Array.from({ length: count as number }, (_, i) => ({ rarity, number: i + 1, characters: rainbowCharacterMap[`${set.id}-${rarity}-${i + 1}`] ?? [] })));
const missing = cards.filter((card) => {
const displayCode = getDisplayCardCode(set.id, card.rarity, card.number).toUpperCase();
const codeSearch = cardCodeSearch.trim().toUpperCase();
if (codeSearch !== "" && !displayCode.startsWith(codeSearch)) return false;
const character = characterSearch.trim().toLowerCase();
if (character !== "" && !card.characters.some((name) => name.toLowerCase().includes(character))) return false;
if (wishlistMode || searchAllCards) return true;
return !owned[`${set.id}-${card.rarity}-${card.number}`];
});
if (missing.length === 0) return null;
const availableRarities = Object.keys(set.rarities).filter((rarity) => missing.some((card) => card.rarity === rarity));
const selectedRarity = selectedRarities[set.id] && availableRarities.includes(selectedRarities[set.id]) ? selectedRarities[set.id] : "all";
const visibleCards = selectedRarity === "all" ? missing : missing.filter((card) => card.rarity === selectedRarity);
return (
<section id={`set-${set.id}`} key={set.id} className={`rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-4 ${cardCodeSearch || characterSearch.trim() ? "mt-6" : ""}`}>
<div className="mb-4 flex items-center justify-between gap-3">
<div className="min-w-0">
<h2 className="truncate text-base font-semibold">{set.name}</h2>
<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{visibleCards.length} {visibleCards.length === 1 ? "card" : "cards"}</p>
</div>
<select value={selectedRarity} onChange={(event) => setSelectedRarities((current) => ({ ...current, [set.id]: event.target.value }))} aria-label={`Filter ${set.name} by rarity`} className="max-w-[150px] rounded-xl border border-black/10 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200">
<option value="all">All rarities</option>
{availableRarities.map((rarity) => <option key={rarity} value={rarity}>{rarity}</option>)}
</select>
</div>
<div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">
{visibleCards.map((card) => {
const fullKey = `${set.id}:${card.rarity}-${card.number}`;
const isWishlisted = wishlist.has(fullKey) || wishlist.has(`${set.id}:${card.rarity}-${String(card.number).padStart(3, "0")}`);
const cardContent = (
<div className={searchAllCards ? "" : "cursor-pointer"}>
<div className="mb-1.5 truncate text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">{getDisplayCardCode(set.id, card.rarity, card.number)}</div>
<div className={`relative aspect-[5/7] w-full overflow-hidden rounded-xl ${isWishlisted ? "ring-4 ring-pink-400 ring-offset-2 ring-offset-white dark:ring-offset-[#17191a]" : ""}`}>
<img src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.webp`} alt={getDisplayCardCode(set.id, card.rarity, card.number)} className="absolute left-0 top-[-6px] h-[calc(100%+12px)] w-full object-cover" />
</div>
</div>
);
return searchAllCards && !wishlistMode ? <div key={`${card.rarity}-${card.number}`}>{cardContent}</div> : (
<ISOChecking key={`${card.rarity}-${card.number}`} userId={userId} setId={set.id} cardKey={`${card.rarity}-${card.number}`} wishlistMode={wishlistMode} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} onComplete={() => setOwned((prev) => ({ ...prev, [`${set.id}-${card.rarity}-${card.number}`]: true }))}>
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

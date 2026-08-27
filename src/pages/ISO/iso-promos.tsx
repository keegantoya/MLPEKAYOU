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
    name: "CCG Promos",
    cards: ccgCards,
  },
  {
    id: "tcgpromos",
    name: "TCG Promos",
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
const [selectedSet, setSelectedSet] = useState<string | null>(null);
const getMissingCount = (set: (typeof sets)[number]) =>
    set.cards.filter((number) => !owned[getCardKey(set.id, number)]).length;
const selectableSets = sets.filter(
    (set) => !hiddenSets.includes(set.id) && (searchAllCards || getMissingCount(set) > 0)
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
  useEffect(() => {
    if (loading || selectedSet === null) return;
    if (!selectableSets.some((set) => set.id === selectedSet)) {
      setSelectedSet(null);
    }
  }, [loading, owned, hiddenSets, selectedSet]);
  if (loading) {
    return <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading...</div>;
  }
  return (
    <div className="space-y-4">
      {!(cardCodeSearch || characterSearch.trim()) && selectableSets.length > 0 && (
        <div className="sticky top-0 z-20">
          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#17191a]/95 md:flex-wrap md:overflow-visible">
            {selectableSets.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => setSelectedSet(set.id)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  selectedSet === set.id
                    ? "bg-[#FFD54A] text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
                }`}
              >
                {set.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {sets
        .filter((set) => !hiddenSets.includes(set.id))
        .filter((set) => {
          if (cardCodeSearch || characterSearch.trim()) return true;
          if (!searchAllCards && getMissingCount(set) === 0) return false;
          if (selectedSet === null) return true;
          return set.id === selectedSet;
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
              className={`rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-4 ${
                cardCodeSearch || characterSearch.trim() ? "mt-6" : ""
              }`}
            >
              <div className="mb-4">
                <h2 className="text-base font-semibold">{set.name}</h2>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {missing.length} {missing.length === 1 ? "card" : "cards"}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">
                {missing.map((card) => {
const fullKey = `${set.id}:${getCardKey(set.id, card.number)}`;
const isWishlisted = wishlist.has(fullKey);
const cardContent = (
                    <div className={searchAllCards ? "" : "cursor-pointer"}>
                      <div className="mb-1.5 truncate text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {getDisplayCardCode(set.id, card.number)}
                      </div>
                      <div
                        className={`relative aspect-[5/7] w-full overflow-hidden rounded-xl ${
                          isWishlisted
                            ? "ring-4 ring-pink-400 ring-offset-2 ring-offset-white dark:ring-offset-[#17191a]"
                            : ""
                        }`}
                      >
                        {set.id === "9" ? (
                          <img
                            src={getImage(set.id, card.number)}
                            alt={getDisplayCardCode(set.id, card.number)}
                            className="absolute left-0 top-[-6px] h-[calc(100%+12px)] w-full object-cover"
                          />
                        ) : (
                          <img
                            src={getImage(set.id, card.number)}
                            alt={getDisplayCardCode(set.id, card.number)}
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

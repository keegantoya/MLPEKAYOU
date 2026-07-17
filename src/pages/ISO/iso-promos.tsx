import { useEffect, useState } from "react";
import ISOChecking from "./iso-checking";
import { supabase } from "@/lib/supabase";

const ccgCards = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13];

const tcgCards = Array.from({ length: 12 }, (_, i) => i + 1);

const getDisplayCardCode = (
  setId: string,
  number: number
) => {
  if (setId === "9") {
    return `MLPE-PR-${String(number).padStart(3, "0")}`;
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
  searchAllCards: boolean;
  hiddenSets: string[];
}
export default function ISOPROMOS({
  cardCodeSearch,
  searchAllCards,
  hiddenSets,
}: ISOPROMOSProps) {
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

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
}, [hiddenSets]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

return (
  <div className="space-y-6">

    {/* MOBILE SET NAVIGATION */}
    <div className="md:hidden sticky top-0 z-20 bg-[#171717] py-2">
      <div className="flex justify-center gap-2">
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

    requestAnimationFrame(() => {
      document
        .getElementById(`set-${item.id}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }}
className={`min-w-[100px] rounded-lg border px-5 py-3 text-sm font-semibold transition ${
  selectedSet === item.id
    ? "border-yellow-500 bg-yellow-500 text-black"
    : "border-zinc-700 bg-[#202020] text-zinc-300 hover:border-yellow-500 hover:text-yellow-400"
}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>

{sets
  .filter((set) => !hiddenSets.includes(set.id))
  .filter(
    (set) =>
      window.innerWidth >= 768 ||
      selectedSet === set.id
  )
  .map((set) => {
const cards = set.cards.map((number) => ({
  number,
}));

const missing = cards.filter((card) => {
  const displayCode = getDisplayCardCode(
    set.id,
    card.number
  ).toUpperCase();

  const search = cardCodeSearch.trim().toUpperCase();

  if (search && !displayCode.startsWith(search)) {
    return false;
  }

  const key = getCardKey(set.id, card.number);

  if (searchAllCards) {
    return true;
  }

  return !owned[`${set.id}-${key}`];
});

        if (missing.length === 0) return null;

        return (
<section
  id={`set-${set.id}`}
  key={set.id}
  className="
    p-0
    md:rounded-lg
    md:border
    md:border-zinc-700
    md:bg-[#202020]
    md:p-6
  "
>

<h2 className="hidden md:block mb-6 text-2xl font-semibold">
  {set.name}
</h2>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
              {missing.map((card) => {


return (
<ISOChecking
  key={getCardKey(set.id, card.number)}
  userId={userId}
  setId={set.id}
  cardKey={getCardKey(set.id, card.number)}
  onComplete={() =>
    setOwned((prev) => ({
      ...prev,
      [`${set.id}-${getCardKey(set.id, card.number)}`]: true,
    }))
  }
>
  <div className="cursor-pointer">
    <div className="mb-1 text-center text-[9px] md:text-xs font-bold tracking-tight md:tracking-wide text-zinc-300 whitespace-nowrap">
      {getDisplayCardCode(set.id, card.number)}
    </div>

<div className="aspect-[5/7] overflow-hidden rounded-lg">
  <img
    src={getImage(set.id, card.number)}
    className={`h-full w-full object-cover ${
      set.id === "tcgpromos" &&
      card.number >= 9 &&
      card.number <= 12
        ? "scale-[1.02] object-center"
        : ""
    }`}
  />
</div>
  </div>
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
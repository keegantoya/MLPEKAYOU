import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ISOChecking from "./iso-checking";

const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

const getDisplayCardCode = (
  setId: string,
  rarity: string,
  number: number
) => {
  const rarityCode = getRarityCode(rarity);
  const cardNumber = String(number).padStart(3, "0");

  if (setId === "2" && rarity === "HR") {
    return `INT03-HR-${cardNumber}`;
  }

  if (
    setId === "2" &&
    (rarity === "SHINING ZR" || rarity === "SZR")
  ) {
    return `MLPME02-◇ZR-${cardNumber}`;
  }

  if (setId === "3" && rarity === "SZR") {
    return `MLPME03-◇ZR-${cardNumber}`;
  }

  const setCodeMap: Record<string, string> = {
    "1": "MLPME01",
    "2": "MLPME02",
    "3": "MLPME03",
  };

  return `${setCodeMap[setId]}-${rarityCode}-${cardNumber}`;
};

const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7,
    },
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 30,
      UR: 16,
      LSR: 16,
      SGR: 8,
      ZR: 7,
      SC: 7,
      "SHINING ZR": 1,
    },
  },
  {
    id: "3",
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      LSR: 32,
      UR: 18,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
  },
];

interface ISOMOONProps {
  cardCodeSearch: string;
  searchAllCards: boolean;
  hiddenSets: string[];
}

export default function ISOMOON({
  cardCodeSearch,
  searchAllCards,
  hiddenSets,
}: ISOMOONProps) {
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const [selectedSet, setSelectedSet] = useState<string | null>(
  window.innerWidth >= 768 ? "1" : null
);

  useEffect(() => {
    const load = async () => {
const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.user) {
  setLoading(false);
  return;
}

setUserId(session.user.id);

      const allOwned: Record<string, boolean> = {};

for (const set of sets.filter((s) => !hiddenSets.includes(s.id))) {
        const { data: progress } = await supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", session.user.id)
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
    <div className="md:hidden sticky top-0 z-20 bg-[#171717] py-2">
      <div className="flex justify-center gap-2">
        {[
          { id: "1", label: "Moon 1" },
          { id: "2", label: "Moon 2" },
          { id: "3", label: "Moon 3" },
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
        const cards = Object.entries(set.rarities).flatMap(
          ([rarity, count]) =>
            Array.from({ length: count as number }, (_, i) => ({
              rarity,
              number: i + 1,
            }))
        );

const missing = cards.filter((card) => {
  const displayCode = getDisplayCardCode(
    set.id,
    card.rarity,
    card.number
  ).toUpperCase();

  const search = cardCodeSearch.trim().toUpperCase();

  if (search !== "" && !displayCode.startsWith(search)) {
    return false;
  }

  const key = `${card.rarity}-${card.number}`;

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
  const isDoubleWide =
    set.id === "3" &&
    card.rarity === "SZR" &&
    card.number === 1;

  return (
<ISOChecking
  key={`${card.rarity}-${card.number}`}
  className={isDoubleWide ? "col-span-2" : ""}
  userId={userId}
  setId={set.id}
  cardKey={`${card.rarity}-${card.number}`}
  onComplete={() =>
    setOwned((prev) => ({
      ...prev,
      [`${set.id}-${card.rarity}-${card.number}`]: true,
    }))
  }
>
  <div className="cursor-pointer">
    <div className="mb-1 text-center text-[9px] md:text-xs font-bold tracking-tight md:tracking-wide text-zinc-300 whitespace-nowrap">
      {getDisplayCardCode(
        set.id,
        card.rarity,
        card.number
      )}
    </div>

    <img
      src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.webp`}
      className={`w-full rounded-lg ${
        isDoubleWide ? "aspect-[10/7]" : "aspect-[5/7]"
      }`}
    />
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
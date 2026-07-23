import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ISOChecking from "./iso-checking";
import { TCGCharacterMap } from "./Card Characters/card-characters-tcg";

const getRarityCode = (rarity: string) => {
  return rarity;
};

const getDisplayCardCode = (
  setId: string,
  rarity: string,
  number: number
) => {
  const rarityCode = getRarityCode(rarity);
  const cardNumber = String(number).padStart(2, "0");

  if (setId === "SD" && rarity === "C") {
    return `SD01C${cardNumber}`;
  }

  if (setId === "SD" && rarity === "U") {
    return `SD01U${cardNumber}`;
  }

  if (setId === "SD" && rarity === "SR") {
    return `SD01SR${cardNumber}`;
  }

  if (setId === "SD" && rarity === "SPR") {
    return `SD01SPR${cardNumber}`;
  }

  if (setId === "SD" && rarity === "GR") {
    return `SD01GR${cardNumber}`;
  }

  if (setId === "SD" && rarity === "CR") {
    return `SD01CR${cardNumber}`;
  }

  if (setId === "SD" && rarity === "ER") {
    return `SD01ER${cardNumber}`;
  }

  if (setId === "SD" && rarity === "PER") {
    return `SD01PER${String(number + 6).padStart(2, "0")}`;
  }

  if (setId === "SD" && rarity === "PRR") {
    return `SD01PRR${cardNumber}`;
  }

  return `${rarityCode}-${cardNumber}`;
};

const sets = [
  {
    id: "SD",
    name: "Friendships Begin",
    folder: "friendships-begin",
    prefix: "SD",
    rarities: {
      C: 9,
      U: 7,
      SR: 6,
      SPR: 10,
      GR: 6,
      CR: 6,
      ER: 6,
      PER: 12,
      PRR: 6,
    },
  },
  {
    id: "FW",
    name: "Fantasy Wonderland",
    folder: "fantasy-wonderland",
    prefix: "BP01",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PSPR: 11,
      PGR: 6,
      PCR: 12,
      PRR: 6,
    },
  },
  {
    id: "12",
    name: "Discord",
    folder: "discord",
    prefix: "BP02",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PGR: 6,
      PSPR: 11,
      PCR: 12,
      PRR: 6,
    },
  },
];

interface ISOTCGProps {
  cardCodeSearch: string;
  characterSearch: string;
  searchAllCards: boolean;
  hiddenSets: string[];
}

export default function ISOTCG({
  cardCodeSearch,
  characterSearch,
  searchAllCards,
  hiddenSets,
}: ISOTCGProps) {
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

const [selectedSet, setSelectedSet] =
  useState<string | null>("SD");
  const starterDeckImages = [
  "/starter-decks-boxes/SDTWILIGHT.webp",
  "/starter-decks-boxes/SDFLUTTERSHY.webp",
  "/starter-decks-boxes/SDPINKIEPIE.webp",
  "/starter-decks-boxes/SDAPPLEJACK.webp",
  "/starter-decks-boxes/SDRAINBOWDASH.webp",
  "/starter-decks-boxes/SDRARITY.webp",
];

const starterDeckGroups = [
  { name: "Twilight Sparkle", code: "SD01A" },
  { name: "Fluttershy", code: "SD01B" },
  { name: "Pinkie Pie", code: "SD01C" },
  { name: "Applejack", code: "SD01D" },
  { name: "Rainbow Dash", code: "SD01E" },
  { name: "Rarity", code: "SD01F" },
];

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

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
    allOwned[key] = true;
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
  <div className="md:hidden sticky top-0 z-20 bg-[#171717] py-2">
      <div className="flex flex-wrap justify-center gap-2">
{[
  { id: "SD", label: "Friendships Begin" },
  { id: "FW", label: "Fantasy Wonderland" },
  { id: "12", label: "Discord" },
]
.filter((item) => !hiddenSets.includes(item.id))
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
)}
{selectedSet === "SD" &&
!hiddenSets.includes("SD") &&
starterDeckGroups.some((deck) => {
  const deckCards = [];

  const add = (rarity: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      deckCards.push(
        `STARTER-${deck.code}${rarity}${String(i).padStart(2, "0")}`
      );
    }
  };

  add("C", 9);
  add("U", 4);
  add("SR", 2);

  const deckIndex = deck.code.slice(-1).charCodeAt(0) - 64;

  deckCards.push(
    `STARTER-SD01ER${String(deckIndex).padStart(2, "0")}`
  );

  add("SPR", 4);

  deckCards.push(
    `STARTER-SD01RR${String(deckIndex).padStart(2, "0")}`
  );

 return deckCards.some((key) => !owned[key]);
}) && (
  <section
    className="
      p-0
      md:rounded-lg
      md:border
      md:border-zinc-700
      md:bg-[#202020]
      md:p-6
    "
  >
    <h2
  className={`mb-6 text-2xl font-semibold ${
    cardCodeSearch || characterSearch.trim()
      ? "block"
      : "hidden md:block"
  }`}
>
      Starter Decks
    </h2>

    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {starterDeckGroups
  .filter((deck) => {
    const deckCards = [];

    const add = (rarity: string, count: number) => {
      for (let i = 1; i <= count; i++) {
        deckCards.push(
          `STARTER-${deck.code}${rarity}${String(i).padStart(2, "0")}`
        );
      }
    };

    add("C", 9);
    add("U", 4);
    add("SR", 2);

    const deckIndex =
      deck.code.slice(-1).charCodeAt(0) - 64;

    deckCards.push(
      `STARTER-SD01ER${String(deckIndex).padStart(2, "0")}`
    );

    add("SPR", 4);

    deckCards.push(
      `STARTER-SD01RR${String(deckIndex).padStart(2, "0")}`
    );

    return deckCards.some((key) => !owned[key]);
  })
  .map((deck, i) => (
        <div key={deck.code}>
          <div className="mb-1 text-center text-xs font-bold text-zinc-300">
            {deck.code}
          </div>

          <img
  src={starterDeckImages[i]}
  className="mx-auto w-28 rounded-lg"
/>
        </div>
      ))}
    </div>
  </section>
)}

{sets
.filter((set) => {
  if (hiddenSets.includes(set.id)) return false;

  return true;
})
.filter((set) => {
  if (cardCodeSearch || characterSearch.trim()) {
    return true;
  }

  return (
    window.innerWidth >= 768
      ? true
      : selectedSet === set.id
  );
})
  .map((set) => {
const cards = Object.entries(set.rarities).flatMap(
  ([rarity, count]) => {

    if (set.id === "SD") {

      if (rarity === "PER") {
        return Array.from({ length: count as number }, (_, i) => ({
          rarity,
          key: `SD01PER${String(i + 7).padStart(2, "0")}`,
          characters:
            TCGCharacterMap[`SD-PER-${i + 7}`] ?? [],
        }));
      }

      return Array.from({ length: count as number }, (_, i) => ({
        rarity,
        key: `SD01${rarity}${String(i + 1).padStart(2, "0")}`,
        characters:
          TCGCharacterMap[`SD-${rarity}-${i + 1}`] ?? [],
      }));
    }

    if (set.id === "12") {

      if (rarity === "PER") {
        return Array.from({ length: 6 }, (_, i) => [
          {
            rarity,
            key: `BP02-PER${String(i + 1).padStart(2, "0")}-A2`,
            characters:
              TCGCharacterMap[`12-PER-${i * 2 + 1}`] ?? [],
          },
          {
            rarity,
            key: `BP02-PER${String(i + 1).padStart(2, "0")}-B2`,
            characters:
              TCGCharacterMap[`12-PER-${i * 2 + 2}`] ?? [],
          },
        ]).flat();
      }

      const countNum = count as number;

      return Array.from({ length: countNum }, (_, i) => ({
        rarity,
        key: `BP02-${rarity}${String(i + 1).padStart(2, "0")}`,
        characters:
  TCGCharacterMap[
    `BP02-${rarity}${String(i + 1).padStart(2, "0")}`
  ] ?? [],
      }));
    }

    if (rarity === "ER") {
      return Array.from({ length: 6 }, (_, i) => ({
        rarity,
        key: `BP01ER${String(i + 7).padStart(2, "0")}`,
        characters:
          TCGCharacterMap[`FW-ER-${i + 7}`] ?? [],
      }));
    }

    if (rarity === "PSPR") {
      const numbers = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];

      return numbers.map((n, index) => ({
        rarity,
        key: `BP01PSPR${String(n).padStart(2, "0")}`,
        characters:
          TCGCharacterMap[`FW-PSPR-${index + 1}`] ?? [],
      }));
    }

    return Array.from({ length: count as number }, (_, i) => ({
      rarity,
      key: `BP01${rarity}${String(i + 1).padStart(2, "0")}`,
      characters:
        TCGCharacterMap[`FW-${rarity}-${i + 1}`] ?? [],
    }));
  }
);


const missing = cards.filter((card) => {
  let displayCode = "";

  if (set.id === "SD") {
    if (card.rarity === "PER") {
      const num = parseInt(card.key.slice(-2), 10);
      const displayNum = Math.ceil((num - 6) / 2) + 6;
      displayCode = `※SD01-ER${String(displayNum).padStart(2, "0")}`;
    } else if (card.rarity === "PRR") {
      displayCode = `※SD01-RR${card.key.slice(-2)}`;
    } else {
      displayCode = card.key.replace(/^SD01/, "SD01-");
    }
  } else if (set.id === "12") {
    if (card.rarity === "PER") {
      const match = card.key.match(/PER(\d{2})/);
      displayCode = match ? `※BP02-ER${match[1]}` : card.key;
    } else if (card.rarity === "PSPR") {
      const displayMap = [
        "01","02","05","10","14","15",
        "16","18","23","24","26",
      ];

      const index = parseInt(card.key.match(/\d{2}/)?.[0] ?? "1", 10) - 1;
      displayCode = `※BP02-SPR${displayMap[index]}`;
    } else if (card.rarity === "PGR") {
      displayCode = `※BP02-GR${card.key.slice(-2)}`;
    } else if (card.rarity === "PCR") {
      displayCode = `※BP02-CR${card.key.slice(-2)}`;
    } else if (card.rarity === "PRR") {
      displayCode = `※BP02-RR${card.key.slice(-2)}`;
    } else {
      displayCode = card.key.replace(/^BP02/, "BP02-");
    }
  } else {
    if (card.rarity === "ER") {
      displayCode = `BP01-ER${card.key.slice(-2)}`;
    } else if (card.rarity === "PER") {
      const perMap = [
        "01","02","02","02","03","03",
        "04","04","05","05","06","06",
      ];

      const index = parseInt(card.key.slice(-2), 10) - 1;
      displayCode = `※BP01-ER${perMap[index]}`;
    } else if (card.rarity === "PSPR") {
      displayCode = `※BP01-SPR${card.key.slice(-2)}`;
    } else if (card.rarity === "PGR") {
      displayCode = `※BP01-GR${card.key.slice(-2)}`;
    } else if (card.rarity === "PCR") {
      displayCode = `※BP01-CR${card.key.slice(-2)}`;
    } else if (card.rarity === "PRR") {
      displayCode = `※BP01-RR${card.key.slice(-2)}`;
    } else {
      displayCode = card.key.replace(/^BP01/, "BP01-");
    }
  }

const search = cardCodeSearch.trim().toUpperCase();

if (
  search !== "" &&
  !displayCode.toUpperCase().startsWith(search)
) {
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
  if (searchAllCards) {
    return true;
  }

if (set.id === "SD") {
  return !owned[`BONUS-${card.key}`];
}

return !owned[card.key];

  return !owned[card.key];
});

        if (missing.length === 0) {
  return cardCodeSearch ? (
    <div data-iso-empty />
  ) : null;
}

        return (
<section
  id={`set-${set.id}`}
  key={set.id}
  className={`
    p-0
    ${cardCodeSearch || characterSearch.trim() ? "mt-8" : ""}
    md:mt-0
    md:rounded-lg
    md:border
    md:border-zinc-700
    md:bg-[#202020]
    md:p-6
  `}
>

<h2
  className={`mb-6 text-2xl font-semibold ${
    cardCodeSearch || characterSearch.trim()
      ? "block"
      : "hidden md:block"
  }`}
>
  {set.name}
</h2>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
              {missing.map((card) => {


const cardContent = (
  <>
    <div className="mb-1 text-center text-[9px] md:text-xs font-bold tracking-tight md:tracking-wide text-zinc-300 whitespace-nowrap">
      {set.id === "SD" ? (
        (() => {
          if (card.rarity === "PER") {
            const num = parseInt(card.key.slice(-2), 10);
            const displayNum = Math.ceil((num - 6) / 2) + 6;
            return `※SD01-ER${String(displayNum).padStart(2, "0")}`;
          }

          if (card.rarity === "PRR") {
            return `※SD01-RR${card.key.slice(-2)}`;
          }

          return card.key.replace(/^SD01/, "SD01-");
        })()
      ) : (
        (() => {
          if (card.rarity === "ER") {
            return `${set.id === "12" ? "BP02" : "BP01"}-ER${card.key.slice(-2)}`;
          }

          if (set.id === "12" && card.rarity === "PER") {
            const match = card.key.match(/PER(\d{2})/);

            if (!match) return card.key;

            return `※BP02-ER${match[1]}`;
          }

          if (set.id === "12" && card.rarity === "PSPR") {
            const displayMap = [
              "01",
              "02",
              "05",
              "10",
              "14",
              "15",
              "16",
              "18",
              "23",
              "24",
              "26",
            ];

            const index = parseInt(card.key.slice(-2), 10) - 1;

            return `※BP02-SPR${displayMap[index]}`;
          }

          if (card.rarity === "PER") {
            const perMap = [
              "01",
              "02",
              "02",
              "02",
              "03",
              "03",
              "04",
              "04",
              "05",
              "05",
              "06",
              "06",
            ];

            const index = parseInt(card.key.slice(-2), 10) - 1;

            return `※BP01-ER${perMap[index]}`;
          }

          if (card.rarity === "RR") {
            return `${set.id === "12" ? "BP02" : "BP01"}-RR${card.key.slice(-2)}`;
          }

          if (card.rarity === "PSPR") {
            return `※BP01-SPR${card.key.slice(-2)}`;
          }

          if (card.rarity === "PGR") {
            return `※${set.id === "12" ? "BP02" : "BP01"}-GR${card.key.slice(-2)}`;
          }

          if (card.rarity === "PCR") {
            return `※${set.id === "12" ? "BP02" : "BP01"}-CR${card.key.slice(-2)}`;
          }

          if (card.rarity === "PRR") {
            return `※${set.id === "12" ? "BP02" : "BP01"}-RR${card.key.slice(-2)}`;
          }

          return card.key.replace(/^BP01/, "BP01-");
        })()
      )}
    </div>

    <img
      src={
        set.id === "12"
          ? `/cards/discord/${card.key}.webp`
          : card.key.startsWith("BP01ER")
          ? `/fantasy-wonderland/SD01ER${card.key.slice(-2)}.webp`
          : card.key.startsWith("BP01PER")
          ? `/fantasy-wonderland/SD01PER${card.key.slice(-2)}.webp`
          : `/${set.folder}/${card.key}.webp`
      }
      className="w-full rounded-lg aspect-[5/7]"
    />
  </>
);

return searchAllCards ? (
  <div key={`${card.rarity}-${card.key}`}>
    {cardContent}
  </div>
) : (
  <ISOChecking
    key={`${card.rarity}-${card.key}`}
    userId={userId}
    setId={set.id}
    cardKey={
      set.id === "SD"
        ? `BONUS-${card.key}`
        : card.key
    }
    onComplete={() =>
      setOwned((prev) => ({
        ...prev,
        [set.id === "SD"
          ? `BONUS-${card.key}`
          : card.key]: true,
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
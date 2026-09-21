import { tcgCatalog } from "@/lib/iso-card-catalog";
const { sets, getCards, getDisplayCardCode, getDisplayRarity } = tcgCatalog;
import { cardImagePaths } from "@/lib/card-images";
import CardImage from "@/components/CardImage";
import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import ISOChecking from "./iso-checking";
import { useWishlist } from "./wishlist-in-iso";
import { TCGCharacterMap } from "./Card Characters/card-characters-tcg";
const MissingImageCard = ({
  src,
  className,
  style,
}: {
  src: string;
  className: string;
  style?: CSSProperties;
}) => {
const [failed, setFailed] = useState(false);
const landscape = className.includes("landscape-card");
const imageClass = landscape
    ? "absolute left-1/2 top-1/2 h-[71.4286%] w-[140%] max-w-none rounded-xl object-cover"
    : className;
const imageStyle = landscape
    ? { transform: "translate(-50%, -50%) rotate(-90deg)" }
    : style;
  if (failed) {
    return (
      <div
        className={`${landscape ? "relative aspect-[5/7] overflow-hidden rounded-xl" : className} flex items-center justify-center bg-zinc-300 grayscale dark:bg-zinc-700`}
        style={landscape ? style : undefined}
      >
        <span className="rounded-lg bg-zinc-800/80 px-2 py-1 text-center text-[10px] font-black tracking-wider text-white sm:text-xs">
          COMING SOON
        </span>
      </div>
    );
  }
  return (
    landscape ? (
      <div className={`${className.replace("landscape-card", "")} relative aspect-[5/7] overflow-hidden rounded-xl`}>
        <CardImage src={src} className={imageClass} style={imageStyle} onError={() => setFailed(true)} alt="" />
      </div>
    ) : (
      <CardImage src={src} className={className} style={style} onError={() => setFailed(true)} alt="" />
    )
  );
};
interface ISOTCGProps {
  cardCodeSearch: string;
  characterSearch: string;
  searchAllCards: boolean;
  hiddenSets: string[];
  wishlistMode: boolean;
}
export default function ISOTCG({
  cardCodeSearch,
  characterSearch,
  searchAllCards,
  hiddenSets,
  wishlistMode,
}: ISOTCGProps) {
const [owned, setOwned] = useState<Record<string, boolean>>({});
const [inProgress, setInProgress] = useState<Set<string>>(new Set());
const [loading, setLoading] = useState(true);
const [userId, setUserId] = useState("");
const { wishlist, toggleWishlist } = useWishlist();
const [selectedSet, setSelectedSet] =
  useState<string | null>(null);
const [selectedRarities, setSelectedRarities] = useState<Record<string, string>>({});
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
      if (set.id === "SD" && key.startsWith("SD01")) {
        allOwned[`BONUS-${key}`] = true;
      }
    }
  });
}
setOwned(allOwned);
const { data: statusRows } = await supabase
  .from("iso_status")
  .select("card_key, status")
  .eq("user_id", user.id);
const activeInProgress = new Set<string>();
(statusRows ?? []).forEach((row: any) => {
  if (
    row.status === "purchase_in_progress" ||
    row.status === "trade_in_progress"
  ) {
    activeInProgress.add(String(row.card_key));
  }
});
setInProgress(activeInProgress);
setLoading(false);
    };
    load();
  }, []);
  if (loading) {
    return <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading...</div>;
  }
return (
  <div className="space-y-6">
    {!(cardCodeSearch || characterSearch.trim()) && (
  <div className="sticky top-0 z-20 py-2">
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#17191a]/95 md:flex-wrap md:overflow-visible">
{sets.map((set) => ({ id: set.id, label: set.name }))
.filter((item) => !hiddenSets.includes(item.id))
.map((item) => (
<button
  key={item.id}
onClick={() => {
  setSelectedSet(item.id);
}}
className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
  selectedSet === item.id
    ? "bg-[#FFD54A] text-zinc-900"
    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
}`}
         >
  <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
)}
{!(cardCodeSearch || characterSearch.trim()) &&
(selectedSet === null || selectedSet === "SD") &&
!hiddenSets.includes("SD") &&
(searchAllCards || wishlistMode || starterDeckGroups.some((deck) => {
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
})) && (
  <section
    className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-4"
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
    return searchAllCards || wishlistMode || deckCards.some((key) => !owned[key]);
  })
  .map((deck, i) => (
        <div key={deck.code}>
          <div className="hidden">
            {deck.code}
          </div>
          <CardImage
  src={starterDeckImages[i]}
  className="mx-auto w-full max-w-28 rounded-xl"
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
  if ((cardCodeSearch || characterSearch.trim()) && set.id === "SD") {
    return false;
  }
  return true;
})
.filter((set) => {
  if (cardCodeSearch || characterSearch.trim()) {
    return true;
  }
  return selectedSet === null || selectedSet === set.id;
})
  .map((set) => {
const cards = getCards(set, TCGCharacterMap);
const missing = cards.filter((card) => {
const displayCode = getDisplayCardCode(set.id, card);
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
if (wishlistMode || searchAllCards) {
  return true;
}
if (set.id === "SD") {
const statusKey = `BONUS-${card.key}`;
  return !owned[statusKey] && !inProgress.has(statusKey);
}
if (set.id === "FW") {
  return !owned[card.key] && !inProgress.has(card.key);
}
const statusKey = `${set.id}-${card.key}`;
return !owned[card.key] && !inProgress.has(statusKey);
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
    className={`rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-4 ${
      cardCodeSearch || characterSearch.trim() ? "mt-6" : ""
    }`}
  >
    <div className="mb-4 flex items-center justify-between gap-3">
<div className="min-w-0">
<h2 className="truncate text-base font-semibold">{set.name}</h2>
<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{missing.length} {missing.length === 1 ? "card" : "cards"}</p>
</div>
{(() => {
const availableRarities = Object.keys(set.rarities).filter((rarity) =>
missing.some((card) => card.rarity === rarity)
);
const selectedRarity =
selectedRarities[set.id] && availableRarities.includes(selectedRarities[set.id])
? selectedRarities[set.id]
: "all";
return (
<select
value={selectedRarity}
onChange={(event: { target: { value: string } }) =>
setSelectedRarities((current) => ({
...current,
[set.id]: event.target.value,
}))
}
aria-label={`Filter ${set.name} by rarity`}
className="max-w-[160px] rounded-xl border border-black/10 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200"
>
<option value="all">All rarities</option>
{availableRarities.map((rarity) => (
<option key={rarity} value={rarity}>{getDisplayRarity(rarity)}</option>
))}
</select>
);
})()}
</div>
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
              {missing.filter((card) => {
const availableRarities = Object.keys(set.rarities).filter((rarity) =>
missing.some((item) => item.rarity === rarity)
);
const selectedRarity =
selectedRarities[set.id] && availableRarities.includes(selectedRarities[set.id])
? selectedRarities[set.id]
: "all";
return selectedRarity === "all" || card.rarity === selectedRarity;
}).map((card) => {
const landscape =
  set.id === "14" && /^BP03-C(2[5-9]|3[0-9]|4[0-8])$/.test(card.key);
const fullKey =
  set.id === "SD"
    ? `${set.id}:BONUS-${card.key}`
    : `${set.id}:${card.key}`;
const isWishlisted = wishlist.has(fullKey);
  wishlist.has(fullKey) ||
  wishlist.has(
    `${set.id}:${card.key.padStart?.(0) ?? card.key}`
  );
const cardContent = (
  <>
    <div className="hidden">
      <div className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/[0.06]">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {getDisplayCardCode(set.id, card)}
        </span>
      </div>
    </div>
    <MissingImageCard
      src={
        set.id === "12"
          ? cardImagePaths.discord(card.key)
          : set.id === "14"
          ? cardImagePaths.nightmareNight(card.key)
          : card.key.startsWith("BP01ER")
          ? cardImagePaths.fantasyEmerald(card.key.slice(-2))
          : card.key.startsWith("BP01PER")
          ? cardImagePaths.fantasyParallelEmerald(card.key.slice(-2))
          : cardImagePaths.byFolder(set.folder, card.key)
      }
      className={`${landscape ? "landscape-card" : "aspect-[5/7] w-full"} rounded-xl object-cover ${
isWishlisted
? "ring-4 ring-pink-400 ring-offset-2 ring-offset-white dark:ring-offset-[#17191a]"
: ""
}`}
    />
  </>
);
return searchAllCards && !wishlistMode ? (
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
    wishlistMode={wishlistMode}
    isWishlisted={isWishlisted}
    toggleWishlist={toggleWishlist}
    onStatusChange={(nextStatus) => {
const statusKey =
        set.id === "SD"
          ? `BONUS-${card.key}`
          : set.id === "FW"
          ? card.key
          : `${set.id}-${card.key}`;
      setInProgress((prev) => {
const next = new Set(prev);
        if (nextStatus) {
          next.add(statusKey);
        } else {
          next.delete(statusKey);
        }
        return next;
      });
    }}
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

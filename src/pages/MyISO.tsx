import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import myProgressBadge from "@/assets/avatars/personaliso.png";

const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: {
      R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7
    }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: {
      R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1
    }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: {
      R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7
    }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: {
      N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12
    }
  },
  {
  id: "8",
  name: "Fun Moments Second Edition",
  folder: "fun-moments-two",   
  prefix: "FM2",               
  total: 136,
  rarities: { N: 20, SN: 20, R:35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
},
{
  id: "SD_STARTERS",
  name: "Friendships Begin - Character Decks"
},
{
  id: "SD_BONUS",
  name: "Friendships Begin - Bonus Deck"
},
{
  id: "FW",
  name: "Fantasy Wonderland",
  folder: "fantasywonderland",
  prefix: "BP01",
  total: 191
},
  {
    id: "9",
    name: "Promos",
    folder: "promo-cards",
    prefix: "PR",
    rarities: { PR: 5 }
  },
  {
    id: "10",
    name: "Serialized & Limited Cards",
    folder: "serialized-limited-cards",
    prefix: "LC",
    rarities: { LC: 1 }
  }
];

const MyISO = () => {
  const [username, setUsername] = useState("");
  const [owned, setOwned] = useState<Record<string, boolean>>({});
const [rawProgress, setRawProgress] = useState<any[]>([]);
const [hiddenSetsCCG, setHiddenSetsCCG] = useState<string[]>([]);
const [hiddenSetsTCG, setHiddenSetsTCG] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
const [mode, setMode] = useState<string>("CCG");
const [collapsedRarities, setCollapsedRarities] = useState<Record<string, boolean>>({});

  useEffect(() => {
  const load = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }
    if (!user) {
      setUserId(null);
      setOwned({});
      setHiddenSetsCCG([]);
setHiddenSetsTCG([]);
      setUsername("My");
      setLoading(false);
      return;
    }
    setUserId(user.id);
    setUsername(user.user_metadata?.username || "My");

    const { data: progress } = await supabase
      .from("collection_progress")
      .select("*")
      .eq("user_id", user.id);


      
    const allOwned: Record<string, boolean> = {};

    progress?.forEach((set: any) => {
      Object.entries(set.progress || {}).forEach(([key, value]) => {
        if (value) {
if (set.set_id === "SD") {
  allOwned[`SD-${key}`] = true;
} else {
  allOwned[`${set.set_id}-${key}`] = true;
}
        }
      });
    });

 progress?.forEach((set: any) => {
  Object.entries(set.progress || {}).forEach(([key, value]) => {
    if (value) {
      allOwned[`${set.set_id}-${key}`] = true;
    }
  });
});

    setOwned(allOwned);
    setRawProgress(progress || []);

const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets, iso_hidden_sets_ccg, iso_hidden_sets_tcg")
  .eq("id", user.id)
  .single();

const p = profile as any;

const global = p?.iso_hidden_sets || [];

setHiddenSetsCCG(global);
setHiddenSetsTCG(global);

    setLoading(false);
  };

  // initial load
  load();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    load(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

const toggleSet = async (setId: string) => {
  if (!userId) return;

  const current = mode === "CCG" ? hiddenSetsCCG : hiddenSetsTCG;
  const setter = mode === "CCG" ? setHiddenSetsCCG : setHiddenSetsTCG;

  const updated = current.includes(setId)
    ? current.filter(id => id !== setId)
    : [...current, setId];

  setter(updated);

await supabase
  .from("profiles")
  .update({
    ...(mode === "CCG"
      ? {
          iso_hidden_sets_ccg: updated,
          iso_hidden_sets: updated
        }
      : {
          iso_hidden_sets_tcg: updated,
          iso_hidden_sets: updated
        })
  })
  .eq("id", userId);
};

const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

  return (
    <div
  className="min-h-screen"
  style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
>
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
<div className="relative z-40 rounded-3xl border border-[#d4af37]/40 bg-white/70 backdrop-blur-md shadow-lg px-5 py-5 mb-8">
  <div className="flex flex-col items-center justify-center gap-3 text-center">
  
<div className="flex flex-col items-center">
    <img
  src={myProgressBadge}
  alt="Personal ISO"
  className="mx-auto h-14 sm:h-16 md:h-20 object-contain"
/>
    
    <div className="flex justify-center gap-2 mt-2">
  <button
    onClick={() => setMode("CCG")}
    className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
      mode === "CCG"
        ? "bg-[#5a3e84] text-[#f5e6a8] border-[#d4af37]"
        : "bg-white text-[#5a3e84]"
    }`}
  >
    CCG
  </button>

  <button
    onClick={() => setMode("TCG")}
    className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
      mode === "TCG"
        ? "bg-[#5a3e84] text-[#f5e6a8] border-[#d4af37]"
        : "bg-white text-[#5a3e84]"
    }`}
  >
    TCG
  </button>
</div>
  
  </div>

  <div className="relative z-[9999]">
    <button
  onClick={() => setShowDropdown(!showDropdown)}
  className="whitespace-nowrap text-sm px-4 py-1.5 rounded-lg 
             bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] 
             text-[#f5e6a8] font-semibold 
             border border-[#d4af37]/60 
             shadow-sm hover:shadow-md hover:scale-[1.02] 
             transition"
>
  Hide Sets
</button>

            {showDropdown && (
<div className="fixed top-[185px] left-1/2 -translate-x-1/2 md:absolute md:top-auto md:left-auto md:translate-x-0 md:right-0 mt-2 w-[90vw] max-w-sm bg-white border border-[#d4af37]/40 rounded-2xl shadow-2xl p-4 z-[99999]">
                <h2 className="font-semibold mb-1">
                  Not wanting to collect every set?
                </h2>

                <p className="text-sm text-muted-foreground mb-3">
                  Hide unwanted sets.
                </p>

                <div className="space-y-2">
{sets
  .filter(set =>
    mode === "CCG"
      ? ["1","2","5","7","8","9","10"].includes(set.id)
      : ["SD_STARTERS","SD_BONUS","FW"].includes(set.id)
  )
  .filter(set => {

    // STARTER DECKS (CHARACTER DECKS)
    if (set.id === "SD_STARTERS") {
      return Object.keys(owned).filter(k => k.startsWith("SD-")).length < 126;
    }

    // BONUS PACKS (SEPARATE — DOES NOT USE SD-)
    if (set.id === "SD_BONUS") {
      return Object.keys(owned).filter(k => k.startsWith("SD-BONUS-")).length < 68;
    }

    // FANTASY WONDERLAND
    if (set.id === "FW") {
      return Object.keys(owned).filter(k => k.startsWith("FW-")).length < 191;
    }

    // NORMAL CCG SETS
    if (set.rarities) {
      const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
        Array.from({ length: count as number }, (_, i) => ({
          rarity,
          number: i + 1
        }))
      );

      return cards.some(card => {
        const key = `${card.rarity}-${card.number}`;
        return !owned[`${set.id}-${key}`];
      });
    }

    return true;
  })
  .map(set => (
    <label key={set.id} className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={(mode === "CCG" ? hiddenSetsCCG : hiddenSetsTCG).includes(set.id)}
        onChange={() => toggleSet(set.id)}
      />
      {set.name}
    </label>
  ))}
                </div>

              </div>
            )}
          </div>
        </div>
        </div>

        {/* GRID FIX */}
<div>
  {loading ? (
    <div className="text-center py-10 text-muted-foreground">
      Loading your ISO...
    </div>
  ) : (
  <>

{mode === "TCG" &&
  Array.from({ length: 6 }, (_, i) => {
    const key = `RR${String(i + 1).padStart(2, "0")}`;
    return owned[`tcgpromos-${key}`];
  }).every(Boolean) === false && (

  <div className="border rounded-xl p-4 bg-card mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      TCG Promos
    </h2>

    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 gap-2">
      {Array.from({ length: 6 }, (_, i) => {
        const num = i + 1;
        const key = `RR${String(num).padStart(2, "0")}`;
        const stateKey = `tcgpromos-${key}`;

        if (owned[stateKey]) return null;

        return (
          <div key={key} className="relative w-full">
            <img
              src={`/tcgpromos/${key}.png`}
              className="rounded-lg w-full"
            />
          </div>
        );
      })}
    </div>
  </div>
)}
  {/* STARTER DECKS */}
{mode === "TCG" &&
 !hiddenSetsTCG.includes("SD_STARTERS") &&
 ["SD01A","SD01B","SD01C","SD01D","SD01E","SD01F"].some(deck =>
  !(
    (() => {
      const progressData =
        rawProgress.find((s: any) => s.set_id === "SD")?.progress || {};

      const deckLetter = deck.slice(-1);
      const deckIndex = deckLetter.charCodeAt(0) - 64;

      const requiredCards: string[] = [];

      const add = (rarity: string, count: number) => {
        for (let i = 1; i <= count; i++) {
          requiredCards.push(
            `${deck}${rarity}${String(i).padStart(2, "0")}`
          );
        }
      };

      add("C", 9);
      add("U", 4);
      add("SR", 2);

      requiredCards.push(
        `SD01ER${String(deckIndex).padStart(2, "0")}`
      );

      add("SPR", 4);

      requiredCards.push(
        `SD01RR${String(deckIndex).padStart(2, "0")}`
      );

      return requiredCards.every(
        (key) => progressData[`STARTER-${key}`]
      );
    })()
  )
) && (

  <div className="border rounded-xl p-4 bg-card mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      Friendships Begin — Starter Decks
    </h2>

    <div className="flex flex-wrap gap-4 justify-center">
     {[
  { code: "SD01A", src: "/starter-decks-boxes/SDTWILIGHT.png" },
  { code: "SD01B", src: "/starter-decks-boxes/SDFLUTTERSHY.png" },
  { code: "SD01C", src: "/starter-decks-boxes/SDPINKIEPIE.png" },
  { code: "SD01D", src: "/starter-decks-boxes/SDAPPLEJACK.png" },
  { code: "SD01E", src: "/starter-decks-boxes/SDRAINBOWDASH.png" },
  { code: "SD01F", src: "/starter-decks-boxes/SDRARITY.png" },
].filter((deck) => {

  const progressData =
    rawProgress.find((s: any) => s.set_id === "SD")?.progress || {};

  const deckLetter = deck.code.slice(-1);
  const deckIndex = deckLetter.charCodeAt(0) - 64;

  const requiredCards: string[] = [];

  const add = (rarity: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      requiredCards.push(
        `${deck.code}${rarity}${String(i).padStart(2, "0")}`
      );
    }
  };

  add("C", 9);
  add("U", 4);
  add("SR", 2);

  requiredCards.push(
    `SD01ER${String(deckIndex).padStart(2, "0")}`
  );

  add("SPR", 4);

  requiredCards.push(
    `SD01RR${String(deckIndex).padStart(2, "0")}`
  );

  const complete = requiredCards.every(
    (key) => progressData[`STARTER-${key}`]
  );

  return !complete;

}).map((deck) => (
        <img
          key={deck.code}
          src={deck.src}
          className="h-20 sm:h-24 object-contain rounded-xl opacity-90"
        />
      ))}
    </div>
  </div>
)}

 {/* BONUS PACKS */}
{mode === "TCG" && !hiddenSetsTCG.includes("SD_BONUS") && (
  <div className="border rounded-xl p-4 bg-card mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      Friendships Begin - Bonus Deck
    </h2>

<div className="space-y-8">

  {[
    { prefix: "SD01C", count: 9, label: "COMMON" },
    { prefix: "SD01U", count: 7, label: "UNCOMMON" },
    { prefix: "SD01SR", count: 6, label: "SILVER RARE" },
    { prefix: "SD01SPR", count: 10, label: "SPECIAL RARE" },
    { prefix: "SD01GR", count: 6, label: "GOLD RARE" },
    { prefix: "SD01CR", count: 6, label: "COLORFUL RARE" },
    { prefix: "SD01ER", count: 6, label: "EMERALD RARE" },
    { prefix: "SD01PER", count: 12, label: "※EMERALD RARE" },
    { prefix: "SD01PRR", count: 6, label: "※RUBY RARE" },
  ].map(({ prefix, count, label }) => {

    const collapseKey = `SD_BONUS-${prefix}`;
    const isCollapsed = collapsedRarities[collapseKey];

    const cards = Array.from({ length: count }, (_, i) => {
      let actualIndex = i + 1;

      if (prefix === "SD01PER") {
        actualIndex = i + 7;
        if (actualIndex > 18) return null;
      }

      const num = String(actualIndex).padStart(2, "0");
      const key = `${prefix}${num}`;
      const stateKey = `SD-BONUS-${key}`;

      if (owned[stateKey]) return null;

      return key;
    }).filter(Boolean);

    if (cards.length === 0) return null;

    return (
      <div key={prefix}>

        <button
          onClick={() =>
            setCollapsedRarities((prev) => ({
              ...prev,
              [collapseKey]: !prev[collapseKey],
            }))
          }
          className="relative w-full flex items-center justify-center gap-3 mb-3 group"
        >

          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[100px]" />

          <span className="text-[10px] sm:text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
            {label}
          </span>

          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[100px]" />

          <div className="absolute right-0 text-[#8b6a2b] text-sm">
            {isCollapsed ? "+" : "−"}
          </div>

        </button>

        {!isCollapsed && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">

            {cards.map((key) => (
              <div key={key} className="relative w-full aspect-[5/7]">
                <img
                  src={`/friendships-begin/${key}.png`}
                  className="rounded-xl w-full h-full object-cover shadow-md hover:scale-[1.03] hover:shadow-xl transition"
                />
              </div>
            ))}

          </div>
        )}

      </div>
    );
  })}

</div>
  </div>
)}


{mode === "TCG" && !hiddenSetsTCG.includes("FW") && (
  <div className="border rounded-xl p-4 bg-card mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      Fantasy Wonderland
    </h2>

    <div className="space-y-8">

  {[
    { prefix: "BP01C", count: 48, label: "COMMON" },
    { prefix: "BP01U", count: 18, label: "UNCOMMON" },
    { prefix: "BP01ER", count: 6, label: "EMERALD RARE" },
    { prefix: "BP01SR", count: 14, label: "SILVER RARE" },
    { prefix: "BP01SPR", count: 28, label: "SPECIAL RARE" },
    { prefix: "BP01GR", count: 12, label: "GOLD RARE" },
    { prefix: "BP01CR", count: 12, label: "COLORFUL RARE" },
    { prefix: "BP01RR", count: 6, label: "RUBY RARE" },
    { prefix: "BP01PER", count: 12, label: "※EMERALD RARE" },
    { prefix: "BP01PSPR", count: 11, label: "※SPECIAL RARE" },
    { prefix: "BP01PGR", count: 6, label: "※GOLD RARE" },
    { prefix: "BP01PCR", count: 12, label: "※COLORFUL RARE" },
    { prefix: "BP01PRR", count: 6, label: "※RUBY RARE" },
  ].map(({ prefix, count, label }) => {

    const collapseKey = `FW-${prefix}`;
    const isCollapsed = collapsedRarities[collapseKey];

    const cards = Array.from({ length: count }, (_, i) => {

      let num = i + 1;

      if (prefix === "BP01ER") {
        num = i + 7;
      }

      let key = `${prefix}${String(num).padStart(2, "0")}`;

      if (prefix === "BP01PSPR") {
        const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
        const realNum = PSPR_NUMBERS[i];

        if (!realNum) return null;

        key = `BP01PSPR${String(realNum).padStart(2, "0")}`;
      }

      if (owned[`FW-${key}`]) return null;

      return key;

    }).filter(Boolean);

    if (cards.length === 0) return null;

    return (
      <div key={prefix}>

        <button
          onClick={() =>
            setCollapsedRarities((prev) => ({
              ...prev,
              [collapseKey]: !prev[collapseKey],
            }))
          }
          className="relative w-full flex items-center justify-center gap-3 mb-3 group"
        >

          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[100px]" />

          <span className="text-[10px] sm:text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
            {label}
          </span>

          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[100px]" />

          <div className="absolute right-0 text-[#8b6a2b] text-sm">
            {isCollapsed ? "+" : "−"}
          </div>

        </button>

        {!isCollapsed && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">

            {cards.map((key) => (
              <div key={key} className="relative w-full aspect-[5/7]">
                <img
                  src={
                    key.startsWith("BP01ER")
                      ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.png`
                      : key.startsWith("BP01PER")
                      ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.png`
                      : `/fantasy-wonderland/${key}.png`
                  }
                  className="rounded-xl w-full h-full object-cover shadow-md hover:scale-[1.03] hover:shadow-xl transition"
                />
              </div>
            ))}

          </div>
        )}

      </div>
    );
  })}

</div>
  </div>
)}

  {/* MAIN GRID */}
  <div className="grid grid-cols-1 gap-6">
   {sets
.filter(set =>
  mode === "CCG" &&
  !hiddenSetsCCG.includes(set.id) &&
  set.rarities
)
      .map((set) => {
        const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
          Array.from({ length: count as number }, (_, i) => ({
            rarity,
            number: i + 1
          }))
        );

        const missing = cards.filter(card => {
          const key = `${card.rarity}-${card.number}`;
          return !owned[`${set.id}-${key}`];
        });

        const groupedMissing = missing.reduce((acc, card) => {
  if (!acc[card.rarity]) {
    acc[card.rarity] = [];
  }

  acc[card.rarity].push(card);

  return acc;
}, {} as Record<string, typeof missing>);

        if (missing.length === 0) return null;

        return (
          <div key={set.id} className="rounded-3xl border border-[#d4af37]/40 bg-gradient-to-br from-white/80 to-[#f6f0ff]/70 backdrop-blur-sm shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-5">

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />

  <span className="text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
    {set.name}
  </span>

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />

</div>

<div className="space-y-8">

{Object.entries(groupedMissing).map(([rarity, rarityCards]) => {

  const collapseKey = `${set.id}-${rarity}`;
  const isCollapsed = collapsedRarities[collapseKey];

  return (

    <div key={rarity}>

      {/* RARITY HEADER */}
      <button
  onClick={() =>
    setCollapsedRarities((prev) => ({
      ...prev,
      [collapseKey]: !prev[collapseKey],
    }))
  }
  className="relative w-full flex items-center justify-center gap-3 mb-2 group"
>

        <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[100px]" />

        <span className="text-[10px] sm:text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
 {
  rarity === "LC"
    ? "PR"
    : rarity === "SZR"
    ? "◇ZR"
    : rarity
}
</span>

        <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[100px]" />

        <div className="absolute right-0 text-[#8b6a2b] text-sm group-hover:scale-110 transition">
  {isCollapsed ? "+" : "−"}
</div>

      </button>

      {/* CARD GRID */}
      {!isCollapsed && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">

          {rarityCards.map((card) => {
            const isDoubleCard =
              set.id === "moon3hidden" &&
              card.rarity === "SZR" &&
              card.number === 1;

            return (
              <div
                key={`${card.rarity}-${card.number}`}
                className={`relative ${
                  isDoubleCard
                    ? "col-span-2 aspect-[10/7]"
                    : "w-full aspect-[5/7]"
                }`}
              >
                <img
                  src={
                    set.id === "9"
                      ? `/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`
                      : set.id === "10"
                      ? "/serialized-limited-cards/andypricepromo.jpg"
                      : `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`
                  }
                  className="rounded-xl w-full h-full object-cover shadow-md hover:scale-[1.03] hover:shadow-xl transition"
                />
              </div>
            );
          })}

        </div>
      )}

    </div>

  );
})}

</div>
          </div>
        );
      })}
  </div>
</>
)}
</div>

        </div>

      </div>
  );
};

export default MyISO;
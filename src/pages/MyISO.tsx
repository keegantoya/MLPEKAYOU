import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import myProgressBadge from "@/assets/avatars/personaliso.png";
import MyISOSidebar from "@/components/MyISOSidebar";

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
    SZR: 3
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
  id: "11",
  name: "Fun Moments Third Edition",
  folder: "fun-moments-three",
  prefix: "FM3",
  rarities: {
    N: 20,
    SN: 20,
    R: 35,
    SR: 15,
    SSR: 15,
    UR: 10,
    UGR: 9,
    CR: 12,
    SCR: 12
  }
},
{
  id: "6",
  name: "Rainbow: Second Edition",
  folder: "rainbow-two",
  prefix: "R2",
  rarities: {
    BASE: 18,
    R: 30,
    SR: 14,
    FR: 18,
    ST: 20,
    TR: 12,
    TGR: 8,
    SSR: 15,
    UR: 19,
    USR: 8,
    XR: 8
  }
},

{
  id: "4",
  name: "Star: First Edition",
  folder: "star-one",
  prefix: "S1",
  rarities: {
    SSR: 20,
    SCR: 18,
    UR: 18,
    USR: 15,
    AR: 9,
    OR: 7,
    BP: 9,
    SAR: 9
  }
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
  id: "TCG_PROMOS",
  name: "TCG Promos"
},
  {
    id: "9",
    name: "Promos",
    folder: "promo-cards",
    prefix: "PR",
    rarities: { PR: 6 }
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
const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
const [isoStatuses, setIsoStatuses] = useState<Record<string, string>>({});
const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
const [viewAllCardCodes, setViewAllCardCodes] = useState(false);
const [showScrollTop, setShowScrollTop] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 400);
  };

  // Check immediately in case the page is already scrolled
  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

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
      setIsoStatuses({});
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

const { data: rawProgress } = await supabase
  .from("collection_progress_raw")
  .select("*")
  .eq("user_id", user.id);

const combinedProgress = [
  ...(progress || []),
  ...(rawProgress || []),
];
      
    const allOwned: Record<string, boolean> = {};

   combinedProgress.forEach((set: any) => {
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

 combinedProgress.forEach((set: any) => {
  Object.entries(set.progress || {}).forEach(([key, value]) => {
    if (value) {
      allOwned[`${set.set_id}-${key}`] = true;
    }
  });
});

    setOwned(allOwned);
    setRawProgress(combinedProgress);

    const { data: statusRows } = await supabase
  .from("iso_status")
  .select("card_key, status")
  .eq("user_id", user.id);

const statusMap: Record<string, string> = {};

// Build a fast lookup of every completed card
const completedCards = new Set<string>();

combinedProgress.forEach((set: any) => {
  Object.entries(set.progress || {}).forEach(([key, value]) => {
    if (!value) return;

    // Standard CCG cards
    if (/^\w+-\d+$/.test(key)) {
      completedCards.add(`${set.set_id}-${key}`);
    }

    // SD Bonus cards
    else if (key.startsWith("BONUS-")) {
      completedCards.add(key.replace("BONUS-", ""));
      completedCards.add(`SD-BONUS-${key.replace("BONUS-", "")}`);
    }

    // SD Starter cards
    else if (key.startsWith("STARTER-")) {
      completedCards.add(key.replace("STARTER-", ""));
    }

    // Fantasy Wonderland
    else if (set.set_id === "FW") {
      completedCards.add(key);
      completedCards.add(`FW-${key}`);
    }

    // TCG Promos
    else if (set.set_id === "tcgpromos") {
      completedCards.add(`tcgpromos-${key}`);
      completedCards.add(key);
    }
  });
});

const statusesToDelete: string[] = [];

statusRows?.forEach((row: any) => {
  // If the card is already completed anywhere,
  // remove it from ISO/in-progress automatically
  if (completedCards.has(row.card_key)) {
    statusesToDelete.push(row.card_key);
    return;
  }

  statusMap[row.card_key] = row.status;
});

// Clean up stale ISO statuses in database
if (statusesToDelete.length > 0) {
  await supabase
    .from("iso_status")
    .delete()
    .eq("user_id", user.id)
    .in("card_key", statusesToDelete);
}

setIsoStatuses(statusMap);

const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets, iso_hidden_sets_ccg, iso_hidden_sets_tcg")
  .eq("id", user.id)
  .single();

const p = profile as any;

// Legacy fallback for older profiles that only used iso_hidden_sets
const global = p?.iso_hidden_sets || [];

const ccgHidden =
  p?.iso_hidden_sets_ccg && p.iso_hidden_sets_ccg.length > 0
    ? p.iso_hidden_sets_ccg
    : global;

const tcgHidden =
  p?.iso_hidden_sets_tcg && p.iso_hidden_sets_tcg.length > 0
    ? p.iso_hidden_sets_tcg
    : global;

setHiddenSetsCCG(ccgHidden);
setHiddenSetsTCG(tcgHidden);

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

const tcgIds = ["FW", "SD_STARTERS", "SD_BONUS", "TCG_PROMOS"];

const updateColumn = tcgIds.includes(setId)
  ? { iso_hidden_sets_tcg: updated }
  : { iso_hidden_sets_ccg: updated };

await supabase
  .from("profiles")
  .update(updateColumn)
  .eq("id", userId);
};

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
  // Cards 1–6
  if (number <= 6) {
    const actualNumber = number + 6; // 7–12
    return `INT01-SSR-${String(actualNumber).padStart(3, "0")}`;
  }

  // Cards 7–9
  if (number <= 9) {
    const specialNumbers = [16, 17, 20];
    return `INT01-SSR-${String(
      specialNumbers[number - 7]
    ).padStart(3, "0")}`;
  }
  return `RBE01-SSR-${String(number - 9).padStart(3, "0")}`;
}

  const setCodeMap: Record<string, string> = {
    "1": "MLPME01",
    "2": "MLPME02",
    "3": "MLPME03",
    "6": "RBE02",
    "5": "RBE01",
    "4": "MLPSE01",
    "7": "FME01",
    "8": "FME02",
    "9": "PR",
    "10": "LC",
  };
if (setId === "7" && rarity === "SN") {
  return `FME01-◇N-${cardNumber}`;
}

if (setId === "7" && rarity === "R") {
  if (number <= 6) {
    return `INT01-R-${String(number).padStart(3, "0")}`;
  }

  if (number <= 15) {
    const actualNumber = number + 5; 
    return `INT01-R-${String(actualNumber).padStart(3, "0")}`;
  }

  return `INT02-R-${String(number - 15).padStart(3, "0")}`;
}

if (setId === "7" && rarity === "UR") {
  if (number <= 6) {
    return `INT02-UR-${String(number).padStart(3, "0")}`;
  }

  const specialNumbers = [10, 11, 12, 14];
  return `INT02-UR-${String(
    specialNumbers[number - 7]
  ).padStart(3, "0")}`;
}

//
// FUN MOMENTS 2 SN
// Display as FME02-◇N-### instead of FME02-SN-###
//
if (setId === "8" && rarity === "SN") {
  return `FME02-◇N-${cardNumber}`;
}

if (setId === "8" && rarity === "R") {
  // 1–20
  if (number <= 20) {
    return `INT03-R-${String(number).padStart(3, "0")}`;
  }

  if (number <= 27) {
    return `INT02-R-${String(number - 20).padStart(3, "0")}`;
  }

  const actualNumber = number - 15; // 13–20
  return `INT02-R-${String(actualNumber).padStart(3, "0")}`;
}

if (setId === "8" && rarity === "UR") {
  if (number <= 6) {
    return `INT03-UR-${String(number).padStart(3, "0")}`;
  }

  const specialNumbers = [12, 13, 14, 15];
  return `INT03-UR-${String(
    specialNumbers[number - 7]
  ).padStart(3, "0")}`;
}


//
// FUN MOMENTS 3 N
//
if (setId === "11" && rarity === "N") {
  return `FME03-N-${cardNumber}`;
}
//
// FUN MOMENTS 3 SN
//
if (setId === "11" && rarity === "SN") {
  return `FME03-◇N-${cardNumber}`;
}

// fun moments 3 card codes
//
if (setId === "11" && rarity === "R") {
  if (number <= 15) {
    return `MLPME02-R-${String(number).padStart(3, "0")}`;
  }

  return `MLPME03-R-${String(number - 15).padStart(3, "0")}`;
}

//
// FUN MOMENTS 3 SR
//
if (setId === "11" && rarity === "SR") {
  return `MLPME03-SR-${cardNumber}`;
}

//
// FUN MOMENTS 3 SSR
//
if (setId === "11" && rarity === "SSR") {
  return `FME03-SSR-${cardNumber}`;
}

//
// FUN MOMENTS 3 UR
//
if (setId === "11" && rarity === "UR") {
  return `RBE02-UR-${cardNumber}`;
}

//
// FUN MOMENTS 3 UGR
//
if (setId === "11" && rarity === "UGR") {
  return `FME03-UGR-${cardNumber}`;
}

//
// FUN MOMENTS 3 CR
//
if (setId === "11" && rarity === "CR") {
  return `FME03-CR-${cardNumber}`;
}

//
// FUN MOMENTS 3 SCR
// Display as FME03-◇CR-### instead of FME03-SCR-###
//
if (setId === "11" && rarity === "SCR") {
  return `FME03-◇CR-${cardNumber}`;
}

if (setId === "9") {
  return `MLPE-PR-${cardNumber}`;
}

if (setId === "10") {
  return "MLPE-PR-005";
}

if (setId === "6" && rarity === "SSR") {

  // Cards 001–006
  if (number <= 6) {
    return `MLPME03-SSR-${String(number).padStart(3, "0")}`;
  }

  // Cards 013–020
  if (number <= 14) {
    const actualNumber = number + 6;

    return `MLPME03-SSR-${String(actualNumber).padStart(3, "0")}`;
  }

  // Final special Twilight card
  return `RBE02-SSR-001`;
}

  const baseCode = setCodeMap[setId] || "";

 return `${baseCode}-${
  setId === "4" && rarity === "SAR"
    ? "◇AR"
    : rarityCode
}-${cardNumber}`;
};

const getTCGSetDisplayName = (setId: string) => {
  switch (setId) {
    case "SD_STARTERS":
      return "Friendships Begin - Character Decks";
    case "SD_BONUS":
      return "Friendships Begin";
    case "FW":
      return "Fantasy Wonderland";
    case "TCG_PROMOS":
      return "TCG Promos";
    default:
      return setId;
  }
};

const getTCGCardDisplayCode = (cardKey: string) => {
  // Fantasy Wonderland standard cards
const standardMatch = cardKey.match(
  /^(BP01)(C|U|SR|SPR|GR|CR|RR)(\d{2})$/
);

  if (standardMatch) {
    const [, prefix, rarity, num] = standardMatch;
    return `${prefix}-${rarity}${num}`;
  }

  // Fantasy Wonderland ER cards
  const erMatch = cardKey.match(/^BP01ER(\d{2})$/);
  if (erMatch) {
    return `SD01-ER${erMatch[1]}`;
  }

  // Fantasy Wonderland PER cards
  const perMatch = cardKey.match(/^BP01PER(\d{2})$/);
  if (perMatch) {
    const num = parseInt(perMatch[1], 10);
    const displayNum = Math.ceil(num / 2);
    return `※SD01-ER${String(displayNum).padStart(2, "0")}`;
  }

  // Fantasy Wonderland PSPR cards
  const psprMatch = cardKey.match(/^BP01PSPR(\d{2})$/);
  if (psprMatch) {
    return `※BP01-SPR${psprMatch[1]}`;
  }

    const pgrMatch = cardKey.match(/^BP01PGR(\d{2})$/);
  if (pgrMatch) {
    return `※BP01-GR${pgrMatch[1]}`;
  }

  // Fantasy Wonderland PCR cards
const pcrMatch = cardKey.match(/^BP01PCR(\d{2})$/);
if (pcrMatch) {
  return `※BP01-CR${pcrMatch[1]}`;
}

// Fantasy Wonderland PRR cards
const prrMatch = cardKey.match(/^BP01PRR(\d{2})$/);
if (prrMatch) {
  return `※BP01-RR${prrMatch[1]}`;
}

// Bonus Deck PER cards
const sdPerMatch = cardKey.match(/^SD01PER(\d{2})$/);
if (sdPerMatch) {
  const num = parseInt(sdPerMatch[1], 10); // 07–18
  const displayNum = Math.ceil((num - 6) / 2); // 1,1,2,2...6,6
  const actualNumber = displayNum + 6; // 07–12

  return `※SD01-ER${String(actualNumber).padStart(2, "0")}`;
}

// Bonus Deck PRR cards
const sdPrrMatch = cardKey.match(/^SD01PRR(\d{2})$/);
if (sdPrrMatch) {
  return `※SD01-RR${sdPrrMatch[1]}`;
}

// Starter Deck / Bonus Deck standard cards
if (cardKey.startsWith("SD01")) {
  const match = cardKey.match(/^(SD01)(.+)$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
}

  // TCG Promos
  if (/^RR\d{2}$/.test(cardKey)) {
    return cardKey;
  }

  return cardKey;
};

const saveISOStatus = async (
  cardKey: string,
  status: "trade_in_progress" | "purchase_in_progress"
) => {
  if (!userId) return;

  const currentStatus = isoStatuses[cardKey];

  if (currentStatus === status) {
    await supabase
      .from("iso_status")
      .delete()
      .eq("user_id", userId)
      .eq("card_key", cardKey);

    setIsoStatuses((prev) => {
      const updated = { ...prev };
      delete updated[cardKey];
      return updated;
    });

    return;
  }

  // Otherwise replace any existing status with the new one.
  await supabase
    .from("iso_status")
    .upsert(
      {
        user_id: userId,
        card_key: cardKey,
        status,
      },
      {
        onConflict: "user_id,card_key",
      }
    );

  // Update local state immediately.
  setIsoStatuses((prev) => ({
    ...prev,
    [cardKey]: status,
  }));
};

return (
  <div
    className="min-h-screen"
    style={{
  backgroundColor: "#F8F3FF",
  backgroundImage: `
    radial-gradient(circle at 15% 20%, rgba(244, 200, 74, 0.12) 0%, transparent 35%),
    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 25% 75%, rgba(168, 85, 247, 0.10) 0%, transparent 35%),
    radial-gradient(circle at 75% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
    linear-gradient(
      180deg,
      #FCF9FF 0%,
      #F8F1FF 35%,
      #F5EEFF 65%,
      #FAF6FF 100%
    )
  `,
}}
  >
    <KayouHeader />

    <div className="container py-6 sm:py-8">
  <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
<MyISOSidebar
  mode={mode as "CCG" | "TCG"}
availableSets={[
...(mode === "TCG" &&
Array.from({ length: 6 }, (_, i) => {
  const key = `RR${String(i + 1).padStart(2, "0")}`;
  return owned[`tcgpromos-${key}`];
}).every(Boolean) === false
  ? [{ id: "TCG_PROMOS", name: "TCG Promos" }]
  : []),

  ...sets
    .filter((set) => {
  const hiddenSets =
    mode === "CCG" ? hiddenSetsCCG : hiddenSetsTCG;

  // Exclude sets the user marked as "not collecting"
  if (hiddenSets.includes(set.id)) {
    return false;
  }

  if (mode === "CCG") {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].includes(set.id);
  }

  return ["SD_STARTERS", "SD_BONUS", "FW"].includes(set.id);
})
    .filter((set) => {
      if (set.id === "SD_STARTERS") {
        return (
          Object.keys(owned).filter((k) => k.startsWith("SD-")).length < 126
        );
      }

      if (set.id === "SD_BONUS") {
        return (
          Object.keys(owned).filter((k) => k.startsWith("SD-BONUS-")).length < 68
        );
      }

      if (set.id === "FW") {
        return (
          Object.keys(owned).filter((k) => k.startsWith("FW-")).length < 191
        );
      }

if (set.rarities) {
  const cards = Object.entries(set.rarities).flatMap(
    ([rarity, count]) =>
      Array.from({ length: count as number }, (_, i) => ({
        rarity,
        number: i + 1,
      }))
  );

  const missing = cards.filter((card) => {
    if (viewAllCardCodes) {
      return true;
    }

    const key = `${card.rarity}-${card.number}`;
    return !owned[`${set.id}-${key}`];
  });

  return missing.length > 0;
}

return false;
    })
    .map((set) => ({
      id: set.id,
      name: set.name,
    })),
]}
  onSelectSet={setSelectedSetId}
  selectedSetId={selectedSetId}
  selectedRarity={selectedRarity}
onSelectRarity={setSelectedRarity}
availableRarities={
  selectedSetId === "9" ||
  selectedSetId === "10" ||
  selectedSetId === "TCG_PROMOS"
    ? []

    : selectedSetId === "SD_STARTERS"
    ? ["Starter Deck"]

    : selectedSetId === "SD_BONUS"
    ? [
        { prefix: "SD01C", count: 9, label: "Common" },
        { prefix: "SD01U", count: 7, label: "Uncommon" },
        { prefix: "SD01SR", count: 6, label: "Silver Rare" },
        { prefix: "SD01SPR", count: 10, label: "Special Rare" },
        { prefix: "SD01GR", count: 6, label: "Gold Rare" },
        { prefix: "SD01CR", count: 6, label: "Colorful Rare" },
        { prefix: "SD01ER", count: 6, label: "Emerald Rare" },
        { prefix: "SD01PER", count: 12, label: "※Emerald Rare" },
        { prefix: "SD01PRR", count: 6, label: "※Ruby Rare" },
      ]
        .filter(({ prefix, count }) =>
          Array.from({ length: count }, (_, i) => {
            let num = i + 1;

            if (prefix === "SD01PER") {
              num = i + 7;
              if (num > 18) return false;
            }

            const key = `${prefix}${String(num).padStart(2, "0")}`;
            return viewAllCardCodes || !owned[`SD-BONUS-${key}`];
          }).some(Boolean)
        )
        .map(({ label }) => label)

    : selectedSetId === "FW"
    ? [
        { prefix: "BP01C", count: 48, label: "Common" },
        { prefix: "BP01U", count: 18, label: "Uncommon" },
        { prefix: "BP01ER", count: 6, label: "Emerald Rare" },
        { prefix: "BP01SR", count: 14, label: "Silver Rare" },
        { prefix: "BP01SPR", count: 28, label: "Special Rare" },
        { prefix: "BP01GR", count: 12, label: "Gold Rare" },
        { prefix: "BP01CR", count: 12, label: "Colorful Rare" },
        { prefix: "BP01RR", count: 6, label: "Ruby Rare" },
        { prefix: "BP01PER", count: 12, label: "※Emerald Rare" },
        { prefix: "BP01PSPR", count: 11, label: "※Special Rare" },
        { prefix: "BP01PGR", count: 6, label: "※Gold Rare" },
        { prefix: "BP01PCR", count: 12, label: "※Colorful Rare" },
        { prefix: "BP01PRR", count: 6, label: "※Ruby Rare" },
      ]
        .filter(({ prefix, count }) =>
          Array.from({ length: count }, (_, i) => {
            let num = i + 1;

            if (prefix === "BP01ER") num = i + 7;

            if (prefix === "BP01PSPR") {
              const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
              num = PSPR_NUMBERS[i];
              if (!num) return false;
            }

            const key = `${prefix}${String(num).padStart(2, "0")}`;
            return viewAllCardCodes || !owned[`FW-${key}`];
          }).some(Boolean)
        )
        .map(({ label }) => label)

: (() => {
    const selectedSet = sets.find(
      (set) => set.id === selectedSetId
    );

    if (!selectedSet?.rarities) return [];

    if (viewAllCardCodes) {
      return Object.keys(selectedSet.rarities);
    }

    return Object.entries(selectedSet.rarities)
      .filter(([rarity, count]) =>
        Array.from(
          { length: count as number },
          (_, i) =>
            !owned[
              `${selectedSet.id}-${rarity}-${i + 1}`
            ]
        ).some(Boolean)
      )
      .map(([rarity]) => rarity);
  })()
}
setMode={(newMode) => setMode(newMode as "CCG" | "TCG")}
onClearSelection={() => {
  setSelectedSetId(null);
  setSelectedRarity(null);
  setViewAllCardCodes(false);
}}
viewAllCardCodes={viewAllCardCodes}
onToggleViewAllCardCodes={() => {
  if (viewAllCardCodes) {
    // If currently in viewing mode, return to normal ISO mode
    setViewAllCardCodes(false);
  } else {
    // Enter "View ALL card codes" mode
    setViewAllCardCodes(true);
  }

  // Clear sidebar selections so the user starts fresh
  setSelectedSetId(null);
  setSelectedRarity(null);
}}
isoStatuses={isoStatuses}
allSets={sets}
hiddenSets={mode === "CCG" ? hiddenSetsCCG : hiddenSetsTCG}
onToggleHiddenSet={toggleSet}
/>
    <div className="flex-1">
      {/* HERO HEADER */}
      <div className="relative z-0 rounded-3xl border border-[#d4af37]/40 bg-white/75 backdrop-blur-xl shadow-2xl px-5 sm:px-8 py-6 sm:py-7 mb-6 sm:mb-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col items-center">
  <h1
    className="
      text-3xl sm:text-4xl md:text-5xl
      font-extrabold
      tracking-[0.12em]
      uppercase
      text-[#6b46a3]
      drop-shadow-sm
    "
    style={{
      textShadow: "0 2px 8px rgba(107, 70, 163, 0.15)",
    }}
  >
    Personal ISO
  </h1>

  <div className="mt-3 flex items-center gap-3 w-full justify-center">
    <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

    <span className="text-[10px] sm:text-xs tracking-[0.35em] font-semibold text-[#8b6a2b] uppercase">
      Collector Wishlist
    </span>

    <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
  </div>
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
 !hiddenSetsTCG.includes("TCG_PROMOS") &&
 (!selectedSetId || selectedSetId === "TCG_PROMOS") &&
 Array.from({ length: 6 }, (_, i) => {
   const key = `RR${String(i + 1).padStart(2, "0")}`;
   return owned[`tcgpromos-${key}`];
 }).every(Boolean) === false && (

  <div className="mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      TCG Promos
    </h2>

    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 gap-2">
{Array.from({ length: 6 }, (_, i) => {
  const num = i + 1;
  const key = `RR${String(num).padStart(2, "0")}`;
  const stateKey = `tcgpromos-${key}`;

  if (!viewAllCardCodes && owned[stateKey]) return null;

  return (
    <div
      key={key}
      className="cursor-pointer"
      onClick={() => setSelectedCardKey(stateKey)}
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[5/7]">
          <img
            src={`/tcgpromos/${key}.png`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-3 py-2">
          <div className="min-w-0 text-[8px] sm:text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
            <span>{`PR${String(num).padStart(2, "0")}`}</span>

            {isoStatuses[stateKey] === "trade_in_progress" && (
              <span className="text-[#7c5aa6] text-xs">✔</span>
            )}

            {isoStatuses[stateKey] === "purchase_in_progress" && (
              <span className="text-green-600 text-xs">✔</span>
            )}
          </div>

          <div className="text-[9px] sm:text-xs text-gray-500 truncate">
            Friendships Begin
          </div>
        </div>
      </div>
    </div>
  );
})}
    </div>
  </div>
)}
  {/* STARTER DECKS */}
{mode === "TCG" &&
 (!selectedSetId || selectedSetId === "SD_STARTERS") &&
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

  <div className="mb-6">
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
  <div
    key={deck.code}
    className="cursor-pointer"
    onClick={() => setSelectedCardKey(deck.code)}
  >
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow w-36">
      <div className="aspect-[5/7]">
        <img
          src={deck.src}
          className="w-full h-full object-contain bg-white"
        />
      </div>

      <div className="px-3 py-2">
        <div className="text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
          <span>{deck.code}</span>

          {isoStatuses[deck.code] === "trade_in_progress" && (
            <span className="text-[#7c5aa6] text-xs">✔</span>
          )}

          {isoStatuses[deck.code] === "purchase_in_progress" && (
            <span className="text-green-600 text-xs">✔</span>
          )}
        </div>

        <div className="text-xs text-gray-500 truncate">
          Friendships Begin
        </div>
      </div>
    </div>
  </div>
))}
    </div>
  </div>
)}

 {/* BONUS PACKS */}
{mode === "TCG" &&
 (!selectedSetId || selectedSetId === "SD_BONUS") &&
 !hiddenSetsTCG.includes("SD_BONUS") && (
  <div className="mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      Friendships Begin - Bonus Deck
    </h2>

<div className="space-y-8">

  {[
    { prefix: "SD01C", count: 9, label: "COMMON" },
    { prefix: "SD01U", count: 7, label: "UNCOMMON" },
    { prefix: "SD01SR", count: 6, label: "SILVER RARE" },
    { prefix: "SD01SPR", count: 10, label: "SPECIAL RARE" },
    { prefix: "SD01ER", count: 6, label: "EMERALD RARE" },
    { prefix: "SD01GR", count: 6, label: "GOLD RARE" },
    { prefix: "SD01CR", count: 6, label: "COLORFUL RARE" },
    { prefix: "SD01PER", count: 12, label: "※EMERALD RARE" },
    { prefix: "SD01PRR", count: 6, label: "※RUBY RARE" },
  ]
  .filter(({ label }) =>
    selectedRarity === null || label === selectedRarity.toUpperCase().replace("PROMO", "RR")
  )
  .map(({ prefix, count, label }) => {

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

      if (!viewAllCardCodes && owned[stateKey]) return null;

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">

            {cards.map((key) => {
  const imageSrc = `/friendships-begin/${key}.png`;

  return (
              <div
  key={key}
  className={viewAllCardCodes ? "" : "cursor-pointer"}
  onClick={() => {
    if (viewAllCardCodes) return;
    setSelectedCardKey(key);
  }}
>
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className="aspect-[5/7]">
      <img
        src={imageSrc}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="px-3 py-2">
      <div className="text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
        <span>{getTCGCardDisplayCode(key)}</span>

        {isoStatuses[key] === "trade_in_progress" && (
          <span className="text-[#7c5aa6] text-xs">✔</span>
        )}

        {isoStatuses[key] === "purchase_in_progress" && (
          <span className="text-green-600 text-xs">✔</span>
        )}
      </div>

      <div className="text-xs text-gray-500 truncate">
  {getTCGSetDisplayName("SD_BONUS")}
</div>
    </div>
  </div>
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
)}


{mode === "TCG" &&
 (!selectedSetId || selectedSetId === "FW") &&
 !hiddenSetsTCG.includes("FW") && (
  <div className="mb-6">
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
  ]
  .filter(({ label }) =>
    selectedRarity === null || label === selectedRarity.toUpperCase().replace("PROMO", "RR")
  )
  .map(({ prefix, count, label }) => {

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

      if (!viewAllCardCodes && owned[`FW-${key}`]) return null;

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">

            {cards.map((key) => {
  const imageSrc =
    key.startsWith("BP01ER")
      ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.png`
      : key.startsWith("BP01PER")
      ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.png`
      : `/fantasy-wonderland/${key}.png`;

  return (
             <div
  key={key}
  className={viewAllCardCodes ? "" : "cursor-pointer"}
  onClick={() => {
    if (viewAllCardCodes) return;
    setSelectedCardKey(key);
  }}
>
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className="aspect-[5/7]">
      <img
        src={imageSrc}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="px-3 py-2">
      <div className="text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
        <span>{getTCGCardDisplayCode(key)}</span>

        {isoStatuses[key] === "trade_in_progress" && (
          <span className="text-[#7c5aa6] text-xs">✔</span>
        )}

        {isoStatuses[key] === "purchase_in_progress" && (
          <span className="text-green-600 text-xs">✔</span>
        )}
      </div>

     <div className="text-xs text-gray-500 truncate">
  {getTCGSetDisplayName("FW")}
</div>
    </div>
  </div>
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
)}


{/* CARDS IN PROGRESS */}
{selectedSetId === "CARDS_IN_PROGRESS" && (
  <div className="mb-6">
    <div className="flex items-center justify-center gap-3 mb-5">
  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />

  <span className="text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
    Cards In Progress
  </span>

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />
</div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {Object.entries(isoStatuses)
        .filter(
          ([, status]) =>
            status === "trade_in_progress" ||
            status === "purchase_in_progress"
        )
        .map(([cardKey, status]) => {
          // TCG Promos
          if (/^tcgpromos-RR\d{2}$/.test(cardKey)) {
            const promoCode = cardKey.replace("tcgpromos-", "");
            const promoNumber = promoCode.replace("RR", "");

            return (
              <div
                key={cardKey}
                className="cursor-pointer"
                onClick={() => setSelectedCardKey(cardKey)}
              >
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[5/7]">
                    <img
                      src={`/tcgpromos/${promoCode}.png`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="px-3 py-2">
                    <div className="text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
                      <span>{`PR${promoNumber}`}</span>

                      {status === "trade_in_progress" && (
                        <span className="text-[#7c5aa6] text-xs">✔</span>
                      )}

                      {status === "purchase_in_progress" && (
                        <span className="text-green-600 text-xs">✔</span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 truncate">
                      TCG Promos
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // TCG cards (SD01..., BP01..., RRxx)
          if (
            cardKey.startsWith("SD01") ||
            cardKey.startsWith("BP01") ||
            /^RR\d{2}$/.test(cardKey)
          ) {
            const imageSrc =
              cardKey.startsWith("BP01ER")
                ? `/fantasy-wonderland/SD01ER${cardKey.slice(-2)}.png`
                : cardKey.startsWith("BP01PER")
                ? `/fantasy-wonderland/SD01PER${cardKey.slice(-2)}.png`
                : cardKey.startsWith("BP01")
                ? `/fantasy-wonderland/${cardKey}.png`
                : cardKey.startsWith("SD01")
                ? `/friendships-begin/${cardKey}.png`
                : `/tcgpromos/${cardKey}.png`;

            let setName = "Friendships Begin";

            if (cardKey.startsWith("BP01")) {
              setName = "Fantasy Wonderland";
            } else if (/^RR\d{2}$/.test(cardKey)) {
              setName = "TCG Promos";
            }

            return (
              <div
                key={cardKey}
                className="cursor-pointer"
                onClick={() => setSelectedCardKey(cardKey)}
              >
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[5/7]">
                    <img
                      src={imageSrc}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="px-3 py-2">
                    <div className="text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
                      <span>{getTCGCardDisplayCode(cardKey)}</span>

                      {status === "trade_in_progress" && (
                        <span className="text-[#7c5aa6] text-xs">✔</span>
                      )}

                      {status === "purchase_in_progress" && (
                        <span className="text-green-600 text-xs">✔</span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 truncate">
                      {setName}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Standard CCG cards ("7-R-12")
          const parts = cardKey.split("-");
          const setId = parts[0];
          const rarity = parts[1];
          const number = Number(parts[2]);

          const set = sets.find((s) => s.id === setId);

          if (!set || !set.folder || !set.prefix || !rarity || !number) {
            return null;
          }

          const isDoubleCard =
            set.id === "3" &&
            rarity === "SZR" &&
            number === 1;

          const imageSrc =
            set.id === "9"
              ? `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`
              : set.id === "10"
              ? "/serialized-limited-cards/andypricepromo.jpg"
             : `/cards/${set.folder}/${set.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}${
    set.id === "6" &&
    ["TR", "TGR", "ST"].includes(rarity)
      ? ".png"
      : ".jpg"
  }`;

          return (
            <div
              key={cardKey}
              className={`${isDoubleCard ? "col-span-2" : ""} cursor-pointer`}
              onClick={() => setSelectedCardKey(cardKey)}
            >
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className={`${
                    isDoubleCard ? "aspect-[10/7]" : "aspect-[5/7]"
                  }`}
                >
                  <img
                    src={imageSrc}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="px-3 py-2">
                  <div className="text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
                    <span>
                      {getDisplayCardCode(set.id, rarity, number)}
                    </span>

                    {status === "trade_in_progress" && (
                      <span className="text-[#7c5aa6] text-xs">✔</span>
                    )}

                    {status === "purchase_in_progress" && (
                      <span className="text-green-600 text-xs">✔</span>
                    )}
                  </div>

                  <div className="text-[8px] sm:text-[10px] text-gray-500 truncate">
                    {set.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}
{/* MAIN GRID */}
{selectedSetId !== "CARDS_IN_PROGRESS" && (
  <div className="grid grid-cols-1 gap-6">
   {sets
.filter(set =>
  mode === "CCG" &&
  !hiddenSetsCCG.includes(set.id) &&
  set.rarities &&
  (
    selectedSetId === null ||
    set.id === selectedSetId
  )
)
      .map((set) => {
        const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
          Array.from({ length: count as number }, (_, i) => ({
            rarity,
            number: i + 1
          }))
        );

        const missing = cards.filter((card) => {
  if (viewAllCardCodes) {
    return true;
  }

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
          <div
  id={`iso-set-${set.id}`}
  key={set.id}
  className="mb-8"
>
            <div className="flex items-center justify-center gap-3 mb-5">

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />

  <span className="text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
    {set.name}
  </span>

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />

</div>

<div className="space-y-8">

{Object.entries(groupedMissing)
  .filter(([rarity]) =>
    selectedRarity === null || rarity === selectedRarity
  )
  .map(([rarity, rarityCards]) => {

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
  className="relative z-0 w-full flex items-center justify-center gap-3 mb-2 group"
>

        <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[100px]" />

        <span className="text-[10px] sm:text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
{
  rarity === "LC"
  ? "PR"
  : rarity === "SN"
  ? "◇N"
  : rarity === "SHINING ZR" || rarity === "SZR"
  ? "◇ZR"
  : set.id ==="4" && rarity === "SAR"
  ? "◇AR"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">

          {rarityCards.map((card) => {
            const isDoubleCard =
  set.id === "3" &&
  card.rarity === "SZR" &&
  card.number === 1;
  

            return (
<div
  key={`${card.rarity}-${card.number}`}
  className={`${isDoubleCard ? "col-span-2" : ""} cursor-pointer`}
onClick={() => {
  if (viewAllCardCodes) return;

  setSelectedCardKey(
    `${set.id}-${card.rarity}-${card.number}`
  );
}}
>
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div
      className={`${
        isDoubleCard
          ? "aspect-[10/7]"
          : "aspect-[5/7]"
      }`}
    >
      <img
        src={
          set.id === "9"
            ? `/promo-cards/mlpepr${String(card.number).padStart(3, "0")}.jpg`
            : set.id === "10"
            ? "/serialized-limited-cards/andypricepromo.jpg"
            : `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}${
    set.id === "6" &&
    ["TR", "TGR", "ST"].includes(card.rarity)
      ? ".png"
      : ".jpg"
  }`
        }
        className="w-full h-full object-cover"
      />
    </div>

    <div className="px-2 py-2 min-w-0">
<div className="text-[11px] font-semibold text-[#4b2e83] truncate flex items-center gap-1">
  {(() => {
const setCodeMap: Record<string, string> = {
  "1": "MLPME01",
  "2": "MLPME02",
  "3": "MLPME03",
  "4": "MLPSE01",
  "5": "RBE01",
  "6": "RBE02",
  "7": "FME01",
  "8": "FME02",
  "9": "PR",
  "10": "LC",
  "11": "FME03",
};

const fullCode = getDisplayCardCode(
  set.id,
  card.rarity,
  card.number
);

const getTCGSetDisplayName = (setId: string) => {
  switch (setId) {
    case "SD_STARTERS":
      return "Friendships Begin - Character Decks";
    case "SD_BONUS":
      return "Friendships Begin - Bonus Deck";
    case "FW":
      return "Fantasy Wonderland";
    case "TCG_PROMOS":
      return "TCG Promos";
    default:
      return setId;
  }
};

const getTCGCardDisplayCode = (cardKey: string) => {
  if (cardKey.startsWith("SD01")) {
    return cardKey;
  }

  if (cardKey.startsWith("BP01")) {
    return cardKey;
  }
  if (/^RR\d{2}$/.test(cardKey)) {
    return cardKey;
  }

  return cardKey;
};

    const cardKey = `${set.id}-${card.rarity}-${card.number}`;
    const status = isoStatuses[cardKey];

    return (
      <>
        <span className="truncate">{fullCode}</span>

        {status === "trade_in_progress" && (
  <span className="text-[#7c5aa6] text-xs">✔</span>
)}

{status === "purchase_in_progress" && (
  <span className="text-green-600 text-xs">✔</span>
)}
      </>
    );
  })()}
</div>


      <div className="text-[10px] text-gray-500 truncate">
        {set.name}
      </div>
    </div>
  </div>
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
  )}
</>
)}
</div>

{selectedCardKey && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
    <div className="pointer-events-auto w-[280px] rounded-2xl border border-[#d4af37]/40 bg-white shadow-2xl p-4">
      <h3 className="text-sm font-semibold text-[#4b2e83] mb-3">
        Update Card Status
      </h3>

      <div className="space-y-2">
        <button
          onClick={async () => {
            await saveISOStatus(
              selectedCardKey,
              "trade_in_progress"
            );
            setSelectedCardKey(null);
          }}
          className="w-full px-3 py-2 rounded-xl bg-[#7c5aa6] text-white text-sm font-semibold hover:bg-[#6a4b95] transition"
        >
          Trade In Progress
        </button>

        <button
          onClick={async () => {
            await saveISOStatus(
              selectedCardKey,
              "purchase_in_progress"
            );
            setSelectedCardKey(null);
          }}
          className="w-full px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
        >
          Purchase In Progress
        </button>

        <button
          onClick={async () => {
  if (!userId || !selectedCardKey) return;

  // selectedCardKey format: "7-R-12"
  let setId = "";
let progressKey = "";

// CCG cards (example: 7-R-12)
if (/^\d+-/.test(selectedCardKey)) {
  const parts = selectedCardKey.split("-");
  setId = parts[0];
  progressKey = parts.slice(1).join("-");
}

// Friendships Begin Starter Deck boxes (SD01A–SD01F)
else if (/^SD01[A-F]$/.test(selectedCardKey)) {
  setId = "SD";
  progressKey = selectedCardKey;
}

// Friendships Begin Character Deck cards
else if (
  /^SD01[A-F]/.test(selectedCardKey) &&
  !/^SD01(C|U|SR|SPR|CR|ER|RR|PER|PRR)/.test(selectedCardKey)
) {
  setId = "SD";
  progressKey = `STARTER-${selectedCardKey}`;
}
// Friendships Begin Bonus Deck cards
else if (/^SD01/.test(selectedCardKey)) {
  setId = "SD";
  progressKey = `BONUS-${selectedCardKey}`;
}

// Fantasy Wonderland cards
else if (/^BP01/.test(selectedCardKey)) {
  setId = "FW";
  progressKey = selectedCardKey;
}

// TCG Promos
else if (/^tcgpromos-RR\d{2}$/.test(selectedCardKey)) {
  setId = "tcgpromos";
  progressKey = selectedCardKey.replace("tcgpromos-", "");
}

// Direct RRxx promo keys
else if (/^RR\d{2}$/.test(selectedCardKey)) {
  setId = "tcgpromos";
  progressKey = selectedCardKey;
}

// Already-formatted Bonus Deck keys from ISO
else if (selectedCardKey.startsWith("SD-BONUS-")) {
  setId = "SD";
  progressKey = `BONUS-${selectedCardKey.replace("SD-BONUS-", "")}`;
}

const VALID_SET_IDS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "SD", "FW", "tcgpromos"
];

if (!VALID_SET_IDS.includes(setId)) {
  console.error("Invalid set_id detected:", setId, selectedCardKey);
  return;
}

  //
  // 1. LOAD EXISTING collection_progress
  //
  const { data: existingProgressRow } = await supabase
    .from("collection_progress_raw")
    .select("progress")
    .eq("user_id", userId)
    .eq("set_id", setId)
    .maybeSingle();

  const currentProgress =
    (existingProgressRow?.progress || {}) as Record<string, boolean>;

const updatedProgress = {
  ...currentProgress,
  [progressKey]: true,
};

  //
  // 2. SAVE TO collection_progress
  //    (used by progress bars and ISO page)
  //
  await supabase
    .from("collection_progress")
    .upsert(
      {
        user_id: userId,
        set_id: setId,
        progress: updatedProgress,
      },
      {
        onConflict: "user_id,set_id",
      }
    );

  //
  // 3. LOAD EXISTING collection_progress_raw
  //    (used by regular set pages like Fun Moments 1)
  //
  const { data: existingRawRow } = await supabase
    .from("collection_progress_raw")
    .select("progress")
    .eq("user_id", userId)
    .eq("set_id", setId)
    .maybeSingle();

  const currentRawProgress =
    (existingRawRow?.progress || {}) as Record<string, boolean>;

  const updatedRawProgress = {
    ...currentRawProgress,
    [progressKey]: true,
  };

  //
  // 4. SAVE TO collection_progress_raw
  //    (same behavior as Fun Moments 1)
  //
  await supabase
    .from("collection_progress_raw")
    .upsert(
      {
        user_id: userId,
        set_id: setId,
        progress: updatedRawProgress,
      },
      {
        onConflict: "user_id,set_id",
      }
    );

  //
  // 5. REMOVE ISO STATUS
  //
  await supabase
    .from("iso_status")
    .delete()
    .eq("user_id", userId)
    .eq("card_key", selectedCardKey);

  //
  // 6. UPDATE LOCAL owned STATE
  //
setOwned((prev) => {
  const updated = { ...prev };

  // Fantasy Wonderland cards (BP01...)
  if (/^BP01/.test(selectedCardKey)) {
    updated[`FW-${selectedCardKey}`] = true;
  }

  // Friendships Begin Bonus Deck cards (SD01C01, SD01SR01, etc.)
  else if (/^SD01/.test(selectedCardKey)) {
    updated[`SD-BONUS-${selectedCardKey}`] = true;
  }

  // TCG Promos
  else if (/^tcgpromos-RR\d{2}$/.test(selectedCardKey)) {
    updated[selectedCardKey] = true;
  }

  // CCG cards (already in correct format like "7-R-12")
  else {
    updated[selectedCardKey] = true;
  }

  return updated;
});

  //
  // 7. REMOVE LOCAL ISO STATUS
  //
  setIsoStatuses((prev) => {
    const updated = { ...prev };
    delete updated[selectedCardKey];
    return updated;
  });

  //
  // 8. UPDATE rawProgress STATE
  //
  setRawProgress((prev) => {
    const existingIndex = prev.findIndex(
      (row: any) => row.set_id === setId
    );

    if (existingIndex >= 0) {
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        progress: updatedRawProgress,
      };
      return updated;
    }

    return [
      ...prev,
      {
        set_id: setId,
        progress: updatedRawProgress,
      },
    ];
  });

  //
  // 9. CLOSE POPUP
  //
  setSelectedCardKey(null);
}}
         className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-[#fdf6c3] via-[#d4af37] to-[#b8860b] text-white text-sm font-semibold border border-[#f7e7a3] shadow-md hover:from-[#fff4b0] hover:via-[#e0b83f] hover:to-[#c99812] hover:shadow-lg transition"
        >
          Complete
        </button>

        <button
          onClick={() => setSelectedCardKey(null)}
          className="w-full px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
    {showScrollTop && (
  <button
    onClick={() =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
    className="
      fixed
      bottom-32 sm:bottom-6
      right-4 sm:right-6
      z-[99999]
      w-11 h-11
      rounded-full
      bg-gradient-to-r
      from-[#7c5aa6]
      to-[#5a3e84]
      text-[#f5e6a8]
      border border-[#d4af37]/60
      shadow-2xl
      active:scale-95
      transition
      flex items-center justify-center
      hover:brightness-110
    "
    aria-label="Back to top"
  >
    <ChevronUp className="w-5 h-5" />
  </button>
)}
  </div>
);
};

export default MyISO;
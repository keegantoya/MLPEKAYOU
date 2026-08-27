import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  {
    id: "6",
    name: "Rainbow: Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: { BASE: 18, R: 30, SR: 14, ST: 20, TR: 12, TGR: 8, SSR: 15, FR: 18, UR: 19, USR: 8, XR: 8 }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  {
    id: "8",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
  },
  {
    id: "11",
    name: "Fun Moments: Third Edition",
    folder: "fun-moments-three",
    prefix: "FM3",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 }
  },
  {
    id: "3",
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: { R: 60, SR: 40, SSR: 40, HR: 60, UR: 18, LSR: 32, SGR: 16, ZR: 14, SC: 7, "SZR": 3 }
  },
  {
    id: "4",
    name: "Star: First Edition",
    folder: "star-one",
    prefix: "S1",
    rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }
  },
  {
    id: "9",
    name: "Promotional Cards",
    folder: "promos",
    prefix: "PR",
    rarities: { PR: 12 }
  },
  {
  id: "FW",
  name: "Fantasy Wonderland",
  folder: "fantasy-wonderland",
  prefix: "FW",
  rarities: {}
},
{
  id: "friendshipsbegin",
  name: "Friendships Begin",
  folder: "friendshipsbegin",
  prefix: "SD01",
  rarities: {}
},
{
  id: "12",
  name: "Discord",
  folder: "discord",
  prefix: "BP02",
  rarities: {}
},
{
  id: "tcgpromos",
  name: "TCG Promos",
  folder: "tcgpromos",
  prefix: "RR",
  rarities: { PR: 18 }
},
];
const getDisplayCode = (card: any, currentSetId: string) => {
const key = String(card.key || "");
// Promotional Cards: the six SDCC cards are PR-8 through PR-13.
  if (currentSetId === "9") {
const num = Number(card.number);
    if (num >= 8 && num <= 13) {
      return `SDCC-${String(num - 7).padStart(2, "0")}`;
    }
    return key;
  }
// TCG Promos:// RR01–RR06// ※BP01-CR07–※BP01-CR12// ※BP02-CR01–※BP02-CR06
  if (currentSetId === "tcgpromos") {
const match = key.match(/^RR(\d+)$/);
    if (match) {
const num = Number(match[1]);
      if (num >= 1 && num <= 6) {
        return `RR${String(num).padStart(2, "0")}`;
      }
      if (num >= 7 && num <= 12) {
        return `※BP01-CR${String(num).padStart(2, "0")}`;
      }
      if (num >= 13 && num <= 18) {
        return `※BP02-CR${String(num - 12).padStart(2, "0")}`;
      }
    }
    return key;
  }
// Friendships Begin / SD01.// P-prefixed rarities lose the P in display, and the reference mark// goes BEFORE the SD01 prefix:// SD01PER01 -> ※SD01-ER01// SD01PRR01 -> ※SD01-RR01// SD01PSPR01 -> ※SD01-SPR01
  if (currentSetId === "friendshipsbegin") {
const match = key.match(
      /^SD01(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|SR|ER|U|C)(\d+)$/
    );
    if (match) {
const [, rarity, number] = match;
const isReferenceRarity = rarity.startsWith("P");
const displayRarity = isReferenceRarity
        ? rarity.slice(1)
        : rarity;
      return `${isReferenceRarity ? "※" : ""}SD01-${displayRarity}${number}`;
    }
  }
// Fantasy Wonderland / BP01.
  if (currentSetId === "FW") {
const match = key.match(
      /^BP01(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|U|C)(\d+)$/
    );
    if (match) {
const [, rarity, number] = match;
const displayRarity =
        rarity === "PSPR" ? "SPR" :
        rarity === "PCR" ? "CR" :
        rarity === "PGR" ? "GR" :
        rarity === "PER" ? "ER" :
        rarity === "PRR" ? "RR" :
        rarity;
const reference = ["PSPR", "PCR", "PGR", "PER", "PRR"].includes(rarity)
        ? "※"
        : "";
      return `${reference}BP01-${displayRarity}${number}`;
    }
  }
// Discord / BP02. A2/B2 are image variants of the same displayed card code.
  if (currentSetId === "12") {
const match = key.match(
      /^BP02-(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|U|C)(\d+)(?:-(?:A2|B2))?$/
    );
    if (match) {
const [, rarity, number] = match;
const displayRarity =
        rarity === "PSPR" ? "SPR" :
        rarity === "PCR" ? "CR" :
        rarity === "PGR" ? "GR" :
        rarity === "PER" ? "ER" :
        rarity === "PRR" ? "RR" :
        rarity;
const reference = ["PSPR", "PCR", "PGR", "PER", "PRR"].includes(rarity)
        ? "※"
        : "";
      return `${reference}BP02-${displayRarity}${number}`;
    }
  }
// All SN cards display the S rarity as a diamond.// The normal set keys are "SN-1", "SN-2", etc.
  if (key.startsWith("SN-")) {
    return `◇N-${key.slice(3)}`;
  }
// Also handle compact SN keys if one is supplied by a special set.
const compactSnMatch = key.match(/^(.*?)(?:SN)(\d+)$/);
  if (compactSnMatch) {
    return `${compactSnMatch[1]}◇N${compactSnMatch[2]}`;
  }
// SCR uses the diamond form ONLY in Fun Moments.// The normal keys are "SCR-1", "SCR-2", etc.
  if (["7", "8", "11"].includes(currentSetId)) {
    if (key.startsWith("SCR-")) {
      return `◇CR-${key.slice(4)}`;
    }
const compactScrMatch = key.match(/^(.*?)(?:SCR)(\d+)$/);
    if (compactScrMatch) {
      return `${compactScrMatch[1]}◇CR${compactScrMatch[2]}`;
    }
  }
// Both SHINING ZR and SZR display as ◇ZR.
const zrMatch = key.match(/^(?:SHINING ZR|SZR)-?(\d+)$/);
  if (zrMatch) {
    return `◇ZR-${zrMatch[1]}`;
  }
  return key;
};
export default function MyTradesSets() {
const { setId } = useParams();
const navigate = useNavigate();
const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};
const [collapsedRarities, setCollapsedRarities] = useState<Record<string, boolean>>({});
const [progressMap, setProgressMap] = useState<Record<string, any>>({});
const [tradeCards, setTradeCards] = useState<
  Record<string, "trade" | "purchase">
>({});
const [listingMode, setListingMode] = useState<
  "trade" | "purchase"
>("trade");
const [quantities, setQuantities] = useState<Record<string, number>>({});
const [savedQuantities, setSavedQuantities] = useState<Record<string, number>>({});
const [editMode, setEditMode] = useState(false);
const [inventoryDirty, setInventoryDirty] = useState(false);
const [showIntroPopup, setShowIntroPopup] = useState(false);
const [showLeavePopup, setShowLeavePopup] = useState(false);
const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
const [activeDeck, setActiveDeck] = useState<number | null>(null);
const inventoryDirtyRef = useRef(false);
const navigationGuardRef = useRef(false);
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light");
});
useEffect(() => {
  const syncTheme = () => {
    const root = document.documentElement;
    setIsLightMode(
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      !root.classList.contains("dark")
    );
  };
  syncTheme();
  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  return () => observer.disconnect();
}, []);
  useEffect(() => {
const load = async (userOverride?: any) => {
// Never overwrite unsaved inventory edits with a fresh database load.// Supabase can refresh the auth session when a browser tab becomes active.
    if (inventoryDirtyRef.current) {
      return;
    }
let user = userOverride;
    if (!user) {
const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }
// handle logged-out case
    if (!user) {
      setProgressMap({});
      setTradeCards({});
      setQuantities({});
      return;
    }
// 🔹 LOAD PROGRESS
const { data: progress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);
const map: Record<string, any> = {};
    progress?.forEach((row: any) => {
      map[row.set_id] = row.progress || {};
    });
    setProgressMap(map);
// 🔹 LOAD TRADE
const { data: trades } = await supabase
  .from("for_trade")
  .select("card_key, listing_type")
  .eq("set_id", resolvedSetId)
  .eq("user_id", user.id);
const tradeMap: Record<string, "trade" | "purchase"> = {};
trades?.forEach((card: any) => {
  tradeMap[card.card_key] = card.listing_type || "trade";
});
    setTradeCards(tradeMap);
// 🔹 LOAD QUANTITIES
const { data: qtyData } = await supabase
  .from("card_quantity")
  .select("card_key, quantity")
  .eq("set_id", resolvedSetId)
  .eq("user_id", user.id);
const qtyMap: Record<string, number> = {};
    qtyData?.forEach((row: any) => {
      qtyMap[row.card_key] = row.quantity;
    });
    setQuantities(qtyMap);
    setSavedQuantities(qtyMap);
    setInventoryDirty(false);
  };
// initial load
  load();
const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
// Do not reload inventory for auth/session refresh events.// Those can happen when the browser tab becomes active and would// overwrite unsaved quantity edits with old database values.
    if (event === "SIGNED_OUT") {
      setProgressMap({});
      setTradeCards({});
      setQuantities({});
      setSavedQuantities({});
      setInventoryDirty(false);
      inventoryDirtyRef.current = false;
    }
  });
  return () => subscription.unsubscribe();
}, [setId]);
useEffect(() => {
const INTRO_KEY = "mlpekayou_inventory_intro_seen";
  try {
const hasSeenIntro = localStorage.getItem(INTRO_KEY) === "true";
    setShowIntroPopup(!hasSeenIntro);
  } catch {
    setShowIntroPopup(false);
  }
}, []);
useEffect(() => {
  inventoryDirtyRef.current = inventoryDirty;
}, [inventoryDirty]);
useEffect(() => {
const handleKayouHeaderNavigation = (event: Event) => {
const customEvent = event as CustomEvent<{ destination?: string }>;
const destination = customEvent.detail?.destination;
    if (!inventoryDirtyRef.current || !destination) {
      return;
    }
    event.preventDefault();
    setPendingNavigation(destination);
    setShowLeavePopup(true);
  };
  window.addEventListener(
    "mlpekayou:before-navigation",
    handleKayouHeaderNavigation
  );
  return () => {
    window.removeEventListener(
      "mlpekayou:before-navigation",
      handleKayouHeaderNavigation
    );
  };
}, []);
useEffect(() => {
const originalPushState = window.history.pushState.bind(window.history);
const originalReplaceState = window.history.replaceState.bind(window.history);
const guardNavigation = (
    originalMethod: typeof window.history.pushState,
    state: any,
    title: string,
    url?: string | URL | null,
  ) => {
    if (
      inventoryDirtyRef.current &&
      !navigationGuardRef.current &&
      url &&
      String(url) !== window.location.href
    ) {
      navigationGuardRef.current = true;
      setPendingNavigation(new URL(String(url), window.location.origin).pathname);
      setShowLeavePopup(true);
      navigationGuardRef.current = false;
      return;
    }
    originalMethod(state, title, url);
  };
const guardedPushState: History["pushState"] = function (
    state,
    title,
    url,
  ) {
    guardNavigation(originalPushState, state, title, url);
  };
const guardedReplaceState: History["replaceState"] = function (
    state,
    title,
    url,
  ) {
    guardNavigation(originalReplaceState, state, title, url);
  };
  window.history.pushState = guardedPushState;
  window.history.replaceState = guardedReplaceState;
  return () => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
  };
}, []);
useEffect(() => {
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!inventoryDirty) return;
    event.preventDefault();
    event.returnValue = "";
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [inventoryDirty]);
const changeQuantity = (cardKey: string, value: number) => {
const next = Math.max(1, value);
  setQuantities((prev) => {
const updated = { ...prev, [cardKey]: next };
const dirty = Object.keys(updated).some(
      (key) => (updated[key] ?? 1) !== (savedQuantities[key] ?? 1)
    );
    setInventoryDirty(dirty);
    inventoryDirtyRef.current = dirty;
    return updated;
  });
};
const saveInventoryChanges = async (): Promise<boolean> => {
const { data } = await supabase.auth.getSession();
const user = data.session?.user;
  if (!user) return false;
const keys = new Set([
    ...Object.keys(savedQuantities),
    ...Object.keys(quantities),
  ]);
const changedKeys = Array.from(keys).filter(
    (key) => (quantities[key] || 1) !== (savedQuantities[key] || 1)
  );
  if (changedKeys.length > 0) {
const results = await Promise.all(
      changedKeys.map((cardKey) =>
        supabase.from("card_quantity").upsert({
          user_id: user.id,
          set_id: resolvedSetId,
          card_key: cardKey,
          quantity: Math.max(1, quantities[cardKey] || 1),
        })
      )
    );
const failed = results.find((result) => result.error);
    if (failed?.error) {
      console.error("Failed to save inventory changes:", failed.error);
      return false;
    }
  }
  setSavedQuantities({ ...quantities });
  setInventoryDirty(false);
  return true;
};
const requestNavigation = (destination: string) => {
  if (inventoryDirtyRef.current) {
    setPendingNavigation(destination);
    setShowLeavePopup(true);
    return;
  }
  navigationGuardRef.current = true;
  navigate(destination);
  navigationGuardRef.current = false;
};
const handleEditToggle = async () => {
  if (!editMode) {
    setEditMode(true);
    return;
  }
  if (inventoryDirty) {
const saved = await saveInventoryChanges();
    if (!saved) return;
  }
  setEditMode(false);
};
const toggleTrade = async (cardKey: string) => {
const { data } = await supabase.auth.getSession();
const user = data.session?.user;
    if (!user) return;
const currentType = tradeCards[cardKey];
    if (currentType) {
      await supabase
        .from("for_trade")
        .delete()
        .eq("user_id", user.id)
        .eq("set_id", resolvedSetId)
        .eq("card_key", cardKey);
      setTradeCards((prev) => {
const updated = { ...prev };
        delete updated[cardKey];
        return updated;
      });
    } else {
await supabase.from("for_trade").upsert({
  user_id: user.id,
  set_id: resolvedSetId,
  card_key: cardKey,
  listing_type: listingMode
});
setTradeCards((prev) => ({
  ...prev,
  [cardKey]: listingMode
}));
    }
  };
const slugMap: Record<string, string> = {
  "moon-one": "1",
  "moon-two": "2",
  "moon-three": "3",
  "star-one": "4",
  "rainbow-one": "5",
  "rainbow-two": "6",
  "fun-moments-one": "7",
  "fun-moments-two": "8",
  "fun-moments-three": "11",
  "promotional-cards": "9",
  "fantasy-wonderland": "FW",
  "friendships-begin": "friendshipsbegin",
  "discord": "12",
  "tcg-promos": "tcgpromos",
};
const resolvedSetId = slugMap[setId || ""] || setId;
const set = sets.find((s) => s.id === resolvedSetId);
if (!set) {
  return (
    <div className={isLightMode ? "min-h-screen bg-[#f5f5f3] text-zinc-600" : "min-h-screen bg-[#0d0f10] text-zinc-400"}>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">Invalid set</div>
    </div>
  );
}
let cards: any[] = [];
if (set.id === "friendshipsbegin") {
const BONUS_STRUCTURE = [
    { prefix: "SD01C", count: 9 },
    { prefix: "SD01U", count: 7 },
    { prefix: "SD01SR", count: 6 },
    { prefix: "SD01SPR", count: 10 },
    { prefix: "SD01GR", count: 6 },
    { prefix: "SD01CR", count: 6 },
    { prefix: "SD01ER", count: 6 },
    { prefix: "SD01PER", count: 12 },
    { prefix: "SD01PRR", count: 6 },
  ];
  BONUS_STRUCTURE.forEach(({ prefix, count }) => {
  for (let i = 1; i <= count; i++) {
let actualIndex = i;
    if (prefix === "SD01PER") {
      actualIndex = i + 6; // shift to 07–18
    }
const num = String(actualIndex).padStart(2, "0");
    cards.push({
      key: `${prefix}${num}`,
      image: `/friendships-begin/${prefix}${num}.webp`
    });
  }
});
  } else if (set.id === "FW") {
const FW_STRUCTURE = [
    { prefix: "BP01C", count: 48 },
    { prefix: "BP01U", count: 18 },
    { prefix: "BP01ER", count: 6 },
    { prefix: "BP01SR", count: 14 },
    { prefix: "BP01SPR", count: 28 },
    { prefix: "BP01GR", count: 12 },
    { prefix: "BP01CR", count: 12 },
    { prefix: "BP01RR", count: 6 },
    { prefix: "BP01PER", count: 12 },
    { prefix: "BP01PSPR", count: 11 },
    { prefix: "BP01PGR", count: 6 },
    { prefix: "BP01PCR", count: 12 },
    { prefix: "BP01PRR", count: 6 },
  ];
 FW_STRUCTURE.forEach(({ prefix, count }) => {
  if (prefix === "BP01ER") {
    for (let i = 0; i < 6; i++) {
const num = String(i + 7).padStart(2, "0");
      cards.push({
        key: `BP01ER${num}`,
        image: `/fantasy-wonderland/SD01ER${num}.webp`
      });
    }
    return;
  }
if (prefix === "BP01PSPR") {
const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
  PSPR_NUMBERS.forEach((n) => {
const num = String(n).padStart(2, "0");
    cards.push({
      key: `BP01PSPR${num}`,
      image: `/fantasy-wonderland/BP01PSPR${num}.webp`
    });
  });
  return;
}
for (let i = 1; i <= count; i++) {
const num = String(i).padStart(2, "0");
  cards.push({
    key: `${prefix}${num}`,
    image:
      prefix === "BP01PER"
        ? `/fantasy-wonderland/SD01PER${num}.webp`
        : `/fantasy-wonderland/${prefix}${num}.webp`
  });
}
});
} else if (set.id === "12") {
const DISCORD_STRUCTURE = [
    { prefix: "BP02-C", count: 48 },
    { prefix: "BP02-U", count: 18 },
    { prefix: "BP02-ER", count: 6 },
    { prefix: "BP02-SR", count: 14 },
    { prefix: "BP02-SPR", count: 28 },
    { prefix: "BP02-GR", count: 12 },
    { prefix: "BP02-CR", count: 12 },
    { prefix: "BP02-RR", count: 6 },
    { prefix: "BP02-PER", count: 12 },
    { prefix: "BP02-PSPR", count: 11 },
    { prefix: "BP02-PGR", count: 6 },
    { prefix: "BP02-PCR", count: 12 },
    { prefix: "BP02-PRR", count: 6 },
  ];
  DISCORD_STRUCTURE.forEach(({ prefix, count }) => {
    if (prefix === "BP02-PER") {
      for (let i = 0; i < 6; i++) {
const num = String(i + 1).padStart(2, "0");
        cards.push({
          key: `BP02-PER${num}-A2`,
          image: `/cards/discord/BP02-PER${num}-A2.webp`,
        });
        cards.push({
          key: `BP02-PER${num}-B2`,
          image: `/cards/discord/BP02-PER${num}-B2.webp`,
        });
      }
      return;
    }
    for (let i = 1; i <= count; i++) {
const num = String(i).padStart(2, "0");
      cards.push({
        key: `${prefix}${num}`,
        image: `/cards/discord/${prefix}${num}.webp`,
      });
    }
  });
} else if (set.id === "tcgpromos") {
  for (let i = 1; i <= 18; i++) {
const num = String(i).padStart(2, "0");
    cards.push({
      key: `RR${num}`,
      image: `/tcgpromos/RR${num}.webp`
    });
  }
} else if (set.id === "9") {
  cards = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13].map((num) => ({
    rarity: "PR",
    number: num,
    key: `PR-${num}`
  }));
} else {
  cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count as number }, (_, i) => ({
      rarity,
      number: i + 1,
      key: `${rarity}-${i + 1}`
    }))
  );
}
const progress =
  set.id === "friendshipsbegin"
    ? (
        progressMap["friendshipsbegin"] ||
        progressMap["SD"] ||
        {}
      )
    : set.id === "FW"
    ? (
        progressMap["FW"] ||
        progressMap["fantasywonderland"] ||
        progressMap["fantasy-wonderland"] ||
        progressMap["BP01"] ||
        {}
      )
    : progressMap[set.id] || {};
const ownedBonusCards = cards.filter(card => 
  progress[card.key] || progress[`BONUS-${card.key}`]
);
const hasStarterDeck = set.id === "friendshipsbegin" &&
  ["SD01A","SD01B","SD01C","SD01D","SD01E","SD01F"].some(deck =>
    Array.from({ length: 21 }).some((_, i) =>
      progress[`${deck}-${i + 1}`]
    )
  );
const rarityOrders: Record<string, string[]> = {
// Star
  "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
// Eternal Moon
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "3": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],
// Rainbow
  "5": ["R","SR","FR","TR","TGR","MTR","SSR","UR","USR","XR"],
  "6": ["BASE", "R", "SR", "ST", "TR", "TGR", "SSR", "FR", "UR", "USR", "XR"],
// Fun Moments
  "7": ["N","SN","R","SR","SSR","UR","CR"],
  "8": ["N","SN","R","SR","SSR","UR","UGR","CR"],
// Fantasy Wonderland
  "FW": [
    "C",
    "U",
    "ER",
    "SR",
    "SPR",
    "GR",
    "CR",
    "RR",
    "※ER",
    "※SPR",
    "※GR",
    "※CR",
    "※RR"
  ],
// Friendships Begin
  "friendshipsbegin": [
    "C",
    "U",
    "SR",
    "SPR",
    "GR",
    "CR",
    "ER",
    "※ER",
    "※RR"
  ],
// Promos
  "9": ["PR"],
  "tcgpromos": ["PR"]
};
  return (
    <div
      className={`min-h-screen pb-24 transition-colors ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
      <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
        {showIntroPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
            <div
              className={`w-full max-w-lg overflow-hidden rounded-[26px] border shadow-2xl ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-[#17191a]"
              }`}
            >
              <div className={`border-b px-5 py-4 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD54A] font-bold text-black">
                    !
                  </div>
                  <div>
                    <div className={`text-xs ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}>
                      Inventory
                    </div>
                    <h2 className="text-lg font-semibold">Quick Start</h2>
                  </div>
                </div>
              </div>
              <div className={`space-y-3 px-5 py-5 text-sm leading-relaxed ${
                isLightMode ? "text-zinc-600" : "text-zinc-300"
              }`}>
                <p>
                  <strong>For Trade</strong> is selected by default. Tap a card to list or unlist it.
                  Switch to <strong>For Purchase</strong> when needed.
                </p>
                <p>
                  Use <strong>Edit Inventory</strong> to change quantities. Tap it again when you're
                  finished to save quantity changes.
                </p>
                <p>
                  If you try to leave with unsaved quantity changes, you'll be asked whether you
                  want to save them first.
                </p>
              </div>
              <div className={`flex justify-end border-t px-5 py-4 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem("mlpekayou_inventory_intro_seen", "true");
                    } catch {}
                    setShowIntroPopup(false);
                  }}
                  className="rounded-xl bg-[#FFD54A] px-5 py-2.5 text-sm font-semibold text-black"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
        {showLeavePopup && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div
              className={`w-full max-w-lg overflow-hidden rounded-[26px] border shadow-2xl ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-[#17191a]"
              }`}
            >
              <div className={`border-b px-5 py-4 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}>
                <div className={`text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Unsaved changes
                </div>
                <h2 className="mt-1 text-lg font-semibold">Save inventory changes?</h2>
              </div>
              <div className="px-5 py-5">
                <p className={`text-sm ${
                  isLightMode ? "text-zinc-600" : "text-zinc-300"
                }`}>
                  You changed one or more quantities. Save them before leaving?
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const saved = await saveInventoryChanges();
                      if (!saved) return;
                      setShowLeavePopup(false);
                      setEditMode(false);
                      const destination = pendingNavigation;
                      setPendingNavigation(null);
                      if (destination) {
                        navigationGuardRef.current = true;
                        navigate(destination);
                        navigationGuardRef.current = false;
                      }
                    }}
                    className="rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black"
                  >
                    Save and leave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeavePopup(false);
                      setInventoryDirty(false);
                      inventoryDirtyRef.current = false;
                      setEditMode(false);
                      const destination = pendingNavigation;
                      setPendingNavigation(null);
                      if (destination) {
                        navigationGuardRef.current = true;
                        navigate(destination);
                        navigationGuardRef.current = false;
                      }
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-700"
                        : "border-white/10 bg-white/[0.04] text-zinc-200"
                    }`}
                  >
                    Leave without saving
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeavePopup(false);
                    setPendingNavigation(null);
                  }}
                  className={`mt-2 w-full rounded-xl px-4 py-2.5 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Stay on page
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => requestNavigation("/inventory")}
          className={`mb-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
              : "border-white/10 bg-[#151718] text-zinc-200 hover:bg-white/[0.06]"
          }`}
        >
          ← Back to Inventory
        </button>
        <section
          className={`rounded-[26px] border p-4 sm:p-5 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className={`text-xs font-medium ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                {set.prefix}
              </div>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{set.name}</h1>
              <div className={`mt-2 flex flex-wrap gap-2 text-xs ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                <span>{ownedBonusCards.length} cards owned</span>
                <span>•</span>
                <span>{Object.keys(tradeCards).length} listed</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
              <div className={`rounded-2xl border px-3 py-3 text-center ${
                isLightMode
                  ? "border-black/10 bg-zinc-50"
                  : "border-white/10 bg-white/[0.03]"
              }`}>
                <div className="text-sm font-semibold">
                  {listingMode === "trade" ? "Trade" : "Purchase"}
                </div>
                <div className={`mt-1 text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Listing mode
                </div>
              </div>
              <div className={`rounded-2xl border px-3 py-3 text-center ${
                isLightMode
                  ? "border-black/10 bg-zinc-50"
                  : "border-white/10 bg-white/[0.03]"
              }`}>
                <div className="text-sm font-semibold">{editMode ? "Active" : "Locked"}</div>
                <div className={`mt-1 text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Quantities
                </div>
              </div>
              <div className={`rounded-2xl border px-3 py-3 text-center ${
                isLightMode
                  ? "border-black/10 bg-zinc-50"
                  : "border-white/10 bg-white/[0.03]"
              }`}>
                <div className="text-sm font-semibold">{Object.keys(tradeCards).length}</div>
                <div className={`mt-1 text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Listed
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className={`mt-3 rounded-[22px] border p-3 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setListingMode("trade")}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                listingMode === "trade"
                  ? "bg-[#FFD54A] text-black"
                  : isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              For Trade
            </button>
            <button
              type="button"
              onClick={handleEditToggle}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                editMode
                  ? "bg-[#FFD54A] text-black"
                  : isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              {editMode ? "Save Inventory" : "Edit Inventory"}
            </button>
            <button
              type="button"
              onClick={() => setListingMode("purchase")}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                listingMode === "purchase"
                  ? "bg-[#FFD54A] text-black"
                  : isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              For Purchase
            </button>
          </div>
          <div className={`mt-2 text-center text-xs ${
            isLightMode ? "text-zinc-500" : "text-zinc-400"
          }`}>
            Tap a card to toggle its listing. {editMode ? "Quantity editing is active." : "Turn on Edit Inventory to change quantities."}
          </div>
        </section>
        {(set.id === "friendshipsbegin"
          ? ownedBonusCards.length === 0 && !hasStarterDeck
          : ownedBonusCards.length === 0) ? (
          <section
            className={`mt-4 rounded-[24px] border p-10 text-center ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <h2 className="text-xl font-semibold">Inventory Empty</h2>
            <p className={`mx-auto mt-2 max-w-xl text-sm ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}>
              You don't currently own any cards in this set. Add cards to your collection first,
              then they'll appear here.
            </p>
          </section>
        ) : (
          <>
            {set.id === "friendshipsbegin" && (
              <section
                className={`mt-4 rounded-[24px] border p-3 sm:p-4 ${
                  isLightMode
                    ? "border-black/10 bg-white"
                    : "border-white/[0.08] bg-[#151718]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Starter Decks</h2>
                  <span className={`text-xs ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}>
                    {activeDeck !== null ? `Deck ${activeDeck + 1}` : "Select a deck"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { code: "SD01A", name: "Twilight Sparkle", img: "/starter-decks-boxes/SDTWILIGHT.webp" },
                    { code: "SD01B", name: "Fluttershy", img: "/starter-decks-boxes/SDFLUTTERSHY.webp" },
                    { code: "SD01C", name: "Pinkie Pie", img: "/starter-decks-boxes/SDPINKIEPIE.webp" },
                    { code: "SD01D", name: "Applejack", img: "/starter-decks-boxes/SDAPPLEJACK.webp" },
                    { code: "SD01E", name: "Rainbow Dash", img: "/starter-decks-boxes/SDRAINBOWDASH.webp" },
                    { code: "SD01F", name: "Rarity", img: "/starter-decks-boxes/SDRARITY.webp" },
                  ]
                    .filter((deck) => {
                      const deckLetter = deck.code.slice(-1);
                      const deckIndex = deckLetter.charCodeAt(0) - 64;
                      const requiredCards: string[] = [];
                      const add = (rarity: string, count: number) => {
                        for (let i = 1; i <= count; i++) {
                          requiredCards.push(`${deck.code}${rarity}${String(i).padStart(2, "0")}`);
                        }
                      };
                      add("C", 9);
                      add("U", 4);
                      add("SR", 2);
                      requiredCards.push(`SD01ER${String(deckIndex).padStart(2, "0")}`);
                      add("SPR", 4);
                      requiredCards.push(`SD01RR${String(deckIndex).padStart(2, "0")}`);
                      return requiredCards.every((key) => progress[`STARTER-${key}`]);
                    })
                    .map((deck, i) => {
                      const isActive = activeDeck === i;
                      return (
                        <div
                          key={deck.code}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDeck(isActive ? null : i);
                          }}
                          className={`cursor-pointer rounded-2xl border p-2 transition ${
                            isActive
                              ? "border-[#FFD54A] bg-[#FFD54A]/10"
                              : isLightMode
                              ? "border-black/10 bg-zinc-50"
                              : "border-white/10 bg-white/[0.03]"
                          }`}
                        >
                          <div className="relative mx-auto max-w-[150px]">
                            <img
                              src={deck.img}
                              alt={deck.name}
                              className="h-28 w-full object-contain sm:h-32"
                            />
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute bottom-1 right-1 flex items-center rounded-lg border px-1.5 py-1 text-xs font-semibold ${
                                isLightMode
                                  ? "border-black/10 bg-white text-zinc-700"
                                  : "border-white/10 bg-[#151718] text-zinc-200"
                              }`}
                            >
                              {editMode && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeQuantity(deck.code, (quantities[deck.code] || 1) - 1)
                                  }
                                  className="px-1"
                                >
                                  −
                                </button>
                              )}
                              <span className="px-1">{quantities[deck.code] || 1}</span>
                              {editMode && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeQuantity(deck.code, (quantities[deck.code] || 1) + 1)
                                  }
                                  className="px-1"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <div className={`text-xs ${
                              isLightMode ? "text-zinc-500" : "text-zinc-400"
                            }`}>
                              {deck.code}
                            </div>
                            <div className="mt-0.5 text-sm font-semibold">{deck.name}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}
            <section
              className={`mt-4 rounded-[24px] border ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/[0.08] bg-[#151718]"
              }`}
            >
              <div className={`flex items-center justify-between border-b px-4 py-3 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}>
                <h2 className="text-base font-semibold">Cards</h2>
                <span className={`text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  {Object.keys(tradeCards).length} listed
                </span>
              </div>
              <div className="space-y-3 p-3 sm:p-4">
                {Object.entries(
                  ownedBonusCards.reduce((acc: Record<string, any[]>, card) => {
                    let rarity = card.rarity || "OTHER";
                    if (
                      set.id === "FW" ||
                      set.id === "friendshipsbegin" ||
                      set.id === "tcgpromos"
                    ) {
                      const match = card.key.match(
                        /(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|SSR|ZR|HR|LSR|SGR|SZR|UR|R|U|C)/
                      );
                      rarity = match?.[0] || "OTHER";
                      if (set.id === "tcgpromos") rarity = "PR";
                      if (rarity === "PER") rarity = "※ER";
                      if (rarity === "PSPR") rarity = "※SPR";
                      if (rarity === "PCR") rarity = "※CR";
                      if (rarity === "PRR") rarity = "※RR";
                      if (rarity === "PGR") rarity = "※GR";
                    }
                    if (!acc[rarity]) acc[rarity] = [];
                    acc[rarity].push(card);
                    return acc;
                  }, {})
                )
                  .sort(([a], [b]) => {
                    const currentOrder = rarityOrders[set.id] || [];
                    const indexA = currentOrder.indexOf(a);
                    const indexB = currentOrder.indexOf(b);
                    return indexB - indexA;
                  })
                  .map(([rarity, rarityCards]: [string, any[]]) => {
                    const collapseKey = `${set.id}-${rarity}`;
                    const isCollapsed = collapsedRarities[collapseKey];
                    const rarityLabel =
                      rarity === "SHINING ZR" || rarity === "SZR"
                        ? "◇ZR"
                        : rarity === "SN"
                        ? "◇N"
                        : rarity === "SCR" && ["7", "8", "11"].includes(set.id)
                        ? "◇CR"
                        : rarity;
                    return (
                      <div
                        key={rarity}
                        className={`overflow-hidden rounded-2xl border ${
                          isLightMode
                            ? "border-black/10 bg-zinc-50"
                            : "border-white/[0.08] bg-white/[0.025]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsedRarities((prev) => ({
                              ...prev,
                              [collapseKey]: !prev[collapseKey],
                            }))
                          }
                          className={`flex w-full items-center justify-between px-3 py-3 text-left ${
                            isLightMode ? "hover:bg-zinc-100" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="text-sm font-semibold">{rarityLabel}</span>
                          <span className={`text-xs ${
                            isLightMode ? "text-zinc-500" : "text-zinc-400"
                          }`}>
                            {rarityCards.length} cards {isCollapsed ? "+" : "−"}
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className={`grid grid-cols-3 gap-1.5 border-t p-2 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9 ${
                            isLightMode ? "border-black/10" : "border-white/[0.08]"
                          }`}>
                            {rarityCards.map((card) => {
                              const key = card.key;
                              const listingType = tradeCards[key];
                              const isStarterDeck =
                                set.id === "friendshipsbegin" && key.includes("-");
                              const isDoubleCard =
                                set.id === "3" &&
                                card.rarity === "SZR" &&
                                card.number === 1;
                              return (
                                <div
                                  key={key}
                                  onClick={() => {
                                    if (!isStarterDeck) toggleTrade(key);
                                  }}
                                  className={`group relative cursor-pointer overflow-hidden rounded-xl border p-0.5 transition ${
                                    isStarterDeck
                                      ? isLightMode
                                        ? "cursor-default border-black/10"
                                        : "cursor-default border-white/10"
                                      : isLightMode
                                      ? "border-black/10 hover:border-[#9A7200]"
                                      : "border-white/10 hover:border-[#FFD54A]/60"
                                  } ${
                                    listingType === "trade"
                                      ? "border-emerald-500"
                                      : listingType === "purchase"
                                      ? "border-sky-500"
                                      : ""
                                  } ${
                                    isDoubleCard
                                      ? "col-span-2 aspect-[10/7]"
                                      : "aspect-[5/7]"
                                  }`}
                                >
                                  <div className="h-full w-full overflow-hidden rounded-[10px]">
                                    <img
                                      src={
                                        set.id === "9"
                                          ? `/promo-cards/mlpepr${String(card.number).padStart(3, "0")}.webp`
                                          : set.id === "tcgpromos"
                                          ? `/tcgpromos/${card.key}.webp`
                                          : card.image ||
                                            `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.webp`
                                      }
                                      alt={key}
                                      className={`h-full w-full ${
                                        ["12", "FW", "friendshipsbegin", "FB"].includes(set.id)
                                          ? "object-cover"
                                          : "object-cover scale-[1.04]"
                                      }`}
                                    />
                                  </div>
                                  <div
                                    className={`pointer-events-none absolute left-1 top-1 rounded-md px-1 py-0.5 text-[7px] font-semibold ${
                                      isLightMode
                                        ? "bg-white/85 text-zinc-700"
                                        : "bg-black/70 text-[#FFE27A]"
                                    }`}
                                  >
                                    {getDisplayCode(card, set.id)}
                                  </div>
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute bottom-1 right-1"
                                  >
                                    {editMode && window.innerWidth >= 768 ? (
                                      <div
                                        className={`flex items-center rounded-lg border px-1 text-xs font-semibold ${
                                          isLightMode
                                            ? "border-black/10 bg-white/90 text-zinc-700"
                                            : "border-white/10 bg-black/80 text-zinc-200"
                                        }`}
                                      >
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          value={String(quantities[key] || "")}
                                          placeholder="1"
                                          onClick={(e) => e.stopPropagation()}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") {
                                              setQuantities((prev) => {
                                                const updated = { ...prev, [key]: 0 };
                                                setInventoryDirty(true);
                                                inventoryDirtyRef.current = true;
                                                return updated;
                                              });
                                              return;
                                            }
                                            const value = Number(raw);
                                            if (!isNaN(value)) {
                                              setQuantities((prev) => {
                                                const updated = { ...prev, [key]: value };
                                                const dirty = Object.keys(updated).some(
                                                  (cardKey) =>
                                                    (updated[cardKey] ?? 1) !==
                                                    (savedQuantities[cardKey] ?? 1)
                                                );
                                                setInventoryDirty(dirty);
                                                inventoryDirtyRef.current = dirty;
                                                return updated;
                                              });
                                            }
                                          }}
                                          onBlur={() => {
                                            const finalValue = Math.max(1, quantities[key] || 1);
                                            changeQuantity(key, finalValue);
                                          }}
                                          className="w-8 bg-transparent py-1 text-center outline-none"
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        className={`flex items-center rounded-lg border px-1 py-0.5 text-xs font-semibold ${
                                          isLightMode
                                            ? "border-black/10 bg-white/90 text-zinc-700"
                                            : "border-white/10 bg-black/80 text-zinc-200"
                                        }`}
                                      >
                                        {editMode && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              changeQuantity(key, (quantities[key] || 1) - 1)
                                            }
                                            className="px-1"
                                          >
                                            −
                                          </button>
                                        )}
                                        <span className="px-1">{quantities[key] || 1}</span>
                                        {editMode && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              changeQuantity(key, (quantities[key] || 1) + 1)
                                            }
                                            className="px-1"
                                          >
                                            +
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {listingType && (
                                    <div
                                      className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                                        listingType === "trade"
                                          ? "bg-emerald-500"
                                          : "bg-sky-500"
                                      }`}
                                    >
                                      ✓
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
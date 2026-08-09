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

  useEffect(() => {
  const load = async (userOverride?: any) => {
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
  } = supabase.auth.onAuthStateChange((_event, session) => {
    load(session?.user);
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
    setInventoryDirty(
      Object.keys(updated).some(
        (key) => (updated[key] || 1) !== (savedQuantities[key] || 1)
      )
    );
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
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#faf7ef] to-[#f4efe3]">
      <div className="container py-8 text-center text-gray-500">
        Invalid set
      </div>
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

  //Star
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
      className="min-h-screen bg-[#090a0a] text-[#e7e8e2]"
      style={{
        fontFamily: "Oxanium, sans-serif",
        backgroundImage: `
          radial-gradient(circle at 50% -10%, rgba(230,190,55,.12), transparent 34%),
          linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px)
        `,
        backgroundSize: "auto, 36px 36px, 36px 36px",
      }}
    >
      <div className="mx-auto max-w-[1700px] px-3 pb-28 pt-3 sm:px-5 sm:pb-10 sm:pt-5 lg:px-8">

        {showIntroPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl overflow-hidden border border-[#5a4a21] bg-[#101212] shadow-[0_30px_100px_rgba(0,0,0,.8)]">
              <div className="h-1 bg-[#e4bd43]" />
              <div className="border-b border-[#292c28] bg-[#0d0f0f] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center border border-[#5a4a21] bg-[#1b1911] text-[#e4bd43]">!</span>
                  <div>
                    <div className="text-[7px] font-bold uppercase tracking-[.34em] text-[#777a72]">INVENTORY CONTROL SYSTEM</div>
                    <div className="mt-1 text-sm font-black uppercase tracking-[.08em] text-[#e4bd43]">Quick Start</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 px-5 py-5 text-[10px] leading-relaxed text-[#b8bab2] sm:px-7 sm:py-6">
                <p><span className="font-black text-[#e4bd43]">"For Trade"</span> is already selected when the page opens. That means tapping any card will mark it for trade. You can use the provided toggle to switch over to <span className="font-black text-[#d8b33d]">"For Purchase"</span> instead.</p>
                <p>Click <span className="font-black text-[#e4bd43]">"Edit Inventory"</span> and it will change to <span className="font-black text-[#e4bd43]">"Edit Active."</span> On mobile, tap the + or - buttons to change the quantity you have. On desktop, simply click on the existing number and type in a new one.</p>
                <p>Don't forget to tap the <span className="font-black text-[#e4bd43]">"Edit Active"</span> button again to save your changes. If you forget, don't worry. There's now a pop up to remind you before you leave the page.</p>
              </div>
              <div className="flex justify-end border-t border-[#292c28] bg-[#0d0f0f] px-5 py-4 sm:px-7">
                <button onClick={() => {
                      try {
                        localStorage.setItem("mlpekayou_inventory_intro_seen", "true");
                      } catch {}
                      setShowIntroPopup(false);
                    }} className="border border-[#705d26] bg-[#e1b936] px-5 py-2.5 text-[8px] font-black uppercase tracking-[.2em] text-[#111] transition hover:bg-[#f0cf5a]">UNDERSTOOD</button>
              </div>
            </div>
          </div>
        )}

        {showLeavePopup && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden border border-[#765e20] bg-[#101212] shadow-[0_30px_100px_rgba(0,0,0,.85)]">
              <div className="h-1 bg-[#e4bd43]" />
              <div className="border-b border-[#292c28] bg-[#0d0f0f] px-5 py-4">
                <div className="text-[7px] font-bold uppercase tracking-[.34em] text-[#777a72]">INVENTORY CONTROL SYSTEM // WARNING</div>
                <h2 className="mt-2 text-lg font-black uppercase tracking-[.06em] text-[#e4bd43]">Unsaved Inventory Edits</h2>
              </div>
              <div className="px-5 py-5 sm:px-7">
                <p className="text-[10px] leading-relaxed text-[#b8bab2]">You changed one or more inventory quantities, but those changes have not been saved. What would you like to do?</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button onClick={async () => {
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
                  }} className="border border-[#7a6425] bg-[#e1b936] px-4 py-3 text-[8px] font-black uppercase tracking-[.13em] text-[#111] transition hover:bg-[#f0cf5a]">Save my Inventory and exit</button>
                  <button onClick={() => {
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
                  }} className="border border-[#3b3e38] bg-[#171918] px-4 py-3 text-[8px] font-black uppercase tracking-[.11em] text-[#b9bbb3] transition hover:border-[#6a6d65] hover:text-white">Disregard inventory edits and leave</button>
                </div>
                <button onClick={() => {
                  setShowLeavePopup(false);
                  setPendingNavigation(null);
                }} className="mt-3 w-full py-2 text-[7px] font-bold uppercase tracking-[.2em] text-[#555850] transition hover:text-[#e4bd43]">STAY ON PAGE</button>
              </div>
            </div>
          </div>
        )}

        {/* STARK-STYLE TOP BAR */}
        <div className="mb-3 border border-[#34362f] bg-[#101212] shadow-[0_18px_50px_rgba(0,0,0,.5)]">
          <div className="flex flex-col gap-3 border-b border-[#292c28] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <button
              onClick={() => requestNavigation("/inventory")}
              className="group flex items-center gap-3 text-left"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-[#625323] bg-[#181a18] text-[#e5bd43] transition group-hover:border-[#e5bd43] group-hover:bg-[#211f16]">
                ←
              </span>
              <span>
                <span className="block text-[7px] font-bold uppercase tracking-[.32em] text-[#656861]">
                  SYSTEM // COLLECTION
                </span>
                <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[.12em] text-[#dfe0d9]">
                  BACK TO INVENTORY
                </span>
              </span>
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <div className="text-[7px] uppercase tracking-[.3em] text-[#555850]">
                  ACCESS NODE
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[.18em] text-[#b99835]">
                  PERSONAL DATABASE
                </div>
              </div>
              <div className="flex items-center gap-2 border border-[#34362f] bg-[#0c0e0e] px-3 py-2">
                <span className="h-1.5 w-1.5 bg-[#e5bd43] shadow-[0_0_8px_#e5bd43]" />
                <span className="text-[7px] font-bold uppercase tracking-[.25em] text-[#a58a36]">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COMMAND HEADER */}
        <section className="relative mb-3 overflow-hidden border border-[#3b3d35] bg-[#121414] shadow-[0_24px_65px_rgba(0,0,0,.6)]">
          <div className="absolute left-0 top-0 h-full w-1 bg-[#e4bd43]" />
          <div className="absolute right-0 top-0 h-px w-2/5 bg-gradient-to-l from-[#e4bd43] to-transparent" />
          <div className="absolute bottom-0 left-0 h-px w-1/3 bg-gradient-to-r from-[#e4bd43]/50 to-transparent" />

          <div className="grid lg:grid-cols-[1fr_auto]">
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#e8c14a] shadow-[0_0_10px_#e8c14a]" />
                <span className="text-[7px] font-bold uppercase tracking-[.36em] text-[#646760]">
                  INVENTORY CONTROL SYSTEM // NODE {set.prefix}
                </span>
              </div>

              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1
                  className="text-3xl font-black uppercase leading-none tracking-[-.035em] sm:text-5xl lg:text-6xl"
                  style={{
                    background: "linear-gradient(180deg,#fffde8 0%,#f3da72 38%,#d3a52c 74%,#8e5d08 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {set.name}
                </h1>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="border border-[#4b4020] bg-[#1b1912] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[.22em] text-[#d9b43f]">
                  {set.prefix}
                </span>
                <span className="border border-[#2e312d] bg-[#0d0f0f] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[.22em] text-[#656861]">
                  {ownedBonusCards.length} ACTIVE CARDS
                </span>
                <span className="border border-[#2e312d] bg-[#0d0f0f] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[.22em] text-[#656861]">
                  {Object.keys(tradeCards).length} LISTED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 border-t border-[#292c28] lg:border-l lg:border-t-0">
              <div className="min-w-[92px] border-r border-[#292c28] bg-[#0d0f0f] px-4 py-5">
                <div className="text-[7px] uppercase tracking-[.22em] text-[#555850]">MODE</div>
                <div className="mt-2 text-[9px] font-black uppercase text-[#e4bd43]">
                  {listingMode === "trade" ? "TRADE" : "BUY"}
                </div>
              </div>
              <div className="min-w-[92px] border-r border-[#292c28] bg-[#0d0f0f] px-4 py-5">
                <div className="text-[7px] uppercase tracking-[.22em] text-[#555850]">EDIT</div>
                <div className={`mt-2 text-[9px] font-black uppercase ${editMode ? "text-[#e4bd43]" : "text-[#62655e]"}`}>
                  {editMode ? "ACTIVE" : "LOCKED"}
                </div>
              </div>
              <div className="min-w-[92px] bg-[#0d0f0f] px-4 py-5">
                <div className="text-[7px] uppercase tracking-[.22em] text-[#555850]">STATUS</div>
                <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase text-[#dfe0d9]">
                  <span className="h-1.5 w-1.5 bg-[#e4bd43] shadow-[0_0_7px_#e4bd43]" />
                  READY
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMAND DECK */}
        <section className="mb-5 border border-[#34362f] bg-[#101212] shadow-[0_16px_45px_rgba(0,0,0,.45)]">
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[7px] font-bold uppercase tracking-[.3em] text-[#555850]">
                COMMAND DECK
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-[.12em] text-[#777a72]">
                Select an operating mode
              </div>
            </div>

            <div className="grid grid-cols-3 border border-[#34362f] bg-[#0b0d0d]">
              <button
                onClick={() => setListingMode("trade")}
                className={`border-r border-[#34362f] px-3 py-3 text-[8px] font-black uppercase tracking-[.16em] transition sm:px-6 ${
                  listingMode === "trade"
                    ? "bg-[#e1b936] text-[#111] shadow-[inset_0_-2px_0_#8f6908]"
                    : "text-[#9b9d96] hover:bg-[#1b1d1c] hover:text-[#e4bd43]"
                }`}
              >
                FOR TRADE
              </button>

              <button
                onClick={handleEditToggle}
                className={`border-r border-[#34362f] px-3 py-3 text-[8px] font-black uppercase tracking-[.16em] transition sm:px-6 ${
                  editMode
                    ? "bg-[#e1b936] text-[#111] shadow-[inset_0_-2px_0_#8f6908]"
                    : "text-[#9b9d96] hover:bg-[#1b1d1c] hover:text-[#e4bd43]"
                }`}
              >
                {editMode ? "EDIT ACTIVE" : "EDIT INVENTORY"}
              </button>

              <button
                onClick={() => setListingMode("purchase")}
                className={`px-3 py-3 text-[8px] font-black uppercase tracking-[.16em] transition sm:px-6 ${
                  listingMode === "purchase"
                    ? "bg-[#e1b936] text-[#111] shadow-[inset_0_-2px_0_#8f6908]"
                    : "text-[#9b9d96] hover:bg-[#1b1d1c] hover:text-[#e4bd43]"
                }`}
              >
                FOR PURCHASE
              </button>
            </div>
          </div>

          <div className="border-t border-[#292c28] bg-[#0d0f0f] px-3 py-2.5 sm:px-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[7px] uppercase tracking-[.18em]">
              <span className="flex items-center gap-2 text-[#777a72]">
                <span className="h-1.5 w-1.5 bg-[#e4bd43]" />
                Tap a card to toggle its listing
              </span>
              <span className="text-[#4f524d]">|</span>
              <span className="text-[#555850]">
                {editMode ? "Quantity controls unlocked" : "Quantity controls locked"}
              </span>
              <span className="ml-auto text-[#8e732a]">
                {listingMode === "trade" ? "TRADE CHANNEL" : "PURCHASE CHANNEL"}
              </span>
            </div>
          </div>
        </section>

        {(set.id === "friendshipsbegin"
          ? ownedBonusCards.length === 0 && !hasStarterDeck
          : ownedBonusCards.length === 0) ? (
          <section className="border border-[#34362f] bg-[#101212] shadow-[0_20px_55px_rgba(0,0,0,.5)]">
            <div className="border-b border-[#292c28] bg-[#0d0f0f] px-4 py-3">
              <span className="text-[7px] font-bold uppercase tracking-[.3em] text-[#666961]">
                SYSTEM RESPONSE // INVENTORY
              </span>
            </div>
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-[#5a4a21] bg-[#191810] text-[#e4bd43]">
                !
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[.32em] text-[#777a72]">
                NO ACTIVE CARD NODES
              </div>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-[.04em] text-[#e8e8e1]">
                Inventory Empty
              </h2>
              <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#e4bd43] to-transparent" />
              <p className="mx-auto mt-4 max-w-xl text-[8px] uppercase leading-relaxed tracking-[.12em] text-[#555850]">
                You don't currently own any cards in this set. Add cards to your collection first,
                then they'll appear here for trading or purchase listings.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* STARTER DECK SUBSYSTEM */}
            {set.id === "friendshipsbegin" && (
              <section className="mb-5 border border-[#34362f] bg-[#101212] shadow-[0_16px_45px_rgba(0,0,0,.45)]">
                <div className="flex items-center justify-between border-b border-[#292c28] bg-[#0d0f0f] px-4 py-3">
                  <div>
                    <div className="text-[7px] font-bold uppercase tracking-[.3em] text-[#555850]">
                      SUBSYSTEM // STARTER DECKS
                    </div>
                    <div className="mt-1 text-[9px] font-black uppercase tracking-[.12em] text-[#d9b43f]">
                      Deck Inventory
                    </div>
                  </div>
                  <span className="text-[7px] uppercase tracking-[.2em] text-[#4f524d]">
                    {activeDeck !== null ? `NODE ${String(activeDeck + 1).padStart(2, "0")}` : "SELECT NODE"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-px bg-[#292c28] sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { code: "SD01A", name: "Twilight Sparkle", img: "/starter-decks-boxes/SDTWILIGHT.webp" },
                    { code: "SD01B", name: "Fluttershy", img: "/starter-decks-boxes/SDFLUTTERSHY.webp" },
                    { code: "SD01C", name: "Pinkie Pie", img: "/starter-decks-boxes/SDPINKIEPIE.webp" },
                    { code: "SD01D", name: "Applejack", img: "/starter-decks-boxes/SDAPPLEJACK.webp" },
                    { code: "SD01E", name: "Rainbow Dash", img: "/starter-decks-boxes/SDRAINBOWDASH.webp" },
                    { code: "SD01F", name: "Rarity", img: "/starter-decks-boxes/SDRARITY.webp" },
                  ].filter((deck) => {
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
                  }).map((deck, i) => {
                    const isActive = activeDeck === i;

                    return (
                      <div
                        key={deck.code}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDeck(isActive ? null : i);
                        }}
                        className={`group cursor-pointer bg-[#111313] p-3 transition ${
                          isActive ? "bg-[#1b1911] shadow-[inset_0_0_0_1px_#d4af37]" : "hover:bg-[#171918]"
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
                            className="absolute bottom-0 right-0 flex items-center border border-[#66562a] bg-[#171814] px-1.5 py-1 text-[9px] font-bold text-[#e4bd43]"
                          >
                            {editMode && (
                              <button
                                onClick={() =>
                                  changeQuantity(deck.code, (quantities[deck.code] || 1) - 1)
                                }
                                className="px-1 hover:text-white"
                              >
                                −
                              </button>
                            )}
                            <span className="px-1">{quantities[deck.code] || 1}</span>
                            {editMode && (
                              <button
                                onClick={() =>
                                  changeQuantity(deck.code, (quantities[deck.code] || 1) + 1)
                                }
                                className="px-1 hover:text-white"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 text-center">
                          <div className="text-[7px] font-bold uppercase tracking-[.18em] text-[#555850]">
                            {deck.code}
                          </div>
                          <div className={`mt-1 text-[8px] font-black uppercase tracking-[.08em] ${isActive ? "text-[#e4bd43]" : "text-[#bfc1ba]"}`}>
                            {deck.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* INVENTORY MATRIX */}
            <section className="border border-[#34362f] bg-[#0f1111] shadow-[0_22px_60px_rgba(0,0,0,.55)]">
              <div className="flex flex-col gap-3 border-b border-[#292c28] bg-[#0d0f0f] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-[#e4bd43] shadow-[0_0_8px_#e4bd43]" />
                    <span className="text-[7px] font-bold uppercase tracking-[.32em] text-[#5b5e57]">
                      INVENTORY MATRIX
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-black uppercase tracking-[.04em] text-[#e7e8e2]">
                    ACTIVE CARD NODES
                  </div>
                </div>

                <div className="flex items-center gap-2 border border-[#34362f] bg-[#101212] px-3 py-2">
                  <span className="text-[7px] uppercase tracking-[.2em] text-[#555850]">LISTED</span>
                  <span className="text-sm font-black text-[#e4bd43]">{Object.keys(tradeCards).length}</span>
                </div>
              </div>

              <div className="space-y-5 p-3 sm:p-5">
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

                    return (
                      <div key={rarity} className="border border-[#2f322d] bg-[#111313]">
                        <button
                          onClick={() =>
                            setCollapsedRarities((prev) => ({
                              ...prev,
                              [collapseKey]: !prev[collapseKey],
                            }))
                          }
                          className="group flex w-full items-center gap-3 border-b border-[#292c28] bg-[#0d0f0f] px-3 py-3 text-left transition hover:bg-[#151817] sm:px-4"
                        >
                          <span className="flex h-7 w-7 items-center justify-center border border-[#574a22] bg-[#191811] text-[10px] font-black text-[#e4bd43]">
                            {isCollapsed ? "+" : "−"}
                          </span>

                          <span className="h-px w-5 bg-[#645326]" />
                          <span className="text-[9px] font-black uppercase tracking-[.24em] text-[#e4bd43]">
                            {rarity === "SHINING ZR" || rarity === "SZR"
                              ? "◇ZR"
                              : rarity === "SN"
                              ? "◇N"
                              : rarity === "SCR" && set.id !== "4"
                              ? "◇CR"
                              : rarity}
                          </span>
                          <span className="h-px flex-1 bg-[#292c28]" />
                          <span className="text-[7px] font-bold uppercase tracking-[.2em] text-[#555850]">
                            {rarityCards.length} NODES
                          </span>
                        </button>

                        {!isCollapsed && (
                          <div className="grid grid-cols-3 gap-1.5 p-2 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9">
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
                                  className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-[#0b0d0d] p-0.5 transition-all duration-150 ${
                                    isStarterDeck ? "cursor-default border-[#292c28]" : "border-[#292c28] hover:border-[#806a27]"
                                  } ${
                                    listingType === "trade"
                                      ? "border-[#4caf62] shadow-[0_0_0_1px_rgba(76,175,98,.25)]"
                                      : listingType === "purchase"
                                      ? "border-[#5d8fbd] shadow-[0_0_0_1px_rgba(93,143,189,.25)]"
                                      : ""
                                  } ${
                                    isDoubleCard
                                      ? "col-span-2 aspect-[10/7]"
                                      : "aspect-[5/7]"
                                  }`}
                                >
                                  <div className="h-full w-full overflow-hidden rounded-[6px]">
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

                                  {/* TECHNICAL CARD OVERLAY */}
                                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                  <div className="pointer-events-none absolute left-1 top-1 bg-[#0a0c0c]/80 px-1 py-0.5 text-[5px] font-bold uppercase tracking-[.12em] text-[#d8b33d]">
                                    {key}
                                  </div>

                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute bottom-1 right-1"
                                  >
                                    {editMode && window.innerWidth >= 768 ? (
                                      <div className="flex items-center border border-[#66562a] bg-[#121411]/95 px-1 text-[8px] font-bold text-[#e4bd43]">
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
                                              setQuantities((prev) => ({ ...prev, [key]: 0 }));
                                              return;
                                            }

                                            const value = Number(raw);
                                            if (!isNaN(value)) {
                                              setQuantities((prev) => ({ ...prev, [key]: value }));
                                            }
                                          }}
                                          onBlur={() => {
                                            const finalValue = Math.max(1, quantities[key] || 1);
                                            changeQuantity(key, finalValue);
                                          }}
                                          className="w-8 bg-transparent py-1 text-center outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex items-center border border-[#66562a] bg-[#121411]/95 px-1 py-0.5 text-[7px] font-bold text-[#e4bd43]">
                                        {editMode && (
                                          <button
                                            onClick={() =>
                                              changeQuantity(key, (quantities[key] || 1) - 1)
                                            }
                                            className="px-1 leading-none hover:text-white"
                                          >
                                            −
                                          </button>
                                        )}

                                        <span className="px-1">
                                          {quantities[key] || 1}
                                        </span>

                                        {editMode && (
                                          <button
                                            onClick={() =>
                                              changeQuantity(key, (quantities[key] || 1) + 1)
                                            }
                                            className="px-1 leading-none hover:text-white"
                                          >
                                            +
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {listingType && (
                                    <div
                                      className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center border text-[9px] font-black shadow ${
                                        listingType === "trade"
                                          ? "border-[#5e9d68] bg-[#18351e] text-[#7ee38d]"
                                          : "border-[#6488a9] bg-[#182938] text-[#8ec5f4]"
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

        {/* FOOTER SYSTEM READOUT */}
        <div className="mt-5 flex flex-col gap-2 border-t border-[#292c28] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#e4bd43] shadow-[0_0_7px_#e4bd43]" />
            <span className="text-[7px] font-bold uppercase tracking-[.3em] text-[#686b63]">
              MLPEKAYOU // INVENTORY CONTROL
            </span>
          </div>
          <span className="text-[7px] uppercase tracking-[.2em] text-[#41443e]">
            NODE STABLE // DATA SYNCHRONIZED
          </span>
        </div>
      </div>
    </div>
  );
}
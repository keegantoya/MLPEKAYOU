import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { getProfileAssets } from "./profile-assets";

import {
  usePublicProfileCards,
} from "@/lib/public-profile-cards";

import { getTradeCardImage } from "@/lib/card-images";


interface ExploreProfileProps {
  user: any;
  tradingProfile: any;
  onClose: () => void;
}

const ExploreProfile = ({
  user,
  tradingProfile,
  onClose,
}: ExploreProfileProps) => {

    const [userStats, setuserStats] = useState({
  trades: 0,
  owned: 0,
  completed: 0,
});

const {
  isoCards: userIsoCards,
  wishlistCards: userWishlistCards,
  tradeCards,
} = usePublicProfileCards(user?.id);

const userTradeCards = tradeCards.filter(
  (x: any) => (x.listing_type || "trade") === "trade"
);

const userPurchaseCards = tradeCards.filter(
  (x: any) => x.listing_type === "purchase"
);

const [userProfileSettings, setuserProfileSettings] =
  useState({
    hide_iso: false,
    hide_wishlist: false,
  });

const [userTab, setuserTab] =
  useState<"trades" | "purchases" | "iso" | "wishlist">("trades");

const [collapsedSets, setCollapsedSets] =
  useState<Record<string, boolean>>({});
const [selectedSet, setSelectedSet] = useState("");
const [selectedSection, setSelectedSection] =
  useState<"iso" | "trade" | "wishlist">("iso");

const [quickViewCard, setQuickViewCard] = useState<any>(null);
const [currentUserId, setCurrentUserId] = useState("");
const [sendingRequest, setSendingRequest] = useState(false);
const [requestPending, setRequestPending] = useState(false);
const [notAcceptingRequests, setNotAcceptingRequests] = useState(false);
const navigate = useNavigate();
const [alreadyFriends, setAlreadyFriends] = useState(false);
const [copied, setCopied] = useState(false);

const { avatar, verification: badge } = getProfileAssets(user);

  useEffect(() => {
  if (!user?.id) return;

  async function loadProfile() {

    const {
  data: { session },
} = await supabase.auth.getSession();

setCurrentUserId(session?.user?.id || "");

if (session?.user && session.user.id !== user.id) {
  const { data: friendship } = await supabase
    .from("friends")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("friend_id", user.id)
    .maybeSingle();

  setAlreadyFriends(!!friendship);
}

if (session?.user && session.user.id !== user.id) {
  const { data: existingRequest } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("sender_id", session.user.id)
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  setRequestPending(!!existingRequest);
}
    
      // Load trading profile (Discord username)
      const { data: tradingProfile } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", user.id)
        .single();

      
    const { data: profileSettings } = await supabase
      .from("profiles")
      .select(
        "hide_iso, hide_wishlist, iso_hidden_sets, iso_hidden_sets"
      )
      .eq("id", user.id)
      .single();
    
    const legacyHidden: string[] =
      profileSettings?.iso_hidden_sets || [];
    
    const hiddenIsoSets: string[] = [
      ...(profileSettings?.iso_hidden_sets?.length
        ? profileSettings.iso_hidden_sets
        : legacyHidden),
      ...(profileSettings?.iso_hidden_sets?.length
        ? profileSettings.iso_hidden_sets
        : legacyHidden),
    ];
    
    setuserProfileSettings({
      hide_iso: profileSettings?.hide_iso ?? false,
      hide_wishlist: profileSettings?.hide_wishlist ?? false,
    });
    
  
      const { data: wishlistRows } = await supabase
      .from("wishlists")
      .select("card_key")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    
    const wishlistCards = (wishlistRows || []).map((row: any) => {
    
      const [set_id, card_key] = String(row.card_key).split(":");
    
      return {
        id: row.card_key,
        set_id,
        card_key,
      };
    });
    
      if (!(profileSettings?.hide_iso ?? false)) {
      setuserTab("iso");
    } else if (!(profileSettings?.hide_wishlist ?? false)) {
      setuserTab("wishlist");
    } else {
      setuserTab("trades");
    }
    
    // Load collection progress
    const { data: isoProgress } = await supabase
      .from("collection_progress")
      .select("set_id, progress")
      .eq("user_id", user.id);
    
      const { data: isoStatusRows } = await supabase
      .from("iso_status")
      .select("card_key, status")
      .eq("user_id", user.id);
    
    // Build a lookup of cards currently in progress
    const inProgressCards = new Set(
      (isoStatusRows || [])
        .filter(
          (row: any) =>
            row.status === "trade_in_progress" ||
            row.status === "purchase_in_progress"
        )
        .map((row: any) => String(row.card_key))
    );
    
    // Build a lookup of cards the user already owns
    const ownedCards: Record<string, boolean> = {};
    
    (isoProgress || []).forEach((set: any) => {
      Object.entries(set.progress || {}).forEach(([key, value]) => {
        if (value) {
          ownedCards[`${set.set_id}-${key}`] = true;
        }
      });
    });
    
    // Generate missing cards for supported CCG sets
    const isoCards: any[] = [];
    
const isoSets = [
  { id: "1", rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 } },
  { id: "2", rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 } },
  { id: "3", rarities: { R: 60, SR: 40, SSR: 40, HR: 60, UR: 18, LSR: 32, SGR: 16, ZR: 14, SC: 7, SZR: 3 } },
  { id: "4", rarities: { SSR: 20, SCR: 18, UR: 18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 } },
  { id: "5", rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 } },
  { id: "6", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 } },
  { id: "7", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 } },
  { id: "8", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 } },
  { id: "11", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 } },
  { id: "9", rarities: { PR: 12 } },
  { id: "SD", rarities: {} },
  { id: "FW", rarities: {} },
  { id: "12", rarities: {} },
  { id: "tcgpromos", rarities: { RR: 18 } },
];
    
    isoSets.forEach((set) => {
      if (set.id === "9") {
      ["PR-1","PR-2","PR-3","PR-4","PR-5","PR-7", "PR-8", "PR-9", "PR-10", "PR-11", "PR-12", "PR-13"].forEach((cardKey) => {
        const fullKey = `${set.id}-${cardKey}`;
    
        if (
          !ownedCards[fullKey] &&
          !inProgressCards.has(fullKey)
        ) {
          isoCards.push({
            id: fullKey,
            set_id: set.id,
            card_key: cardKey,
          });
        }
      });
    
      return;
    }
      if (hiddenIsoSets.includes(String(set.id))) {
        return;
      }
    if (set.id === "FW") {
      const progressRow = (isoProgress || []).find(
        (row: any) => String(row.set_id) === "FW"
      );
    
      const progress = progressRow?.progress || {};
    
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
        for (let i = 0; i < count; i++) {
          let num = i + 1;
    
          if (prefix === "BP01ER") {
            num = i + 7;
          }
    
          if (prefix === "BP01PSPR") {
            const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
            num = PSPR_NUMBERS[i];
            if (!num) continue;
          }
    
          const cardKey = `${prefix}${String(num).padStart(2, "0")}`;
    
          if (
      progress[cardKey] !== true &&
      !inProgressCards.has(cardKey)
    ) {
            isoCards.push({
              id: `FW-${cardKey}`,
              set_id: "FW",
              card_key: cardKey,
            });
          }
        }
      });
    
      return;
    }

    if (set.id === "12") {
  const progressRow = (isoProgress || []).find(
    (row: any) => String(row.set_id) === "12"
  );

  const progress = progressRow?.progress || {};

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
    for (let i = 0; i < count; i++) {
      let cardKey = "";

if (prefix === "BP02-PER") {
  const num = Math.floor(i / 2) + 1;
  const side = i % 2 === 0 ? "A2" : "B2";

  cardKey = `${prefix}${String(num).padStart(2, "0")}-${side}`;
} else if (prefix === "BP02-PSPR") {
  cardKey = `${prefix}${String(i + 1).padStart(2, "0")}`;
} else {
  cardKey = `${prefix}${String(i + 1).padStart(2, "0")}`;
}

      if (
        progress[cardKey] !== true &&
        !inProgressCards.has(cardKey)
      ) {
        isoCards.push({
          id: `12-${cardKey}`,
          set_id: "12",
          card_key: cardKey,
        });
      }
    }
  });

  return;
}
    
    if (
      set.id === "SD" &&
      (
        hiddenIsoSets.includes("SD_STARTERS") ||
        hiddenIsoSets.includes("SD_BONUS")
      )
    ) {
      return;
    }
    
    if (set.id === "SD") {
      const progressRow = (isoProgress || []).find(
        (row: any) => String(row.set_id) === "SD"
      );
    
      const progress = progressRow?.progress || {};
    
      const SD_STRUCTURE = [
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
    
      SD_STRUCTURE.forEach(({ prefix, count }) => {
        for (let i = 0; i < count; i++) {
          let num = i + 1;
    
          // SD01PER is numbered 07–18
          if (prefix === "SD01PER") {
            num = i + 7;
            if (num > 18) continue;
          }
    
          const cardKey = `${prefix}${String(num).padStart(2, "0")}`;
    
          const isOwned =
            progress[cardKey] === true ||
            progress[`BONUS-${cardKey}`] === true ||
            progress[`STARTER-${cardKey}`] === true;
    
          if (
      !isOwned &&
      !inProgressCards.has(cardKey)
    ) {
            isoCards.push({
              id: `SD-${cardKey}`,
              set_id: "SD",
              card_key: cardKey,
            });
          }
        }
      });
    
      return;
    }
    
    if (set.id === "tcgpromos") {
  for (let i = 1; i <= 18; i++) {
        const cardKey = `RR${String(i).padStart(2, "0")}`;
        const fullKey = `tcgpromos-${cardKey}`;
    
        if (
          !ownedCards[fullKey] &&
          !inProgressCards.has(fullKey)
        ) {
          isoCards.push({
            id: fullKey,
            set_id: "tcgpromos",
            card_key: cardKey,
          });
        }
      }
    
      return;
    }
    
      // Existing logic for CCG sets
      Object.entries(set.rarities).forEach(([rarity, count]) => {
        for (let i = 1; i <= (count as number); i++) {
          const cardKey = `${rarity}-${i}`;
          const fullKey = `${set.id}-${cardKey}`;
          if (inProgressCards.has(fullKey)) {
      continue;
    }
    
          if (
      !ownedCards[fullKey] &&
      !inProgressCards.has(fullKey)
    ) {
      isoCards.push({
        id: fullKey,
        set_id: set.id,
        card_key: cardKey,
      });
    }
        }
      });
    });
    
    
      // Load owned card count
const { data: collection } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", user.id);

let owned = 0;

(collection || []).forEach((row: any) => {
  if (row.set_id === "OTHERMERCH") {
    return;
  }

  owned += Object.values(row.progress || {}).filter(
    (value: any) =>
      value === true ||
      (typeof value === "object" && value?.owned === true)
  ).length;
});
    
      // Load collection progress for completed sets
    
    let completed = 0;
    
    const progressMap = new Map(
      (isoProgress || []).map((row: any) => [String(row.set_id), row])
    );
    
    // Main checklist sets only
    const sets = [
      { id: "1", rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 } },
      { id: "5", rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 } },
      { id: "7", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 } },
      { id: "2", rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 } },
      { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, SZR:3 } },
      { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 } },
      { id: "TCG_PROMOS", name: "TCG Promos" },
    ];
    
    sets.forEach((set) => {
      const found = progressMap.get(set.id);
    
      if (!found?.progress) return;
    
      let ownedInSet = 0;
      let totalInSet = 0;
    
      Object.entries(set.rarities).forEach(([rarity, count]) => {
        totalInSet += count as number;
    
        for (let i = 1; i <= (count as number); i++) {
          const key = `${rarity}-${i}`;
          if (found.progress[key]) {
            ownedInSet++;
          }
        }
      });
    
      if (totalInSet > 0 && ownedInSet === totalInSet) {
        completed++;
      }
    });
    
    // Fantasy Wonderland
    const { data: fwProgress } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
      .eq("set_id", "FW");
    
    const fwRow = fwProgress?.[0];
    
    if (fwRow) {
      const STRUCTURE = [
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
    
      const validKeys = new Set(
        STRUCTURE.flatMap(({ prefix, count }) => {
          if (prefix === "BP01ER") {
            return Array.from({ length: 6 }, (_, i) =>
              `BP01ER${String(i + 7).padStart(2, "0")}`
            );
          }
    
          if (prefix === "BP01PSPR") {
            return [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map((n) =>
              `BP01PSPR${String(n).padStart(2, "0")}`
            );
          }
    
          return Array.from({ length: count }, (_, i) =>
            `${prefix}${String(i + 1).padStart(2, "0")}`
          );
        })
      );
    
      const ownedFW = Object.entries(fwRow.progress || {}).filter(
        ([key, val]) => val && validKeys.has(key)
      ).length;
    
      if (ownedFW === validKeys.size) {
        completed++;
      }
    }
    
    setuserStats({
      trades: (tradeCards || []).length,
      owned,
      completed,
    });
    }
  
  
  loadProfile();
}, [user?.id]);

useEffect(() => {
  if (!quickViewCard) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuickViewCard(null);
    }
  };

  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [quickViewCard]);

async function sendFriendRequest() {
  if (!currentUserId) return;

  if (currentUserId === user.id) return;

  setSendingRequest(true);

  const { data: profile } = await supabase
    .from("profiles")
    .select("allow_friend_requests")
    .eq("id", user.id)
    .single();

  if (profile && !profile.allow_friend_requests) {
    setNotAcceptingRequests(true);
    setSendingRequest(false);
    return;
  }

  const { error } = await supabase
    .from("friend_requests")
    .insert({
      sender_id: currentUserId,
      receiver_id: user.id,
      status: "pending",
    });

  if (!error) {
    setRequestPending(true);
  }

  setSendingRequest(false);
}

function isMoon3DoubleWide(card: any) {
  if (!card) return false;

  const setId = String(card.set_id);
  const cardKey = String(card.card_key)
    .replace(/^SZR-0*/, "SZR-");

  return setId === "3" && cardKey === "SZR-1";
}

function getSetName(setId: string) {
  const names: Record<string, string> = {
    "1": "Moon One",
    "2": "Moon Two",
    "3": "Moon Three",
    "4": "Star One",
    "5": "Rainbow One",
    "6": "Rainbow Two",
    "7": "Fun Moments One",
    "8": "Fun Moments Two",
    "11": "Fun Moments Three",
    "9": "Promotional Cards",
    "FW": "Fantasy Wonderland",
    "12": "Discord",
    "SD": "Friendships Begin",
    "friendshipsbegin": "Friendships Begin",
    "tcgpromos": "TCG Promos",
  };

  return names[String(setId)] || `Set ${setId}`;
}

const ISO_SET_TABS = Array.from(
  new Set(userIsoCards.map((card) => String(card.set_id)))
).map((setId) => ({
  id: setId,
  name: getSetName(setId),
}));

const filteredIsoCards =
  userIsoCards.filter(
    (card) => String(card.set_id) === selectedSet
  );

const allTradeCards = [
  ...userTradeCards.map((card) => ({
    ...card,
    type: "trade",
  })),
  ...userPurchaseCards.map((card) => ({
    ...card,
    type: "sale",
  })),
];

const TRADE_SET_TABS = Array.from(
  new Set(allTradeCards.map((card) => String(card.set_id)))
).map((setId) => ({
  id: setId,
  name: getSetName(setId),
}));

const WISHLIST_SET_TABS = Array.from(
  new Set(userWishlistCards.map((card) => String(card.set_id)))
).map((setId) => ({
  id: setId,
  name: getSetName(setId),
}));

useEffect(() => {
  let tabs: { id: string }[] = [];

  if (selectedSection === "iso") {
    tabs = ISO_SET_TABS;
  } else if (selectedSection === "trade") {
    tabs = TRADE_SET_TABS;
  } else {
    tabs = WISHLIST_SET_TABS;
  }

  if (tabs.length === 0) {
    setSelectedSet("");
    return;
  }

  if (!tabs.some((x) => x.id === selectedSet)) {
    setSelectedSet(tabs[0].id);
  }
}, [
  selectedSection,
  selectedSet,
  ISO_SET_TABS,
  TRADE_SET_TABS,
  WISHLIST_SET_TABS,
]);

const RARITY_ORDER = [
  "BASE",
  "C",
  "U",
  "N",
  "SN",
  "R",
  "SR",
  "SSR",
  "HR",
  "FR",
  "TR",
  "TGR",
  "MTR",
  "ST",
  "UR",
  "USR",
  "UGR",
  "XR",
  "ZR",
  "SHINING ZR",
  "SZR",
  "LSR",
  "SGR",
  "SCR",
  "SAR",
  "AR",
  "OR",
  "BP",
  "CR",
  "ER",
  "SPR",
  "GR",
  "RR",
  "PER",
  "PSPR",
  "PGR",
  "PCR",
  "PRR",
  "SC",
  "PR",
];

function getRarity(cardKey: string) {
  const key = String(cardKey);

  if (key.startsWith("BP01") || key.startsWith("BP02") || key.startsWith("SD01")) {
    const match = key.match(
      /(BASE|PER|PSPR|PGR|PCR|PRR|SPR|SSR|SCR|SAR|SGR|UGR|USR|TGR|MTR|LSR|SZR|ZR|XR|HR|FR|TR|ST|SR|UR|GR|CR|ER|RR|SC|BP|AR|OR|PR|R|U|C|N|SN)/
    );

    return match?.[1] ?? "";
  }

  return key.split("-")[0];
}

function sortByIsoOrder(cards: any[]) {
  return [...cards].sort((a, b) => {
    if (String(a.set_id) !== String(b.set_id)) {
      return String(a.set_id).localeCompare(String(b.set_id), undefined, {
        numeric: true,
      });
    }

    const rarityA = getRarity(a.card_key);
    const rarityB = getRarity(b.card_key);

    const rarityDiff =
      RARITY_ORDER.indexOf(rarityA) - RARITY_ORDER.indexOf(rarityB);

    if (rarityDiff !== 0) return rarityDiff;

    const numA =
      Number(String(a.card_key).match(/\d+/)?.[0] ?? 0);
    const numB =
      Number(String(b.card_key).match(/\d+/)?.[0] ?? 0);

    return numA - numB;
  });
}

const filteredTradeCards = sortByIsoOrder(
  allTradeCards.filter(
    (card) => String(card.set_id) === selectedSet
  )
);

const filteredWishlistCards = sortByIsoOrder(
  userWishlistCards.filter(
    (card) => String(card.set_id) === selectedSet
  )
);

      const isJacob =
  user?.id === "94a1c998-d040-4dd2-b2fb-5f606287139d";

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <button
            onClick={onClose}
            className="mb-5 rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-slate-900 hover:bg-yellow-300"
          >
            ← Back to Explore
          </button>


          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl font-semibold text-slate-400">
              {user?.username}
            </span>

            {badge && (
              <img
                src={badge.badge}
                alt={badge.label}
                title={badge.label}
                className="w-6 h-6 object-contain"
              />
            )}
          </div>

          <p className="text-slate-500 mt-2 text-lg">
            Discord: {tradingProfile?.discord_username || "No Discord username"}
          </p>

<div className="mt-4 flex flex-wrap gap-3">
  {currentUserId !== user.id && (
    <button
      onClick={() => {
        if (alreadyFriends) {
          navigate("/inbox");
          return;
        }

        if (!requestPending && !notAcceptingRequests) {
          sendFriendRequest();
        }
      }}
      disabled={
        sendingRequest ||
        (requestPending && !alreadyFriends) ||
        notAcceptingRequests
      }
      className={`rounded-xl px-5 py-2 font-semibold transition ${
        alreadyFriends
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : notAcceptingRequests
          ? "bg-red-600 text-white cursor-not-allowed"
          : requestPending
          ? "bg-slate-500 text-white cursor-not-allowed"
          : "bg-yellow-400 text-slate-900 hover:bg-yellow-300"
      }`}
    >
      {alreadyFriends
        ? "Manage Friendship"
        : notAcceptingRequests
        ? "Not accepting friend requests"
        : requestPending
        ? "Friend Request Pending"
        : sendingRequest
        ? "Sending..."
        : "Send Friend Request"}
    </button>
  )}

  <button
    onClick={() => {
      const url = `https://www.mlpekayou.com/${encodeURIComponent(
  user?.username ?? ""
)}`;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } finally {
          document.body.removeChild(textArea);
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }}
    className="rounded-xl border border-[#E7C84B]/30 bg-[#171717] px-5 py-2 font-semibold text-white transition hover:border-[#E7C84B] hover:bg-[#202020]"
  >
    {copied ? "Copied!" : "Share Profile"}
  </button>
</div>
        </div>

<div className="relative">
  <img
    src={avatar}
    alt={user?.username}
    className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
  />

  {isJacob && (
    <>
      {[
        { left: "24%", delay: "0s" },
        { left: "50%", delay: ".45s" },
        { left: "76%", delay: ".9s" },
      ].map((line, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: line.left,
            top: "-16px",
            animation: "stinkFloat 2s ease-in-out infinite",
            animationDelay: line.delay,
          }}
        >
          <svg
            width="18"
            height="42"
            viewBox="0 0 18 42"
            fill="none"
          >
            <path
              d="M9 42C9 32 2 30 2 22C2 16 14 14 14 7C14 4 12 2 10 0"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </>
  )}
</div>
      </div>

<div className="relative overflow-hidden border border-[#2B2B2B] bg-[#080808]">

  <div
    className="absolute inset-0 opacity-[0.05]"
    style={{
      backgroundImage: `
        linear-gradient(rgba(231,200,75,.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(231,200,75,.2) 1px, transparent 1px)
      `,
      backgroundSize: "26px 26px",
    }}
  />

  <div className="relative border-b border-[#232323] px-6 py-3">

    <div className="text-[11px] uppercase tracking-[0.35em] text-[#E7C84B]">
      Collector Statistics
    </div>

  </div>

  <div className="relative grid grid-cols-3">

    <div className="border-r border-[#232323] p-8">

      <div className="text-[11px] uppercase tracking-[0.3em] text-[#666]">
        Owned
      </div>

      <div className="mt-3 text-5xl font-black text-white">
        {userStats.owned}
      </div>

      <div className="mt-4 h-[3px] w-full bg-[#1A1A1A]">

        <div className="h-full w-full bg-[#E7C84B]" />

      </div>

    </div>

    <div className="border-r border-[#232323] p-8">

      <div className="text-[11px] uppercase tracking-[0.3em] text-[#666]">
        Completed
      </div>

      <div className="mt-3 text-5xl font-black text-white">
        {userStats.completed}
      </div>

      <div className="mt-4 h-[3px] w-full bg-[#1A1A1A]">

        <div className="h-full w-3/4 bg-[#E7C84B]" />

      </div>

    </div>

    <div className="p-8">

      <div className="text-[11px] uppercase tracking-[0.3em] text-[#666]">
        Listings
      </div>

      <div className="mt-3 text-5xl font-black text-white">
        {userStats.trades}
      </div>

      <div className="mt-4 h-[3px] w-full bg-[#1A1A1A]">

        <div className="h-full w-1/2 bg-[#E7C84B]" />

      </div>

    </div>

  </div>

</div>

<div className="border border-[#2A2A2A] bg-[radial-gradient(circle_at_top,#151515_0%,#0E0E0E_45%,#080808_100%)] p-8 shadow-[0_0_40px_rgba(0,0,0,.45)]">

<div className="mb-8 border border-[#2A2A2A] bg-[#090909]">

  <div className="border-b border-[#1C1C1C] px-5 py-3">

    <span className="text-[10px] uppercase tracking-[0.35em] text-[#777]">
      DATABASE MODULE
    </span>

  </div>

  <div className="grid grid-cols-3">

    <button
onClick={() => {
  setSelectedSection("iso");
  setSelectedSet("");
}}
      className={`relative py-4 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200 border-r border-[#1C1C1C]
      ${
        selectedSection === "iso"
          ? "bg-[#111111] text-[#E7C84B]"
          : "bg-[#090909] text-[#777] hover:bg-[#121212] hover:text-white"
      }`}
    >
      {selectedSection === "iso" && (
        <div className="absolute left-0 top-0 h-full w-1 bg-[#E7C84B]" />
      )}

      ISO
    </button>

    <button
onClick={() => {
  setSelectedSection("trade");
  setSelectedSet("");
}}
      className={`relative py-4 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200 border-r border-[#1C1C1C]
      ${
        selectedSection === "trade"
          ? "bg-[#111111] text-[#E7C84B]"
          : "bg-[#090909] text-[#777] hover:bg-[#121212] hover:text-white"
      }`}
    >
      {selectedSection === "trade" && (
        <div className="absolute left-0 top-0 h-full w-1 bg-[#E7C84B]" />
      )}

      TRADES
    </button>

    <button
onClick={() => {
  setSelectedSection("wishlist");
  setSelectedSet("");
}}
      className={`relative py-4 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200
      ${
        selectedSection === "wishlist"
          ? "bg-[#111111] text-[#E7C84B]"
          : "bg-[#090909] text-[#777] hover:bg-[#121212] hover:text-white"
      }`}
    >
      {selectedSection === "wishlist" && (
        <div className="absolute left-0 top-0 h-full w-1 bg-[#E7C84B]" />
      )}

      WISHLIST
    </button>

  </div>

</div>

{selectedSection === "iso" ? (
  userProfileSettings.hide_iso ? (
    <p className="text-slate-500">
      This collector has hidden their ISO.
    </p>
  ) : (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {ISO_SET_TABS.map((set) => (
          <button
            key={set.id}
            onClick={() => setSelectedSet(set.id)}
           className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition ${
              selectedSet === set.id
                ? "bg-yellow-400 text-slate-900"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {set.name}
          </button>
        ))}
      </div>

      {userIsoCards.length === 0 ? (
        <p className="text-slate-500">
          This collector isn't looking for any cards.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
          {filteredIsoCards.map((card) => (
<div
  key={`${card.set_id}-${card.card_key}`}
  onClick={() => setQuickViewCard(card)}
  className={`self-start cursor-pointer overflow-hidden rounded-md border border-[#2A2A2A] bg-[#111111] transition duration-200 hover:scale-[1.04] ${
    isMoon3DoubleWide(card) ? "col-span-2" : ""
  } ${
    !isMoon3DoubleWide(card) &&
    String(card.set_id) === "tcgpromos" &&
    ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
      ? "aspect-[63/88]"
      : ""
  }`}
>
  <img
    src={getTradeCardImage(card)}
    alt={card.card_key}
className={`block w-full transition-transform duration-200 ${
String(card.set_id) === "12" ||
String(card.set_id) === "FW" ||
String(card.set_id) === "SD" ||
String(card.set_id) === "tcgpromos"
  ? ""
  : "scale-[1.055]"
} ${
  isMoon3DoubleWide(card)
    ? "h-auto object-contain"
    : String(card.set_id) === "tcgpromos" &&
      ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
    ? "h-full object-cover object-center"
    : "h-full object-contain"
}`}
  />
</div>
          ))}
        </div>
      )}
    </>
  )
) : selectedSection === "trade" ? (
  <>
    <div className="flex flex-wrap gap-2 mb-6">
      {TRADE_SET_TABS.map((set) => (
        <button
          key={set.id}
          onClick={() => setSelectedSet(set.id)}
          className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition ${
            selectedSet === set.id
              ? "bg-yellow-400 text-slate-900"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {set.name}
        </button>
      ))}
    </div>

    {filteredTradeCards.length === 0 ? (
      <p className="text-slate-500">
        This collector has no cards listed for trade or sale.
      </p>
    ) : (
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
        {filteredTradeCards.map((card) => (
<div
  key={`${card.set_id}-${card.card_key}`}
  onClick={() => setQuickViewCard(card)}
className={`
  relative
  overflow-hidden
  rounded-lg sm:rounded-2xl
  border border-slate-200
  bg-white
  shadow-sm
  transition
  hover:-translate-y-1
  hover:shadow-xl
  ${isMoon3DoubleWide(card) ? "col-span-2" : ""}
`}
>
  <div
    className={`absolute left-2 top-2 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-lg ${
      card.type === "trade"
        ? "bg-blue-600"
        : "bg-emerald-600"
    }`}
  >
    {card.type === "trade" ? "TRADE" : "SALE"}
  </div>

  <div
    className={`bg-gradient-to-b from-slate-100 to-white ${
      !isMoon3DoubleWide(card) &&
      String(card.set_id) === "tcgpromos" &&
      ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
        ? "aspect-[63/88]"
        : ""
    }`}
  >
<img
  src={getTradeCardImage(card)}
  alt={card.card_key}
  className={`block w-full transition-transform duration-200 ${
    String(card.set_id) === "12" ||
    String(card.set_id) === "FW" ||
    String(card.set_id) === "SD" ||
    String(card.set_id) === "tcgpromos"
      ? ""
      : "scale-[1.055]"
  } ${
    isMoon3DoubleWide(card)
      ? "h-auto object-contain"
      : String(card.set_id) === "tcgpromos" &&
        ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
      ? "h-full object-cover object-center"
      : "h-full object-contain"
  }`}
/>
  </div>

<div className="border-t bg-slate-50 px-3 py-2 text-center">
<div className="text-[8px] sm:text-xs font-semibold text-slate-700 truncate">
    {getSetName(String(card.set_id))}
  </div>
</div>
</div>
        ))}
      </div>
    )}
  </>
) : (
  userProfileSettings.hide_wishlist ? (
    <p className="text-slate-500">
      This collector has hidden their wishlist.
    </p>
  ) : (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {WISHLIST_SET_TABS.map((set) => (
          <button
            key={set.id}
            onClick={() => setSelectedSet(set.id)}
            className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition ${
              selectedSet === set.id
                ? "bg-yellow-400 text-slate-900"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {set.name}
          </button>
        ))}
      </div>

      {filteredWishlistCards.length === 0 ? (
        <p className="text-slate-500">
          This collector has no wishlist cards.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
          {filteredWishlistCards.map((card) => (
           <div
  key={`${card.set_id}-${card.card_key}`}
  onClick={() => setQuickViewCard(card)}
  className={`cursor-pointer overflow-hidden rounded-md border border-[#2A2A2A] bg-[#111111] transition duration-200 hover:scale-[1.04] ${
    isMoon3DoubleWide(card) ? "col-span-2" : ""
  }`}
>
  <img
    src={getTradeCardImage(card)}
    alt={card.card_key}
    className={`block w-full h-full transition-transform duration-200 ${
      String(card.set_id) === "12" ||
      String(card.set_id) === "FW" ||
      String(card.set_id) === "SD" ||
      String(card.set_id) === "tcgpromos"
        ? ""
        : "scale-[1.055]"
    } object-contain`}
  />
</div>
          ))}
        </div>
      )}
    </>
  )
)}

</div>

{quickViewCard && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
    onClick={() => setQuickViewCard(null)}
  >
    <button
      onClick={() => setQuickViewCard(null)}
      className="absolute right-6 top-6 text-5xl font-bold text-white hover:text-yellow-400"
    >
      ×
    </button>

<div
  onClick={(e) => e.stopPropagation()}
  className={`overflow-hidden rounded-2xl ${
    isMoon3DoubleWide(quickViewCard)
      ? "max-w-[900px] w-[75vw]"
      : "max-w-[70vw]"
  }`}
>
<img
  src={getTradeCardImage(quickViewCard)}
  alt={quickViewCard.card_key}
  className="block max-w-full max-h-[75vh] w-auto h-auto object-contain"
/>
</div>
  </div>
)}

    </div>
  );
};

export default ExploreProfile;
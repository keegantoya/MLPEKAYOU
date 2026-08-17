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
    hidden_iso_sets: [] as string[],
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
const [alreadyFriends, setAlreadyFriends] = useState(false);
const [copied, setCopied] = useState(false);
const [discordUsername, setDiscordUsername] = useState("");
const navigate = useNavigate();

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
const { data: tradingProfileData } = await supabase
  .from("trading_profiles")
  .select("discord_username")
  .eq("user_id", user.id)
  .maybeSingle();

setDiscordUsername(tradingProfileData?.discord_username || "");

      
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
  hidden_iso_sets: hiddenIsoSets,
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

      if (prefix === "SD01PER") {
        num = i + 7;
        if (num > 18) continue;
      }

      const cardKey = `${prefix}${String(num).padStart(2, "0")}`;

      const isOwned =
        progress[cardKey] === true ||
        progress[`BONUS-${cardKey}`] === true ||
        progress[`STARTER-${cardKey}`] === true;

      const isInProgress =
        inProgressCards.has(cardKey) ||
        inProgressCards.has(`BONUS-${cardKey}`);

      if (!isOwned && !isInProgress) {
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

const visibleIsoCards = userIsoCards.filter((card) => {
  const setId = String(card.set_id);
  const hidden = userProfileSettings.hidden_iso_sets;

  if (hidden.includes(setId)) {
    return false;
  }

  if (
    setId === "FW" &&
    hidden.includes("FW")
  ) {
    return false;
  }

  if (
    setId === "12" &&
    hidden.includes("12")
  ) {
    return false;
  }

  if (
    setId === "tcgpromos" &&
    hidden.includes("TCG_PROMOS")
  ) {
    return false;
  }

  if (
    setId === "SD" &&
    (
      hidden.includes("SD") ||
      hidden.includes("SD_STARTERS") ||
      hidden.includes("SD_BONUS")
    )
  ) {
    return false;
  }

  return true;
});

const ISO_SET_TABS = Array.from(
  new Set(visibleIsoCards.map((card) => String(card.set_id)))
).map((setId) => ({
  id: setId,
  name: getSetName(setId),
}));

const filteredIsoCards =
  visibleIsoCards.filter(
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
  <div className="w-full font-['Oxanium'] text-white">

    {/* ============================================================
        STARK PROFILE HEADER
    ============================================================ */}
    <section className="relative overflow-hidden border border-[#383838] bg-[#1A1A1A]">

      {/* Technical background */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,212,59,.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,212,59,.5) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* Right-side collector image */}
      <div
        className="absolute right-0 top-0 hidden h-full w-[38%] opacity-[0.10] grayscale lg:block"
        style={{
          backgroundImage:
            "url('/website-assets/exploreequestria.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark technical overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/95 to-[#1A1A1A]/75" />

      {/* Yellow structural rail */}
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#FFD43B]" />

      {/* Corner hardware */}
      <div className="absolute right-0 top-0 h-20 w-20 border-l border-b border-[#353535]" />
      <div className="absolute right-0 top-0 h-px w-12 bg-[#FFD43B]" />
      <div className="absolute right-0 top-0 h-12 w-px bg-[#FFD43B]" />

      <div className="relative p-5 sm:p-7 lg:p-9">

        {/* Top navigation */}
        <div className="mb-8 flex items-center justify-between">

          <button
            onClick={onClose}
            className="
              group
              flex
              items-center
              gap-3
              border
              border-[#383838]
              bg-[#151515]
              px-4
              py-2.5
              font-mono
              text-[8px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-[#777]
              transition-all
              hover:border-[#FFD43B]
              hover:text-[#FFD43B]
            "
          >
            <span className="text-base leading-none transition-transform group-hover:-translate-x-1">
              ←
            </span>
            BACK TO EXPLORE
          </button>

          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,.4)]" />

            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-green-400">
              PROFILE ONLINE
            </span>
          </div>
        </div>

        {/* Profile identity */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">

          <div>

            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-[#888]">
                COLLECTOR PROFILE
              </span>

              <div className="h-px w-10 bg-[#FFD43B]/60" />

              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#FFD43B]">
                PUBLIC ACCESS
              </span>
            </div>

            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="relative shrink-0">

                <div className="absolute -inset-1 border border-[#FFD43B]/30" />

                <div className="relative h-20 w-20 overflow-hidden border-2 border-[#FFD43B] bg-[#111] sm:h-24 sm:w-24">

                  <img
                    src={avatar}
                    alt={user?.username}
                    className="h-full w-full object-cover"
                  />

                </div>

                <div className="absolute -bottom-1 -right-1 h-3 w-3 border-2 border-[#1A1A1A] bg-green-400" />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="break-all text-3xl font-black uppercase leading-none tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                    {user?.username}
                  </h1>

                  {badge && (
                    <img
                      src={badge.badge}
                      alt={badge.label}
                      title={badge.label}
                      className="h-6 w-6 object-contain"
                    />
                  )}

                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">

                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#777]">
                    DISCORD
                    <span className="ml-2 text-[#FFD43B]">
                      {discordUsername || "NOT LINKED"}
                    </span>
                  </span>

                  <span className="hidden h-3 w-px bg-[#3A3A3A] sm:block" />

                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#888]">
                    ID VERIFIED
                  </span>

                </div>
              </div>
            </div>

            {/* Profile actions */}
            <div className="mt-7 flex flex-wrap gap-2">

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
                  className={`
                    border
                    px-4
                    py-2.5
                    font-mono
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    transition-all
                    ${
                      alreadyFriends
                        ? "border-[#FFD43B] bg-[#FFD43B] text-[#151515] hover:bg-[#FFE66D]"
                        : notAcceptingRequests
                        ? "cursor-not-allowed border-red-500/40 bg-red-500/10 text-red-400"
                        : requestPending
                        ? "cursor-not-allowed border-[#444] bg-[#242424] text-[#777]"
                        : "border-[#FFD43B] bg-[#FFD43B] text-[#151515] hover:bg-[#FFE66D]"
                    }
                  `}
                >
                  {alreadyFriends
                    ? "MANAGE FRIENDSHIP"
                    : notAcceptingRequests
                    ? "REQUESTS DISABLED"
                    : requestPending
                    ? "REQUEST PENDING"
                    : sendingRequest
                    ? "SENDING..."
                    : "ADD FRIEND"}
                </button>
              )}

              <button
                onClick={() => {
                  const url = `https://www.mlpekayou.community/${encodeURIComponent(
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
                className="
                  border
                  border-[#3E3E3E]
                  bg-[#151515]
                  px-4
                  py-2.5
                  font-mono
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-[#999]
                  transition-all
                  hover:border-[#FFD43B]
                  hover:text-[#FFD43B]
                "
              >
                {copied ? "LINK COPIED" : "SHARE PROFILE"}
              </button>

            </div>
          </div>

          {/* Profile system identifier */}
          <div className="hidden text-right lg:block">

            <div className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#888]">
              PROFILE MODULE
            </div>

            <div className="mt-1 font-mono text-xl font-bold tracking-[0.15em] text-[#FFD43B]">
              04 / 02
            </div>

            <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.25em] text-[#777]">
              PUBLIC COLLECTOR NODE
            </div>

          </div>

        </div>
      </div>
    </section>

    {/* ============================================================
        STATISTICS
    ============================================================ */}
    <section className="mt-4 border border-[#363636] bg-[#1B1B1B]">

      <div className="flex items-center justify-between border-b border-[#303030] bg-[#202020] px-4 py-3">

        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-[#FFD43B]" />

          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-white sm:text-[9px]">
            COLLECTION TELEMETRY
          </span>
        </div>

        <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#888]">
          LIVE DATA
        </span>

      </div>

      <div className="grid grid-cols-3">

        {/* Owned */}
        <div className="border-r border-[#303030] p-4 sm:p-6">

          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#888] sm:text-[9px]">
            CARDS OWNED
          </div>

          <div className="mt-2 text-2xl font-black leading-none text-white sm:text-4xl">
            {userStats.owned.toLocaleString()}
          </div>

          <div className="mt-4 h-1 bg-[#292929]">
            <div className="h-full w-full bg-[#FFD43B]" />
          </div>

          <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#777] sm:text-[8px]">
            COLLECTION INVENTORY
          </div>

        </div>

        {/* Completed */}
        <div className="border-r border-[#303030] p-4 sm:p-6">

          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#888] sm:text-[9px]">
            SETS COMPLETED
          </div>

          <div className="mt-2 text-2xl font-black leading-none text-white sm:text-4xl">
            {userStats.completed}
          </div>

          <div className="mt-4 h-1 bg-[#292929]">
            <div className="h-full w-3/4 bg-[#FFD43B]" />
          </div>

          <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#777] sm:text-[8px]">
            COLLECTION MILESTONES
          </div>

        </div>

        {/* Listings */}
        <div className="p-4 sm:p-6">

          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#888] sm:text-[9px]">
            ACTIVE LISTINGS
          </div>

          <div className="mt-2 text-2xl font-black leading-none text-white sm:text-4xl">
            {userStats.trades}
          </div>

          <div className="mt-4 h-1 bg-[#292929]">
            <div className="h-full w-1/2 bg-[#FFD43B]" />
          </div>

          <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#777] sm:text-[8px]">
            TRADE + SALE INVENTORY
          </div>

        </div>

      </div>
    </section>

    {/* ============================================================
        COLLECTION DATABASE
    ============================================================ */}
    <section className="mt-4 border border-[#363636] bg-[#181818]">

      {/* Database header */}
      <div className="flex flex-col gap-3 border-b border-[#303030] bg-[#202020] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

        <div>
          <div className="flex items-center gap-3">

            <div className="h-2 w-2 bg-[#FFD43B]" />

            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white">
              COLLECTOR DATABASE
            </span>

          </div>

          <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.25em] text-[#888]">
            INVENTORY / TRADING / WISHLIST
          </div>
        </div>

        <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
          NODE ACTIVE
        </div>

      </div>

      {/* Main section tabs */}
      <div className="grid grid-cols-3 border-b border-[#303030]">

        <button
          onClick={() => {
            setSelectedSection("iso");
            setSelectedSet("");
          }}
          className={`
            relative
            border-r
            border-[#303030]
            px-2
            py-4
            font-mono
            text-[8px]
            font-bold
            uppercase
            tracking-[0.18em]
            transition-all
            sm:text-[9px]
            ${
              selectedSection === "iso"
                ? "bg-[#252525] text-[#FFD43B]"
                : "bg-[#1A1A1A] text-[#666] hover:bg-[#222] hover:text-white"
            }
          `}
        >
          {selectedSection === "iso" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD43B]" />
          )}

          ISO
        </button>

        <button
          onClick={() => {
            setSelectedSection("trade");
            setSelectedSet("");
          }}
          className={`
            relative
            border-r
            border-[#303030]
            px-2
            py-4
            font-mono
            text-[8px]
            font-bold
            uppercase
            tracking-[0.18em]
            transition-all
            sm:text-[9px]
            ${
              selectedSection === "trade"
                ? "bg-[#252525] text-[#FFD43B]"
                : "bg-[#1A1A1A] text-[#666] hover:bg-[#222] hover:text-white"
            }
          `}
        >
          {selectedSection === "trade" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD43B]" />
          )}

          TRADES
        </button>

        <button
          onClick={() => {
            setSelectedSection("wishlist");
            setSelectedSet("");
          }}
          className={`
            relative
            px-2
            py-4
            font-mono
            text-[8px]
            font-bold
            uppercase
            tracking-[0.18em]
            transition-all
            sm:text-[9px]
            ${
              selectedSection === "wishlist"
                ? "bg-[#252525] text-[#FFD43B]"
                : "bg-[#1A1A1A] text-[#666] hover:bg-[#222] hover:text-white"
            }
          `}
        >
          {selectedSection === "wishlist" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD43B]" />
          )}

          WISHLIST
        </button>

      </div>

      {/* ==========================================================
          ISO
      ========================================================== */}
      {selectedSection === "iso" ? (
        userProfileSettings.hide_iso ? (

          <div className="p-8 text-center sm:p-12">

            <div className="mx-auto mb-4 h-8 w-8 border border-[#3A3A3A] bg-[#202020]" />

            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#777]">
              ISO DATA RESTRICTED
            </div>

            <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
              THIS COLLECTOR HAS HIDDEN THEIR ISO
            </p>

          </div>

        ) : (
          <>

            {/* Set selector */}
            <div className="border-b border-[#303030] bg-[#191919] p-3 sm:p-4">

              <div className="mb-3 flex items-center justify-between">

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#888]">
                  SELECT SET
                </span>

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
                  {ISO_SET_TABS.length} AVAILABLE
                </span>

              </div>

              <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible sm:overflow-y-visible">

                {ISO_SET_TABS.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => setSelectedSet(set.id)}
                    className={`
                      shrink-0
                      border
                      px-3
                      py-2
                      font-mono
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      transition-all
                      sm:text-[8px]
                      ${
                        selectedSet === set.id
                          ? "border-[#FFD43B] bg-[#FFD43B] text-[#151515]"
                          : "border-[#383838] bg-[#202020] text-[#777] hover:border-[#666] hover:text-white"
                      }
                    `}
                  >
                    {set.name}
                  </button>
                ))}

              </div>
            </div>

            {/* ISO cards */}
            <div className="p-3 sm:p-5">

              {userIsoCards.length === 0 ? (
                <div className="py-12 text-center">

                  <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#888]">
                    NO ISO DATA
                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 sm:gap-3">

                  {filteredIsoCards.map((card) => (
                    <div
                      key={`${card.set_id}-${card.card_key}`}
                      onClick={() => setQuickViewCard(card)}
                      className={`
                        group
                        relative
                        cursor-pointer
                        overflow-hidden
                        rounded-md
                        border
                        border-[#303030]
                        bg-[#111111]
                        transition-all
                        duration-200
                        hover:-translate-y-1
                        hover:border-[#FFD43B]
                        hover:shadow-[0_8px_30px_rgba(0,0,0,.45)]
                        ${
                          isMoon3DoubleWide(card)
                            ? "col-span-2"
                            : ""
                        }
                      `}
                    >

                      <div className="absolute left-0 top-0 z-10 h-0 w-full bg-[#FFD43B] transition-all group-hover:h-0.5" />

                      <img
                        src={getTradeCardImage(card)}
                        alt={card.card_key}
                        className={`
                          block
                          w-full
                          transition-transform
                          duration-200
                          ${
                            String(card.set_id) === "12" ||
                            String(card.set_id) === "FW" ||
                            String(card.set_id) === "SD" ||
                            String(card.set_id) === "tcgpromos"
                              ? ""
                              : "scale-[1.055]"
                          }
                          ${
                            isMoon3DoubleWide(card)
                              ? "h-auto object-contain"
                              : String(card.set_id) === "tcgpromos" &&
                                ["RR09", "RR10", "RR11", "RR12"].includes(
                                  String(card.card_key)
                                )
                              ? "h-full object-cover object-center"
                              : "h-full object-contain"
                          }
                        `}
                      />

                    </div>
                  ))}

                </div>
              )}

            </div>
          </>
        )

      /* ==========================================================
         TRADES
      ========================================================== */
      ) : selectedSection === "trade" ? (
        <>

          <div className="border-b border-[#303030] bg-[#191919] p-3 sm:p-4">

            <div className="mb-3 flex items-center justify-between">

              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#888]">
                LISTING SET
              </span>

              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
                TRADE / SALE
              </span>

            </div>

            <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible sm:overflow-y-visible">

              {TRADE_SET_TABS.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSet(set.id)}
                  className={`
                    shrink-0
                    border
                    px-3
                    py-2
                    font-mono
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    transition-all
                    sm:text-[8px]
                    ${
                      selectedSet === set.id
                        ? "border-[#FFD43B] bg-[#FFD43B] text-[#151515]"
                        : "border-[#383838] bg-[#202020] text-[#777] hover:border-[#666] hover:text-white"
                    }
                  `}
                >
                  {set.name}
                </button>
              ))}

            </div>
          </div>

          <div className="p-3 sm:p-5">

            {filteredTradeCards.length === 0 ? (
              <div className="py-12 text-center">

                <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#888]">
                  NO ACTIVE LISTINGS
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 sm:gap-3">

                {filteredTradeCards.map((card) => (
                  <div
                    key={`${card.set_id}-${card.card_key}`}
                    onClick={() => setQuickViewCard(card)}
                    className={`
                      group
                      relative
                      cursor-pointer
                      overflow-hidden
                      rounded-md
                      border
                      border-[#303030]
                      bg-[#111111]
                      transition-all
                      duration-200
                      hover:-translate-y-1
                      hover:border-[#FFD43B]
                      hover:shadow-[0_8px_30px_rgba(0,0,0,.5)]
                      ${
                        isMoon3DoubleWide(card)
                          ? "col-span-2"
                          : ""
                      }
                    `}
                  >

                    {/* Listing indicator */}
                    <div
                      className={`
                        absolute
                        left-2
                        top-2
                        z-10
                        border
                        px-2
                        py-1
                        font-mono
                        text-[6px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        ${
                          card.type === "trade"
                            ? "border-[#FFD43B]/60 bg-[#151515]/90 text-[#FFD43B]"
                            : "border-green-400/50 bg-[#151515]/90 text-green-400"
                        }
                      `}
                    >
                      {card.type === "trade" ? "TRADE" : "SALE"}
                    </div>

                    <div
                      className={`
                        bg-[#111111]
                        ${
                          !isMoon3DoubleWide(card) &&
                          String(card.set_id) === "tcgpromos" &&
                          ["RR09", "RR10", "RR11", "RR12"].includes(
                            String(card.card_key)
                          )
                            ? "aspect-[63/88]"
                            : ""
                        }
                      `}
                    >

                      <img
                        src={getTradeCardImage(card)}
                        alt={card.card_key}
                        className={`
                          block
                          w-full
                          transition-transform
                          duration-200
                          group-hover:scale-[1.015]
                          ${
                            String(card.set_id) === "12" ||
                            String(card.set_id) === "FW" ||
                            String(card.set_id) === "SD" ||
                            String(card.set_id) === "tcgpromos"
                              ? ""
                              : "scale-[1.055]"
                          }
                          ${
                            isMoon3DoubleWide(card)
                              ? "h-auto object-contain"
                              : String(card.set_id) === "tcgpromos" &&
                                ["RR09", "RR10", "RR11", "RR12"].includes(
                                  String(card.card_key)
                                )
                              ? "h-full object-cover object-center"
                              : "h-full object-contain"
                          }
                        `}
                      />

                    </div>

                    <div className="border-t border-[#2D2D2D] bg-[#191919] px-2 py-2">

                      <div className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-[#888] sm:text-[8px]">
                        {getSetName(String(card.set_id))}
                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>
        </>

      /* ==========================================================
         WISHLIST
      ========================================================== */
      ) : (
        userProfileSettings.hide_wishlist ? (

          <div className="p-8 text-center sm:p-12">

            <div className="mx-auto mb-4 h-8 w-8 border border-[#3A3A3A] bg-[#202020]" />

            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#777]">
              WISHLIST DATA RESTRICTED
            </div>

            <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
              THIS COLLECTOR HAS HIDDEN THEIR WISHLIST
            </p>

          </div>

        ) : (
          <>

            <div className="border-b border-[#303030] bg-[#191919] p-3 sm:p-4">

              <div className="mb-3 flex items-center justify-between">

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#888]">
                  WISHLIST SET
                </span>

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#777]">
                  TARGET CARDS
                </span>

              </div>

              <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible sm:overflow-y-visible">

                {WISHLIST_SET_TABS.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => setSelectedSet(set.id)}
                    className={`
                      shrink-0
                      border
                      px-3
                      py-2
                      font-mono
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      transition-all
                      sm:text-[8px]
                      ${
                        selectedSet === set.id
                          ? "border-[#FFD43B] bg-[#FFD43B] text-[#151515]"
                          : "border-[#383838] bg-[#202020] text-[#777] hover:border-[#666] hover:text-white"
                      }
                    `}
                  >
                    {set.name}
                  </button>
                ))}

              </div>
            </div>

            <div className="p-3 sm:p-5">

              {filteredWishlistCards.length === 0 ? (
                <div className="py-12 text-center">

                  <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#888]">
                    WISHLIST EMPTY
                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 sm:gap-3">

                  {filteredWishlistCards.map((card) => (
                    <div
                      key={`${card.set_id}-${card.card_key}`}
                      onClick={() => setQuickViewCard(card)}
                      className={`
                        group
                        relative
                        cursor-pointer
                        overflow-hidden
                        rounded-md
                        border
                        border-[#303030]
                        bg-[#111111]
                        transition-all
                        duration-200
                        hover:-translate-y-1
                        hover:border-[#FFD43B]
                        hover:shadow-[0_8px_30px_rgba(0,0,0,.45)]
                        ${
                          isMoon3DoubleWide(card)
                            ? "col-span-2"
                            : ""
                        }
                      `}
                    >

                      <div className="absolute left-0 top-0 h-0 w-full bg-[#FFD43B] transition-all group-hover:h-0.5" />

                      <img
                        src={getTradeCardImage(card)}
                        alt={card.card_key}
                        className={`
                          block
                          h-full
                          w-full
                          object-contain
                          transition-transform
                          duration-200
                          group-hover:scale-[1.015]
                          ${
                            String(card.set_id) === "12" ||
                            String(card.set_id) === "FW" ||
                            String(card.set_id) === "SD" ||
                            String(card.set_id) === "tcgpromos"
                              ? ""
                              : "scale-[1.055]"
                          }
                        `}
                      />

                    </div>
                  ))}

                </div>
              )}

            </div>
          </>
        )
      )}

    </section>

    {/* ============================================================
        QUICK VIEW
    ============================================================ */}
    {quickViewCard && (
      <div
        className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          bg-[#090909]/95
          p-4
          backdrop-blur-md
          sm:p-8
        "
        onClick={() => setQuickViewCard(null)}
      >

        {/* Technical frame */}
        <div className="absolute left-4 top-4 h-12 w-12 border-l border-t border-[#FFD43B]/60 sm:left-8 sm:top-8" />
        <div className="absolute bottom-4 right-4 h-12 w-12 border-b border-r border-[#FFD43B]/60 sm:bottom-8 sm:right-8" />

        <button
          onClick={() => setQuickViewCard(null)}
          className="
            absolute
            right-5
            top-5
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            border
            border-[#3A3A3A]
            bg-[#191919]
            font-mono
            text-xl
            text-[#777]
            transition-all
            hover:border-[#FFD43B]
            hover:text-[#FFD43B]
            sm:right-8
            sm:top-8
          "
        >
          ×
        </button>

        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            relative
            overflow-hidden
            border
            border-[#444]
            bg-[#151515]
            shadow-[0_30px_100px_rgba(0,0,0,.75)]
            ${
              isMoon3DoubleWide(quickViewCard)
                ? "w-[min(92vw,900px)]"
                : "w-[min(88vw,650px)]"
            }
          `}
        >

          {/* Top technical bar */}
          <div className="flex items-center justify-between border-b border-[#303030] bg-[#1D1D1D] px-4 py-3">

            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#FFD43B]">
              CARD INSPECTION
            </span>

          </div>

          <div className="bg-[#0D0D0D] p-3 sm:p-5">

            <img
              src={getTradeCardImage(quickViewCard)}
              alt={quickViewCard.card_key}
              className="mx-auto block max-h-[72vh] max-w-full object-contain lg:max-h-[58vh]"
            />

          </div>

          {/* Bottom metadata */}
          <div className="flex items-center justify-between border-t border-[#303030] bg-[#1D1D1D] px-4 py-3">

            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#888]">
              {getSetName(String(quickViewCard.set_id))}
            </span>

          </div>

        </div>
      </div>
    )}

  </div>
);
};

export default ExploreProfile;
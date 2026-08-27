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
const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
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
const { data: tradingProfileData } = await supabase
  .from("trading_profiles")
  .select("discord_username")
  .eq("user_id", user.id)
  .maybeSingle();
setDiscordUsername(tradingProfileData?.discord_username || "");
const { data: activityData } = await supabase
  .from("user_activity")
  .select("last_activity_at")
  .eq("user_id", user.id)
  .maybeSingle();
setLastActivityAt(activityData?.last_activity_at || null);
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
const { data: isoProgress } = await supabase
      .from("collection_progress")
      .select("set_id, progress")
      .eq("user_id", user.id);
const { data: isoStatusRows } = await supabase
      .from("iso_status")
      .select("card_key, status")
      .eq("user_id", user.id);
const inProgressCards = new Set(
      (isoStatusRows || [])
        .filter(
          (row: any) =>
            row.status === "trade_in_progress" ||
            row.status === "purchase_in_progress"
        )
        .map((row: any) => String(row.card_key))
    );
const ownedCards: Record<string, boolean> = {};
    (isoProgress || []).forEach((set: any) => {
      Object.entries(set.progress || {}).forEach(([key, value]) => {
        if (value) {
          ownedCards[`${set.set_id}-${key}`] = true;
        }
      });
    });
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
let completed = 0;
const progressMap = new Map(
      (isoProgress || []).map((row: any) => [String(row.set_id), row])
    );
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
const activityStatus = (() => {
  if (!lastActivityAt) {
    return {
      label: "Inactive",
      lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
      darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
      dotClass: "bg-zinc-400",
    };
  }
const age = Date.now() - new Date(lastActivityAt).getTime();
  if (age <= 24 * 60 * 60 * 1000) {
    return {
      label: "Active in the last 24 Hours",
      lightClass: "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-800",
      darkClass: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
      dotClass: "bg-emerald-500",
    };
  }
  if (age <= 7 * 24 * 60 * 60 * 1000) {
    return {
      label: "Active in the last 7 Days",
      lightClass: "border-[#8a6a00]/20 bg-[#c89d13]/10 text-[#725700]",
      darkClass: "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]",
      dotClass: "bg-[#FFD54A]",
    };
  }
  return {
    label: "Inactive",
    lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
    darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
    dotClass: "bg-zinc-400",
  };
})();
useEffect(() => {
const syncTheme = () => {
    setIsLightMode(document.documentElement.dataset.theme === "light");
  };
  syncTheme();
const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  return () => observer.disconnect();
}, []);
const isJacob =
  user?.id === "94a1c998-d040-4dd2-b2fb-5f606287139d";
return (
  <div className={`w-full transition-colors duration-200 ${
    isLightMode ? "text-zinc-900" : "text-white"
  }`}>
    <section className={`relative overflow-hidden rounded-[30px] border ${
      isLightMode
        ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]"
        : "border-white/[0.08] bg-[#151718]"
    }`}>
      <div
        className={`absolute inset-0 bg-cover bg-center ${
          isLightMode ? "opacity-[0.08]" : "opacity-[0.07]"
        }`}
        style={{ backgroundImage: "url('/website-assets/exploreequestria.webp')" }}
      />
      <div className={`absolute inset-0 ${
        isLightMode
          ? "bg-gradient-to-r from-white via-white/95 to-white/80"
          : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/80"
      }`} />
      <div className="relative p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              isLightMode
                ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100"
                : "border-white/10 bg-black/20 text-zinc-300 hover:bg-white/[0.06]"
            }`}
          >
            ← Back
          </button>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isLightMode ? activityStatus.lightClass : activityStatus.darkClass
          }`}>
            <span className={`h-2 w-2 rounded-full ${activityStatus.dotClass}`} />
            {activityStatus.label}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[80px_minmax(0,1fr)] items-start gap-3 sm:mt-6 sm:flex sm:items-center sm:gap-5">
          <img
            src={avatar}
            alt={user?.username}
            className={`h-20 w-20 rounded-[22px] border object-cover sm:h-28 sm:w-28 sm:rounded-[26px] ${
              isLightMode ? "border-black/10" : "border-white/10"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className={`min-w-0 break-words text-2xl font-semibold leading-tight tracking-tight sm:text-4xl ${
                  isLightMode ? "text-zinc-950" : "text-white"
                }`}
              >
                {user?.username}
              </h1>
              {badge && (
                <img
                  src={badge.badge}
                  alt={badge.label}
                  title={badge.label}
                  className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"
                />
              )}
            </div>
            {discordUsername && (
              <div
                className={`mt-1 text-xs sm:mt-2 sm:text-sm ${
                  isLightMode ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                Discord:{" "}
                <span
                  className={
                    isLightMode
                      ? "font-medium text-[#725700]"
                      : "font-medium text-[#FFE27A]"
                  }
                >
                  {discordUsername}
                </span>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2 sm:mt-4">
              {currentUserId !== user.id && (
                <button
                  type="button"
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
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
                    alreadyFriends
                      ? isLightMode
                        ? "bg-[#c89d13]/15 text-[#725700]"
                        : "bg-[#FFD54A]/10 text-[#FFE27A]"
                      : notAcceptingRequests
                      ? isLightMode
                        ? "cursor-not-allowed bg-red-700/[0.06] text-red-700"
                        : "cursor-not-allowed bg-red-500/[0.08] text-red-400"
                      : requestPending
                      ? isLightMode
                        ? "cursor-not-allowed bg-zinc-100 text-zinc-500"
                        : "cursor-not-allowed bg-white/[0.05] text-zinc-500"
                      : "bg-[#FFD54A] text-black hover:bg-[#FFE27A]"
                  }`}
                >
                  {alreadyFriends
                    ? "Manage Friendship"
                    : notAcceptingRequests
                    ? "Requests Disabled"
                    : requestPending
                    ? "Request Pending"
                    : sendingRequest
                    ? "Sending..."
                    : "Add Friend"}
                </button>
              )}
              <button
                type="button"
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
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
                  isLightMode
                    ? "border-black/10 bg-white/70 text-zinc-700 hover:bg-zinc-100"
                    : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                {copied ? "Link Copied" : "Share Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="mt-4 grid grid-cols-3 gap-3">
      {[
        ["Cards Owned", userStats.owned.toLocaleString()],
        ["Sets Completed", userStats.completed],
        ["Listings", userStats.trades],
      ].map(([label, value]) => (
        <div
          key={label}
          className={`rounded-2xl border p-4 sm:p-5 ${
            isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold sm:text-3xl">{value}</div>
        </div>
      ))}
    </section>
    <section className={`mt-4 overflow-hidden rounded-[28px] border ${
      isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
    }`}>
      <div className={`grid grid-cols-3 border-b ${
        isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"
      }`}>
        {[
          ["iso", "ISO"],
          ["trade", "Trades"],
          ["wishlist", "Wishlist"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setSelectedSection(key as "iso" | "trade" | "wishlist");
              setSelectedSet("");
            }}
            className={`px-3 py-3.5 text-sm font-semibold transition-colors ${
              selectedSection === key
                ? isLightMode
                  ? "bg-[#c89d13]/10 text-[#725700]"
                  : "bg-[#FFD54A]/10 text-[#FFE27A]"
                : isLightMode
                ? "text-zinc-500 hover:bg-zinc-50"
                : "text-zinc-500 hover:bg-white/[0.04]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {selectedSection === "iso" ? (
        userProfileSettings.hide_iso ? (
          <div className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
            This Superfan has hidden their ISO.
          </div>
        ) : (
          <>
            <div className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
              <div className="flex flex-wrap gap-2">
                {ISO_SET_TABS.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => setSelectedSet(set.id)}
                    className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                      selectedSet === set.id
                        ? isLightMode
                          ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                          : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"
                        : isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-600"
                        : "border-white/10 bg-white/[0.04] text-zinc-400"
                    }`}
                  >
                    {set.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 sm:p-5">
              {filteredIsoCards.length === 0 ? (
                <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                  No cards to show.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                  {filteredIsoCards.map((card) => (
                    <button
                      key={`${card.set_id}-${card.card_key}`}
                      type="button"
                      onClick={() => setQuickViewCard(card)}
                      className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${
                        isMoon3DoubleWide(card) ? "col-span-2" : ""
                      }`}
                    >
                      <img
                        src={getTradeCardImage(card)}
                        alt={card.card_key}
                        className={`block h-full w-full ${
                          String(card.set_id) === "12" ||
                          String(card.set_id) === "FW" ||
                          String(card.set_id) === "SD" ||
                          String(card.set_id) === "tcgpromos"
                            ? "object-contain"
                            : "scale-[1.05] object-cover"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )
      ) : selectedSection === "trade" ? (
        <>
          <div className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
            <div className="flex flex-wrap gap-2">
              {TRADE_SET_TABS.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => setSelectedSet(set.id)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                    selectedSet === set.id
                      ? isLightMode
                        ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                        : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"
                      : isLightMode
                      ? "border-black/10 bg-zinc-50 text-zinc-600"
                      : "border-white/10 bg-white/[0.04] text-zinc-400"
                  }`}
                >
                  {set.name}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 sm:p-5">
            {filteredTradeCards.length === 0 ? (
              <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                No listings to show.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                {filteredTradeCards.map((card: any) => (
                  <button
                    key={`${card.set_id}-${card.card_key}-${card.type}`}
                    type="button"
                    onClick={() => setQuickViewCard(card)}
                    className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${
                      isMoon3DoubleWide(card) ? "col-span-2" : ""
                    }`}
                  >
                    <img
                      src={getTradeCardImage(card)}
                      alt={card.card_key}
                      className={`block h-full w-full ${
                        String(card.set_id) === "12" ||
                        String(card.set_id) === "FW" ||
                        String(card.set_id) === "SD" ||
                        String(card.set_id) === "tcgpromos"
                          ? "object-contain"
                          : "scale-[1.05] object-cover"
                      }`}
                    />
                    <span className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold ${
                      isLightMode ? "bg-white/90 text-zinc-700" : "bg-black/70 text-white"
                    }`}>
                      {card.type === "sale" ? "For Sale" : "Trade"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : userProfileSettings.hide_wishlist ? (
        <div className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
          This Superfan has hidden their wishlist.
        </div>
      ) : (
        <>
          <div className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
            <div className="flex flex-wrap gap-2">
              {WISHLIST_SET_TABS.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => setSelectedSet(set.id)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                    selectedSet === set.id
                      ? isLightMode
                        ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                        : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"
                      : isLightMode
                      ? "border-black/10 bg-zinc-50 text-zinc-600"
                      : "border-white/10 bg-white/[0.04] text-zinc-400"
                  }`}
                >
                  {set.name}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 sm:p-5">
            {filteredWishlistCards.length === 0 ? (
              <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                No wishlist cards to show.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                {filteredWishlistCards.map((card) => (
                  <button
                    key={`${card.set_id}-${card.card_key}`}
                    type="button"
                    onClick={() => setQuickViewCard(card)}
                    className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${
                      isMoon3DoubleWide(card) ? "col-span-2" : ""
                    }`}
                  >
                    <img
                      src={getTradeCardImage(card)}
                      alt={card.card_key}
                      className={`block h-full w-full ${
                        String(card.set_id) === "12" ||
                        String(card.set_id) === "FW" ||
                        String(card.set_id) === "SD" ||
                        String(card.set_id) === "tcgpromos"
                          ? "object-contain"
                          : "scale-[1.05] object-cover"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
    {quickViewCard && (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md ${
          isLightMode ? "bg-white/25" : "bg-black/80"
        }`}
        onClick={() => setQuickViewCard(null)}
      >
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`relative overflow-hidden rounded-[20px] bg-transparent ${
            isMoon3DoubleWide(quickViewCard)
              ? "w-[min(92vw,850px)]"
              : "w-[min(82vw,425px)]"
          }`}
        >
          <img
            src={getTradeCardImage(quickViewCard)}
            alt={quickViewCard.card_key}
            className={`block max-h-[76vh] w-full bg-transparent ${
              String(quickViewCard.set_id) === "12" ||
              String(quickViewCard.set_id) === "FW" ||
              String(quickViewCard.set_id) === "SD" ||
              String(quickViewCard.set_id) === "tcgpromos"
                ? "object-contain"
                : "scale-[1.05] object-cover"
            }`}
          />
        </button>
      </div>
    )}
  </div>
);
};
export default ExploreProfile;
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Messages from "./messages";
import avatar001 from "@/assets/avatars/avatar001.webp";
import avatar002 from "@/assets/avatars/avatar002.webp";
import avatar003 from "@/assets/avatars/avatar003.webp";
import avatar004 from "@/assets/avatars/avatar004.webp";
import avatar005 from "@/assets/avatars/avatar005.webp";
import avatar006 from "@/assets/avatars/avatar006.webp";
import avatar007 from "@/assets/avatars/avatar007.webp";
import avatar008 from "@/assets/avatars/avatar008.webp";
import avatar009 from "@/assets/avatars/avatar009.webp";
import avatar010 from "@/assets/avatars/avatar010.webp";
import avatar011 from "@/assets/avatars/avatar011.webp";
import avatar012 from "@/assets/avatars/avatar012.webp";
import avatar013 from "@/assets/avatars/avatar013.webp";
import avatar014 from "@/assets/avatars/avatar014.webp";
import avatar015 from "@/assets/avatars/avatar015.webp";
import avatar016 from "@/assets/avatars/avatar016.webp";
import avatar017 from "@/assets/avatars/avatar017.webp";
import avatar018 from "@/assets/avatars/avatar018.webp";
import avatar019 from "@/assets/avatars/avatar019.webp";
import avatar020 from "@/assets/avatars/avatar020.webp";
import avatar021 from "@/assets/avatars/avatar021.webp";
import avatar022 from "@/assets/avatars/avatar022.webp";
import avatar023 from "@/assets/avatars/avatar023.webp";
import avatar024 from "@/assets/avatars/avatar024.webp";
import avatar025 from "@/assets/avatars/avatar025.webp";
import avatar026 from "@/assets/avatars/avatar026.webp";
import avatar027 from "@/assets/avatars/avatar027.webp";
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import KeeganAvatar2 from "@/assets/avatars/keeganpfpnmn.webp";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";

const avatarMap: Record<string, string> = {
  avatar001,
  avatar002,
  avatar003,
  avatar004,
  avatar005,
  avatar006,
  avatar007,
  avatar008,
  avatar009,
  avatar010,
  avatar011,
  avatar012,
  avatar013,
  avatar014,
  avatar015,
  avatar016,
  avatar017,
  avatar018,
  avatar019,
  avatar020,
  avatar021,
  avatar022,
  avatar023,
  avatar024,
  avatar025,
  avatar026,
  avatar027,
  heimantouavatar: heimantouAvatar,
  keeganpfpnmn: KeeganAvatar2,
  "keeganpfpnmn.webp": KeeganAvatar2,
  KeeganAvatar,
  keeganpfp: KeeganAvatar,
  maipfp,
  "maipfp.webp": maipfp,
  TerriAvatar,
  terrypfp: TerriAvatar,
};

const VERIFIED_USERS: Record<
  string,
  {
    badge: string;
    label: string;
  }
> = {
  "17e57e39-bc0c-44e7-b373-ac34c6690185": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "94a1c998-d040-4dd2-b2fb-5f606287139d": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "408a516c-ee80-4ff8-a869-493e1fd5d961": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "6247b70d-3f55-493c-8eee-3badedf581db": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  "2e62bcda-f311-42a1-bf32-cfe74a43d3ef": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  "325585dd-c617-4dd2-8314-d608273cd5f6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
  "22f7a392-b5b5-4aec-a3b3-6546071593fd": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
};

interface FriendsProfilesProps {
  user: any;
  tradingProfile: any;
  onClose: () => void;
}

const FriendsProfiles = ({
  user,
  tradingProfile,
  onClose,
}: FriendsProfilesProps) => {

    const [userStats, setuserStats] = useState({
  trades: 0,
  owned: 0,
  completed: 0,
});

const [userTradeCards, setuserTradeCards] = useState<any[]>([]);
const [userPurchaseCards, setuserPurchaseCards] = useState<any[]>([]);
const [userIsoCards, setuserIsoCards] = useState<any[]>([]);
const [userWishlistCards, setuserWishlistCards] = useState<any[]>([]);

const [userProfileSettings, setuserProfileSettings] =
  useState({
    hide_iso: false,
    hide_wishlist: false,
  });

const [userTab, setuserTab] =
  useState<"trades" | "purchases" | "iso" | "wishlist">("trades");

const [collapsedSets, setCollapsedSets] =
  useState<Record<string, boolean>>({});
  const [selectedSet, setSelectedSet] = useState("ALL");
const [selectedSection, setSelectedSection] =
  useState<"iso" | "trade" | "wishlist">("iso");

const [quickViewCard, setQuickViewCard] = useState<any>(null);
const [currentUserId, setCurrentUserId] = useState("");
const [sendingRequest, setSendingRequest] = useState(false);
const [requestPending, setRequestPending] = useState(false);
const [isFriend, setIsFriend] = useState(false);
const [friendNickname, setFriendNickname] = useState("");
const [showMessages, setShowMessages] = useState(false);
const [unreadMessages, setUnreadMessages] = useState(0);

  const avatar =
    avatarMap[String(user?.avatar_url || "").trim()] || avatar001;

  const badge = VERIFIED_USERS[user?.id];

  useEffect(() => {
  if (!user?.id) return;

  async function loadProfile() {

    const {
  data: { session },
} = await supabase.auth.getSession();

setCurrentUserId(session?.user?.id || "");

if (session?.user) {
  const { data: nicknameRow } = await supabase
    .from("friend_nicknames")
    .select("nickname")
    .eq("user_id", session.user.id)
    .eq("friend_id", user.id)
    .maybeSingle();

  setFriendNickname(nicknameRow?.nickname ?? "");
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

if (session?.user && session.user.id !== user.id) {
  const { data: friendship } = await supabase
    .from("friends")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("friend_id", user.id)
    .maybeSingle();

  setIsFriend(!!friendship);
}

if (session?.user && session.user.id !== user.id) {
const { data: unread } = await supabase
  .from("messages")
  .select("id")
  .eq("sender", user.id)
  .eq("receiver", session.user.id)
  .is("read_at", null);

const count = unread?.length ?? 0;

setUnreadMessages(count);

window.dispatchEvent(
  new CustomEvent("header-message-update")
);
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
    
    
      // Load active trades
      const { data: tradeCards } = await supabase
        .from("for_trade")
          .select("set_id, card_key, listing_type")
        .eq("user_id", user.id);
    
    setuserTradeCards(
      (tradeCards || []).filter(
        (card: any) =>
          (card.listing_type || "trade") === "trade"
      )
    );
    
    setuserPurchaseCards(
      (tradeCards || []).filter(
        (card: any) =>
          card.listing_type === "purchase"
      )
    );
    
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
    
    setuserWishlistCards(
      [...wishlistCards].sort((a, b) => {
        const setOrder = [
          "1",
          "2",
          "5",
          "7",
          "8",
          "3",
          "11",
          "9",
          "FW",
          "SD",
          "friendshipsbegin",
          "tcgpromos",
        ];
    
        const setIndexA = setOrder.indexOf(String(a.set_id));
        const setIndexB = setOrder.indexOf(String(b.set_id));
    
        if (setIndexA !== setIndexB) {
          return (
            (setIndexA === -1 ? 999 : setIndexA) -
            (setIndexB === -1 ? 999 : setIndexB)
          );
        }
    
        const extractNumber = (card: any) => {
          const match = String(card.card_key).match(/(\d+)(?!.*\d)/);
          return match ? parseInt(match[1], 10) : 0;
        };
    
        return extractNumber(a) - extractNumber(b);
      })
    );
    
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
      { id: "4", rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }},
      { id: "5", rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 } },
      { id: "6", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 }},
      { id: "7", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 } },
      { id: "8", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 } },
      { id: "11", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 } },
      { id: "9", rarities: { PR: 6 } },
      { id: "SD", rarities: {} },
    { id: "FW", rarities: {} },
    { id: "12", rarities: {} },
    { id: "tcgpromos", rarities: {} },
    ];
    
    isoSets.forEach((set) => {
if (set.id === "9") {
  [
    "PR-1",
    "PR-2",
    "PR-3",
    "PR-4",
    "PR-5",
    "PR-7",
    "PR-8",
    "PR-9",
    "PR-10",
    "PR-11",
    "PR-12",
    "PR-13",
  ].forEach((cardKey) => {
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

if (set.id === "12") {
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
    for (let i = 1; i <= count; i++) {
      let cardKey: string;

      if (prefix === "BP02-PER") {
        const number = ((i - 1) % 6) + 1;
        const variant = i <= 6 ? "A2" : "B2";
        cardKey = `BP02-PER${String(number).padStart(2, "0")}-${variant}`;
      } else {
        cardKey = `${prefix}${String(i).padStart(2, "0")}`;
      }

      const fullKey = `12-${cardKey}`;

      if (
        !ownedCards[fullKey] &&
        !inProgressCards.has(fullKey)
      ) {
        isoCards.push({
          id: fullKey,
          set_id: "12",
          card_key: cardKey,
        });
      }
    }
  });

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
    
    setuserIsoCards(
      [...isoCards].sort((a, b) => {
        const setOrder = [
          "1",
          "2",
          "5",
          "7",
          "8",
          "3",
          "11",
          "4",
          "6",
          "FW",
          "SD",
          "friendshipsbegin",
          "12",
          "tcgpromos",
          "9",
        ];
    
        const rarityOrders: Record<string, string[]> = {
          "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
          "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
          "3": ["R", "SR", "SSR", "HR", "LSR", "UR", "SGR", "ZR", "SC", "SZR"],
          "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
          "5": ["R", "SR", "FR", "TR", "TGR", "MTR", "SSR", "UR", "USR", "XR"],
          "6": ["BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],
          "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
          "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
          "11": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR", "SCR" ],
          "9": ["PR"],
          "tcgpromos": ["PR"],
          "12": [
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
  "※RR",
],
          "FW": [
            "C", "U", "ER", "SR", "SPR", "GR", "CR", "RR",
            "※ER", "※SPR", "※GR", "※CR", "※RR",
          ],
    
          "SD": [
            "C", "U", "SR", "SPR", "GR", "CR", "ER",
            "※ER", "※RR",
          ],
    
          "friendshipsbegin": [
            "C", "U", "SR", "SPR", "GR", "CR", "ER",
            "※ER", "※RR",
          ],
        };
    
    const extractRarity = (card: any) => {
      const setId = String(card.set_id);
      const key = String(card.card_key);
    
      // Standard checklist sets
if (
  setId !== "FW" &&
  setId !== "SD" &&
  setId !== "friendshipsbegin" &&
  setId !== "tcgpromos" &&
  setId !== "12"
) {
  return key.split("-")[0];
}
    
      // TCG Promos
      if (setId === "tcgpromos") {
        return "PR";
      }
    
      // Explicit prefix checks (prevents PRR from being mistaken for RR)
      if (key.includes("PSPR")) return "※SPR";
      if (key.includes("PCR")) return "※CR";
      if (key.includes("PGR")) return "※GR";
      if (key.includes("PER")) return "※ER";
      if (key.includes("PRR")) return "※RR";
    
      if (key.includes("SPR")) return "SPR";
      if (key.includes("GR")) return "GR";
      if (key.includes("CR")) return "CR";
      if (key.includes("RR")) return "RR";
      if (key.includes("SR")) return "SR";
      if (key.includes("ER")) return "ER";
      if (key.includes("U")) return "U";
      if (key.includes("C")) return "C";
    
      return "OTHER";
    };
    
        const extractNumber = (card: any) => {
          const match = String(card.card_key).match(/(\d+)(?!.*\d)/);
          return match ? parseInt(match[1], 10) : 0;
        };
    
        const setIndexA = setOrder.indexOf(String(a.set_id));
        const setIndexB = setOrder.indexOf(String(b.set_id));
    
        if (setIndexA !== setIndexB) {
          return (
            (setIndexA === -1 ? 999 : setIndexA) -
            (setIndexB === -1 ? 999 : setIndexB)
          );
        }
    
        const currentOrder =
          rarityOrders[String(a.set_id)] || [];
    
        const rarityA = extractRarity(a);
        const rarityB = extractRarity(b);
    
        const rarityIndexA = currentOrder.indexOf(rarityA);
        const rarityIndexB = currentOrder.indexOf(rarityB);
    
        if (rarityIndexA !== rarityIndexB) {
          return (
            (rarityIndexA === -1 ? 999 : rarityIndexA) -
            (rarityIndexB === -1 ? 999 : rarityIndexB)
          );
        }
    
        return extractNumber(a) - extractNumber(b);
      })
    );
    
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
      { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, SZR:1 } },
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

  const channel = supabase
  .channel(`friend-profile-${user.id}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
    },
    () => {
      loadProfile();
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(channel);
};
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

function getTradeCardImage(card: any) {
  if (!card) return "";

// Friendships Begin
if (
  String(card.set_id) === "SD" ||
  String(card.set_id) === "friendshipsbegin"
) {
  const key = String(card.card_key)
    .replace(/^BONUS-/, "")
    .replace(/^STARTER-/, "");

  return `/friendships-begin/${key}.webp`;
}

// Discord

if (String(card.set_id) === "12") {
  return `/cards/discord/${card.card_key}.webp`;
}

// Fantasy Wonderland
if (String(card.set_id) === "FW") {
  const key = String(card.card_key);

  return key.startsWith("BP01ER")
    ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.webp`
    : key.startsWith("BP01PER")
    ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.webp`
    : `/fantasy-wonderland/${key}.webp`;
}

  if (card.set_id === "9") {
    const number = card.card_key.split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }
  if (card.set_id === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }

  const [rarityRaw, number] = card.card_key.split("-");
  const rarity =
    rarityRaw === "SHINING ZR" ? "SZR" : rarityRaw;

const config: Record<string, { folder: string; prefix: string }> = {
  "1": { folder: "first-edition-moon", prefix: "M1" },
  "2": { folder: "second-edition-moon", prefix: "M2" },
  "3": { folder: "third-edition-moon", prefix: "M3" },
  "4": { folder: "star-one", prefix: "S1" },
  "5": { folder: "rainbow-one", prefix: "R1" },
  "6": { folder: "rainbow-two", prefix: "R2" },
  "7": { folder: "fun-moments-one", prefix: "FM1" },
  "8": { folder: "fun-moments-two", prefix: "FM2" },
  "11": { folder: "fun-moments-three", prefix: "FM3" },
};
  const c = config[String(card.set_id)];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(
  number
).padStart(3, "0")}${
  String(card.set_id) === "6" &&
  ["ST", "TR", "TGR"].includes(rarity)
    ? ".webp"
    : ".webp"
}`;
}

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
    alert("This collector isn't accepting friend requests.");
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
    "SD": "Friendships Begin",
    "friendshipsbegin": "Friendships Begin",
    "tcgpromos": "TCG Promos",
    "12": "Discord",
  };

  return names[String(setId)] || `Set ${setId}`;
}

const ISO_SET_TABS = [
  { id: "ALL", name: "All" },
  ...Array.from(
    new Set(userIsoCards.map((card) => String(card.set_id)))
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  })),
];

const filteredIsoCards =
  selectedSet === "ALL"
    ? userIsoCards
    : userIsoCards.filter(
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

const TRADE_SET_TABS = [
  { id: "ALL", name: "All" },
  ...Array.from(
    new Set(allTradeCards.map((card) => String(card.set_id)))
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  })),
];

const WISHLIST_SET_TABS = [
  { id: "ALL", name: "All" },
  ...Array.from(
    new Set(userWishlistCards.map((card) => String(card.set_id)))
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  })),
];

const filteredTradeCards =
  selectedSet === "ALL"
    ? allTradeCards
    : allTradeCards.filter(
        (card) => String(card.set_id) === selectedSet
      );

      const filteredWishlistCards =
  selectedSet === "ALL"
    ? userWishlistCards
    : userWishlistCards.filter(
        (card) => String(card.set_id) === selectedSet
      );
      

      const isJacob =
  user?.id === "94a1c998-d040-4dd2-b2fb-5f606287139d";

  return (
    <div className="w-full">
<div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-[#1b1b1b] shadow-2xl mb-8">

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,.12),transparent_55%)]" />

  <div className="relative p-8">

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

      <div className="flex items-center gap-6">

        <div className="relative shrink-0">

          <img
            src={avatar}
            alt={user?.username}
            className="w-36 h-36 rounded-full border-4 border-yellow-400 object-cover shadow-[0_0_30px_rgba(212,175,55,.35)]"
          />

          {isJacob &&
            [
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
                <svg width="18" height="42" viewBox="0 0 18 42" fill="none">
                  <path
                    d="M9 42C9 32 2 30 2 22C2 16 14 14 14 7C14 4 12 2 10 0"
                    stroke="#4ade80"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}

        </div>

        <div>


          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold text-white">
  {friendNickname || user?.username}
</h1>

            {badge && (
              <img
                src={badge.badge}
                alt={badge.label}
                title={badge.label}
                className="h-8 w-8"
              />
            )}

          </div>

          <p className="mt-3 text-lg text-slate-400">
            {tradingProfile?.discord_username || "No Discord Username"}
          </p>

{currentUserId !== user.id && (
  <div className="mt-6 flex items-center gap-3">

    <button
      onClick={!isFriend ? sendFriendRequest : undefined}
      disabled={isFriend || sendingRequest || requestPending}
      className={`rounded-xl px-6 py-3 font-semibold transition ${
        isFriend
          ? "bg-yellow-400 text-black cursor-default"
          : requestPending
          ? "bg-slate-600 text-white"
          : "bg-yellow-400 text-black hover:bg-yellow-300"
      }`}
    >
      {isFriend
        ? "Friends"
        : requestPending
        ? "Friend Request Pending"
        : sendingRequest
        ? "Sending..."
        : "Add Friend"}
    </button>

{isFriend && (
  <div className="relative">
    <button
      onClick={() => setShowMessages(true)}
      title="Messages"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b5b5b] text-white shadow-lg transition hover:scale-105 hover:bg-[#707070]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
      </svg>
    </button>

    {unreadMessages > 0 && (
      <div
        className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white"
      >
        {unreadMessages > 99 ? "99+" : unreadMessages}
      </div>
    )}
  </div>
)}

  </div>
)}

        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 w-full lg:w-auto">

        <div className="rounded-2xl border border-yellow-500/30 bg-[#232323] px-8 py-6 flex sm:block items-center justify-between text-center sm:text-center">
  <div className="text-lg sm:text-4xl font-bold text-yellow-400">
    {userStats.owned}
  </div>

  <div className="mt-0 sm:mt-2 text-sm text-slate-400">
    Cards
  </div>
</div>

<div className="rounded-2xl border border-yellow-500/30 bg-[#232323] px-8 py-6 flex sm:block items-center justify-between text-center sm:text-center">
  <div className="text-lg sm:text-4xl font-bold text-yellow-400">
    {userStats.completed}
  </div>

  <div className="mt-0 sm:mt-2 text-xs sm:text-sm text-slate-400">
    Mastersets
  </div>
</div>

<div className="rounded-2xl border border-yellow-500/30 bg-[#232323] px-8 py-6 flex sm:block items-center justify-between text-center sm:text-center">
  <div className="text-lg sm:text-4xl font-bold text-yellow-400">
    {userStats.trades}
  </div>

  <div className="mt-0 sm:mt-2 text-xs sm:text-sm text-slate-400">
    Listings
  </div>
</div>

      </div>

    </div>

  </div>

</div>


<div className="rounded-2xl border border-yellow-500/30 bg-[#323232] p-8 shadow-sm">

<div className="flex flex-wrap gap-3 mb-6">
<button
  onClick={() => setSelectedSection("iso")}
  className={`group relative overflow-hidden rounded-xl px-3 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
${
  selectedSection === "iso"
    ? "bg-[linear-gradient(180deg,#fff9cf_0%,#ffe875_15%,#ffd43b_35%,#ffc107_50%,#ffd84d_65%,#fff3a7_85%,#d89b00_100%)] shadow-[0_0_15px_rgba(255,193,7,.45)] hover:shadow-[0_0_25px_rgba(255,215,0,.8)] before:absolute before:top-0 before:-left-1/2 before:h-full before:w-1/3 before:rotate-12 before:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.85),transparent)] before:opacity-0 hover:before:left-[140%] hover:before:opacity-100 before:transition-all before:duration-700"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105"
}`}
>
    ISO
  </button>

  <button
    onClick={() => {
  setSelectedSection("trade");
  setSelectedSet("ALL");
}}
className={`group relative overflow-hidden rounded-xl px-3 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
${
  selectedSection === "trade"
    ? "bg-[linear-gradient(180deg,#fff9cf_0%,#ffe875_15%,#ffd43b_35%,#ffc107_50%,#ffd84d_65%,#fff3a7_85%,#d89b00_100%)] shadow-[0_0_15px_rgba(255,193,7,.45)] hover:shadow-[0_0_25px_rgba(255,215,0,.8)] before:absolute before:top-0 before:-left-1/2 before:h-full before:w-1/3 before:rotate-12 before:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.85),transparent)] before:opacity-0 hover:before:left-[140%] hover:before:opacity-100 before:transition-all before:duration-700"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105"
}`}
  >
    Trades & Sales
  </button>

  <button
    onClick={() => setSelectedSection("wishlist")}
className={`group relative overflow-hidden rounded-xl px-3 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
${
  selectedSection === "wishlist"
    ? "bg-[linear-gradient(180deg,#fff9cf_0%,#ffe875_15%,#ffd43b_35%,#ffc107_50%,#ffd84d_65%,#fff3a7_85%,#d89b00_100%)] shadow-[0_0_15px_rgba(255,193,7,.45)] hover:shadow-[0_0_25px_rgba(255,215,0,.8)] before:absolute before:top-0 before:-left-1/2 before:h-full before:w-1/3 before:rotate-12 before:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.85),transparent)] before:opacity-0 hover:before:left-[140%] hover:before:opacity-100 before:transition-all before:duration-700"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105"
}`}
  >
    Wishlist
  </button>
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
  key={card.id}
  onClick={() => setQuickViewCard(card)}
  className={`self-start cursor-pointer overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-white transition hover:scale-[1.02] ${
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
    className={`block w-full ${
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
      className={`block w-full ${
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
              key={card.id}
              onClick={() => setQuickViewCard(card)}
              className={`cursor-pointer overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-white transition hover:scale-[1.02] ${
                isMoon3DoubleWide(card) ? "col-span-2" : ""
              }`}
            >
              <img
                src={getTradeCardImage(card)}
                alt={card.card_key}
                className="block w-full h-full object-contain"
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

    <img
      onClick={(e) => e.stopPropagation()}
      src={getTradeCardImage(quickViewCard)}
      alt={quickViewCard.card_key}
className={`max-h-[75vh] max-w-[70vw] rounded-2xl object-contain drop-shadow-2xl ${
  isMoon3DoubleWide(quickViewCard)
    ? "w-[75vw] max-w-[900px]"
    : ""
}`}
    />
  </div>
)}

{showMessages && (
  <div
    className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/70 backdrop-blur-sm pt-28"
    onClick={async () => {
  setShowMessages(false);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return;

  const { data: unread } = await supabase
    .from("messages")
    .select("id")
    .eq("sender", user.id)
    .eq("receiver", session.user.id)
    .is("read_at", null);

  const count = unread?.length ?? 0;

setUnreadMessages(count);

window.dispatchEvent(
  new CustomEvent("header-message-update")
);
}}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative h-[520px] w-[420px] max-h-[80vh] max-w-[95vw] overflow-hidden rounded-[28px] border border-[#3a3a3c] bg-[#1c1c1e] shadow-2xl"
    >
      <div className="flex h-14 items-center justify-between border-b border-[#3a3a3c] bg-[#2c2c2e] px-5">
        <div className="font-semibold text-white">
          {friendNickname || user.username}
        </div>

        <button
          onClick={async () => {
  setShowMessages(false);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return;

  const { data: unread } = await supabase
    .from("messages")
    .select("id")
    .eq("sender", user.id)
    .eq("receiver", session.user.id)
    .is("read_at", null);

  const count = unread?.length ?? 0;

setUnreadMessages(count);

window.dispatchEvent(
  new CustomEvent("header-message-update")
);
}}
          className="text-2xl text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="h-[calc(100%-56px)] overflow-hidden">
        <Messages otherUserId={user.id} />
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FriendsProfiles;
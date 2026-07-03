import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  const avatar =
    avatarMap[String(user?.avatar_url || "").trim()] || avatar001;

  const badge = VERIFIED_USERS[user?.id];

  useEffect(() => {
  if (!user?.id) return;

  async function loadProfile() {
    
      // Load trading profile (Discord username)
      const { data: tradingProfile } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", user.id)
        .single();

      
    const { data: profileSettings } = await supabase
      .from("profiles")
      .select(
        "hide_iso, hide_wishlist, iso_hidden_sets, iso_hidden_sets_ccg, iso_hidden_sets_tcg"
      )
      .eq("id", user.id)
      .single();
    
    const legacyHidden: string[] =
      profileSettings?.iso_hidden_sets || [];
    
    const hiddenIsoSets: string[] = [
      ...(profileSettings?.iso_hidden_sets_ccg?.length
        ? profileSettings.iso_hidden_sets_ccg
        : legacyHidden),
      ...(profileSettings?.iso_hidden_sets_tcg?.length
        ? profileSettings.iso_hidden_sets_tcg
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
    { id: "tcgpromos", rarities: {} },
    ];
    
    isoSets.forEach((set) => {
      if (set.id === "9") {
      ["PR-1","PR-2","PR-3","PR-4","PR-5","PR-7"].forEach((cardKey) => {
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
      for (let i = 1; i <= 12; i++) {
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
          "9",
          "4",
          "6",
          "FW",
          "SD",
          "friendshipsbegin",
          "tcgpromos",
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
        setId !== "tcgpromos"
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
        .select("progress")
        .eq("user_id", user.id);
    
      let owned = 0;
    
      (collection || []).forEach((row: any) => {
        owned += Object.values(row.progress || {}).filter(Boolean).length;
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
}, [user?.id]);



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

const filteredTradeCards =
  selectedSet === "ALL"
    ? allTradeCards
    : allTradeCards.filter(
        (card) => String(card.set_id) === selectedSet
      );

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

          <h1 className="text-4xl font-bold text-slate-900">
            {user?.username}'s Profile
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl font-semibold text-slate-800">
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
            {tradingProfile?.discord_username || "No Discord username"}
          </p>
        </div>

        <img
          src={avatar}
          alt={user?.username}
          className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

  <div className="grid grid-cols-3 gap-6">

    <div>
      <div className="text-4xl font-bold">
        {userStats.owned}
      </div>

      <div>Owned Cards</div>
    </div>

    <div>
      <div className="text-4xl font-bold">
        {userStats.completed}
      </div>

      <div>Completed Sets</div>
    </div>

    <div>
      <div className="text-4xl font-bold">
        {userStats.trades}
      </div>

      <div>Trades</div>
    </div>

  </div>

</div>

<div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

<div className="flex flex-wrap gap-3 mb-6">
<button
  onClick={() => setSelectedSection("iso")}
  className={`group relative overflow-hidden rounded-xl px-5 py-2 font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
${
  selectedSection === "iso"
    ? "bg-[linear-gradient(180deg,#fff9cf_0%,#ffe875_15%,#ffd43b_35%,#ffc107_50%,#ffd84d_65%,#fff3a7_85%,#d89b00_100%)] shadow-[0_0_15px_rgba(255,193,7,.45)] hover:shadow-[0_0_25px_rgba(255,215,0,.8)] before:absolute before:top-0 before:-left-1/2 before:h-full before:w-1/3 before:rotate-12 before:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.85),transparent)] before:opacity-0 hover:before:left-[140%] hover:before:opacity-100 before:transition-all before:duration-700"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105"
}`}
>
    ISO
  </button>

  <button
    onClick={() => setSelectedSection("trade")}
className={`group relative overflow-hidden rounded-xl px-5 py-2 font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
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
className={`group relative overflow-hidden rounded-xl px-5 py-2 font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
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
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {filteredIsoCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border bg-slate-50 p-3 text-center ${
                isMoon3DoubleWide(card) ? "col-span-2" : ""
              }`}
            >
              <img
                src={getTradeCardImage(card)}
                alt={card.card_key}
                className={`rounded-lg object-cover ${
                  String(card.set_id) === "tcgpromos"
                    ? "w-full aspect-[5/7]"
                    : "w-full"
                }`}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
) : selectedSection === "trade" ? (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
    {filteredTradeCards.map((card) => (
      <div
        key={`${card.set_id}-${card.card_key}`}
        className={`rounded-xl border bg-slate-50 p-3 text-center ${
          isMoon3DoubleWide(card) ? "col-span-2" : ""
        }`}
      >
        <div
          className={`mb-2 rounded-full px-2 py-1 text-xs font-bold text-white ${
            card.type === "trade"
              ? "bg-blue-600"
              : "bg-green-600"
          }`}
        >
          {card.type === "trade"
            ? "FOR TRADE"
            : "FOR SALE"}
        </div>

        <img
          src={getTradeCardImage(card)}
          alt={card.card_key}
          className={`rounded-lg object-cover ${
            String(card.set_id) === "tcgpromos"
              ? "w-full aspect-[5/7]"
              : "w-full"
          }`}
        />
      </div>
    ))}
  </div>
) : (
  userProfileSettings.hide_wishlist ? (
    <p className="text-slate-500">
      This collector has hidden their wishlist.
    </p>
  ) : (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
      {userWishlistCards.map((card) => (
        <div
          key={card.id}
          className={`rounded-xl border bg-slate-50 p-3 text-center ${
            isMoon3DoubleWide(card) ? "col-span-2" : ""
          }`}
        >
          <img
            src={getTradeCardImage(card)}
            alt={card.card_key}
            className={`rounded-lg object-cover ${
              String(card.set_id) === "tcgpromos"
                ? "w-full aspect-[5/7]"
                : "w-full"
            }`}
          />
        </div>
      ))}
    </div>
  )
)}

</div>

    </div>
  );
};

export default ExploreProfile;
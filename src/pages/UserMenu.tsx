import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import {
  Grid3X3,
  ArrowLeftRight,
  Pencil,
  Heart,
} from "lucide-react";
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
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import maipfp from "@/assets/avatars/maipfp.webp";

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";

import fluttershyCutieMark from "/website-assets/fluttershycutiemark.webp";
import applejackCutieMark from "/website-assets/applejackcutiemark.webp";
import pinkiePieCutieMark from "/website-assets/pinkiecutiemark.webp";
import rainbowDashCutieMark from "/website-assets/rainbowdashcutiemark.webp";
import rarityCutieMark from "/website-assets/raritycutiemark.webp";
import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.webp";

const avatarMap: Record<string, string> = {
  "avatar001.webp": avatar001,
  "avatar002.webp": avatar002,
  "avatar003.webp": avatar003,
  "avatar004.webp": avatar004,
  "avatar005.webp": avatar005,
  "avatar006.webp": avatar006,
  "avatar007.webp": avatar007,
  "avatar008.webp": avatar008,
  "avatar009.webp": avatar009,
  "avatar010.webp": avatar010,
  "avatar011.webp": avatar011,
  "avatar012.webp": avatar012,
  "avatar013.webp": avatar013,
  "avatar014.webp": avatar014,
  "avatar015.webp": avatar015,
  "heimantouavatar": heimantouAvatar,
  "heimantouavatar.webp": heimantouAvatar,
  "keeganpfp.webp": KeeganAvatar,
  "maipfp.webp": maipfp,

};

const VERIFIED_USERS = {
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

const UserMenu = () => {
  const [profile, setProfile] = useState<any>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const displayDiscord = profile?.discord_username || "No Discord username set";
  const [discord, setDiscord] = useState("");
  const [editingDiscord, setEditingDiscord] = useState(false);
  const [discordDraft, setDiscordDraft] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
const [usernameDraft, setUsernameDraft] = useState("");

const [showCollectionMenu, setShowCollectionMenu] = useState(false);

const [tradeCards, setTradeCards] = useState<any[]>([]);
const [showcaseCards, setShowcaseCards] = useState<any[]>([]);

const navigate = useNavigate();
const [activeTab, setActiveTab] = useState<"collection" | "trades">("collection");
const [desktopTab, setDesktopTab] = useState<"showcase" | "trades">(
  "showcase"
);

  const [stats, setStats] = useState({
  owned: 0,
  completed: 0,
  trades: 0,
});

useEffect(() => {
  const loadProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
  .from("profiles")
  .select("id, username, avatar_url")
  .eq("id", session.user.id)
  .single();

      if (data) {
        setProfile(data);
        setUsernameDraft(data.username || "");
      }

      const { data: tradingProfile } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", session.user.id)
        .single();

      if (tradingProfile?.discord_username) {
        setDiscord(tradingProfile.discord_username);
        setDiscordDraft(tradingProfile.discord_username);
      } else {
        setDiscord("");
        setDiscordDraft("");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  // Load immediately when the component mounts
  loadProfile();

  // Reload automatically whenever the auth state changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    loadProfile();
  });

  // Clean up the listener when the component unmounts
  return () => {
    subscription.unsubscribe();
  };
}, []);

const [selectedCardImage, setSelectedCardImage] = useState<string | null>(null);

  useEffect(() => {
  const loadStats = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      // Total cards owned
      const { data: collection } = await supabase
        .from("collection_progress_raw")
        .select("progress")
        .eq("user_id", session.user.id);

      let owned = 0;

      (collection || []).forEach((row: any) => {
        owned += Object.values(row.progress || {}).filter(Boolean).length;
      });

      // Completed sets
      const { data: progress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", session.user.id);

let completed = 0;

const progressMap = new Map(
  (progress || []).map((row: any) => [String(row.set_id), row])
);

// Main checklist sets only
const sets = [
  { id: "1", rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 }},
  { id: "5", rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 }},
  { id: "7", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 }},
  { id: "2", rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 }},
  { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, SZR:1 }},
  { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 }},
  { id: "11", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12, SCR:12 }},
  { id: "6", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 }},
  { id: "4", rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }},
];

sets.forEach((set) => {
  const found = progressMap.get(set.id);

  if (!found?.progress) return;

  let owned = 0;
  let total = 0;

  Object.entries(set.rarities).forEach(([rarity, count]) => {
    total += count;

    for (let i = 1; i <= count; i++) {
      const key = `${rarity}-${i}`;
      if (found.progress[key]) {
        owned++;
      }
    }
  });

  if (total > 0 && owned === total) {
    completed++;
  }
});

      // Total cards listed for trade
      const { data: trades } = await supabase
        .from("for_trade")
        .select("id")
        .eq("user_id", session.user.id);

      setStats({
        owned,
        completed,
        trades: trades?.length || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  loadStats();
}, []);

useEffect(() => {
  const loadTradeCards = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data } = await supabase
  .from("for_trade")
  .select("id, set_id, card_key, listing_type")
  .eq("user_id", session.user.id);

const setOrder = [
  "1",
  "2",
  "5",
  "7",
  "8",
  "3",
  "4",
  "6",
  "9",
  "11",
  "FW",
  "friendshipsbegin",
  "tcgpromos",
];

const rarityOrders: Record<string, string[]> = {
  // Eternal Star
  "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],

  // Eternal Moon
  "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
  "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
  "3": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],

  // Rainbow
  "5": ["R", "SR", "FR", "TR", "TGR", "MTR", "SSR", "UR", "USR", "XR"],
  "6": ["BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],

  // Fun Moments
  "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
  "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
  "11": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR", "SCR"],

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
    "※RR",
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
    "※RR",
  ],

  // Promos
  "9": ["PR"],
  "tcgpromos": ["PR"],
};

const extractRarity = (card: any) => {
  // Standard sets
  if (
    card.set_id !== "FW" &&
    card.set_id !== "friendshipsbegin" &&
    card.set_id !== "tcgpromos"
  ) {
    return card.card_key.split("-")[0];
  }

  // TCG Promos
  if (card.set_id === "tcgpromos") {
    return "PR";
  }

  // Fantasy Wonderland + Friendships Begin
  const match = card.card_key.match(
    /(PSPR|PCR|PGR|PER|PRR|SPR|SGR|LSR|SSR|SZR|GR|CR|RR|SR|ER|ZR|HR|UR|R|U|C)/
  );

  let rarity = match?.[0] || "OTHER";

  if (rarity === "PER") rarity = "※ER";
  if (rarity === "PSPR") rarity = "※SPR";
  if (rarity === "PCR") rarity = "※CR";
  if (rarity === "PRR") rarity = "※RR";
  if (rarity === "PGR") rarity = "※GR";

  return rarity;
};

const extractNumber = (card: any) => {
  const match = card.card_key.match(/(\d+)(?!.*\d)/);
  return match ? parseInt(match[1], 10) : 0;
};

const sorted = (data || []).sort((a, b) => {
  // 1. Sort by set using your custom order
  const setIndexA = setOrder.indexOf(String(a.set_id));
  const setIndexB = setOrder.indexOf(String(b.set_id));

  if (setIndexA !== setIndexB) {
    return (
      (setIndexA === -1 ? 999 : setIndexA) -
      (setIndexB === -1 ? 999 : setIndexB)
    );
  }

  // 2. Sort by set-specific rarity order
  const currentOrder = rarityOrders[String(a.set_id)] || [];

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

  // 3. Sort numerically within the rarity
  return extractNumber(a) - extractNumber(b);
});

setTradeCards(sorted);
    } catch (error) {
      console.error("Failed to load trade cards:", error);
    }
  };

  loadTradeCards();
}, []);

  const displayName = profile?.username || "Twilight Sparkle";
  const VERIFIED_USER_IDS = [
  "17e57e39-bc0c-44e7-b373-ac34c6690185",
  "94a1c998-d040-4dd2-b2fb-5f606287139d",
  "408a516c-ee80-4ff8-a869-493e1fd5d961",
];

const verification =
  profile?.id ? VERIFIED_USERS[profile.id] : null;
  const avatarOptions = Object.entries(avatarMap).filter(
  ([fileName]) => fileName.startsWith("avatar")
);
const getAvatar = (avatar?: string) => {
  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";

  return (
    avatarMap[file] ||
    avatarMap[`${file}.webp`] ||
    avatar001
  );
};

useEffect(() => {
  const loadShowcaseCards = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data } = await supabase
        .from("collection_progress_raw")
        .select("set_id, progress")
        .eq("user_id", session.user.id);

      const showcaseRarities = [
        "SHINING ZR",
        "SZR",
        "SC",
        "PRR",
        "SCR",
        "SAR",
      ];

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
        "friendshipsbegin",
        "tcgpromos",
      ];

      const rarityPriority = [
        "SHINING ZR",
        "SZR",
        "SC",
        "ZR",
        "XR",
        "CR",
        "SCR",
        "SAR",
      ];

   const getShowcaseRarity = (
  setId: string,
  cardKey: string
): string => {
  const key = String(cardKey);
  if (
    setId === "FW" ||
    setId === "SD" ||
    setId === "tcgpromos"
  ) {
    return key.includes("PRR") ? "PRR" : "";
  }
  return key.split("-")[0];
};

      const cards: any[] = [];

      (data || []).forEach((row: any) => {
        const progress = row.progress || {};

        Object.entries(progress).forEach(([cardKey, owned]) => {
          if (!owned) return;

          const rarity = getShowcaseRarity(
            String(row.set_id),
            String(cardKey)
          );

          if (showcaseRarities.includes(rarity)) {
            cards.push({
              set_id: row.set_id,
              card_key: cardKey,
            });
          }
        });
      });

      cards.sort((a, b) => {
        // Sort by set
        const setIndexA = setOrder.indexOf(String(a.set_id));
        const setIndexB = setOrder.indexOf(String(b.set_id));

        if (setIndexA !== setIndexB) {
          return (
            (setIndexA === -1 ? 999 : setIndexA) -
            (setIndexB === -1 ? 999 : setIndexB)
          );
        }

        // Sort by rarity priority
        const rarityA = getShowcaseRarity(
          String(a.set_id),
          String(a.card_key)
        );

        const rarityB = getShowcaseRarity(
          String(b.set_id),
          String(b.card_key)
        );

        const rarityDiff =
          rarityPriority.indexOf(rarityA) -
          rarityPriority.indexOf(rarityB);

        if (rarityDiff !== 0) return rarityDiff;

        // Sort numerically within rarity
        const numA = parseInt(
          String(a.card_key).match(/(\d+)(?!.*\d)/)?.[1] || "0",
          10
        );

        const numB = parseInt(
          String(b.card_key).match(/(\d+)(?!.*\d)/)?.[1] || "0",
          10
        );

        return numA - numB;
      });

      setShowcaseCards(cards);
    } catch (error) {
      console.error("Failed to load showcase cards:", error);
    }
  };

  loadShowcaseCards();
}, []);

const displayAvatar = profile
  ? getAvatar(profile?.avatar_url)
  : avatar004;

    const handleAvatarSelect = async (file: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    setSavingAvatar(true);

    // Update Auth metadata
    await supabase.auth.updateUser({
      data: {
        avatar: file,
      },
    });

    // Update profiles table
    await supabase.from("profiles").upsert({
      id: session.user.id,
      avatar_url: file,
    });
// Normalize to the same format used throughout the app
const avatarFile = file.includes(".") ? file : `${file}.webp`;

// Update local state immediately
setProfile((prev: any) => ({
  ...prev,
  avatar_url: avatarFile,
}));

// Notify KayouHeader and any other components that the avatar changed
window.dispatchEvent(
  new CustomEvent("profile-updated", {
    detail: {
      avatar_url: avatarFile,
    },
  })
);

// Close the avatar picker
setShowAvatarPicker(false);
  } catch (error) {
    console.error("Failed to save avatar:", error);
  } finally {
    setSavingAvatar(false);
  }
};

const getTradeCardImage = (card: any) => {
  if (!card) return "";

if (
  card.set_id === "friendshipsbegin" ||
  card.set_id === "SD"
) {
  const cleanKey = String(card.card_key)
    .replace(/^BONUS-/, "")
    .replace(/^STARTER-/, "");

  return `/friendships-begin/${cleanKey}.webp`;
}
  if (card.set_id === "FW") {
    const num = card.card_key.slice(-2);

    if (card.card_key.startsWith("BP01ER")) {
      return `/fantasy-wonderland/SD01ER${num}.webp`;
    }

    if (card.card_key.startsWith("BP01PER")) {
      return `/fantasy-wonderland/SD01PER${num}.webp`;
    }

    return `/fantasy-wonderland/${card.card_key}.webp`;
  }

  if (card.set_id === "9") {
    const number = card.card_key.split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }

  if (card.set_id === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }

  const [rarityRaw, number] = card.card_key.split("-");
  const rarity = rarityRaw === "SHINING ZR" ? "SZR" : rarityRaw;

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

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(
  3,
  "0"
)}${
  String(card.set_id) === "6" &&
  ["ST", "TR", "TGR"].includes(rarity)
    ? ".webp"
    : ".webp"
}`;
};

const getSetName = (setId: string) => {
  const names: Record<string, string> = {
    "1": "Eternal Moon: First Edition",
    "2": "Eternal Moon: Second Edition",
    "5": "Rainbow: First Edition",
    "7": "Fun Moments: First Edition",
    "8": "Fun Moments: Second Edition",
    "3": "Eternal Moon: Third Edition",
    "4": "Star: First Edition",
    "6": "Rainbow: Second Edition",
    "11": "Fun Moments: Third Edition",
    "9": "Promotional Cards",

    "FW": "Fantasy Wonderland",
    "SD": "Friendships Begin",
    "friendshipsbegin": "Friendships Begin",


    "tcgpromos": "TCG Promos",
  };

  return names[String(setId)] || String(setId);
};

useEffect(() => {
  const handleProfileUpdated = (event: Event) => {
    const customEvent = event as CustomEvent<{
      avatar_url?: string;
      username?: string;
    }>;

    const updates = customEvent.detail || {};

    setProfile((prev: any) => ({
      ...prev,
      ...updates,
    }));
  };

  window.addEventListener(
    "profile-updated",
    handleProfileUpdated as EventListener
  );

  return () => {
    window.removeEventListener(
      "profile-updated",
      handleProfileUpdated as EventListener
    );
  };
}, []);

// THE RETURN THAT GOES INTO THE OFFICIAL DATA. KEEGAN STOP MESSING THIS UP.

  return (
    <>
{/* Header + Mobile Bottom Navigation */}
{!(
  showEditProfileModal ||
  showCollectionMenu ||
  (showAvatarPicker && window.innerWidth < 640)
) && <KayouHeader />}

      {/* MOBILE ONLY */}
      <div className="sm:hidden min-h-screen bg-white pb-24 pt-7">
        <div className="px-4">
{/* Username at top */}
<div className="flex items-center justify-center gap-2 mb-3">
  <h1 className="text-xl font-semibold tracking-tight text-gray-900">
    {displayName}
  </h1>

{verification && (
  <img
    src={verification.badge}
    alt={verification.label}
    title={verification.label}
    className="w-5 h-5 object-contain flex-shrink-0"
  />
)}
</div>

{/* Avatar + Stats Row */}
<div className="flex items-center gap-4">
  {/* Avatar */}
  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-sm">
    <img
      src={displayAvatar}
      alt="Avatar"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Stats */}
{/* Stats */}
<div className="flex-1 grid grid-cols-3 text-center">
  <div>
    <div className="text-xl font-semibold tracking-tight text-gray-900">
      {stats.trades.toLocaleString()}
    </div>

    <div className="mt-0.5 flex flex-col items-center leading-tight">
      <span className="text-[8px] font-semibold tracking-[0.12em] uppercase text-gray-400">
        Trades
      </span>
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
        Active
      </span>
    </div>
  </div>

  <div>
    <div className="text-xl font-semibold tracking-tight text-gray-900">
      {stats.owned.toLocaleString()}
    </div>

    <div className="mt-0.5 flex flex-col items-center leading-tight">
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
        Cards
      </span>
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
        Owned
      </span>
    </div>
  </div>

  <div>
    <div className="text-xl font-semibold tracking-tight text-gray-900">
      {stats.completed.toLocaleString()}
    </div>

    <div className="mt-0.5 flex flex-col items-center leading-tight">
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
        Sets
      </span>
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
        Completed
      </span>
    </div>
  </div>
</div>
</div>

          {/* Bio Section */}
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-900">
  {profile ? (discord || "No Discord username set") : "Create an account or log in!"}
</p>

            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Hi! My name is Keegan and I am hardcoding a description into your profile to remind you every time that you open this app that I love you, I appreciate you, and this app would be nothing without you! Thank you for everything.
            </p>
          </div>

          {/* Action Buttons */}
<div className="mt-4">
  {/* Edit Profile Button */}
  <Button
    variant="outline"
    className="w-full h-9 rounded-lg border-gray-300 bg-white text-gray-800 font-semibold"
    onClick={() => setShowEditProfileModal(true)}
  >
    Edit Profile
  </Button>

  {/* Mercari Style Menu */}
  <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden bg-white">

    <button
      onClick={() => navigate("/inventory")}
      className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 text-left"
    >
      <span className="text-[15px] font-medium text-gray-900">
        My Inventory
      </span>

      <span className="text-xl text-gray-400">›</span>
    </button>

    <button
      onClick={() => navigate("/my-progress")}
      className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 text-left"
    >
      <span className="text-[15px] font-medium text-gray-900">
        CCG Progress
      </span>

      <span className="text-xl text-gray-400">›</span>
    </button>

    <button
      onClick={() => navigate("/progress-tcg")}
      className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 text-left"
    >
      <span className="text-[15px] font-medium text-gray-900">
        TCG Progress
      </span>

      <span className="text-xl text-gray-400">›</span>
    </button>

    <button
      onClick={() => navigate("/my-iso")}
      className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 text-left"
    >
      <span className="text-[15px] font-medium text-gray-900">
        My ISO
      </span>

      <span className="text-xl text-gray-400">›</span>
    </button>

    <button
      onClick={() => navigate("/wishlist")}
      className="w-full flex items-center justify-between px-4 py-4 text-left"
    >
      <span className="text-[15px] font-medium text-gray-900">
        My Wishlist
      </span>

      <span className="text-xl text-gray-400">›</span>
    </button>
  </div>
</div>
        </div>
      </div>

{/* DESKTOP PC USER MENU */}
<div className="hidden sm:block min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-[#faf7ff] to-[#f1e8ff] pt-8 pb-12">
  {/* Soft Sparkle Background */}
  <div className="absolute inset-0 pointer-events-none">
    {/* Large glow */}
    <div className="absolute top-12 left-20 w-72 h-72 bg-[#d4af37]/6 rounded-full blur-3xl" />

    {/* Lavender glow */}
    <div className="absolute top-1/3 right-24 w-96 h-96 bg-[#c4b5fd]/10 rounded-full blur-3xl" />

    {/* Bottom glow */}
    <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-white/60 rounded-full blur-3xl" />

    {/* Sparkles */}
    <div className="absolute top-20 left-1/4 text-[#d4af37]/25 text-xl">✦</div>
    <div className="absolute top-40 right-1/3 text-[#d4af37]/20 text-2xl">✧</div>
    <div className="absolute top-2/3 left-1/5 text-[#d4af37]/20 text-lg">✦</div>
    <div className="absolute bottom-32 right-1/4 text-[#d4af37]/25 text-xl">✧</div>
    <div className="absolute bottom-20 left-1/2 text-[#d4af37]/15 text-2xl">✦</div>
  </div>

  {/* Main Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-6">
    {/* Title */}
    <div className="text-center mb-6">

    </div>

{/* DESKTOP AVATAR PICKER */}
{showAvatarPicker && (
  <div className="hidden sm:flex fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm items-center justify-center p-4 lg:p-6">
    <div className="bg-white rounded-[2rem] shadow-2xl border border-[#d4af37]/20 w-full max-w-3xl max-h-[90vh] overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <h2 className="text-4xl font-serif font-semibold text-[#5a3e84] leading-none">
          Choose Your Avatar
        </h2>

        <button
          type="button"
          onClick={() => setShowAvatarPicker(false)}
          className="w-10 h-10 flex items-center justify-center text-4xl text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Avatar Grid */}
      <div className="p-8 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-6 gap-6">
          {avatarOptions.map(([fileName, src]) => (
            <button
              key={fileName}
              type="button"
              onClick={() =>
                handleAvatarSelect(fileName.replace(".webp", ""))
              }
              disabled={savingAvatar}
              className="group relative"
            >
              <div
                className={`aspect-square rounded-full overflow-hidden border-4 transition-all shadow-md group-hover:scale-105 group-hover:shadow-xl ${
                  displayAvatar === src
                    ? "border-[#7c5aa6] ring-4 ring-[#d4af37]/20"
                    : "border-transparent"
                }`}
              >
                <img
                  src={src}
                  alt={fileName}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

    {/* Main Dashboard Layout */}
    <div className="grid grid-cols-[340px_1fr] gap-8 items-start">
      {/* LEFT SIDEBAR */}
      <div className="relative self-start bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#d4af37]/20 p-8 sticky top-4 overflow-hidden">
  {/* Cutie Mark Background Pattern */}
<div className="absolute inset-0 pointer-events-none">
  {[
    twilightSparkleCutieMark,
    rarityCutieMark,
    rainbowDashCutieMark,
    fluttershyCutieMark,
    applejackCutieMark,
    pinkiePieCutieMark,
  ]
    .flatMap((src) => Array(6).fill(src))
    .map((src, index) => {
      const positions = [
        { top: "3%", left: "6%" },
        { top: "7%", right: "8%" },
        { top: "14%", left: "18%" },
        { top: "20%", right: "14%" },
        { top: "28%", left: "4%" },
        { top: "34%", right: "5%" },
        { top: "40%", left: "22%" },
        { top: "47%", right: "18%" },
        { top: "54%", left: "10%" },
        { top: "60%", right: "9%" },
        { top: "67%", left: "24%" },
        { top: "73%", right: "20%" },
        { top: "80%", left: "7%" },
        { top: "86%", right: "6%" },
        { top: "92%", left: "30%" },
        { top: "10%", left: "55%" },
        { top: "18%", left: "70%" },
        { top: "26%", left: "48%" },
        { top: "36%", left: "62%" },
        { top: "44%", left: "76%" },
        { top: "52%", left: "50%" },
        { top: "62%", left: "66%" },
        { top: "70%", left: "46%" },
        { top: "78%", left: "72%" },
        { top: "88%", left: "56%" },
        { top: "6%", left: "36%" },
        { top: "24%", left: "34%" },
        { top: "42%", left: "36%" },
        { top: "58%", left: "38%" },
        { top: "76%", left: "40%" },
        { top: "12%", left: "84%" },
        { top: "30%", left: "86%" },
        { top: "48%", left: "88%" },
        { top: "66%", left: "84%" },
        { top: "84%", left: "82%" },
        { top: "94%", left: "68%" },
      ];

      const sizes = [42, 48, 54, 60, 46, 52];
      const rotations = [
        -18, 12, -8, 22, -25, 15,
        -12, 8, -20, 18, -6, 24,
      ];

      const position = positions[index];
      const size = sizes[index % sizes.length];
      const rotation = rotations[index % rotations.length];

      return (
        <img
          key={index}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute select-none"
          style={{
            ...position,
            width: `${size}px`,
            height: `${size}px`,
            opacity: 0.07,
            transform: `rotate(${rotation}deg)`,
          }}
        />
      );
    })}
</div>

  {/* Sidebar Content */}
  <div className="relative z-10">
       {/* Avatar */}
<div className="relative w-40 h-40 mx-auto mb-6">
  <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#d4af37]/30 shadow-lg">
    <img
      src={displayAvatar}
      alt="Avatar"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Edit Avatar Button */}
  <button
    type="button"
    onClick={() => {
  if (window.innerWidth >= 640) {
    setShowAvatarPicker(true);
  } else {
    setShowAvatarPicker(true);
  }
}}
    className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/95 border border-[#d4af37]/30 shadow-lg flex items-center justify-center text-[#5a3e84] hover:scale-105 transition-all"
  >
    <Pencil className="w-4 h-4" />
  </button>
</div>
</div>

        {/* Username */}
<div className="flex items-center justify-center gap-2 mb-2">
  {editingUsername ? (
    <input
      type="text"
      value={usernameDraft}
      onChange={(e) => setUsernameDraft(e.target.value)}
      autoFocus
      className="text-3xl font-bold text-[#5a3e84] bg-transparent border-none outline-none text-center"
    />
  ) : (
    <>
      <h1 className="text-3xl font-bold text-[#5a3e84] text-center">
        {displayName}
      </h1>

{verification && (
  <img
    src={verification.badge}
    alt={verification.label}
    title={verification.label}
    className="w-6 h-6 object-contain flex-shrink-0"
  />
)}
    </>
  )}

  <button
    type="button"
    onClick={() => {
      setUsernameDraft(displayName || "");
      setEditingUsername(true);
    }}
    className="text-[#5a3e84] hover:opacity-70 flex-shrink-0"
  >
    <Pencil className="w-4 h-4" />
  </button>
</div>

{/* Discord */}
<div className="flex items-center justify-center gap-2 mb-2">
  {editingDiscord ? (
    <input
      type="text"
      value={discordDraft}
      onChange={(e) => setDiscordDraft(e.target.value)}
      placeholder="Add Discord username"
      className="text-gray-600 bg-transparent border-none outline-none text-center"
    />
  ) : (
    <p className="text-gray-600 text-center">
      {profile
        ? (discord || "No Discord username set")
        : "Create an account or log in!"}
    </p>
  )}

  {profile && (
    <button
      type="button"
      onClick={() => {
        setDiscordDraft(discord || "");
        setEditingDiscord(true);
      }}
      className="text-[#5a3e84] hover:opacity-70 flex-shrink-0"
    >
      <Pencil className="w-4 h-4" />
    </button>
  )}
</div>

{/* Save Changes Button */}
{(editingUsername || editingDiscord) && (
  <div className="mb-6 flex justify-center">
    <Button
      className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110"
      onClick={async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        // Save username if being edited
        if (editingUsername) {
          const trimmedUsername = usernameDraft.trim();

          if (trimmedUsername) {
            await supabase.auth.updateUser({
              data: {
                username: trimmedUsername,
              },
            });

            await supabase.from("profiles").upsert({
              id: session.user.id,
              username: trimmedUsername,
            });

            setProfile((prev: any) => ({
              ...prev,
              username: trimmedUsername,
            }));

            window.dispatchEvent(
              new CustomEvent("profile-updated", {
                detail: {
                  username: trimmedUsername,
                },
              })
            );
          }

          setEditingUsername(false);
        }

        // Save Discord if being edited
        if (editingDiscord) {
          const trimmedDiscord = discordDraft.trim();

          await supabase.from("trading_profiles").upsert({
            user_id: session.user.id,
            discord_username: trimmedDiscord,
          });

          setDiscord(trimmedDiscord);
          setEditingDiscord(false);
        }
      }}
    >
      Save Changes
    </Button>
  </div>
)}

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <div className="text-center bg-[#f8f5ff] rounded-2xl p-4 border border-[#d4af37]/10">
            <div className="text-3xl font-bold text-[#5a3e84]">
              {stats.trades.toLocaleString()}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
              Trades Active
            </div>
          </div>

          <div className="text-center bg-[#f8f5ff] rounded-2xl p-4 border border-[#d4af37]/10">
            <div className="text-3xl font-bold text-[#5a3e84]">
              {stats.owned.toLocaleString()}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
              Cards Owned
            </div>
          </div>

          <div className="text-center bg-[#f8f5ff] rounded-2xl p-4 border border-[#d4af37]/10">
            <div className="text-3xl font-bold text-[#5a3e84]">
              {stats.completed.toLocaleString()}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
              Sets Completed
            </div>
          </div>
        </div>

               {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110"
            onClick={() => setShowEditProfileModal(true)}
          >
            Edit Profile
          </Button>

          <Button
            variant="outline"
            className="w-full border-[#d4af37]/30 text-[#5a3e84] hover:bg-[#f8f5ff]"
            onClick={() => navigate("/my-progress")}
          >
            CCG Progress
          </Button>

          <Button
            variant="outline"
            className="w-full border-[#d4af37]/30 text-[#5a3e84] hover:bg-[#f8f5ff]"
            onClick={() => navigate("/progress-tcg")}
          >
            TCG Progress
          </Button>

          <Button
            variant="outline"
            className="w-full border-[#d4af37]/30 text-[#5a3e84] hover:bg-[#f8f5ff]"
            onClick={() => navigate("/inventory")}
          >
            My Inventory
          </Button>

          <Button
            variant="outline"
            className="w-full border-[#d4af37]/30 text-[#5a3e84] hover:bg-[#f8f5ff]"
            onClick={() => navigate("/my-iso")}
          >
            My ISO
          </Button>

          <Button
            variant="outline"
            className="w-full border-[#d4af37]/30 text-[#5a3e84] hover:bg-[#f8f5ff]"
            onClick={() => navigate("/wishlist")}
          >
            My Wishlist
          </Button>
        </div>
      </div>

     {/* RIGHT CONTENT AREA */}
<div className="space-y-8 self-start">
  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#d4af37]/20 p-6">
    {/* Header + Toggle */}
    <div className="flex items-center justify-between mb-6 gap-4">
      <h2 className="text-2xl font-bold text-[#5a3e84]">
        {desktopTab === "showcase" ? "Rarest Cards" : "Extra Cards"}
      </h2>

      <div className="flex items-center bg-[#f8f5ff] rounded-full p-1 border border-[#d4af37]/20 shadow-sm">
        <button
          type="button"
          onClick={() => setDesktopTab("showcase")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            desktopTab === "showcase"
              ? "bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] shadow-sm"
              : "text-[#5a3e84] hover:bg-white/70"
          }`}
        >
          Showcase
        </button>

        <button
          type="button"
          onClick={() => setDesktopTab("trades")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            desktopTab === "trades"
              ? "bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] shadow-sm"
              : "text-[#5a3e84] hover:bg-white/70"
          }`}
        >
          Extras
        </button>
      </div>
    </div>

    {/* Edit Trades Button (only when Trades tab is active) */}
    {desktopTab === "trades" && (
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          className="border-[#d4af37]/30 text-[#5a3e84] hover:bg-[#f8f5ff]"
          onClick={() => navigate("/inventory")}
        >
          Edit Trades and Sales
        </Button>
      </div>
    )}

    {/* Showcase Content */}
    {desktopTab === "showcase" ? (
      showcaseCards.length > 0 ? (
        <div className="space-y-8">
          {[
            {
  title: "ALL ◇AR CARDS",
  cards: showcaseCards.filter(
    (card) =>
      String(card.set_id) === "4" &&
      String(card.card_key).startsWith("SAR-")
  ),
},
  {
    title: "ALL SC CARDS",
    cards: showcaseCards.filter(
      (card) =>
        ["1", "2", "3"].includes(String(card.set_id)) &&
        String(card.card_key).startsWith("SC-")
    ),
  },

  {
    title: "ALL ⬦ZR CARDS",
    cards: showcaseCards.filter((card) => {
      const rarity = String(card.card_key).split("-")[0];
      return rarity === "SHINING ZR" || rarity === "SZR";
    }),
  },

  {
    title: "Fantasy Wonderland ※RR",
    cards: showcaseCards.filter(
      (card) =>
        String(card.set_id) === "FW" &&
        String(card.card_key).includes("PRR")
    ),
  },

  {
    title: "Friendships Begin ※RR",
    cards: showcaseCards.filter(
      (card) =>
        String(card.set_id) === "friendshipsbegin" &&
        String(card.card_key).includes("PRR")
    ),
  },

{
  title: "ALL ※RR CARDS",
  cards: showcaseCards.filter((card) => {
    const setId = String(card.set_id);
    const key = String(card.card_key);

    return (
      (setId === "FW" ||
        setId === "friendshipsbegin" ||
        setId === "SD") &&
      key.includes("PRR")
    );
  }),
},
]
  .filter((section) => section.cards.length > 0)
  .map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">
                {section.title}
              </h3>

              <div className="relative">
{(
  (
    desktopTab === "showcase"
      ? showcaseCards
          .filter((card) => section.cards.includes(card)).length
      : tradeCards
          .filter((card) => section.cards.includes(card)).length
  ) >= 7
) && (
  <>
    {/* Left Arrow */}
    <button
      type="button"
      onClick={(e) => {
        const row = e.currentTarget.parentElement?.querySelector(
          ".card-scroll-row"
        ) as HTMLDivElement | null;

        row?.scrollBy({
          left: -720,
          behavior: "smooth",
        });
      }}
      className={
        desktopTab === "showcase"
          ? "absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 border border-[#d4af37]/20 shadow-sm text-[#5a3e84] text-xs hover:scale-105 transition-all"
          : "absolute left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-[#d4af37]/20 shadow-md text-[#5a3e84] hover:scale-105 transition-all"
      }
    >
      ‹
    </button>

    {/* Right Arrow */}
    <button
      type="button"
      onClick={(e) => {
        const row = e.currentTarget.parentElement?.querySelector(
          ".card-scroll-row"
        ) as HTMLDivElement | null;

        row?.scrollBy({
          left: 720,
          behavior: "smooth",
        });
      }}
      className={
        desktopTab === "showcase"
          ? "absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 border border-[#d4af37]/20 shadow-sm text-[#5a3e84] text-xs hover:scale-105 transition-all"
          : "absolute right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-[#d4af37]/20 shadow-md text-[#5a3e84] hover:scale-105 transition-all"
      }
    >
      ›
    </button>
  </>
)}

  {/* Scroll Container */}
  <div
    className="card-scroll-row overflow-x-auto overflow-y-visible px-6 pt-3 pb-4 [&::-webkit-scrollbar]:hidden"
    style={{
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}
  >
    <div
      className="grid grid-flow-col gap-3 w-full"
      style={{
        gridAutoColumns: "calc((100% - 3.75rem) / 6)",
      }}
    >
      {showcaseCards
        .filter((card) => section.cards.includes(card))
        .map((card, index) => (
          <div
            key={`${card.set_id}-${card.card_key}-${index}`}
            onClick={() => setSelectedCardImage(getTradeCardImage(card))}
            className="relative aspect-[5/7] rounded-xl overflow-visible bg-white shadow-sm cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-[#5a3e84] text-[#f5e6a8] text-[10px] font-bold tracking-wide shadow-md border border-[#d4af37]/40 whitespace-nowrap">
              {(() => {
                if (
                  String(card.set_id) === "FW" ||
                  String(card.set_id) === "SD" ||
                  String(card.set_id) === "friendshipsbegin" ||
                  String(card.set_id) === "tcgpromos"
                ) {
                  const cleanKey = String(card.card_key)
                    .replace(/^BONUS-/, "")
                    .replace(/^STARTER-/, "");

                  const match = cleanKey.match(
                    /(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|ZR|HR|UR|R|U|C|PR)/
                  );

                  let rarity = match?.[0] || "";

                  if (rarity === "PER") rarity = "※ER";
                  if (rarity === "PSPR") rarity = "※SPR";
                  if (rarity === "PCR") rarity = "※CR";
                  if (rarity === "PGR") rarity = "※GR";
                  if (rarity === "PRR") rarity = "※RR";

                  return rarity;
                }

                let rarity = String(card.card_key).split("-")[0];

                if (rarity === "SHINING ZR") rarity = "⬦ZR";
if (rarity === "SZR") rarity = "⬦ZR";

if (
  rarity === "SCR" &&
  String(card.set_id) !== "4"
) {
  rarity = "◇CR";
}

if (rarity === "SAR") {
  rarity = "◇AR";
}

                return rarity;
              })()}
            </div>

            <img
              src={getTradeCardImage(card)}
              alt={card.card_key}
              className={`w-full h-full ${
                String(card.set_id) === "FW" ||
                String(card.set_id) === "SD" ||
                String(card.set_id) === "friendshipsbegin"
                  ? "object-contain p-1"
                  : "object-cover"
              }`}
            />
          </div>
        ))}
    </div>
  </div>
</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-12">
          No rare cards collected yet.
        </div>
      )
    ) : (
      /* Trades Content */
      tradeCards.length > 0 ? (
        <div className="space-y-8">
          {Array.from(
  new Set(tradeCards.map((card) => String(card.set_id)))
).map((setId) => (
            <div key={setId}>
              <h3 className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">
                {getSetName(setId)}
              </h3>

              <div className="relative">
{tradeCards
  .filter((card) => String(card.set_id) === setId).length >= 7 && (
  <>
    {/* Left Arrow */}
    <button
      type="button"
      onClick={(e) => {
        const row = e.currentTarget.parentElement?.querySelector(
          ".card-scroll-row"
        ) as HTMLDivElement | null;

        row?.scrollBy({
          left: -720,
          behavior: "smooth",
        });
      }}
      className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 border border-[#d4af37]/20 shadow-sm text-[#5a3e84] text-xs hover:scale-105 transition-all"
    >
      ‹
    </button>

    {/* Right Arrow */}
    <button
      type="button"
      onClick={(e) => {
        const row = e.currentTarget.parentElement?.querySelector(
          ".card-scroll-row"
        ) as HTMLDivElement | null;

        row?.scrollBy({
          left: 720,
          behavior: "smooth",
        });
      }}
      className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 border border-[#d4af37]/20 shadow-sm text-[#5a3e84] text-xs hover:scale-105 transition-all"
    >
      ›
    </button>
  </>
)}

  {/* Scroll Container */}
  <div
    className="card-scroll-row overflow-x-auto overflow-y-visible px-6 pt-3 pb-4"
    style={{
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}
  >
    <div
      className="grid grid-flow-col gap-3 w-full"
      style={{
        gridAutoColumns: "calc((100% - 3.75rem) / 6)",
      }}
    >
      {tradeCards
  .filter((card) => String(card.set_id) === setId)
  .map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedCardImage(getTradeCardImage(card))}
            className="relative aspect-[5/7] rounded-xl overflow-visible bg-white shadow-sm cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-[#5a3e84] text-[#f5e6a8] text-[10px] font-bold tracking-wide shadow-md border border-[#d4af37]/40 whitespace-nowrap">
              {(() => {
                if (
                  String(card.set_id) === "FW" ||
                  String(card.set_id) === "SD" ||
                  String(card.set_id) === "friendshipsbegin" ||
                  String(card.set_id) === "tcgpromos"
                ) {
                  const cleanKey = String(card.card_key)
                    .replace(/^BONUS-/, "")
                    .replace(/^STARTER-/, "");

                  const match = cleanKey.match(
                    /(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|ZR|HR|UR|R|U|C|PR)/
                  );

                  let rarity = match?.[0] || "";

                  if (rarity === "PER") rarity = "※ER";
                  if (rarity === "PSPR") rarity = "※SPR";
                  if (rarity === "PCR") rarity = "※CR";
                  if (rarity === "PGR") rarity = "※GR";
                  if (rarity === "PRR") rarity = "※RR";

                  return rarity;
                }

                let rarity = String(card.card_key).split("-")[0];

                if (rarity === "SHINING ZR") rarity = "⬦ZR";
if (rarity === "SZR") rarity = "⬦ZR";

if (
  rarity === "SCR" &&
  String(card.set_id) !== "4"
) {
  rarity = "◇CR";
}

if (
  rarity === "SAR" &&
  String(card.set_id) === "4"
) {
  rarity = "◇AR";
}

                return rarity;
              })()}
            </div>

            <img
  src={getTradeCardImage(card)}
  alt={card.card_key}
  className={`w-full h-full ${
    String(card.set_id) === "FW" ||
    String(card.set_id) === "SD" ||
    String(card.set_id) === "friendshipsbegin"
      ? "object-contain p-1"
      : "object-cover"
  }`}
/>

<div
  className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white/20 z-20 ${
    card.listing_type === "purchase"
      ? "bg-blue-500"
      : "bg-green-500"
  }`}
>
  {card.listing_type === "purchase" ? "$" : "⇄"}
</div>
          </div>
        ))}
    </div>
  </div>
</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-12">
          No cards marked for trade.
        </div>
      )
    )}
  </div>
</div>
    </div>
  </div>
</div>


{/* MOBILE USER MENU */}
{showEditProfileModal && (
  <>
    <style>
      {`
        @media (max-width: 639px) {
          header img[alt="avatar"] {
            display: none !important;
          }
        }
      `}
    </style>
  <div
  id="edit-profile-modal"
  className="fixed inset-0 z-[100] bg-white sm:hidden overflow-y-auto animate-in slide-in-from-right duration-300"
>
    {/* Header */}
  <div
  className="sticky top-0 z-10 bg-white border-b border-gray-200"
  style={{
    paddingTop:
      window.matchMedia("(display-mode: standalone)").matches
        ? "env(safe-area-inset-top)"
        : "0px",
  }}
>
  <div className="relative flex items-center justify-center h-14">
    {/* Back Button */}
    <button
      onClick={() => {
        const modal = document.getElementById("edit-profile-modal");

        if (modal) {
          modal.classList.remove(
            "animate-in",
            "slide-in-from-right",
            "duration-300"
          );

          modal.classList.add(
            "animate-out",
            "slide-out-to-right",
            "duration-300"
          );

          setTimeout(() => {
            setShowEditProfileModal(false);
          }, 300);
        } else {
          setShowEditProfileModal(false);
        }
      }}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 -m-2"
    >
      <span className="text-3xl leading-none text-gray-900">‹</span>
    </button>

    {/* Title */}
    <h2 className="text-xl font-semibold text-gray-900">
      Edit profile
    </h2>
  </div>
</div>

    {/* Avatar Section */}
    <div className="px-6 py-8 border-b border-gray-100">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex justify-center">
  <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-200">
    <img
      src={displayAvatar}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  </div>
</div>

        <button
  className="text-[#4F46E5] font-semibold text-lg"
  onClick={() => setShowAvatarPicker(true)}
>
  Edit Avatar
</button>
      </div>
    </div>

    {/* Editable Fields */}
    <div className="bg-white">
      {/* Username */}
<div className="w-full px-6 py-5 border-b border-gray-100">
  <div className="flex items-center">
    <div className="w-36 text-gray-900 text-lg">Username</div>

    {!editingUsername ? (
      <>
        <div
          className="flex-1 text-lg text-gray-700 truncate"
          onClick={() => {
            setUsernameDraft(displayName || "");
            setEditingUsername(true);
          }}
        >
          {displayName}
        </div>

        <button
          onClick={() => {
            setUsernameDraft(displayName || "");
            setEditingUsername(true);
          }}
          className="ml-3 flex-shrink-0"
        >
          <Pencil className="h-4 w-4 text-gray-400" />
        </button>
      </>
    ) : (
      <>
        <input
  type="text"
  value={usernameDraft}
  onChange={(e) => setUsernameDraft(e.target.value)}
  autoFocus
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="none"
  spellCheck={false}
  name="mlpekayou-username"
  inputMode="text"
  className="flex-1 border-none bg-transparent text-lg text-gray-700 outline-none"
/>

        <button
          onClick={async () => {
            const trimmed = usernameDraft.trim();
            if (!trimmed) return;

            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) return;

            // Update Auth metadata
            await supabase.auth.updateUser({
              data: {
                username: trimmed,
              },
            });

            // Update profiles table
            await supabase.from("profiles").upsert({
              id: session.user.id,
              username: trimmed,
            });

            // Update local state immediately
            setProfile((prev: any) => ({
              ...prev,
              username: trimmed,
            }));

            setEditingUsername(false);
          }}
          className="ml-3 text-sm font-semibold text-[#4F46E5] flex-shrink-0"
        >
          Save
        </button>
      </>
    )}
  </div>
</div>

{/* Discord Username */}
<div className="w-full px-6 py-5 border-b border-gray-100">
  <div className="flex items-center">
    <div className="w-36 text-gray-900 text-lg">Discord</div>

    {!editingDiscord ? (
      <>
        <div
          className={`flex-1 text-lg truncate ${
            discord ? "text-gray-700" : "text-gray-400"
          }`}
          onClick={() => {
            setDiscordDraft(discord || "");
            setEditingDiscord(true);
          }}
        >
          {discord || "Add Discord username"}
        </div>

        <button
          onClick={() => {
            setDiscordDraft(discord || "");
            setEditingDiscord(true);
          }}
          className="ml-3 flex-shrink-0"
        >
          <Pencil className="h-4 w-4 text-gray-400" />
        </button>
      </>
    ) : (
      <>
        <input
  type="text"
  value={discordDraft}
  onChange={(e) => setDiscordDraft(e.target.value)}
  placeholder="Add Discord username"
  autoFocus
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="none"
  spellCheck={false}
  name="mlpekayou-discord"
  inputMode="text"
  className="flex-1 border-none bg-transparent text-lg text-gray-700 outline-none"
/>

        <button
          onClick={async () => {
            const trimmed = discordDraft.trim();

            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) return;

            await supabase.from("trading_profiles").upsert({
              user_id: session.user.id,
              discord_username: trimmed,
            });

            setDiscord(trimmed);
            setEditingDiscord(false);
          }}
          className="ml-3 text-sm font-semibold text-[#4F46E5] flex-shrink-0"
        >
          Save
        </button>
      </>
    )}
  </div>
</div>
{/* Log Out Button */}
<div className="w-full px-6 py-5">
  <Button
    variant="outline"
    className="w-full h-11 rounded-lg border-red-200 bg-white text-red-600 font-semibold hover:bg-red-50"
    onClick={async () => {
      await supabase.auth.signOut();
      setShowEditProfileModal(false);
      navigate("/");
    }}
  >
    Log Out
  </Button>
</div>
    </div>
  </div>
    </>
)}
{/* How the Avatars load in */}
{showAvatarPicker && (
  <div className="fixed inset-0 z-[110] bg-white sm:hidden overflow-y-auto">
    {/* Header */}
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="relative flex items-center justify-center h-14">
        <button
          onClick={() => setShowAvatarPicker(false)}
          className="absolute left-4 top-6 z-20 p-4 -m-2"
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
          }}
        >
          <span className="text-3xl leading-none text-gray-900">‹</span>
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          Choose Avatar
        </h2>
      </div>
    </div>

    {/* Avatar PFP Choosing Grid */}
    <div 
    className="pt-20 px-4 pb-4 grid grid-cols-3 gap-4">
      {avatarOptions.map(([fileName, src]) => (
        <button
          key={fileName}
          className="relative"
          onClick={() => handleAvatarSelect(fileName.replace(".webp", ""))}
disabled={savingAvatar}
        >
          <div
            className={`w-full aspect-square rounded-full overflow-hidden border-4 ${
              displayAvatar === src
                ? "border-purple-500"
                : "border-transparent"
            }`}
          >
            <img
              src={src}
              alt={fileName}
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      ))}
    </div>
  </div>
)}
{/* My Kayou Collection Menu */}
{showCollectionMenu && (
  <div
  id="collection-menu"
  className="fixed inset-0 z-[105] bg-[#f7f7f7] sm:hidden overflow-y-auto animate-in slide-in-from-right duration-300"
>
    {/* Top Bar — back arrow only (no title) */}
    <div
      className="sticky top-0 z-10 bg-[#f7f7f7]"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 44px)",
      }}
    >
      <div className="relative h-14">
        <button
  onClick={() => {
    const menu = document.getElementById("collection-menu");

    if (menu) {
      menu.classList.remove(
        "animate-in",
        "slide-in-from-right",
        "duration-300"
      );

      menu.classList.add(
        "animate-out",
        "slide-out-to-right",
        "duration-300"
      );

      setTimeout(() => {
        setShowCollectionMenu(false);
      }, 300);
    } else {
      setShowCollectionMenu(false);
    }
  }}
  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 -m-2"
>
  <span className="text-3xl leading-none text-gray-900">‹</span>
</button>
      </div>
    </div>

    {/* Menu List */}
    <div className="bg-white border-y border-gray-200">
      {/* My Progress */}
      <button
        onClick={() => navigate("/my-progress")}
        className="w-full flex items-center px-4 py-4 active:bg-gray-50"
      >
        <div className="w-8 flex justify-center text-gray-900">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 19V10" />
            <path d="M10 19V5" />
            <path d="M16 19V13" />
            <path d="M22 19V8" />
          </svg>
        </div>

        <div className="ml-4 flex-1 text-left">
          <div className="text-[17px] font-normal text-gray-900">
            CCG Progress
          </div>
          <div className="text-sm text-gray-500">
            Track your CCG progress here.
          </div>
          
        </div>

        <span className="text-2xl text-gray-400">›</span>
      </button>

      <div className="ml-16 border-t border-gray-100" />

      {/* TCG Progress */}
      <button
        onClick={() => navigate("/progress-tcg")}
        className="w-full flex items-center px-4 py-4 active:bg-gray-50"
      >
        <div className="w-8 flex justify-center text-gray-900">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 19V10" />
            <path d="M10 19V5" />
            <path d="M16 19V13" />
            <path d="M22 19V8" />
          </svg>
        </div>

        <div className="ml-4 flex-1 text-left">
          <div className="text-[17px] font-normal text-gray-900">
            TCG Progress
          </div>
          <div className="text-sm text-gray-500">
            Track your TCG progress here.
          </div>
        </div>

        <span className="text-2xl text-gray-400">›</span>
      </button>

      <div className="ml-16 border-t border-gray-100" />

      {/* My ISO List */}
      <button
        onClick={() => navigate("/my-iso")}
        className="w-full flex items-center px-4 py-4 active:bg-gray-50"
      >
        <div className="w-8 flex justify-center text-gray-900">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L17 17" />
          </svg>
        </div>

        <div className="ml-4 flex-1 text-left">
          <div className="text-[17px] font-normal text-gray-900">
            My ISO List
          </div>
          <div className="text-sm text-gray-500">
            Find a visual list of all missing cards.
          </div>
        </div>

        <span className="text-2xl text-gray-400">›</span>
      </button>

      <div className="ml-16 border-t border-gray-100" />

      <div className="ml-16 border-t border-gray-100" />

{/* Wishlist */}
<button
  onClick={() => navigate("/wishlist")}
  className="w-full flex items-center px-4 py-4 active:bg-gray-50"
>
  <div className="w-8 flex justify-center text-gray-900">
    <Heart className="w-6 h-6" />
  </div>

  <div className="ml-4 flex-1 text-left">
    <div className="text-[17px] font-normal text-gray-900">
      Wishlist
    </div>
    <div className="text-sm text-gray-500">
      View and manage your most wanted cards.
    </div>
  </div>

  <span className="text-2xl text-gray-400">›</span>
</button>

      {/* My Trades */}
      <button
        onClick={() => navigate("/inventory")}
        className="w-full flex items-center px-4 py-4 active:bg-gray-50"
      >
        <div className="w-8 flex justify-center text-gray-900">
          <ArrowLeftRight className="w-6 h-6" />
        </div>

        <div className="ml-4 flex-1 text-left">
          <div className="text-[17px] font-normal text-gray-900">
            My Trades
          </div>
          <div className="text-sm text-gray-500">
            Edit your inventory and trades.
          </div>
        </div>

        <span className="text-2xl text-gray-400">›</span>
      </button>
    </div>
  </div>
)}
{selectedCardImage && (
  <div
    className="fixed inset-0 z-[30000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
    onClick={() => setSelectedCardImage(null)}
  >
    <img
      src={selectedCardImage}
      alt="Selected Card"
      className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}
    </>
  );
};

export default UserMenu;
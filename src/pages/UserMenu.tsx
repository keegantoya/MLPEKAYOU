import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import {
  Grid3X3,
  ArrowLeftRight,
  Pencil,
} from "lucide-react";
import avatar001 from "@/assets/avatars/avatar001.jpg";
import avatar002 from "@/assets/avatars/avatar002.jpg";
import avatar003 from "@/assets/avatars/avatar003.jpg";
import avatar004 from "@/assets/avatars/avatar004.jpg";
import avatar005 from "@/assets/avatars/avatar005.jpg";
import avatar006 from "@/assets/avatars/avatar006.jpg";
import avatar007 from "@/assets/avatars/avatar007.jpg";
import avatar008 from "@/assets/avatars/avatar008.jpg";
import avatar009 from "@/assets/avatars/avatar009.jpg";
import avatar010 from "@/assets/avatars/avatar010.jpg";
import avatar011 from "@/assets/avatars/avatar011.jpg";
import avatar012 from "@/assets/avatars/avatar012.jpg";
import avatar013 from "@/assets/avatars/avatar013.jpg";
import avatar014 from "@/assets/avatars/avatar014.jpg";
import avatar015 from "@/assets/avatars/avatar015.jpg";

const avatarMap: Record<string, string> = {
  "avatar001.jpg": avatar001,
  "avatar002.jpg": avatar002,
  "avatar003.jpg": avatar003,
  "avatar004.jpg": avatar004,
  "avatar005.jpg": avatar005,
  "avatar006.jpg": avatar006,
  "avatar007.jpg": avatar007,
  "avatar008.jpg": avatar008,
  "avatar009.jpg": avatar009,
  "avatar010.jpg": avatar010,
  "avatar011.jpg": avatar011,
  "avatar012.jpg": avatar012,
  "avatar013.jpg": avatar013,
  "avatar014.jpg": avatar014,
  "avatar015.jpg": avatar015,
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
        .select("*")
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
  .select("*")
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
  .select("*")
  .eq("user_id", session.user.id);

const setOrder = [
  "1",
  "2",
  "5",
  "7",
  "8",
  "3",
  "9",
  "FW",
  "friendshipsbegin",
  "tcgpromos",
];

const rarityOrders: Record<string, string[]> = {
  // Eternal Moon
  "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
  "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
  "3": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],

  // Rainbow
  "5": ["R", "SR", "FR", "TR", "TGR", "MTR", "SSR", "UR", "USR", "XR"],

  // Fun Moments
  "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
  "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],

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
  const avatarOptions = Object.entries(avatarMap);
  const getAvatar = (avatar?: string) => {
  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";
  if (!file.includes(".")) file = `${file}.jpg`;

  return avatarMap[file] || avatar001;
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

    // Update local state so the new avatar appears right after sb updates it
    setProfile((prev: any) => ({
      ...prev,
      avatar_url: file,
    }));

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

  return `/friendships-begin/${cleanKey}.png`;
}
  if (card.set_id === "FW") {
    const num = card.card_key.slice(-2);

    if (card.card_key.startsWith("BP01ER")) {
      return `/fantasy-wonderland/SD01ER${num}.png`;
    }

    if (card.card_key.startsWith("BP01PER")) {
      return `/fantasy-wonderland/SD01PER${num}.png`;
    }

    return `/fantasy-wonderland/${card.card_key}.png`;
  }

  if (card.set_id === "9") {
    const number = card.card_key.split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (card.set_id === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.png`;
  }

  const [rarityRaw, number] = card.card_key.split("-");
  const rarity = rarityRaw === "SHINING ZR" ? "SZR" : rarityRaw;

  const config: Record<string, { folder: string; prefix: string }> = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "3": { folder: "third-edition-moon", prefix: "M3" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
  };

  const c = config[String(card.set_id)];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(
    3,
    "0"
  )}.jpg`;
};

const getSetName = (setId: string) => {
  const names: Record<string, string> = {
    "1": "Eternal Moon: First Edition",
    "2": "Eternal Moon: Second Edition",
    "5": "Rainbow: First Edition",
    "7": "Fun Moments: First Edition",
    "8": "Fun Moments: Second Edition",
    "3": "Eternal Moon: Third Edition",
    "9": "Promotional Cards",

    "FW": "Fantasy Wonderland",
    "SD": "Friendships Begin",
    "friendshipsbegin": "Friendships Begin",


    "tcgpromos": "TCG Promos",
  };

  return names[String(setId)] || String(setId);
};

// THE RETURN THAT GOES INTO THE OFFICIAL DATA. KEEGAN STOP MESSING THIS UP.

  return (
    <>
      {/* Header + Mobile Bottom Navigation */}
      {!showEditProfileModal &&
 !showAvatarPicker &&
 !showCollectionMenu && <KayouHeader />}

      {/* MOBILE ONLY */}
      <div className="sm:hidden min-h-screen bg-white pb-24 pt-7">
        <div className="px-4">
{/* Username at top */}
<div className="text-center mb-3">
  <h1 className="text-xl font-semibold tracking-tight text-gray-900">
    {displayName}
  </h1>
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
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
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
              This is your personal profile on MLPEKAYOU!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
  variant="outline"
  className="h-9 rounded-lg border-gray-300 bg-white text-gray-800 font-semibold"
  onClick={() => setShowEditProfileModal(true)}
>
  Edit Profile
</Button>

            <Button
  variant="outline"
  className="h-9 rounded-lg border-gray-300 bg-white text-gray-800 font-semibold"
  onClick={() => setShowCollectionMenu(true)}
>
  My Kayou Collection
</Button>
          </div>
        </div>
{/* Tab Bar */}
<div className="mt-6 border-t border-b border-gray-200">
  <div className="grid grid-cols-2">
    <button
      onClick={() => setActiveTab("collection")}
      className={`py-3 flex justify-center border-t-2 ${
        activeTab === "collection"
          ? "border-gray-900"
          : "border-transparent"
      }`}
    >
      <Grid3X3
        className={`h-5 w-5 ${
          activeTab === "collection"
            ? "text-gray-900"
            : "text-gray-400"
        }`}
      />
    </button>

    <button
      onClick={() => setActiveTab("trades")}
      className={`py-3 flex justify-center border-t-2 ${
        activeTab === "trades"
          ? "border-gray-900"
          : "border-transparent"
      }`}
    >
      <ArrowLeftRight
        className={`h-5 w-5 ${
          activeTab === "trades"
            ? "text-gray-900"
            : "text-gray-400"
        }`}
      />
    </button>
  </div>
</div>

{/* Tab Content */}
{activeTab === "collection" ? (
  <div>
    {/* Description */}
<div className="px-6 py-5 bg-white">
  <div className="relative flex items-center justify-center gap-3">
    <div className="h-px bg-gray-200 flex-1 max-w-[60px]" />

    <span className="text-[11px] tracking-[0.18em] font-semibold text-gray-500 uppercase">
      These are your rarest cards
    </span>

    <div className="h-px bg-gray-200 flex-1 max-w-[60px]" />
  </div>
</div>

    {/* Showcase Grid */}
    <div className="grid grid-cols-3 gap-[1px] bg-white">
    {showcaseCards.length > 0 ? (
      showcaseCards.map((card, index) => {
        const showDivider =
          index === 0 ||
          String(showcaseCards[index - 1].set_id) !==
            String(card.set_id);

        return (
          <>
            {showDivider && (
              <div
                key={`showcase-divider-${card.set_id}`}
                className="col-span-3 py-2 bg-white"
              >
                <div className="relative flex items-center justify-center gap-3">
                  <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />

                  <span className="text-[10px] tracking-[0.15em] font-semibold text-gray-500 uppercase">
                    {getSetName(String(card.set_id))}
                  </span>

                  <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />
                </div>
              </div>
            )}

            <div
              key={`${card.set_id}-${card.card_key}-${index}`}
              className="aspect-[5/7] bg-white overflow-hidden"
            >
<img
  src={getTradeCardImage(card)}
  alt={card.card_key}
  className={`w-full h-full bg-white ${
    String(card.set_id) === "FW" ||
    String(card.set_id) === "SD" ||
    String(card.set_id) === "friendshipsbegin"
      ? "object-contain p-1"
      : "object-cover"
  }`}
/>
            </div>
          </>
        );
      })
    ) : (
      <div className="col-span-3 py-12 text-center text-sm text-gray-500 bg-white">
        No rare cards collected yet.
      </div>
    )}
  </div>
  </div>
) : (
<div>
  {/* Edit Trades Button */}
  <div className="p-4">
    <Button
      variant="outline"
      className="w-full h-9 rounded-lg border-gray-300 bg-white text-gray-800 font-semibold"
      onClick={() => navigate("/my-trades")}
    >
      Edit Trades
    </Button>
  </div>

  {/* Trades Grid */}
  <div className="grid grid-cols-3 gap-[1px] bg-white">
    {tradeCards.length > 0 ? (
      tradeCards.map((card, index) => {
  const showDivider =
    index === 0 ||
    String(tradeCards[index - 1].set_id) !== String(card.set_id);

  return (
    <>
      {showDivider && (
        <div
          key={`divider-${card.set_id}`}
          className="col-span-3 py-2 bg-white"
        >
          <div className="relative flex items-center justify-center gap-3">
            <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />

            <span className="text-[10px] tracking-[0.15em] font-semibold text-gray-500 uppercase">
              {getSetName(String(card.set_id))}
            </span>

            <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />
          </div>
        </div>
      )}

     <div
  key={card.id}
  className="aspect-[5/7] bg-white overflow-hidden"
>
  <img
    src={getTradeCardImage(card)}
    alt={card.card_key}
    className={`w-full h-full bg-white ${
      String(card.set_id) === "FW" ||
      String(card.set_id) === "SD" ||
      String(card.set_id) === "friendshipsbegin"
        ? "object-contain p-1"
        : "object-cover"
    }`}
  />
</div>
    </>
  );
})
    ) : (
      <div className="col-span-3 py-12 text-center text-sm text-gray-500 bg-white">
        No cards marked for trade.
      </div>
    )}
  </div>
</div>
)}
      </div>

      {/* Render nothing on desktop */}
      <div className="hidden sm:block" />

{/* Edit Profile Screen */}
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
          onClick={() => handleAvatarSelect(fileName.replace(".jpg", ""))}
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
            Trarck your CCG progress here.
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

      {/* My Trades */}
      <button
        onClick={() => navigate("/my-trades")}
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
    </>
  );
};

export default UserMenu;
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
import { usePublicProfileCards } from "@/lib/public-profile-cards";
import { getTradeCardImage } from "@/lib/card-images";
export default function PublicProfile() {
  const { username } = useParams();

  const [profile, setProfile] = useState<any>(null);
  const [discord, setDiscord] = useState("");
const [copied, setCopied] = useState(false);

const [showCollectionModal, setShowCollectionModal] = useState(false);

const [collectionMode, setCollectionMode] = useState<
  "iso" | "wishlist" | "trade"
>("iso");

const [selectedSet, setSelectedSet] = useState("1");

const [stats, setStats] = useState({
  owned: 0,
  trades: 0,
  wishlist: 0,
});

const [hiddenIsoSets, setHiddenIsoSets] = useState<string[]>([]);

useEffect(() => {
  const loadProfile = async () => {
    if (!username) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*");

    const profileData = (profiles || []).find(
      (p: any) =>
        String(p.username).toLowerCase() ===
        String(username).toLowerCase()
    );

    if (!profileData) return;

    setProfile(profileData);

    const legacyHidden = profileData.iso_hidden_sets || [];

const hidden = [
  ...(profileData.iso_hidden_sets?.length
    ? profileData.iso_hidden_sets
    : legacyHidden),
  ...(profileData.iso_hidden_sets?.length
    ? profileData.iso_hidden_sets
    : legacyHidden),
];

setHiddenIsoSets(hidden);

    const { data: tradingProfile } = await supabase
      .from("trading_profiles")
      .select("discord_username")
      .eq("user_id", profileData.id)
      .maybeSingle();

    setDiscord(tradingProfile?.discord_username || "");
  };

  loadProfile();
}, [username]);

useEffect(() => {
  if (showCollectionModal) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };
}, [showCollectionModal]);

useEffect(() => {
  const loadStats = async () => {
    if (!profile?.id) return;

    // Cards owned
    const { data: collection } = await supabase
      .from("collection_progress_raw")
      .select("set_id, progress")
      .eq("user_id", profile.id);

    const filtered = (collection || []).filter(
      (row: any) => row.set_id !== "OTHERMERCH"
    );

    let owned = 0;

    filtered.forEach((row: any) => {
      owned += Object.values(row.progress || {}).filter(
        (value: any) =>
          value === true ||
          (typeof value === "object" && value?.owned === true)
      ).length;
    });

    // Cards for trade
    const { count: trades } = await supabase
      .from("for_trade")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    // Wishlist
    const { count: wishlist } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    setStats({
      owned,
      trades: trades ?? 0,
      wishlist: wishlist ?? 0,
    });
  };

  loadStats();
}, [profile]);

const { avatar } = getProfileAssets(profile);

const {
  isoCards,
  wishlistCards,
  tradeCards,
  loading,
} = usePublicProfileCards(profile?.id);

const getSetName = (setId: string) => {
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
    "12": "Discord",
    "tcgpromos": "TCG Promos",
  };

  return names[String(setId)] ?? String(setId);
};

const visibleIsoCards = useMemo(
  () =>
    isoCards.filter((card: any) => {
      const setId = String(card.set_id);

      if (hiddenIsoSets.includes(setId)) {
        return false;
      }

      if (
        setId === "SD" &&
        (
          hiddenIsoSets.includes("SD") ||
          hiddenIsoSets.includes("SD_STARTERS") ||
          hiddenIsoSets.includes("SD_BONUS")
        )
      ) {
        return false;
      }

      if (
        setId === "tcgpromos" &&
        hiddenIsoSets.includes("TCG_PROMOS")
      ) {
        return false;
      }

      return true;
    }),
  [isoCards, hiddenIsoSets]
);

const modalCards = useMemo(() => {
  switch (collectionMode) {
    case "wishlist":
      return wishlistCards;
    case "trade":
      return tradeCards;
    default:
      return visibleIsoCards;
  }
}, [collectionMode, visibleIsoCards, wishlistCards, tradeCards]);

const modalTabs = useMemo(() => {
  return Array.from(
    new Set(modalCards.map((c: any) => String(c.set_id)))
  );
}, [modalCards]);

const filteredCards = modalCards.filter(
  (c: any) => String(c.set_id) === selectedSet
);

const CollectionModal = () => {
  if (!showCollectionModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-8"
      onClick={() => setShowCollectionModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[72dvh] w-[96vw] sm:max-h-[80vh] sm:w-[85vw] max-w-[1400px] flex-col sm:flex-row rounded-3xl border border-yellow-500/20 bg-[#171717] overflow-hidden shadow-2xl"
      >
        {/* Sidebar */}
        <div className="w-full sm:w-56 border-b sm:border-b-0 sm:border-r border-zinc-800 bg-[#111111] overflow-x-auto sm:overflow-y-auto kayou-scrollbar flex sm:block">

          <div className="p-3 sm:p-6 border-b border-zinc-800">
            <h2 className="font-oxanium text-2xl font-bold text-white">
              {collectionMode === "iso"
                ? "ISO"
                : collectionMode === "wishlist"
                ? "Wishlist"
                : "For Trade"}
            </h2>
          </div>

          {modalTabs.map((setId) => (
            <button
              key={setId}
              onClick={() => setSelectedSet(setId)}
              className={`shrink-0 sm:w-full text-left px-3 py-2 sm:px-6 sm:py-4 transition ${
                selectedSet === setId
                  ? "bg-yellow-500 text-black font-bold"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
{getSetName(setId)}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex-1 overflow-y-auto kayou-scrollbar">

          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-[#171717] px-3 py-2 sm:px-8 sm:py-6">

            <h1 className="font-oxanium text-lg sm:text-3xl font-bold">
  {getSetName(selectedSet)}
</h1>

            <button
              onClick={() => setShowCollectionModal(false)}
              className="text-3xl sm:text-5xl text-zinc-400 hover:text-white"
            >
              ×
            </button>

          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-8">

            {filteredCards
  .sort((a: any, b: any) => {
    const rarityOrder: Record<string, string[]> = {
      "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
      "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
      "3": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],
      "4": ["SSR","SCR","UR","USR","AR","OR","BP","SAR"],
      "5": ["R","FR","SR","SSR","TR","TGR","MTR","UR","USR","XR"],
      "6": ["BASE","R","SR","ST","SSR","FR","TR","TGR","UR","USR","XR"],
      "7": ["N","SN","R","SR","SSR","UR","CR"],
      "8": ["N","SN","R","SR","SSR","UR","UGR","CR"],
      "11": ["N","SN","R","SR","SSR","UR","UGR","CR","SCR"],
      "9": ["PR"],
      "tcgpromos": ["PR"],
      "friendshipsbegin": ["C","U","SR","SPR","ER","GR","CR","PER","PRR"],
      "FW": ["C","U","ER","SR","SPR","GR","CR","RR","PER","PSPR","PGR","PCR","PRR"],
      "12": ["C","U","ER","SR","SPR","GR","CR","RR","PER","PSPR","PGR","PCR","PRR"],
    };

    const getRarity = (card: any) => {
      if (card.set_id === "FW") {
        return card.card_key.match(/BP01([A-Z]+)\d+/)?.[1] ?? "";
      }

      if (card.set_id === "12") {
        return card.card_key.match(/BP02-([A-Z]+)\d+/)?.[1] ?? "";
      }

      if (
        card.set_id === "friendshipsbegin" ||
        card.set_id === "SD"
      ) {
        return card.card_key.match(/SD01([A-Z]+)\d+/)?.[1] ?? "";
      }

      return card.card_key.split("-")[0];
    };

    const getNumber = (card: any) => {
      const match = card.card_key.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const order =
      rarityOrder[String(a.set_id)] ?? [];

    const rarityDiff =
      order.indexOf(getRarity(a)) -
      order.indexOf(getRarity(b));

    if (rarityDiff !== 0) return rarityDiff;

    return getNumber(a) - getNumber(b);
  })
  .map((card: any) => (
              <div
  key={`${card.set_id}-${card.card_key}`}
  className={`relative overflow-hidden rounded-lg bg-zinc-900 ${
    String(card.set_id) === "3" &&
    String(card.card_key) === "SZR-1"
      ? "col-span-2 aspect-[10/7]"
      : "aspect-[5/7]"
  }`}
>
<img
  src={getTradeCardImage(card)}
  alt={card.card_key}
  className={`absolute w-full ${
    ["FW", "SD", "friendshipsbegin", "12"].includes(String(card.set_id))
      ? "h-full object-contain"
      : "inset-x-0 -top-[7px] -bottom-[7px] h-auto min-h-[calc(100%+14px)] object-cover"
  }`}
/>
</div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-[#111111] pb-40 sm:pb-0 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
{/* Banner */}
<div className="relative overflow-hidden rounded-[32px] border border-[#d4af37]/20 bg-[#1a1a1a] shadow-[0_0_40px_rgba(0,0,0,.55)]">

  {/* Background */}
  <div className="absolute inset-0 bg-[linear-gradient(135deg,#1b1b1b_0%,#222222_45%,#1a1a1a_100%)]" />

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,.16),transparent_45%)]" />

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,.08),transparent_55%)]" />

  {/* Decorative Line */}
  <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />

<div className="relative px-5 py-6 sm:px-8 sm:py-8 xl:px-10 xl:py-10">

    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">

      {/* Left */}
      <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:text-left gap-6 xl:gap-8">

        <div className="relative">

          <div className="absolute inset-0 rounded-full bg-[#d4af37]/20 blur-2xl" />

          <img
            src={avatar}
            alt={profile?.username}
            className="relative h-28 w-28 sm:h-32 sm:w-32 xl:h-40 xl:w-40 rounded-full border-[4px] xl:border-[5px] border-[#d4af37] object-cover shadow-[0_0_35px_rgba(212,175,55,.35)]"
          />

        </div>

        <div>

          <div className="flex items-center justify-center xl:justify-start gap-2">

            <h1 className="font-oxanium text-3xl sm:text-4xl xl:text-5xl font-bold tracking-wide text-white break-all">
              {profile?.username || "Loading..."}
            </h1>

            {/* Verified badge placeholder */}
            <div className="h-7 w-7 rounded-full bg-[#d4af37] text-black flex items-center justify-center font-bold">
              ✓
            </div>

          </div>

          <p className="mt-2 text-xl font-medium text-[#d4af37]">
            @{discord || "No Discord Username"}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            <span className="rounded-full border border-[#2d2d2d] bg-[#202020] px-4 py-2 text-sm text-zinc-300">
              Verified Collector
            </span>

            <span className="rounded-full border border-[#2d2d2d] bg-[#202020] px-4 py-2 text-sm text-zinc-300">
              Kayou U.S. Superfan
            </span>

            <span className="rounded-full border border-[#2d2d2d] bg-[#202020] px-4 py-2 text-sm text-zinc-300">
              MLPEKAYOU Member
            </span>

          </div>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-zinc-400">
            This is my public profile! I can be reached via discord by the yellow username above.
            If my DMs are off, please contact me via the MLPEKAYOU Discord server instead.
          </p>

        </div>

      </div>

      {/* Right */}
      <div className="flex flex-col gap-4">

<button
  onClick={() => {
    const url = `https://www.mlpekayou.com/${encodeURIComponent(
  profile?.username ?? ""
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
  className="rounded-2xl border border-[#d4af37]/25 bg-[#222222] px-8 py-3 font-semibold text-white transition hover:border-[#d4af37] hover:bg-[#282828]"
>
  {copied ? "Copied!" : "Share Profile"}
</button>

      </div>

    </div>

  </div>
</div>
        {/* Quick Stats */}

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-6 gap-5">

{[
  ["Cards", stats.owned.toLocaleString()],
  ["Trades", stats.trades.toLocaleString()],
  ["Wishlist", stats.wishlist.toLocaleString()],
].map(([title, value]) => (
            <div
              key={title}
              className="rounded-2xl border border-yellow-500/15 bg-[#1b1b1b] p-5"
            >
              <div className="text-3xl font-bold text-yellow-400">
                {value}
              </div>

              <div className="mt-2 text-sm uppercase tracking-widest text-gray-500">
                {title}
              </div>
            </div>
          ))}

        </div>

        {/* Main Grid */}

<div className="mt-8 grid gap-8 xl:grid-cols-3">

          {/* ISO */}

<div
  className={`rounded-3xl border border-yellow-500/15 bg-[#1b1b1b] p-6 ${
    wishlistCards.length === 0 && tradeCards.length === 0
      ? "max-w-[700px] mx-auto w-full"
      : "w-full"
  }`}
>

            <div className="mb-6 flex items-center justify-between">

              <h2 className="font-oxanium text-2xl font-bold">
                ISO
              </h2>

              <button
onClick={() => {
  setCollectionMode("iso");
  setSelectedSet(String(visibleIsoCards[0]?.set_id ?? ""));
  setShowCollectionModal(true);
}}
  className="text-sm text-yellow-400 hover:text-yellow-300"
>
  View All →
</button>
            </div>
{visibleIsoCards.length === 0 ? (
  <div className="flex min-h-[120px] sm:min-h-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-700 px-6 py-10 text-center text-sm sm:text-lg font-medium text-zinc-500">
    There's nothing to see here!
  </div>
) : (
  <div className="grid grid-cols-4 gap-3 max-w-[700px] mx-auto">
    {visibleIsoCards.slice(0, 8).map((card: any) => (
      <div
        key={`${card.set_id}-${card.card_key}`}
        className={`relative overflow-hidden rounded-xl bg-zinc-900 ${
          String(card.set_id) === "3" &&
          String(card.card_key) === "SZR-1"
            ? "col-span-2 aspect-[10/7]"
            : "aspect-[5/7]"
        }`}
      >
        <img
          src={getTradeCardImage(card)}
          alt={card.card_key}
          className={`absolute w-full ${
            ["FW", "SD", "friendshipsbegin", "12"].includes(String(card.set_id))
              ? "h-full object-contain"
              : "inset-x-0 -top-[7px] -bottom-[7px] h-auto min-h-[calc(100%+14px)] object-cover"
          }`}
        />
      </div>
    ))}
  </div>
)}

          </div>

          {/* Wishlist */}

<div className="rounded-3xl border border-yellow-500/15 bg-[#1b1b1b] p-6">

    <div className="mb-6 flex items-center justify-between">
      <h2 className="font-oxanium text-2xl font-bold">
        Wishlist
      </h2>

<button
disabled={wishlistCards.length === 0}
onClick={() => {
  if (wishlistCards.length === 0) return;
  setCollectionMode("wishlist");
  setSelectedSet(String(wishlistCards[0]?.set_id ?? ""));
  setShowCollectionModal(true);
}}
className={`text-sm ${
  wishlistCards.length === 0
    ? "cursor-not-allowed text-zinc-600"
    : "text-yellow-400 hover:text-yellow-300"
}`}
>
  View All →
</button>
    </div>

{wishlistCards.length === 0 ? (
  <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-lg font-medium">
    There's nothing to see here!
  </div>
) : (
  <div className="grid grid-cols-4 gap-3">
    {wishlistCards.slice(0, 8).map((card: any) => (
<div
  key={`${card.set_id}-${card.card_key}`}
  className={`relative overflow-hidden rounded-xl bg-zinc-900 ${
    String(card.set_id) === "3" &&
    String(card.card_key) === "SZR-1"
      ? "col-span-2 aspect-[10/7]"
      : "aspect-[5/7]"
  }`}
>
<img
  src={getTradeCardImage(card)}
  alt={card.card_key}
  className={`absolute w-full ${
    ["FW", "SD", "friendshipsbegin", "12"].includes(String(card.set_id))
      ? "h-full object-contain"
      : "inset-x-0 -top-[7px] -bottom-[7px] h-auto min-h-[calc(100%+14px)] object-cover"
  }`}
/>
</div>
    ))}
  </div>
)}

  </div>

          {/* Trades */}

<div className="rounded-3xl border border-yellow-500/15 bg-[#1b1b1b] p-6">

    <div className="mb-6 flex items-center justify-between">
      <h2 className="font-oxanium text-2xl font-bold">
        For Trade
      </h2>

<button
disabled={tradeCards.length === 0}
onClick={() => {
  if (tradeCards.length === 0) return;
  setCollectionMode("trade");
  setSelectedSet(String(tradeCards[0]?.set_id ?? ""));
  setShowCollectionModal(true);
}}
className={`text-sm ${
  tradeCards.length === 0
    ? "cursor-not-allowed text-zinc-600"
    : "text-yellow-400 hover:text-yellow-300"
}`}
>
  View All →
</button>
    </div>

{tradeCards.length === 0 ? (
  <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-lg font-medium">
    There's nothing to see here!
  </div>
) : (
  <div className="grid grid-cols-4 gap-3">
    {tradeCards.slice(0, 8).map((card: any) => (
<div
  key={`${card.set_id}-${card.card_key}`}
  className={`relative overflow-hidden rounded-xl bg-zinc-900 ${
    String(card.set_id) === "3" &&
    String(card.card_key) === "SZR-1"
      ? "col-span-2 aspect-[10/7]"
      : "aspect-[5/7]"
  }`}
>
<img
  src={getTradeCardImage(card)}
  alt={card.card_key}
  className={`absolute w-full ${
    ["FW", "SD", "friendshipsbegin", "12"].includes(String(card.set_id))
      ? "h-full object-contain"
      : "inset-x-0 -top-[7px] -bottom-[7px] h-auto min-h-[calc(100%+14px)] object-cover"
  }`}
/>
</div>
    ))}
  </div>
)}
  </div>

        </div>
        <CollectionModal />

      </div>

      
    </div>
  );
}
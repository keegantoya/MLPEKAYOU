import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
import NotFound from "../NotFound";
import { usePublicProfileCards } from "@/lib/public-profile-cards";
import { getTradeCardImage } from "@/lib/card-images";
export default function PublicProfile() {
  const { username } = useParams();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
const [profileNotFound, setProfileNotFound] = useState(false);
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
  let cancelled = false;

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileNotFound(false);
    setProfile(null);

    if (!username) {
      if (!cancelled) {
        setProfileLoading(false);
        setProfileNotFound(true);
      }
      return;
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*");

    if (cancelled) return;

    const profileData = (profiles || []).find(
      (p: any) =>
        String(p.username).toLowerCase() ===
        String(username).toLowerCase()
    );

    if (error || !profileData) {
      setProfileLoading(false);
      setProfileNotFound(true);
      return;
    }

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

    if (cancelled) return;

    setDiscord(tradingProfile?.discord_username || "");
    setProfileLoading(false);
  };

  loadProfile();

  return () => {
    cancelled = true;
  };
}, [username]);


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

  const modeLabel =
    collectionMode === "iso"
      ? "ISO"
      : collectionMode === "wishlist"
        ? "Wishlist"
        : "For Trade";

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-[#020303]/95 backdrop-blur-md sm:flex sm:items-center sm:justify-center sm:overflow-hidden sm:p-8"
      onClick={() => setShowCollectionModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex min-h-full w-full flex-col overflow-visible border border-[#FFD54A]/25 bg-[#0b0d0d] shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:h-[86vh] sm:max-h-[900px] sm:min-h-0 sm:w-[88vw] sm:max-w-[1400px] sm:flex-row sm:overflow-hidden"
      >
        {/* SET NAVIGATION */}
        <div className="flex w-full shrink-0 flex-col border-b border-white/[0.08] bg-[#090b0b] sm:w-60 sm:border-b-0 sm:border-r">
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:block sm:p-6">
            <h2 className="font-['Oxanium'] text-base font-black uppercase tracking-[0.08em] text-white sm:text-lg">
              {modeLabel}
            </h2>
            <span className="font-mono text-[6px] uppercase tracking-[0.18em] text-zinc-700 sm:mt-2 sm:block">
              {modalTabs.length.toString().padStart(2, "0")} SETS
            </span>
          </div>

          {/* On mobile this is one horizontal, non-wrapping strip. */}
          <div className="flex min-w-0 flex-nowrap overflow-x-auto overflow-y-hidden kayou-scrollbar sm:block sm:flex-1 sm:overflow-x-hidden sm:overflow-y-auto">
            {modalTabs.map((setId) => (
              <button
                key={setId}
                onClick={() => setSelectedSet(setId)}
                className={`shrink-0 border-r border-white/[0.04] px-4 py-3 text-left font-mono text-[8px] font-bold uppercase tracking-[0.14em] transition sm:w-full sm:border-r-0 sm:border-b sm:px-6 sm:py-4 ${
                  selectedSet === setId
                    ? "bg-[#FFD54A] font-black text-black shadow-[inset_3px_0_0_#111]"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {getSetName(setId)}
              </button>
            ))}
          </div>
        </div>

        {/* CARD VIEW */}
        <div className="min-w-0 flex-1 overflow-x-hidden bg-[#0b0d0d] sm:min-h-0 sm:overflow-y-auto sm:overscroll-contain sm:kayou-scrollbar">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.08] bg-[#0b0d0d]/95 px-4 py-3 backdrop-blur-xl sm:px-8 sm:py-5">
            <div className="min-w-0">
              <div className="mb-1 font-mono text-[5px] font-bold uppercase tracking-[0.25em] text-[#FFD54A]/45 sm:text-[6px]">
                {modeLabel} // COLLECTION
              </div>
              <h1 className="truncate font-['Oxanium'] text-base font-black uppercase tracking-[0.08em] text-white sm:text-2xl">
                {getSetName(selectedSet)}
              </h1>
            </div>

            <button
              onClick={() => setShowCollectionModal(false)}
              aria-label="Close collection viewer"
              className="ml-3 shrink-0 border border-white/[0.08] px-3 py-1 font-mono text-lg leading-none text-zinc-500 transition hover:border-[#FFD54A]/40 hover:text-[#FFD54A] sm:px-3 sm:py-2 sm:text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-3 sm:p-8">
            {filteredCards.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center border border-dashed border-white/[0.10] bg-[#090b0b] px-6 text-center font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600 sm:min-h-[300px]">
                There's nothing to see here!
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-4 xl:grid-cols-6">
                {filteredCards
                  .slice()
                  .sort((a: any, b: any) => {
                    const rarityOrder: Record<string, string[]> = {
                      "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
                      "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
                      "3": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],
                      "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
                      "5": ["R", "FR", "SR", "SSR", "TR", "TGR", "MTR", "UR", "USR", "XR"],
                      "6": ["BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],
                      "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
                      "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
                      "11": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR", "SCR"],
                      "9": ["PR"],
                      "tcgpromos": ["PR"],
                      "friendshipsbegin": ["C", "U", "SR", "SPR", "ER", "GR", "CR", "PER", "PRR"],
                      "FW": ["C", "U", "ER", "SR", "SPR", "GR", "CR", "RR", "PER", "PSPR", "PGR", "PCR", "PRR"],
                      "12": ["C", "U", "ER", "SR", "SPR", "GR", "CR", "RR", "PER", "PSPR", "PGR", "PCR", "PRR"],
                    };

                    const getRarity = (card: any) => {
                      if (card.set_id === "FW") {
                        return card.card_key.match(/BP01([A-Z]+)\d+/)?.[1] ?? "";
                      }

                      if (card.set_id === "12") {
                        return card.card_key.match(/BP02-([A-Z]+)\d+/)?.[1] ?? "";
                      }

                      if (card.set_id === "friendshipsbegin" || card.set_id === "SD") {
                        return card.card_key.match(/SD01([A-Z]+)\d+/)?.[1] ?? "";
                      }

                      return card.card_key.split("-")[0];
                    };

                    const getNumber = (card: any) => {
                      const match = card.card_key.match(/(\d+)$/);
                      return match ? parseInt(match[1], 10) : 0;
                    };

                    const order = rarityOrder[String(a.set_id)] ?? [];
                    const rarityDiff =
                      order.indexOf(getRarity(a)) - order.indexOf(getRarity(b));

                    if (rarityDiff !== 0) return rarityDiff;
                    return getNumber(a) - getNumber(b);
                  })
                  .map((card: any) => (
                    <div
                      key={`${card.set_id}-${card.card_key}`}
                      className={`group relative overflow-hidden rounded-md border border-white/[0.07] bg-[#111313] shadow-[0_8px_22px_rgba(0,0,0,.3)] ${
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
                          ["FW", "SD", "friendshipsbegin", "12"].includes(
                            String(card.set_id)
                          )
                            ? "inset-0 h-full object-contain"
                            : "inset-x-0 -top-[7px] -bottom-[7px] h-auto min-h-[calc(100%+14px)] object-cover"
                        }`}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

if (profileLoading) {
  return null;
}

if (profileNotFound) {
  return <NotFound />;
}

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#040606] pb-40 text-white sm:pb-0">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.42]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,212,74,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 opacity-[0.07] bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.08)_4px)]" />
      <div className="pointer-events-none fixed left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#FFD54A] to-transparent opacity-70" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-32 w-full bg-[radial-gradient(ellipse_at_center,rgba(255,212,74,.08),transparent_70%)]" />
    <div className="relative mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-8">
{/* Banner */}
<div className="relative overflow-hidden border border-[#FFD54A]/25 bg-[#080b0b] shadow-[0_30px_100px_rgba(0,0,0,.70)]">
  <div className="pointer-events-none absolute left-0 top-0 h-16 w-16 border-l-2 border-t-2 border-[#FFD54A]/80" />
  <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-r-2 border-t-2 border-[#FFD54A]/50" />
  <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-28 border-b-2 border-l-2 border-[#FFD54A]/50" />
  <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-28 border-b-2 border-r-2 border-[#FFD54A]/50" />
  <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-white/[0.025]" />

  <div className="relative z-10 flex items-center justify-between border-b border-white/[0.07] bg-[#060808]/80 px-4 py-2 sm:px-6">
    <div className="flex items-center gap-3">
      <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
      <span className="font-mono text-[6px] font-bold uppercase tracking-[0.32em] text-emerald-400/80">PUBLIC PROFILE LINK</span>
      <span className="hidden font-mono text-[6px] uppercase tracking-[0.25em] text-zinc-700 sm:inline">/</span>
      <span className="hidden font-mono text-[6px] uppercase tracking-[0.25em] text-zinc-600 sm:inline">NODE ACTIVE</span>
    </div>
    <span className="font-mono text-[6px] uppercase tracking-[0.28em] text-[#FFD54A]/50">PROFILE_OS // 001</span>
  </div>

  {/* Background */}
  <div className="absolute inset-0 bg-[linear-gradient(135deg,#060909_0%,#111515_45%,#060808_100%)]" />

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,212,74,.13),transparent_38%)]" />

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,212,74,.06),transparent_50%)]" />

  {/* Decorative Line */}
  <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#FFD54A]/80 to-transparent" />

<div className="relative px-5 py-7 sm:px-8 sm:py-9 xl:px-10 xl:py-10">

    <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

      {/* Left */}
      <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:text-left gap-6 xl:gap-8">

        <div className="relative shrink-0">
          <div className="absolute -inset-4 border border-[#FFD54A]/20 bg-[#FFD54A]/[0.025] shadow-[0_0_45px_rgba(255,212,74,.12)]" />
          <div className="absolute -inset-2 border border-dashed border-[#FFD54A]/15" />
          <div className="absolute -left-5 top-1/2 h-px w-4 bg-[#FFD54A]/70" />
          <div className="absolute -right-5 top-1/2 h-px w-4 bg-[#FFD54A]/70" />
          <div className="absolute left-1/2 -top-5 h-4 w-px bg-[#FFD54A]/60" />
          <div className="absolute bottom-[-20px] left-1/2 h-4 w-px bg-[#FFD54A]/60" />
          <div className="absolute -right-3 -top-3 border border-[#FFD54A]/30 bg-[#0a0d0d] px-2 py-1">
          </div>
          <img
            src={avatar}
            alt={profile?.username}
            className="relative h-28 w-28 rounded-md border-2 border-[#FFD54A]/70 bg-[#0b0d0d] object-cover shadow-[0_0_35px_rgba(255,212,74,.20)] sm:h-32 sm:w-32 xl:h-40 xl:w-40"
          />
        </div>

        <div>

          <div className="mb-3 flex items-center justify-center gap-2 xl:justify-start">
          <span className="font-mono text-[6px] font-bold uppercase tracking-[0.32em] text-zinc-600">IDENTITY CHANNEL</span>
          <span className="h-px w-10 bg-[#FFD54A]/30" />
          <span className="font-mono text-[6px] uppercase tracking-[0.22em] text-emerald-400/60">SECURE</span>
        </div>
        <div className="flex items-center justify-center gap-3 xl:justify-start">

            <h1 className="font-['Oxanium'] text-3xl font-black uppercase tracking-[0.03em] text-white break-all sm:text-4xl xl:text-5xl">
              {profile?.username || "Loading..."}
            </h1>

            {/* Verified badge placeholder */}
            <div className="flex h-6 w-6 items-center justify-center border border-[#FFD54A]/50 bg-[#FFD54A] font-mono text-xs font-black text-black">
              ✓
            </div>

          </div>

          <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#FFD54A]">
            @{discord || "No Discord Username"}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">

            <span className="border border-white/[0.08] bg-[#0d0f0f] px-3 py-2 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              Verified Collector
            </span>

            <span className="border border-white/[0.08] bg-[#0d0f0f] px-3 py-2 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              Kayou U.S. Superfan
            </span>

            <span className="border border-white/[0.08] bg-[#0d0f0f] px-3 py-2 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              MLPEKAYOU Member
            </span>

          </div>

          <p className="mt-5 max-w-2xl border-l border-[#FFD54A]/25 pl-4 font-mono text-[9px] uppercase leading-6 tracking-[0.08em] text-zinc-500 sm:text-[10px]">
            I can be contacted here on-app by sending me a friend request in Explore. If not, then find me in the
            MLPEKAYOU Discord server by my @username above.
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
  className="group relative overflow-hidden border border-[#FFD54A]/50 bg-[#080b0b] px-7 py-3 font-mono text-[8px] font-black uppercase tracking-[0.22em] text-[#FFD54A] transition hover:border-[#FFD54A] hover:bg-[#FFD54A] hover:text-black"
>
  {copied ? "Copied!" : "Share Profile"}
</button>

      </div>

    </div>

  </div>
</div>
        {/* Quick Stats */}

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">

{[
  ["Cards", stats.owned.toLocaleString()],
  ["Trades", stats.trades.toLocaleString()],
  ["Wishlist", stats.wishlist.toLocaleString()],
].map(([title, value]) => (
            <div
              key={title}
              className="group relative overflow-hidden border border-white/[0.08] bg-[#0b0e0e] p-4 shadow-[0_14px_34px_rgba(0,0,0,.40)] transition hover:border-[#FFD54A]/30 sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[5px] font-bold uppercase tracking-[0.24em] text-zinc-600">TELEMETRY</span>
                <span className="h-1 w-5 bg-[#FFD54A]/30 transition group-hover:bg-[#FFD54A]" />
              </div>
              <div className="font-['Oxanium'] text-2xl font-black text-[#FFD54A] sm:text-3xl">
                {value}
              </div>

              <div className="mt-2 font-mono text-[7px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                {title}
              </div>
            </div>
          ))}

        </div>

        {/* Main Grid */}

<div className="mt-5 grid gap-4 xl:grid-cols-3">

          {/* ISO */}

<div
  className={`relative overflow-hidden border border-white/[0.08] bg-[#101212] p-4 shadow-[0_18px_45px_rgba(0,0,0,.3)] sm:p-5 ${
    wishlistCards.length === 0 && tradeCards.length === 0
      ? "max-w-[700px] mx-auto w-full"
      : "w-full"
  }`}
>

            <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3">

              <div className="flex items-center gap-2">
                <span className="font-mono text-[5px] font-bold uppercase tracking-[0.28em] text-[#FFD54A]/60">MODULE 02</span>
                <span className="h-px w-6 bg-[#FFD54A]/25" />
                <h2 className="font-['Oxanium'] text-base font-black uppercase tracking-[0.08em] text-white sm:text-lg">
                  ISO
                </h2>
              </div>

              <button
onClick={() => {
  setCollectionMode("iso");
  setSelectedSet(String(visibleIsoCards[0]?.set_id ?? ""));
  setShowCollectionModal(true);
}}
  className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-[#FFD54A] hover:text-white"
>
  View All →
</button>
            </div>
{visibleIsoCards.length === 0 ? (
  <div className="flex min-h-[180px] items-center justify-center border border-dashed border-white/[0.10] bg-[#0b0d0d] px-6 py-10 text-center font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600 sm:min-h-[260px]">
    There's nothing to see here!
  </div>
) : (
  <div className="grid grid-cols-4 gap-3 max-w-[700px] mx-auto">
    {visibleIsoCards.slice(0, 8).map((card: any) => (
      <div
        key={`${card.set_id}-${card.card_key}`}
        className={`group relative overflow-hidden rounded-md border border-white/[0.07] bg-[#0b0d0d] shadow-[0_10px_25px_rgba(0,0,0,.32)] ${
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

<div className="relative overflow-hidden border border-white/[0.08] bg-[#0b0e0e] p-4 shadow-[0_18px_50px_rgba(0,0,0,.42)] sm:p-5">

    <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3">
      <h2 className="font-['Oxanium'] text-base font-black uppercase tracking-[0.08em] text-white sm:text-lg">
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
className={`font-mono text-[7px] font-bold uppercase tracking-[0.18em] ${
  wishlistCards.length === 0
    ? "cursor-not-allowed text-zinc-600"
    : "text-yellow-400 hover:text-yellow-300"
}`}
>
  View All →
</button>
    </div>

{wishlistCards.length === 0 ? (
  <div className="flex h-[260px] items-center justify-center border border-dashed border-white/[0.10] bg-[#0b0d0d] font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600">
    There's nothing to see here!
  </div>
) : (
  <div className="grid grid-cols-4 gap-3">
    {wishlistCards.slice(0, 8).map((card: any) => (
<div
  key={`${card.set_id}-${card.card_key}`}
  className={`group relative overflow-hidden rounded-md border border-white/[0.07] bg-[#0b0d0d] shadow-[0_10px_25px_rgba(0,0,0,.32)] ${
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

<div className="relative overflow-hidden border border-white/[0.08] bg-[#101212] p-4 shadow-[0_18px_45px_rgba(0,0,0,.3)] sm:p-5">

    <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3">
      <h2 className="font-['Oxanium'] text-base font-black uppercase tracking-[0.08em] text-white sm:text-lg">
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
  <div className="flex h-[260px] items-center justify-center border border-dashed border-white/[0.10] bg-[#0b0d0d] font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600">
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
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="font-mono text-[5px] uppercase tracking-[0.28em] text-zinc-700">MLPEKAYOU // PUBLIC COLLECTION NETWORK</span>
          <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-emerald-400/40">LINK STABLE</span>
        </div>

        <CollectionModal />

      </div>

      
    </div>
  );
}
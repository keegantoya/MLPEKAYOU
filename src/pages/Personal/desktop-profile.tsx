import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";

export default function DesktopProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);

  const [discord, setDiscord] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [discordDraft, setDiscordDraft] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

const [stats, setStats] = useState({
  owned: 0,
  completed: 0,
  friends: 0,
});

const [showcaseTab, setShowcaseTab] = useState<
  "moon" | "star" | "fun" | "rainbow" | "tcg"
>("moon");

const [showcaseCards, setShowcaseCards] = useState<any[]>([]);
const [selectedCardImage, setSelectedCardImage] = useState<string | null>(null);
const [copied, setCopied] = useState(false);
const [deletionRequested, setDeletionRequested] = useState(false);
const [showDeletionModal, setShowDeletionModal] = useState(false);
const [submittingDeletion, setSubmittingDeletion] = useState(false);

// Leaderboard self-ban
const [leaderboardBanned, setLeaderboardBanned] = useState(false);
const [loadingLeaderboardBan, setLoadingLeaderboardBan] = useState(true);
const [showLeaderboardBanInfo, setShowLeaderboardBanInfo] = useState(false);

const tabs = [
  { label: "Collection", path: "/binders" },
  { label: "Inventory", path: "/inventory" },
  { label: "Wishlist & ISO", path: "/iso" },
  { label: "Inbox & Friends", path: "/inbox" },
  { label: "Trading", path: "/trading-post" },
  { label: "Kayou Events", path: "/kayou-news" },
];

  useEffect(() => {
    loadProfile();
    loadStats();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
      loadStats();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

const { data } = await supabase
  .from("profiles")
  .select("id, username, avatar_url")
  .eq("id", session.user.id)
  .single();

if (data) {
  setProfile(data);
}

setUsernameDraft(data?.username || "");

    const { data: trading } = await supabase
      .from("trading_profiles")
      .select("discord_username")
      .eq("user_id", session.user.id)
      .single();

    setDiscord(trading?.discord_username || "");
    setDiscordDraft(trading?.discord_username || "");

    const { data: leaderboardBan, error: leaderboardBanError } =
      await supabase
        .from("leaderboard_exclusions")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (leaderboardBanError) {
      console.error(
        "Leaderboard ban status error:",
        leaderboardBanError
      );
    }

    setLeaderboardBanned(!!leaderboardBan);
    setLoadingLeaderboardBan(false);
  }

async function selfBanFromLeaderboard() {
  if (leaderboardBanned) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    console.error("Leaderboard self-ban: no authenticated session.");
    return;
  }

  // Immediately lock the control so it cannot be clicked twice.
  setLeaderboardBanned(true);
  setLoadingLeaderboardBan(false);

  const { error } = await supabase
    .from("leaderboard_exclusions")
    .upsert(
      {
        user_id: session.user.id,
        reason:
          "Self-banned from leaderboard because user collects non-North American cards",
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    // Do not leave the UI showing a ban if Supabase rejected the write.
    console.error("Leaderboard self-ban error:", error);
    setLeaderboardBanned(false);
    return;
  }

  // Keep it permanently locked in the UI after a successful write.
  setLeaderboardBanned(true);
}



async function requestAccountDeletion() {
  if (deletionRequested || submittingDeletion) return;

  setSubmittingDeletion(true);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setShowDeletionModal(false);
      return;
    }

    const { error } = await supabase
      .from("account_deletion_requests")
      .insert({
        user_id: session.user.id,
        username: profile?.username || null,
      });

    if (error) {
      console.error("Account deletion request error:", error);

      if (error.code === "23505") {
        setDeletionRequested(true);
      }

      return;
    }

    setDeletionRequested(true);
    setShowDeletionModal(false);
  } finally {
    setSubmittingDeletion(false);
  }
}

  async function loadStats() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const { data: collection } = await supabase
      .from("collection_progress_raw")
      .select("set_id, progress")
      .eq("user_id", session.user.id);

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

    const { data: friends } = await supabase
  .from("friend_requests")
  .select("sender_id, receiver_id")
  .eq("status", "accepted");

const friendCount =
  (friends ?? []).filter(
    (friend: any) =>
      friend.sender_id === session.user.id ||
      friend.receiver_id === session.user.id
  ).length;

    const { data: progress } = await supabase
      .from("collection_progress")
      .select("set_id, progress")
      .eq("user_id", session.user.id);

    const progressMap = new Map(
      (progress || []).map((row: any) => [
        String(row.set_id),
        row,
      ])
    );

    const sets = [
      { id: "1", rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 }},
      { id: "5", rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 }},
      { id: "7", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 }},
      { id: "2", rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 }},
      { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, SZR:3 }},
      { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 }},
      { id: "11", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12, SCR:12 }},
      { id: "6", rarities: { BASE:18, R:30, SR:14, ST:20, SSR:15, FR:18, TR:12, TGR:8, UR:19, USR:8, XR:8 }},
      { id: "4", rarities: { SSR:20, SCR:18, UR:18, USR:15, AR:9, OR:7, BP:9, SAR:9 }},
      { id: "12", rarities: { C: 48, U: 18, ER: 6, SR: 14, SPR: 28, GR: 12, CR: 12, RR: 6, PER: 12, PSPR: 11, PGR: 6, PCR: 12, PRR: 6 } },
      { id: "FW", rarities: { C: 48, U: 18, ER: 6, SR: 14, SPR: 28, GR: 12, CR: 12, RR: 6, PER: 12, PSPR: 11, PGR: 6, PCR: 12, PRR: 6 } },
      { id: "SD", rarities: { C: 9, U: 7, SR: 6, SPR: 10, GR: 6, CR: 6, ER: 6, PER: 12, PRR: 6 } },
    ];

    let completed = 0;

    sets.forEach((set) => {
      const found = progressMap.get(set.id);

      if (!found?.progress) return;

      let total = 0;
      let ownedCards = 0;

      Object.entries(set.rarities).forEach(([rarity, count]) => {
        total += count;

        for (let i = 1; i <= count; i++) {
          if (found.progress[`${rarity}-${i}`]) {
            ownedCards++;
          }
        }
      });

      if (ownedCards === total) completed++;
    });

setStats({
  owned,
  completed,
  friends: friendCount,
});
  }

const { avatar, verification } = getProfileAssets(profile);

const displayName =
  profile?.username || "Twilight Sparkle";

useEffect(() => {
const loadShowcaseCards = async () => {
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

  "SAR",
  "BP",

  "SCR",
  "CR",

  "XR",

  "PRR",
];
  const cards: any[] = [];

  (data || []).forEach((row: any) => {
    Object.entries(row.progress || {}).forEach(([card_key, owned]) => {
      if (!owned) return;

      const rarity =
        String(row.set_id) === "FW" ||
        String(row.set_id) === "SD" ||
        String(row.set_id) === "12" ||
        String(row.set_id) === "tcgpromos"
          ? card_key.includes("PRR")
            ? "PRR"
            : ""
          : String(card_key).split("-")[0];

      if (!showcaseRarities.includes(rarity)) return;

      cards.push({
        set_id: String(row.set_id),
        card_key,
      });
    });
  });

  setShowcaseCards(cards);
};
  loadShowcaseCards();
}, []);

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
    return `/fantasy-wonderland/${card.card_key}.webp`;
  }

  if (card.set_id === "12") {
    return `/cards/discord/${card.card_key}.webp`;
  }

  if (card.set_id === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }

  const [rarityRaw, number] = String(card.card_key).split("-");
  const rarity =
    rarityRaw === "SHINING ZR"
      ? "SZR"
      : rarityRaw;

  const config: Record<
    string,
    { folder: string; prefix: string }
  > = {
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
  ).padStart(3, "0")}.webp`;
};

  return (
    <div className="min-h-screen overflow-hidden bg-[#080909] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,212,0,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,0,.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD54A]/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

<div className="relative overflow-hidden border border-white/[0.09] bg-[#101212] p-5 shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:p-7 lg:p-9">

  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_31px,rgba(255,212,0,.025)_32px,transparent_33px),linear-gradient(transparent_31px,rgba(255,212,0,.025)_32px,transparent_33px)] bg-[size:64px_64px]" />
  <div className="absolute inset-0 bg-[linear-gradient(135deg,#1d1d1d_0%,#181818_45%,#0f0f0f_100%)]" />

  <div className="absolute left-0 top-0 h-14 w-14 border-l-2 border-t-2 border-[#FFD54A]" />
  <div className="absolute right-0 top-0 h-14 w-14 border-r-2 border-t-2 border-[#FFD54A]" />
  <div className="absolute bottom-0 left-0 h-14 w-14 border-l-2 border-b-2 border-[#FFD54A]" />
  <div className="absolute bottom-0 right-0 h-14 w-14 border-r-2 border-b-2 border-[#FFD54A]" />

  <div className="absolute left-0 top-20 h-px w-full bg-gradient-to-r from-transparent via-[#FFD54A]/60 to-transparent" />
  <div className="absolute left-0 bottom-20 h-px w-full bg-gradient-to-r from-transparent via-[#FFD54A]/30 to-transparent" />

  <div className="absolute left-5 top-5 flex items-center gap-2 border border-[#FFD54A]/25 bg-[#0a0c0c]/90 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-[#FFD54A] backdrop-blur-xl">
    <span className="h-1.5 w-1.5 bg-[#FFD54A] shadow-[0_0_8px_rgba(255,212,0,.8)]" />
    PROFILE // MODULE 01
  </div>

  <div className="absolute right-5 top-5 flex items-center gap-2 border border-emerald-400/20 bg-[#0a0c0c]/90 px-3 py-1.5 font-mono text-[7px] font-bold uppercase tracking-[0.28em] text-emerald-400/80 backdrop-blur-xl">
    <span className="h-1.5 w-1.5 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />
    ONLINE
  </div>

  <div className="absolute left-[185px] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#FFD54A]/25 to-transparent" />
  <div className="absolute right-[265px] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#FFD54A]/25 to-transparent" />

  <div className="pointer-events-none absolute inset-3 border border-white/[0.045]" />
  <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.025] to-transparent" />

  <div className="relative z-10 flex w-full items-center justify-between gap-8">

    {/* PROFILE */}
    <div className="flex min-w-0 items-center gap-6 lg:gap-8">

      {/* AVATAR */}
      <div className="relative shrink-0">
        <div className="absolute -inset-3 border border-[#FFD54A]/20" />
        <div className="absolute -inset-1 border border-[#FFD54A]/10" />
        <div className="absolute -left-3 top-1/2 h-px w-3 bg-[#FFD54A]/50" />
        <div className="absolute -right-3 top-1/2 h-px w-3 bg-[#FFD54A]/50" />

        <div className="relative border border-white/[0.08] bg-[#0b0d0d] p-2">
          <img
            src={avatar}
            alt=""
            className="h-28 w-28 rounded-none border border-[#FFD54A]/30 object-cover sm:h-32 sm:w-32"
          />
        </div>

        <div className="absolute -right-3 top-3 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-[#141414]" />
      </div>

      {/* NAME / DISCORD */}
      <div className="min-w-0 flex-1">

        <div className="mb-4 flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.32em] text-[#FFD54A]/90">
          <span className="h-px w-8 bg-[#FFD54A]" />
          IDENTITY // VERIFIED PROFILE
        </div>

        {editingProfile ? (
          <div className="max-w-2xl border border-[#FFD54A]/20 bg-[#0a0c0c] shadow-[0_15px_45px_rgba(0,0,0,.35)]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div>
                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.32em] text-[#FFD54A]/85">
                  IDENTITY CONTROL
                </div>
                <div className="mt-1 font-['Oxanium'] text-sm font-bold uppercase tracking-[0.08em] text-white">
                  Edit Profile Identity
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-emerald-300/90">
                <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.8)]" />
                READY
              </div>
            </div>

            <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
              <label className="group bg-[#0d0f0f] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                    USERNAME
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD54A]/75">
                    PUBLIC ID
                  </span>
                </div>
                <input
                  value={usernameDraft}
                  onChange={(e) => setUsernameDraft(e.target.value)}
                  autoFocus
                  className="w-full border border-white/[0.08] bg-[#080a0a] px-3 py-2.5 font-['Oxanium'] text-lg font-bold uppercase tracking-[0.03em] text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-[#FFD54A]/60 focus:bg-[#0b0e0e]"
                  placeholder="ENTER USERNAME"
                />
              </label>

              <label className="group bg-[#0d0f0f] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                    DISCORD
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#FFD54A]/75">
                    NETWORK ID
                  </span>
                </div>
                <input
                  value={discordDraft}
                  onChange={(e) => setDiscordDraft(e.target.value)}
                  placeholder="ENTER DISCORD USERNAME"
                  className="w-full border border-white/[0.08] bg-[#080a0a] px-3 py-2.5 font-mono text-sm font-bold text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-[#FFD54A]/60 focus:bg-[#0b0e0e]"
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.07] bg-[#080a0a] px-4 py-3">
              <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                Changes apply to your public profile
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-[#FFD54A]/20" />
                <span className="h-1 w-2 bg-[#FFD54A]/60" />
                <span className="h-1 w-1 bg-[#FFD54A]" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h1 className="font-['Oxanium'] text-4xl font-black uppercase tracking-[0.02em] text-white sm:text-5xl">
                {displayName}
              </h1>

              {verification && (
                <img
                  src={verification.badge}
                  alt={verification.label}
                  title={verification.label}
                  className="h-7 w-7"
                />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="border border-[#FFD54A]/20 bg-[#0d0f0f] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#FFD54A]">
                @{discord || "NO DISCORD"}
              </div>

              <div className="border border-emerald-400/20 bg-emerald-400/[0.04] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                VERIFIED
              </div>
            </div>
          </>
        )}

        {/* STATUS / ACCESS */}
        <div className="mt-6 grid max-w-xl grid-cols-2 gap-2">

          <div className="border border-white/[0.07] bg-[#0d0f0f] p-3">
            <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              STATUS
            </div>

            <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFD54A]">
              ACTIVE
            </div>
          </div>

          <div className="rounded-xl border border-[#FFD54A]/20 bg-[#191919] p-3">
            <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              ACCESS
            </div>

            <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              SUPERFAN
            </div>
          </div>

        </div>

        <p className="mt-6 max-w-xl text-sm text-zinc-300">
          {profile?.bio || ""}
        </p>

      </div>
    </div>

{/* BUTTONS */}
<div className="flex shrink-0 gap-3">

  <button
    onClick={() => navigate("/Personal/change-avatar")}
    className="border border-[#FFD54A]/30 bg-[#0d0f0f] px-4 py-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-[#FFD54A] transition-all duration-200 hover:border-[#FFD54A] hover:bg-[#FFD54A] hover:text-black hover:scale-[1.01] active:scale-[0.99]"
  >
    Change Avatar
  </button>

  <button
    className={`border px-4 py-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.15em] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
      editingProfile
        ? "border-[#FFD54A] bg-[#FFD54A] text-black hover:bg-[#FFE27A]"
        : "border-[#FFD54A]/30 bg-[#1b1b1b] text-[#FFD54A] hover:border-[#FFD54A] hover:bg-[#252525] hover:text-white"
    }`}
    onClick={async () => {
      if (editingProfile) {
        setSavingProfile(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await supabase.auth.updateUser({
            data: {
              username: usernameDraft,
            },
          });

          await supabase
            .from("profiles")
            .update({
              username: usernameDraft,
            })
            .eq("id", session.user.id);

         const { error: tradingError } = await supabase
  .from("trading_profiles")
  .upsert(
    {
      user_id: session.user.id,
      discord_username: discordDraft.trim(),
    },
    {
      onConflict: "user_id",
    }
  );

if (tradingError) {
  console.error("Failed to save Discord username:", tradingError);
  setSavingProfile(false);
  return;
}

          setProfile((prev: any) => ({
            ...prev,
            username: usernameDraft,
          }));

          setDiscord(discordDraft);
        }

        setSavingProfile(false);
      }

      setEditingProfile(!editingProfile);
    }}
  >
    {editingProfile ? (
      savingProfile ? "Saving..." : "Save"
    ) : (
      "Edit Identity"
    )}
  </button>

    <button
    onClick={() => {
      const url = `https://www.mlpekayou.community/${encodeURIComponent(
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
    className="border border-white/[0.1] bg-[#0d0f0f] px-4 py-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:border-[#FFD54A] hover:bg-[#FFD54A] hover:text-black hover:scale-[1.01] active:scale-[0.99]"
  >
    {copied ? "Copied!" : "Share Profile"}
  </button>


</div>
  </div>
</div>


{/* LEADERBOARD ELIGIBILITY */}
<div className="relative mt-7 overflow-hidden border border-[#FFD54A]/20 bg-[#101212] p-5 shadow-[0_20px_50px_rgba(0,0,0,.35)] sm:p-6">
  <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-r border-t border-[#FFD54A]/30" />

  <div className="flex items-start justify-between gap-5">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFD54A]/90">
          REGIONAL ASSOCIATION
        </div>

        <button
          type="button"
          aria-label="Leaderboard eligibility information"
          onClick={() => setShowLeaderboardBanInfo(true)}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-[#FFD54A]/35 bg-[#181818] font-mono text-[10px] font-black text-[#FFD54A] transition-all hover:border-[#FFD54A] hover:bg-[#FFD54A] hover:text-black"
        >
          ?
        </button>
      </div>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
        If you are using this website to track MLP Kayou cards in regions outside of 
        North American cards, click this toggle.
      </p>
    </div>

    <button
      type="button"
      role="switch"
      aria-checked={leaderboardBanned}
      disabled={leaderboardBanned}
      onClick={selfBanFromLeaderboard}
      className={`relative mt-1 flex h-8 w-14 shrink-0 items-center border p-1 transition-all ${
        leaderboardBanned
          ? "cursor-not-allowed border-zinc-700 bg-zinc-800 opacity-60"
          : "cursor-pointer border-[#FFD54A]/50 bg-[#171717] hover:border-[#FFD54A]"
      }`}
    >
      <span
        className={`h-6 w-6 transition-all ${
          leaderboardBanned
            ? "translate-x-6 bg-zinc-500"
            : "translate-x-0 bg-[#FFD54A]"
        }`}
      />
    </button>
  </div>

  <div className="mt-5 border-t border-white/[0.07] pt-4">

    {leaderboardBanned && (
      <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-500">
        LEADERBOARD BAN ACTIVE // CONTACT KEEGAN TO UNDO
      </div>
    )}
  </div>
</div>

{/* LEADERBOARD BAN INFORMATION MODAL */}
{showLeaderboardBanInfo && (
  <div
    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        setShowLeaderboardBanInfo(false);
      }
    }}
  >
    <div className="relative w-full max-w-lg overflow-hidden border border-[#FFD54A]/30 bg-[#111111] shadow-[0_30px_100px_rgba(0,0,0,.8)]">
      <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-[#FFD54A]/70" />
      <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-[#FFD54A]/70" />
      <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-[#FFD54A]/70" />
      <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-[#FFD54A]/70" />

      <div className="border-b border-[#FFD54A]/15 bg-[#0c0c0c] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-[#FFD54A]/40 bg-[#FFD54A]/10">
            <span className="font-mono text-sm font-black text-[#FFD54A]">?</span>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFD54A]/90">
              LEADERBOARD POLICY
            </div>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Regional Collection
            </h2>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {leaderboardBanned ? (
          <>
            <p className="text-sm leading-6 text-zinc-300">
              This website is only intended for North American English.
            </p>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              It is completely okay for you to continue using this website,
              but you have now been banned from any and all leaderboards.
            </p>
            <div className="mt-5 border-l-2 border-[#FFD54A]/60 pl-4">
              <p className="text-sm font-bold uppercase leading-6 text-[#FFD54A]">
                IF YOU THINK THIS WAS A MISTAKE, YOU MUST REACH OUT TO KEEGAN IN THE
                DISCORD SERVER. YOU WILL BE ASKED TO VERIFY YOUR COLLECTION VIA
                VIDEO AND PHOTOGRAPH TO CONFIRM THAT YOU ARE ELIGIBLE.
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm leading-6 text-zinc-300">
             Click the toggle if you collect any other regions -
             Japanese, Chinese, SEA, etc...
          </p>
        )}
      </div>

      <div className="flex justify-end border-t border-[#292929] bg-[#0c0c0c] px-6 py-4">
        <button
          type="button"
          onClick={() => setShowLeaderboardBanInfo(false)}
          className="border border-[#FFD54A]/40 bg-[#171717] px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#FFD54A] transition-all hover:border-[#FFD54A] hover:bg-[#FFD54A] hover:text-black"
        >
          CLOSE
        </button>
      </div>
    </div>
  </div>
)}

{/* Stats */}

<div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-3">

  {/* CARDS OWNED */}
  <div className="group relative overflow-hidden border border-white/[0.08] bg-[#101212] p-5 shadow-[0_20px_50px_rgba(0,0,0,.35)] transition-all duration-200 hover:border-[#FFD54A]/50 hover:bg-[#181818]">

    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(212,175,55,0.035)_25px,transparent_26px),linear-gradient(transparent_24px,rgba(212,175,55,0.035)_25px,transparent_26px)] bg-[size:60px_60px]" />

    <div className="absolute right-0 top-0 h-12 w-12 border-r border-t border-[#FFD54A]/30" />

    <div className="relative">

      <div className="flex items-center justify-between">
        <div className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
          COLLECTION
        </div>

        <div className="h-2 w-2 rounded-full bg-[#FFD54A] shadow-[0_0_10px_rgba(255,213,74,0.8)]" />
      </div>

      <div className="mt-4 font-['Oxanium'] text-4xl font-black tracking-tight text-[#FFD54A]">
        {stats.owned.toLocaleString()}
      </div>

      <div className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white">
        Cards Owned
      </div>

      <div className="mt-5 h-px w-full bg-gradient-to-r from-[#FFD54A]/30 via-[#FFD54A]/10 to-transparent" />

      <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
        FROM ALL SETS
      </div>

    </div>
  </div>


  {/* SETS MASTERED */}
  <div className="group relative overflow-hidden border border-white/[0.08] bg-[#101212] p-5 shadow-[0_20px_50px_rgba(0,0,0,.35)] transition-all duration-200 hover:border-[#FFD54A]/50 hover:bg-[#181818]">

    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(212,175,55,0.035)_25px,transparent_26px),linear-gradient(transparent_24px,rgba(212,175,55,0.035)_25px,transparent_26px)] bg-[size:60px_60px]" />

    <div className="absolute right-0 top-0 h-12 w-12 border-r border-t border-[#FFD54A]/30" />

    <div className="relative">

      <div className="flex items-center justify-between">
        <div className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
          PROGRESSION
        </div>

        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </div>

      <div className="mt-4 font-['Oxanium'] text-4xl font-black tracking-tight text-[#FFD54A]">
        {stats.completed}
      </div>

      <div className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white">
        Sets Mastered
      </div>

      <div className="mt-5 h-px w-full bg-gradient-to-r from-[#FFD54A]/30 via-[#FFD54A]/10 to-transparent" />

      <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
        COMPLETION STATUSES
      </div>

    </div>
  </div>


  {/* FRIENDS */}
  <div className="group relative overflow-hidden border border-white/[0.08] bg-[#101212] p-5 shadow-[0_20px_50px_rgba(0,0,0,.35)] transition-all duration-200 hover:border-[#FFD54A]/50 hover:bg-[#181818]">

    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(212,175,55,0.035)_25px,transparent_26px),linear-gradient(transparent_24px,rgba(212,175,55,0.035)_25px,transparent_26px)] bg-[size:60px_60px]" />

    <div className="absolute right-0 top-0 h-12 w-12 border-r border-t border-[#FFD54A]/30" />

    <div className="relative">

      <div className="flex items-center justify-between">
        <div className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
          NETWORK
        </div>

        <div className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
      </div>

      <div className="mt-4 font-['Oxanium'] text-4xl font-black tracking-tight text-[#FFD54A]">
        {stats.friends}
      </div>

      <div className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white">
        Friends
      </div>

      <div className="mt-5 h-px w-full bg-gradient-to-r from-[#FFD54A]/30 via-[#FFD54A]/10 to-transparent" />

      <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
        ADD FRIENDS IN EXPLORE!
      </div>

    </div>
  </div>

</div>

{/* Navigation */}

<div className="mt-7 flex flex-wrap gap-2 border-y border-white/[0.06] bg-[#0c0e0e] p-2">

  {tabs.map((tab, index) => (
    <button
      key={tab.label}
      onClick={() => navigate(tab.path)}
      className="
        group relative overflow-hidden
        border border-white/[0.08]
        bg-[#101212]
        px-4 py-2.5
        font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-300
        shadow-[0_8px_25px_rgba(0,0,0,0.25)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-[#FFD54A]/60
        hover:bg-[#1c1c1c]
        hover:text-white
        hover:shadow-[0_10px_30px_rgba(255,212,0,.12)]
        active:translate-y-0
      "
    >
      {/* Accent sweep */}
      <span className="absolute inset-y-0 left-0 w-1 bg-[#FFD54A] opacity-60 transition-all duration-200 group-hover:w-full group-hover:opacity-[0.06]" />

      {/* Number */}
      <span className="relative z-10 mr-2 text-[9px] font-black tracking-[0.2em] text-[#FFD54A]/50 transition-colors group-hover:text-[#FFD54A]">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="relative z-10">
        {tab.label}
      </span>

      {/* Arrow */}
      <span className="relative z-10 ml-2 inline-block text-[#FFD54A]/75 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#FFD54A]">
        →
      </span>
    </button>
  ))}

</div>
{/* Showcase */}

<div className="relative mt-7 overflow-hidden border border-white/[0.08] bg-[#101212] p-5 shadow-[0_20px_50px_rgba(0,0,0,.35)] sm:p-6">
  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_31px,rgba(255,212,0,.02)_32px,transparent_33px),linear-gradient(transparent_31px,rgba(255,212,0,.02)_32px,transparent_33px)] bg-[size:64px_64px]" />


  {/* SHOWCASE HEADER */}
  <div className="relative z-10 mb-6 flex items-center justify-between">
    <div>
      <div className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-[#FFD54A]/90">
        COLLECTION DISPLAY
      </div>

      <h2 className="mt-1 font-['Oxanium'] text-2xl font-black uppercase tracking-[0.04em] text-white">
        Rarest Owned Cards
      </h2>
    </div>

    <div className="hidden items-center gap-2 rounded-lg border border-[#FFD54A]/20 bg-[#1b1b1b] px-3 py-2 sm:flex">
      <div className="h-2 w-2 rounded-full bg-[#FFD54A] shadow-[0_0_10px_rgba(255,213,74,0.8)]" />
      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-300">
        Showcase
      </span>
    </div>
  </div>

  {/* SET TABS — UI ONLY */}
  <div className="relative z-10 mb-5 flex flex-wrap gap-2">

    {[
      ["moon", "Moon"],
      ["star", "Star"],
      ["fun", "Fun Moments"],
      ["rainbow", "Rainbow"],
      ["tcg", "TCG"],
    ].map(([key, label], index) => (
      <button
        key={key}
        onClick={() => setShowcaseTab(key as any)}
        className={`group relative overflow-hidden border px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] transition-all duration-200 ${
          showcaseTab === key
            ? "border-[#FFD54A] bg-[#FFD54A] text-black shadow-[0_0_20px_rgba(255,213,74,0.15)]"
            : "border-[#FFD54A]/15 bg-[#1b1b1b] text-zinc-400 hover:border-[#FFD54A]/50 hover:bg-[#202020] hover:text-white"
        }`}
      >
        <span
          className={`mr-2 text-[10px] font-black tracking-[0.15em] ${
            showcaseTab === key
              ? "text-black/50"
              : "text-[#FFD54A]/40 group-hover:text-[#FFD54A]"
          }`}
        >
          0{index + 1}
        </span>

        {label}
      </button>
    ))}

  </div>

  {/* CARDS — LOGIC UNCHANGED */}
  <div className="relative z-10 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">

    {showcaseCards
      .filter((card) => {
        switch (showcaseTab) {
          case "moon":
            return (
              ["1", "2", "3"].includes(String(card.set_id)) &&
              (
                String(card.card_key).startsWith("SC-") ||
                String(card.card_key).startsWith("SZR-") ||
                String(card.card_key).startsWith("SHINING ZR-")
              )
            );

          case "star":
            return (
              String(card.set_id) === "4" &&
              (
                String(card.card_key).startsWith("BP-") ||
                String(card.card_key).startsWith("SAR-")
              )
            );

          case "fun":
            return (
              ["7", "8", "11"].includes(String(card.set_id)) &&
              (
                String(card.card_key).startsWith("CR-") ||
                String(card.card_key).startsWith("SCR-")
              )
            );

          case "rainbow":
            return (
              ["5", "6"].includes(String(card.set_id)) &&
              String(card.card_key).startsWith("XR-")
            );

          case "tcg":
            return (
              [
                "FW",
                "SD",
                "12",
                "friendshipsbegin",
                "tcgpromos",
              ].includes(String(card.set_id)) &&
              String(card.card_key).includes("PRR")
            );

          default:
            return false;
        }
      })
      .sort((a, b) => {
        const setOrder: Record<string, number> = {
          "7": 1,
          "8": 2,
          "11": 3,

          "1": 4,
          "2": 5,
          "3": 6,

          "5": 7,
          "6": 8,

          "4": 9,

          "FW": 10,
          "friendshipsbegin": 11,
          "SD": 12,
          "12": 13,
          "tcgpromos": 14,
        };

        const rarityOrder: Record<string, number> = {
          "SC": 1,
          "SHINING ZR": 2,
          "SZR": 3,

          "SAR": 1,
          "BP": 2,

          "CR": 1,
          "SCR": 2,

          "XR": 1,

          "PRR": 1,
        };

        const setDiff =
          (setOrder[String(a.set_id)] ?? 999) -
          (setOrder[String(b.set_id)] ?? 999);

        if (setDiff !== 0) return setDiff;

        const rarityA =
          String(a.set_id) === "12" ||
          String(a.set_id) === "FW" ||
          String(a.set_id) === "SD" ||
          String(a.set_id) === "friendshipsbegin" ||
          String(a.set_id) === "tcgpromos"
            ? "PRR"
            : String(a.card_key).split("-")[0];

        const rarityB =
          String(b.set_id) === "12" ||
          String(b.set_id) === "FW" ||
          String(b.set_id) === "SD" ||
          String(b.set_id) === "friendshipsbegin" ||
          String(b.set_id) === "tcgpromos"
            ? "PRR"
            : String(b.card_key).split("-")[0];

        const rarityDiff =
          (rarityOrder[rarityA] ?? 999) -
          (rarityOrder[rarityB] ?? 999);

        if (rarityDiff !== 0) return rarityDiff;

        const numA = parseInt(a.card_key.match(/\d+/)?.[0] ?? "0", 10);
        const numB = parseInt(b.card_key.match(/\d+/)?.[0] ?? "0", 10);

        return numA - numB;
      })
      .map((card, index) => (
        <div
          key={`${card.set_id}-${card.card_key}-${index}`}
          onClick={() => setSelectedCardImage(getTradeCardImage(card))}
          className="group relative aspect-[5/7] cursor-pointer overflow-hidden rounded-md border border-white/[0.08] bg-[#0b0d0d] transition-all duration-200 hover:-translate-y-1 hover:border-[#FFD54A]/50 hover:shadow-[0_12px_30px_rgba(0,0,0,.45)]"
        >
          <div className="pointer-events-none absolute inset-0 z-10 border border-transparent transition-colors group-hover:border-[#FFD54A]/30" />

          <img
            src={getTradeCardImage(card)}
            alt={card.card_key}
            className={`h-full w-full transition-transform duration-300 group-hover:scale-[1.07] ${
              String(card.set_id) === "FW" ||
              String(card.set_id) === "SD" ||
              String(card.set_id) === "friendshipsbegin"
                ? "object-contain p-1 scale-[1.04]"
                : "object-cover scale-[1.04]"
            }`}
          />
        </div>
      ))}

  </div>

</div>
{/* ACCOUNT / DANGER ZONE */}

<div className="relative mt-7 overflow-hidden border border-red-500/20 bg-[#0d0f0f] p-5 sm:p-6">
  <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-r border-t border-red-500/30" />
  <div className="flex items-start justify-between gap-6">
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300/90">
        ACCOUNT
      </div>

      <h3 className="mt-2 text-lg font-black text-white">
        Account Deletion
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-300">
        Request permanent deletion of your MLPEKAYOU account.
        Your account will remain active until the request is
        manually reviewed and fulfilled. If you change your mind,
        reach out to staff in the MLPEKAYOU Discord server as
        soon as possible.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setShowDeletionModal(true)}
      disabled={deletionRequested}
      className={`shrink-0 border px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-200 ${
        deletionRequested
          ? "cursor-default border-zinc-700 bg-[#171717] text-zinc-600"
          : "border-red-500/30 bg-[#151515] text-red-400 hover:border-red-500/70 hover:bg-red-500/10 hover:text-red-300"
      }`}
    >
      {deletionRequested
        ? "Request Pending"
        : "Request Account Deletion"}
    </button>
  </div>
</div>

{/* ACCOUNT DELETION MODAL */}
{showDeletionModal && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !submittingDeletion) {
        setShowDeletionModal(false);
      }
    }}
  >
    <div className="relative w-full max-w-lg overflow-hidden border border-red-500/30 bg-[#111111] shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
      
      {/* Technical corner brackets */}
      <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-red-500/70" />
      <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-red-500/70" />
      <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-red-500/70" />
      <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-red-500/70" />

      {/* Header */}
      <div className="border-b border-red-500/20 bg-[#0c0c0c] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-red-500/40 bg-red-500/10">
            <span className="text-sm font-black text-red-400">
              !
            </span>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300/90">
              ACCOUNT SECURITY
            </div>

            <h2 className="mt-1 text-xl font-black text-white">
              Request Account Deletion
            </h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        <p className="text-sm leading-6 text-zinc-300">
          You're requesting the permanent deletion of your
          MLPEKAYOU account.
        </p>

        <div className="mt-5 border border-[#FFD54A]/15 bg-[#181818] p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#FFD54A]/90">
            IMPORTANT
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This does <span className="font-bold text-white">not</span>{" "}
            delete your account immediately. Your request will be
            submitted for manual review. Your account will remain
            active until the deletion is manually fulfilled.
          </p>
        </div>

        <div className="mt-5 border-l-2 border-red-500/50 pl-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-300/90">
            THIS ACTION CANNOT BE UNDONE
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Keegan files through requested deletions once every five
            days. If you change your mind, please contact support as soon
            as possible in the MLPEKayou Discord server. Once your account has
            been deleted, it cannot be recovered. All data associated with your
            e-mail and account will be wiped from the system.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-[#292929] bg-[#0c0c0c] px-6 py-4">
        <button
          type="button"
          disabled={submittingDeletion}
          onClick={() => setShowDeletionModal(false)}
          className="
            border
            border-zinc-700
            bg-[#171717]
            px-5
            py-3
            text-xs
            font-bold
            uppercase
            tracking-[0.15em]
            text-zinc-400
            transition-all
            duration-200
            hover:border-zinc-500
            hover:bg-[#202020]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={submittingDeletion}
          onClick={requestAccountDeletion}
          className="
            border
            border-red-500/50
            bg-red-500/10
            px-5
            py-3
            text-xs
            font-bold
            uppercase
            tracking-[0.15em]
            text-red-400
            transition-all
            duration-200
            hover:border-red-500
            hover:bg-red-500/20
            hover:text-red-300
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {submittingDeletion
            ? "Submitting..."
            : "Confirm Request"}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
export default function DesktopProfile() {
const navigate = useNavigate();
const [profile, setProfile] = useState<any>(null);
const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
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
const [selectedShowcaseCard, setSelectedShowcaseCard] = useState<any | null>(null);
const isMoon3SZR001 = (card: any) =>
  getTradeCardImage(card) === "/cards/third-edition-moon/M3SZR001.webp";
const [copied, setCopied] = useState(false);
const [deletionRequested, setDeletionRequested] = useState(false);
const [showDeletionModal, setShowDeletionModal] = useState(false);
const [submittingDeletion, setSubmittingDeletion] = useState(false);
const [leaderboardBanned, setLeaderboardBanned] = useState(false);
const [loadingLeaderboardBan, setLoadingLeaderboardBan] = useState(true);
const [showLeaderboardBanInfo, setShowLeaderboardBanInfo] = useState(false);
const [showLeaderboardBanConfirm, setShowLeaderboardBanConfirm] = useState(false);
const tabs = [
  { label: "Collection", path: "/binders" },
  { label: "Inventory", path: "/inventory" },
  { label: "Wishlist & ISO", path: "/iso" },
  { label: "Inbox & Friends", path: "/inbox" },
  { label: "Trading", path: "/trading-post" },
  { label: "Kayou Events", path: "/kayou-news" },
];
useEffect(() => {
let mounted = true;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const syncFromDocument = () => {
    if (!mounted) return;
    setIsLightMode(document.documentElement.dataset.theme === "light");
  };
const observer = new MutationObserver(syncFromDocument);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
const loadThemePreference = async () => {
const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!mounted) return;
    if (!session?.user) {
      setIsLightMode(false);
      return;
    }
const { data, error } = await supabase
      .from("user_light_mode_preferences")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!mounted) return;
    if (error) {
      console.error("Unable to load desktop profile theme preference:", error);
    } else {
      setIsLightMode(Boolean(data));
    }
    realtimeChannel = supabase
      .channel(`desktop-profile-theme-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "\*",
          schema: "public",
          table: "user_light_mode_preferences",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (!mounted) return;
          setIsLightMode(payload.eventType !== "DELETE");
        }
      )
      .subscribe();
  };
  syncFromDocument();
  loadThemePreference();
  return () => {
    mounted = false;
    observer.disconnect();
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  };
}, []);
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
    console.error("Leaderboard self-ban error:", error);
    setLeaderboardBanned(false);
    return;
  }
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
async function handleProfileEdit() {
    if (editingProfile) {
      setSavingProfile(true);
const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.updateUser({ data: { username: usernameDraft } });
        await supabase.from("profiles").update({ username: usernameDraft }).eq("id", session.user.id);
const { error: tradingError } = await supabase
          .from("trading_profiles")
          .upsert(
            { user_id: session.user.id, discord_username: discordDraft.trim() },
            { onConflict: "user_id" }
          );
        if (tradingError) {
          console.error("Failed to save Discord username:", tradingError);
          setSavingProfile(false);
          return;
        }
        setProfile((prev: any) => ({ ...prev, username: usernameDraft }));
        setDiscord(discordDraft);
      }
      setSavingProfile(false);
    }
    setEditingProfile(!editingProfile);
  }
function handleShareProfile() {
const url = `https://www.mlpekayou.community/${encodeURIComponent(profile?.username ?? "")}`;
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
  }
const showcaseTabs: Array<["moon" | "star" | "fun" | "rainbow" | "tcg", string]> = [
    ["moon", "Moon"],
    ["star", "Star"],
    ["fun", "Fun Moments"],
    ["rainbow", "Rainbow"],
    ["tcg", "TCG"],
  ];
const visibleShowcaseCards = showcaseCards
    .filter((card) => {
      switch (showcaseTab) {
        case "moon":
          return ["1", "2", "3"].includes(String(card.set_id)) && (
            String(card.card_key).startsWith("SC-") ||
            String(card.card_key).startsWith("SZR-") ||
            String(card.card_key).startsWith("SHINING ZR-")
          );
        case "star":
          return String(card.set_id) === "4" && (
            String(card.card_key).startsWith("BP-") || String(card.card_key).startsWith("SAR-")
          );
        case "fun":
          return ["7", "8", "11"].includes(String(card.set_id)) && (
            String(card.card_key).startsWith("CR-") || String(card.card_key).startsWith("SCR-")
          );
        case "rainbow":
          return ["5", "6"].includes(String(card.set_id)) && String(card.card_key).startsWith("XR-");
        case "tcg":
          return ["FW", "SD", "12", "friendshipsbegin", "tcgpromos"].includes(String(card.set_id)) && String(card.card_key).includes("PRR");
        default:
          return false;
      }
    })
    .sort((a, b) => {
const setOrder: Record<string, number> = {
        "7": 1, "8": 2, "11": 3, "1": 4, "2": 5, "3": 6, "5": 7, "6": 8, "4": 9,
        FW: 10, friendshipsbegin: 11, SD: 12, "12": 13, tcgpromos: 14,
      };
const rarityOrder: Record<string, number> = {
        SC: 1, "SHINING ZR": 2, SZR: 3, SAR: 1, BP: 2, CR: 1, SCR: 2, XR: 1, PRR: 1,
      };
const setDiff = (setOrder[String(a.set_id)] ?? 999) - (setOrder[String(b.set_id)] ?? 999);
      if (setDiff !== 0) return setDiff;
const rarityA = ["12", "FW", "SD", "friendshipsbegin", "tcgpromos"].includes(String(a.set_id)) ? "PRR" : String(a.card_key).split("-")[0];
const rarityB = ["12", "FW", "SD", "friendshipsbegin", "tcgpromos"].includes(String(b.set_id)) ? "PRR" : String(b.card_key).split("-")[0];
const rarityDiff = (rarityOrder[rarityA] ?? 999) - (rarityOrder[rarityB] ?? 999);
      if (rarityDiff !== 0) return rarityDiff;
const numA = parseInt(String(a.card_key).match(/\d+/)?.[0] ?? "0", 10);
const numB = parseInt(String(b.card_key).match(/\d+/)?.[0] ?? "0", 10);
      return numA - numB;
    });
  return (
    <div className={`min-h-screen transition-colors duration-200 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`rounded-3xl border p-6 sm:p-8 ${isLightMode ? "border-black/10 bg-white shadow-[0_12px_32px_rgba(0,0,0,.08)]" : "border-white/[0.08] bg-[#151718] shadow-[0_14px_36px_rgba(0,0,0,.24)]"}`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <img src={avatar} alt="" className={`h-32 w-32 shrink-0 rounded-3xl border object-cover ${isLightMode ? "border-black/10 bg-zinc-100" : "border-white/[0.10] bg-[#191a1b]"}`} />
              <div className="min-w-0 flex-1">
                {editingProfile ? (
                  <div className={`grid max-w-2xl gap-4 rounded-2xl border p-4 sm:grid-cols-2 ${isLightMode ? "border-black/10 bg-zinc-50" : "border-white/[0.08] bg-[#101213]"}`}>
                    <label className="block">
                      <span className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>MLPEKAYOU Username</span>
                      <input value={usernameDraft} onChange={(e) => setUsernameDraft(e.target.value)} autoFocus className={`w-full rounded-xl border px-3 py-2.5 text-base font-medium outline-none ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#0d0f10] text-white"}`} placeholder="Your MLPEKAYOU username" />
                    </label>
                    <label className="block">
                      <span className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>Discord Username</span>
                      <input value={discordDraft} onChange={(e) => setDiscordDraft(e.target.value)} className={`w-full rounded-xl border px-3 py-2.5 text-base outline-none ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#0d0f10] text-white"}`} placeholder="Your Discord username" />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h1 className={`truncate text-3xl font-semibold tracking-tight sm:text-4xl ${isLightMode ? "text-zinc-950" : "text-white"}`}>{displayName}</h1>
                      {verification && <img src={verification.badge} alt={verification.label} title={verification.label} className="h-7 w-7 shrink-0" />}
                    </div>
                    <p className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>@{discord || "No Discord username set"}</p>
                  </>
                )}
                {!editingProfile && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${isLightMode ? "border-emerald-600/20 bg-emerald-600/[0.08] text-emerald-700" : "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"}`}><span className={`h-1.5 w-1.5 rounded-full ${isLightMode ? "bg-emerald-600" : "bg-emerald-400"}`} />Active</span>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]"}`}>SuperFan</span>
                  </div>
                )}
                {profile?.bio && <p className={`mt-4 max-w-2xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>{profile.bio}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">
              <button onClick={() => navigate("/Personal/change-avatar")} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}>Change Avatar</button>
              <button onClick={handleProfileEdit} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${editingProfile ? (isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]") : isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}>{editingProfile ? (savingProfile ? "Saving..." : "Save") : "Edit Names"}</button>
              <button onClick={handleShareProfile} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}>{copied ? "Copied" : "Share Profile"}</button>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            [stats.owned.toLocaleString(), "Cards Owned"],
            [stats.completed.toLocaleString(), "Sets Mastered"],
            [stats.friends.toLocaleString(), "Friends"],
          ].map(([value, label]) => (
            <div key={label} className={`rounded-2xl border p-5 ${isLightMode ? "border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]" : "border-white/[0.08] bg-[#151718] shadow-[0_8px_24px_rgba(0,0,0,.18)]"}`}>
              <div className={`text-3xl font-bold tracking-tight ${isLightMode ? "text-[#8a6a00]" : "text-[#FFD54A]"}`}>{value}</div>
              <div className={`mt-1 text-sm font-medium ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>{label}</div>
            </div>
          ))}
        </div>
        <div className={`mt-5 w-full overflow-hidden rounded-2xl border p-5 sm:p-6 ${
          isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
        }`}>
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className={`text-sm font-semibold ${isLightMode ? "text-zinc-950" : "text-white"}`}>
                  Regional Association
                </div>
                <button
                  type="button"
                  aria-label="Leaderboard eligibility information"
                  onClick={() => setShowLeaderboardBanInfo(true)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    isLightMode
                      ? "border-black/[0.10] bg-black/[0.03] text-zinc-600 hover:bg-black/[0.06] hover:text-zinc-900"
                      : "border-white/[0.10] bg-white/[0.05] text-zinc-300 hover:bg-white/[0.10] hover:text-white"
                  }`}
                >
                  ?
                </button>
              </div>
              <p className={`mt-2 max-w-md text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                If you are using this website to track MLP Kayou cards in regions outside of North American cards, click this toggle.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={leaderboardBanned}
              disabled={leaderboardBanned}
              onClick={() => setShowLeaderboardBanConfirm(true)}
              className={`relative mt-1 flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${
                leaderboardBanned
                  ? isLightMode
                    ? "cursor-not-allowed bg-zinc-300 opacity-60"
                    : "cursor-not-allowed bg-zinc-700 opacity-60"
                  : isLightMode
                  ? "cursor-pointer bg-zinc-300 hover:bg-zinc-400"
                  : "cursor-pointer bg-zinc-700 hover:bg-zinc-600"
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  leaderboardBanned ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="mt-4">
            {leaderboardBanned && (
              <div className="mt-2 text-xs text-zinc-500">
                Leaderboard exclusion is active. Contact Keegan to undo it.
              </div>
            )}
          </div>
        </div>
        <div className={`mt-6 flex flex-wrap gap-2 rounded-2xl border p-2 ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
          {tabs.map((tab) => <button key={tab.label} onClick={() => navigate(tab.path)} className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${isLightMode ? "text-zinc-700 hover:bg-zinc-100" : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"}`}>{tab.label}</button>)}
        </div>
        <div className={`mt-6 rounded-3xl border p-5 sm:p-6 ${isLightMode ? "border-black/10 bg-white shadow-[0_10px_30px_rgba(0,0,0,.06)]" : "border-white/[0.08] bg-[#151718] shadow-[0_10px_30px_rgba(0,0,0,.18)]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-semibold tracking-tight ${isLightMode ? "text-zinc-950" : "text-white"}`}>Rarest Owned Cards</h2>
              <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>A showcase of the rare cards currently in your collection.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {showcaseTabs.map(([key, label]) => <button key={key} onClick={() => setShowcaseTab(key)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${showcaseTab === key ? (isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]") : isLightMode ? "border-black/10 bg-zinc-50 text-zinc-600 hover:bg-zinc-100" : "border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200"}`}>{label}</button>)}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {visibleShowcaseCards.map((card, index) => (
  <button
    type="button"
    key={`${card.set_id}-${card.card_key}-${index}`}
    onClick={() => setSelectedShowcaseCard(card)}
    className={`group relative overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5 ${
      isMoon3SZR001(card) ? "col-span-2 grid grid-cols-2 gap-3" : "aspect-[5/7]"
    }`}
  >
    {isMoon3SZR001(card) ? (
      <>
        <div className="invisible aspect-[5/7] w-full" aria-hidden="true" />
        <div className="invisible aspect-[5/7] w-full" aria-hidden="true" />
        <img
          src={getTradeCardImage(card)}
          alt={card.card_key}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </>
    ) : (
      <img
        src={getTradeCardImage(card)}
        alt={card.card_key}
        className={`h-full w-full transition-transform duration-300 ${
          ["FW", "SD", "friendshipsbegin"].includes(String(card.set_id))
            ? "object-contain p-1 group-hover:scale-[1.035]"
            : ["1", "2", "3", "4", "5", "6", "7", "8", "11"].includes(String(card.set_id))
            ? "scale-[1.035] object-cover group-hover:scale-[1.055]"
            : "object-cover group-hover:scale-[1.035]"
        }`}
      />
    )}
  </button>
))}
          </div>
        </div>
        <div className={`mt-6 rounded-2xl border p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 ${isLightMode ? "border-red-900/10 bg-white" : "border-red-500/20 bg-[#151718]"}`}>
          <div>
            <h3 className={`text-lg font-semibold ${isLightMode ? "text-red-700" : "text-white"}`}>Account Deletion</h3>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>Request permanent deletion of your MLPEKAYOU account. Your account stays active until the request is manually reviewed and completed.</p>
          </div>
          <button type="button" onClick={() => setShowDeletionModal(true)} disabled={deletionRequested} className={`mt-4 shrink-0 rounded-xl border px-5 py-3 text-sm font-semibold sm:mt-0 ${deletionRequested ? "cursor-default border-zinc-400/20 bg-zinc-500/10 text-zinc-500" : isLightMode ? "border-red-700/25 bg-red-700/[0.04] text-red-700 hover:bg-red-700/[0.08]" : "border-red-500/30 bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.12]"}`}>{deletionRequested ? "Request Pending" : "Request Account Deletion"}</button>
        </div>
      </div>
      {showLeaderboardBanConfirm && (
        <div
          className={`fixed inset-0 z-[115] flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-white/20" : "bg-black/80"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowLeaderboardBanConfirm(false);
            }
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                : "border-white/[0.10] bg-[#151718] text-white"
            }`}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              Do not activate this toggle if you only collect American Cards using this app.
            </h2>
            <p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              Turn this on only if you collect cards outside the North American English release, and if you are using this app to track them.
            </p>
            <p className={`mt-3 text-sm font-medium ${isLightMode ? "text-[#725700]" : "text-[#FFE27A]"}`}>
              This includes SEA, Chinese, Japanese, and other regional or language cards. This app is only made for North American releases.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaderboardBanConfirm(false)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  isLightMode
                    ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowLeaderboardBanConfirm(false);
                  await selfBanFromLeaderboard();
                }}
                className="flex-1 rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FFE27A]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {showLeaderboardBanInfo && (
        <div
          className={`fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-white/20" : "bg-black/80"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowLeaderboardBanInfo(false);
            }
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                : "border-white/[0.10] bg-[#151718] text-white"
            }`}
          >
            <h2 className="text-xl font-semibold tracking-tight">Regional Association</h2>
            {leaderboardBanned ? (
              <div className={`mt-3 space-y-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
                <p>Your account is currently excluded from all leaderboards. This is due to the unfair advantage provided to other regions regarding release dates.</p>
                <p>If this was a mistake, contact Keegan in the MLPEKAYOU Discord server. You will be required to open a ticket and provide proof that your cards are North American only.</p>
              </div>
            ) : (
              <p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
                Use this setting if you collect cards from outside the North American English release, including SEA, Chinese, or Japanese cards.
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowLeaderboardBanInfo(false)}
              className={`mt-6 w-full rounded-xl border px-4 py-3 text-sm font-semibold ${
                isLightMode
                  ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}
      {showDeletionModal && <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/20" : "bg-black/80"}`} onMouseDown={(e) => { if (e.target === e.currentTarget && !submittingDeletion) setShowDeletionModal(false); }}><div className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.30)] ${isLightMode ? "border-red-900/10 bg-white text-zinc-900" : "border-red-500/25 bg-[#151718] text-white"}`}><h2 className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-red-700" : "text-white"}`}>Request account deletion</h2><p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>This sends a request for permanent account deletion. Your account stays active until the request is manually reviewed and completed.</p><p className={isLightMode ? "mt-3 text-sm font-medium text-red-700" : "mt-3 text-sm font-medium text-red-500"}>Once your account is deleted, it cannot be recovered.</p><div className="mt-6 flex gap-3"><button type="button" disabled={submittingDeletion} onClick={() => setShowDeletionModal(false)} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700" : "border-white/10 bg-white/[0.05] text-zinc-300"}`}>Cancel</button><button type="button" disabled={submittingDeletion} onClick={requestAccountDeletion} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${isLightMode ? "border-red-700/25 bg-red-700/[0.06] text-red-700" : "border-red-500/30 bg-red-500/[0.08] text-red-500"}`}>{submittingDeletion ? "Submitting..." : "Request deletion"}</button></div></div></div>}
      {selectedShowcaseCard && <div className={`fixed inset-0 z-[120] flex items-center justify-center px-6 pb-6 pt-20 backdrop-blur-md ${isLightMode ? "bg-white/25" : "bg-black/80"}`} onClick={() => setSelectedShowcaseCard(null)}><button
  type="button"
  className={`relative translate-y-4 overflow-hidden rounded-[26px] ${
  isMoon3SZR001(selectedShowcaseCard)
    ? "w-[min(92vw,850px)] h-[min(78vh,607.75px)]"
    : "aspect-[5/7.15] w-[61vw] max-w-[425px] max-h-[78vh]"
}`}
  style={
    isMoon3SZR001(selectedShowcaseCard)
      ? {
          width: "min(92vw, 850px)",
          height: "min(78vh, 608px)",
        }
      : undefined
  }
  onClick={(e) => e.stopPropagation()}
><img src={getTradeCardImage(selectedShowcaseCard)} alt="Selected card" className={`h-full w-full ${isMoon3SZR001(selectedShowcaseCard) ? "object-cover object-center" : ["FW", "SD", "friendshipsbegin"].includes(String(selectedShowcaseCard.set_id)) ? "object-contain" : ["1", "2", "3", "4", "5", "6", "7", "8", "11"].includes(String(selectedShowcaseCard.set_id)) ? "scale-[1.015] object-cover object-center" : "object-cover"}`} /></button></div>}
    </div>
  );
}
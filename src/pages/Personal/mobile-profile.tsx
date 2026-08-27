import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileAssets } from "../Everypony/profile-assets";
import { supabase } from "@/lib/supabase";
import {
  ChevronRight,
  User,
  Bell,
  Heart,
  Package,
  BookOpen,
  Trophy,
  Settings,
  Shield,
  LogOut,
  Pencil,
} from "lucide-react";
const MobileProfile = () => {
const navigate = useNavigate();
const [profile, setProfile] = useState<any>(null);
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
const [discord, setDiscord] = useState("");
const [editingProfile, setEditingProfile] = useState(false);
const [usernameDraft, setUsernameDraft] = useState("");
const [discordDraft, setDiscordDraft] = useState("");
const [savingProfile, setSavingProfile] = useState(false);
const [copied, setCopied] = useState(false);
const [deletionRequested, setDeletionRequested] = useState(false);
const [showDeletionModal, setShowDeletionModal] = useState(false);
const [submittingDeletion, setSubmittingDeletion] = useState(false);
// Leaderboard self-ban
const [leaderboardBanned, setLeaderboardBanned] = useState(false);
const [loadingLeaderboardBan, setLoadingLeaderboardBan] = useState(true);
const [showLeaderboardBanInfo, setShowLeaderboardBanInfo] = useState(false);
const [showLeaderboardBanConfirm, setShowLeaderboardBanConfirm] = useState(false);
const [showBugReport, setShowBugReport] = useState(false);
const [stats, setStats] = useState({
  owned: 0,
  completed: 0,
});
useEffect(() => {
const loadProfile = async () => {
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
    }
const { data: tradingProfile } = await supabase
      .from("trading_profiles")
      .select("discord_username")
      .eq("user_id", session.user.id)
      .single();
    setDiscord(tradingProfile?.discord_username || "");
    setUsernameDraft(data?.username || "");
setDiscordDraft(tradingProfile?.discord_username || "");
const { data: leaderboardBan, error: leaderboardBanError } =
      await supabase
        .from("leaderboard_exclusions")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
    if (leaderboardBanError) {
      console.error("Leaderboard ban status error:", leaderboardBanError);
    }
    setLeaderboardBanned(!!leaderboardBan);
    setLoadingLeaderboardBan(false);
  };
  loadProfile();
const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    loadProfile();
  });
  return () => subscription.unsubscribe();
}, []);
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
      console.error("Unable to load profile theme preference:", error);
    } else {
      setIsLightMode(Boolean(data));
    }
    realtimeChannel = supabase
      .channel(`mobile-profile-theme-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
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
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  };
}, []);
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
      { onConflict: "user_id" }
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
  .select("set_id, progress")
  .eq("user_id", session.user.id);
const filtered = (collection || []).filter(
  (row: any) => row.set_id !== "OTHERMERCH"
);
let owned = 0;
filtered.forEach((row: any) => {
  owned += Object.values(row.progress || {}).filter((value: any) =>
    value === true ||
    (typeof value === "object" && value?.owned === true)
  ).length;
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
  { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, SZR:3 }},
  { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 }},
  { id: "11", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12, SCR:12 }},
  { id: "6", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 }},
  { id: "4", rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }},
  { id: "12", rarities: { C: 48, U: 18, ER: 6, SR: 14, SPR: 28, GR: 12, CR: 12, RR: 6, PER: 12, PSPR: 11, PGR: 6, PCR: 12, PRR: 6 } },
  { id: "FW", rarities: { C: 48, U: 18, ER: 6, SR: 14, SPR: 28, GR: 12, CR: 12, RR: 6, PER: 12, PSPR: 11, PGR: 6, PCR: 12, PRR: 6 } },
  { id: "SD", rarities: { C: 9, U: 7, SR: 6, SPR: 10, GR: 6, CR: 6, ER: 6, PER: 12, PRR: 6 } },
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
// Fantasy Wonderland
const { data: fwProgress } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", session.user.id)
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
setStats({
  owned,
  completed,
});
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };
  loadStats();
}, []);
const { avatar, verification } = getProfileAssets(profile);
const displayName = profile?.username || "Twilight Sparkle";
const menuSections = [
    {
      title: "Collection",
      items: [
        {
          title: "CCG Progress",
          subtitle: "Track your CCG collection",
          onClick: () => navigate("/my-progress"),
        },
        {
          title: "TCG Progress",
          subtitle: "Track your TCG collection",
          onClick: () => navigate("/progress-tcg"),
        },
        {
          title: "Inventory",
          subtitle: "Set your inventory and trades/sales",
          onClick: () => navigate("/inventory"),
        },
        {
          title: "Wishlist & ISO",
          subtitle: "Missing cards & wishlisted cards",
          onClick: () => navigate("/iso"),
        },
        {
          title: "Binders",
          subtitle: "Browse your binders",
          onClick: () => navigate("/binders"),
        },
        {
          title: "Kayou US News",
          subtitle: "Official News from Kayou US",
          onClick: () => navigate("/kayou-news"),
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          title: "Inbox & Friends",
          subtitle: "Messages and friends",
          onClick: () => navigate("/inbox"),
        },
        {
          title: "Support MLPEKAYOU",
          subtitle: "Purchase through Keegan to help fund MLPEKAYOU",
          onClick: () => navigate("/support-mlpekayou"),
        },
        {
          title: "Report a Bug",
          subtitle: "Report website issues to the developer",
          onClick: () => setShowBugReport(true),
          danger: true,
        },
      ],
    },
  ];
  return (
    <div
      className={`mobile-profile-scope relative min-h-screen overflow-hidden pb-24 transition-colors duration-200 ${
        isLightMode ? "mobile-profile-light bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
      <style>{`
        .mobile-profile-light [class*="bg-[#0"],
        .mobile-profile-light [class*="bg-[#1"] {
          background-color: #ffffff !important;
        }
        .mobile-profile-light [class*="border-white/"],
        .mobile-profile-light [class*="border-zinc-8"] {
          border-color: rgba(24, 24, 27, 0.10) !important;
        }
        .mobile-profile-light .text-white,
        .mobile-profile-light [class*="text-zinc-2"],
        .mobile-profile-light [class*="text-zinc-3"] {
          color: #27272a !important;
        }
        .mobile-profile-light [class*="text-zinc-4"],
        .mobile-profile-light [class*="text-zinc-5"],
        .mobile-profile-light [class*="text-zinc-6"],
        .mobile-profile-light [class*="text-zinc-7"] {
          color: #52525b !important;
        }
        .mobile-profile-light [class*="bg-white/[0.0"] {
          background-color: rgba(24, 24, 27, 0.035) !important;
        }
        .mobile-profile-light [class*="hover:bg-[#19"]:hover,
        .mobile-profile-light [class*="hover:bg-[#20"]:hover,
        .mobile-profile-light [class*="hover:bg-white"]:hover {
          background-color: rgba(24, 24, 27, 0.055) !important;
        }
        .mobile-profile-light input {
          background: #ffffff !important;
          color: #18181b !important;
          border-color: rgba(24, 24, 27, 0.12) !important;
        }
        .mobile-profile-light input::placeholder {
          color: #a1a1aa !important;
        }
        .mobile-profile-light [class*="text-[#FFD54A]"],
        .mobile-profile-light [class*="text-[#FFE27A]"],
        .mobile-profile-light [class*="text-[#E7C84B]"] {
          color: #8a6a00 !important;
        }
        .mobile-profile-light [class*="border-[#FFD54A]"] {
          border-color: rgba(138, 106, 0, 0.28) !important;
        }
      `}</style>
      {/* Header */}
      <div className={`sticky top-0 z-20 backdrop-blur-md ${
          isLightMode ? "bg-[#f5f5f3]/98" : "bg-[#0d0f10]/98"
        }`}>
        <div className="px-5 py-1">
        </div>
      </div>
{/* Profile Card */}
<div className="px-5 pt-6">
  <div className={`relative overflow-hidden rounded-3xl border bg-[#151718] ${
      isLightMode
        ? "border-black/[0.06] shadow-[0_6px_18px_rgba(0,0,0,.05)]"
        : "border-white/[0.06] shadow-[0_6px_18px_rgba(0,0,0,.14)]"
    }`}>
    <div className="relative z-10 p-5">
      {/* PROFILE */}
      <div className="flex items-start gap-4">
        {/* AVATAR */}        <div className="relative shrink-0">
          <img
            src={avatar}
            alt=""
            className="h-24 w-24 rounded-2xl border border-white/[0.10] bg-[#191a1b] object-cover shadow-[0_8px_24px_rgba(0,0,0,.28)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          {/* IDENTITY */}
          {editingProfile ? (
            <div className={`rounded-2xl border p-4 ${
              isLightMode
                ? "border-black/10 bg-zinc-50"
                : "border-white/[0.08] bg-[#101213]"
            }`}>
              <div className="space-y-4">
                <label className="block">
                  <span className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>
                    MLPEKAYOU Username
                  </span>
                  <input
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border px-3 py-2.5 text-base font-medium outline-none transition-colors focus:border-[#8a6a00]/50"
                    placeholder="Your MLPEKAYOU username"
                  />
                </label>
                <label className="block">
                  <span className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>
                    Discord Username
                  </span>
                  <input
                    value={discordDraft}
                    onChange={(e) => setDiscordDraft(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#8a6a00]/50"
                    placeholder="Your Discord username"
                  />
                </label>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-xl font-semibold tracking-tight text-white">
                  {displayName}
                </h2>
                {verification && (
                  <img
                    src={verification.badge}
                    alt={verification.label}
                    title={verification.label}
                    className="h-5 w-5 shrink-0"
                  />
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-300">
                @{discord || "No Discord username set"}
              </p>
            </>
          )}
          {/* STATUS / ACCESS */}
          {!editingProfile && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                isLightMode
                  ? "border-emerald-600/20 bg-emerald-600/[0.08] text-emerald-700"
                  : "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isLightMode ? "bg-emerald-600" : "bg-emerald-400"}`} />
                Active
              </span>
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isLightMode
                  ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                  : "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]"
              }`}>
                SuperFan
              </span>
            </div>
          )}
        </div>
      </div>
{/* PROFILE ACTIONS */}
<div className="mt-4 grid grid-cols-3 gap-2">
  {/* EDIT PROFILE */}
  <button
    className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
      editingProfile
        ? "border-[#FFD54A] bg-[#FFD54A] text-black shadow-[0_0_18px_rgba(255,213,74,0.18)]"
        : "border-[#FFD54A]/20 bg-[#191a1b] text-zinc-300 hover:border-[#FFD54A]/60 hover:bg-[#202122] hover:text-white"
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
    <Pencil className="h-3.5 w-3.5" />
    <span>
      {editingProfile
        ? savingProfile
          ? "Saving..."
          : "Save"
        : "Edit Names"}
    </span>
  </button>
  {/* CHANGE AVATAR */}
  <button
    onClick={() => navigate("/Personal/change-avatar")}
    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#FFD54A]/30 bg-[#FFD54A] px-3 py-2.5 text-xs font-semibold text-black transition-all duration-200 hover:bg-[#FFE27A] active:scale-[0.97]"
  >
    <Pencil
      size={14}
      className="relative"
    />
    <span className="relative">
      Edit Avatar
    </span>
  </button>
  {/* SHARE PROFILE */}
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
    className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
      copied
        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
        : "border-[#FFD54A]/20 bg-[#191a1b] text-zinc-300 hover:border-[#FFD54A]/60 hover:bg-[#202122] hover:text-white"
    }`}
  >
    <span>
      {copied ? "✓ Copied" : "Share Profile"}
    </span>
  </button>
</div>
      {/* BIO */}
      <p className="mt-5 border-t border-zinc-800/80 pt-4 text-sm leading-relaxed text-zinc-400">
        {profile?.bio || ""}
      </p>
    </div>
  </div>
</div>
{/* Quick Stats */}
<div className="relative mt-6 grid grid-cols-2 gap-3 px-5">
  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151718] p-4 shadow-[0_10px_28px_rgba(0,0,0,.20)]">
    <div className="mt-2 text-3xl font-bold tracking-tight text-[#FFD54A]">
      {stats.owned.toLocaleString()}
    </div>
    <div className="mt-1 text-xs font-medium text-zinc-400">
      Cards Owned
    </div>
  </div>
  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151718] p-4 shadow-[0_10px_28px_rgba(0,0,0,.20)]">
    <div className="mt-2 text-3xl font-bold tracking-tight text-[#FFD54A]">
      {stats.completed}
    </div>
    <div className="mt-1 text-xs font-medium text-zinc-400">
      Sets Mastered
    </div>
  </div>
</div>
{/* LEADERBOARD ELIGIBILITY */}
<div className="relative mx-5 mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151718] p-5 shadow-[0_10px_28px_rgba(0,0,0,.20)] sm:mx-auto sm:max-w-xl sm:p-6">
  <div className="flex items-start justify-between gap-5">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-white">
          Regional Association
        </div>
        <button
          type="button"
          aria-label="Leaderboard eligibility information"
          onClick={() => setShowLeaderboardBanInfo(true)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.05] text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.10] hover:text-white"
        >
          ?
        </button>
      </div>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
        If you are using this website to track MLP Kayou cards in regions outside of 
        North American cards, click this toggle.
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
          leaderboardBanned
            ? "translate-x-6"
            : "translate-x-0"
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
{/* LEADERBOARD BAN CONFIRMATION MODAL */}
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
    <div className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
      isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/[0.10] bg-[#151718] text-white"
    }`}>
      <h2 className="text-xl font-semibold tracking-tight">Do not activate this toggle if you only collect American Cards using this app.</h2>
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
{/* LEADERBOARD BAN INFORMATION MODAL */}
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
    <div className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
      isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/[0.10] bg-[#151718] text-white"
    }`}>
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
{/* Menu Sections */}
<div className="mt-7 space-y-6 px-5">
  {menuSections.map((section) => (
    <div key={section.title}>
      <div className="mb-2 px-1">
        <h3 className="text-sm font-semibold text-zinc-300">{section.title}</h3>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151718] shadow-[0_10px_28px_rgba(0,0,0,.18)]">
        {section.items.map((item, index) => (
          <button
            key={item.title}
            onClick={item.onClick}
            className={`group flex w-full items-center justify-between px-3.5 py-3.5 text-left transition-all duration-200 ${
              item.danger
                ? "bg-red-500/[0.035] hover:bg-red-500/[0.07]"
                : "hover:bg-[#191a1b]"
            } ${
              index !== section.items.length - 1
                ? "border-b border-zinc-800"
                : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white/[0.035] transition-colors ${
                  item.danger
                    ? "border-red-500/30 text-red-400 group-hover:border-red-500/60"
                    : "border-white/[0.08] text-[#FFD54A] group-hover:border-[#FFD54A]/40"
                }`}
              >
                {item.danger ? (
                  <span className="text-sm font-black text-red-400">!</span>
                ) : index === 0 ? (
                  <BookOpen size={16} />
                ) : index === 1 ? (
                  <Trophy size={16} />
                ) : index === 2 ? (
                  <Package size={16} />
                ) : index === 3 ? (
                  <Heart size={16} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="min-w-0">
                <div
                  className={`font-semibold ${
                    item.danger ? (isLightMode ? "text-red-700" : "text-red-300") : "text-white"
                  }`}
                >
                  {item.title}
                </div>
                <div
                  className={`mt-1 truncate text-sm ${
                    item.danger ? (isLightMode ? "text-red-600" : "text-red-300/80") : "text-zinc-300"
                  }`}
                >
                  {item.subtitle}
                </div>
              </div>
            </div>
            <ChevronRight
              size={18}
              className={`shrink-0 transition-all duration-200 group-hover:translate-x-1 ${
                item.danger
                  ? "text-red-500/50 group-hover:text-red-400"
                  : "text-zinc-700 group-hover:text-[#FFD54A]"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  ))}
</div>
{/* ACCOUNT / DANGER ZONE */}
<div className="mt-8 px-5">
  <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-[#151718]">
    <div className="p-5">
      <h3 className={`mt-1 font-['Oxanium'] text-base font-black uppercase tracking-[0.04em] ${isLightMode ? "text-zinc-900" : "text-white"}`}>
        Account Deletion
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        Request permanent deletion of your MLPEKAYOU account.
        Your account will remain active until the request is
        manually reviewed and fulfilled. If you change your mind,
        reach out to staff in the MLPEKAYOU Discord server as
        soon as possible.
      </p>
      <button
        type="button"
        onClick={() => setShowDeletionModal(true)}
        disabled={deletionRequested}
        className={`mt-5 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
          deletionRequested
            ? "cursor-default border-zinc-700 bg-[#171717] text-zinc-600"
            : isLightMode
            ? "border-red-700/25 bg-red-700/[0.04] text-red-700 active:bg-red-700/[0.08]"
            : "border-red-500/30 bg-[#151515] text-red-400 active:bg-red-500/10"
        }`}
      >
        {deletionRequested
          ? "Request Pending"
          : "Request Account Deletion"}
      </button>
    </div>
  </div>
</div>
{/* Logout */}
<div className="mt-10 px-5">
  <button
    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/[0.06] py-3.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10"
    onClick={async () => {
      await supabase.auth.signOut();
      navigate("/");
    }}
  >
    <LogOut size={18} />
    Log Out
  </button>
</div>
{/* REPORT A BUG POPUP */}
{showBugReport && (
  <div
    className={`fixed inset-0 z-[30000] flex items-center justify-center px-4 backdrop-blur-md ${
      isLightMode ? "bg-white/15" : "bg-black/55"
    }`}
    onClick={() => setShowBugReport(false)}
  >
    <div
      className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.28)] ${
        isLightMode
          ? "border-red-900/10 bg-white text-zinc-900"
          : "border-white/[0.10] bg-[#151718] text-white"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-red-700" : "text-white"}`}>Report a Bug</h2>
      <p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
        If you need to contact the developer, you can join the MLPEKAYOU Discord Server or email mlpekayou@gmail.com.
      </p>
      <p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
        Please reserve these communications for serious inquiries such as bugs, glitches, account issues, or Discord server issues.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setShowBugReport(false)}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            isLightMode
              ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
          }`}
        >
          Close
        </button>
        <button
          type="button"
          onClick={() =>
            window.open(
              "https://discord.gg/mlpekayou",
              "_blank",
              "noopener,noreferrer"
            )
          }
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            isLightMode
              ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700] hover:bg-[#c89d13]/20"
              : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A] hover:bg-[#FFD54A]/15"
          }`}
        >
          Join Discord
        </button>
      </div>
      <a
        href="mailto:mlpekayou@gmail.com"
        className={`mt-3 block w-full rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors ${
          isLightMode
            ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
            : "border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.05]"
        }`}
      >
        Email Developer
      </a>
    </div>
  </div>
)}
{/* ACCOUNT DELETION MODAL */}
{showDeletionModal && (
  <div
    className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${
      isLightMode ? "bg-white/20" : "bg-black/80"
    }`}
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !submittingDeletion) {
        setShowDeletionModal(false);
      }
    }}
  >
    <div className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
      isLightMode ? "border-red-200 bg-white text-zinc-900" : "border-red-500/25 bg-[#151718] text-white"
    }`}>
      <h2 className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-red-700" : "text-white"}`}>Request account deletion</h2>
      <p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
        This sends a request for permanent account deletion. Your account stays active until the request is manually reviewed and completed.
      </p>
      <p className={isLightMode ? "mt-3 text-sm font-medium text-red-700" : "mt-3 text-sm font-medium text-red-500"}>
        Once your account is deleted, it cannot be recovered.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={submittingDeletion}
          onClick={() => setShowDeletionModal(false)}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
            isLightMode
              ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
          }`}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submittingDeletion}
          onClick={requestAccountDeletion}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${isLightMode ? "border-red-700/25 bg-red-700/[0.06] text-red-700" : "border-red-500/30 bg-red-500/[0.08] text-red-500"}`}
        >
          {submittingDeletion ? "Submitting..." : "Request deletion"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
function StatCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#232323] p-5 text-center">
      <div className="text-2xl font-bold text-[#d4af37]">
        {value.toLocaleString()}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-zinc-400">
        {label}
      </div>
    </div>
  );
}
function Placeholder({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-[#232323] p-8 text-center">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-300">
        Future section
      </p>
    </div>
  );
}
export default MobileProfile;

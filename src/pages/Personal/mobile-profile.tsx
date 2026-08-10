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
const [discord, setDiscord] = useState("");
const [editingProfile, setEditingProfile] = useState(false);
const [usernameDraft, setUsernameDraft] = useState("");
const [discordDraft, setDiscordDraft] = useState("");
const [savingProfile, setSavingProfile] = useState(false);
const [copied, setCopied] = useState(false);
const [deletionRequested, setDeletionRequested] = useState(false);
const [showDeletionModal, setShowDeletionModal] = useState(false);
const [submittingDeletion, setSubmittingDeletion] = useState(false);
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
  };

  loadProfile();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    loadProfile();
  });

  return () => subscription.unsubscribe();
}, []);

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
    <div className="relative min-h-screen overflow-hidden bg-[#080909] pb-24 text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,212,0,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,0,.025) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px bg-gradient-to-r from-transparent via-[#FFD54A]/60 to-transparent" />
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#090b0b]/95 backdrop-blur-xl">
        <div className="px-5 py-1">
        </div>
      </div>

{/* Profile Card */}
<div className="px-5 pt-6">

  <div className="relative overflow-hidden border border-white/[0.09] bg-[#101212] shadow-[0_24px_70px_rgba(0,0,0,.55)]">

    {/* HUD background */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,213,74,0.10),transparent_32%)]" />

      <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-[#FFD54A]/10" />

      <div className="absolute right-5 top-5 h-14 w-14 border border-[#FFD54A]/10">
        <div className="absolute inset-2 border border-dashed border-[#FFD54A]/10" />
      </div>

      <div className="absolute left-0 top-0 h-12 w-12 border-l-2 border-t-2 border-[#FFD54A]/60" />
      <div className="absolute bottom-0 right-0 h-12 w-12 border-b-2 border-r-2 border-[#FFD54A]/60" />
    </div>

    <div className="relative z-10 p-5">

      {/* SYSTEM LABEL */}
      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD54A] shadow-[0_0_8px_rgba(255,213,74,0.8)]" />

          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.3em] text-[#FFD54A]">
            PROFILE // MODULE 01
          </span>
        </div>

        <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-600">
          ONLINE
        </span>

      </div>

      {/* PROFILE */}
      <div className="flex items-start gap-4">

        {/* AVATAR */}
        <div className="relative shrink-0">

          <div className="absolute -inset-2 border border-[#FFD54A]/20" />
          <div className="absolute -left-2 top-1/2 h-px w-2 bg-[#FFD54A]/50" />
          <div className="absolute -right-2 top-1/2 h-px w-2 bg-[#FFD54A]/50" />

          <div className="relative border border-white/[0.08] bg-[#0b0d0d] p-1.5">
            <img
              src={avatar}
              alt=""
              className="h-24 w-24 rounded-md border border-[#FFD54A]/35 bg-[#191a1b] object-cover"
            />
          </div>

          <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#111213] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

        </div>

        <div className="min-w-0 flex-1">

          {/* IDENTITY */}
          {editingProfile ? (
            <div className="border border-[#FFD54A]/20 bg-[#0a0c0c] shadow-[0_12px_35px_rgba(0,0,0,.35)]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5">
                <div>
                  <div className="font-mono text-[5px] font-bold uppercase tracking-[0.3em] text-[#FFD54A]/60">
                    IDENTITY CONTROL
                  </div>
                  <div className="mt-1 font-['Oxanium'] text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                    Edit Profile Identity
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[5px] uppercase tracking-[0.2em] text-emerald-400/70">
                  <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.8)]" />
                  READY
                </div>
              </div>

              <div className="grid gap-px bg-white/[0.06]">
                <label className="bg-[#0d0f0f] p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[5px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      USERNAME
                    </span>
                    <span className="font-mono text-[5px] uppercase tracking-[0.16em] text-[#FFD54A]/35">
                      PUBLIC ID
                    </span>
                  </div>
                  <input
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    autoFocus
                    className="w-full border border-white/[0.08] bg-[#080a0a] px-2.5 py-2 font-['Oxanium'] text-base font-bold uppercase text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-[#FFD54A]/60"
                    placeholder="ENTER USERNAME"
                  />
                </label>

                <label className="bg-[#0d0f0f] p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[5px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      DISCORD
                    </span>
                    <span className="font-mono text-[5px] uppercase tracking-[0.16em] text-[#FFD54A]/35">
                      NETWORK ID
                    </span>
                  </div>
                  <input
                    value={discordDraft}
                    onChange={(e) => setDiscordDraft(e.target.value)}
                    placeholder="ENTER DISCORD USERNAME"
                    className="w-full border border-white/[0.08] bg-[#080a0a] px-2.5 py-2 font-mono text-xs font-bold text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-[#FFD54A]/60"
                  />
                </label>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">

                <h2 className="truncate text-xl font-black tracking-tight text-white">
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

              <p className="mt-1 text-sm text-zinc-500">
                @{discord || "No Discord username set"}
              </p>
            </>
          )}

          {/* STATUS / ACCESS */}
          <div className="mt-4 grid grid-cols-2 gap-1.5">

            <div className="border border-white/[0.07] bg-[#0d0f0f] px-3 py-2">
              <div className="text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                STATUS
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                ACTIVE
              </div>
            </div>

            <div className="border border-white/[0.07] bg-[#0d0f0f] px-3 py-2">
              <div className="text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                ACCESS
              </div>

              <div className="mt-1 text-[10px] font-bold text-[#FFD54A]">
                VERIFIED
              </div>
            </div>

          </div>

        </div>

      </div>

{/* PROFILE ACTIONS */}

<div className="mt-4 grid grid-cols-3 gap-2">

  {/* EDIT PROFILE */}
  <button
    className={`group relative flex items-center justify-center gap-2 overflow-hidden border px-3 py-2.5 font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.97] ${
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
    className="group relative flex items-center justify-center gap-2 overflow-hidden border border-[#FFD54A]/30 bg-[#FFD54A] px-3 py-2.5 font-mono text-[7px] font-black uppercase tracking-[0.12em] text-black transition-all duration-200 hover:bg-[#FFE27A] hover:shadow-[0_0_18px_rgba(255,213,74,0.18)] active:scale-[0.97]"
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
    className={`group relative flex items-center justify-center gap-2 overflow-hidden border px-3 py-2.5 font-mono text-[7px] font-bold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.97] ${
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
<div className="relative mt-6 grid grid-cols-2 gap-2 px-5">

  <div className="relative overflow-hidden border border-white/[0.08] bg-[#101212] p-4">

    <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-[#FFD54A]/30" />

    <div className="font-mono text-[6px] font-bold uppercase tracking-[0.28em] text-zinc-500">
      COLLECTION
    </div>

    <div className="mt-2 font-['Oxanium'] text-3xl font-black text-[#FFD54A]">
      {stats.owned.toLocaleString()}
    </div>

    <div className="mt-1 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-zinc-400">
      Cards Owned
    </div>

  </div>

  <div className="relative overflow-hidden border border-white/[0.08] bg-[#101212] p-4">

    <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-[#FFD54A]/30" />

    <div className="font-mono text-[6px] font-bold uppercase tracking-[0.28em] text-zinc-500">
      PROGRESS
    </div>

    <div className="mt-2 font-['Oxanium'] text-3xl font-black text-[#FFD54A]">
      {stats.completed}
    </div>

    <div className="mt-1 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-zinc-400">
      Sets Mastered
    </div>

  </div>

</div>


{/* Menu Sections */}
<div className="mt-8 space-y-7 px-5">

  {menuSections.map((section) => (
    <div key={section.title}>

      <div className="mb-3 flex items-center gap-2">

        <span className="h-px w-6 bg-[#FFD54A]" />

        <h3 className="font-mono text-[7px] font-bold uppercase tracking-[0.28em] text-[#FFD54A]">
          {section.title}
        </h3>

        <span className="h-px flex-1 bg-zinc-800" />

      </div>

      <div className="overflow-hidden border border-white/[0.08] bg-[#101212]">

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
                className={`flex h-9 w-9 shrink-0 items-center justify-center border bg-[#0d0f0f] transition-colors ${
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
                    item.danger ? "text-red-300" : "text-white"
                  }`}
                >
                  {item.title}
                </div>

                <div
                  className={`mt-1 truncate text-xs ${
                    item.danger ? "text-red-400/45" : "text-zinc-500"
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
  <div className="relative overflow-hidden border border-red-500/20 bg-[#0d0f0f]">
    
    <div className="p-5">
      <div className="font-mono text-[7px] font-bold uppercase tracking-[0.28em] text-red-400/70">
        ACCOUNT
      </div>

      <h3 className="mt-1 font-['Oxanium'] text-base font-black uppercase tracking-[0.04em] text-white">
        Account Deletion
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
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
        className={`mt-5 w-full border px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 ${
          deletionRequested
            ? "cursor-default border-zinc-700 bg-[#171717] text-zinc-600"
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
    className="flex w-full items-center justify-center gap-2 border border-red-500/20 bg-red-500/[0.06] py-3.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-red-400 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10"
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
    className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    onClick={() => setShowBugReport(false)}
  >
    <div
      className="relative w-full max-w-md overflow-hidden rounded-md border border-red-500/40 bg-[#101212] shadow-[0_0_45px_rgba(220,38,38,.20)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-red-500/70" />
      <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-red-500/70" />

      <div className="border-b border-red-500/20 bg-[#1b1010] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-red-500/50 bg-red-500/10">
            <span className="text-lg font-black text-red-400">!</span>
          </div>

          <div>
            <div className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-red-400/60">
              SYSTEM SUPPORT
            </div>
            <div className="mt-1 font-['Oxanium'] text-base font-bold uppercase tracking-[0.08em] text-white">
              Report a Bug
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        <p className="text-sm leading-6 text-zinc-300">
          Currently, bugs can only be reported in the MLPEKAYOU Discord
          server. Please join the server and find the{" "}
          <span className="font-semibold text-red-300">"Important"</span>{" "}
          category, then the last channel will be{" "}
          <span className="font-semibold text-red-300">"Bugs."</span>{" "}
          All requirements of reporting a bug are present in that channel.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowBugReport(false)}
            className="border border-white/[0.09] bg-[#181a1a] px-4 py-3 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-all active:scale-[0.98]"
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
            className="border border-red-400/70 bg-gradient-to-b from-[#dc2626] to-[#991b1b] px-4 py-3 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_0_16px_rgba(220,38,38,.18)] transition-all active:scale-[0.98]"
          >
            Join Discord
          </button>
        </div>
      </div>

      <div className="border-t border-red-500/10 bg-[#0c0e0e] px-5 py-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-red-400/30">
            BUG REPORT PROTOCOL
          </span>
          <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-red-400/40">
            DISCORD REQUIRED
          </span>
        </div>
      </div>
    </div>
  </div>
)}

{/* ACCOUNT DELETION MODAL */}
{showDeletionModal && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !submittingDeletion) {
        setShowDeletionModal(false);
      }
    }}
  >
    <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-red-500/30 bg-[#0d0f0f] shadow-[0_30px_100px_rgba(0,0,0,0.8)]">

      {/* Technical corner brackets */}
      <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-red-500/70" />
      <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-red-500/70" />
      <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-red-500/70" />
      <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-red-500/70" />

      {/* Header */}
      <div className="border-b border-red-500/20 bg-[#0c0c0c] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-red-500/40 bg-red-500/10">
            <span className="text-sm font-black text-red-400">
              !
            </span>
          </div>

          <div className="min-w-0">
            <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-red-400/70">
              ACCOUNT SECURITY
            </div>

            <h2 className="mt-1 text-lg font-black text-white">
              Request Account Deletion
            </h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        <p className="text-sm leading-6 text-zinc-300">
          You're requesting the permanent deletion of your
          MLPEKAYOU account.
        </p>

        <div className="mt-5 border border-[#FFD54A]/15 bg-[#181818] p-4">
          <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#FFD54A]/70">
            IMPORTANT
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This does{" "}
            <span className="font-bold text-white">not</span>{" "}
            delete your account immediately. Your request will be
            submitted for manual review. Your account will remain
            active until the deletion is manually fulfilled.
          </p>
        </div>

        <div className="mt-5 border-l-2 border-red-500/50 pl-4">
          <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-red-400/70">
            THIS ACTION CANNOT BE UNDONE
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Keegan files through requested deletions once every five
            days. If you change your mind, please contact support as soon
            as possible in the MLPEKayou Discord server. Once your account has
            been deleted, it cannot be recovered. All data associated with your
            e-mail and account will be wiped from the system.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-[#292929] bg-[#0c0c0c] px-5 py-4">
        <button
          type="button"
          disabled={submittingDeletion}
          onClick={() => setShowDeletionModal(false)}
          className="
            border
            border-zinc-700
            bg-[#171717]
            px-4
            py-3
            text-xs
            font-bold
            uppercase
            tracking-[0.12em]
            text-zinc-400
            transition-all
            duration-200
            active:bg-[#202020]
            active:text-white
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
            px-4
            py-3
            text-xs
            font-bold
            uppercase
            tracking-[0.12em]
            text-red-400
            transition-all
            duration-200
            active:border-red-500
            active:bg-red-500/20
            active:text-red-300
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

      <p className="mt-2 text-sm text-zinc-500">
        Future section
      </p>
    </div>
  );
}

export default MobileProfile;
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
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#171717] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-zinc-800 bg-[#171717]/95 backdrop-blur">
        <div className="px-5 py-1">
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-5 pt-6">
        <div className="rounded-3xl border border-zinc-800 bg-[#232323] p-5">
          <div className="flex items-center gap-4">
            <img
  src={avatar}
  alt=""
  className="h-24 w-24 rounded-full border-2 border-[#d4af37] object-cover"
/>

            <div className="flex-1">
<div className="flex items-start justify-between">
  <div className="flex-1">
    {editingProfile ? (
      <>
        <input
          value={usernameDraft}
          onChange={(e) => setUsernameDraft(e.target.value)}
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-lg font-bold outline-none"
        />

        <input
          value={discordDraft}
          onChange={(e) => setDiscordDraft(e.target.value)}
          placeholder="Discord username"
          className="mt-2 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none"
        />
      </>
    ) : (
      <>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{displayName}</h2>

          {verification && (
            <img
              src={verification.badge}
              alt={verification.label}
              title={verification.label}
              className="h-5 w-5"
            />
          )}
        </div>

        <p className="text-sm text-zinc-400">
          @{discord || "No Discord username set"}
        </p>
      </>
    )}
  </div>

  <button
    className="ml-3"
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

          await supabase
            .from("trading_profiles")
            .update({
              discord_username: discordDraft,
            })
            .eq("user_id", session.user.id);

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
      <span className="rounded-lg bg-[#d4af37] px-3 py-2 text-sm font-semibold text-black">
        {savingProfile ? "Saving..." : "Save"}
      </span>
    ) : (
      <Pencil className="h-5 w-5 text-zinc-300" />
    )}
  </button>
</div>

<div className="mt-4 flex gap-3">
  <button
    onClick={() => navigate("/Personal/change-avatar")}
    className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black"
  >
    <Pencil size={15} />
    Change Avatar
  </button>

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
    className="rounded-xl border border-[#d4af37]/25 bg-[#222222] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d4af37] hover:bg-[#282828]"
  >
    {copied ? "Copied!" : "Share"}
  </button>
</div>
            </div>
          </div>

          <p className="mt-5 text-sm text-zinc-300">
  {profile?.bio || ""}
</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 px-5">
        <StatCard
value={stats.owned}
  label="Cards Owned"
/>

        <StatCard
value={stats.completed}
  label="Sets Mastered"
/>
      </div>

      {/* Menu Sections */}
      <div className="mt-8 space-y-8 px-5">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">
              {section.title}
            </h3>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#232323]">
              {section.items.map((item, index) => (
                <button
                  key={item.title}
                  onClick={item.onClick}
                  className={`flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-zinc-800 ${
                    index !== section.items.length - 1
                      ? "border-b border-zinc-800"
                      : ""
                  }`}
                >
                  <div>
                    <div className="font-medium">
                      {item.title}
                    </div>

                    <div className="mt-1 text-sm text-zinc-400">
                      {item.subtitle}
                    </div>
                  </div>

                  <ChevronRight
                    size={20}
                    className="text-zinc-500"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-10 px-5">
       <button
  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-4 font-semibold text-red-400"
  onClick={async () => {
    await supabase.auth.signOut();
    navigate("/");
  }}
>
  <LogOut size={18} />
  Log Out
</button>
      </div>
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
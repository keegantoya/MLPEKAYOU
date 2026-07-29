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
    <div className="min-h-screen bg-[#171717] text-white">
      <div className="mx-auto max-w-7xl p-10">
{/* Profile */}

<div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#232323] p-8">

  <div className="flex items-center gap-6">

    <img
      src={avatar}
      alt=""
      className="h-28 w-28 rounded-full border-2 border-[#d4af37] object-cover"
    />

    <div className="flex-1">

      {editingProfile ? (
        <>
          <input
            value={usernameDraft}
            onChange={(e) => setUsernameDraft(e.target.value)}
            className="w-80 rounded-lg bg-zinc-800 px-4 py-2 text-3xl font-bold outline-none"
          />

          <input
            value={discordDraft}
            onChange={(e) => setDiscordDraft(e.target.value)}
            placeholder="Discord username"
            className="mt-3 w-80 rounded-lg bg-zinc-800 px-4 py-2 text-base outline-none"
          />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">

            <h1 className="text-3xl font-bold">
              {displayName}
            </h1>

            {verification && (
              <img
                src={verification.badge}
                alt={verification.label}
                title={verification.label}
                className="h-6 w-6"
              />
            )}

          </div>

          <p className="mt-2 text-zinc-400">
            @{discord || "No Discord username set"}
          </p>
        </>
      )}

      <p className="mt-4 max-w-xl text-sm text-zinc-300">
        {profile?.bio || ""}
      </p>

    </div>

  </div>

<div className="flex gap-3">

  <button
    onClick={() => navigate("/Personal/change-avatar")}
    className="rounded-xl bg-[#d4af37] px-5 py-3 font-semibold text-black"
  >
    Change Avatar
  </button>

  <button
    onClick={() => {
      const url = `https://www.mlpekayou.com/${profile?.username}`;

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
    className="rounded-xl border border-[#d4af37]/25 bg-[#222222] px-5 py-3 font-semibold text-white transition hover:border-[#d4af37] hover:bg-[#282828]"
  >
    {copied ? "Copied!" : "Share Profile"}
  </button>

  <button
    className="rounded-xl border border-zinc-700 px-5 py-3"
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
        savingProfile ? "Saving..." : "Save"
      ) : (
        "Edit"
      )}
    </button>

  </div>

</div>

{/* Stats */}

<div className="mt-8 grid grid-cols-4 gap-5">

  <div className="rounded-2xl border border-zinc-800 bg-[#232323] p-8">
    <div className="text-4xl font-bold text-[#d4af37]">
      {stats.owned.toLocaleString()}
    </div>
    <div className="mt-2 text-sm text-zinc-400">
      Cards Owned
    </div>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-[#232323] p-8">
    <div className="text-4xl font-bold text-[#d4af37]">
      {stats.completed}
    </div>
    <div className="mt-2 text-sm text-zinc-400">
      Sets Mastered
    </div>
  </div>

<div className="rounded-2xl border border-zinc-800 bg-[#232323] p-8">
  <div className="text-4xl font-bold text-[#d4af37]">
    {stats.friends}
  </div>
  <div className="mt-2 text-sm text-zinc-400">
    Friends
  </div>
</div>

</div>

{/* Navigation */}

<div className="mt-8 flex flex-wrap gap-3">

  {tabs.map((tab) => (
    <button
      key={tab.label}
      onClick={() => navigate(tab.path)}
      className="rounded-xl border border-zinc-700 bg-[#232323] px-5 py-3 hover:border-[#d4af37]"
    >
      {tab.label}
    </button>
  ))}

</div>

{/* Showcase */}

<div className="mt-8 rounded-2xl border border-zinc-800 bg-[#232323] p-8">

  <h2 className="text-2xl font-bold mb-6">
     Rarest Owned Cards
  </h2>

  <div className="flex gap-3 mb-6">

    {[
      ["moon","Moon"],
      ["star","Star"],
      ["fun","Fun Moments"],
      ["rainbow","Rainbow"],
      ["tcg","TCG"],
    ].map(([key,label])=>(
      <button
        key={key}
        onClick={()=>setShowcaseTab(key as any)}
        className={`px-4 py-2 rounded-lg ${
          showcaseTab===key
            ? "bg-[#d4af37] text-black"
            : "bg-zinc-800"
        }`}
      >
        {label}
      </button>
    ))}

  </div>

<div className="grid grid-cols-6 gap-4">

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
  className="aspect-[5/7] rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 cursor-pointer hover:scale-105 transition"
>
  <img
    src={getTradeCardImage(card)}
    alt={card.card_key}
className={`w-full h-full ${
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

      </div>
    </div>
  );
}
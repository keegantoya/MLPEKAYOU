import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Messages from "./messages";
import { getProfileAssets } from "../Everypony/profile-assets";
import { usePublicProfileCards } from "@/lib/public-profile-cards";
import { getTradeCardImage } from "@/lib/card-images";



interface FriendsProfilesProps {
  user: any;
  tradingProfile: any;
  onClose: () => void;
}

const FriendsProfiles = ({
  user,
  tradingProfile,
  onClose,
}: FriendsProfilesProps) => {

    const [userStats, setuserStats] = useState({
  trades: 0,
  owned: 0,
  completed: 0,
});

const {
  isoCards: userIsoCards,
  wishlistCards: userWishlistCards,
  tradeCards,
} = usePublicProfileCards(user.id);

const [userProfileSettings, setuserProfileSettings] =
  useState({
    hide_iso: false,
    hide_wishlist: false,
    hidden_iso_sets: [] as string[],
  });

const [userTab, setuserTab] =
  useState<"trades" | "purchases" | "iso" | "wishlist">("trades");

const [collapsedSets, setCollapsedSets] =
  useState<Record<string, boolean>>({});
  const [selectedSet, setSelectedSet] = useState("");
const [selectedSection, setSelectedSection] =
  useState<"iso" | "trade" | "wishlist">("iso");

const [quickViewCard, setQuickViewCard] = useState<any>(null);
const [currentUserId, setCurrentUserId] = useState("");
const [sendingRequest, setSendingRequest] = useState(false);
const [requestPending, setRequestPending] = useState(false);
const [isFriend, setIsFriend] = useState(false);
const [friendNickname, setFriendNickname] = useState("");
const [showMessages, setShowMessages] = useState(false);
const [unreadMessages, setUnreadMessages] = useState(0);

const { avatar, verification: badge } = getProfileAssets(user);

  useEffect(() => {
  if (!user?.id) return;

  async function loadProfile() {

    const {
  data: { session },
} = await supabase.auth.getSession();

setCurrentUserId(session?.user?.id || "");

if (session?.user) {
  const { data: nicknameRow } = await supabase
    .from("friend_nicknames")
    .select("nickname")
    .eq("user_id", session.user.id)
    .eq("friend_id", user.id)
    .maybeSingle();

  setFriendNickname(nicknameRow?.nickname ?? "");
}

if (session?.user && session.user.id !== user.id) {
  const { data: existingRequest } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("sender_id", session.user.id)
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  setRequestPending(!!existingRequest);
}

if (session?.user && session.user.id !== user.id) {
  const { data: friendship } = await supabase
    .from("friends")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("friend_id", user.id)
    .maybeSingle();

  setIsFriend(!!friendship);
}

if (session?.user && session.user.id !== user.id) {
const { data: unread } = await supabase
  .from("messages")
  .select("id")
  .eq("sender", user.id)
  .eq("receiver", session.user.id)
  .is("read_at", null);

const count = unread?.length ?? 0;

setUnreadMessages(count);

window.dispatchEvent(
  new CustomEvent("header-message-update")
);
}

      // Load trading profile (Discord username)
      const { data: tradingProfile } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", user.id)
        .single();

      
    const { data: profileSettings } = await supabase
      .from("profiles")
      .select(
        "hide_iso, hide_wishlist, iso_hidden_sets, iso_hidden_sets"
      )
      .eq("id", user.id)
      .single();
    
    const legacyHidden: string[] =
      profileSettings?.iso_hidden_sets || [];
    
    const hiddenIsoSets: string[] = [
      ...(profileSettings?.iso_hidden_sets?.length
        ? profileSettings.iso_hidden_sets
        : legacyHidden),
      ...(profileSettings?.iso_hidden_sets?.length
        ? profileSettings.iso_hidden_sets
        : legacyHidden),
    ];
    
setuserProfileSettings({
  hide_iso: profileSettings?.hide_iso ?? false,
  hide_wishlist: profileSettings?.hide_wishlist ?? false,
  hidden_iso_sets: hiddenIsoSets,
});
    
      if (!(profileSettings?.hide_iso ?? false)) {
      setuserTab("iso");
    } else if (!(profileSettings?.hide_wishlist ?? false)) {
      setuserTab("wishlist");
    } else {
      setuserTab("trades");
    }
    
      // Load owned card count
const { data: collection } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", user.id);

let owned = 0;

(collection || []).forEach((row: any) => {
  if (row.set_id === "OTHERMERCH") {
    return;
  }

  owned += Object.values(row.progress || {}).filter(
    (value: any) =>
      value === true ||
      (typeof value === "object" && value?.owned === true)
  ).length;
});
    
      // Load collection progress for completed sets
    
let completed = 0;

const { data: isoProgress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);

const progressMap = new Map(
  (isoProgress || []).map((row: any) => [String(row.set_id), row])
);
    
    // Main checklist sets only
    const sets = [
      { id: "1", rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 } },
      { id: "5", rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 } },
      { id: "7", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 } },
      { id: "2", rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 } },
      { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, SZR:3 } },
      { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 } },
      { id: "TCG_PROMOS", name: "TCG Promos" },
    ];
    
    sets.forEach((set) => {
const found = progressMap.get(set.id) as
  | { progress: Record<string, boolean> }
  | undefined;

if (!found?.progress) return;
    
      let ownedInSet = 0;
      let totalInSet = 0;
    
      Object.entries(set.rarities).forEach(([rarity, count]) => {
        totalInSet += count as number;
    
        for (let i = 1; i <= (count as number); i++) {
          const key = `${rarity}-${i}`;
          if (found.progress[key]) {
            ownedInSet++;
          }
        }
      });
    
      if (totalInSet > 0 && ownedInSet === totalInSet) {
        completed++;
      }
    });
    
    // Fantasy Wonderland
    const { data: fwProgress } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
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
    
setuserStats({
  trades: tradeCards.length,
  owned,
  completed,
});
    }
  
  
  loadProfile();

  const channel = supabase
  .channel(`friend-profile-${user.id}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
    },
    () => {
      loadProfile();
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(channel);
};
}, [user?.id]);

useEffect(() => {
  if (!quickViewCard) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuickViewCard(null);
    }
  };

  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [quickViewCard]);

async function sendFriendRequest() {
  if (!currentUserId) return;

  if (currentUserId === user.id) return;

  setSendingRequest(true);

  const { data: profile } = await supabase
    .from("profiles")
    .select("allow_friend_requests")
    .eq("id", user.id)
    .single();

  if (profile && !profile.allow_friend_requests) {
    alert("This collector isn't accepting friend requests.");
    setSendingRequest(false);
    return;
  }

  const { error } = await supabase
    .from("friend_requests")
    .insert({
      sender_id: currentUserId,
      receiver_id: user.id,
      status: "pending",
    });

if (!error) {
  setRequestPending(true);
}

setSendingRequest(false);
}

function isMoon3DoubleWide(card: any) {
  if (!card) return false;

  const setId = String(card.set_id);
  const cardKey = String(card.card_key)
    .replace(/^SZR-0*/, "SZR-");

  return setId === "3" && cardKey === "SZR-1";
}

function getSetName(setId: string) {
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
    "tcgpromos": "TCG Promos",
    "12": "Discord",
  };

  return names[String(setId)] || `Set ${setId}`;
}

const visibleIsoCards = userIsoCards.filter((card) => {
  const setId = String(card.set_id);
  const hidden = userProfileSettings.hidden_iso_sets;

  if (hidden.includes(setId)) {
    return false;
  }

  if (
    setId === "SD" &&
    (
      hidden.includes("SD") ||
      hidden.includes("SD_STARTERS") ||
      hidden.includes("SD_BONUS")
    )
  ) {
    return false;
  }

  if (
    setId === "tcgpromos" &&
    hidden.includes("TCG_PROMOS")
  ) {
    return false;
  }

  return true;
});

const ISO_SET_TABS = [
  { id: "ALL", name: "All" },
  ...Array.from(
    new Set(visibleIsoCards.map((card) => String(card.set_id)))
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  })),
];

const filteredIsoCards =
  selectedSet === ""
    ? []
    : selectedSet === "ALL"
    ? visibleIsoCards
    : visibleIsoCards.filter(
        (card) => String(card.set_id) === selectedSet
      );

const allTradeCards = tradeCards.map((card: any) => ({
  ...card,
  type:
    card.listing_type === "purchase"
      ? "sale"
      : "trade",
}));

const TRADE_SET_TABS = [
  { id: "ALL", name: "All" },
  ...Array.from(
    new Set(allTradeCards.map((card) => String(card.set_id)))
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  })),
];

const WISHLIST_SET_TABS = [
  { id: "ALL", name: "All" },
  ...Array.from(
    new Set(userWishlistCards.map((card) => String(card.set_id)))
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  })),
];

const filteredTradeCards =
  selectedSet === ""
    ? []
    : selectedSet === "ALL"
    ? allTradeCards
    : allTradeCards.filter(
        (card) => String(card.set_id) === selectedSet
      );

const filteredWishlistCards =
  selectedSet === ""
    ? []
    : selectedSet === "ALL"
    ? userWishlistCards
    : userWishlistCards.filter(
        (card) => String(card.set_id) === selectedSet
      );
      

      const isJacob =
  user?.id === "94a1c998-d040-4dd2-b2fb-5f606287139d";

  return (
    <div className="w-full text-white">
      <style>{`
        @keyframes arcPulse {
          0%, 100% { opacity: .45; transform: scale(.98); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); opacity: 0; }
          15% { opacity: .5; }
          85% { opacity: .5; }
          100% { transform: translateY(420%); opacity: 0; }
        }
        @keyframes reactorPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(250,204,21,.2), inset 0 0 10px rgba(250,204,21,.08); }
          50% { box-shadow: 0 0 28px rgba(250,204,21,.42), inset 0 0 18px rgba(250,204,21,.16); }
        }
      `}</style>

      <div className="relative overflow-hidden border border-yellow-400/30 bg-[#111315] shadow-[0_0_50px_rgba(0,0,0,.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(250,204,21,.12),transparent_28%),linear-gradient(135deg,rgba(250,204,21,.035),transparent_35%)]" />
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-yellow-400/70" />
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-24 overflow-hidden opacity-30">
          <div className="h-px bg-yellow-300" style={{ animation: "scanLine 5s linear infinite" }} />
        </div>

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="mb-7 flex items-center justify-between gap-4 border-b border-yellow-400/15 pb-4">
            <div>
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-yellow-400">
                MLPEKAYOU // PROFILE SYSTEM
              </div>
              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-500">
                COLLECTOR DOSSIER // EXTERNAL PROFILE
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,.8)]" />
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-green-400">
                PROFILE LINK ACTIVE
              </span>
            </div>
          </div>

          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-5 sm:gap-7">
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-3 rounded-full border border-yellow-400/25"
                  style={{ animation: "arcPulse 2.8s ease-in-out infinite" }}
                />
                <div className="absolute -inset-5 rounded-full border border-dashed border-yellow-400/10" />
                <div className="absolute -right-1 top-1/2 h-px w-7 bg-yellow-400/50" />
                <div className="absolute -left-1 bottom-3 h-px w-5 bg-yellow-400/50" />

                <img
                  src={avatar}
                  alt={user?.username}
                  className="relative h-24 w-24 rounded-full border-2 border-yellow-400 object-cover bg-[#191b1d] shadow-[0_0_28px_rgba(250,204,21,.22)] sm:h-32 sm:w-32"
                />

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border border-yellow-400/35 bg-[#111315] px-2 py-1 font-mono text-[7px] font-bold tracking-[0.2em] text-yellow-400">
                  ID VERIFIED
                </div>

                {isJacob &&
                  [
                    { left: "24%", delay: "0s" },
                    { left: "50%", delay: ".45s" },
                    { left: "76%", delay: ".9s" },
                  ].map((line, i) => (
                    <div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{
                        left: line.left,
                        top: "-16px",
                        animation: "stinkFloat 2s ease-in-out infinite",
                        animationDelay: line.delay,
                      }}
                    >
                      <svg width="18" height="42" viewBox="0 0 18 42" fill="none">
                        <path
                          d="M9 42C9 32 2 30 2 22C2 16 14 14 14 7C14 4 12 2 10 0"
                          stroke="#4ade80"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  ))}
              </div>

              <div className="min-w-0">
                <div className="mb-2 font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-500">
                  FRIEND
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-4xl">
                    {friendNickname || user?.username}
                  </h1>
                  {badge && (
                    <img
                      src={badge.badge}
                      alt={badge.label}
                      title={badge.label}
                      className="h-7 w-7 sm:h-8 sm:w-8"
                    />
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2 font-mono text-xs text-zinc-400 sm:text-sm">
                  <span className="text-yellow-400">@</span>
                  <span className="truncate">
                    {tradingProfile?.discord_username || "NO DISCORD IDENTIFIER"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="border border-zinc-700 bg-zinc-900/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-zinc-400">
                    PROFILE ACCESS
                  </span>
                  <span className="border border-green-400/20 bg-green-400/5 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-green-400">
                    MOST RECENT DATA
                  </span>
                </div>

                {currentUserId !== user.id && (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={!isFriend ? sendFriendRequest : undefined}
                      disabled={isFriend || sendingRequest || requestPending}
                      className={`border px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition ${
                        isFriend
                          ? "border-yellow-400/50 bg-yellow-400 text-black"
                          : requestPending
                          ? "cursor-default border-zinc-700 bg-zinc-800 text-zinc-400"
                          : "border-yellow-400/60 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400 hover:text-black"
                      }`}
                    >
                      {isFriend
                        ? "FRIEND LINK ESTABLISHED"
                        : requestPending
                        ? "REQUEST PENDING"
                        : sendingRequest
                        ? "TRANSMITTING..."
                        : "ESTABLISH FRIEND LINK"}
                    </button>

                    {isFriend && (
                      <div className="relative">
                        <button
                          onClick={() => setShowMessages(true)}
                          title="Messages"
                          className="flex h-11 w-11 items-center justify-center border border-yellow-400/35 bg-yellow-400/5 text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                          </svg>
                        </button>
                        {unreadMessages > 0 && (
                          <div className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center border border-red-300 bg-red-500 px-1 font-mono text-[9px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,.5)]">
                            {unreadMessages > 99 ? "99+" : unreadMessages}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: userStats.owned, label: "CARDS" },
                { value: userStats.completed, label: "MASTERSETS" },
                { value: userStats.trades, label: "LISTINGS" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative min-w-[82px] border border-yellow-400/20 bg-[#181a1c] px-3 py-4 text-center sm:min-w-[105px] sm:px-5"
                >
                  <div className="absolute left-0 top-0 h-px w-8 bg-yellow-400" />
                  <div className="absolute right-0 bottom-0 h-px w-8 bg-yellow-400/40" />
                  <div className="font-mono text-xl font-black text-yellow-400 sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-mono text-[7px] font-bold tracking-[0.18em] text-zinc-500 sm:text-[8px]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden border border-yellow-400/20 bg-[#0f1113] shadow-[0_0_35px_rgba(0,0,0,.25)]">
        <div className="flex items-center justify-between border-b border-yellow-400/15 bg-[#151719] px-4 py-3 sm:px-6">
          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-400">
              COLLECTION PROGRESS
            </div>
          </div>
          <div className="hidden font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-600 sm:block">
            SYS / 03
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-6 grid grid-cols-3 gap-1 border border-yellow-400/15 bg-black/20 p-1">
            {[
              { id: "iso" as const, label: "ISO", code: "01" },
              { id: "trade" as const, label: "TRADES & SALES", code: "02" },
              { id: "wishlist" as const, label: "WISHLIST", code: "03" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedSection(tab.id);
                  if (tab.id === "trade") setSelectedSet("ALL");
                }}
                className={`relative px-2 py-3 text-center font-mono text-[8px] font-bold uppercase tracking-[0.12em] transition sm:px-4 sm:text-[9px] ${
                  selectedSection === tab.id
                    ? "bg-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,.2)]"
                    : "text-zinc-500 hover:bg-yellow-400/5 hover:text-yellow-300"
                }`}
              >
                <span className="mr-1.5 opacity-50">{tab.code}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {selectedSection === "iso" ? (
            userProfileSettings.hide_iso ? (
              <div className="border border-red-400/20 bg-red-400/5 p-5">
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">
                  ACCESS RESTRICTED
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  This collector has hidden their ISO.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    ISO DATABASE
                  </div>
                  <div className="h-px flex-1 bg-yellow-400/10" />
                  <div className="font-mono text-[7px] uppercase text-zinc-600">
                    {visibleIsoCards.length} RECORDS
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-1.5">
                  {ISO_SET_TABS.map((set) => (
                    <button
                      key={set.id}
                      onClick={() => setSelectedSet(set.id)}
                      className={`border px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider transition sm:px-3 ${
                        selectedSet === set.id
                          ? "border-yellow-400 bg-yellow-400 text-black"
                          : "border-zinc-800 bg-[#17191b] text-zinc-500 hover:border-yellow-400/40 hover:text-yellow-300"
                      }`}
                    >
                      {set.name}
                    </button>
                  ))}
                </div>

                {selectedSet === "" ? (
                  <div className="border border-dashed border-yellow-400/15 py-14 text-center">
                    <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600">
                      SELECT A DATASET
                    </div>
                  </div>
                ) : visibleIsoCards.length === 0 ? (
                  <p className="py-10 text-center font-mono text-xs text-zinc-600">
                    NO ACTIVE ISO TARGETS
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3 lg:grid-cols-7">
                    {filteredIsoCards.map((card) => (
                      <div
                        key={`${card.set_id}-${card.card_key}`}
                        onClick={() => setQuickViewCard(card)}
                        className={`group relative self-start cursor-pointer overflow-hidden rounded-md border border-zinc-800 bg-[#090a0b] transition hover:border-yellow-400/60 hover:shadow-[0_0_18px_rgba(250,204,21,.12)] ${
                          isMoon3DoubleWide(card) ? "col-span-2" : ""
                        } ${
                          !isMoon3DoubleWide(card) &&
                          String(card.set_id) === "tcgpromos" &&
                          ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
                            ? "aspect-[63/88]"
                            : ""
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-yellow-400/0 transition group-hover:bg-yellow-400/80" />
                        <img
                          src={getTradeCardImage(card)}
                          alt={card.card_key}
                          className={`block w-full rounded-md ${
                            ["12", "tcgpromos"].includes(String(card.set_id))
                              ? "scale-100"
                              : "scale-[1.06]"
                          } ${
                            isMoon3DoubleWide(card)
                              ? "h-auto object-contain"
                              : String(card.set_id) === "tcgpromos" &&
                                ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
                              ? "h-full object-cover object-center"
                              : "h-auto object-contain"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          ) : selectedSection === "trade" ? (
            <>
              <div className="mb-5 flex items-center gap-3">
                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  MARKET INVENTORY
                </div>
                <div className="h-px flex-1 bg-yellow-400/10" />
                <div className="font-mono text-[7px] uppercase text-zinc-600">
                  {allTradeCards.length} LISTINGS
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-1.5">
                {TRADE_SET_TABS.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => setSelectedSet(set.id)}
                    className={`border px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider transition sm:px-3 ${
                      selectedSet === set.id
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-zinc-800 bg-[#17191b] text-zinc-500 hover:border-yellow-400/40 hover:text-yellow-300"
                    }`}
                  >
                    {set.name}
                  </button>
                ))}
              </div>

              {selectedSet === "" ? (
                <div className="border border-dashed border-yellow-400/15 py-14 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600">
                    SELECT A DATASET
                  </div>
                </div>
              ) : filteredTradeCards.length === 0 ? (
                <p className="py-10 text-center font-mono text-xs text-zinc-600">
                  NO ACTIVE TRADE OR SALE LISTINGS
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3 lg:grid-cols-7">
                  {filteredTradeCards.map((card) => {
                    const setId = String(card.set_id);
                    

                    return (
                    <div
                      key={`${card.set_id}-${card.card_key}`}
                      onClick={() => setQuickViewCard(card)}
                      className={`group relative self-start cursor-pointer overflow-hidden rounded-md border border-zinc-800 bg-[#090a0b] transition hover:-translate-y-0.5 hover:border-yellow-400/60 hover:shadow-[0_0_20px_rgba(250,204,21,.12)] ${
                        isMoon3DoubleWide(card) ? "col-span-2" : ""
                      } ${
                        !isMoon3DoubleWide(card) &&
                        setId === "tcgpromos" &&
                        ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
                          ? "aspect-[63/88]"
                          : ""
                      }`}
                    >
                      <div
                        className={`absolute left-1.5 top-1.5 z-10 border px-2 py-1 font-mono text-[7px] font-black tracking-[0.12em] text-black shadow-lg ${
                          card.type === "trade"
                            ? "border-cyan-300 bg-cyan-300"
                            : "border-yellow-400 bg-yellow-400"
                        }`}
                      >
                        {card.type === "trade" ? "TRADE" : "SALE"}
                      </div>

                      <div className="overflow-hidden rounded-md">
                        <img
                          src={getTradeCardImage(card)}
                          alt={card.card_key}
                          className={`block w-full rounded-md ${
                            setId === "12"
                              ? "scale-100"
                              : "scale-[1.10]"
                          } ${
                            isMoon3DoubleWide(card)
                              ? "h-auto object-contain"
                              : setId === "tcgpromos" &&
                                ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
                              ? "h-full object-cover object-center"
                              : "h-auto object-contain"
                          }`}
                        />
                      </div>

                      <div className="border-t border-yellow-400/10 bg-[#121416] px-2 py-2">
                        <div className="truncate font-mono text-[7px] font-bold uppercase tracking-wider text-zinc-500">
                          {getSetName(String(card.set_id))}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            userProfileSettings.hide_wishlist ? (
              <div className="border border-red-400/20 bg-red-400/5 p-5">
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">
                  ACCESS RESTRICTED
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  This collector has hidden their wishlist.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    WISHLIST TARGETS
                  </div>
                  <div className="h-px flex-1 bg-yellow-400/10" />
                  <div className="font-mono text-[7px] uppercase text-zinc-600">
                    {userWishlistCards.length} TARGETS
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-1.5">
                  {WISHLIST_SET_TABS.map((set) => (
                    <button
                      key={set.id}
                      onClick={() => setSelectedSet(set.id)}
                      className={`border px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider transition sm:px-3 ${
                        selectedSet === set.id
                          ? "border-yellow-400 bg-yellow-400 text-black"
                          : "border-zinc-800 bg-[#17191b] text-zinc-500 hover:border-yellow-400/40 hover:text-yellow-300"
                      }`}
                    >
                      {set.name}
                    </button>
                  ))}
                </div>

                {selectedSet === "" ? (
                  <div className="border border-dashed border-yellow-400/15 py-14 text-center">
                    <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600">
                      SELECT A DATASET
                    </div>
                  </div>
                ) : filteredWishlistCards.length === 0 ? (
                  <p className="py-10 text-center font-mono text-xs text-zinc-600">
                    NO WISHLIST TARGETS DETECTED
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3 lg:grid-cols-7">
                    {filteredWishlistCards.map((card) => (
                      <div
                        key={`${card.set_id}-${card.card_key}`}
                        onClick={() => setQuickViewCard(card)}
                        className={`group cursor-pointer overflow-hidden rounded-md border border-zinc-800 bg-[#090a0b] transition hover:border-yellow-400/60 hover:shadow-[0_0_18px_rgba(250,204,21,.12)] ${
                          isMoon3DoubleWide(card) ? "col-span-2" : ""
                        }`}
                      >
                        <img
                          src={getTradeCardImage(card)}
                          alt={card.card_key}
                          className={`block h-full w-full rounded-md ${
                            ["12", "tcgpromos"].includes(String(card.set_id))
                              ? "scale-100"
                              : "scale-[1.06]"
                          } object-contain`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>

      {quickViewCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050607]/95 p-4 backdrop-blur-md"
          onClick={() => setQuickViewCard(null)}
        >
          <div className="pointer-events-none absolute inset-5 border border-yellow-400/10 sm:inset-10" />
          <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.3em] text-yellow-400/60">
            CARD ANALYSIS // VISUAL INSPECTION
          </div>

          <button
            onClick={() => setQuickViewCard(null)}
            className="absolute right-5 top-5 z-10 border border-yellow-400/30 bg-[#111315] px-3 py-2 font-mono text-xl text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
          >
            ×
          </button>

          <div className="relative max-h-[68vh] max-w-[46vw] border border-yellow-400/20 bg-[#0b0d0e] p-1.5 shadow-[0_0_50px_rgba(250,204,21,.12)]">
            <div className="max-h-[61vh] max-w-[42vw] overflow-hidden rounded-md">
              <img
                onClick={(e) => e.stopPropagation()}
                src={getTradeCardImage(quickViewCard)}
                alt={quickViewCard.card_key}
                className={`block max-h-[61vh] max-w-[42vw] rounded-md scale-[1.06] object-contain ${
                  isMoon3DoubleWide(quickViewCard)
                    ? "w-[38vw] max-w-[560px]"
                    : ""
                }`}
              />
            </div>
            <div className="border-t border-yellow-400/10 px-2 py-1.5 text-center font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-500">
              {getSetName(String(quickViewCard.set_id))}
            </div>
          </div>
        </div>
      )}

      {showMessages && (
        <div
          className="fixed inset-0 z-[10000] flex items-start justify-center bg-[#050607]/85 p-4 pt-32 backdrop-blur-md sm:pt-24"
          onClick={async () => {
            setShowMessages(false);

            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) return;

            const { data: unread } = await supabase
              .from("messages")
              .select("id")
              .eq("sender", user.id)
              .eq("receiver", session.user.id)
              .is("read_at", null);

            const count = unread?.length ?? 0;

            setUnreadMessages(count);

            window.dispatchEvent(
              new CustomEvent("header-message-update")
            );
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[500px] w-[380px] max-h-[78vh] max-w-[92vw] overflow-hidden border border-yellow-400/25 bg-[#0e1012] shadow-[0_0_50px_rgba(0,0,0,.65)]"
          >
            <div className="flex h-14 items-center justify-between border-b border-yellow-400/15 bg-[#151719] px-4">
              <div>
                <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-yellow-400">
                  SECURE COMMUNICATION
                </div>
                <div className="mt-1 font-semibold text-white">
                  {friendNickname || user.username}
                </div>
              </div>

              <button
                onClick={async () => {
                  setShowMessages(false);

                  const {
                    data: { session },
                  } = await supabase.auth.getSession();

                  if (!session?.user) return;

                  const { data: unread } = await supabase
                    .from("messages")
                    .select("id")
                    .eq("sender", user.id)
                    .eq("receiver", session.user.id)
                    .is("read_at", null);

                  const count = unread?.length ?? 0;

                  setUnreadMessages(count);

                  window.dispatchEvent(
                    new CustomEvent("header-message-update")
                  );
                }}
                className="border border-zinc-700 px-3 py-1 font-mono text-xl text-zinc-500 transition hover:border-yellow-400 hover:text-yellow-400"
              >
                ×
              </button>
            </div>

            <div className="h-[calc(100%-56px)] overflow-hidden">
              <Messages otherUserId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsProfiles;
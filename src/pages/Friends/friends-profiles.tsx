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
    <div className="w-full">
<div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-[#1b1b1b] shadow-2xl mb-8">

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,.12),transparent_55%)]" />

  <div className="relative p-8">

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

      <div className="flex items-center gap-6">

        <div className="relative shrink-0">

          <img
            src={avatar}
            alt={user?.username}
            className="w-36 h-36 rounded-full border-4 border-yellow-400 object-cover shadow-[0_0_30px_rgba(212,175,55,.35)]"
          />

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

        <div>


          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold text-white">
  {friendNickname || user?.username}
</h1>

            {badge && (
              <img
                src={badge.badge}
                alt={badge.label}
                title={badge.label}
                className="h-8 w-8"
              />
            )}

          </div>

          <p className="mt-3 text-lg text-slate-400">
            {tradingProfile?.discord_username || "No Discord Username"}
          </p>

{currentUserId !== user.id && (
  <div className="mt-6 flex items-center gap-3">

    <button
      onClick={!isFriend ? sendFriendRequest : undefined}
      disabled={isFriend || sendingRequest || requestPending}
      className={`rounded-xl px-6 py-3 font-semibold transition ${
        isFriend
          ? "bg-yellow-400 text-black cursor-default"
          : requestPending
          ? "bg-slate-600 text-white"
          : "bg-yellow-400 text-black hover:bg-yellow-300"
      }`}
    >
      {isFriend
        ? "Friends"
        : requestPending
        ? "Friend Request Pending"
        : sendingRequest
        ? "Sending..."
        : "Add Friend"}
    </button>

{isFriend && (
  <div className="relative">
    <button
      onClick={() => setShowMessages(true)}
      title="Messages"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b5b5b] text-white shadow-lg transition hover:scale-105 hover:bg-[#707070]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
      </svg>
    </button>

    {unreadMessages > 0 && (
      <div
        className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white"
      >
        {unreadMessages > 99 ? "99+" : unreadMessages}
      </div>
    )}
  </div>
)}

  </div>
)}

        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 w-full lg:w-auto">

        <div className="rounded-2xl border border-yellow-500/30 bg-[#232323] px-8 py-6 flex sm:block items-center justify-between text-center sm:text-center">
  <div className="text-lg sm:text-4xl font-bold text-yellow-400">
    {userStats.owned}
  </div>

  <div className="mt-0 sm:mt-2 text-sm text-slate-400">
    Cards
  </div>
</div>

<div className="rounded-2xl border border-yellow-500/30 bg-[#232323] px-8 py-6 flex sm:block items-center justify-between text-center sm:text-center">
  <div className="text-lg sm:text-4xl font-bold text-yellow-400">
    {userStats.completed}
  </div>

  <div className="mt-0 sm:mt-2 text-xs sm:text-sm text-slate-400">
    Mastersets
  </div>
</div>

<div className="rounded-2xl border border-yellow-500/30 bg-[#232323] px-8 py-6 flex sm:block items-center justify-between text-center sm:text-center">
  <div className="text-lg sm:text-4xl font-bold text-yellow-400">
    {userStats.trades}
  </div>

  <div className="mt-0 sm:mt-2 text-xs sm:text-sm text-slate-400">
    Listings
  </div>
</div>

      </div>

    </div>

  </div>

</div>


<div className="rounded-2xl border border-yellow-500/30 bg-[#323232] p-8 shadow-sm">

<div className="flex flex-wrap gap-3 mb-6">
<button
  onClick={() => setSelectedSection("iso")}
  className={`group relative overflow-hidden rounded-xl px-3 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
${
  selectedSection === "iso"
    ? "bg-[linear-gradient(180deg,#fff9cf_0%,#ffe875_15%,#ffd43b_35%,#ffc107_50%,#ffd84d_65%,#fff3a7_85%,#d89b00_100%)] shadow-[0_0_15px_rgba(255,193,7,.45)] hover:shadow-[0_0_25px_rgba(255,215,0,.8)] before:absolute before:top-0 before:-left-1/2 before:h-full before:w-1/3 before:rotate-12 before:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.85),transparent)] before:opacity-0 hover:before:left-[140%] hover:before:opacity-100 before:transition-all before:duration-700"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105"
}`}
>
    ISO
  </button>

  <button
    onClick={() => {
  setSelectedSection("trade");
  setSelectedSet("ALL");
}}
className={`group relative overflow-hidden rounded-xl px-3 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
${
  selectedSection === "trade"
    ? "bg-[linear-gradient(180deg,#fff9cf_0%,#ffe875_15%,#ffd43b_35%,#ffc107_50%,#ffd84d_65%,#fff3a7_85%,#d89b00_100%)] shadow-[0_0_15px_rgba(255,193,7,.45)] hover:shadow-[0_0_25px_rgba(255,215,0,.8)] before:absolute before:top-0 before:-left-1/2 before:h-full before:w-1/3 before:rotate-12 before:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.85),transparent)] before:opacity-0 hover:before:left-[140%] hover:before:opacity-100 before:transition-all before:duration-700"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105"
}`}
  >
    Trades & Sales
  </button>

  <button
    onClick={() => setSelectedSection("wishlist")}
className={`group relative overflow-hidden rounded-xl px-3 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 active:scale-100
${
  selectedSection === "wishlist"
    ? "bg-[linear-gradient(180deg,#fff9cf_0%,#ffe875_15%,#ffd43b_35%,#ffc107_50%,#ffd84d_65%,#fff3a7_85%,#d89b00_100%)] shadow-[0_0_15px_rgba(255,193,7,.45)] hover:shadow-[0_0_25px_rgba(255,215,0,.8)] before:absolute before:top-0 before:-left-1/2 before:h-full before:w-1/3 before:rotate-12 before:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.85),transparent)] before:opacity-0 hover:before:left-[140%] hover:before:opacity-100 before:transition-all before:duration-700"
    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105"
}`}
  >
    Wishlist
  </button>
</div>

{selectedSection === "iso" ? (
  userProfileSettings.hide_iso ? (
    <p className="text-slate-500">
      This collector has hidden their ISO.
    </p>
  ) : (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {ISO_SET_TABS.map((set) => (
          <button
            key={set.id}
            onClick={() => setSelectedSet(set.id)}
           className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition ${
              selectedSet === set.id
                ? "bg-yellow-400 text-slate-900"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {set.name}
          </button>
        ))}
      </div>

      {selectedSet === "" ? (
  <p className="text-slate-500">
    Select a set to view.
  </p>
) : visibleIsoCards.length === 0 ? (
        <p className="text-slate-500">
          This collector isn't looking for any cards.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
          {filteredIsoCards.map((card) => (
<div
  key={`${card.set_id}-${card.card_key}`}
  onClick={() => setQuickViewCard(card)}
  className={`self-start cursor-pointer overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-white transition hover:scale-[1.02] ${
    isMoon3DoubleWide(card) ? "col-span-2" : ""
  } ${
    !isMoon3DoubleWide(card) &&
    String(card.set_id) === "tcgpromos" &&
    ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
      ? "aspect-[63/88]"
      : ""
  }`}
>
  <img
    src={getTradeCardImage(card)}
    alt={card.card_key}
    className={`block w-full ${
      isMoon3DoubleWide(card)
        ? "h-auto object-contain"
        : String(card.set_id) === "tcgpromos" &&
          ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
        ? "h-full object-cover object-center"
        : "h-full object-contain"
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
    <div className="flex flex-wrap gap-2 mb-6">
      {TRADE_SET_TABS.map((set) => (
        <button
          key={set.id}
          onClick={() => setSelectedSet(set.id)}
          className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition ${
            selectedSet === set.id
              ? "bg-yellow-400 text-slate-900"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {set.name}
        </button>
      ))}
    </div>

    {selectedSet === "" ? (
  <p className="text-slate-500">
    Select a set to view.
  </p>
) : filteredTradeCards.length === 0 ? (
      <p className="text-slate-500">
        This collector has no cards listed for trade or sale.
      </p>
    ) : (
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
        {filteredTradeCards.map((card) => (
<div
  key={`${card.set_id}-${card.card_key}`}
  onClick={() => setQuickViewCard(card)}
className={`
  relative
  overflow-hidden
  rounded-lg sm:rounded-2xl
  border border-slate-200
  bg-white
  shadow-sm
  transition
  hover:-translate-y-1
  hover:shadow-xl
  ${isMoon3DoubleWide(card) ? "col-span-2" : ""}
`}
>
  <div
    className={`absolute left-2 top-2 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-lg ${
      card.type === "trade"
        ? "bg-blue-600"
        : "bg-emerald-600"
    }`}
  >
    {card.type === "trade" ? "TRADE" : "SALE"}
  </div>

  <div
    className={`bg-gradient-to-b from-slate-100 to-white ${
      !isMoon3DoubleWide(card) &&
      String(card.set_id) === "tcgpromos" &&
      ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
        ? "aspect-[63/88]"
        : ""
    }`}
  >
    <img
      src={getTradeCardImage(card)}
      alt={card.card_key}
      className={`block w-full ${
        isMoon3DoubleWide(card)
          ? "h-auto object-contain"
          : String(card.set_id) === "tcgpromos" &&
            ["RR09", "RR10", "RR11", "RR12"].includes(String(card.card_key))
          ? "h-full object-cover object-center"
          : "h-full object-contain"
      }`}
    />
  </div>

<div className="border-t bg-slate-50 px-3 py-2 text-center">
<div className="text-[8px] sm:text-xs font-semibold text-slate-700 truncate">
    {getSetName(String(card.set_id))}
  </div>
</div>
</div>
        ))}
      </div>
    )}
  </>
) : (
  userProfileSettings.hide_wishlist ? (
    <p className="text-slate-500">
      This collector has hidden their wishlist.
    </p>
  ) : (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {WISHLIST_SET_TABS.map((set) => (
          <button
            key={set.id}
            onClick={() => setSelectedSet(set.id)}
            className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition ${
              selectedSet === set.id
                ? "bg-yellow-400 text-slate-900"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {set.name}
          </button>
        ))}
      </div>

      {selectedSet === "" ? (
  <p className="text-slate-500">
    Select a set to view.
  </p>
) : filteredWishlistCards.length === 0 ? (
        <p className="text-slate-500">
          This collector has no wishlist cards.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
          {filteredWishlistCards.map((card) => (
            <div
              key={`${card.set_id}-${card.card_key}`}
              onClick={() => setQuickViewCard(card)}
              className={`cursor-pointer overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-white transition hover:scale-[1.02] ${
                isMoon3DoubleWide(card) ? "col-span-2" : ""
              }`}
            >
              <img
                src={getTradeCardImage(card)}
                alt={card.card_key}
                className="block w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
)}

</div>

{quickViewCard && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
    onClick={() => setQuickViewCard(null)}
  >
    <button
      onClick={() => setQuickViewCard(null)}
      className="absolute right-6 top-6 text-5xl font-bold text-white hover:text-yellow-400"
    >
      ×
    </button>

    <img
      onClick={(e) => e.stopPropagation()}
      src={getTradeCardImage(quickViewCard)}
      alt={quickViewCard.card_key}
className={`max-h-[75vh] max-w-[70vw] rounded-2xl object-contain drop-shadow-2xl ${
  isMoon3DoubleWide(quickViewCard)
    ? "w-[75vw] max-w-[900px]"
    : ""
}`}
    />
  </div>
)}

{showMessages && (
  <div
    className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/70 backdrop-blur-sm pt-28"
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
      className="relative h-[520px] w-[420px] max-h-[80vh] max-w-[95vw] overflow-hidden rounded-[28px] border border-[#3a3a3c] bg-[#1c1c1e] shadow-2xl"
    >
      <div className="flex h-14 items-center justify-between border-b border-[#3a3a3c] bg-[#2c2c2e] px-5">
        <div className="font-semibold text-white">
          {friendNickname || user.username}
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
          className="text-2xl text-gray-400 hover:text-white"
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
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
const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
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
const { data: tradingProfile } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", user.id)
        .single();
const { data: activityData } = await supabase
  .from("user_activity")
  .select("last_activity_at")
  .eq("user_id", user.id)
  .maybeSingle();
setLastActivityAt(activityData?.last_activity_at || null);
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
let completed = 0;
const { data: isoProgress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);
const progressMap = new Map(
  (isoProgress || []).map((row: any) => [String(row.set_id), row])
);
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
const activityStatus = (() => {
  if (!lastActivityAt) {
    return {
      label: "Inactive",
      lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
      darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
      dotClass: "bg-zinc-400",
    };
  }
  const age = Date.now() - new Date(lastActivityAt).getTime();
  if (age <= 24 * 60 * 60 * 1000) {
    return {
      label: "Active in the last 24 Hours",
      lightClass: "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-800",
      darkClass: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
      dotClass: "bg-emerald-500",
    };
  }
  if (age <= 7 * 24 * 60 * 60 * 1000) {
    return {
      label: "Active in the last 7 Days",
      lightClass: "border-[#8a6a00]/20 bg-[#c89d13]/10 text-[#725700]",
      darkClass: "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]",
      dotClass: "bg-[#FFD54A]",
    };
  }
  return {
    label: "Inactive",
    lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
    darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
    dotClass: "bg-zinc-400",
  };
})();
useEffect(() => {
  const syncTheme = () => {
    setIsLightMode(document.documentElement.dataset.theme === "light");
  };
  syncTheme();
  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  return () => observer.disconnect();
}, []);
const isJacob =
  user?.id === "94a1c998-d040-4dd2-b2fb-5f606287139d";
  return (
  <div className={`w-full transition-colors duration-200 ${isLightMode ? "text-zinc-900" : "text-white"}`}>
    <section className={`relative overflow-hidden rounded-[30px] border ${isLightMode ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]" : "border-white/[0.08] bg-[#151718]"}`}>
      <div className={`absolute inset-0 bg-cover bg-center ${isLightMode ? "opacity-[0.08]" : "opacity-[0.07]"}`} style={{ backgroundImage: "url('/website-assets/exploreequestria.webp')" }} />
      <div className={`absolute inset-0 ${isLightMode ? "bg-gradient-to-r from-white via-white/95 to-white/80" : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/80"}`} />
      <div className="relative p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onClose} className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${isLightMode ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100" : "border-white/10 bg-black/20 text-zinc-300 hover:bg-white/[0.06]"}`}>
            ← Back
          </button>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${isLightMode ? activityStatus.lightClass : activityStatus.darkClass}`}>
            <span className={`h-2 w-2 rounded-full ${activityStatus.dotClass}`} />
            {activityStatus.label}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <img src={avatar} alt={user?.username} className={`h-24 w-24 rounded-[24px] border object-cover sm:h-28 sm:w-28 ${isLightMode ? "border-black/10" : "border-white/10"}`} />
            {isJacob && [{ left: "24%", delay: "0s" }, { left: "50%", delay: ".45s" }, { left: "76%", delay: ".9s" }].map((line, i) => (
              <div key={i} className="pointer-events-none absolute" style={{ left: line.left, top: "-16px", animation: "stinkFloat 2s ease-in-out infinite", animationDelay: line.delay }}>
                <svg width="18" height="42" viewBox="0 0 18 42" fill="none">
                  <path d="M9 42C9 32 2 30 2 22C2 16 14 14 14 7C14 4 12 2 10 0" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={`break-words text-3xl font-semibold tracking-tight sm:text-4xl ${isLightMode ? "text-zinc-950" : "text-white"}`}>{friendNickname || user?.username}</h1>
              {badge && <img src={badge.badge} alt={badge.label} title={badge.label} className="h-6 w-6 object-contain" />}
            </div>
            {friendNickname && <div className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>{user?.username}</div>}
            {tradingProfile?.discord_username && (
              <div className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Discord: <span className={isLightMode ? "font-medium text-[#725700]" : "font-medium text-[#FFE27A]"}>{tradingProfile.discord_username}</span>
              </div>
            )}
            {currentUserId !== user.id && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="button" onClick={!isFriend ? sendFriendRequest : undefined} disabled={isFriend || sendingRequest || requestPending} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isFriend ? isLightMode ? "bg-[#c89d13]/15 text-[#725700]" : "bg-[#FFD54A]/10 text-[#FFE27A]" : requestPending ? isLightMode ? "cursor-not-allowed bg-zinc-100 text-zinc-500" : "cursor-not-allowed bg-white/[0.05] text-zinc-500" : "bg-[#FFD54A] text-black hover:bg-[#FFE27A]"}`}>
                  {isFriend ? "Friends" : requestPending ? "Request Pending" : sendingRequest ? "Sending..." : "Add Friend"}
                </button>
                {isFriend && (
                  <button type="button" onClick={() => setShowMessages(true)} className={`relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${isLightMode ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"}`}>
                    Messages
                    {unreadMessages > 0 && <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadMessages > 99 ? "99+" : unreadMessages}</span>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
    <section className="mt-4 grid grid-cols-3 gap-3">
      {[["Cards Owned", userStats.owned.toLocaleString()], ["Sets Completed", userStats.completed], ["Listings", userStats.trades]].map(([label, value]) => (
        <div key={label} className={`rounded-2xl border p-4 sm:p-5 ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
          <div className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{label}</div>
          <div className="mt-1 text-2xl font-semibold sm:text-3xl">{value}</div>
        </div>
      ))}
    </section>
    <section className={`mt-4 overflow-hidden rounded-[28px] border ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
      <div className={`grid grid-cols-3 border-b ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
        {[["iso", "ISO"], ["trade", "Trades"], ["wishlist", "Wishlist"]].map(([key, label]) => (
          <button key={key} type="button" onClick={() => { setSelectedSection(key as "iso" | "trade" | "wishlist"); if (key === "trade") setSelectedSet("ALL"); else setSelectedSet(""); }} className={`px-3 py-3.5 text-sm font-semibold transition-colors ${selectedSection === key ? isLightMode ? "bg-[#c89d13]/10 text-[#725700]" : "bg-[#FFD54A]/10 text-[#FFE27A]" : isLightMode ? "text-zinc-500 hover:bg-zinc-50" : "text-zinc-500 hover:bg-white/[0.04]"}`}>
            {label}
          </button>
        ))}
      </div>
      {selectedSection === "iso" ? (
        userProfileSettings.hide_iso ? (
          <div className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>This Superfan has hidden their ISO.</div>
        ) : (
          <>
            <div className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
              <div className="flex flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ISO_SET_TABS.map((set) => <button key={set.id} type="button" onClick={() => setSelectedSet(set.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${selectedSet === set.id ? isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]" : isLightMode ? "border-black/10 bg-zinc-50 text-zinc-600" : "border-white/10 bg-white/[0.04] text-zinc-400"}`}>{set.name}</button>)}
              </div>
            </div>
            <div className="p-3 sm:p-5">
              {selectedSet === "" ? <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>Select a set.</div> : filteredIsoCards.length === 0 ? <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>No cards to show.</div> : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                  {filteredIsoCards.map((card) => <button key={`${card.set_id}-${card.card_key}`} type="button" onClick={() => setQuickViewCard(card)} className={`relative overflow-hidden rounded-[10px] bg-transparent ${isMoon3DoubleWide(card) ? "col-span-2" : ""}`}><img src={getTradeCardImage(card)} alt={card.card_key} className={`block h-full w-full bg-transparent ${["12","FW","SD","tcgpromos"].includes(String(card.set_id)) ? "object-contain" : "scale-[1.05] object-cover"}`} /></button>)}
                </div>
              )}
            </div>
          </>
        )
      ) : selectedSection === "trade" ? (
        <>
          <div className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
            <div className="flex flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TRADE_SET_TABS.map((set) => <button key={set.id} type="button" onClick={() => setSelectedSet(set.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${selectedSet === set.id ? isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]" : isLightMode ? "border-black/10 bg-zinc-50 text-zinc-600" : "border-white/10 bg-white/[0.04] text-zinc-400"}`}>{set.name}</button>)}
            </div>
          </div>
          <div className="p-3 sm:p-5">
            {selectedSet === "" ? <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>Select a set.</div> : filteredTradeCards.length === 0 ? <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>No listings to show.</div> : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                {filteredTradeCards.map((card: any) => <button key={`${card.set_id}-${card.card_key}`} type="button" onClick={() => setQuickViewCard(card)} className={`relative overflow-hidden rounded-[10px] bg-transparent ${isMoon3DoubleWide(card) ? "col-span-2" : ""}`}><img src={getTradeCardImage(card)} alt={card.card_key} className={`block h-full w-full bg-transparent ${["12","FW","SD","tcgpromos"].includes(String(card.set_id)) ? "object-contain" : "scale-[1.05] object-cover"}`} /><span className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold ${isLightMode ? "bg-white/90 text-zinc-700" : "bg-black/70 text-white"}`}>{card.type === "sale" ? "For Sale" : "Trade"}</span></button>)}
              </div>
            )}
          </div>
        </>
      ) : userProfileSettings.hide_wishlist ? (
        <div className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>This Superfan has hidden their wishlist.</div>
      ) : (
        <>
          <div className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
            <div className="flex flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {WISHLIST_SET_TABS.map((set) => <button key={set.id} type="button" onClick={() => setSelectedSet(set.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${selectedSet === set.id ? isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]" : isLightMode ? "border-black/10 bg-zinc-50 text-zinc-600" : "border-white/10 bg-white/[0.04] text-zinc-400"}`}>{set.name}</button>)}
            </div>
          </div>
          <div className="p-3 sm:p-5">
            {selectedSet === "" ? <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>Select a set.</div> : filteredWishlistCards.length === 0 ? <div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>No wishlist cards to show.</div> : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                {filteredWishlistCards.map((card) => <button key={`${card.set_id}-${card.card_key}`} type="button" onClick={() => setQuickViewCard(card)} className={`relative overflow-hidden rounded-[10px] bg-transparent ${isMoon3DoubleWide(card) ? "col-span-2" : ""}`}><img src={getTradeCardImage(card)} alt={card.card_key} className={`block h-full w-full bg-transparent ${["12","FW","SD","tcgpromos"].includes(String(card.set_id)) ? "object-contain" : "scale-[1.05] object-cover"}`} /></button>)}
              </div>
            )}
          </div>
        </>
      )}
    </section>
    {quickViewCard && (
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/25" : "bg-black/80"}`} onClick={() => setQuickViewCard(null)}>
        <button type="button" onClick={(e) => e.stopPropagation()} className={`relative overflow-hidden rounded-[20px] bg-transparent ${isMoon3DoubleWide(quickViewCard) ? "w-[min(92vw,850px)]" : "w-[min(82vw,425px)]"}`}>
          <img src={getTradeCardImage(quickViewCard)} alt={quickViewCard.card_key} className={`block max-h-[76vh] w-full bg-transparent ${["12","FW","SD","tcgpromos"].includes(String(quickViewCard.set_id)) ? "object-contain" : "scale-[1.05] object-cover"}`} />
        </button>
      </div>
    )}
    {showMessages && (
      <div className={`fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-32 backdrop-blur-md sm:pt-24 ${isLightMode ? "bg-white/35" : "bg-black/75"}`} onClick={async () => { setShowMessages(false); const { data: { session } } = await supabase.auth.getSession(); if (!session?.user) return; const { data: unread } = await supabase.from("messages").select("id").eq("sender", user.id).eq("receiver", session.user.id).is("read_at", null); const count = unread?.length ?? 0; setUnreadMessages(count); window.dispatchEvent(new CustomEvent("header-message-update")); }}>
        <div onClick={(e) => e.stopPropagation()} className={`relative h-[500px] w-[380px] max-h-[78vh] max-w-[92vw] overflow-hidden rounded-[24px] border shadow-[0_20px_60px_rgba(0,0,0,.28)] ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]"}`}>
          <div className={`flex h-14 items-center justify-between border-b px-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
            <div className="min-w-0"><div className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>Messages</div><div className="truncate font-semibold">{friendNickname || user.username}</div></div>
            <button type="button" onClick={async () => { setShowMessages(false); const { data: { session } } = await supabase.auth.getSession(); if (!session?.user) return; const { data: unread } = await supabase.from("messages").select("id").eq("sender", user.id).eq("receiver", session.user.id).is("read_at", null); const count = unread?.length ?? 0; setUnreadMessages(count); window.dispatchEvent(new CustomEvent("header-message-update")); }} className={`rounded-lg px-3 py-1.5 text-xl ${isLightMode ? "text-zinc-500 hover:bg-zinc-100" : "text-zinc-400 hover:bg-white/[0.06]"}`}>×</button>
          </div>
          <div className="h-[calc(100%-56px)] overflow-hidden"><Messages otherUserId={user.id} /></div>
        </div>
      </div>
    )}
  </div>
);
};
export default FriendsProfiles;

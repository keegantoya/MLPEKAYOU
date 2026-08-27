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
const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
const [currentUserId, setCurrentUserId] = useState("");
const [isFriend, setIsFriend] = useState(false);
const [requestPending, setRequestPending] = useState(false);
const [sendingRequest, setSendingRequest] = useState(false);
const isEmbedded =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("embed") === "1";
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
const {
  data: { session },
} = await supabase.auth.getSession();
if (!cancelled) {
  setCurrentUserId(session?.user?.id || "");
}
if (session?.user && session.user.id !== profileData.id) {
const [{ data: friendship }, { data: pendingRequest }] = await Promise.all([
    supabase
      .from("friends")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("friend_id", profileData.id)
      .maybeSingle(),
    supabase
      .from("friend_requests")
      .select("id")
      .eq("sender_id", session.user.id)
      .eq("receiver_id", profileData.id)
      .eq("status", "pending")
      .maybeSingle(),
  ]);
  if (!cancelled) {
    setIsFriend(Boolean(friendship));
    setRequestPending(Boolean(pendingRequest));
  }
} else if (!cancelled) {
  setIsFriend(false);
  setRequestPending(false);
}
const { data: activityData } = await supabase
  .from("user_activity")
  .select("last_activity_at")
  .eq("user_id", profileData.id)
  .maybeSingle();
if (!cancelled) {
  setLastActivityAt(activityData?.last_activity_at || null);
}
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
const { count: trades } = await supabase
      .from("for_trade")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);
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
async function sendFriendRequest() {
  if (!currentUserId || !profile?.id || currentUserId === profile.id) return;
  if (isFriend || requestPending || sendingRequest) return;
  setSendingRequest(true);
const { data: targetProfile } = await supabase
    .from("profiles")
    .select("allow_friend_requests")
    .eq("id", profile.id)
    .maybeSingle();
  if (targetProfile && targetProfile.allow_friend_requests === false) {
    alert("This Superfan isn't accepting friend requests.");
    setSendingRequest(false);
    return;
  }
const { error } = await supabase
    .from("friend_requests")
    .insert({
      sender_id: currentUserId,
      receiver_id: profile.id,
      status: "pending",
    });
  if (!error) {
    setRequestPending(true);
  }
  setSendingRequest(false);
}
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
      className={`fixed inset-0 z-[9999] overflow-y-auto p-3 backdrop-blur-md sm:flex sm:items-center sm:justify-center sm:overflow-hidden sm:p-8 ${
        isLightMode ? "bg-white/35" : "bg-black/80"
      }`}
      onClick={() => setShowCollectionModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex min-h-full w-full flex-col overflow-hidden rounded-[28px] border ${
          isEmbedded
            ? "sm:h-[88vh] sm:min-h-0 sm:w-[94vw] sm:max-w-[980px] sm:flex-row"
            : "sm:h-[72vh] sm:min-h-0 sm:w-[78vw] sm:max-w-[1080px] sm:flex-row"
        } ${
          isLightMode
            ? "border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,.18)]"
            : "border-white/10 bg-[#151718] shadow-[0_24px_70px_rgba(0,0,0,.45)]"
        }`}
      >
        <div className={`flex w-full shrink-0 flex-col border-b sm:w-52 sm:border-b-0 sm:border-r ${
          isLightMode ? "border-black/[0.08] bg-zinc-50" : "border-white/[0.07] bg-[#111314]"
        }`}>
          <div className={`flex items-center justify-between border-b px-4 py-4 sm:block sm:p-5 ${
            isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"
          }`}>
            <div>
              <h2 className="text-lg font-semibold">{modeLabel}</h2>
              <div className={`mt-1 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                {modalTabs.length} {modalTabs.length === 1 ? "set" : "sets"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCollectionModal(false)}
              className={`rounded-lg px-3 py-1.5 text-xl sm:hidden ${
                isLightMode ? "text-zinc-500 hover:bg-black/[0.05]" : "text-zinc-400 hover:bg-white/[0.06]"
              }`}
            >
              ×
            </button>
          </div>
          <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto p-3 sm:block sm:flex-1 sm:space-y-1 sm:overflow-x-hidden sm:overflow-y-auto">
            {modalTabs.map((setId) => (
              <button
                key={setId}
                type="button"
                onClick={() => setSelectedSet(setId)}
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:w-full sm:rounded-xl sm:text-left ${
                  selectedSet === setId
                    ? isLightMode
                      ? "bg-[#c89d13]/15 text-[#725700]"
                      : "bg-[#FFD54A]/10 text-[#FFE27A]"
                    : isLightMode
                    ? "text-zinc-600 hover:bg-black/[0.04]"
                    : "text-zinc-400 hover:bg-white/[0.05]"
                }`}
              >
                {getSetName(setId)}
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className={`sticky top-0 z-20 flex items-center justify-between border-b px-4 py-4 backdrop-blur-xl sm:px-6 ${
            isLightMode ? "border-black/[0.08] bg-white/95" : "border-white/[0.07] bg-[#151718]/95"
          }`}>
            <div className="min-w-0">
              <div className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{modeLabel}</div>
              <h3 className="truncate text-lg font-semibold sm:text-xl">{getSetName(selectedSet)}</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCollectionModal(false)}
              className={`hidden rounded-lg px-3 py-1.5 text-2xl sm:block ${
                isLightMode ? "text-zinc-500 hover:bg-black/[0.05]" : "text-zinc-400 hover:bg-white/[0.06]"
              }`}
            >
              ×
            </button>
          </div>
          <div className="p-3 sm:p-6">
            {filteredCards.length === 0 ? (
              <div className={`flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed px-6 text-center text-sm ${
                isLightMode ? "border-black/10 bg-zinc-50 text-zinc-500" : "border-white/10 bg-white/[0.03] text-zinc-400"
              }`}>
                There's nothing to see here.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
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
                      if (card.set_id === "FW") return card.card_key.match(/BP01([A-Z]+)\d+/)?.[1] ?? "";
                      if (card.set_id === "12") return card.card_key.match(/BP02-([A-Z]+)\d+/)?.[1] ?? "";
                      if (card.set_id === "friendshipsbegin" || card.set_id === "SD") return card.card_key.match(/SD01([A-Z]+)\d+/)?.[1] ?? "";
                      return card.card_key.split("-")[0];
                    };
const getNumber = (card: any) => {
const match = card.card_key.match(/(\d+)$/);
                      return match ? parseInt(match[1], 10) : 0;
                    };
const order = rarityOrder[String(a.set_id)] ?? [];
const rarityDiff = order.indexOf(getRarity(a)) - order.indexOf(getRarity(b));
                    if (rarityDiff !== 0) return rarityDiff;
                    return getNumber(a) - getNumber(b);
                  })
                  .map((card: any) => (
                    <div
                      key={`${card.set_id}-${card.card_key}`}
                      className={`relative overflow-hidden rounded-[10px] bg-transparent ${
                        String(card.set_id) === "3" && String(card.card_key) === "SZR-1"
                          ? "col-span-2 aspect-[10/7]"
                          : "aspect-[5/7]"
                      }`}
                    >
                      <img
                        src={getTradeCardImage(card)}
                        alt={card.card_key}
                        className={`absolute inset-0 h-full w-full bg-transparent ${
                          ["FW", "SD", "friendshipsbegin", "12", "tcgpromos"].includes(String(card.set_id))
                            ? "object-contain"
                            : "scale-[1.05] object-cover"
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
  <div className={`min-h-screen pb-32 transition-colors duration-200 sm:pb-8 ${
    isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
  }`}>
    <main
      className={
        isEmbedded
          ? "mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4"
          : "mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8"
      }
    >
      <section className={`relative overflow-hidden rounded-[30px] border ${
        isLightMode
          ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]"
          : "border-white/[0.08] bg-[#151718]"
      }`}>
        <div
          className={`absolute inset-0 bg-cover bg-center ${
            isLightMode ? "opacity-[0.08]" : "opacity-[0.07]"
          }`}
          style={{ backgroundImage: "url('/website-assets/exploreequestria.webp')" }}
        />
        <div className={`absolute inset-0 ${
          isLightMode
            ? "bg-gradient-to-r from-white via-white/95 to-white/80"
            : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/80"
        }`} />
        <div className={isEmbedded ? "relative p-4 sm:p-5" : "relative p-5 sm:p-7"}>
          <div className={isEmbedded ? "flex items-center justify-start sm:justify-end" : "flex items-center justify-end"}>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              isLightMode ? activityStatus.lightClass : activityStatus.darkClass
            }`}>
              <span className={`h-2 w-2 rounded-full ${activityStatus.dotClass}`} />
              {activityStatus.label}
            </div>
          </div>
          <div
            className={
              isEmbedded
                ? "mt-3 flex items-center gap-3 sm:gap-4"
                : "mt-4 flex flex-col gap-5 sm:flex-row sm:items-center"
            }
          >
            <img
              src={avatar}
              alt={profile?.username}
              className={`${isEmbedded ? "h-16 w-16 sm:h-20 sm:w-20" : "h-24 w-24 sm:h-28 sm:w-28"} shrink-0 rounded-[24px] border object-cover ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`break-words font-semibold tracking-tight ${
                  isEmbedded ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
                } ${
                  isLightMode ? "text-zinc-950" : "text-white"
                }`}>
                  {profile?.username}
                </h1>
                {getProfileAssets(profile).verification && (
                  <img
                    src={getProfileAssets(profile).verification!.badge}
                    alt={getProfileAssets(profile).verification!.label}
                    title={getProfileAssets(profile).verification!.label}
                    className="h-6 w-6 object-contain"
                  />
                )}
              </div>
              {discord && (
                <div className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  Discord: <span className={isLightMode ? "font-medium text-[#725700]" : "font-medium text-[#FFE27A]"}>{discord}</span>
                </div>
              )}
              <p className={`${isEmbedded ? "mt-2 hidden sm:block" : "mt-3"} max-w-2xl text-sm leading-6 ${
                isLightMode ? "text-zinc-600" : "text-zinc-400"
              }`}>
                Send me a friend request or contact me via Discord.
              </p>
              <div className={isEmbedded ? "mt-2 flex flex-wrap gap-2" : "mt-4 flex flex-wrap gap-2"}>
                {currentUserId && currentUserId !== profile?.id && (
                  <button
                    type="button"
                    onClick={sendFriendRequest}
                    disabled={isFriend || requestPending || sendingRequest}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isFriend
                        ? isLightMode
                          ? "bg-[#c89d13]/15 text-[#725700]"
                          : "bg-[#FFD54A]/10 text-[#FFE27A]"
                        : requestPending
                        ? isLightMode
                          ? "cursor-not-allowed bg-zinc-100 text-zinc-500"
                          : "cursor-not-allowed bg-white/[0.05] text-zinc-500"
                        : "bg-[#FFD54A] text-black hover:bg-[#FFE27A]"
                    }`}
                  >
                    {isFriend
                      ? "Friends"
                      : requestPending
                      ? "Request Pending"
                      : sendingRequest
                      ? "Sending..."
                      : "Add Friend"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
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
                  }}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isLightMode
                      ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100"
                      : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {copied ? "Link Copied" : "Share Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={isEmbedded ? "mt-3" : "mt-4"}>
        <div
          className={`rounded-2xl border ${
            isEmbedded ? "flex items-center justify-between px-4 py-3" : "p-4 sm:p-5"
          } ${
            isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>Owned Cards</div>
          <div className={isEmbedded ? "text-lg font-semibold" : "mt-1 text-2xl font-semibold sm:text-3xl"}>
            {stats.owned.toLocaleString()}
          </div>
        </div>
      </section>
      <section
        className={
          isEmbedded
            ? "mt-3 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3"
            : "mt-4 grid gap-4 xl:grid-cols-3"
        }
      >
        {[
          {
            title: "ISO",
            cards: visibleIsoCards,
            mode: "iso" as const,
            count: null,
          },
          {
            title: "Wishlist",
            cards: wishlistCards,
            mode: "wishlist" as const,
            count: stats.wishlist,
          },
          {
            title: "For Trade",
            cards: tradeCards,
            mode: "trade" as const,
            count: stats.trades,
          },
        ].map((section) => (
          <div
            key={section.title}
            className={`rounded-[26px] border ${isEmbedded ? "p-3 sm:p-4" : "p-4 sm:p-5"} ${
              isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div className={isEmbedded ? "mb-3 flex items-center justify-between" : "mb-4 flex items-center justify-between"}>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                {section.count !== null && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-600"
                        : "border-white/10 bg-white/[0.04] text-zinc-300"
                    }`}
                  >
                    {section.count.toLocaleString()}
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={section.cards.length === 0}
                onClick={() => {
                  if (section.cards.length === 0) return;
                  setCollectionMode(section.mode);
                  setSelectedSet(String(section.cards[0]?.set_id ?? ""));
                  setShowCollectionModal(true);
                }}
                className={`text-sm font-semibold ${
                  section.cards.length === 0
                    ? "cursor-not-allowed text-zinc-500"
                    : isLightMode
                    ? "text-[#725700] hover:text-[#5c4700]"
                    : "text-[#FFE27A] hover:text-white"
                }`}
              >
                View All
              </button>
            </div>
            {section.cards.length === 0 ? (
              <div className={`flex items-center justify-center rounded-2xl border border-dashed px-5 text-center text-sm ${
                isEmbedded ? "min-h-[110px]" : "min-h-[180px]"
              } ${
                isLightMode ? "border-black/10 bg-zinc-50 text-zinc-500" : "border-white/10 bg-white/[0.03] text-zinc-400"
              }`}>
                There's nothing to see here.
              </div>
            ) : (
              <div
                className={
                  isEmbedded
                    ? "grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6"
                    : "grid grid-cols-4 gap-2 sm:gap-3"
                }
              >
                {section.cards.slice(0, 8).map((card: any) => (
                  <div
                    key={`${card.set_id}-${card.card_key}`}
                    className={`relative overflow-hidden rounded-[10px] bg-transparent ${
                      String(card.set_id) === "3" && String(card.card_key) === "SZR-1"
                        ? "col-span-2 aspect-[10/7]"
                        : "aspect-[5/7]"
                    }`}
                  >
                    <img
                      src={getTradeCardImage(card)}
                      alt={card.card_key}
                      className={`absolute inset-0 h-full w-full bg-transparent ${
                        ["FW", "SD", "friendshipsbegin", "12", "tcgpromos"].includes(String(card.set_id))
                          ? "object-contain"
                          : "scale-[1.05] object-cover"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
      <CollectionModal />
    </main>
  </div>
);
}

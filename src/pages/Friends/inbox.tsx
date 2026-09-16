import CardImage from "@/components/CardImage";
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Handshake,
  MessageSquare,
  Pencil,
  Search,
  Star,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
import Messages from "./messages";
const FRIENDS_PER_PAGE = 12;
interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  username: string;
  avatar_url: string | null;
}
interface Friend {
  id: string;
  username: string;
  nickname?: string;
  unreadMessages?: number;
  favorite?: boolean;
  profile: any;
  tradingProfile: any;
}
interface InboxHistoryItem {
  id: string;
  profileId: string;
  username: string;
  avatar_url: string | null;
  kind: "accepted" | "accepted_by_you" | "denied" | "messages";
  messageCount?: number;
  createdAt: string;
}
interface PendingFriendRequest {
  id: string;
  profileId: string;
  username: string;
  avatar_url: string | null;
  createdAt: string;
}
interface OfferCardRef {
  set_id: string;
  card_key: string;
}
interface TradeOffer {
  id: string;
  sender_id: string;
  recipient_id: string;
  target_set_id: string;
  target_card_key: string;
  offered_cards: OfferCardRef[];
  contact: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  response_note: string | null;
  created_at: string;
  expires_at: string;
  responded_at: string | null;
}
interface OfferProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}
const OFFER_SET_NAMES: Record<string, string> = {
  "1": "Eternal Moon: First Edition",
  "2": "Eternal Moon: Second Edition",
  "3": "Eternal Moon: Third Edition",
  "4": "Star: First Edition",
  "5": "Rainbow: First Edition",
  "6": "Rainbow: Second Edition",
  "7": "Fun Moments: First Edition",
  "8": "Fun Moments: Second Edition",
  "9": "Promo Cards",
  "11": "Fun Moments: Third Edition",
  "12": "Discord",
  "14": "Nightmare Night",
  FW: "Fantasy Wonderland",
  friendshipsbegin: "Friendships Begin",
  tcgpromos: "TCG Promos",
};
const getOfferCardImage = (card: OfferCardRef) => {
  const [rarity, number] = card.card_key.split("-");
  if (card.set_id === "SD" || card.set_id === "friendshipsbegin") {
    return `/friendships-begin/${card.card_key}.webp`;
  }
  if (card.set_id === "FW") {
    const num = card.card_key.slice(-2);
    if (card.card_key.startsWith("BP01ER")) {
      return `/fantasy-wonderland/SD01ER${num}.webp`;
    }
    if (card.card_key.startsWith("BP01PER")) {
      return `/fantasy-wonderland/SD01PER${num}.webp`;
    }
    return `/fantasy-wonderland/${card.card_key}.webp`;
  }
  if (card.set_id === "14") {
    const erMatch = card.card_key.match(/^BP03-ER(0[12])-([ABC])$/);
    const imageKey = erMatch ? `${card.card_key}${erMatch[2]}` : card.card_key;
    return `/cards/nightmare-night/${imageKey}.webp`;
  }
  if (card.set_id === "12") {
    return `/cards/discord/${card.card_key}.webp`;
  }
  if (card.set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }
  if (card.set_id === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }
  const config: Record<string, { folder: string; prefix: string }> = {
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
  const item = config[card.set_id];
  if (!item) return "";
  const rarityCode = rarity === "SHINING ZR" ? "SZR" : rarity;
  return `/cards/${item.folder}/${item.prefix}${rarityCode}${String(number).padStart(3, "0")}.webp`;
};
function OfferCardThumbnail({ card }: { card: OfferCardRef }) {
  const src = getOfferCardImage(card);
  const [failed, setFailed] = useState(false);
  const isLandscape =
    card.set_id === "14" &&
    /^BP03-C(2[5-9]|3[0-9]|4[0-8])$/.test(card.card_key);
  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-300 px-1 text-center text-[9px] font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
        COMING SOON
      </div>
    );
  }
  return (
    <CardImage
      src={src}
      alt={card.card_key}
      onError={() => setFailed(true)}
      className={
        isLandscape
          ? "absolute object-contain"
          : "absolute inset-0 h-full w-full object-cover"
      }
      style={
        isLandscape
          ? {
              left: "50%",
              top: "50%",
              width: "140%",
              height: "71.4285714286%",
              maxWidth: "none",
              transform: "translate(-50%, -50%) rotate(-90deg)",
            }
          : { transform: "scale(1.035)" }
      }
    />
  );
}
export default function Inbox() {
  const [activeTab, setActiveTab] = useState<
    "notifications" | "friends" | "offers"
  >("notifications");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [pendingSentRequests, setPendingSentRequests] = useState<
    PendingFriendRequest[]
  >([]);
  const [history, setHistory] = useState<InboxHistoryItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [offerProfiles, setOfferProfiles] = useState<
    Record<string, OfferProfile>
  >({});
  const [offerNotes, setOfferNotes] = useState<Record<string, string>>({});
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(
    null,
  );
  const [cancellingOfferId, setCancellingOfferId] = useState<string | null>(
    null,
  );
  const [offerError, setOfferError] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [friendPage, setFriendPage] = useState(1);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [confirmUnfriend, setConfirmUnfriend] = useState<string | null>(null);
  const [confirmCancelRequest, setConfirmCancelRequest] = useState<
    string | null
  >(null);
  const [editingNickname, setEditingNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [messageFriend, setMessageFriend] = useState<Friend | null>(null);
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
  const normalizedFriendSearch = friendSearch.trim().toLocaleLowerCase();
  const filteredFriends = friends.filter((friend) => {
    if (!normalizedFriendSearch) return true;
    return (
      friend.username.toLocaleLowerCase().includes(normalizedFriendSearch) ||
      (friend.nickname ?? "")
        .toLocaleLowerCase()
        .includes(normalizedFriendSearch)
    );
  });
  const totalFriendPages = Math.max(
    1,
    Math.ceil(filteredFriends.length / FRIENDS_PER_PAGE),
  );
  const currentFriendPage = Math.min(friendPage, totalFriendPages);
  const visibleFriends = filteredFriends.slice(
    (currentFriendPage - 1) * FRIENDS_PER_PAGE,
    currentFriendPage * FRIENDS_PER_PAGE,
  );
  const getOfferStatus = (offer: TradeOffer) =>
    offer.status === "pending" &&
    new Date(offer.expires_at).getTime() <= Date.now()
      ? "expired"
      : offer.status;
  const pendingIncomingOffers = offers.filter(
    (offer) =>
      offer.recipient_id === currentUserId &&
      getOfferStatus(offer) === "pending",
  ).length;
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const connect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active || !session?.user) return;
      const userId = session.user.id;
      channel = supabase
        .channel(`inbox-updates-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `receiver=eq.${userId}`,
          },
          () => void loadInbox(false),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "friend_requests",
            filter: `receiver_id=eq.${userId}`,
          },
          () => void loadInbox(false),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "friend_requests",
            filter: `sender_id=eq.${userId}`,
          },
          () => void loadInbox(false),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "trade_offers",
            filter: `recipient_id=eq.${userId}`,
          },
          () => void loadOffers(userId),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "trade_offers",
            filter: `sender_id=eq.${userId}`,
          },
          () => void loadOffers(userId),
        )
        .subscribe();
    };
    void loadInbox();
    void connect();
    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);
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
  async function loadOffers(userId: string) {
    const { data, error } = await supabase
      .from("trade_offers")
      .select(
        "id, sender_id, recipient_id, target_set_id, target_card_key, offered_cards, contact, status, response_note, created_at, expires_at, responded_at",
      )
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("Unable to load trade offers:", error);
      setOfferError("Offers could not be loaded. Please try again.");
      return;
    }
    const loadedOffers = (data || []).map((offer: any) => ({
      ...offer,
      offered_cards: Array.isArray(offer.offered_cards)
        ? offer.offered_cards.slice(0, 10)
        : [],
    })) as TradeOffer[];
    setOffers(loadedOffers);
    setOfferError("");
    const profileIds = Array.from(
      new Set(
        loadedOffers.map((offer) =>
          offer.sender_id === userId ? offer.recipient_id : offer.sender_id,
        ),
      ),
    );
    if (profileIds.length === 0) {
      setOfferProfiles({});
      return;
    }
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", profileIds);
    setOfferProfiles(
      Object.fromEntries(
        (profiles || []).map((profile) => [profile.id, profile]),
      ),
    );
  }
  async function loadInbox(showLoading = true) {
    if (showLoading) setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }
    const userId = session.user.id;
    setCurrentUserId(userId);
    const offersPromise = loadOffers(userId);
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("allow_friend_requests")
      .eq("id", userId)
      .single();
    setAllowFriendRequests(myProfile?.allow_friend_requests ?? true);
    const { data: requestRows } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", userId)
      .eq("status", "pending");
    if (requestRows && requestRows.length > 0) {
      const senderIds = requestRows.map((request) => request.sender_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", senderIds);
      const merged = requestRows.map((request) => {
        const profile = profiles?.find((item) => item.id === request.sender_id);
        return {
          ...request,
          username: profile?.username ?? "Unknown User",
          avatar_url: profile?.avatar_url ?? null,
        };
      });
      setRequests(merged);
    } else {
      setRequests([]);
    }
    const [
      { data: sentRequestRows },
      { data: acceptedByYouRows },
      { data: messageRows },
    ] = await Promise.all([
      supabase
        .from("friend_requests")
        .select("id, receiver_id, status, created_at")
        .eq("sender_id", userId)
        .in("status", ["pending", "accepted", "denied"])
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("friend_requests")
        .select("id, sender_id, created_at")
        .eq("receiver_id", userId)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("messages")
        .select("id, sender, created_at")
        .eq("receiver", userId)
        .order("created_at", { ascending: false })
        .limit(250),
    ]);
    const historyProfileIds = Array.from(
      new Set([
        ...(sentRequestRows?.map((request) => request.receiver_id) ?? []),
        ...(acceptedByYouRows?.map((request) => request.sender_id) ?? []),
        ...(messageRows?.map((message) => message.sender) ?? []),
      ]),
    );
    const { data: historyProfiles } = historyProfileIds.length
      ? await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", historyProfileIds)
      : { data: [] };
    const profileById = new Map(
      (historyProfiles ?? []).map((profile) => [profile.id, profile]),
    );
    const messageHistory = Array.from(
      (messageRows ?? []).reduce(
        (
          grouped: Map<string, { count: number; createdAt: string }>,
          message,
        ) => {
          const existing = grouped.get(message.sender);
          grouped.set(message.sender, {
            count: (existing?.count ?? 0) + 1,
            createdAt: existing?.createdAt ?? message.created_at,
          });
          return grouped;
        },
        new Map<string, { count: number; createdAt: string }>(),
      ),
    ).map(([profileId, messages]) => {
      const profile = profileById.get(profileId);
      return {
        id: `messages-${profileId}`,
        profileId,
        username: profile?.username ?? "Unknown User",
        avatar_url: profile?.avatar_url ?? null,
        kind: "messages" as const,
        messageCount: messages.count,
        createdAt: messages.createdAt,
      };
    });
    const pendingRequestHistory = (sentRequestRows ?? [])
      .filter((request) => request.status === "pending")
      .map((request) => {
        const profile = profileById.get(request.receiver_id);
        return {
          id: request.id,
          profileId: request.receiver_id,
          username: profile?.username ?? "Unknown User",
          avatar_url: profile?.avatar_url ?? null,
          createdAt: request.created_at,
        };
      });
    setPendingSentRequests(pendingRequestHistory);
    const requestHistory = (sentRequestRows ?? [])
      .filter(
        (request) =>
          request.status === "accepted" || request.status === "denied",
      )
      .map((request) => {
        const profile = profileById.get(request.receiver_id);
        return {
          id: `request-${request.id}`,
          profileId: request.receiver_id,
          username: profile?.username ?? "Unknown User",
          avatar_url: profile?.avatar_url ?? null,
          kind: request.status as "accepted" | "denied",
          createdAt: request.created_at,
        };
      });
    const acceptedByYouHistory = (acceptedByYouRows ?? []).map((request) => {
      const profile = profileById.get(request.sender_id);
      return {
        id: `accepted-by-you-${request.id}`,
        profileId: request.sender_id,
        username: profile?.username ?? "Unknown User",
        avatar_url: profile?.avatar_url ?? null,
        kind: "accepted_by_you" as const,
        createdAt: request.created_at,
      };
    });
    setHistory(
      [...requestHistory, ...acceptedByYouHistory, ...messageHistory]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 50),
    );
    const { data: friendRows } = await supabase
      .from("friends")
      .select("*")
      .eq("user_id", userId);
    if (friendRows && friendRows.length > 0) {
      const ids = friendRows.map((friend) => friend.friend_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", ids);
      const { data: tradingProfiles } = await supabase
        .from("trading_profiles")
        .select("*")
        .in("user_id", ids);
      const { data: nicknames } = await supabase
        .from("friend_nicknames")
        .select("*")
        .eq("user_id", userId);
      const { data: favorites } = await supabase
        .from("favorite_friends")
        .select("friend_id")
        .eq("user_id", userId);
      const favoriteIds = new Set(
        favorites?.map((favorite) => favorite.friend_id) ?? [],
      );
      const { data: unreadRows } = await supabase
        .from("messages")
        .select("sender")
        .eq("receiver", userId)
        .is("read_at", null);
      const unreadCounts = (unreadRows ?? []).reduce(
        (acc: Record<string, number>, row: any) => {
          acc[row.sender] = (acc[row.sender] ?? 0) + 1;
          return acc;
        },
        {},
      );
      const loadedFriends =
        profiles?.map((profile) => ({
          id: profile.id,
          username: profile.username,
          nickname:
            nicknames?.find((nickname) => nickname.friend_id === profile.id)
              ?.nickname ?? "",
          unreadMessages: unreadCounts[profile.id] ?? 0,
          favorite: favoriteIds.has(profile.id),
          profile,
          tradingProfile:
            tradingProfiles?.find(
              (tradingProfile) => tradingProfile.user_id === profile.id,
            ) ?? null,
        })) ?? [];
      loadedFriends.sort((a, b) => {
        if (a.favorite !== b.favorite) {
          return Number(b.favorite) - Number(a.favorite);
        }
        return (a.nickname || a.username).localeCompare(
          b.nickname || b.username,
        );
      });
      setFriends(loadedFriends);
    } else {
      setFriends([]);
    }
    await offersPromise;
    setLoading(false);
  }
  async function acceptRequest(request: FriendRequest) {
    await supabase.rpc("accept_friend_request", {
      request_id: request.id,
    });
    setRequests((previous) =>
      previous.filter((item) => item.id !== request.id),
    );
    window.dispatchEvent(new CustomEvent("header-inbox-update"));
    void loadInbox();
  }
  async function toggleFriendRequests() {
    const newValue = !allowFriendRequests;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase
      .from("profiles")
      .update({
        allow_friend_requests: newValue,
      })
      .eq("id", session.user.id);
    setAllowFriendRequests(newValue);
  }
  async function denyRequest(request: FriendRequest) {
    await supabase
      .from("friend_requests")
      .update({
        status: "denied",
      })
      .eq("id", request.id);
    setRequests((previous) =>
      previous.filter((item) => item.id !== request.id),
    );
    window.dispatchEvent(new CustomEvent("header-inbox-update"));
  }
  async function cancelSentRequest(requestId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: deletedRequest, error } = await supabase
      .from("friend_requests")
      .delete()
      .eq("id", requestId)
      .eq("sender_id", session.user.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (error || !deletedRequest) {
      console.error("Unable to cancel friend request:", error);
      return;
    }
    setPendingSentRequests((current) =>
      current.filter((request) => request.id !== requestId),
    );
    setConfirmCancelRequest(null);
    window.dispatchEvent(new CustomEvent("header-inbox-update"));
  }
  async function unfriend(friendId: string) {
    await supabase.rpc("unfriend", {
      friend: friendId,
    });
    setConfirmUnfriend(null);
    void loadInbox();
  }
  async function toggleFavorite(friendId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const friend = friends.find((item) => item.id === friendId);
    if (!friend) return;
    if (friend.favorite) {
      const { error } = await supabase
        .from("favorite_friends")
        .delete()
        .eq("user_id", session.user.id)
        .eq("friend_id", friendId);
      console.log(error);
    } else {
      const { error } = await supabase.from("favorite_friends").insert({
        user_id: session.user.id,
        friend_id: friendId,
      });
      console.log(error);
    }
    setFriends((current) => {
      const updated = current.map((item) =>
        item.id === friendId
          ? {
              ...item,
              favorite: !item.favorite,
            }
          : item,
      );
      updated.sort((a, b) => {
        if (a.favorite !== b.favorite) {
          return Number(b.favorite) - Number(a.favorite);
        }
        return (a.nickname || a.username).localeCompare(
          b.nickname || b.username,
        );
      });
      return [...updated];
    });
  }
  async function saveNickname(friendId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const nickname = nicknameInput.trim();
    const { error } = await supabase.from("friend_nicknames").upsert(
      {
        user_id: session.user.id,
        friend_id: friendId,
        nickname,
      },
      {
        onConflict: "user_id,friend_id",
      },
    );
    if (error) {
      alert(error.message);
      return;
    }
    setFriends((previous) =>
      previous.map((friend) =>
        friend.id === friendId
          ? {
              ...friend,
              nickname,
            }
          : friend,
      ),
    );
    setEditingNickname(null);
    setNicknameInput("");
  }
  async function respondToOffer(
    offer: TradeOffer,
    status: "accepted" | "declined",
  ) {
    if (!currentUserId || respondingOfferId) return;
    if (getOfferStatus(offer) !== "pending") {
      setOfferError("This offer has already expired or been answered.");
      return;
    }
    const responseNote = (offerNotes[offer.id] || "").trim().slice(0, 500);
    setRespondingOfferId(offer.id);
    setOfferError("");
    const respondedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("trade_offers")
      .update({
        status,
        response_note: responseNote || null,
        responded_at: respondedAt,
      })
      .eq("id", offer.id)
      .eq("recipient_id", currentUserId)
      .eq("status", "pending")
      .gt("expires_at", respondedAt)
      .select(
        "id, sender_id, recipient_id, target_set_id, target_card_key, offered_cards, contact, status, response_note, created_at, expires_at, responded_at",
      )
      .maybeSingle();
    if (error || !data) {
      console.error("Unable to answer trade offer:", error);
      setOfferError("This offer could not be updated. It may have expired.");
      setRespondingOfferId(null);
      return;
    }
    setOffers((current) =>
      current.map((item) =>
        item.id === offer.id ? ({ ...item, ...data } as TradeOffer) : item,
      ),
    );
    window.dispatchEvent(new CustomEvent("header-inbox-update"));
    setRespondingOfferId(null);
  }
  async function cancelOffer(offer: TradeOffer) {
    if (!currentUserId || cancellingOfferId) return;
    if (
      offer.sender_id !== currentUserId ||
      getOfferStatus(offer) !== "pending"
    ) {
      setOfferError("Only your own pending offers can be cancelled.");
      return;
    }
    setCancellingOfferId(offer.id);
    setOfferError("");
    const cancelledAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("trade_offers")
      .update({
        status: "cancelled",
        responded_at: cancelledAt,
      })
      .eq("id", offer.id)
      .eq("sender_id", currentUserId)
      .eq("status", "pending")
      .gt("expires_at", cancelledAt)
      .select(
        "id, sender_id, recipient_id, target_set_id, target_card_key, offered_cards, contact, status, response_note, created_at, expires_at, responded_at",
      )
      .maybeSingle();
    if (error || !data) {
      console.error("Unable to cancel trade offer:", error);
      setOfferError("This offer could not be cancelled. It may have expired.");
      setCancellingOfferId(null);
      return;
    }
    setOffers((current) =>
      current.map((item) =>
        item.id === offer.id ? ({ ...item, ...data } as TradeOffer) : item,
      ),
    );
    window.dispatchEvent(new CustomEvent("header-inbox-update"));
    setCancellingOfferId(null);
  }
  function openFriendProfile(username: string) {
    window.location.href = `https://www.mlpekayou.community/${encodeURIComponent(
      username,
    )}`;
  }
  async function closeMessages() {
    const closingFriend = messageFriend;
    setMessageFriend(null);
    if (!closingFriend) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: unread } = await supabase
      .from("messages")
      .select("id")
      .eq("sender", closingFriend.id)
      .eq("receiver", session.user.id)
      .is("read_at", null);
    setFriends((current) =>
      current.map((friend) =>
        friend.id === closingFriend.id
          ? { ...friend, unreadMessages: unread?.length ?? 0 }
          : friend,
      ),
    );
    window.dispatchEvent(new CustomEvent("header-message-update"));
  }
  return (
    <div
      className={`min-h-screen px-3 py-4 transition-colors duration-200 sm:px-6 sm:py-8 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="h-2 sm:hidden" />
        <section
          className={`relative overflow-hidden rounded-[30px] border ${
            isLightMode
              ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center ${
              isLightMode ? "opacity-[0.07]" : "opacity-[0.06]"
            }`}
            style={{
              backgroundImage: "url('/website-assets/exploreequestria.webp')",
            }}
          />
          <div
            className={`absolute inset-0 ${
              isLightMode
                ? "bg-gradient-to-r from-white via-white/95 to-white/75"
                : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/75"
            }`}
          />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div
                  className={`text-sm font-semibold ${
                    isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                  }`}
                >
                  Friends & Messages
                </div>
                <h1
                  className={`mt-1 text-4xl font-semibold tracking-tight sm:text-5xl ${
                    isLightMode ? "text-zinc-950" : "text-white"
                  }`}
                >
                  Inbox
                </h1>
                <p
                  className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Manage friend requests, trade offers, profiles, and messages
                  from your connections.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
                <div
                  className={`rounded-2xl border p-4 ${
                    isLightMode
                      ? "border-black/10 bg-white/85"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div
                    className={`text-xs font-medium ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    Friends
                  </div>
                  <div className="mt-1 text-3xl font-semibold">
                    {friends.length}
                  </div>
                </div>
                <div
                  className={`rounded-2xl border p-4 ${
                    isLightMode
                      ? "border-black/10 bg-white/85"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div
                    className={`text-xs font-medium ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    Requests
                  </div>
                  <div className="mt-1 text-3xl font-semibold">
                    {requests.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div
          className={`mt-4 grid grid-cols-3 rounded-2xl border p-1 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`relative flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
              activeTab === "notifications"
                ? isLightMode
                  ? "bg-[#c89d13]/12 text-[#725700]"
                  : "bg-[#FFD54A]/10 text-[#FFE27A]"
                : isLightMode
                  ? "text-zinc-500 hover:bg-zinc-50"
                  : "text-zinc-500 hover:bg-white/[0.04]"
            }`}
          >
            <Bell size={16} />
            Requests
            {requests.length > 0 && (
              <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {requests.length > 99 ? "99+" : requests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("friends")}
            className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
              activeTab === "friends"
                ? isLightMode
                  ? "bg-[#c89d13]/12 text-[#725700]"
                  : "bg-[#FFD54A]/10 text-[#FFE27A]"
                : isLightMode
                  ? "text-zinc-500 hover:bg-zinc-50"
                  : "text-zinc-500 hover:bg-white/[0.04]"
            }`}
          >
            <Users size={16} />
            Friends
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("offers")}
            className={`relative flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
              activeTab === "offers"
                ? isLightMode
                  ? "bg-[#c89d13]/12 text-[#725700]"
                  : "bg-[#FFD54A]/10 text-[#FFE27A]"
                : isLightMode
                  ? "text-zinc-500 hover:bg-zinc-50"
                  : "text-zinc-500 hover:bg-white/[0.04]"
            }`}
          >
            <Handshake size={16} />
            Offers BETA
            {pendingIncomingOffers > 0 && (
              <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pendingIncomingOffers > 99 ? "99+" : pendingIncomingOffers}
              </span>
            )}
          </button>
        </div>
        {activeTab === "notifications" && (
          <section
            className={`mt-4 rounded-[26px] border p-4 sm:p-5 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div className="mb-4 flex items-center gap-2">
              <UserPlus
                size={18}
                className={isLightMode ? "text-[#725700]" : "text-[#FFE27A]"}
              />
              <div>
                <h2 className="text-lg font-semibold">Friend Requests</h2>
                <p
                  className={`text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Accept or decline incoming requests.
                </p>
              </div>
            </div>
            {loading ? (
              <div
                className={`rounded-2xl border p-8 text-center text-sm ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 text-zinc-500"
                    : "border-white/[0.07] bg-white/[0.03] text-zinc-400"
                }`}
              >
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="space-y-3">
                {pendingSentRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:p-4 ${
                      isLightMode
                        ? "border-[#8a6a00]/20 bg-[#c89d13]/[0.06]"
                        : "border-[#FFD54A]/15 bg-[#FFD54A]/[0.05]"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <CardImage
                        src={getProfileAssets(request).avatar}
                        alt={request.username}
                        className={`h-11 w-11 shrink-0 rounded-xl border object-cover ${
                          isLightMode ? "border-black/10" : "border-white/10"
                        }`}
                      />
                      <div className="min-w-0 flex-1 text-sm">
                        <span
                          className={
                            isLightMode ? "text-zinc-600" : "text-zinc-300"
                          }
                        >
                          Friend request to{" "}
                        </span>
                        <button
                          type="button"
                          onClick={() => openFriendProfile(request.username)}
                          className="font-semibold hover:underline"
                        >
                          {request.username}
                        </button>{" "}
                        <span
                          className={
                            isLightMode ? "text-zinc-600" : "text-zinc-300"
                          }
                        >
                          still pending.
                        </span>
                      </div>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isLightMode
                            ? "bg-[#c89d13]/10 text-[#725700]"
                            : "bg-[#FFD54A]/10 text-[#FFE27A]"
                        }`}
                      >
                        <UserPlus size={15} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmCancelRequest === request.id) {
                          void cancelSentRequest(request.id);
                          return;
                        }
                        setConfirmCancelRequest(request.id);
                        setTimeout(() => {
                          setConfirmCancelRequest((current) =>
                            current === request.id ? null : current,
                          );
                        }, 3000);
                      }}
                      className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-colors sm:w-auto ${
                        confirmCancelRequest === request.id
                          ? "border-red-500 bg-red-500 text-white"
                          : isLightMode
                            ? "border-red-700/15 bg-red-700/[0.04] text-red-700 hover:bg-red-700/[0.08]"
                            : "border-red-400/15 bg-red-400/[0.05] text-red-400 hover:bg-red-400/[0.09]"
                      }`}
                    >
                      {confirmCancelRequest === request.id
                        ? "Confirm Cancel"
                        : "Cancel Request"}
                    </button>
                  </div>
                ))}
                {pendingSentRequests.length === 0 && history.length === 0 && (
                  <div
                    className={`rounded-2xl border px-5 py-4 ${
                      isLightMode
                        ? "border-black/10 bg-zinc-50"
                        : "border-white/[0.07] bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell
                        className={
                          isLightMode ? "text-zinc-400" : "text-zinc-500"
                        }
                        size={20}
                      />
                      <div>
                        <div className="font-semibold">No request activity</div>
                        <p
                          className={`mt-0.5 text-sm ${
                            isLightMode ? "text-zinc-500" : "text-zinc-400"
                          }`}
                        >
                          New friend requests will appear here.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {history.length > 0 && (
                  <div>
                    <h3
                      className={`mb-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        isLightMode ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      History
                    </h3>
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 ${
                            isLightMode
                              ? "border-black/10 bg-zinc-50"
                              : "border-white/[0.07] bg-white/[0.03]"
                          }`}
                        >
                          <CardImage
                            src={getProfileAssets(item).avatar}
                            alt={item.username}
                            className={`h-11 w-11 shrink-0 rounded-xl border object-cover ${
                              isLightMode
                                ? "border-black/10"
                                : "border-white/10"
                            }`}
                          />
                          <div className="min-w-0 flex-1 text-sm">
                            {item.kind === "accepted_by_you" ? (
                              <>
                                <span
                                  className={
                                    isLightMode
                                      ? "text-zinc-600"
                                      : "text-zinc-300"
                                  }
                                >
                                  You accepted{" "}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openFriendProfile(item.username)
                                  }
                                  className="font-semibold hover:underline"
                                >
                                  {item.username}
                                </button>
                                <span
                                  className={
                                    isLightMode
                                      ? "text-zinc-600"
                                      : "text-zinc-300"
                                  }
                                >
                                  &apos;s friend request.
                                </span>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openFriendProfile(item.username)
                                  }
                                  className="font-semibold hover:underline"
                                >
                                  {item.username}
                                </button>{" "}
                                <span
                                  className={
                                    isLightMode
                                      ? "text-zinc-600"
                                      : "text-zinc-300"
                                  }
                                >
                                  {item.kind === "accepted" &&
                                    "accepted your friend request."}
                                  {item.kind === "denied" &&
                                    "denied your friend request."}
                                  {item.kind === "messages" &&
                                    `sent you ${item.messageCount ?? 0} ${
                                      item.messageCount === 1
                                        ? "message"
                                        : "messages"
                                    }.`}
                                </span>
                              </>
                            )}
                          </div>
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              item.kind === "accepted" ||
                              item.kind === "accepted_by_you"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : item.kind === "denied"
                                  ? "bg-red-500/10 text-red-500"
                                  : isLightMode
                                    ? "bg-[#c89d13]/10 text-[#725700]"
                                    : "bg-[#FFD54A]/10 text-[#FFE27A]"
                            }`}
                          >
                            {(item.kind === "accepted" ||
                              item.kind === "accepted_by_you") && (
                              <Check size={15} />
                            )}
                            {item.kind === "denied" && <X size={15} />}
                            {item.kind === "messages" && (
                              <MessageSquare size={15} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`rounded-2xl border p-4 sm:p-5 ${
                      isLightMode
                        ? "border-black/10 bg-zinc-50"
                        : "border-white/[0.07] bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <CardImage
                          src={getProfileAssets(request).avatar}
                          alt={request.username}
                          className={`h-14 w-14 rounded-2xl border object-cover ${
                            isLightMode ? "border-black/10" : "border-white/10"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-semibold">
                            {request.username}
                          </div>
                          <div
                            className={`mt-1 text-sm ${
                              isLightMode ? "text-zinc-500" : "text-zinc-400"
                            }`}
                          >
                            Wants to add you as a friend.
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                          type="button"
                          onClick={() => acceptRequest(request)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
                        >
                          <Check size={14} />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => denyRequest(request)}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                            isLightMode
                              ? "border-red-700/15 bg-red-700/[0.04] text-red-700 hover:bg-red-700/[0.08]"
                              : "border-red-400/15 bg-red-400/[0.05] text-red-400 hover:bg-red-400/[0.09]"
                          }`}
                        >
                          <X size={14} />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {activeTab === "offers" && (
          <section
            className={`mt-4 rounded-[26px] border p-4 sm:p-5 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div className="mb-4 flex items-center">
              <div>
                <h2 className="text-lg font-semibold">Card Offers</h2>
                <p
                  className={`text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Incoming and sent offers stay here. Only unanswered offers
                  that expire count as missed responses.
                </p>
              </div>
            </div>
            {offerError && (
              <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                {offerError}
              </p>
            )}
            {loading ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                Loading offers...
              </div>
            ) : offers.length === 0 ? (
              <div
                className={`rounded-2xl border p-8 text-center ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/[0.07] bg-white/[0.03]"
                }`}
              >
                <Handshake size={26} className="mx-auto text-zinc-400" />
                <div className="mt-3 font-semibold">No offers yet</div>
                <p className="mt-1 text-sm text-zinc-500">
                  Offers you send or receive will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => {
                  const incoming = offer.recipient_id === currentUserId;
                  const counterpartId = incoming
                    ? offer.sender_id
                    : offer.recipient_id;
                  const profile = offerProfiles[counterpartId];
                  const username = profile?.username || "Unknown User";
                  const status = getOfferStatus(offer);
                  const isPending = status === "pending";
                  const targetCard: OfferCardRef = {
                    set_id: offer.target_set_id,
                    card_key: offer.target_card_key,
                  };
                  const statusClasses =
                    status === "accepted"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : status === "declined"
                        ? "bg-red-500/10 text-red-500"
                        : status === "cancelled"
                          ? isLightMode
                            ? "bg-zinc-200 text-zinc-600"
                            : "bg-white/[0.08] text-zinc-300"
                          : status === "expired"
                            ? "bg-zinc-500/10 text-zinc-500"
                            : isLightMode
                              ? "bg-[#c89d13]/10 text-[#725700]"
                              : "bg-[#FFD54A]/10 text-[#FFE27A]";
                  return (
                    <article
                      key={offer.id}
                      className={`rounded-2xl border p-4 ${
                        isLightMode
                          ? "border-black/10 bg-zinc-50"
                          : "border-white/[0.07] bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <CardImage
                            src={getProfileAssets(profile || {}).avatar}
                            alt={username}
                            className={`h-11 w-11 shrink-0 rounded-xl border object-cover ${
                              isLightMode
                                ? "border-black/10"
                                : "border-white/10"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-sm">
                              {incoming ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openFriendProfile(username)}
                                    className="font-semibold hover:underline"
                                  >
                                    {username}
                                  </button>{" "}
                                  <span className="text-zinc-500">
                                    offered for your card.
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-zinc-500">
                                    You offered for
                                  </span>{" "}
                                  <button
                                    type="button"
                                    onClick={() => openFriendProfile(username)}
                                    className="font-semibold hover:underline"
                                  >
                                    {username}&apos;s card.
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                              <Clock3 size={12} />
                              {isPending
                                ? `Expires ${new Date(offer.expires_at).toLocaleDateString()}`
                                : `Sent ${new Date(offer.created_at).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusClasses}`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1">
                        <div className="flex shrink-0 gap-2">
                          {offer.offered_cards.map((card, index) => (
                            <div
                              key={`${card.set_id}-${card.card_key}-${index}`}
                            >
                              <div className="relative aspect-[5/7] w-24 overflow-hidden rounded-[6px] sm:w-28">
                                <OfferCardThumbnail card={card} />
                              </div>
                              <div className="mt-1 max-w-28 truncate text-center text-[10px] font-semibold">
                                {card.card_key}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                            isLightMode
                              ? "bg-white text-zinc-600"
                              : "bg-black/25 text-zinc-300"
                          }`}
                        >
                          for
                        </div>
                        <div className="shrink-0">
                          <div className="relative aspect-[5/7] w-24 overflow-hidden rounded-[6px] sm:w-28">
                            <OfferCardThumbnail card={targetCard} />
                          </div>
                          <div className="mt-1 max-w-28 truncate text-center text-[10px] font-bold">
                            {offer.target_card_key}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                          isLightMode ? "bg-white" : "bg-black/20"
                        }`}
                      >
                        <span className="font-semibold">Contact:</span>{" "}
                        <span className="break-all text-[#5865F2]">
                          {offer.contact}
                        </span>
                      </div>
                      {status === "cancelled" && (
                        <div
                          className={`mt-3 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                            isLightMode
                              ? "border-zinc-300 bg-zinc-100 text-zinc-700"
                              : "border-white/[0.08] bg-white/[0.04] text-zinc-200"
                          }`}
                        >
                          This offer was cancelled.
                        </div>
                      )}
                      {offer.response_note && (
                        <div
                          className={`mt-3 rounded-xl border px-3 py-2.5 text-sm ${
                            isLightMode
                              ? "border-black/10 bg-white"
                              : "border-white/[0.08] bg-black/20"
                          }`}
                        >
                          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Response message
                          </div>
                          <p className="mt-1 whitespace-pre-wrap break-words">
                            {offer.response_note}
                          </p>
                        </div>
                      )}
                      {incoming && isPending && (
                        <div className="mt-4">
                          <label className="block">
                            <span className="mb-1.5 block text-sm font-semibold">
                              Leave a message for the user
                            </span>
                            <textarea
                              value={offerNotes[offer.id] || ""}
                              onChange={(event) =>
                                setOfferNotes((current) => ({
                                  ...current,
                                  [offer.id]: event.target.value.slice(0, 500),
                                }))
                              }
                              maxLength={500}
                              rows={2}
                              placeholder="Optional response message"
                              className={`w-full resize-none rounded-xl border px-3 py-2.5 text-base outline-none focus:border-[#d5ad24] ${
                                isLightMode
                                  ? "border-black/10 bg-white"
                                  : "border-white/10 bg-black/20"
                              }`}
                            />
                          </label>
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                void respondToOffer(offer, "declined")
                              }
                              disabled={respondingOfferId === offer.id}
                              className="rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-500 disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void respondToOffer(offer, "accepted")
                              }
                              disabled={respondingOfferId === offer.id}
                              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {respondingOfferId === offer.id
                                ? "Saving..."
                                : "Accept"}
                            </button>
                          </div>
                        </div>
                      )}
                      {!incoming && isPending && (
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void cancelOffer(offer)}
                            disabled={cancellingOfferId === offer.id}
                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                              isLightMode
                                ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                                : "bg-white/[0.08] text-zinc-200 hover:bg-white/[0.12]"
                            }`}
                          >
                            {cancellingOfferId === offer.id
                              ? "Cancelling..."
                              : "Cancel offer"}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {activeTab === "friends" && (
          <section
            className={`mt-4 rounded-[26px] border p-4 sm:p-5 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Friends</h2>
                <p
                  className={`mt-1 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Favorite friends, rename them for yourself, or open their
                  profile.
                </p>
              </div>
              <div
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 sm:min-w-[300px] ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/[0.07] bg-white/[0.03]"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">Friend Requests</div>
                  <div
                    className={`mt-0.5 text-xs ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    {allowFriendRequests
                      ? "People can send requests"
                      : "Requests are disabled"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleFriendRequests}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    allowFriendRequests
                      ? "bg-[#FFD54A]"
                      : isLightMode
                        ? "bg-zinc-300"
                        : "bg-zinc-700"
                  }`}
                  aria-label="Toggle friend requests"
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      allowFriendRequests ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            {!loading && friends.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    className={`relative flex-1 rounded-2xl border ${
                      isLightMode
                        ? "border-black/10 bg-zinc-50"
                        : "border-white/[0.07] bg-white/[0.03]"
                    }`}
                  >
                    <Search
                      size={17}
                      className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                        isLightMode ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    />
                    <input
                      type="search"
                      value={friendSearch}
                      onChange={(event) => {
                        setFriendSearch(event.target.value);
                        setFriendPage(1);
                      }}
                      placeholder="Search by username or nickname"
                      aria-label="Search friends by username or nickname"
                      className={`min-h-[48px] w-full rounded-2xl bg-transparent py-3 pl-11 pr-11 text-base outline-none placeholder:text-zinc-500 sm:text-sm ${
                        isLightMode ? "text-zinc-900" : "text-white"
                      }`}
                    />
                    {friendSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setFriendSearch("");
                          setFriendPage(1);
                        }}
                        className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full ${
                          isLightMode
                            ? "text-zinc-500 hover:bg-black/[0.05]"
                            : "text-zinc-400 hover:bg-white/[0.06]"
                        }`}
                        aria-label="Clear friend search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <div
                    className={`shrink-0 px-1 text-xs ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    {normalizedFriendSearch
                      ? `${filteredFriends.length} of ${friends.length} friends`
                      : `${friends.length} ${friends.length === 1 ? "friend" : "friends"}`}
                  </div>
                </div>
              </div>
            )}
            {loading ? (
              <div
                className={`rounded-2xl border p-8 text-center text-sm ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 text-zinc-500"
                    : "border-white/[0.07] bg-white/[0.03] text-zinc-400"
                }`}
              >
                Loading friends...
              </div>
            ) : friends.length === 0 ? (
              <div
                className={`rounded-2xl border p-10 text-center ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/[0.07] bg-white/[0.03]"
                }`}
              >
                <Users
                  className={`mx-auto mb-3 ${
                    isLightMode ? "text-zinc-400" : "text-zinc-500"
                  }`}
                  size={24}
                />
                <div className="font-semibold">No friends yet</div>
                <p
                  className={`mt-1 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Accepted friends will appear here.
                </p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div
                className={`rounded-2xl border p-10 text-center ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/[0.07] bg-white/[0.03]"
                }`}
              >
                <Search
                  className={`mx-auto mb-3 ${
                    isLightMode ? "text-zinc-400" : "text-zinc-500"
                  }`}
                  size={24}
                />
                <div className="font-semibold">No matching friends</div>
                <p
                  className={`mt-1 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Try a different username or nickname.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleFriends.map((friend) => (
                    <article
                      key={friend.id}
                      className={`relative rounded-2xl border p-4 transition-colors sm:p-5 ${
                        friend.favorite
                          ? isLightMode
                            ? "border-[#8a6a00]/25 bg-[#c89d13]/[0.06]"
                            : "border-[#FFD54A]/20 bg-[#FFD54A]/[0.05]"
                          : isLightMode
                            ? "border-black/10 bg-zinc-50"
                            : "border-white/[0.07] bg-white/[0.03]"
                      }`}
                    >
                      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
                        {friend.favorite && (
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full border ${isLightMode ? "border-[#8a6a00]/20 bg-[#fff8dc] text-[#8a6a00]" : "border-[#FFD54A]/20 bg-[#2a271b] text-[#FFE27A]"}`}
                            title="Favorite friend"
                          >
                            <Star size={15} fill="currentColor" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setMessageFriend(friend)}
                          aria-label={`Message ${friend.username}`}
                          title={`Message ${friend.username}`}
                          className={`relative flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors ${isLightMode ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-100" : "border-white/10 bg-[#222425] text-zinc-200 hover:bg-[#2b2d2e]"}`}
                        >
                          <MessageSquare size={17} />
                          {(friend.unreadMessages ?? 0) > 0 && (
                            <span
                              className={`absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 bg-red-500 ${isLightMode ? "border-white" : "border-[#222425]"}`}
                            />
                          )}
                        </button>
                      </div>
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() => openFriendProfile(friend.username)}
                          className="relative shrink-0 rounded-2xl text-left"
                          aria-label={`Open ${friend.username}'s profile`}
                        >
                          <CardImage
                            src={getProfileAssets(friend.profile).avatar}
                            alt={friend.nickname || friend.username}
                            className={`h-16 w-16 rounded-2xl border object-cover ${
                              isLightMode
                                ? "border-black/10"
                                : "border-white/10"
                            }`}
                          />
                        </button>
                        <div className="min-w-0 flex-1">
                          {editingNickname === friend.id ? (
                            <div className="space-y-2">
                              <input
                                value={nicknameInput}
                                onChange={(event) =>
                                  setNicknameInput(event.target.value)
                                }
                                autoFocus
                                maxLength={24}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    void saveNickname(friend.id);
                                  }
                                  if (event.key === "Escape") {
                                    setEditingNickname(null);
                                    setNicknameInput("");
                                  }
                                }}
                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                                  isLightMode
                                    ? "border-black/10 bg-white text-zinc-900"
                                    : "border-white/10 bg-[#0d0f10] text-white"
                                }`}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void saveNickname(friend.id)}
                                  className="flex-1 rounded-lg bg-[#FFD54A] px-2 py-1.5 text-xs font-semibold text-black"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNickname(null);
                                    setNicknameInput("");
                                  }}
                                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                                    isLightMode
                                      ? "border-black/10 text-zinc-600"
                                      : "border-white/10 text-zinc-400"
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 pr-20">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openFriendProfile(friend.username)
                                  }
                                  className="truncate text-left font-semibold hover:underline"
                                >
                                  {friend.nickname || friend.username}
                                </button>
                                {getProfileAssets(friend.profile)
                                  .verification && (
                                  <CardImage
                                    src={
                                      getProfileAssets(friend.profile)
                                        .verification!.badge
                                    }
                                    alt={
                                      getProfileAssets(friend.profile)
                                        .verification!.label
                                    }
                                    className="h-4 w-4 shrink-0"
                                  />
                                )}
                              </div>
                              {friend.nickname && (
                                <div
                                  className={`mt-1 truncate text-xs ${
                                    isLightMode
                                      ? "text-zinc-500"
                                      : "text-zinc-500"
                                  }`}
                                >
                                  {friend.username}
                                </div>
                              )}
                              <div className="mt-3 flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNickname(friend.id);
                                    setNicknameInput(friend.nickname || "");
                                  }}
                                  className={
                                    isLightMode
                                      ? "text-zinc-500 hover:text-[#725700]"
                                      : "text-zinc-500 hover:text-[#FFE27A]"
                                  }
                                  title="Edit nickname"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void toggleFavorite(friend.id)}
                                  className={
                                    friend.favorite
                                      ? isLightMode
                                        ? "text-[#8a6a00]"
                                        : "text-[#FFE27A]"
                                      : "text-zinc-500 hover:text-[#FFE27A]"
                                  }
                                  title="Favorite friend"
                                >
                                  <Star
                                    size={15}
                                    fill={
                                      friend.favorite ? "currentColor" : "none"
                                    }
                                  />
                                </button>
                                {(friend.unreadMessages ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-red-500">
                                    <MessageSquare size={11} />
                                    {friend.unreadMessages} unread
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {editingNickname !== friend.id && (
                        <div
                          className={`mt-5 grid grid-cols-[1fr_auto] gap-2 border-t pt-4 ${
                            isLightMode
                              ? "border-black/[0.08]"
                              : "border-white/[0.07]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => openFriendProfile(friend.username)}
                            className="rounded-xl bg-[#FFD54A] px-3 py-2.5 text-sm font-semibold text-black hover:bg-[#FFE27A]"
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirmUnfriend === friend.id) {
                                void unfriend(friend.id);
                              } else {
                                setConfirmUnfriend(friend.id);
                                setTimeout(() => {
                                  setConfirmUnfriend((current) =>
                                    current === friend.id ? null : current,
                                  );
                                }, 3000);
                              }
                            }}
                            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                              confirmUnfriend === friend.id
                                ? "border-red-500 bg-red-500 text-white"
                                : isLightMode
                                  ? "border-black/10 text-zinc-500 hover:border-red-500/30 hover:text-red-600"
                                  : "border-white/10 text-zinc-500 hover:border-red-400/30 hover:text-red-400"
                            }`}
                          >
                            {confirmUnfriend === friend.id
                              ? "Confirm"
                              : "Unfriend"}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
                {totalFriendPages > 1 && (
                  <div
                    className={`mt-4 flex items-center justify-between gap-3 border-t pt-4 ${
                      isLightMode
                        ? "border-black/[0.08]"
                        : "border-white/[0.07]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setFriendPage(Math.max(1, currentFriendPage - 1))
                      }
                      disabled={currentFriendPage === 1}
                      className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        isLightMode
                          ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                          : "border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"
                      }`}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <div
                      className={`text-center text-sm ${
                        isLightMode ? "text-zinc-600" : "text-zinc-400"
                      }`}
                    >
                      Page {currentFriendPage} of {totalFriendPages}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFriendPage(
                          Math.min(totalFriendPages, currentFriendPage + 1),
                        )
                      }
                      disabled={currentFriendPage === totalFriendPages}
                      className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        isLightMode
                          ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                          : "border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"
                      }`}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
      {messageFriend && (
        <div
          className={`fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-24 backdrop-blur-md sm:items-center sm:pt-4 ${isLightMode ? "bg-white/40" : "bg-black/75"}`}
          onClick={() => void closeMessages()}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`relative h-[min(600px,78dvh)] w-[420px] max-w-[94vw] overflow-hidden rounded-[24px] border shadow-[0_20px_60px_rgba(0,0,0,.28)] sm:h-[480px] ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]"}`}
          >
            <div
              className={`flex h-16 items-center justify-between border-b px-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <CardImage
                  src={getProfileAssets(messageFriend.profile).avatar}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div
                    className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Messages
                  </div>
                  <div className="truncate font-semibold">
                    {messageFriend.nickname || messageFriend.username}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void closeMessages()}
                className={`rounded-lg px-3 py-1.5 text-xl ${isLightMode ? "text-zinc-500 hover:bg-zinc-100" : "text-zinc-400 hover:bg-white/[0.06]"}`}
                aria-label="Close messages"
              >
                ×
              </button>
            </div>
            <div className="h-[calc(100%-64px)] overflow-hidden">
              <Messages otherUserId={messageFriend.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

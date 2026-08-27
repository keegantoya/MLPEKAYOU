import { useEffect, useState } from "react";
import { Bell, Check, MessageSquare, Pencil, Star, UserPlus, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FriendsProfiles from "./friends-profiles";
import { getProfileAssets } from "../Everypony/profile-assets";
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
export default function Inbox() {
const [activeTab, setActiveTab] = useState<
    "notifications" | "friends"
  >("notifications");
const [loading, setLoading] = useState(true);
const [requests, setRequests] = useState<FriendRequest[]>([]);
const [friends, setFriends] = useState<Friend[]>([]);
const [allowFriendRequests, setAllowFriendRequests] = useState(true);
const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
const [confirmUnfriend, setConfirmUnfriend] = useState<string | null>(null);
const [editingNickname, setEditingNickname] = useState<string | null>(null);
const [nicknameInput, setNicknameInput] = useState("");
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
useEffect(() => {
  void loadInbox();
const channel = supabase
  .channel("inbox-updates")
.on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "messages",
  },
async (payload) => {
const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
const row = payload.new as any;
    if (
      row.sender !== session.user.id &&
      row.receiver !== session.user.id
    ) {
      return;
    }
    setFriends((current) =>
      current.map((friend) => {
        if (friend.id !== row.sender) return friend;
const unread =
          row.receiver === session.user.id && row.read_at == null
            ? (friend.unreadMessages ?? 0) + 1
            : Math.max((friend.unreadMessages ?? 1) - 1, 0);
        return {
          ...friend,
          unreadMessages: unread,
        };
      })
    );
  }
)
  .subscribe();
  return () => {
    supabase.removeChannel(channel);
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
async function loadInbox() {
    setLoading(true);
const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }
const userId = session.user.id;
const { data: myProfile } = await supabase
  .from("profiles")
  .select("allow_friend_requests")
  .eq("id", userId)
  .single();
setAllowFriendRequests(
  myProfile?.allow_friend_requests ?? true
);
const { data: requestRows } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", userId)
      .eq("status", "pending");
    if (requestRows && requestRows.length > 0) {
const senderIds = requestRows.map((r) => r.sender_id);
const { data: profiles } = await supabase
  .from("profiles")
  .select("id, username, avatar_url")
  .in("id", senderIds);
const merged = requestRows.map((request) => {
const profile = profiles?.find(
    (p) => p.id === request.sender_id
  );
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
const { data: friendRows } = await supabase
      .from("friends")
      .select("*")
      .eq("user_id", userId);
    if (friendRows && friendRows.length > 0) {
const ids = friendRows.map((f) => f.friend_id);
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
  favorites?.map((f) => f.friend_id) ?? []
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
  {}
);
const loadedFriends =
  profiles?.map((p) => ({
    id: p.id,
    username: p.username,
    nickname:
      nicknames?.find((n) => n.friend_id === p.id)?.nickname ?? "",
    unreadMessages: unreadCounts[p.id] ?? 0,
    favorite: favoriteIds.has(p.id),
    profile: p,
    tradingProfile:
      tradingProfiles?.find((t) => t.user_id === p.id) ?? null,
  })) || [];
loadedFriends.sort((a, b) => {
  if (a.favorite !== b.favorite) {
    return Number(b.favorite) - Number(a.favorite);
  }
  return (a.nickname || a.username).localeCompare(
    b.nickname || b.username
  );
});
setFriends(loadedFriends);
    } else {
      setFriends([]);
    }
    setLoading(false);
  }
async function acceptRequest(request: FriendRequest) {
  await supabase.rpc("accept_friend_request", {
    request_id: request.id,
  });
  setRequests((prev) =>
    prev.filter((r) => r.id !== request.id)
  );
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
    setRequests((prev) =>
      prev.filter((r) => r.id !== request.id)
    );
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
const friend = friends.find((f) => f.id === friendId);
  if (!friend) return;
if (friend.favorite) {
const { error } = await supabase
    .from("favorite_friends")
    .delete()
    .eq("user_id", session.user.id)
    .eq("friend_id", friendId);
  console.log(error);
} else {
const { error } = await supabase
    .from("favorite_friends")
    .insert({
      user_id: session.user.id,
      friend_id: friendId,
    });
  console.log(error);
}
setFriends((current) => {
const updated = current.map((f) =>
    f.id === friendId
      ? {
          ...f,
          favorite: !f.favorite,
        }
      : f
  );
  updated.sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return Number(b.favorite) - Number(a.favorite);
    }
    return (a.nickname || a.username).localeCompare(
      b.nickname || b.username
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
const { error } = await supabase
    .from("friend_nicknames")
    .upsert(
      {
        user_id: session.user.id,
        friend_id: friendId,
        nickname: nicknameInput.trim(),
      },
      {
        onConflict: "user_id,friend_id",
      }
    );
  if (error) {
    alert(error.message);
    return;
  }
  setFriends((prev) =>
    prev.map((friend) =>
      friend.id === friendId
        ? {
            ...friend,
            nickname: nicknameInput.trim(),
          }
        : friend
    )
  );
  setEditingNickname(null);
  setNicknameInput("");
}
return (
  <div className={`min-h-screen px-3 py-4 transition-colors duration-200 sm:px-6 sm:py-8 ${
    isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
  }`}>
    <div className="mx-auto max-w-6xl">
      {selectedFriend ? (
        <>
          <div className="h-2 sm:hidden" />
          <FriendsProfiles
            user={selectedFriend.profile}
            tradingProfile={selectedFriend.tradingProfile}
            onClose={() => {
              setSelectedFriend(null);
              void loadInbox();
            }}
          />
        </>
      ) : (
        <>
          <div className="h-2 sm:hidden" />
          <section className={`relative overflow-hidden rounded-[30px] border ${
            isLightMode
              ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]"
              : "border-white/[0.08] bg-[#151718]"
          }`}>
            <div
              className={`absolute inset-0 bg-cover bg-center ${
                isLightMode ? "opacity-[0.07]" : "opacity-[0.06]"
              }`}
              style={{ backgroundImage: "url('/website-assets/exploreequestria.webp')" }}
            />
            <div className={`absolute inset-0 ${
              isLightMode
                ? "bg-gradient-to-r from-white via-white/95 to-white/75"
                : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/75"
            }`} />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className={`text-sm font-semibold ${
                    isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                  }`}>
                    Friends & Messages
                  </div>
                  <h1 className={`mt-1 text-4xl font-semibold tracking-tight sm:text-5xl ${
                    isLightMode ? "text-zinc-950" : "text-white"
                  }`}>
                    Inbox
                  </h1>
                  <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}>
                    Manage friend requests, open profiles, and keep up with messages from your connections.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
                  <div className={`rounded-2xl border p-4 ${
                    isLightMode ? "border-black/10 bg-white/85" : "border-white/10 bg-black/20"
                  }`}>
                    <div className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      Friends
                    </div>
                    <div className="mt-1 text-3xl font-semibold">{friends.length}</div>
                  </div>
                  <div className={`rounded-2xl border p-4 ${
                    isLightMode ? "border-black/10 bg-white/85" : "border-white/10 bg-black/20"
                  }`}>
                    <div className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      Requests
                    </div>
                    <div className="mt-1 text-3xl font-semibold">{requests.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className={`mt-4 grid grid-cols-2 rounded-2xl border p-1 ${
            isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
          }`}>
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
          </div>
          {activeTab === "notifications" && (
            <section className={`mt-4 rounded-[26px] border p-4 sm:p-5 ${
              isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
            }`}>
              <div className="mb-4 flex items-center gap-2">
                <UserPlus size={18} className={isLightMode ? "text-[#725700]" : "text-[#FFE27A]"} />
                <div>
                  <h2 className="text-lg font-semibold">Friend Requests</h2>
                  <p className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Accept or decline incoming requests.
                  </p>
                </div>
              </div>
              {loading ? (
                <div className={`rounded-2xl border p-8 text-center text-sm ${
                  isLightMode ? "border-black/10 bg-zinc-50 text-zinc-500" : "border-white/[0.07] bg-white/[0.03] text-zinc-400"
                }`}>
                  Loading requests...
                </div>
              ) : requests.length === 0 ? (
                <div className={`rounded-2xl border p-10 text-center ${
                  isLightMode ? "border-black/10 bg-zinc-50" : "border-white/[0.07] bg-white/[0.03]"
                }`}>
                  <Bell className={`mx-auto mb-3 ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`} size={24} />
                  <div className="font-semibold">No pending requests</div>
                  <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    New friend requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className={`rounded-2xl border p-4 sm:p-5 ${
                        isLightMode ? "border-black/10 bg-zinc-50" : "border-white/[0.07] bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <img
                            src={getProfileAssets(request).avatar}
                            alt={request.username}
                            className={`h-14 w-14 rounded-2xl border object-cover ${
                              isLightMode ? "border-black/10" : "border-white/10"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{request.username}</div>
                            <div className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
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
          {activeTab === "friends" && (
            <section className={`mt-4 rounded-[26px] border p-4 sm:p-5 ${
              isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"
            }`}>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Friends</h2>
                  <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Favorite friends, rename them for yourself, or open their profile.
                  </p>
                </div>
                <div className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 sm:min-w-[300px] ${
                  isLightMode ? "border-black/10 bg-zinc-50" : "border-white/[0.07] bg-white/[0.03]"
                }`}>
                  <div>
                    <div className="text-sm font-semibold">Friend Requests</div>
                    <div className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      {allowFriendRequests ? "People can send requests" : "Requests are disabled"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleFriendRequests}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      allowFriendRequests ? "bg-[#FFD54A]" : isLightMode ? "bg-zinc-300" : "bg-zinc-700"
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
              {loading ? (
                <div className={`rounded-2xl border p-8 text-center text-sm ${
                  isLightMode ? "border-black/10 bg-zinc-50 text-zinc-500" : "border-white/[0.07] bg-white/[0.03] text-zinc-400"
                }`}>
                  Loading friends...
                </div>
              ) : friends.length === 0 ? (
                <div className={`rounded-2xl border p-10 text-center ${
                  isLightMode ? "border-black/10 bg-zinc-50" : "border-white/[0.07] bg-white/[0.03]"
                }`}>
                  <Users className={`mx-auto mb-3 ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`} size={24} />
                  <div className="font-semibold">No friends yet</div>
                  <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Accepted friends will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {friends.map((friend) => (
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
                      {friend.favorite && (
                        <Star
                          size={15}
                          fill="currentColor"
                          className={`absolute right-4 top-4 ${isLightMode ? "text-[#8a6a00]" : "text-[#FFE27A]"}`}
                        />
                      )}
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={getProfileAssets(friend.profile).avatar}
                            alt={friend.nickname || friend.username}
                            className={`h-16 w-16 rounded-2xl border object-cover ${
                              isLightMode ? "border-black/10" : "border-white/10"
                            }`}
                          />
                          {(friend.unreadMessages ?? 0) > 0 && (
                            <div className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                              {(friend.unreadMessages ?? 0) > 99 ? "99+" : friend.unreadMessages}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {editingNickname === friend.id ? (
                            <div className="space-y-2">
                              <input
                                value={nicknameInput}
                                onChange={(e) => setNicknameInput(e.target.value)}
                                autoFocus
                                maxLength={24}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveNickname(friend.id);
                                  if (e.key === "Escape") {
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
                                  onClick={() => saveNickname(friend.id)}
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
                                    isLightMode ? "border-black/10 text-zinc-600" : "border-white/10 text-zinc-400"
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 pr-6">
                                <div className="truncate font-semibold">{friend.nickname || friend.username}</div>
                                {getProfileAssets(friend.profile).verification && (
                                  <img
                                    src={getProfileAssets(friend.profile).verification!.badge}
                                    alt={getProfileAssets(friend.profile).verification!.label}
                                    className="h-4 w-4 shrink-0"
                                  />
                                )}
                              </div>
                              {friend.nickname && (
                                <div className={`mt-1 truncate text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
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
                                  className={isLightMode ? "text-zinc-500 hover:text-[#725700]" : "text-zinc-500 hover:text-[#FFE27A]"}
                                  title="Edit nickname"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleFavorite(friend.id)}
                                  className={friend.favorite ? isLightMode ? "text-[#8a6a00]" : "text-[#FFE27A]" : "text-zinc-500 hover:text-[#FFE27A]"}
                                  title="Favorite friend"
                                >
                                  <Star size={15} fill={friend.favorite ? "currentColor" : "none"} />
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
                        <div className={`mt-5 grid grid-cols-[1fr_auto] gap-2 border-t pt-4 ${
                          isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"
                        }`}>
                          <button
                            type="button"
                            onClick={async () => {
                              const { data: tradingProfile } = await supabase
                                .from("trading_profiles")
                                .select("*")
                                .eq("user_id", friend.id)
                                .single();
                              setSelectedFriend({
                                ...friend,
                                tradingProfile: tradingProfile ?? null,
                              });
                            }}
                            className="rounded-xl bg-[#FFD54A] px-3 py-2.5 text-sm font-semibold text-black hover:bg-[#FFE27A]"
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirmUnfriend === friend.id) {
                                unfriend(friend.id);
                              } else {
                                setConfirmUnfriend(friend.id);
                                setTimeout(
                                  () =>
                                    setConfirmUnfriend((current) =>
                                      current === friend.id ? null : current
                                    ),
                                  3000
                                );
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
                            {confirmUnfriend === friend.id ? "Confirm" : "Unfriend"}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  </div>
);
}
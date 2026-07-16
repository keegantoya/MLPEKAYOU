import { useEffect, useState } from "react";
import { Users, Bell, Pencil, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FriendsProfiles from "./friends-profiles";

import avatar001 from "@/assets/avatars/avatar001.webp";
import avatar002 from "@/assets/avatars/avatar002.webp";
import avatar003 from "@/assets/avatars/avatar003.webp";
import avatar004 from "@/assets/avatars/avatar004.webp";
import avatar005 from "@/assets/avatars/avatar005.webp";
import avatar006 from "@/assets/avatars/avatar006.webp";
import avatar007 from "@/assets/avatars/avatar007.webp";
import avatar008 from "@/assets/avatars/avatar008.webp";
import avatar009 from "@/assets/avatars/avatar009.webp";
import avatar010 from "@/assets/avatars/avatar010.webp";
import avatar011 from "@/assets/avatars/avatar011.webp";
import avatar012 from "@/assets/avatars/avatar012.webp";
import avatar013 from "@/assets/avatars/avatar013.webp";
import avatar014 from "@/assets/avatars/avatar014.webp";
import avatar015 from "@/assets/avatars/avatar015.webp";
import avatar016 from "@/assets/avatars/avatar016.webp";
import avatar017 from "@/assets/avatars/avatar017.webp";
import avatar018 from "@/assets/avatars/avatar018.webp";
import avatar019 from "@/assets/avatars/avatar019.webp";
import avatar020 from "@/assets/avatars/avatar020.webp";
import avatar021 from "@/assets/avatars/avatar021.webp";
import avatar022 from "@/assets/avatars/avatar022.webp";
import avatar023 from "@/assets/avatars/avatar023.webp";
import avatar024 from "@/assets/avatars/avatar024.webp";
import avatar025 from "@/assets/avatars/avatar025.webp";
import avatar026 from "@/assets/avatars/avatar026.webp";
import avatar027 from "@/assets/avatars/avatar027.webp";
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import KeeganAvatar2 from "@/assets/avatars/keeganpfpnmn.webp";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";

const avatarMap: Record<string, string> = {
  avatar001,
  avatar002,
  avatar003,
  avatar004,
  avatar005,
  avatar006,
  avatar007,
  avatar008,
  avatar009,
  avatar010,
  avatar011,
  avatar012,
  avatar013,
  avatar014,
  avatar015,
  avatar016,
  avatar017,
  avatar018,
  avatar019,
  avatar020,
  avatar021,
  avatar022,
  avatar023,
  avatar024,
  avatar025,
  avatar026,
  avatar027,
  heimantouavatar: heimantouAvatar,
  keeganpfpnmn: KeeganAvatar2,
  "keeganpfpnmn.webp": KeeganAvatar2,
  KeeganAvatar,
  keeganpfp: KeeganAvatar,
  maipfp,
  "maipfp.webp": maipfp,
  TerriAvatar,
  terrypfp: TerriAvatar,
};

const VERIFIED_USERS: Record<
  string,
  {
    badge: string;
    label: string;
  }
> = {
  "17e57e39-bc0c-44e7-b373-ac34c6690185": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "94a1c998-d040-4dd2-b2fb-5f606287139d": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "408a516c-ee80-4ff8-a869-493e1fd5d961": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "6247b70d-3f55-493c-8eee-3badedf581db": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  "2e62bcda-f311-42a1-bf32-cfe74a43d3ef": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  "325585dd-c617-4dd2-8314-d608273cd5f6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
  "22f7a392-b5b5-4aec-a3b3-6546071593fd": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
};


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

    // Pending Requests
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

    // Friends
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
  <div className="min-h-screen bg-[#171717] text-white px-4 py-8">
    <div className="max-w-5xl mx-auto">

      {selectedFriend ? (

        <>
          <button
            onClick={() => setSelectedFriend(null)}
            className="mb-6 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300 transition"
          >
            ← Back to Friends
          </button>

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

          <h1
            className="text-3xl font-bold text-center mb-8"
            style={{ fontFamily: "Oxanium, sans-serif" }}
          >
            Inbox BETA
          </h1>

          <div className="flex bg-[#222222] rounded-xl overflow-hidden border border-[#333] mb-8">

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 transition ${
                activeTab === "notifications"
                  ? "bg-yellow-500 text-black font-semibold"
                  : "hover:bg-[#2d2d2d]"
              }`}
            >
              <Bell size={18} />
              Notifications
            </button>

            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 transition ${
                activeTab === "friends"
                  ? "bg-yellow-500 text-black font-semibold"
                  : "hover:bg-[#2d2d2d]"
              }`}
            >
              <Users size={18} />
              Friends
            </button>

          </div>

          {activeTab === "notifications" && (

            <div className="space-y-4">

              {loading ? (

                <div className="bg-[#222222] border border-[#333] rounded-xl p-5 text-center text-gray-400">
                  Loading...
                </div>

              ) : requests.length === 0 ? (

                <div className="bg-[#222222] border border-[#333] rounded-xl p-5 text-center text-gray-400">
                  No pending friend requests.
                </div>

              ) : (

                requests.map((request) => (

<div
  key={request.id}
  className="bg-[#222222] border border-[#333] rounded-xl p-5 flex items-center justify-between gap-6"
>

  <div className="flex items-center gap-4 min-w-0">

    <img
      src={
        avatarMap[String(request.avatar_url || "").trim()] ||
        avatar001
      }
      alt={request.username}
      className="h-14 w-14 rounded-full border-2 border-yellow-400 object-cover flex-shrink-0"
    />

    <p className="min-w-0">
      <span className="font-semibold text-yellow-400">
        {request.username}
      </span>{" "}
      sent you a friend request.
    </p>

  </div>

  <div className="flex gap-3 flex-shrink-0">

    <button
      onClick={() => acceptRequest(request)}
      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
    >
      Accept
    </button>

    <button
      onClick={() => denyRequest(request)}
      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
    >
      Deny
    </button>

  </div>

</div>

                ))

              )}

            </div>

          )}

          {activeTab === "friends" && (

            <div className="space-y-4">

              <div className="bg-[#222222] border border-[#333] rounded-xl p-5 flex justify-between items-center">

                <div>

                  <p className="font-semibold">
                    Friend Requests
                  </p>

                  <p className="text-sm text-gray-400">
                    {allowFriendRequests
                      ? "Receiving friend requests"
                      : "Friend requests disabled"}
                  </p>

                </div>

                <button
                  onClick={toggleFriendRequests}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    allowFriendRequests
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {allowFriendRequests ? "ON" : "OFF"}
                </button>

              </div>

              {loading ? (

                <div className="bg-[#222222] border border-[#333] rounded-xl p-5 text-center text-gray-400">
                  Loading...
                </div>

              ) : friends.length === 0 ? (

                <div className="bg-[#222222] border border-[#333] rounded-xl p-5 text-center text-gray-400">
                  You don't have any friends yet.
                </div>

              ) : (

                friends.map((friend) => (

                  <div
                    key={friend.id}
                    className={`rounded-xl p-5 flex items-center justify-between border ${
  friend.favorite
    ? "bg-[#262112] border-yellow-400"
    : "bg-[#222222] border-[#333]"
}`}
                  >

                    <div className="flex items-center gap-4">

<div className="relative">
  <img
    src={
      avatarMap[
        String(friend.profile?.avatar_url || "").trim()
      ] || avatar001
    }
    alt={friend.nickname || friend.username}
    className="h-14 w-14 rounded-full border-2 border-yellow-400 object-cover"
  />

  {friend.unreadMessages! > 0 && (
    <div className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
      {friend.unreadMessages! > 99 ? "99+" : friend.unreadMessages}
    </div>
  )}
</div>

<div className="flex min-w-0 flex-1 items-center gap-2">
  {editingNickname === friend.id ? (
    <>
      <input
        value={nicknameInput}
        onChange={(e) => setNicknameInput(e.target.value)}
        autoFocus
        maxLength={24}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            saveNickname(friend.id);
          }

          if (e.key === "Escape") {
            setEditingNickname(null);
            setNicknameInput("");
          }
        }}
        className="min-w-0 flex-1 rounded bg-[#333] px-2 py-1 text-sm sm:text-base text-white"
      />

      <button
        onClick={() => saveNickname(friend.id)}
        className="flex-shrink-0 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700 sm:px-3 sm:text-sm"
      >
        Save
      </button>
    </>
  ) : (
    <>
      <div className="truncate text-lg sm:text-xl font-semibold">
        {friend.nickname || friend.username}
      </div>

      <button
        onClick={() => {
          setEditingNickname(friend.id);
          setNicknameInput(friend.nickname || "");
        }}
        className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition"
      >
        <Pencil size={16} />
      </button>
      <button
  onClick={() => toggleFavorite(friend.id)}
  className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition"
>
  <Star
    size={16}
    fill={friend.favorite ? "#facc15" : "none"}
  />
</button>
    </>
  )}
</div>
</div>

                    <div className="flex flex-col sm:flex-row gap-2">

<button
  onClick={async () => {
    const { data: tradingProfile } =
      await supabase
        .from("trading_profiles")
        .select("*")
        .eq("user_id", friend.id)
        .single();

    setSelectedFriend({
      ...friend,
      tradingProfile: tradingProfile ?? null,
    });
  }}
  className="rounded-lg bg-yellow-400 px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base font-semibold text-black hover:bg-yellow-300 whitespace-nowrap"
>
  View Profile
</button>

<button
  onClick={() => {
    if (confirmUnfriend === friend.id) {
      unfriend(friend.id);
    } else {
      setConfirmUnfriend(friend.id);

      setTimeout(() => {
        setConfirmUnfriend((current) =>
          current === friend.id ? null : current
        );
      }, 3000);
    }
  }}
  className={`rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
    confirmUnfriend === friend.id
      ? "bg-red-700 hover:bg-red-800 text-white"
      : "bg-red-600 hover:bg-red-700 text-white"
  }`}
>
  {confirmUnfriend === friend.id
    ? "Are you sure?"
    : "Unfriend"}
</button>

</div>

                  </div>

                ))

              )}

            </div>

          )}

        </>

      )}

      <div className="block sm:hidden pt-10 pb-6 text-center text-xs text-zinc-600">
        Keegan says hello.
      </div>
    </div>
  </div>
);
}
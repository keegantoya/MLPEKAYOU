import { useEffect, useState } from "react";
import { Bell, Check, ChevronLeft, MessageSquare, Pencil, Radio, ShieldCheck, Star, UserPlus, Users, X } from "lucide-react";
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
  <div className="min-h-screen bg-[#111111] text-white px-3 py-4 sm:px-6 sm:py-8" style={{ fontFamily: "Oxanium, sans-serif" }}>
    <div className="mx-auto max-w-6xl">
      {selectedFriend ? (
        <>
          <div className="mb-5 pt-3 sm:mb-6 sm:pt-0">
            <button
              onClick={() => setSelectedFriend(null)}
              className="group flex min-h-11 w-full items-center justify-start gap-3 border border-zinc-700 bg-[#181818] px-4 py-3 text-left font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 transition hover:border-yellow-400/50 hover:bg-yellow-400/5 hover:text-yellow-300 sm:w-auto sm:min-h-0 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0 sm:tracking-[0.22em]"
            >
              <span className="flex h-7 w-7 items-center justify-center border border-zinc-700 bg-[#111] text-zinc-500 transition group-hover:border-yellow-400/50 group-hover:text-yellow-300">
                <ChevronLeft size={15} />
              </span>
              <span>Back to Connections</span>
              <span className="ml-auto font-mono text-[7px] tracking-[0.2em] text-zinc-700 transition group-hover:text-yellow-400/60 sm:ml-1">
                ESC
              </span>
            </button>
          </div>
          <FriendsProfiles user={selectedFriend.profile} tradingProfile={selectedFriend.tradingProfile} onClose={() => { setSelectedFriend(null); void loadInbox(); }} />
        </>
      ) : (
        <>
          <header className="relative mb-6 overflow-hidden border border-zinc-700 bg-[#181818] shadow-[0_18px_60px_rgba(0,0,0,.35)]">
            <div className="absolute left-0 top-0 h-1 w-32 bg-yellow-400"/><div className="absolute right-0 top-0 h-px w-56 bg-yellow-400/30"/>
            <div className="relative grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-7">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.35em] text-yellow-400"><Radio size={12}/> SOCIAL NETWORK</div>
                <div className="flex items-end gap-3"><h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">Inbox</h1><span className="mb-1 border border-yellow-400/40 px-2 py-1 font-mono text-[8px] font-bold text-yellow-400">BETA</span></div>
              </div>
              <div className="grid grid-cols-2 gap-px border border-zinc-700 bg-zinc-700 self-end sm:w-[280px]">
                <div className="bg-[#141414] p-3"><div className="mb-1 text-[7px] font-bold tracking-[0.2em] text-zinc-600">STATUS</div><div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"/> ONLINE</div></div>
                <div className="bg-[#141414] p-3"><div className="mb-1 text-[7px] font-bold tracking-[0.2em] text-zinc-600">FRIENDS</div><div className="text-[10px] font-bold">{friends.length.toString().padStart(2,"0")}</div></div>
                <div className="bg-[#141414] p-3"><div className="mb-1 text-[7px] font-bold tracking-[0.2em] text-zinc-600">PENDING</div><div className={`text-[10px] font-bold ${requests.length ? "text-yellow-400" : "text-zinc-400"}`}>{requests.length.toString().padStart(2,"0")}</div></div>
                <div className="bg-[#141414] p-3"><div className="mb-1 text-[7px] font-bold tracking-[0.2em] text-zinc-600">REQUESTS</div><div className="text-[10px] font-bold">{allowFriendRequests ? "OPEN" : "LOCKED"}</div></div>
              </div>
            </div>
          </header>

          <div className="mb-6 grid grid-cols-2 border border-zinc-700 bg-zinc-700">
            <button onClick={() => setActiveTab("notifications")} className={`relative min-h-[56px] flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] ${activeTab === "notifications" ? "text-black" : "bg-[#181818] text-zinc-400 hover:text-white"}`}>{activeTab === "notifications" && <span className="absolute inset-0 bg-yellow-400"/>}<span className="relative flex items-center gap-2"><Bell size={15}/> Requests {requests.length>0 && <b className="flex h-5 min-w-5 items-center justify-center bg-red-500 px-1 text-[8px] text-white">{requests.length>99?"99+":requests.length}</b>}</span></button>
            <button onClick={() => setActiveTab("friends")} className={`relative min-h-[56px] flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] ${activeTab === "friends" ? "text-black" : "bg-[#181818] text-zinc-400 hover:text-white"}`}>{activeTab === "friends" && <span className="absolute inset-0 bg-yellow-400"/>}<span className="relative flex items-center gap-2"><Users size={15}/> Connections</span></button>
          </div>

          {activeTab === "notifications" && <section>
            <div className="mb-4 flex items-end justify-between border-b border-zinc-800 pb-3"><div><div className="mb-1 flex items-center gap-2 text-[8px] font-bold tracking-[0.3em] text-yellow-400"><UserPlus size={11}/> INBOUND CONNECTIONS</div><h2 className="text-xl font-black uppercase">Request Queue</h2></div><span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">AUTH // REQUIRED</span></div>
            {loading ? <div className="border border-zinc-700 bg-[#181818] p-8 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">Establishing secure connection...</div> : requests.length === 0 ? <div className="border border-zinc-700 bg-[#181818] p-10 text-center"><ShieldCheck className="mx-auto mb-3 text-zinc-600" size={28}/><div className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">Queue Clear</div><p className="mt-2 font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-600">No pending connection requests detected.</p></div> : <div className="space-y-3">
              {requests.map(request => <div key={request.id} className="relative overflow-hidden border border-zinc-700 bg-[#181818] p-4 sm:p-5"><div className="absolute left-0 top-0 h-full w-1 bg-yellow-400"/><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><div className="relative shrink-0"><img src={getProfileAssets(request).avatar} alt={request.username} className="h-14 w-14 border border-yellow-400/70 object-cover"/><span className="absolute -bottom-1 -right-1 bg-yellow-400 px-1.5 py-0.5 font-mono text-[7px] font-black text-black">NEW</span></div><div className="min-w-0"><div className="truncate text-base font-black uppercase">{request.username}</div><div className="mt-1 font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-500">Connection request received // Awaiting authorization</div></div></div><div className="grid grid-cols-2 gap-2 sm:flex"><button onClick={() => acceptRequest(request)} className="flex items-center justify-center gap-2 border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-black"><Check size={12}/> Accept</button><button onClick={() => denyRequest(request)} className="flex items-center justify-center gap-2 border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white"><X size={12}/> Deny</button></div></div></div>)}
            </div>}
          </section>}

          {activeTab === "friends" && <section>
            <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="mb-1 flex items-center gap-2 text-[8px] font-bold tracking-[0.3em] text-yellow-400"><Users size={11}/> TRUSTED NETWORK</div><h2 className="text-xl font-black uppercase">Connection Grid</h2><p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-600">Select a contact to access their profile.</p></div><div className="flex items-center justify-between gap-4 border border-zinc-700 bg-[#181818] px-4 py-3 lg:min-w-[320px]"><div><div className="text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-400">Friend Requests</div><div className="mt-1 font-mono text-[7px] uppercase text-zinc-600">{allowFriendRequests?"Inbound requests permitted":"Inbound requests blocked"}</div></div><button onClick={toggleFriendRequests} className={`relative h-8 w-16 border ${allowFriendRequests?"border-yellow-400 bg-yellow-400":"border-zinc-600 bg-zinc-800"}`}><span className={`absolute top-1 h-6 w-6 bg-black transition ${allowFriendRequests?"right-1":"left-1"}`}/><span className={`absolute inset-0 flex items-center text-[7px] font-black ${allowFriendRequests?"justify-start pl-2 text-black":"justify-end pr-2 text-zinc-500"}`}>{allowFriendRequests?"ON":"OFF"}</span></button></div></div>
            {loading ? <div className="border border-zinc-700 bg-[#181818] p-8 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">Scanning network...</div> : friends.length === 0 ? <div className="border border-zinc-700 bg-[#181818] p-10 text-center"><Users className="mx-auto mb-3 text-zinc-600" size={28}/><div className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">No Connections</div><p className="mt-2 font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-600">Your trusted network is currently empty.</p></div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {friends.map(friend => <article key={friend.id} className={`group relative overflow-hidden border bg-[#181818] transition hover:-translate-y-0.5 ${friend.favorite?"border-yellow-400/70":"border-zinc-700 hover:border-zinc-500"}`}><div className={`h-1 ${friend.favorite?"bg-yellow-400":"bg-zinc-800 group-hover:bg-yellow-400/50"}`}/>{friend.favorite && <div className="absolute right-3 top-3 flex items-center gap-1 border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-[7px] font-bold uppercase tracking-widest text-yellow-400"><Star size={8} fill="#facc15"/> Priority</div>}<div className="p-4 sm:p-5"><div className="flex items-start gap-4"><div className="relative shrink-0"><img src={getProfileAssets(friend.profile).avatar} alt={friend.nickname||friend.username} className="h-16 w-16 border border-zinc-600 bg-[#111] object-cover group-hover:border-yellow-400/70"/>{friend.unreadMessages!>0 && <div className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center border border-[#181818] bg-red-500 px-1 font-mono text-[8px] font-black">{friend.unreadMessages!>99?"99+":friend.unreadMessages}</div>}</div><div className="min-w-0 flex-1">{editingNickname===friend.id ? <div className="space-y-2"><input value={nicknameInput} onChange={e=>setNicknameInput(e.target.value)} autoFocus maxLength={24} onKeyDown={e=>{if(e.key==="Enter")saveNickname(friend.id);if(e.key==="Escape"){setEditingNickname(null);setNicknameInput("")}}} className="w-full border border-yellow-400/50 bg-[#111] px-2 py-2 text-sm outline-none"/><div className="flex gap-2"><button onClick={()=>saveNickname(friend.id)} className="flex-1 bg-yellow-400 px-2 py-1.5 text-[8px] font-bold uppercase text-black">Save</button><button onClick={()=>{setEditingNickname(null);setNicknameInput("")}} className="border border-zinc-700 px-2 py-1.5 text-[8px] font-bold uppercase text-zinc-400">Cancel</button></div></div> : <><div className="flex items-center gap-2 pr-10"><div className="truncate text-base font-black uppercase">{friend.nickname||friend.username}</div>{getProfileAssets(friend.profile).verification&&<img src={getProfileAssets(friend.profile).verification!.badge} alt={getProfileAssets(friend.profile).verification!.label} className="h-4 w-4 shrink-0"/>}</div><div className="mt-1 truncate font-mono text-[7px] uppercase tracking-widest text-zinc-600">USERNAME // {friend.username}</div><div className="mt-3 flex items-center gap-2"><button onClick={()=>{setEditingNickname(friend.id);setNicknameInput(friend.nickname||"")}} className="text-zinc-600 hover:text-yellow-400"><Pencil size={13}/></button><button onClick={()=>toggleFavorite(friend.id)} className={friend.favorite?"text-yellow-400":"text-zinc-600 hover:text-yellow-400"}><Star size={14} fill={friend.favorite?"#facc15":"none"}/></button>{friend.unreadMessages!>0&&<span className="ml-1 flex items-center gap-1 font-mono text-[7px] uppercase text-red-400"><MessageSquare size={10}/>{friend.unreadMessages} unread</span>}</div></>}</div></div>{editingNickname!==friend.id&&<div className="mt-5 grid grid-cols-[1fr_auto] gap-2 border-t border-zinc-800 pt-4"><button onClick={async()=>{const {data:tradingProfile}=await supabase.from("trading_profiles").select("*").eq("user_id",friend.id).single();setSelectedFriend({...friend,tradingProfile:tradingProfile??null})}} className="flex items-center justify-center gap-2 border border-yellow-400/60 bg-yellow-400/10 px-3 py-2.5 text-[8px] font-bold uppercase tracking-widest text-yellow-400 hover:bg-yellow-400 hover:text-black"><Users size={11}/> View Profile</button><button onClick={()=>{if(confirmUnfriend===friend.id)unfriend(friend.id);else{setConfirmUnfriend(friend.id);setTimeout(()=>setConfirmUnfriend(current=>current===friend.id?null:current),3000)}}} className={`border px-3 py-2.5 text-[8px] font-bold uppercase tracking-widest ${confirmUnfriend===friend.id?"border-red-500 bg-red-500 text-white":"border-zinc-700 text-zinc-500 hover:border-red-500/60 hover:text-red-400"}`}>{confirmUnfriend===friend.id?"Confirm":"Unfriend"}</button></div>}</div></article>)}
            </div>}
          </section>}
        </>
      )}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4 font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-700"><span>MLPEKAYOU // SOCIAL SYSTEM</span><span className="hidden sm:block">SECURE CHANNEL // ONLINE</span></div>
    </div>
  </div>
);
}
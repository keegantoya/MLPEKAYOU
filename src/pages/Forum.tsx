import { useEffect, useRef, useState } from "react";
import KayouHeader from "@/components/KayouHeader";
import { supabase } from "@/lib/supabase";
import {
  MessageCircle,
  Users,
  FileText,
  PenSquare,
  Heart,
  Repeat2,
  Search,
  ArrowLeftRight,
  X,
  BookOpen,
} from "lucide-react";

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
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import maipfp from "@/assets/avatars/maipfp.webp";

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

  heimantouavatar: heimantouAvatar,
  KeeganAvatar: KeeganAvatar,
  "keeganpfp.webp": KeeganAvatar,
  maipfp: maipfp,
};

const VERIFIED_USERS: Record<
  string,
  {
    badge: string;
    label: string;
  }
> = {
  // MLPEKAYOU STAFF (Gold)
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
};

const adminOnlyPosts = [
  {
    id: "news-launch",
    title: "Kayou US News",
    topic: "News & Updates",
    author_name: "Keegan",
    author_avatar: "KeeganAvatar",
    caption:
      "Check back here for updates regarding set launches and Kayou US's latest news and in-person events.",
    image: KeeganAvatar,
  },

    {
    id: "giveaway-moving",
    title: "Moving Giveaways",
    topic: "Giveaways",
    author_name: "Keegan",
    author_avatar: "KeeganAvatar",
    caption:
      "(05/25-06/10) I am offically outprocessing from the military and I must move across the country to become a civilian again. Check the Discord server!",
    image: avatar006,
  },

  {
    id: "giveaway-may",
    title: "Monthly Giveaway",
    topic: "Giveaways",
    author_name: "Keegan",
    author_avatar: "KeeganAvatar",
    caption:
      "(05/10 - 05/15) 15 lucky winners will recieve one sealed in-person event promotional card from Kayou US's new Friendships Begin TCG set.",
    image: avatar006,
  },

  {
  id: "news-moon3-sc001-preview",
  title: "Eternal Moon Three",
  topic: "News & Updates",
  author_name: "Keegan",
  author_avatar: "KeeganAvatar",
  caption:
    "Eternal Moon Three will be coming to MLPEKAYOU on 05/25!",
  image: avatar006,
  attached_cards: [
    {
      set_id: "3",
      card_key: "SC-1",
    },
  ],
},

];

export default function Forum() {
  const categories = [
    "General",
    "In Search Of",
    "Trade Offers",
    "Questions",
    "News & Updates",
    "Giveaways",
  ];

  const restrictedCategories = ["News & Updates", "Giveaways"];

  const [selectedCategory, setSelectedCategory] =
  useState("General");

const [showCreatePostModal, setShowCreatePostModal] = useState(false);
const [postTitle, setPostTitle] = useState("");
const [postCategory, setPostCategory] = useState("General");
const [postCaption, setPostCaption] = useState("");
const [postLocation, setPostLocation] = useState("");
const [likedPosts, setLikedPosts] = useState<string[]>([]);
const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
const [repostedPosts, setRepostedPosts] = useState<string[]>([]);
const [repostCounts, setRepostCounts] = useState<Record<string, number>>({});
const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
const [postCardIndexes, setPostCardIndexes] = useState<Record<string, number>>(
  {}
);
const [showCommentsModal, setShowCommentsModal] = useState(false);
const [selectedPost, setSelectedPost] = useState<any>(null);
const [comments, setComments] = useState<any[]>([]);
const [newComment, setNewComment] = useState("");
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [postToDelete, setPostToDelete] = useState<any>(null);
const [memberCount, setMemberCount] = useState(0);
const [currentUser, setCurrentUser] = useState<any>(null);
const [showLoginModal, setShowLoginModal] = useState(false);
// User Search
const [userSearch, setUserSearch] = useState("");
const [searchResults, setSearchResults] = useState<any[]>([]);
const [searchingUsers, setSearchingUsers] = useState(false);
const [selectedUserRank, setSelectedUserRank] = useState<number | null>(null);

// Selected User Modal
const [showUserModal, setShowUserModal] = useState(false);
const [selectedUser, setSelectedUser] = useState<any>(null);
const [selectedUserTradingProfile, setSelectedUserTradingProfile] =
  useState<any>(null);

// User Stats
const [selectedUserStats, setSelectedUserStats] = useState({
  trades: 0,
  owned: 0,
  completed: 0,
});

// User Cards
const [selectedUserTradeCards, setSelectedUserTradeCards] = useState<any[]>([]);
const [selectedUserIsoCards, setSelectedUserIsoCards] = useState<any[]>([]);

const [selectedUserWishlistCards, setSelectedUserWishlistCards] =
  useState<any[]>([]);

const [selectedUserProfileSettings, setSelectedUserProfileSettings] =
  useState<{
    hide_iso: boolean;
    hide_wishlist: boolean;
  }>({
    hide_iso: false,
    hide_wishlist: false,
  });

const [zoomedCard, setZoomedCard] = useState<string | null>(null);
const [zoomedCardTitle, setZoomedCardTitle] = useState<string>("");

const [showMobileCategories, setShowMobileCategories] = useState(false);
const [showMobileRules, setShowMobileRules] = useState(false);

// Modal Tabs
const [selectedUserTab, setSelectedUserTab] =
  useState<"trades" | "purchases" | "iso" | "wishlist">("trades");

  const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>({});

  const [selectedCards, setSelectedCards] = useState<
  { set_id: string; card_key: string }[]
>([]);

const [selectedUserPurchaseCards, setSelectedUserPurchaseCards] =
  useState<any[]>([]);

const [showCardPickerModal, setShowCardPickerModal] = useState(false);
const [cardPickerSet, setCardPickerSet] = useState<string | null>(null);
const [cardPickerRarity, setCardPickerRarity] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

useEffect(() => {
  const lock =
    showCommentsModal ||
    showCardPickerModal ||
    showDeleteModal ||
    showCreatePostModal ||
    !!zoomedCard ||
    showUserModal;

  document.body.style.overflow = lock ? "hidden" : "";

  return () => {
    document.body.style.overflow = "";
  };
}, [
  showCommentsModal,
  showCardPickerModal,
  showDeleteModal,
  showCreatePostModal,
  zoomedCard,
  showUserModal,
]);

useEffect(() => {
  if (!showUserModal || !selectedUser) return;

  const channel = supabase
    .channel(`user-trades-${selectedUser.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "for_trade",
        filter: `user_id=eq.${selectedUser.id}`,
      },
      async () => {
        const { data: tradeCards } = await supabase
          .from("for_trade")
          .select("listing_type")
          .eq("user_id", selectedUser.id);

        setSelectedUserTradeCards(
  (tradeCards || []).filter(
    (card: any) =>
      (card.listing_type || "trade") === "trade"
  )
);

setSelectedUserPurchaseCards(
  (tradeCards || []).filter(
    (card: any) => card.listing_type === "purchase"
  )
);

        setSelectedUserStats((prev) => ({
          ...prev,
          trades: (tradeCards || []).length,
        }));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [showUserModal, selectedUser]);

useEffect(() => {
  async function loadPosts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data: forumData } = await supabase
  .from("forum_posts")
  .select(
    "id, user_id, author_name, author_avatar, title, caption, topic, location, attached_cards, created_at"
  )
  .order("created_at", { ascending: false });

    if (forumData) {
      setPosts((currentPosts) => [
        currentPosts[0],
        ...forumData,
      ]);
    }

    const { data: likesData } = await supabase
      .from("post_likes")
      .select("post_id, user_id");

    if (likesData) {
      const counts: Record<string, number> = {};
      const mine: string[] = [];

      likesData.forEach((like) => {
        const postId = String(like.post_id);
        counts[postId] = (counts[postId] || 0) + 1;

        if (user && like.user_id === user.id) {
          mine.push(postId);
        }
      });

      setLikeCounts(counts);
      setLikedPosts(mine);
}

const { data: repostsData } = await supabase
  .from("post_reposts")
  .select("post_id, user_id");

if (repostsData) {
  const counts: Record<string, number> = {};
  const mine: string[] = [];

  repostsData.forEach((repost) => {
    const postId = String(repost.post_id);
    counts[postId] = (counts[postId] || 0) + 1;

    if (user && repost.user_id === user.id) {
      mine.push(postId);
    }
  });

  setRepostCounts(counts);
setRepostedPosts(mine);
}

const { data: commentsData } = await supabase
  .from("forum_comments")
  .select("post_id");

if (commentsData) {
  const counts: Record<string, number> = {};

  commentsData.forEach((comment) => {
    const postId = String(comment.post_id);
    counts[postId] = (counts[postId] || 0) + 1;
  });

  setCommentCounts(counts);
}

const { count: totalMembers } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true });

setMemberCount(totalMembers || 0);
  }

  loadPosts();
}, []);

useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setShowLoginModal(true);
    }
  };

  checkAuth();
}, []);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(event.target as Node)
    ) {
      setSearchResults([]);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const [posts, setPosts] = useState<any[]>([
  {
    id: "welcome-post",
    title: "Welcome to the Kayou Community Forum!",
    topic: "General",
    author_name: "Keegan",
    author_avatar: "KeeganAvatar",
    caption:
      "Welcome to the MLPEKAYOU Community Homepage. Here, you can discuss with other community members based on the discussion topics to my left. Please read the rules before posting or interacting, as violating these rules will result in a ban without warning.",
  },
  
]);
const filteredPosts = [...adminOnlyPosts, ...posts].filter(
  (post) => post.topic === selectedCategory
);;

async function toggleLike(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be signed in to like posts.");
    return;
  }

  const hasLiked = likedPosts.includes(postId);

  if (hasLiked) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setLikedPosts((prev) => prev.filter((id) => id !== postId));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 1) - 1, 0),
    }));
  } else {
    await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    setLikedPosts((prev) => [...prev, postId]);
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  }
}

async function toggleRepost(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be signed in to repost.");
    return;
  }

  const hasReposted = repostedPosts.includes(postId);

  if (hasReposted) {
    await supabase
      .from("post_reposts")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setRepostedPosts((prev) => prev.filter((id) => id !== postId));
    setRepostCounts((prev) => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 1) - 1, 0),
    }));
  } else {
    await supabase.from("post_reposts").insert({
      post_id: postId,
      user_id: user.id,
    });

    setRepostedPosts((prev) => [...prev, postId]);
    setRepostCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  }
}

async function openComments(post: any) {
  setSelectedPost(post);
  setShowCommentsModal(true);

  const { data } = await supabase
    .from("forum_comments")
    .select(
  "id, post_id, user_id, author_name, author_avatar, content, created_at"
)
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  setComments(data || []);
}

async function submitComment() {
  if (!newComment.trim() || !selectedPost) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be signed in to comment.");
    return;
  }

const { data: profile } = await supabase
  .from("profiles")
  .select("username, avatar_url")
  .eq("id", user.id)
  .single();

  const { error } = await supabase.from("forum_comments").insert({
    post_id: selectedPost.id,
    user_id: user.id,
    author_name:
      profile?.username ||
      user.user_metadata?.display_name ||
      user.user_metadata?.username ||
      "Anonymous",
    author_avatar: profile?.avatar_url || "avatar001",
    content: newComment,
  });

  if (error) {
    alert(error.message);
    return;
  }

  setNewComment("");

  // Refresh comments
  await openComments(selectedPost);

  // Update visible comment count immediately
  setCommentCounts((prev) => ({
    ...prev,
    [String(selectedPost.id)]: (prev[String(selectedPost.id)] || 0) + 1,
  }));
}

async function handleCreatePost() {
  if (!postTitle.trim() || !postCaption.trim()) {
    alert("Please enter both a title and a caption.");
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be signed in to create a post.");
    return;
  }

const { data: profile } = await supabase
  .from("profiles")
  .select("username, avatar_url")
  .eq("id", user.id)
  .single();

  const { error } = await supabase.from("forum_posts").insert({
    user_id: user.id,
    author_name:
      profile?.username ||
      user.user_metadata?.display_name ||
      user.user_metadata?.username ||
      "Anonymous",
    author_avatar: profile?.avatar_url || "avatar001",
    title: postTitle.trim().slice(0, 30),
caption: postCaption,
topic: postCategory,
location: postLocation.trim().slice(0, 15) || null,
attached_cards: selectedCards,
  });

  if (error) {
    alert(error.message);
    return;
  }

  setPostTitle("");
setPostCategory("General");
setPostCaption("");
setPostLocation("");
setSelectedCards([]);
setCardPickerSet(null);
setCardPickerRarity(null);
setShowCardPickerModal(false);

  setShowCreatePostModal(false);

  window.location.reload();
}

async function searchUsers(query: string) {
  setUserSearch(query);

  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  setSearchingUsers(true);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .ilike("username", `%${query}%`)
    .order("username")
    .limit(10);

  if (error) {
    console.error("Failed to search users:", error);
    setSearchResults([]);
  } else {
    setSearchResults(data || []);
  }

  setSearchingUsers(false);
}

async function openUserProfile(user: any) {
   setSelectedUserRank(null);
  setSelectedUser(user);
  setShowCommentsModal(false);
  setShowUserModal(true);
  setCollapsedSets({});
  setSearchResults([]);
  setUserSearch("");

  // Load trading profile (Discord username)
  const { data: tradingProfile } = await supabase
    .from("trading_profiles")
    .select("discord_username")
    .eq("user_id", user.id)
    .single();

  setSelectedUserTradingProfile(tradingProfile || null);
  
const { data: profileSettings } = await supabase
  .from("profiles")
  .select(
    "hide_iso, hide_wishlist, iso_hidden_sets, iso_hidden_sets_ccg, iso_hidden_sets_tcg"
  )
  .eq("id", user.id)
  .single();

const legacyHidden: string[] =
  profileSettings?.iso_hidden_sets || [];

const hiddenIsoSets: string[] = [
  ...(profileSettings?.iso_hidden_sets_ccg?.length
    ? profileSettings.iso_hidden_sets_ccg
    : legacyHidden),
  ...(profileSettings?.iso_hidden_sets_tcg?.length
    ? profileSettings.iso_hidden_sets_tcg
    : legacyHidden),
];

setSelectedUserProfileSettings({
  hide_iso: profileSettings?.hide_iso ?? false,
  hide_wishlist: profileSettings?.hide_wishlist ?? false,
});


  // Load active trades
  const { data: tradeCards } = await supabase
    .from("for_trade")
      .select("set_id, card_key, listing_type")
    .eq("user_id", user.id);

setSelectedUserTradeCards(
  (tradeCards || []).filter(
    (card: any) =>
      (card.listing_type || "trade") === "trade"
  )
);

setSelectedUserPurchaseCards(
  (tradeCards || []).filter(
    (card: any) =>
      card.listing_type === "purchase"
  )
);

  const { data: wishlistRows } = await supabase
  .from("wishlists")
  .select("card_key")
  .eq("user_id", user.id)
  .order("created_at", { ascending: true });

const wishlistCards = (wishlistRows || []).map((row: any) => {

  const [set_id, card_key] = String(row.card_key).split(":");

  return {
    id: row.card_key,
    set_id,
    card_key,
  };
});

  if (!(profileSettings?.hide_iso ?? false)) {
  setSelectedUserTab("iso");
} else if (!(profileSettings?.hide_wishlist ?? false)) {
  setSelectedUserTab("wishlist");
} else {
  setSelectedUserTab("trades");
}

// Load collection progress
const { data: isoProgress } = await supabase
  .from("collection_progress")
  .select("set_id, progress")
  .eq("user_id", user.id);

  const { data: isoStatusRows } = await supabase
  .from("iso_status")
  .select("card_key, status")
  .eq("user_id", user.id);

// Build a lookup of cards currently in progress
const inProgressCards = new Set(
  (isoStatusRows || [])
    .filter(
      (row: any) =>
        row.status === "trade_in_progress" ||
        row.status === "purchase_in_progress"
    )
    .map((row: any) => String(row.card_key))
);

// Build a lookup of cards the user already owns
const ownedCards: Record<string, boolean> = {};

setSelectedUserWishlistCards(
  [...wishlistCards].sort((a, b) => {
    const setOrder = [
      "1",
      "2",
      "5",
      "7",
      "8",
      "3",
      "11",
      "9",
      "FW",
      "SD",
      "friendshipsbegin",
      "tcgpromos",
      "10",
    ];

    const setIndexA = setOrder.indexOf(String(a.set_id));
    const setIndexB = setOrder.indexOf(String(b.set_id));

    if (setIndexA !== setIndexB) {
      return (
        (setIndexA === -1 ? 999 : setIndexA) -
        (setIndexB === -1 ? 999 : setIndexB)
      );
    }

    const extractNumber = (card: any) => {
      const match = String(card.card_key).match(/(\d+)(?!.*\d)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    return extractNumber(a) - extractNumber(b);
  })
);

(isoProgress || []).forEach((set: any) => {
  Object.entries(set.progress || {}).forEach(([key, value]) => {
    if (value) {
      ownedCards[`${set.set_id}-${key}`] = true;
    }
  });
});

// Generate missing cards for supported CCG sets
const isoCards: any[] = [];

const isoSets = [
  { id: "1", rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 } },
  { id: "2", rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 } },
  { id: "3", rarities: { R: 60, SR: 40, SSR: 40, HR: 60, UR: 18, LSR: 32, SGR: 16, ZR: 14, SC: 7, SZR: 3 } },
  { id: "4", rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }},
  { id: "5", rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 } },
  { id: "6", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 }},
  { id: "7", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 } },
  { id: "8", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 } },
  { id: "11", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 } },
  { id: "9", rarities: { PR: 6 } },
  { id: "10", rarities: { LC: 1 } },
  { id: "SD", rarities: {} },
{ id: "FW", rarities: {} },
{ id: "TCG_PROMOS", rarities: {} },
];

isoSets.forEach((set) => {
  if (set.id === "9") {
  ["PR-1","PR-2","PR-3","PR-4","PR-5","PR-7"].forEach((cardKey) => {
    const fullKey = `${set.id}-${cardKey}`;

    if (
      !ownedCards[fullKey] &&
      !inProgressCards.has(fullKey)
    ) {
      isoCards.push({
        id: fullKey,
        set_id: set.id,
        card_key: cardKey,
      });
    }
  });

  return;
}
  if (hiddenIsoSets.includes(String(set.id))) {
    return;
  }
if (set.id === "FW") {
  const progressRow = (isoProgress || []).find(
    (row: any) => String(row.set_id) === "FW"
  );

  const progress = progressRow?.progress || {};

  const FW_STRUCTURE = [
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

  FW_STRUCTURE.forEach(({ prefix, count }) => {
    for (let i = 0; i < count; i++) {
      let num = i + 1;

      if (prefix === "BP01ER") {
        num = i + 7;
      }

      if (prefix === "BP01PSPR") {
        const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
        num = PSPR_NUMBERS[i];
        if (!num) continue;
      }

      const cardKey = `${prefix}${String(num).padStart(2, "0")}`;

      if (
  progress[cardKey] !== true &&
  !inProgressCards.has(cardKey)
) {
        isoCards.push({
          id: `FW-${cardKey}`,
          set_id: "FW",
          card_key: cardKey,
        });
      }
    }
  });

  return;
}

if (
  set.id === "SD" &&
  (
    hiddenIsoSets.includes("SD_STARTERS") ||
    hiddenIsoSets.includes("SD_BONUS")
  )
) {
  return;
}

if (set.id === "SD") {
  const progressRow = (isoProgress || []).find(
    (row: any) => String(row.set_id) === "SD"
  );

  const progress = progressRow?.progress || {};

  const SD_STRUCTURE = [
    { prefix: "SD01C", count: 9 },
    { prefix: "SD01U", count: 7 },
    { prefix: "SD01SR", count: 6 },
    { prefix: "SD01SPR", count: 10 },
    { prefix: "SD01GR", count: 6 },
    { prefix: "SD01CR", count: 6 },
    { prefix: "SD01ER", count: 6 },
    { prefix: "SD01PER", count: 12 },
    { prefix: "SD01PRR", count: 6 },
  ];

  SD_STRUCTURE.forEach(({ prefix, count }) => {
    for (let i = 0; i < count; i++) {
      let num = i + 1;

      // SD01PER is numbered 07–18
      if (prefix === "SD01PER") {
        num = i + 7;
        if (num > 18) continue;
      }

      const cardKey = `${prefix}${String(num).padStart(2, "0")}`;

      const isOwned =
        progress[cardKey] === true ||
        progress[`BONUS-${cardKey}`] === true ||
        progress[`STARTER-${cardKey}`] === true;

      if (
  !isOwned &&
  !inProgressCards.has(cardKey)
) {
        isoCards.push({
          id: `SD-${cardKey}`,
          set_id: "SD",
          card_key: cardKey,
        });
      }
    }
  });

  return;
}

if (set.id === "tcgpromos") {
  for (let i = 1; i <= 6; i++) {
    const cardKey = `RR${String(i).padStart(2, "0")}`;
    const fullKey = `tcgpromos-${cardKey}`;

    if (
      !ownedCards[fullKey] &&
      !inProgressCards.has(fullKey)
    ) {
      isoCards.push({
        id: fullKey,
        set_id: "tcgpromos",
        card_key: cardKey,
      });
    }
  }

  return;
}

  // Existing logic for CCG sets
  Object.entries(set.rarities).forEach(([rarity, count]) => {
    for (let i = 1; i <= (count as number); i++) {
      const cardKey = `${rarity}-${i}`;
      const fullKey = `${set.id}-${cardKey}`;
      if (inProgressCards.has(fullKey)) {
  continue;
}

      if (
  !ownedCards[fullKey] &&
  !inProgressCards.has(fullKey)
) {
  isoCards.push({
    id: fullKey,
    set_id: set.id,
    card_key: cardKey,
  });
}
    }
  });
});

setSelectedUserIsoCards(
  [...isoCards].sort((a, b) => {
    const setOrder = [
      "1",
      "2",
      "5",
      "7",
      "8",
      "3",
      "11",
      "9",
      "4",
      "6",
      "FW",
      "SD",
      "friendshipsbegin",
      "tcgpromos",
    ];

    const rarityOrders: Record<string, string[]> = {
      "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
      "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
      "3": ["R", "SR", "SSR", "HR", "LSR", "UR", "SGR", "ZR", "SC", "SZR"],
      "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
      "5": ["R", "SR", "FR", "TR", "TGR", "MTR", "SSR", "UR", "USR", "XR"],
      "6": ["BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],
      "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
      "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
      "11": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR", "SCR" ],
      "9": ["PR"],
      "tcgpromos": ["PR"],

      "FW": [
        "C", "U", "ER", "SR", "SPR", "GR", "CR", "RR",
        "※ER", "※SPR", "※GR", "※CR", "※RR",
      ],

      "SD": [
        "C", "U", "SR", "SPR", "GR", "CR", "ER",
        "※ER", "※RR",
      ],

      "friendshipsbegin": [
        "C", "U", "SR", "SPR", "GR", "CR", "ER",
        "※ER", "※RR",
      ],
    };

const extractRarity = (card: any) => {
  const setId = String(card.set_id);
  const key = String(card.card_key);

  // Standard checklist sets
  if (
    setId !== "FW" &&
    setId !== "SD" &&
    setId !== "friendshipsbegin" &&
    setId !== "tcgpromos"
  ) {
    return key.split("-")[0];
  }

  // TCG Promos
  if (setId === "tcgpromos") {
    return "PR";
  }

  // Explicit prefix checks (prevents PRR from being mistaken for RR)
  if (key.includes("PSPR")) return "※SPR";
  if (key.includes("PCR")) return "※CR";
  if (key.includes("PGR")) return "※GR";
  if (key.includes("PER")) return "※ER";
  if (key.includes("PRR")) return "※RR";

  if (key.includes("SPR")) return "SPR";
  if (key.includes("GR")) return "GR";
  if (key.includes("CR")) return "CR";
  if (key.includes("RR")) return "RR";
  if (key.includes("SR")) return "SR";
  if (key.includes("ER")) return "ER";
  if (key.includes("U")) return "U";
  if (key.includes("C")) return "C";

  return "OTHER";
};

    const extractNumber = (card: any) => {
      const match = String(card.card_key).match(/(\d+)(?!.*\d)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const setIndexA = setOrder.indexOf(String(a.set_id));
    const setIndexB = setOrder.indexOf(String(b.set_id));

    if (setIndexA !== setIndexB) {
      return (
        (setIndexA === -1 ? 999 : setIndexA) -
        (setIndexB === -1 ? 999 : setIndexB)
      );
    }

    const currentOrder =
      rarityOrders[String(a.set_id)] || [];

    const rarityA = extractRarity(a);
    const rarityB = extractRarity(b);

    const rarityIndexA = currentOrder.indexOf(rarityA);
    const rarityIndexB = currentOrder.indexOf(rarityB);

    if (rarityIndexA !== rarityIndexB) {
      return (
        (rarityIndexA === -1 ? 999 : rarityIndexA) -
        (rarityIndexB === -1 ? 999 : rarityIndexB)
      );
    }

    return extractNumber(a) - extractNumber(b);
  })
);

  // Load owned card count
  const { data: collection } = await supabase
    .from("collection_progress_raw")
    .select("progress")
    .eq("user_id", user.id);

  let owned = 0;

  (collection || []).forEach((row: any) => {
    owned += Object.values(row.progress || {}).filter(Boolean).length;
  });

  // Load collection progress for completed sets

let completed = 0;

const progressMap = new Map(
  (isoProgress || []).map((row: any) => [String(row.set_id), row])
);

// Main checklist sets only
const sets = [
  { id: "1", rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 } },
  { id: "5", rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 } },
  { id: "7", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 } },
  { id: "2", rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 } },
  { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, SZR:1 } },
  { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 } },
  { id: "TCG_PROMOS", name: "TCG Promos" },
];

sets.forEach((set) => {
  const found = progressMap.get(set.id);

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

setSelectedUserRank(null);

setSelectedUserStats({
  trades: (tradeCards || []).length,
  owned,
  completed,
});
}

function getTradeCardImage(card: any) {
  if (!card) return "";

// Friendships Begin
if (
  String(card.set_id) === "SD" ||
  String(card.set_id) === "friendshipsbegin"
) {
  const key = String(card.card_key)
    .replace(/^BONUS-/, "")
    .replace(/^STARTER-/, "");

  return `/friendships-begin/${key}.webp`;
}

// Fantasy Wonderland
if (String(card.set_id) === "FW") {
  const key = String(card.card_key);

  return key.startsWith("BP01ER")
    ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.webp`
    : key.startsWith("BP01PER")
    ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.webp`
    : `/fantasy-wonderland/${key}.webp`;
}

  if (card.set_id === "9") {
    const number = card.card_key.split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }
  if (card.set_id === "10") {
  return "/serialized-limited-cards/andypricepromo.webp";
}

  if (card.set_id === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }

  const [rarityRaw, number] = card.card_key.split("-");
  const rarity =
    rarityRaw === "SHINING ZR" ? "SZR" : rarityRaw;

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
  const c = config[String(card.set_id)];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(
  number
).padStart(3, "0")}${
  String(card.set_id) === "6" &&
  ["ST", "TR", "TGR"].includes(rarity)
    ? ".webp"
    : ".webp"
}`;
}

function isMoon3DoubleWide(card: any) {
  if (!card) return false;

  const setId = String(card.set_id);
  const cardKey = String(card.card_key)
    .replace(/^SZR-0*/, "SZR-");

  return setId === "3" && cardKey === "SZR-1";
}

const CARD_PICKER_SETS = [
  { id: "1", name: "Eternal Moon: First Edition" },
  { id: "2", name: "Eternal Moon: Second Edition" },
  { id: "3", name: "Eternal Moon: Third Edition" },
  { id: "4", name: "Star: First Edition" },
  { id: "5", name: "Rainbow: First Edition" },
  { id: "6", name: "Rainbow: Second Edition" },
  { id: "7", name: "Fun Moments: First Edition" },
  { id: "8", name: "Fun Moments: Second Edition" },
  { id: "11", name: "Fun Moments: Third Edition" },
  { id: "9", name: "Promotional Cards" },
  { id: "FW", name: "Fantasy Wonderland" },
  { id: "SD", name: "Friendships Begin" },
  { id: "tcgpromos", name: "TCG Promos" },
];

const CARD_PICKER_RARITIES: Record<string, string[]> = {
  "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
  "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
  "3": ["R", "SR", "SSR", "HR", "LSR", "UR", "SGR", "ZR", "SC", "SZR"],
  "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
  "5": ["R", "SR", "FR", "TR", "TGR", "MTR", "SSR", "UR", "USR", "XR"],
  "6": ["BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],
  "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
  "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
  "11": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR", "SCR"],
  "9": ["PR"],
  "FW": [
    "C",
    "U",
    "ER",
    "SR",
    "SPR",
    "GR",
    "CR",
    "RR",
    "※ER",
    "※SPR",
    "※GR",
    "※CR",
    "※RR",
  ],
  "SD": [
    "C",
    "U",
    "SR",
    "SPR",
    "GR",
    "CR",
    "ER",
    "※ER",
    "※RR",
  ],
  "tcgpromos": ["PR"],
};

function getCardsForPicker(
  setId: string,
  rarity: string
): { set_id: string; card_key: string }[] {
  const cards: { set_id: string; card_key: string }[] = [];

  // Fantasy Wonderland
  if (setId === "FW") {
    const structures: Record<string, string[]> = {
      C: Array.from({ length: 48 }, (_, i) => `BP01C${String(i + 1).padStart(2, "0")}`),
      U: Array.from({ length: 18 }, (_, i) => `BP01U${String(i + 1).padStart(2, "0")}`),
      ER: Array.from({ length: 6 }, (_, i) => `BP01ER${String(i + 7).padStart(2, "0")}`),
      SR: Array.from({ length: 14 }, (_, i) => `BP01SR${String(i + 1).padStart(2, "0")}`),
      SPR: Array.from({ length: 28 }, (_, i) => `BP01SPR${String(i + 1).padStart(2, "0")}`),
      GR: Array.from({ length: 12 }, (_, i) => `BP01GR${String(i + 1).padStart(2, "0")}`),
      CR: Array.from({ length: 12 }, (_, i) => `BP01CR${String(i + 1).padStart(2, "0")}`),
      RR: Array.from({ length: 6 }, (_, i) => `BP01RR${String(i + 1).padStart(2, "0")}`),
      "※ER": Array.from({ length: 12 }, (_, i) => `BP01PER${String(i + 7).padStart(2, "0")}`),
      "※SPR": [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map(
        (n) => `BP01PSPR${String(n).padStart(2, "0")}`
      ),
      "※GR": Array.from({ length: 6 }, (_, i) => `BP01PGR${String(i + 1).padStart(2, "0")}`),
      "※CR": Array.from({ length: 12 }, (_, i) => `BP01PCR${String(i + 1).padStart(2, "0")}`),
      "※RR": Array.from({ length: 6 }, (_, i) => `BP01PRR${String(i + 1).padStart(2, "0")}`),
    };

    return (structures[rarity] || []).map((card_key) => ({
      set_id: setId,
      card_key,
    }));
  }

  // Friendships Begin
  if (setId === "SD") {
    const structures: Record<string, string[]> = {
      C: Array.from({ length: 9 }, (_, i) => `SD01C${String(i + 1).padStart(2, "0")}`),
      U: Array.from({ length: 7 }, (_, i) => `SD01U${String(i + 1).padStart(2, "0")}`),
      SR: Array.from({ length: 6 }, (_, i) => `SD01SR${String(i + 1).padStart(2, "0")}`),
      SPR: Array.from({ length: 10 }, (_, i) => `SD01SPR${String(i + 1).padStart(2, "0")}`),
      GR: Array.from({ length: 6 }, (_, i) => `SD01GR${String(i + 1).padStart(2, "0")}`),
      CR: Array.from({ length: 6 }, (_, i) => `SD01CR${String(i + 1).padStart(2, "0")}`),
      ER: Array.from({ length: 6 }, (_, i) => `SD01ER${String(i + 1).padStart(2, "0")}`),
      "※ER": Array.from({ length: 12 }, (_, i) => `SD01PER${String(i + 7).padStart(2, "0")}`),
      "※RR": Array.from({ length: 6 }, (_, i) => `SD01PRR${String(i + 1).padStart(2, "0")}`),
    };

    return (structures[rarity] || []).map((card_key) => ({
      set_id: setId,
      card_key,
    }));
  }

  // TCG Promos
  if (setId === "tcgpromos") {
    return Array.from({ length: 6 }, (_, i) => ({
      set_id: setId,
      card_key: `RR${String(i + 1).padStart(2, "0")}`,
    }));
  }

  // Promotional Cards
  if (setId === "9") {
  return [1, 2, 3, 4, 5, 7].map((num) => ({
    set_id: setId,
    card_key: `PR-${num}`,
  }));
}

  // Standard checklist sets
  const counts: Record<string, Record<string, number>> = {
    "1": { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 },
    "2": {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 30,
      UR: 16,
      LSR: 16,
      SGR: 8,
      ZR: 7,
      SC: 7,
      "SHINING ZR": 1,
    },
    "3": {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      UR: 18,
      LSR: 32,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
    "5": {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7,
    },
    "7": {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12,
    },
    "8": {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
    },
    "11": {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
      SCR: 12,
    },
    "4": {
  SSR: 20,
  SCR: 18,
  UR: 18,
  USR: 15,
  AR: 9,
  OR: 7,
  BP: 9,
  SAR: 9,
},

"6": {
  BASE: 18,
  R: 30,
  SR: 14,
  ST: 20,
  SSR: 15,
  FR: 18,
  TR: 12,
  TGR: 8,
  UR: 19,
  USR: 8,
  XR: 8,
},
  };

  const count = counts[setId]?.[rarity] || 0;

  return Array.from({ length: count }, (_, i) => ({
    set_id: setId,
    card_key: `${rarity}-${i + 1}`,
  }));
}

function toggleSelectedCard(card: {
  set_id: string;
  card_key: string;
}) {
  const exists = selectedCards.some(
    (c) =>
      c.set_id === card.set_id &&
      c.card_key === card.card_key
  );

  if (exists) {
    setSelectedCards((prev) =>
      prev.filter(
        (c) =>
          !(
            c.set_id === card.set_id &&
            c.card_key === card.card_key
          )
      )
    );
    return;
  }

  if (selectedCards.length >= 10) {
    alert("You may attach up to 10 cards.");
    return;
  }

  setSelectedCards((prev) => [...prev, card]);
}

function getSetName(setId: string) {
  const names: Record<string, string> = {
    "1": "Eternal Moon: First Edition",
    "2": "Eternal Moon: Second Edition",
    "3": "Eternal Moon: Third Edition",
    "4": "Star: First Edition",
    "5": "Rainbow: First Edition",
    "6": "Rainbow: Second Edition",
    "7": "Fun Moments: First Edition",
    "8": "Fun Moments: Second Edition",
    "11": "Fun Moments: Third Edition",
    "9": "Promos",
    "10": "Serialized & Limited Cards",
"SD": "Friendships Begin",
"friendshipsbegin": "Friendships Begin",
"FW": "Fantasy Wonderland",
    "tcgpromos": "TCG Promos",
  };

  return names[String(setId)] || `Set ${setId}`;
}

function groupCardsBySet(cards: any[]) {
  const groups: Record<string, any[]> = {};

  const setOrder = [
    "1",
    "2",
    "5",
    "7",
    "8",
    "3",
    "4",
    "6",
    "11",
    "9",
    "FW",
    "SD",
    "friendshipsbegin",
    "tcgpromos",
    "10",
  ];

  const rarityOrders: Record<string, string[]> = {
    "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
    "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
    "3": ["R", "SR", "SSR", "HR", "LSR", "UR", "SGR", "ZR", "SC", "SZR"],
    "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
    "5": ["R", "SR", "FR", "TR", "TGR", "MTR", "SSR", "UR", "USR", "XR"],
    "6": ["BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],
    "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
    "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
    "11": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR", "SCR"],
    "9": ["PR"],
    "10": ["LC"],
    "tcgpromos": ["PR"],

    "FW": [
      "C", "U", "ER", "SR", "SPR", "GR", "CR", "RR",
      "※ER", "※SPR", "※GR", "※CR", "※RR",
    ],

    "SD": [
      "C", "U", "ER", "SR", "SPR", "GR", "CR", "RR",
      "※ER", "※SPR", "※GR", "※CR", "※RR",
    ],

    "friendshipsbegin": [
      "C", "U", "ER", "SR", "SPR", "GR", "CR", "RR",
      "※ER", "※SPR", "※GR", "※CR", "※RR",
    ],
  };

  const extractRarity = (card: any) => {
    const setId = String(card.set_id);
    const key = String(card.card_key);

    if (
      setId !== "FW" &&
      setId !== "SD" &&
      setId !== "friendshipsbegin" &&
      setId !== "tcgpromos"
    ) {
      return key.split("-")[0];
    }

    if (setId === "tcgpromos") {
      return "PR";
    }

    if (key.includes("PSPR")) return "※SPR";
    if (key.includes("PCR")) return "※CR";
    if (key.includes("PGR")) return "※GR";
    if (key.includes("PER")) return "※ER";
    if (key.includes("PRR")) return "※RR";

    if (key.includes("SPR")) return "SPR";
    if (key.includes("GR")) return "GR";
    if (key.includes("CR")) return "CR";
    if (key.includes("RR")) return "RR";
    if (key.includes("SR")) return "SR";
    if (key.includes("ER")) return "ER";
    if (key.includes("U")) return "U";
    if (key.includes("C")) return "C";

    return "OTHER";
  };

  const extractNumber = (card: any) => {
    const match = String(card.card_key).match(/(\d+)(?!.*\d)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  cards.forEach((card) => {
    const setId = String(card.set_id);

    if (!groups[setId]) {
      groups[setId] = [];
    }

    groups[setId].push(card);
  });

  Object.keys(groups).forEach((setId) => {
    groups[setId].sort((a, b) => {
      const currentOrder = rarityOrders[setId] || [];

      const rarityA = extractRarity(a);
      const rarityB = extractRarity(b);

      const rarityIndexA = currentOrder.indexOf(rarityA);
      const rarityIndexB = currentOrder.indexOf(rarityB);

      if (rarityIndexA !== rarityIndexB) {
        return (
          (rarityIndexA === -1 ? 999 : rarityIndexA) -
          (rarityIndexB === -1 ? 999 : rarityIndexB)
        );
      }

      return extractNumber(a) - extractNumber(b);
    });
  });

  const sortedGroups: Record<string, any[]> = {};

  setOrder.forEach((setId) => {
    if (groups[setId]) {
      sortedGroups[setId] = groups[setId];
    }
  });

  Object.keys(groups).forEach((setId) => {
    if (!sortedGroups[setId]) {
      sortedGroups[setId] = groups[setId];
    }
  });

  return sortedGroups;
}

if (showLoginModal) {
  return (
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-[#d4af37]/30">

        <h2 className="text-3xl font-bold text-[#5a3e84] mb-3">
          Login Required
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          You cannot access this page without being signed in to an account.
        </p>

        <button
          onClick={() => window.location.href = "/"}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] font-semibold"
        >
          Return Home
        </button>

      </div>
    </div>
  );
}

  return (
    <div
  className="min-h-screen w-full overflow-x-hidden"
      style={{
        backgroundColor: "#F8F3FF",
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(244, 200, 74, 0.12) 0%, transparent 35%),
          radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.08) 0%, transparent 30%),
          radial-gradient(circle at 25% 75%, rgba(168, 85, 247, 0.10) 0%, transparent 35%),
          radial-gradient(circle at 75% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
          linear-gradient(
            180deg,
            #FCF9FF 0%,
            #F8F1FF 35%,
            #F5EEFF 65%,
            #FAF6FF 100%
          )
        `,
      }}
    >
      <KayouHeader />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Hero Banner */}
<div className="relative mb-8 z-[10000]">
  <div className="relative overflow-visible rounded-[2rem] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(168,85,247,0.12)] px-6 sm:px-8 py-8 sm:py-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-violet-200/30 to-purple-300/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
              <div>

                <div className="flex items-start justify-between gap-4">
  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
    Community Homepage
  </h1>

  <button
    type="button"
    onClick={() => setShowMobileRules(true)}
    className="xl:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-white/85 border border-white/60 shadow-lg text-slate-700 hover:text-violet-700 hover:bg-violet-50 transition-colors flex-shrink-0"
    aria-label="View Community Rules"
  >
    <BookOpen className="w-5 h-5" />
  </button>
</div>

                <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
  Discussions, trades, questions, and more! Find everything you are looking for here in the forum.
</p>

<div className="mt-4 inline-flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 max-w-2xl">
  <span className="text-base leading-none">⚠️</span>
  <span>
    All posts will be moderated and on a seven day timer. After seven days, the system will automatically delete the post and all associated comments to keep the database fast and prevent overflowing.
  </span>
</div>
                  {/* User Search */}
<div
  ref={searchContainerRef}
  className="mt-6 relative max-w-2xl"
>
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

    <input
      type="text"
      value={userSearch}
      onChange={(e) => searchUsers(e.target.value)}
      placeholder="Search MLPEKAYOU users..."
      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/60 bg-white/85 backdrop-blur-xl shadow-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
    />
  </div>

{/* Search Results Dropdown */}
{(userSearch.trim() || searchResults.length > 0) && (
  <div
    className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl max-h-96 overflow-y-auto"
    style={{
      zIndex: 999999,
    }}
  >
    {searchingUsers ? (
      <div className="px-4 py-4 text-sm text-slate-500">
        Searching...
      </div>
    ) : searchResults.length > 0 ? (
      searchResults.map((user) => (
        <button
          key={user.id}
          onClick={() => openUserProfile(user)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 transition-colors text-left"
        >
          <img
            src={
              avatarMap[String(user.avatar_url || "").trim()] ||
              avatar001
            }
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
          />

          <div>
            <div className="flex items-center gap-2">
  <div className="font-semibold text-slate-900">
    {user.username}
  </div>

  {VERIFIED_USERS[user.id] && (
    <img
  src={VERIFIED_USERS[user.id].badge}
  alt={VERIFIED_USERS[user.id].label}
  title={VERIFIED_USERS[user.id].label}
  className="w-5 h-5 object-contain flex-shrink-0"
/>
  )}
</div>
            <div className="text-xs text-slate-500">
              View profile
            </div>
          </div>
        </button>
      ))
    ) : (
      <div className="px-4 py-4 text-sm text-slate-500">
        No users found.
      </div>
    )}
  </div>
)}
</div>
              </div>

<div className="w-full lg:w-auto lg:flex-shrink-0">
  <button
    onClick={() => setShowCreatePostModal(true)}
    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#6F4BA1] to-[#7B56AE] hover:from-[#5F3E8C] hover:to-[#6B489B] text-white font-bold shadow-lg shadow-purple-200 transition-all duration-200 hover:scale-[1.02]"
  >
    <PenSquare className="w-5 h-5" />
    Create Post
  </button>
{/* Verified Badge Legend */}
<div className="mt-6 lg:mt-24 flex justify-center lg:justify-end">
  <div className="inline-flex flex-col items-start gap-2 px-4 py-3 rounded-2xl border border-amber-200 bg-amber-50/90 text-sm font-semibold text-amber-900 shadow-sm">
    
    <div className="flex items-center gap-2">
      <img
        src={verifiedBadge}
        alt="MLPEKAYOU STAFF"
        title="MLPEKAYOU STAFF"
        className="w-5 h-5 object-contain flex-shrink-0"
      />
      <span>= MLPEKAYOU STAFF</span>
    </div>

    <div className="flex items-center gap-2">
      <img
        src={blueVerifiedBadge}
        alt="CROSSINGTCG STAFF"
        title="CROSSINGTCG STAFF"
        className="w-5 h-5 object-contain flex-shrink-0"
      />
      <span>= KAYOUUS STAFF</span>
    </div>
    <div className="flex items-center gap-2">
  <img
    src={elementOfLaughter}
    alt="ELEMENT OF LAUGHTER"
    title="ELEMENT OF LAUGHTER"
    className="w-5 h-5 object-contain flex-shrink-0"
  />
  <span>= TOP DONATORS</span>
</div>

  </div>
</div>
</div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="relative z-0 grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Sidebar */}
          <aside className="order-1 xl:order-none xl:col-span-3 space-y-6">
            <div className="xl:sticky xl:top-24 space-y-6">
              {/* Categories */}
<div className="rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-xl shadow-lg p-6">
  <button
    type="button"
    onClick={() => setShowMobileCategories(!showMobileCategories)}
    className="w-full flex items-center justify-between"
  >
    <h2 className="text-lg font-black text-slate-900">
      Categories
    </h2>

    <span className="xl:hidden text-2xl font-bold text-slate-500">
      {showMobileCategories ? "−" : "+"}
    </span>
  </button>

  <div
    className={`mt-5 space-y-2 ${
      showMobileCategories ? "block" : "hidden"
    } xl:block`}
  >
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold ${
          selectedCategory === category
            ? "bg-gradient-to-r from-[#6F4BA1] to-[#7B56AE] text-white shadow-md"
            : "bg-slate-50/80 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:text-purple-700 text-slate-700"
        }`}
      >
        {category}
      </button>
    ))}
  </div>
</div>

              {/* Community Stats */}
              <div className="rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-xl shadow-lg p-6">
                <h2 className="text-lg font-black text-slate-900 mb-5">
                  Community Stats
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      label: "Members",
                      value: memberCount.toLocaleString(),
                      icon: Users,
                      bg: "bg-pink-50",
                      text: "text-pink-600",
                    },
                    {
                      label: "Topics",
                      value: "5",
                      icon: FileText,
                      bg: "bg-purple-50",
                      text: "text-purple-600",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-600">
                            {stat.label}
                          </span>
                        </div>

                        <span className="text-lg font-black text-slate-900">
                          {stat.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Sidebar */}
          <aside className="order-2 xl:order-none xl:col-span-3 space-y-6">
            <div className="xl:sticky xl:top-24">
             <div className="hidden xl:block rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-xl shadow-lg p-6">
                <button
                  type="button"
                  onClick={() => setShowMobileRules(!showMobileRules)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-lg font-black text-slate-900">
                    Community Rules
                  </h2>

                  <span className="xl:hidden text-2xl font-bold text-slate-500">
                    {showMobileRules ? "−" : "+"}
                  </span>
                </button>

                <div
                  className={`mt-5 ${
                    showMobileRules ? "block" : "hidden"
                  } xl:block`}
                >
                  <ul className="space-y-3">
                    {[
                      "Be respectful to everypony.",
                      "Be honest.",
                      "Do not spam post.",
                      "Stay on topic.",
                      "Do not curse.",
                      "This website is only for English cards. Include your location to differentiate between NA and SEA.",
                    ].map((rule, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>

{/* Main Feed */}
<section className="order-3 xl:order-none xl:col-span-6 space-y-6">
  <div className="space-y-4">
    <h2 className="text-xl font-black text-slate-900">
      {selectedCategory}
    </h2>

    {filteredPosts.map((post) => (
      <div
        key={post.id}
        className={`rounded-[2rem] backdrop-blur-xl p-6 ${
          post.id === "welcome-post" ||
          String(post.id).startsWith("news-") ||
          String(post.id).startsWith("giveaway-")
            ? "border-2 border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-purple-50 shadow-[0_20px_60px_rgba(245,158,11,0.18)] ring-1 ring-amber-200/60"
            : "border border-white/60 bg-white/80 shadow-lg"
        }`}
      >
        {/* Post Header */}
<div className="relative z-20 flex items-start gap-4 mb-4">
<button
  type="button"
  onClick={async () => {
    let userId = post.user_id;

    if (!userId && (post.author_name || post.author) === "Keegan") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("username", "Keegan")
        .single();

      if (profile) {
        openUserProfile(profile);
        return;
      }
    }

    // Normal database posts
    openUserProfile({
      id: userId,
      username: post.author_name || post.author,
      avatar_url: post.author_avatar,
    });
  }}
  className="flex-shrink-0"
>
  <img
    src={
      avatarMap[String(post.author_avatar || "").trim()] ||
      (typeof post.author_avatar === "string" &&
      !post.author_avatar.startsWith("avatar")
        ? post.author_avatar
        : null) ||
      avatar001
    }
    alt={post.author_name || post.author}
    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md cursor-pointer hover:scale-110 hover:ring-4 hover:ring-violet-200 transition-all duration-200"
title="View Profile"
  />
</button>

<div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {post.title}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {(post.id === "welcome-post" ||
                    String(post.id).startsWith("news-") ||
                    String(post.id).startsWith("giveaway-")) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-950 shadow-sm">
                      ✨ MLPEKAYOU OWNER
                    </span>
                  )}

                  <div className="flex items-center gap-2">
  <p className="text-sm text-slate-500">
    {post.id === "welcome-post" ||
    String(post.id).startsWith("news-") ||
    String(post.id).startsWith("giveaway-")
      ? (post.author_name || post.author)
      : `Posted by ${post.author_name || post.author}`}
  </p>

{VERIFIED_USERS[post.user_id] && (
  <img
    src={VERIFIED_USERS[post.user_id].badge}
    alt={VERIFIED_USERS[post.user_id].label}
    title={VERIFIED_USERS[post.user_id].label}
    className="w-5 h-5 object-contain flex-shrink-0"
  />
)}
</div>
                </div>
              </div>

{post.id !== "welcome-post" &&
  !String(post.id).startsWith("news-") &&
  !String(post.id).startsWith("giveaway-") &&
  (
    post.user_id === currentUser?.id ||
    [
      "17e57e39-bc0c-44e7-b373-ac34c6690185",
      "94a1c998-d040-4dd2-b2fb-5f606287139d",
      "408a516c-ee80-4ff8-a869-493e1fd5d961",
    ].includes(currentUser?.id)
  ) && (
    <div className="mt-2">
  <button
    onClick={() => {
      setPostToDelete(post);
      setShowDeleteModal(true);
    }}
    className="text-pink-500 hover:text-pink-600 font-semibold text-sm"
  >
    Delete
  </button>
</div>
  )}
            </div>
          </div>
        </div>

        {/* Optional Location */}
        {post.location && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            📍 {post.location}
          </p>
        )}

        <div className="mt-1 flex items-start gap-3 sm:gap-6 relative">
  {/* Caption */}
  <div className="flex-1 min-w-0">
    {(() => {
  const fullText = post.caption || post.content || "";
  const isLong = fullText.length > 250;
  const previewText = isLong
    ? `${fullText.slice(0, 250).trim()}...`
    : fullText;

  return (
    <div>
      <p className="text-[15px] sm:text-base text-slate-800 leading-7 whitespace-pre-wrap">
        {previewText}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => openComments(post)}
          className="mt-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
        >
          View more...
        </button>
      )}
    </div>
  );
})()}
  </div>

  {/* Attached Cards */}
  {Array.isArray(post.attached_cards) &&
    post.attached_cards.length > 0 &&
    (() => {
      const cards = post.attached_cards;
      const currentIndex =
        postCardIndexes[String(post.id)] || 0;
      const currentCard =
        cards[currentIndex % cards.length];

      const previousCard =
        cards[
          (currentIndex - 1 + cards.length) %
            cards.length
        ];

      const nextCard =
        cards[
          (currentIndex + 1) %
            cards.length
        ];

return (
  <div className={`relative z-0 w-24 sm:w-36 flex-shrink-0 pb-6 mt-2 sm:-mt-16 ${
  post.id === "news-moon3-sc001-preview"
    ? "min-h-[170px] sm:min-h-[240px] pb-6"
    : "min-h-[150px] sm:min-h-[220px]"
}`}>
          {/* Back Card */}
          {cards.length > 2 && (
            <img
              src={getTradeCardImage(previousCard)}
              alt=""
              className="absolute top-4 right-1 w-[92%] rounded-2xl border border-slate-200 shadow-md opacity-35 pointer-events-none"
              style={{ transform: "rotate(-7deg)" }}
            />
          )}

          {/* Middle Card */}
          {cards.length > 1 && (
            <img
              src={getTradeCardImage(nextCard)}
              alt=""
              className="absolute top-2 right-1 w-[92%] rounded-2xl border border-slate-200 shadow-md opacity-55 pointer-events-none"
              style={{ transform: "rotate(6deg)" }}
            />
          )}

{/* Main Card */}
<div className="absolute top-0 right-0 z-10">
  <img
    src={getTradeCardImage(currentCard)}
    alt={currentCard.card_key}
    className="w-[92%] rounded-2xl border border-slate-200 shadow-xl"
  />
</div>

{post.id === "news-moon3-sc001-preview" && (
  <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-slate-400 leading-tight z-20">
    Open post to view card.
  </div>
)}
        </div>
      );
    })()}
</div>


{/* Post Actions */}
<div className="mt-5 pt-4 border-t border-slate-100">
  <div className="flex items-center justify-start gap-8">
    {/* Like */}
    <button
      onClick={async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          document
            .querySelector('button[aria-label="Sign In"], button[data-login-button], .sign-in-button')
            ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          return;
        }

        toggleLike(String(post.id));
      }}
      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
        likedPosts.includes(String(post.id))
          ? "text-rose-500"
          : "text-slate-500 hover:text-rose-500"
      }`}
    >
      <Heart
        className="w-5 h-5"
        fill={
          likedPosts.includes(String(post.id))
            ? "currentColor"
            : "none"
        }
      />
      <span>{likeCounts[String(post.id)] || 0}</span>
    </button>

    {/* Repost */}
    <button
      onClick={async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          document
            .querySelector('button[aria-label="Sign In"], button[data-login-button], .sign-in-button')
            ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          return;
        }

        toggleRepost(String(post.id));
      }}
      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
        repostedPosts.includes(String(post.id))
          ? "text-violet-600"
          : "text-slate-500 hover:text-violet-600"
      }`}
    >
      <Repeat2 className="w-5 h-5" />
      <span>{repostCounts[String(post.id)] || 0}</span>
    </button>

    {/* Comments */}
    {post.id !== "welcome-post" && (
      <button
        onClick={async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            document
              .querySelector('button[aria-label="Sign In"], button[data-login-button], .sign-in-button')
              ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            return;
          }

          openComments(post);
        }}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{commentCounts[String(post.id)] || 0}</span>
      </button>
    )}
  </div>
</div>
      </div>
    ))}
    <div className="py-6 sm:py-8">
  <div className="flex items-center justify-center gap-3">
    <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-slate-300" />

    <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 whitespace-nowrap">
      That's all for now!
    </span>

    <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-slate-300" />
  </div>
</div>
  </div>
</section>
        </div>
      </main>
      {/* Mobile Rules Modal */}
{showMobileRules && (
  <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 xl:hidden">
    <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white shadow-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">
          Community Rules
        </h2>

        <button
          onClick={() => setShowMobileRules(false)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ul className="space-y-3">
        {[
          "Be respectful to everypony.",
          "Be honest.",
          "Do not spam post.",
          "Stay on topic.",
          "Do not curse.",
          "This website is only for English cards. Include your location to differentiate between NA and SEA.",
        ].map((rule, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm text-slate-600"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}
   {showCreatePostModal && (
  <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
    <div className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl border border-white/60 max-h-[90vh] overflow-hidden">
 <div className="max-h-[90vh] overflow-y-scroll p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">
          Create a New Post
        </h2>
        <button
          onClick={() => setShowCreatePostModal(false)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
        >
          ✕
        </button>
      </div>
      

      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Header
        </label>
        <input
  type="text"
  value={postTitle}
  onChange={(e) =>
    setPostTitle(e.target.value.slice(0, 30))
  }
  maxLength={30}
          placeholder="Enter a title..."
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Topic
        </label>
        <div className="relative w-full">
  <button
    type="button"
    onClick={() => setShowCategoryDropdown((v) => !v)}
    className="w-full flex items-center justify-between rounded-2xl border border-white/60 bg-white/85 backdrop-blur-xl shadow-sm px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
  >
    {postCategory || "Select a category"}

    <svg
      className="w-5 h-5 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  </button>

  {showCategoryDropdown && (
    <div className="absolute z-50 mt-2 w-full rounded-2xl border border-white/60 bg-white shadow-xl backdrop-blur-xl max-h-64 overflow-y-auto">
      {categories
        .filter((c) => !restrictedCategories.includes(c))
        .map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setPostCategory(category);
              setShowCategoryDropdown(false);
            }}
            className="w-full text-left px-4 py-3 text-slate-700 hover:bg-violet-50 hover:text-violet-700 font-semibold"
          >
            {category}
          </button>
        ))}
    </div>
  )}
</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Caption
        </label>
        <textarea
          rows={6}
          value={postCaption}
          onChange={(e) => setPostCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

<div className="mb-6">
  <label className="block text-sm font-bold text-slate-700 mb-2">
    Choose Cards (Optional)
  </label>

  <button
    type="button"
    onClick={() => setShowCardPickerModal(true)}
    className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700 transition-colors"
  >
    Select Cards ({selectedCards.length}/10)
  </button>

{selectedCards.length > 0 && (
  <div className="mt-4 flex flex-wrap gap-4">
    {selectedCards.map((card, index) => (
      <div
        key={`${card.set_id}-${card.card_key}-${index}`}
        className="relative w-24"
      >
        <img
          src={getTradeCardImage(card)}
          alt={card.card_key}
          className={`relative ${
  isMoon3DoubleWide(card)
    ? "col-span-2 aspect-[10/7]"
    : "aspect-[5/7]"
}`}
        />

        <button
          type="button"
          onClick={() => toggleSelectedCard(card)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold shadow hover:bg-rose-600 flex items-center justify-center"
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}
</div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Location (Optional)
        </label>
        <input
  type="text"
  value={postLocation}
  onChange={(e) =>
    setPostLocation(e.target.value.slice(0, 15))
  }
  maxLength={15}
          placeholder="Dallas, TX"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowCreatePostModal(false)}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
        >
          Cancel
        </button>

        <button
  onClick={handleCreatePost}
  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6F4BA1] to-[#7B56AE] hover:from-[#5F3E8C] hover:to-[#6B489B] text-white font-bold shadow-lg"
>
  Post
</button>
      </div>
    </div>
  </div>
    </div>
)}
{showCommentsModal && selectedPost && (
  <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
    <div className="w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl border border-white/60 p-6 sm:p-8 h-[90vh] overflow-hidden relative">
     <div className="absolute inset-0 overflow-y-auto px-6 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">
          Comments
        </h2>

        <button
          onClick={() => {
            setShowCommentsModal(false);
            setSelectedPost(null);
            setComments([]);
            setNewComment("");
          }}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
        >
          ✕
        </button>
      </div>
{/* Original Post */}
<div className="rounded-3xl border border-slate-200 bg-white p-5 mb-6 shadow-sm">
  {/* Header */}
  <div className="flex items-start gap-3">
<button
  type="button"
  onClick={async () => {
    let userId = selectedPost.user_id;

    if (
      !userId &&
      (selectedPost.author_name || selectedPost.author) === "Keegan"
    ) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("username", "Keegan")
        .single();

      if (profile) {
        openUserProfile(profile);
        return;
      }
    }

    openUserProfile({
      id: userId,
      username:
        selectedPost.author_name || selectedPost.author,
      avatar_url: selectedPost.author_avatar,
    });
  }}
  className="flex-shrink-0"
>
  <img
    src={
      avatarMap[String(selectedPost.author_avatar || "").trim()] ||
      selectedPost.avatar ||
      avatar001
    }
    alt={selectedPost.author_name || selectedPost.author}
    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md cursor-pointer hover:scale-110 hover:ring-4 hover:ring-violet-200 transition-all duration-200"
    title="View Profile"
  />
</button>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
  <div className="font-semibold text-slate-900">
    {selectedPost.author_name || selectedPost.author}
  </div>

  {selectedPost.user_id &&
    VERIFIED_USERS[selectedPost.user_id] && (
      <img
        src={VERIFIED_USERS[selectedPost.user_id].badge}
        alt={VERIFIED_USERS[selectedPost.user_id].label}
        title={VERIFIED_USERS[selectedPost.user_id].label}
        className="w-5 h-5 object-contain flex-shrink-0"
      />
    )}
</div>

      <h3 className="mt-1 text-lg font-bold text-slate-900">
        {selectedPost.title}
      </h3>
    </div>
  </div>

  {/* Content */}
  <p className="mt-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
    {selectedPost.caption || selectedPost.content}
  </p>

  {Array.isArray(selectedPost?.attached_cards) &&
  selectedPost.attached_cards.length > 0 && (
    <div className="mt-5">
      <div className="grid grid-cols-5 gap-3">
        {selectedPost.attached_cards.map(
          (card: any, index: number) => (
            <button
              key={`${card.set_id}-${card.card_key}-${index}`}
              type="button"
              onClick={() => {
                setZoomedCard(
                  getTradeCardImage(card)
                );
                setZoomedCardTitle(
                  card.card_key
                );
              }}
              className="flex-shrink-0 transition-transform hover:scale-105"
            >
              <img
                src={getTradeCardImage(card)}
                alt={card.card_key}
                className={`relative ${
  isMoon3DoubleWide(card)
    ? "col-span-2 aspect-[10/7]"
    : "aspect-[5/7]"
}`}
              />
            </button>
          )
        )}
      </div>
    </div>
)}

  {/* Actions */}
  <div className="mt-5 pt-4 border-t border-slate-100">
    <div className="flex items-center gap-6">
      {/* Like */}
      <button
        onClick={() => toggleLike(String(selectedPost.id))}
        className={`flex items-center gap-2 text-sm font-medium transition-colors ${
          likedPosts.includes(String(selectedPost.id))
            ? "text-rose-500"
            : "text-slate-500 hover:text-rose-500"
        }`}
      >
        <Heart
          className="w-4 h-4"
          fill={
            likedPosts.includes(String(selectedPost.id))
              ? "currentColor"
              : "none"
          }
        />
        <span>{likeCounts[String(selectedPost.id)] || 0}</span>
      </button>

      {/* Repost */}
      {selectedPost.id !== "welcome-post" && (
        <>
          <button
            onClick={() => toggleRepost(String(selectedPost.id))}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              repostedPosts.includes(String(selectedPost.id))
                ? "text-violet-600"
                : "text-slate-500 hover:text-violet-600"
            }`}
          >
            <Repeat2 className="w-4 h-4" />
            <span>{repostCounts[String(selectedPost.id)] || 0}</span>
          </button>

          {/* Comment Count */}
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <MessageCircle className="w-4 h-4" />
            <span>{commentCounts[String(selectedPost.id)] || 0}</span>
          </div>
        </>
      )}
    </div>
  </div>
</div>

      {/* Existing Comments */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No comments yet.
          </p>
        ) : (
comments.map((comment) => (
  <div
    key={comment.id}
    className="rounded-2xl border border-slate-200 bg-white p-4"
  >
    <div className="flex items-start gap-3">
      <img
        src={
  avatarMap[String(comment.author_avatar || "").trim()] ||
  avatar001
}
        alt={comment.author_name}
        className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
      />

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
  <div className="font-semibold text-slate-900">
    {comment.author_name}
  </div>

  {comment.user_id &&
    VERIFIED_USERS[comment.user_id] && (
      <img
        src={VERIFIED_USERS[comment.user_id].badge}
        alt={VERIFIED_USERS[comment.user_id].label}
        title={VERIFIED_USERS[comment.user_id].label}
        className="w-5 h-5 object-contain flex-shrink-0"
      />
    )}
</div>

          

{(
  comment.user_id === currentUser?.id ||
  [
    "17e57e39-bc0c-44e7-b373-ac34c6690185",
    "94a1c998-d040-4dd2-b2fb-5f606287139d",
    "408a516c-ee80-4ff8-a869-493e1fd5d961",
  ].includes(currentUser?.id)
) && (
  <button
    onClick={() => {
      setPostToDelete({
        ...comment,
        isComment: true,
      });
      setShowDeleteModal(true);
    }}
    className="relative z-20 text-xs font-semibold text-rose-500 hover:text-rose-600"
  >
    Delete
  </button>
)}
        </div>

        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  </div>
))
        )}
      </div>

      {/* Add Comment */}
      <div className="space-y-4">
        <textarea
          rows={4}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex justify-end">
          <button
            onClick={submitComment}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6F4BA1] to-[#7B56AE] hover:from-[#5F3E8C] hover:to-[#6B489B] text-white font-bold shadow-lg"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
)}

{showCardPickerModal && (
  <div className="fixed inset-0 z-[250000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
    <div className="w-full max-w-6xl rounded-[2rem] bg-white shadow-2xl border border-white/60 p-6 max-h-[90vh] overflow-hidden">
      <div className="h-full max-h-[calc(90vh-3rem)] overflow-y-auto pr-2">     
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">
          Choose Cards
        </h2>

        <button
          type="button"
          onClick={() => setShowCardPickerModal(false)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
        >
          ✕
        </button>
      </div>

      {/* Step 1: Sets */}
      {!cardPickerSet && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CARD_PICKER_SETS.map((set) => (
            <button
              key={set.id}
              type="button"
              onClick={() => setCardPickerSet(set.id)}
              className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-300 px-4 py-4 text-left font-semibold text-slate-700 transition-colors"
            >
              {set.name}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Rarities */}
      {cardPickerSet && !cardPickerRarity && (
        <>
          <button
            type="button"
            onClick={() => setCardPickerSet(null)}
            className="mb-4 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            ← Back to Sets
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(CARD_PICKER_RARITIES[cardPickerSet] || []).map((rarity) => (
  <button
    key={rarity}
    type="button"
    onClick={() => setCardPickerRarity(rarity)}
    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
      cardPickerRarity === rarity
        ? "bg-violet-600 text-white"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`}
  >
    {rarity === "SHINING ZR"
      ? "◇ZR"
      : rarity === "SZR"
      ? "◇ZR"
      : rarity === "SN"
      ? "◇N"
      : rarity === "SCR"
      ? "◇CR"
      : rarity}
  </button>
))}
          </div>
        </>
      )}

      {/* Step 3: Cards */}
      {cardPickerSet && cardPickerRarity && (
        <>
          <button
            type="button"
            onClick={() => setCardPickerRarity(null)}
            className="mb-4 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            ← Back to Rarities
          </button>

          <div className="mb-4 text-sm font-semibold text-slate-500">
            {selectedCards.length} / 10 selected
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 auto-rows-fr">
            {getCardsForPicker(cardPickerSet, cardPickerRarity).map((card) => {
              const isSelected = selectedCards.some(
                (c) =>
                  c.set_id === card.set_id &&
                  c.card_key === card.card_key
              );

              return (
                <button
                  key={`${card.set_id}-${card.card_key}`}
                  type="button"
                  onClick={() => toggleSelectedCard(card)}
                  className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
                    isSelected
  ? "border-violet-500 shadow-lg"
  : "border-transparent hover:border-violet-200"
                  }`}
                >
                  <img
  src={getTradeCardImage(card)}
  alt={card.card_key}
  className={`relative ${
  isMoon3DoubleWide(card)
    ? "col-span-2 aspect-[10/7]"
    : "aspect-[5/7]"
}`}
/>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold shadow">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  </div>
        </div>
)}

{showDeleteModal && postToDelete && (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60">
    <div className="relative z-[1000000] bg-white rounded-2xl p-6 shadow-2xl">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-rose-100 flex items-center justify-center text-3xl">
          🗑️
        </div>

        <h2 className="text-2xl font-black text-slate-900">
          {postToDelete.isComment ? "Delete Comment?" : "Delete Post?"}
        </h2>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {postToDelete.isComment
            ? "This comment will be permanently removed. This action cannot be undone."
            : "This will permanently remove this post, along with all comments, likes, and reposts. This action cannot be undone."}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setPostToDelete(null);
            }}
            className="flex-1 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              if (postToDelete.isComment) {
                const { error } = await supabase
                  .from("forum_comments")
                  .delete()
                  .eq("id", postToDelete.id);

                if (error) {
                  alert(error.message);
                  return;
                }

                setComments((prev) =>
                  prev.filter((c) => c.id !== postToDelete.id)
                );

                if (selectedPost) {
                  setCommentCounts((prev) => ({
                    ...prev,
                    [String(selectedPost.id)]: Math.max(
                      (prev[String(selectedPost.id)] || 1) - 1,
                      0
                    ),
                  }));
                }
              } else {
                const { error } = await supabase
                  .from("forum_posts")
                  .delete()
                  .eq("id", postToDelete.id);

                if (error) {
                  alert(error.message);
                  return;
                }

                setPosts((prev) =>
                  prev.filter((p) => p.id !== postToDelete.id)
                );

                setShowCommentsModal(false);
              }

              setShowDeleteModal(false);
              setPostToDelete(null);
            }}
            className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-bold shadow-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{/* User Profile Modal */}
{showUserModal && selectedUser && (
  <div className="fixed inset-0 z-[30000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
    <div className="w-full max-w-2xl h-[85vh] rounded-[2.5rem] border border-white/60 bg-white shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {selectedUser.username}
        </h2>

        <button
          onClick={() => setShowUserModal(false)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto sm:mx-0">
            <img
              src={
  avatarMap[String(selectedUser.avatar_url || "").trim()] ||
  avatar001
}
              alt={selectedUser.username}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-center justify-center gap-2">
  <h2 className="text-2xl font-bold text-slate-900">
    {selectedUser?.username}
  </h2>

  {selectedUser?.id &&
    VERIFIED_USERS[selectedUser.id] && (
      <img
        src={VERIFIED_USERS[selectedUser.id].badge}
        alt={VERIFIED_USERS[selectedUser.id].label}
        title={VERIFIED_USERS[selectedUser.id].label}
        className="w-5 h-5 object-contain flex-shrink-0"
      />
    )}
</div>

{selectedUserRank && (
  <p className="mt-1 text-sm font-bold text-amber-600 text-center sm:text-left">
    #{selectedUserRank} Top Collector
  </p>
)}

<p className="mt-1 text-sm text-slate-500 text-center sm:text-left">
  {selectedUserTradingProfile?.discord_username ||
    "No Discord username set"}
</p>

            <div className="grid grid-cols-3 gap-4 mt-5 text-center">
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {selectedUserStats.trades.toLocaleString()}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trades
                </div>
              </div>
              

              <div>
                <div className="text-2xl font-black text-slate-900">
                  {selectedUserStats.owned.toLocaleString()}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cards Owned
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900">
                  {selectedUserStats.completed.toLocaleString()}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sets Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
<div
  className="grid border-b border-slate-200"
style={{
  gridTemplateColumns: `repeat(${
    (selectedUserPurchaseCards.length > 0 ? 1 : 0) +
    (
      !selectedUserProfileSettings.hide_wishlist &&
      selectedUserWishlistCards.length > 0
        ? 1
        : 0
    ) +
    (!selectedUserProfileSettings.hide_iso ? 1 : 0) +
    1
  }, minmax(0, 1fr))`,
}}
>
  {/* ISO */}
  {!selectedUserProfileSettings.hide_iso && (
    <button
      onClick={() => setSelectedUserTab("iso")}
      className={`py-4 flex items-center justify-center transition-colors ${
        selectedUserTab === "iso"
          ? "border-b-2 border-[#5a3e84] text-[#5a3e84]"
          : "text-slate-400 hover:text-[#5a3e84]"
      }`}
    >
      <Search className="w-5 h-5" />
    </button>
  )}

  {/* Wishlist */}
  {!selectedUserProfileSettings.hide_wishlist &&
selectedUserWishlistCards.length > 0 && (
    <button
      onClick={() => setSelectedUserTab("wishlist")}
      className={`py-4 flex items-center justify-center transition-colors ${
        selectedUserTab === "wishlist"
          ? "border-b-2 border-[#5a3e84] text-pink-500"
          : "text-slate-400 hover:text-pink-500"
      }`}
    >
      <Heart className="w-5 h-5 fill-current" />
    </button>
  )}

{/* Purchases */}
{selectedUserPurchaseCards.length > 0 && (
  <button
    onClick={() => setSelectedUserTab("purchases")}
    className={`py-4 flex items-center justify-center transition-colors ${
      selectedUserTab === "purchases"
        ? "border-b-2 border-[#5a3e84] text-blue-500"
        : "text-slate-400 hover:text-blue-500"
    }`}
  >
    <span className="text-xl font-black">$</span>
  </button>
)}

  {/* Trades */}
  <button
    onClick={() => setSelectedUserTab("trades")}
    className={`py-4 flex items-center justify-center transition-colors ${
      selectedUserTab === "trades"
        ? "border-b-2 border-[#5a3e84] text-[#5a3e84]"
        : "text-slate-400 hover:text-[#5a3e84]"
    }`}
  >
    <ArrowLeftRight className="w-5 h-5" />
  </button>
</div>



{/* Tab Content */}
<div
  className="bg-white min-h-[800px]"
  style={{ scrollbarGutter: "stable" }}
>
  {(() => {
const cards =
  selectedUserTab === "trades"
    ? selectedUserTradeCards
    : selectedUserTab === "purchases"
    ? selectedUserPurchaseCards
    : selectedUserTab === "wishlist"
    ? [...selectedUserWishlistCards]
    : selectedUserIsoCards;

if (selectedUserTab === "wishlist") {
  return (
    <div
  className="pt-6 grid grid-cols-4 gap-2 sm:gap-3"
  style={{ scrollbarGutter: "stable" }}
>
      {cards.map((card) => (
        <button
          key={card.id || `${card.set_id}-${card.card_key}`}
          type="button"
          onClick={() => {
            setZoomedCard(getTradeCardImage(card));
            setZoomedCardTitle(
              `${getSetName(card.set_id)} • ${card.card_key}`
            );
          }}
          className="group relative"
        >
          <img
            src={getTradeCardImage(card)}
            alt={card.card_key}
            className={`relative ${
  isMoon3DoubleWide(card)
    ? "col-span-2 aspect-[10/7]"
    : "aspect-[5/7]"
}`}
          />
        </button>
      ))}
    </div>
  );
}

    const grouped = groupCardsBySet(cards);

    return (
      <div className="space-y-8 p-6">
        {Object.entries(grouped).map(([setId, setCards]) => (
          <div key={setId}>
            {/* Set Header */}
<button
  type="button"
  onClick={() =>
    setCollapsedSets((prev) => ({
      ...prev,
      [setId]: !prev[setId],
    }))
  }
  className="w-full flex items-center justify-center gap-3 mb-4 group"
>
  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />

  <span className="text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase group-hover:text-[#6f4ba1] transition-colors">
    {collapsedSets[setId] ? "▸ " : "▾ "}
    {getSetName(setId)}
  </span>

  <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />
</button>

            {/* Card Grid */}
            {!collapsedSets[setId] && (
  <div className="grid grid-cols-5 gap-[1px]">
              {setCards.map((card: any, index: number) => (
                <div
  key={card.id || index}
  className={`${
  isMoon3DoubleWide(card)
    ? "col-span-2 aspect-[10/7]"
    : "aspect-[5/7]"
} bg-white overflow-hidden cursor-pointer`}
  onClick={() => {
    const imageSrc = getTradeCardImage(card);
    if (!imageSrc) return;

    setZoomedCard(imageSrc);
    setZoomedCardTitle(card.card_key);
  }}
>
                  <img
                    src={getTradeCardImage(card)}
                    alt={card.card_key}
                    className={`w-full h-full bg-white ${
                      String(card.set_id) === "FW" ||
                      String(card.set_id) === "SD" ||
                      String(card.set_id) === "friendshipsbegin"
                        ? "object-contain p-1"
                        : "object-cover"
                    }`}
                  />
                </div>
              ))}
            </div>
            )}
          </div>
        ))}
      </div>
    );
  })()}
</div>
      </div>
    </div>
  </div>
)}
{/* Card Zoom Modal */}
{zoomedCard && (
  <div
    className="fixed inset-0 z-[99999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => {
      setZoomedCard(null);
      setZoomedCardTitle("");
    }}
  >
    <img
      src={zoomedCard}
      alt={zoomedCardTitle}
      className="max-h-[88vh] max-w-[92vw] sm:max-w-[32vw] rounded-2xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}
</div>
  );
}
import KayouHeader from "@/components/KayouHeader";
import Moon3Poster from "@/assets/avatars/Moon3Poster.png";
import FunMoments3Poster from "@/assets/avatars/FunMoments3Poster.png";
import Star1Poster from "@/assets/avatars/Star1poster.png";
import tcgAppBanner from "@/assets/website-assets/tcgapp.png";
const minisoPoster = "/website-assets/minisocollab.jpg";
const minisoLogo = "/website-assets/minisologo.jpg";
const minisoPoster2 = "/website-assets/minisocollab2.png";
const minisoPoster3 = "/website-assets/minisocollab3.jpg";
const rainbow2Poster = "/website-assets/rainbow2post.jpg";
import { supabase } from "@/lib/supabase";
import heroFront from "/friendships-begin/SD01PRR01.png";
import heroMiddle from "/cards/third-edition-moon/M3ZR003.jpg";
import heroBack from "/cards/rainbow-one/R1XR004.jpg";
import { calculateCollectionTotal } from "@/lib/CalculateCollectionTotal";

import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.png";

import {
  BookOpen,
  Trophy,
  ArrowLeftRight,
  Gift,
  Star,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import verifiedBadge from "/website-assets/goldenverifiedbadge.png";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.png";
import elementOfLaughter from "/website-assets/elementoflaughter.png";

const VERIFIED_USERS = {
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
  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
      "2e62bcda-f311-42a1-bf32-cfe74a43d3ef": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  },
  "325585dd-c617-4dd2-8314-d608273cd5f6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
};

const Index = () => {
  const navigate = useNavigate();

  const images = [
    Moon3Poster,
    FunMoments3Poster,
    Star1Poster,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [minisoSlide, setMinisoSlide] = useState(0);

  const [stats, setStats] = useState({
  owned: 0,
  completed: 0,
  trades: 0
});

const [activeGiveaway, setActiveGiveaway] = useState<string | null>(null);
const [topCollector, setTopCollector] = useState<{
  id: string;
  username: string;
  total: number;
} | null>(null);

const toggleLike = async (postId: string) => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) {
    navigate("/auth");
    return;
  }

  const isLiked = likedPosts[postId];

  if (isLiked) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: false,
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 1) - 1, 0),
    }));
  } else {
    await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: true,
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  }
};

const loadComments = async () => {
  // Load all comments
  const { data: commentRows, error: commentsError } = await supabase
    .from("post_comments")
    .select(`
      id,
      post_id,
      comment,
      created_at,
      user_id
    `)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("Error loading comments:", commentsError);
    return;
  }

  // Collect unique user IDs
  const userIds = [
    ...new Set(
      (commentRows || [])
        .map((row: any) => row.user_id)
        .filter(Boolean)
    ),
  ];

  // Load usernames from profiles
  const profileMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error loading profiles:", profilesError);
    } else {
      profiles?.forEach((profile: any) => {
        profileMap[profile.id] = profile.username || "Anonymous";
      });
    }
  }

  // Group comments by post_id and attach usernames
  const grouped: Record<string, any[]> = {};

  (commentRows || []).forEach((row: any) => {
    if (!grouped[row.post_id]) {
      grouped[row.post_id] = [];
    }

    grouped[row.post_id].push({
      ...row,
      profiles: {
        username: profileMap[row.user_id] || "Anonymous",
      },
    });
  });

  setComments(grouped);
};

const submitComment = async (postId: string) => {
  const text = (commentInputs[postId] || "").trim();

  if (!text) return;

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) {
    navigate("/auth");
    return;
  }

  const { error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,   // text column, so "star1" is valid
      user_id: user.id,
      comment: text,
    });

  if (error) {
    console.error("Error posting comment:", error);
    alert(error.message);
    return;
  }

  // Clear the input box
  setCommentInputs((prev) => ({
    ...prev,
    [postId]: "",
  }));

  // Reload comments so the new one appears immediately
  await loadComments();
};


const openComments = (post: any) => {
  setSelectedPost(post);
  setShowCommentsModal(true);
};

useEffect(() => {
  const loadLikes = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    // Load all likes to calculate public counts
    const { data: allLikes, error } = await supabase
      .from("post_likes")
      .select("post_id, user_id");

    if (error) {
      console.error("Error loading likes:", error);
      return;
    }

    const counts: Record<string, number> = {};
    const liked: Record<string, boolean> = {};

    allLikes?.forEach((row: any) => {
      counts[row.post_id] = (counts[row.post_id] || 0) + 1;

      // Mark posts liked by the current user
      if (user && row.user_id === user.id) {
        liked[row.post_id] = true;
      }
    });

    setLikeCounts(counts);
    setLikedPosts(liked);
  };

  loadLikes();
  loadComments();
}, []);

  const intervalRef = useRef(null);

  useEffect(() => {

    if (hasInteracted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }


    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);


    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasInteracted, images.length]);

useEffect(() => {
  const loadStats = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }

    if (!user) {
      setStats({
        owned: 0,
        completed: 0,
        trades: 0
      });
      return;
    }

    const { data: progress } = await supabase
      .from("collection_progress")
      .select("*")
      .eq("user_id", user.id);

    let ownedCount = 0;
    let completedCount = 0;

    const progressMap = new Map(
      (progress || []).map((row: any) => [String(row.set_id), row])
    );

    const sets = [
      { id: "9", rarities: { PR: 5 } },
      { id: "1", rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 }},
      { id: "5", rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 }},
      { id: "7", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 }},
      { id: "2", rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 }},
      { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, "SZR":1 }},
      { id: "11", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR: 9, CR:12, SCR: 12 }},
      { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 }},
      { id: "10", rarities: { LC: 1 } }
    ];

    sets.forEach((set) => {
      const found = progressMap.get(set.id);

      if (!found?.progress || !set.rarities) return;

      let owned = 0;
      let total = 0;

      Object.entries(set.rarities).forEach(([rarity, count]) => {
        total += count;

        for (let i = 1; i <= count; i++) {
          const key = `${rarity}-${i}`;
          if (found.progress[key]) owned++;
        }
      });

      ownedCount += owned;

      // skip promo and limited
      if (set.id === "9" || set.id === "10") return;

      if (total > 0 && owned === total) {
        completedCount++;
      }
    });
    
    const { data: sdProgress } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "SD"); // THIS LINE PREVENTS DOUBLE COUNTING

const mergedSD: Record<string, boolean> = {};

(sdProgress || []).forEach((row: any) => {
  Object.entries(row.progress || {}).forEach(([k, v]) => {
    if (v === true) mergedSD[k] = true;
  });
});

const owned = Object.keys(mergedSD).filter(key => {
  const raw = key.replace("STARTER-", "").replace("BONUS-", "");
  return raw.startsWith("SD01");
}).length;

ownedCount += owned;

const { data: fwProgress } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "FW");

  const { data: tcgPromos } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "tcgpromos");

const tcgRow = tcgPromos?.[0];

if (tcgRow) {
  const owned = Object.values(tcgRow.progress || {}).filter(Boolean).length;
  ownedCount += owned;
}

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
        return [1,2,3,5,7,8,9,12,13,18,21].map(n =>
          `BP01PSPR${String(n).padStart(2, "0")}`
        );
      }

      return Array.from({ length: count }, (_, i) =>
        `${prefix}${String(i + 1).padStart(2, "0")}`
      );
    })
  );

  const owned = Object.entries(fwRow.progress || {}).filter(
    ([key, val]) => val && validKeys.has(key)
  ).length;

  ownedCount += owned;
}
    
    const { data: trades } = await supabase
      .from("for_trade")
      .select("id")
      .eq("user_id", user.id);

    setStats({
      owned: ownedCount,
      completed: completedCount,
      trades: trades?.length || 0
    });
  };

  loadStats();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    loadStats(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  const loadTopCollector = async () => {
    const { data: progress } = await supabase
      .from("collection_progress_raw")
      .select("*");

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username");

    const profileMap: Record<string, string> = {};
    profiles?.forEach((p: any) => {
      profileMap[p.id] = p.username;
    });

    // Get all unique user IDs
    const userIds = [...new Set((progress || []).map((row: any) => row.user_id))];

    // Calculate totals using the shared helper
    const totals = userIds.map((userId: string) => ({
  id: userId,
  username: profileMap[userId] || "Anonymous",
  total: calculateCollectionTotal(userId, progress || []),
}));

    const sorted = totals
      .filter((user) => user.username !== "HeiManTou (Chinese Collector)")
      .sort((a, b) => b.total - a.total);

    setTopCollector(sorted[0] || null);
  };

  loadTopCollector();
}, []);
  
  return (
  <div
  className="min-h-screen relative overflow-hidden"
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

<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
  {/* Desktop sparkles only */}
  <div className="hidden lg:block absolute top-40 left-24 text-pink-400/70 text-5xl">✦</div>
  <div className="hidden lg:block absolute top-52 right-32 text-yellow-300/70 text-4xl">✧</div>
  <div className="hidden lg:block absolute top-[420px] left-1/3 text-purple-300/60 text-6xl">✦</div>
  <div className="hidden lg:block absolute top-[300px] right-24 text-pink-300/50 text-5xl">✦</div>
  <div className="hidden lg:block absolute bottom-48 right-1/4 text-purple-300/40 text-7xl">❦</div>

  {/* Mobile-only sparkles spread from top to bottom */}
  <div className="lg:hidden absolute top-8 left-4 text-yellow-300/60 text-3xl">✦</div>
  <div className="lg:hidden absolute top-24 right-6 text-pink-300/60 text-4xl">✧</div>
  <div className="lg:hidden absolute top-56 left-8 text-purple-300/50 text-3xl">✦</div>
  <div className="lg:hidden absolute top-[420px] right-4 text-yellow-200/60 text-4xl">✦</div>
  <div className="lg:hidden absolute top-[620px] left-6 text-pink-300/50 text-3xl">✧</div>
  <div className="lg:hidden absolute top-[850px] right-8 text-purple-300/50 text-5xl">✦</div>
  <div className="lg:hidden absolute top-[1100px] left-4 text-yellow-200/50 text-4xl">✦</div>
  <div className="lg:hidden absolute top-[1450px] right-6 text-pink-300/50 text-3xl">✧</div>
  <div className="lg:hidden absolute top-[1800px] left-8 text-purple-300/40 text-5xl">❦</div>
  <div className="lg:hidden absolute top-[2200px] right-4 text-yellow-200/50 text-4xl">✦</div>
  <div className="lg:hidden absolute bottom-24 left-6 text-pink-300/50 text-4xl">✦</div>
  <div className="lg:hidden absolute bottom-8 right-8 text-purple-300/40 text-5xl">❦</div>
</div>

    <div className="relative z-10 container max-w-7xl mx-auto px-6 py-10 min-[1024px]:max-[1439px]:scale-90 min-[1024px]:max-[1439px]:origin-top">
      {/* HERO */}
      <section className="grid lg:grid-cols-2 gap-12 items-center mb-12">
        {/* LEFT SIDE */}
        <div className="text-center lg:text-left">
          {/* Badge */}
<div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 border border-purple-300 shadow-sm text-xs font-semibold tracking-wide text-[#8B5CC7] mb-6">
  <Star className="w-3.5 h-3.5 fill-current text-[#F4B942]" />
  <span>THE FIRST INTERACTIVE U.S. KAYOU MLP CHECKLIST</span>
  <Star className="w-3.5 h-3.5 fill-current text-[#F4B942]" />
</div>

          {/* Headline */}
<h1
  className="
    text-5xl sm:text-6xl lg:text-7xl
    font-bold
    leading-[0.95]
    tracking-[-0.02em]
    text-[#5B2E86]
    drop-shadow-[0_4px_18px_rgba(139,92,199,0.22)]
  "
  style={{
    fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
  }}
>
  <span className="block">Your collection</span>
  <span className="block text-[#6B3FA2]">anytime,</span>
  <span className="block relative">
    anywhere.
    <span className="absolute -top-4 -right-6 text-3xl sm:text-4xl text-[#F4C84A] opacity-95">
      ✦
    </span>
  </span>
</h1>

          {/* Description */}
          <p className="mt-8 max-w-xl mx-auto lg:mx-0 text-lg text-[#5E467A] leading-relaxed">
            Track your progress, your inventory, and your place on the board.
            MLPEKAYOU is not owned or run by Kayou, but the owner is a partner of Kayou's US E-Commerce branch.
          </p>

          {/* Mobile Card Fan */}
<div className="lg:hidden mt-8 mb-8 flex justify-center">
  <img
    src="/website-assets/card design.png"
    alt="Kayou card fan"
    className="
      w-[420px]
      max-w-[115%]
      h-auto
      drop-shadow-[0_25px_60px_rgba(88,42,135,0.22)]
      select-none
      pointer-events-none
    "
  />
</div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
  onClick={() => navigate("/inventory")}
  className="
    px-8 py-4 rounded-2xl
    bg-gradient-to-r from-[#7C4BB8] to-[#9C6ADE]
    text-white font-semibold
    shadow-lg hover:shadow-xl hover:scale-[1.02]
    transition
    relative overflow-hidden

    border border-[#D8B45A]

    before:content-['']
    before:absolute
    before:inset-[3px]
    before:rounded-[14px]
    before:border
    before:border-[#F8E38C]
    before:shadow-[inset_0_0_0_1px_rgba(255,245,180,0.35)]
    before:pointer-events-none
  "
>
  View Your Collection
</button>

            <button
  onClick={() => navigate("/leaderboard")}
  className="
    px-8 py-4 rounded-2xl
    bg-white/90
    text-[#6A3F9D] font-semibold
    shadow-sm hover:shadow-md
    transition
    relative overflow-hidden

    border border-[#D8B45A]

    before:content-['']
    before:absolute
    before:inset-[3px]
    before:rounded-[14px]
    before:border
    before:border-[#F8E38C]
    before:shadow-[inset_0_0_0_1px_rgba(255,245,180,0.35)]
    before:pointer-events-none
  "
>
  Top Kayou US Collectors
</button>
<button
  onClick={() => navigate("/faq")}
  className="
    px-8 py-4 rounded-2xl
    bg-white/90
    text-[#6A3F9D] font-semibold
    shadow-sm hover:shadow-md
    transition
    relative overflow-hidden
    border border-[#D8B45A]

    before:content-['']
    before:absolute
    before:inset-[3px]
    before:rounded-[14px]
    before:border
    before:border-[#F8E38C]
    before:shadow-[inset_0_0_0_1px_rgba(255,245,180,0.35)]
    before:pointer-events-none
  "
>
  MLPEKAYOU TUTORIAL
</button>
          </div>
        </div>

{/* RIGHT SIDE - CARD FAN */}
<div className="hidden lg:flex relative h-[500px] items-center justify-end pr-8">
  {/* Magical glow behind the fan */}
  <div
    className="
      absolute
      w-[320px] h-[320px]
      sm:w-[480px] sm:h-[480px]
      lg:w-[620px] lg:h-[620px]
      rounded-full
      blur-3xl
      opacity-75
      bg-[radial-gradient(circle,_rgba(255,214,102,0.28)_0%,_rgba(196,140,255,0.22)_30%,_rgba(124,75,184,0.12)_55%,_transparent_75%)]
      lg:-translate-x-8
    "
  />

  {/* Pre-made card fan image */}
  <img
    src="/website-assets/card design.png"
    alt="Kayou card fan"
className="
  relative
  z-10
  w-[min(760px,48vw)]
  h-auto
  max-w-full
  translate-y-2
  sm:translate-y-4
  lg:translate-y-4
  lg:translate-x-0
  xl:translate-x-12
  2xl:translate-x-24
  drop-shadow-[0_35px_90px_rgba(88,42,135,0.28)]
  select-none
  pointer-events-none
"
  />
</div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Cards Owned */}
        <div className="rounded-[28px]
bg-gradient-to-br from-[#6B3FA2] via-[#7D4BB8] to-[#925FD1]
text-white
p-6
shadow-[0_20px_50px_rgba(95,55,145,0.22)]
border border-[#D8B45A]
relative overflow-hidden
before:content-['']
before:absolute
before:inset-[4px]
before:rounded-[24px]
before:border
before:border-[#F8E38C]/60
before:pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-[#F8E38C]" />
            <span className="text-sm uppercase tracking-wide font-semibold opacity-90">
              total cards owned
            </span>
          </div>
          <div className="text-4xl font-bold">
            {stats.owned.toLocaleString()}
          </div>
        </div>

        {/* Sets Completed */}
        <div className="rounded-[28px]
bg-gradient-to-br from-[#6B3FA2] via-[#7D4BB8] to-[#925FD1]
text-white
p-6
shadow-[0_20px_50px_rgba(95,55,145,0.22)]
border border-[#D8B45A]
relative overflow-hidden
before:content-['']
before:absolute
before:inset-[4px]
before:rounded-[24px]
before:border
before:border-[#F8E38C]/60
before:pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-[#F8E38C]" />
            <span className="text-sm uppercase tracking-wide font-semibold opacity-90">
              Completed Sets
            </span>
          </div>
          <div className="text-4xl font-bold">{stats.completed}</div>
          <p className="text-xs mt-2 opacity-80">
            Promotional sets do not count.
          </p>
        </div>

        {/* Cards for Trade */}
        <div className="rounded-[28px]
bg-gradient-to-br from-[#6B3FA2] via-[#7D4BB8] to-[#925FD1]
text-white
p-6
shadow-[0_20px_50px_rgba(95,55,145,0.22)]
border border-[#D8B45A]
relative overflow-hidden
before:content-['']
before:absolute
before:inset-[4px]
before:rounded-[24px]
before:border
before:border-[#F8E38C]/60
before:pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <ArrowLeftRight className="w-6 h-6 text-[#F8E38C]" />
            <span className="text-sm uppercase tracking-wide font-semibold opacity-90">
              total for trade
            </span>
          </div>
          <div className="text-4xl font-bold">{stats.trades}</div>
        </div>

        {/* Top Collector */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FFF8D6] to-[#F8E9A8] border border-[#E8C76B] shadow-lg p-6 text-center">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#9A6B00] mb-2">
            #1 KayouUS mlp collector
          </div>

          <div
  className="flex items-center justify-center gap-2 text-4xl font-bold text-[#5B2E86]"
  style={{
    fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
  }}
>
  <span>{topCollector?.username}</span>

  {topCollector?.id &&
    VERIFIED_USERS[topCollector.id] && (
      <img
        src={VERIFIED_USERS[topCollector.id].badge}
        alt={VERIFIED_USERS[topCollector.id].label}
        title={VERIFIED_USERS[topCollector.id].label}
        className="w-8 h-8 object-contain flex-shrink-0"
      />
    )}
</div>

          <div className="mt-2 text-2xl font-semibold text-[#5B2E86]">
            {(topCollector?.total || 5284).toLocaleString()} cards
          </div>
        </div>
        {/* Mobile Social Icons */}
<div className="sm:hidden mt-8 flex items-center justify-center gap-6">
  <button
    onClick={() =>
      window.open("https://discord.gg/mlpekayou", "_blank")
    }
    className="
      inline-flex items-center justify-center
      w-14 h-14
      rounded-full
      bg-gradient-to-br from-[#7C4BB8] to-[#9C6ADE]
      border border-[#D8B45A]
      shadow-[0_10px_25px_rgba(88,42,135,0.25)]
      hover:scale-105
      transition
    "
  >
    <img
      src="/website-assets/discordlogo.png"
      alt="Discord"
      className="h-8 w-auto"
    />
  </button>

  <button
    onClick={() =>
      window.open("https://www.tiktok.com/@keanaex?_r=1&_t=ZP-96Ea5WXQqic", "_blank")
    }
    className="
      inline-flex items-center justify-center
      w-14 h-14
      rounded-full
      bg-gradient-to-br from-[#7C4BB8] to-[#9C6ADE]
      border border-[#D8B45A]
      shadow-[0_10px_25px_rgba(88,42,135,0.25)]
      hover:scale-105
      transition
    "
  >
    <img
      src="/website-assets/tiktoklogo.png"
      alt="TikTok"
      className="h-10 w-auto"
    />
  </button>
</div>
      </section>

      {/* MOBILE LIKE NOTICE */}
<div className="sm:hidden mb-6">
  <div
    className="
      rounded-3xl
      bg-white/85
      backdrop-blur-sm
      border border-purple-200
      shadow-[0_12px_30px_rgba(95,55,145,0.10)]
      px-5 py-4
      text-center
    "
  >

    <p className="text-sm font-semibold text-[#5B2E86]">
      The like buttons below are fully functional!
    </p>

    <p className="mt-1 text-xs leading-relaxed text-[#8B6BAA]">
      Tap the heart to leave a real like that is saved and visible to everyone.
    </p>
  </div>
</div>

{/* MOBILE INSTAGRAM-STYLE POSTS */}
<section className="sm:hidden mt-12 space-y-8">
  {[
    {
  id: "miniso2",
  image: minisoPoster3,
  username: "MINISO x MLPEKAYOU",
  caption:
    "Another Miniso x MLPEKayou partnership has arisen! You can find these adorable plushies in Keegan's TikTok Shop Showcase for $45.99 each. (I know they look small here, but they are ridiculously big.)",
},
{
  id: "miniso",
  image: minisoPoster,
  images: [minisoPoster, minisoPoster2],
  username: "MINISO x MLPEKAYOU",
  caption:
    "MLPEKayou has now partnered with Miniso on TikTok! These adorable sleeping figures are currently 50% off if bought through TikTok Shop! Also, face reveal! Hi, I'm Keegan!",
},
{
  id: "rainbow2",
  image: rainbow2Poster,
  username: "KAYOU US x MLPEKAYOU",
  caption:
    "Rainbow Edition Two is coming to the U.S, complete with a U.S. exclusive promotional card. This set will be uploaded once it is obtained from KayouUS.",
},
{
  id: "star1",
  image: Star1Poster,
  username: "KAYOU US x MLPEKAYOU",
  caption:
    "Star Edition One is now available at CrossingTCG, and for preorder in Kayou US's TikTok shop. This set's box price is $127.84.",
},
    {
  id: "moon3",
  image: Moon3Poster,
      username: "KAYOU US x MLPEKAYOU",
      caption:
        "Third Edition Moon comes as a combination of Chinese Moon 9 and 10, featuring gorgeous SC and ZR designs. This box is available from CrossingTCG, or for preorder from Kayou US TikTok shop for $47.88.",
    },
    {
  id: "funmoments3",
  image: FunMoments3Poster,
      username: "KAYOU US x MLPEKAYOU",
      caption:
        "Fun Moments 3 features the highest hit rate of any Fun Moments set ever! The three box configurations guarantee that you will either recieve 3 UGR, 3 CR, or 3 ◇CR! This box retails at $39.80.",
    },
  ].map((post, index) => (
    <div
      key={index}
      className="
        bg-white/90
        backdrop-blur-sm
        rounded-3xl
        overflow-hidden
        border border-purple-200
        shadow-[0_20px_50px_rgba(95,55,145,0.12)]
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-yellow-300 p-[2px]">
  <img
src={post.id === "miniso" || post.id === "miniso2" ? minisoLogo : "/website-assets/KayouLogoPFP.png"}
    alt="MLPEKAYOU"
    className="w-full h-full rounded-full object-cover bg-white"
  />
</div>

        <div className="flex-1">
          <div className="font-semibold text-sm text-[#5B2E86]">
            {post.username}
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative">
  <img
    src={
      post.id === "miniso" && post.images
        ? post.images[minisoSlide]
        : post.image
    }
    alt={post.caption}
    className="w-full h-auto object-cover"
  />

  {post.id === "miniso" && minisoSlide === 0 && (
    <button
      onClick={() => setMinisoSlide(1)}
      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-2xl flex items-center justify-center"
    >
      ›
    </button>
  )}

  {post.id === "miniso" && minisoSlide === 1 && (
    <button
      onClick={() => setMinisoSlide(0)}
      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-2xl flex items-center justify-center"
    >
      ‹
    </button>
  )}
</div>

      {/* Actions */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Heart
  onClick={() => toggleLike(post.id)}
  className={`w-6 h-6 cursor-pointer transition ${
    likedPosts[post.id]
      ? "fill-[#E85AA8] text-[#E85AA8]"
      : "text-[#6B3FA2]"
  }`}
/>
            <button
  type="button"
  onClick={() => openComments(post)}
  className="flex items-center gap-1 text-[#6B3FA2] hover:text-[#5B2E86] transition"
>
  <MessageCircle className="w-6 h-6" />
  <span className="text-xs font-semibold">
    {(comments[post.id] || []).length}
  </span>
</button>
            <Send className="w-6 h-6 text-[#6B3FA2]" />
          </div>

          <Bookmark className="w-6 h-6 text-[#6B3FA2]" />
        </div>

        <div className="text-sm font-semibold text-[#5B2E86] mb-2">
          {(likeCounts[post.id] || 0).toLocaleString()} likes
        </div>

<p className="text-sm leading-relaxed text-[#5E467A]">
  <span className="font-semibold text-[#5B2E86] mr-2">
    {post.username}
  </span>
  {post.caption}
</p>

{/* COMMENTS */}
<div className="mt-3">
  <button
    type="button"
    onClick={() => openComments(post)}
    className="
      text-sm
      font-semibold
      text-[#8B5CC7]
      hover:text-[#6B3FA2]
      transition
    "
  >
    {(comments[post.id] || []).length === 0
      ? "View comments"
      : `View all ${(comments[post.id] || []).length} comments`}
  </button>
</div>

<div
  className={`mt-3 text-xs uppercase tracking-wide ${
    post.id === "miniso" || post.id === "miniso2" ||
    post.id === "fantasywonderland" ||
    post.id === "friendshipsbegin"
      ? "text-[#8B5CC7] font-semibold cursor-pointer hover:text-[#6B3FA2] transition"
      : "text-[#A78BCB]"
  }`}
  onClick={() => {
    if (post.id === "miniso") {
      window.open(
        "https://www.tiktok.com/@keanaex?_r=1&_t=ZP-96X7XS4ajT4",
        "_blank"
      );
        } else if (post.id === "miniso2") {
    window.open(
      "https://www.tiktok.com/t/ZP9Y4tWQwhu2F-SoaSI/",
      "_blank"
    );
    } else if (post.id === "funmoments3") {
  navigate("/fun-moments-three");
    } else if (post.id === "fantasywonderland") {
      navigate("/fantasy-wonderland");
    } else if (post.id === "friendshipsbegin") {
      navigate("/friendships-begin");
    }
  }}
>
  {post.id === "miniso" || post.id === "miniso2"
    ? "Find them in Keegan's TikTok Shop Showcase"
    : post.id === "moon3"
    ? "SET CHECKLIST DROPS 05/25"
    : post.id === "star1" || post.id === "rainbow2"
? "CHECKLIST COMING SOON"
: "VIEW SET CHECKLIST"}
</div>
      </div>
    </div>
  ))}
</section>

{/* DESKTOP FACEBOOK-STYLE LANDSCAPE POSTS */}
<section className="hidden sm:block mt-12">
  <div className="max-w-5xl mx-auto space-y-6">
    {[
      {
  id: "miniso2",
  image: minisoPoster3,
  username: "MINISO x MLPEKAYOU",
  caption:
    "Another Miniso x MLPEKayou partnership has arisen! You can find these adorable plushies in Keegan's TikTok Shop Showcase for $45.99 each. (I know they look small here, but they are ridiculously big.)",
},
      {
  id: "miniso",
  image: minisoPoster,
  images: [minisoPoster, minisoPoster2],
  username: "MINISO x MLPEKAYOU",
  caption:
    "Rainbow Edition Two is coming to the U.S, complete with a U.S. exclusive promotional card. This set will be uploaded once it is obtained from KayouUS.",
},
{
  id: "rainbow2",
  image: rainbow2Poster,
  username: "KAYOU US x MLPEKAYOU",
  caption:
    "Rainbow Edition Two is coming to the U.S, complete with a U.S. exclusive promotional card. This set will be uploaded once it is obtained from KayouUS.",
},
{
  id: "star1",
  image: Star1Poster,
  username: "KAYOU US x MLPEKAYOU",
  caption:
    "Star Edition One is now available at CrossingTCG, and for preorder in Kayou US's TikTok shop. This set's box price is $127.84.",
},
      {
        id: "moon3",
        image: Moon3Poster,
        username: "KAYOU US x MLPEKAYOU",
        caption:
          "Third Edition Moon comes as a combination of Chinese Moon 9 and 10, featuring gorgeous SC and ZR designs. This box is available from CrossingTCG, or for preorder from Kayou US TikTok shop for $47.88.",
      },
      {
        id: "funmoments3",
        image: FunMoments3Poster,
        username: "KAYOU US x MLPEKAYOU",
        caption:
          "Fun Moments 3 features the highest hit rate of any Fun Moments set ever! The three box configurations guarantee that you will either receive 3 UGR, 3 CR, or 3 ◇CR! This box retails at $39.80.",
      },
    ].map((post, index) => (
      <div
        key={index}
        className="
          bg-white/95
          backdrop-blur-sm
          rounded-3xl
          overflow-hidden
          border border-purple-200
          shadow-[0_12px_35px_rgba(95,55,145,0.08)]
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-purple-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-yellow-300 p-[2px]">
            <img
              src={post.id === "miniso" || post.id === "miniso2" ? minisoLogo : "/website-assets/KayouLogoPFP.png"}
              alt="MLPEKAYOU"
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </div>

          <div className="flex-1">
            <div className="font-semibold text-sm text-[#5B2E86]">
              {post.username}
            </div>
            <div className="text-xs text-[#A78BCB]">
              Just now · Public
            </div>
          </div>
        </div>

        {/* Landscape Body */}
        <div className="grid grid-cols-[320px_1fr]">
          {/* Left Image Panel */}
          <div className="bg-[#FAF6FF] p-5 flex items-center justify-center border-r border-purple-100">
            {post.id === "miniso" || post.id === "miniso2" && post.images ? (
  <div className="relative w-[260px] overflow-hidden">
    <div
      className="flex transition-transform duration-500 ease-in-out"
      style={{
        transform: `translateX(-${minisoSlide * 260}px)`,
      }}
    >
      {post.images.map((image, imageIndex) => (
        <div
          key={imageIndex}
          className="w-[260px] flex-shrink-0 flex items-center justify-center"
        >
          <img
            src={image}
            alt={post.caption}
            className="
              w-full
              h-auto
              rounded-2xl
              shadow-[0_15px_30px_rgba(95,55,145,0.10)]
            "
          />
        </div>
      ))}
    </div>

    {minisoSlide === 0 && (
      <button
        type="button"
        onClick={() => setMinisoSlide(1)}
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          w-10
          h-10
          rounded-full
          bg-black/50
          text-white
          text-2xl
          flex
          items-center
          justify-center
          hover:bg-black/65
          transition
        "
      >
        ›
      </button>
    )}

    {minisoSlide === 1 && (
      <button
        type="button"
        onClick={() => setMinisoSlide(0)}
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          w-10
          h-10
          rounded-full
          bg-black/50
          text-white
          text-2xl
          flex
          items-center
          justify-center
          hover:bg-black/65
          transition
        "
      >
        ‹
      </button>
    )}
  </div>
) : (
  <img
    src={post.image}
    alt={post.caption}
    className="
      w-full
      max-w-[260px]
      h-auto
      rounded-2xl
      shadow-[0_15px_30px_rgba(95,55,145,0.10)]
    "
  />
)}
          </div>

{/* Right Content Panel */}
<div className="p-6 flex flex-col">
  {/* Caption */}
  <p className="text-sm leading-7 text-[#5E467A] mb-5">
    <span className="font-semibold text-[#5B2E86] mr-2">
      {post.username}
    </span>
    {post.caption}
  </p>

  {/* Likes */}
  <div className="text-sm font-semibold text-[#5B2E86] mb-5">
    {(likeCounts[post.id] || 0).toLocaleString()} likes
  </div>

  {/* Actions */}
  <div className="flex items-center gap-4 mb-4">
    <Heart
      onClick={() => toggleLike(post.id)}
      className={`w-6 h-6 cursor-pointer transition ${
        likedPosts[post.id]
          ? "fill-[#E85AA8] text-[#E85AA8]"
          : "text-[#6B3FA2]"
      }`}
    />

    <button
      type="button"
      onClick={() => openComments(post)}
      className="flex items-center gap-1 text-[#6B3FA2] hover:text-[#5B2E86] transition"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="text-xs font-semibold">
        {(comments[post.id] || []).length}
      </span>
    </button>

    <Send className="w-6 h-6 text-[#6B3FA2]" />
    <Bookmark className="w-6 h-6 text-[#6B3FA2] ml-auto" />
  </div>

  {/* COMMENTS PREVIEW (fixed-height area) */}
<div className="space-y-3 mb-4 max-h-[88px] overflow-hidden">
    {(comments[post.id] || []).slice(0, 2).map((comment) => (
      <div
        key={comment.id}
        className="text-sm leading-relaxed text-[#5E467A]"
      >
        <span className="font-semibold text-[#5B2E86] mr-2">
          {comment.profiles?.username || "Anonymous"}
        </span>
        {comment.comment}
      </div>
    ))}

    {(comments[post.id] || []).length > 2 && (
      <button
        type="button"
        onClick={() => openComments(post)}
        className="text-sm font-semibold text-[#8B5CC7] hover:text-[#6B3FA2] transition"
      >
        View all {(comments[post.id] || []).length} comments
      </button>
    )}
  </div>

  {/* Footer Link - pinned to bottom */}
<div
  className={`mt-auto text-xs uppercase tracking-wide ${
    post.id === "miniso" ||
    post.id === "miniso2" ||
    post.id === "moon3" ||
    post.id === "funmoments3" ||
    post.id === "fantasywonderland" ||
    post.id === "friendshipsbegin"
      ? "text-[#8B5CC7] font-semibold cursor-pointer hover:text-[#6B3FA2] transition"
      : "text-[#A78BCB]"
  }`}
onClick={() => {
  if (post.id === "miniso") {
    window.open(
      "https://www.tiktok.com/t/ZP9YXfjP2mmMF-jaHiQ/",
      "_blank"
    );
  } else if (post.id === "miniso2") {
    window.open(
      "https://www.tiktok.com/t/ZP9Y4tWQwhu2F-SoaSI/",
      "_blank"
    );
  } else if (post.id === "moon3") {
    navigate("/eternal-moon-three");
  } else if (post.id === "funmoments3") {
    navigate("/fun-moments-three");
  } else if (post.id === "fantasywonderland") {
    navigate("/fantasy-wonderland");
  } else if (post.id === "friendshipsbegin") {
    navigate("/friendships-begin");
  }
}}
>
  {post.id === "miniso" || post.id === "miniso2"
    ? "Find them in Keegan's TikTok Shop Showcase"
    : post.id === "star1" || post.id === "rainbow2"
    ? "CHECKLIST COMING SOON"
    : "VIEW SET CHECKLIST"}
</div>
</div>
        </div>
      </div>
    ))}
  </div>
</section>

    </div>

  </div>
);
};

export default Index;
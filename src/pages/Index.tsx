import KayouHeader from "@/components/KayouHeader";
import Moon3Poster from "@/assets/avatars/Moon3Poster.png";
import FriendshipsBeginPoster from "@/assets/avatars/FriendshipsBeginPoster.png";
import FantasyWonderlandPoster from "@/assets/avatars/FantasyWonderlandPoster.png";
import FunMoments3Poster from "@/assets/avatars/FunMoments3Poster.png";
import Star1Poster from "@/assets/avatars/Star1poster.png";
import tcgAppBanner from "@/assets/website-assets/tcgapp.png";
import { supabase } from "@/lib/supabase";
import heroFront from "/friendships-begin/SD01PRR01.png";
import heroMiddle from "/cards/third-edition-moon/M3ZR003.jpg";
import heroBack from "/cards/rainbow-one/R1XR004.jpg";
import { calculateCollectionTotal } from "@/lib/CalculateCollectionTotal";

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

const Index = () => {
  const navigate = useNavigate();

  const images = [
    Moon3Poster,
    FriendshipsBeginPoster,
    FantasyWonderlandPoster,
    FunMoments3Poster,
    Star1Poster,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const [stats, setStats] = useState({
  owned: 0,
  completed: 0,
  trades: 0
});

const [activeGiveaway, setActiveGiveaway] = useState<string | null>(null);
const [topCollector, setTopCollector] = useState<{ username: string; total: number } | null>(null);

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

    <div className="relative z-10 container max-w-7xl mx-auto px-6 py-10">
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
  onClick={() => navigate("/my-trades")}
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
      w-[320px]
      sm:w-[520px]
      lg:w-[760px]
      max-w-full
      h-auto
      translate-y-2
      sm:translate-y-4
      lg:translate-y-4
      lg:translate-x-36
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
            className="text-4xl font-bold text-[#5B2E86]"
            style={{
              fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
            }}
          >
            {topCollector?.username || "Mari"}
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
    {
  id: "fantasywonderland",
  image: FantasyWonderlandPoster,
      username: "KAYOU US x MLPEKAYOU",
      caption:
        "Fantasy Wonderland has made its official US debut! You can find singles at Target, Barnes and Noble, or Gamestop. Full boxes can be purchased from CrossingTCG or Kayou US's TikTok shop for $59.80.",
    },
    {
  id: "friendshipsbegin",
  image: FriendshipsBeginPoster,
      username: "KAYOU US x MLPEKAYOU",
      caption:
        "Friendships Begins celebrates the six main characters with their own starer decks and paper playmat, with a touch of magic in the three bonus packs. You are guaranteed one hit from the bonus packs in every box! Boxes can be found at Target, Gamestop, Kayou US, or CrossingTCG for $20 each.",
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
    src="/website-assets/KayouLogoPFP.png"
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
      <img
        src={post.image}
        alt={post.caption}
        className="w-full h-auto object-cover"
      />

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
            <MessageCircle className="w-6 h-6 text-[#6B3FA2]" />
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

        <div
  className={`mt-3 text-xs uppercase tracking-wide ${
    post.id === "fantasywonderland" || post.id === "friendshipsbegin"
      ? "text-[#8B5CC7] font-semibold cursor-pointer hover:text-[#6B3FA2] transition"
      : "text-[#A78BCB]"
  }`}
  onClick={() => {
    if (post.id === "fantasywonderland") {
      navigate("/fantasy-wonderland");
    } else if (post.id === "friendshipsbegin") {
      navigate("/friendships-begin");
    }
  }}
>
  {post.id === "moon3"
    ? "SET CHECKLIST DROPS 05/25"
    : post.id === "star1" || post.id === "funmoments3"
    ? "CHECKLIST COMING SOON"
    : "VIEW SET CHECKLIST"}
</div>
      </div>
    </div>
  ))}
</section>

    </div>

  </div>
);
};

export default Index;